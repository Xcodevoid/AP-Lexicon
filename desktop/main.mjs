import { app, BrowserWindow, dialog, Menu, shell } from "electron";
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { startApp } from "./runtime.mjs";

app.setName("AP Lexicon");
if (!app.requestSingleInstanceLock()) app.quit();

const dataDir = path.join(app.getPath("userData"), "data");
const logDir = path.join(app.getPath("userData"), "logs");
mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "ap-lexicon.log");
const log = (m) => { try { appendFileSync(logFile, `${new Date().toISOString()} ${m}\n`); } catch {} };

let runtime = null;
let win = null;
let quitting = false;

const splashHtml = (msg) => `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html><body style="margin:0;height:100vh;display:grid;place-items:center;background:#0B1530;color:#E6EBF5;font:15px -apple-system,BlinkMacSystemFont,sans-serif">
<div style="text-align:center"><svg width="64" height="64" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#14244B"/><path d="M8 28.5 L20 9 L32 28.5" fill="none" stroke="#3D8DF0" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 22.5 C17 20.5 23 20.5 27 22.5" fill="none" stroke="#F5B83D" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="9" r="2.2" fill="#fff"/></svg>
<p style="font-size:20px;font-weight:600;margin:18px 0 6px">AP Lexicon</p><p id="m" style="opacity:.7;margin:0">${msg}</p></div></body></html>`)}`;

function buildMenu() {
  const template = [
    { role: "appMenu" },
    {
      label: "File",
      submenu: [
        { label: "Admin Sign-in Details…", click: () => runtime && dialog.showMessageBox(win, { type: "info", message: "Content admin account", detail: `Email: ${runtime.adminEmail}\nPassword: ${runtime.adminPassword}\n\nUse these to sign in and open Content admin. They were generated for this Mac and are stored in:\n${path.join(dataDir, "config.json")}` }) },
        { label: "Show Data Folder", click: () => shell.openPath(dataDir) },
        { label: "Show Log File", click: () => shell.showItemInFolder(logFile) },
        { type: "separator" },
        { role: "close" },
      ],
    },
    { role: "editMenu" },
    { label: "View", submenu: [{ role: "reload" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { type: "separator" }, { role: "togglefullscreen" }] },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function boot() {
  buildMenu();
  win = new BrowserWindow({ width: 1360, height: 900, minWidth: 380, minHeight: 600, backgroundColor: "#0B1530", title: "AP Lexicon", show: true, webPreferences: { contextIsolation: true, sandbox: true } });
  await win.loadURL(splashHtml("Starting…"));
  const setStatus = (msg) => win?.webContents.executeJavaScript(`document.getElementById('m') && (document.getElementById('m').textContent = ${JSON.stringify(msg)})`).catch(() => {});
  try {
    log("---- starting ----");
    runtime = await startApp({ resourcesDir: path.join(process.resourcesPath, "app-resources"), dataDir, nodeExec: process.execPath, log, onStatus: setStatus });
    log(`ready at ${runtime.url}`);
    // Keep navigation inside the local app; open anything else in the default browser.
    win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
    win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith(runtime.url)) { e.preventDefault(); shell.openExternal(url); } });
    await win.loadURL(runtime.url);
  } catch (e) {
    log(`startup failed: ${e?.stack ?? e}`);
    dialog.showErrorBox("AP Lexicon could not start", `${e?.message ?? e}\n\nDetails were written to:\n${logFile}`);
    app.quit();
  }
}

app.whenReady().then(boot);
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on("window-all-closed", () => app.quit());
app.on("before-quit", async (e) => {
  if (quitting || !runtime) return;
  e.preventDefault();
  quitting = true;
  try { await runtime.stop(); } finally { app.exit(0); }
});
