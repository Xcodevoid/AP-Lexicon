import { expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

/** Achievement modals arrive asynchronously after an answer; wait briefly, then close any that are visible. */
export async function dismissCelebrations(page: Page, waitMs = 600) {
  await page.waitForTimeout(waitMs);
  const btn = page.getByRole("dialog").getByRole("button", { name: /^(Keep going|Next \()/ });
  for (let i = 0; i < 10; i++) {
    if (!(await btn.first().isVisible().catch(() => false))) break;
    await btn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
}

/** Registers a fresh student and completes onboarding with the given subject. */
export async function registerAndOnboard(page: Page, subjectName = "AP Microeconomics") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
  await page.goto("/register");
  await page.getByLabel("Your name").fill("E2E Student");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: new RegExp(subjectName) }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /Balanced/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Open my mastery map" }).click();
  await page.waitForURL("**/subjects/**");
  return email;
}

/** Answers every question in the current practice session. pick: "first" | "wrong" (chooses a known-wrong option when possible). */
export async function answerSession(page: Page, max = 15) {
  let n = 0;
  for (; n < max; n++) {
    await dismissCelebrations(page);
    if (await page.getByText("Session complete").count()) break;
    const radios = page.locator('[role=radiogroup][aria-label="Answer options"] [role=radio]');
    if (await radios.count()) {
      await radios.first().click();
      await page.getByRole("button", { name: /^(Check answer|Submit & next)/ }).click();
    } else if (await page.locator("#cloze").count()) {
      await page.locator("#cloze").fill("not the answer");
      await page.getByRole("button", { name: /^(Check answer|Submit & next)/ }).click();
    } else if (await page.locator("#written").count()) {
      await page.locator("#written").fill("This concept means that the firm compares extra benefits with extra costs in a market.");
      await page.getByRole("button", { name: /Done writing/ }).click();
      await page.getByRole("checkbox").first().check();
      await page.getByRole("button", { name: "Save self-assessment" }).click();
    } else break;
    const cont = page.getByRole("button", { name: /^(Continue|See results)/ });
    await expect(cont.or(page.getByText("Session complete")).first()).toBeVisible();
    await dismissCelebrations(page);
    if (await cont.count()) await cont.click();
  }
  return n;
}
