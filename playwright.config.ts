import { defineConfig, devices } from "@playwright/test";

/** E2E runs against a production build: `npm run build && npm run test:e2e`. Requires a seeded database. */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", trace: "off", screenshot: "only-on-failure" },
  webServer: { command: "npx next start -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { viewport: { width: 1360, height: 900 } }, testIgnore: /mobile/ },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" }, testMatch: /mobile/ },
  ],
});
