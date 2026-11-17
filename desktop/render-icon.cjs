// Renders the 1024×1024 app icon (macOS rounded-square style) with the pre-installed Chromium.
const { chromium } = require("playwright");
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  await p.setContent(`<html><body style="margin:0;background:transparent">
  <svg width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14244B"/><stop offset="1" stop-color="#060B1A"/></linearGradient></defs>
    <rect x="100" y="100" width="824" height="824" rx="185" fill="url(#bg)"/>
    <path d="M265 735 L512 330 L759 735" fill="none" stroke="#3D8DF0" stroke-width="70" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M370 610 C455 568 569 568 654 610" fill="none" stroke="#F5B83D" stroke-width="54" stroke-linecap="round"/>
    <circle cx="512" cy="330" r="46" fill="#fff"/>
  </svg></body></html>`);
  await p.screenshot({ path: out, omitBackground: true });
  await b.close();
})();
