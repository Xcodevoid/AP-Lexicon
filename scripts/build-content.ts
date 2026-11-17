/**
 * Compiles content/subjects/*.lex into content/build/bundle.json and prints a validation report.
 *   npm run content:build          -> write bundle
 *   npm run content:check          -> validate only (non-zero exit on errors)
 * Also verifies every ID from the master spreadsheet (content/sources/master-spreadsheet.json) is present.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { compileLexSources } from "../src/lib/content/bundle";

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "content/subjects");
const sources = readdirSync(dir)
  .filter((f) => f.endsWith(".lex"))
  .sort()
  .map((f) => ({ name: f, text: readFileSync(path.join(dir, f), "utf8") }));

const { bundle, issues } = compileLexSources(sources);

const masterPath = path.join(root, "content/sources/master-spreadsheet.json");
if (existsSync(masterPath)) {
  const master = JSON.parse(readFileSync(masterPath, "utf8")) as { ID: string; "English Term": string }[];
  const ids = new Set(bundle.terms.map((t) => t.id).filter(Boolean));
  const missing = master.filter((m) => !ids.has(m.ID));
  if (missing.length) issues.push({ level: "warning", where: "master-spreadsheet", message: `${missing.length} master IDs not mapped: ${missing.map((m) => `${m.ID} ${m["English Term"]}`).join(", ")}` });
  else console.log(`✓ all ${master.length} master-spreadsheet IDs are mapped`);
}

const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");
for (const i of errors) console.error(`ERROR  ${i.where}: ${i.message}`);
const verbose = process.argv.includes("--verbose");
if (verbose) for (const i of warnings) console.warn(`warn   ${i.where}: ${i.message}`);
else if (warnings.length) console.warn(`${warnings.length} warnings (run with --verbose to list)`);

const perSubject = bundle.subjects.map((s) => {
  const n = bundle.terms.filter((t) => t.subject === s.slug).length;
  const q = bundle.questions.filter((t) => t.subject === s.slug).length;
  const p = bundle.pairs.filter((t) => t.subject === s.slug).length;
  return `${s.shortName.padEnd(14)} ${String(s.units.length).padStart(2)} units ${String(n).padStart(4)} terms ${String(q).padStart(3)} questions ${String(p).padStart(2)} pairs`;
});
console.log(perSubject.join("\n"));
console.log(`TOTAL: ${bundle.subjects.length} subjects, ${bundle.terms.length} terms, ${bundle.questions.length} questions, ${bundle.pairs.length} confusion pairs`);

if (errors.length) {
  console.error(`✗ ${errors.length} errors`);
  process.exit(1);
}
if (!process.argv.includes("--check")) {
  mkdirSync(path.join(root, "content/build"), { recursive: true });
  writeFileSync(path.join(root, "content/build/bundle.json"), JSON.stringify(bundle));
  console.log("✓ wrote content/build/bundle.json");
}
