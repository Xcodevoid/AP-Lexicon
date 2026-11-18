import { expect, test } from "@playwright/test";
import { db, dismissCelebrations, registerAndOnboard } from "./helpers";

test.afterAll(async () => { await db.$disconnect(); });

test("all five games play end to end and record real answers", async ({ page }) => {
  const email = await registerAndOnboard(page);
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const S = "ap-microeconomics";

  // Hub
  await page.goto(`/games?subject=${S}`);
  for (const name of ["Lightning Round", "Connections", "Sort It", "Spell It", "Boss Battle"]) await expect(page.getByRole("heading", { name: new RegExp(name) })).toBeVisible();

  // Lightning: answer 5 questions, then end by navigating to the result after the clock (we just check logging)
  await page.goto(`/games/lightning?subject=${S}`);
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("Which word fits this definition?")).toBeVisible();
  for (let k = 0; k < 5; k++) { await page.keyboard.press("1"); await page.waitForTimeout(1500); }
  expect(await db.reviewLog.count({ where: { userId: user.id, mode: "challenge" } })).toBeGreaterThanOrEqual(5);

  // Spell It: one right (from the DB) and one wrong
  await page.goto(`/games/spell?subject=${S}`);
  await page.getByRole("button", { name: "Start" }).click();
  const def = (await page.locator("p.text-xl").first().textContent())!;
  const term = await db.term.findFirstOrThrow({ where: { definition: def.trim(), subject: { slug: S } } });
  await page.getByLabel("Your spelling").fill(term.term);
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(term.zh).first()).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Your spelling").fill("wrongword");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  expect(await db.reviewLog.count({ where: { userId: user.id, generatedKey: { startsWith: "spell:" } } })).toBe(2);
  expect(await db.reviewLog.count({ where: { userId: user.id, generatedKey: { startsWith: "spell:" }, correct: true } })).toBe(1);

  // Connections: solve groups using the server's own grouping via the DB
  await page.goto(`/games/connections?subject=${S}`);
  await page.getByRole("button", { name: "Start" }).click();
  const tiles = await page.locator("button[aria-pressed]").allTextContents();
  const terms = await db.term.findMany({ where: { term: { in: tiles }, subject: { slug: S } }, select: { term: true, topicId: true } });
  const groups = Object.values(terms.reduce<Record<string, string[]>>((acc, t) => { (acc[t.topicId!] ??= []).push(t.term); return acc; }, {}));
  expect(groups).toHaveLength(4);
  for (const g of groups) {
    for (const t of g) await page.getByRole("button", { name: t, exact: true }).click();
    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByText("All groups found!")).toBeVisible();
  await dismissCelebrations(page);

  // Sort It: answer 3 scenarios
  await page.goto(`/games/sort?subject=${S}`);
  await page.getByRole("button", { name: "Start" }).click();
  for (let k = 0; k < 3; k++) { await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(1600); }
  expect(await db.reviewLog.count({ where: { userId: user.id, mode: "lab" } })).toBe(3);

  // Boss Battle: attack until it ends (always choose option 1)
  await page.goto(`/games/boss?subject=${S}`);
  await page.getByRole("button", { name: "Start" }).click();
  for (let k = 0; k < 14; k++) {
    if (await page.getByText(/Boss defeated|Defeated — try again|Battle over/).count()) break;
    await page.getByRole("radiogroup", { name: "Answer options" }).getByRole("radio").first().click();
    await page.getByRole("button", { name: /Attack/ }).click();
    await page.getByRole("button", { name: /^(Next|See result)$/ }).click();
  }
  await expect(page.getByText(/Boss defeated|Defeated — try again|Battle over/)).toBeVisible();
  await expect(page.getByText(/Personal best|New personal best/)).toBeVisible();

  // Bests were saved and capped by real answers
  const bests = await db.personalBest.findMany({ where: { userId: user.id } });
  expect(bests.find((b) => b.key === `connections:${S}`)?.value).toBe(4);
  expect(bests.find((b) => b.key === `boss:${S}`)).toBeTruthy();
});
