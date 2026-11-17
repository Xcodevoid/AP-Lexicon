import { expect, test } from "@playwright/test";
import { answerSession, db, registerAndOnboard } from "./helpers";

test.afterAll(async () => { await db.$disconnect(); });

test("mobile: onboarding, map, bottom nav, learning without horizontal overflow", async ({ page }) => {
  await registerAndOnboard(page, "AP World History");
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(1);
  await expect(page.getByRole("navigation", { name: "Main" }).last()).toBeVisible();
  await page.getByRole("button", { name: /^0\.1 Sources and Reasoning/ }).click();
  await page.getByRole("link", { name: /Recognize/ }).first().click();
  await expect(page.locator('[role=radiogroup][aria-label="Answer options"]')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(1);
  const n = await answerSession(page, 4);
  expect(n).toBeGreaterThan(0);
  for (const path of ["/dashboard", "/notebook", "/review", "/lab", "/decoder", "/progress", "/achievements", "/more"]) {
    await page.goto(path);
    expect(await overflow(), `overflow on ${path}`).toBeLessThanOrEqual(1);
  }
});
