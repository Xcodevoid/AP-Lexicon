# AP Lexicon for Mac

A self-contained desktop app: double-click to run. It includes its own PostgreSQL database and the full AP Lexicon server, so nothing else needs to be installed and it works offline. Your data stays on your Mac.

## Which download?

| Your Mac | Download |
|---|---|
| Apple Silicon (M1, M2, M3, M4 — most Macs from late 2020 on) | `AP Lexicon-<version>-arm64-mac.zip` |
| Intel | `AP Lexicon-<version>-mac.zip` |

Not sure? Apple menu → **About This Mac**: "Chip: Apple M…" means Apple Silicon; "Processor: Intel" means Intel.

## Install

1. Double-click the `.zip` to unzip it, then drag **AP Lexicon** into your **Applications** folder.
2. The app isn't signed with an Apple Developer ID, so macOS will block it at first. Open **Terminal** (Applications → Utilities) and run these two commands once:

```bash
xattr -cr "/Applications/AP Lexicon.app"
```

```bash
codesign --force --deep --sign - "/Applications/AP Lexicon.app"
```

   The first removes the "downloaded from the internet" quarantine flag; the second applies a local (ad-hoc) signature using Apple's own `codesign` tool, which Apple Silicon requires.
3. Open **AP Lexicon** from Applications. First launch takes about 10–20 seconds while it creates the database and loads 1,000+ terms; later launches take a few seconds.

If macOS still says it "can't be opened", go to **System Settings → Privacy & Security**, scroll down, and click **Open Anyway** next to AP Lexicon.

## Using it

- **Try the demo** or **Create account** on the start page. Accounts and progress are saved on this Mac.
- **Content admin**: menu **File → Admin Sign-in Details…** shows the admin email and a password generated for your Mac.
- **File → Show Data Folder** opens `~/Library/Application Support/AP Lexicon/data` (database + settings). Back it up to keep your progress. Delete it to start fresh (quit the app first).
- **File → Show Log File** if something goes wrong.

The optional AI explanation in the Question Decoder is not enabled in the desktop app.

## Building it (developers)

On Linux or macOS with Node 20+:

```bash
scripts/build-desktop.sh arm64
```

```bash
scripts/build-desktop.sh x64
```

Output goes to `desktop/dist/`. The build compiles a standalone Next.js server, bundles migrations, content and a seed runner into `desktop/build/app-resources`, installs the macOS PostgreSQL binaries for the chosen architecture, and packages with electron-builder. On a Mac with an Apple Developer ID you can sign and notarize the app properly (set `mac.identity` in `desktop/package.json`) so users skip step 2.

How it starts (`desktop/runtime.mjs`): start embedded PostgreSQL on a free local port → apply `prisma/migrations` SQL in order → import content on first run or when the bundled content changes → start the Next.js server on `127.0.0.1` → open the window.
