#!/usr/bin/env bash
# Builds the macOS desktop app (Electron + embedded PostgreSQL + bundled Next.js server).
#   scripts/build-desktop.sh arm64   # Apple Silicon (M1/M2/M3/M4)
#   scripts/build-desktop.sh x64     # Intel Macs
# Output: desktop/dist/AP Lexicon-<version>-<arch>-mac.zip
set -euo pipefail
ARCH="${1:-arm64}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RES="$ROOT/desktop/build/app-resources"

echo "▶ Building the Next.js standalone server"
cd "$ROOT"
npx prisma generate >/dev/null
STANDALONE=1 NEXT_TELEMETRY_DISABLED=1 npx next build >/dev/null

echo "▶ Assembling app resources"
rm -rf "$RES" && mkdir -p "$RES"
cp -R .next/standalone "$RES/server"
mkdir -p "$RES/server/.next" && cp -R .next/static "$RES/server/.next/static"
cp -R public "$RES/server/public"
# Prisma client + engines for macOS (arm64 and x64) — copy the full generated client
rm -rf "$RES/server/node_modules/.prisma" "$RES/server/node_modules/@prisma/client"
mkdir -p "$RES/server/node_modules/@prisma"
cp -R node_modules/.prisma "$RES/server/node_modules/.prisma"
cp -R node_modules/@prisma/client "$RES/server/node_modules/@prisma/client"
rm -f "$RES/server/.env"
# Prune what a Mac never uses at runtime: Linux image libs, TypeScript, Prisma WASM engines,
# and the native query engines for other platforms (keep only this architecture's).
SNM="$RES/server/node_modules"
find "$SNM/@img" "$SNM/typescript" -delete 2>/dev/null || true
find "$SNM/@prisma/client/runtime" -name '*wasm*' -delete
find "$SNM/.prisma/client" -name 'query_engine_bg.wasm' -delete
find "$SNM/.prisma/client" -name 'libquery_engine-debian*' -delete
if [ "$ARCH" = "arm64" ]; then find "$SNM/.prisma/client" -name 'libquery_engine-darwin.dylib.node' -delete
else find "$SNM/.prisma/client" -name 'libquery_engine-darwin-arm64.dylib.node' -delete; fi
cp -R prisma/migrations "$RES/migrations"
mkdir -p "$RES/content" && cp content/subjects/*.lex "$RES/content/"
node_modules/esbuild/bin/esbuild prisma/seed.ts --bundle --platform=node --format=cjs --target=node20 \
  --external:@prisma/client --alias:@=./src --outfile="$RES/seed.cjs" --log-level=warning
cat content/subjects/*.lex prisma/migrations/*/migration.sql | sha256sum | cut -c1-16 > "$RES/content-version.txt"

echo "▶ Rendering app icon"
node "$ROOT/desktop/render-icon.cjs" "$ROOT/desktop/build/icon.png"

echo "▶ Installing desktop dependencies for macOS $ARCH"
cd "$ROOT/desktop"
rm -rf node_modules
npm install --no-audit --no-fund --os=darwin --cpu="$ARCH" >/dev/null
test -d "node_modules/@embedded-postgres/darwin-$ARCH" || { echo "missing embedded postgres for darwin-$ARCH"; exit 1; }

echo "▶ Packaging"
npx electron-builder --mac zip "--$ARCH" --publish never
ls -lh dist/*.zip
