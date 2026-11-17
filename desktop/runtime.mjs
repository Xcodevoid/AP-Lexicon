/**
 * Desktop runtime: starts an embedded PostgreSQL, applies migrations, seeds content (first run and after
 * app updates), then starts the bundled Next.js server. Used by main.mjs (Electron) and test-runtime.mjs (Node).
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });

function loadConfig(file) {
  let cfg = {};
  try { cfg = JSON.parse(readFileSync(file, "utf8")); } catch {}
  let changed = false;
  const ensure = (k, v) => { if (!cfg[k]) { cfg[k] = v; changed = true; } };
  ensure("sessionSecret", randomBytes(32).toString("hex"));
  ensure("pgPassword", randomBytes(18).toString("base64url"));
  ensure("adminEmail", "admin@aplexicon.local");
  ensure("adminPassword", `Lex-${randomBytes(6).toString("base64url")}`);
  if (changed) writeFileSync(file, JSON.stringify(cfg, null, 2), { mode: 0o600 });
  return cfg;
}

async function waitFor(url, ms, isAlive) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (!isAlive()) throw new Error("The app server stopped unexpectedly. See the log file for details.");
    try { const r = await fetch(url); if (r.status < 500) return; } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function runNode(nodeExec, script, env, log) {
  return new Promise((resolve, reject) => {
    const p = spawn(nodeExec, [script], { env: { ...process.env, ...env, ELECTRON_RUN_AS_NODE: "1" }, stdio: ["ignore", "pipe", "pipe"] });
    p.stdout.on("data", (d) => log(String(d).trim()));
    p.stderr.on("data", (d) => log(String(d).trim()));
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${path.basename(script)} exited with code ${code}`))));
  });
}

export async function startApp({ resourcesDir, dataDir, nodeExec = process.execPath, log = console.log, onStatus = () => {} }) {
  mkdirSync(dataDir, { recursive: true });
  const cfg = loadConfig(path.join(dataDir, "config.json"));
  const pgDir = path.join(dataDir, "postgres");
  const pgPort = await freePort();
  const pg = new EmbeddedPostgres({
    databaseDir: pgDir, port: pgPort, user: "aplex", password: cfg.pgPassword, persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"], onLog: (m) => log(`[pg] ${String(m).trim()}`), onError: (m) => log(`[pg:err] ${String(m).trim()}`),
  });

  onStatus("Preparing your database…");
  if (!existsSync(path.join(pgDir, "PG_VERSION"))) await pg.initialise();
  try { await pg.start(); }
  catch (e) {
    // A crash can leave a stale lock file behind; remove it once and retry.
    const pid = path.join(pgDir, "postmaster.pid");
    if (!existsSync(pid)) throw e;
    log("[pg] removing stale postmaster.pid and retrying");
    rmSync(pid);
    await pg.start();
  }
  const admin = pg.getPgClient("postgres", "127.0.0.1");
  await admin.connect();
  const has = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'aplexicon'");
  if (!has.rowCount) await admin.query("CREATE DATABASE aplexicon");
  await admin.end();

  // Apply Prisma migration SQL files in order (tracked in _app_migrations).
  onStatus("Updating database…");
  const db = pg.getPgClient("aplexicon", "127.0.0.1");
  await db.connect();
  await db.query('CREATE TABLE IF NOT EXISTS "_app_migrations" (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const done = new Set((await db.query('SELECT name FROM "_app_migrations"')).rows.map((r) => r.name));
  const migDir = path.join(resourcesDir, "migrations");
  for (const name of readdirSync(migDir).filter((n) => /^\d/.test(n)).sort()) {
    if (done.has(name)) continue;
    log(`[migrate] ${name}`);
    const sql = readFileSync(path.join(migDir, name, "migration.sql"), "utf8");
    await db.query("BEGIN");
    try { await db.query(sql); await db.query('INSERT INTO "_app_migrations"(name) VALUES ($1)', [name]); await db.query("COMMIT"); }
    catch (e) { await db.query("ROLLBACK"); throw e; }
  }
  await db.end();

  const databaseUrl = `postgresql://aplex:${encodeURIComponent(cfg.pgPassword)}@127.0.0.1:${pgPort}/aplexicon`;
  const contentVersion = readFileSync(path.join(resourcesDir, "content-version.txt"), "utf8").trim();
  if (cfg.contentVersion !== contentVersion) {
    onStatus("Loading 1,000+ bilingual terms…");
    await runNode(nodeExec, path.join(resourcesDir, "seed.cjs"), {
      DATABASE_URL: databaseUrl, CONTENT_DIR: path.join(resourcesDir, "content"), ADMIN_EMAIL: cfg.adminEmail, ADMIN_PASSWORD: cfg.adminPassword,
      NODE_PATH: path.join(resourcesDir, "server", "node_modules"),
    }, log);
    cfg.contentVersion = contentVersion;
    writeFileSync(path.join(dataDir, "config.json"), JSON.stringify(cfg, null, 2), { mode: 0o600 });
  }

  onStatus("Starting AP Lexicon…");
  const port = await freePort();
  const server = spawn(nodeExec, [path.join(resourcesDir, "server", "server.js")], {
    cwd: path.join(resourcesDir, "server"),
    env: {
      ...process.env, ELECTRON_RUN_AS_NODE: "1", NODE_ENV: "production", PORT: String(port), HOSTNAME: "127.0.0.1",
      DATABASE_URL: databaseUrl, SESSION_SECRET: cfg.sessionSecret, COOKIE_INSECURE: "1", DEMO_MODE: "true", NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let alive = true;
  server.on("exit", (c) => { alive = false; log(`[server] exited ${c}`); });
  server.stdout.on("data", (d) => log(`[server] ${String(d).trim()}`));
  server.stderr.on("data", (d) => log(`[server] ${String(d).trim()}`));
  const url = `http://127.0.0.1:${port}`;
  await waitFor(`${url}/login`, 60_000, () => alive);

  return {
    url,
    adminEmail: cfg.adminEmail,
    adminPassword: cfg.adminPassword,
    async stop() {
      if (alive) server.kill("SIGTERM");
      await pg.stop().catch((e) => log(`[pg] stop failed: ${e}`));
    },
  };
}
