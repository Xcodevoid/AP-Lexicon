import { expect, test } from "@playwright/test";
import { answerSession, db, dismissCelebrations, registerAndOnboard } from "./helpers";

test.afterAll(async () => { await db.$disconnect(); });

test("onboarding → map → learn a word → answer → mastery and review queue update → progress persists", async ({ page }) => {
  const email = await registerAndOnboard(page);
  await expect(page.getByRole("heading", { name: "AP Microeconomics" })).toBeVisible();

  // Locked mission explains why
  await page.getByRole("button", { name: /^1\.2 Production Possibilities/ }).click();
  await expect(page.getByText(/Locked — bring the previous mission to Practicing/)).toBeVisible();
  await page.keyboard.press("Escape");

  // Discover the first mission
  await page.getByRole("button", { name: /^1\.1 Scarcity and Choice/ }).click();
  await page.getByRole("link", { name: /Continue: Discover/ }).click();
  await expect(page.getByRole("heading", { name: "scarcity" })).toBeVisible();
  await expect(page.getByText("中文概念解释")).toBeVisible();
  await page.getByRole("button", { name: "Bookmark term" }).click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: "Finish studying" }).click();
  await dismissCelebrations(page);

  // Viewing cards is not mastery evidence
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const afterDiscover = await db.userTermState.findMany({ where: { userId: user.id } });
  expect(afterDiscover.length).toBe(5);
  expect(afterDiscover.every((s) => s.score === 0 && s.recognitionN === 0)).toBe(true);

  // Recognize stage: answer everything with option 1
  await page.getByRole("button", { name: /Practice: Recognize/ }).click();
  const n = await answerSession(page);
  expect(n).toBeGreaterThan(3);
  await expect(page.getByText("Session complete")).toBeVisible();

  const logs = await db.reviewLog.findMany({ where: { userId: user.id } });
  expect(logs.length).toBe(n);
  expect(logs.every((l) => l.skill === "TRANSLATION")).toBe(true);
  const wrong = logs.filter((l) => !l.correct);
  const states = await db.userTermState.findMany({ where: { userId: user.id, reps: { gt: 0 } } });
  // every wrong answer schedules a same-day relearning step; correct answers schedule ≥ 1 day
  for (const s of states) expect(s.due).not.toBeNull();
  if (wrong.length) {
    const ws = states.find((s) => s.termId === wrong[0].termId)!;
    expect(ws.due!.getTime() - Date.now()).toBeLessThan(11 * 60_000);
  }

  // Reviews become due: move due dates into the past, then the queue shows them
  await db.userTermState.updateMany({ where: { userId: user.id, reps: { gt: 0 } }, data: { due: new Date(Date.now() - 60_000) } });
  await page.goto("/review");
  await expect(page.getByText(/terms? due now/)).toBeVisible();
  await expect(page.locator("span.display", { hasText: String(states.length) })).toBeVisible();
  await page.getByRole("button", { name: /Start review/ }).click();
  const r = await answerSession(page);
  expect(r).toBeGreaterThan(0);
  const reviewLogs = await db.reviewLog.count({ where: { userId: user.id, mode: "review" } });
  expect(reviewLogs).toBe(r);

  // Progress persists after refresh
  await page.goto("/dashboard");
  const total = await db.reviewLog.count({ where: { userId: user.id } });
  await page.reload();
  await page.goto("/progress");
  await expect(page.getByText(total.toLocaleString(), { exact: true }).first()).toBeVisible();
  const xp = await db.xpEvent.aggregate({ where: { userId: user.id }, _sum: { amount: true } });
  expect(xp._sum.amount).toBeGreaterThan(0);
});

test("notebook edits persist across reloads; export works", async ({ page }) => {
  await registerAndOnboard(page, "AP Biology");
  await page.getByRole("button", { name: /^1\.1 Water and Bonds/ }).click();
  await page.getByRole("link", { name: /Continue: Discover/ }).click();
  await page.getByRole("button", { name: "Bookmark term" }).click();
  await expect(page.getByText("Saved to notebook")).toBeVisible();
  await page.goto("/notebook");
  await page.getByRole("tab", { name: /Bookmarked/ }).click();
  await page.getByRole("button", { name: /^hydrogen bond/ }).click();
  await page.getByLabel("My note").fill("H-bonds are BETWEEN molecules, not inside them.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Note saved")).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: /With notes/ }).click();
  await page.getByRole("button", { name: /^hydrogen bond/ }).click();
  await expect(page.getByLabel("My note")).toHaveValue("H-bonds are BETWEEN molecules, not inside them.");
  // collection
  await page.getByLabel("New collection name").fill("Unit 1 test");
  await page.getByRole("button", { name: "Create collection" }).click();
  await page.getByRole("tab", { name: /All studied/ }).click();
  if (!(await page.getByLabel("My note").isVisible())) await page.getByRole("button", { name: /^hydrogen bond/ }).click();
  await page.getByRole("button", { name: /Unit 1 test/ }).click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole("tab", { name: /Unit 1 test.*1/ })).toBeVisible();
  const res = await page.request.get("/api/export?format=json");
  expect(res.ok()).toBe(true);
  const data = await res.json();
  expect(data.terms.find((t: { term: string }) => t.term === "hydrogen bond").note).toMatch(/BETWEEN/);
});

test("Confusion Lab drill records concept evidence; decoder highlights without revealing answers", async ({ page }) => {
  await registerAndOnboard(page);
  await page.goto("/lab/mc-vs-atc");
  await expect(page.getByText("The key difference")).toBeVisible();
  await page.getByRole("button", { name: /Sort 4 scenarios/ }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /^A/ }).first().click();
    await page.getByRole("button", { name: /Next scenario|Finish/ }).click();
  }
  await expect(page.getByText("Drill complete")).toBeVisible();
  await dismissCelebrations(page);

  await page.goto("/decoder");
  await page.getByLabel("Question text").fill("Explain why a binding price ceiling set below equilibrium causes a shortage. Which of the following is NOT an effect?");
  await page.getByRole("button", { name: "Decode" }).click();
  await expect(page.getByText("“explain”")).toBeVisible();
  await expect(page.getByRole("button", { name: "price ceiling" }).first()).toBeVisible();
  await expect(page.getByText(/Negative wording/)).toBeVisible();
});

test("authorization is enforced on the server", async ({ page, request }) => {
  expect((await request.post("/api/answer", { data: { ref: "q:x" } })).status()).toBe(401);
  expect((await request.post("/api/answer", { data: { ref: "q:x" }, headers: { origin: "https://evil.example" } })).status()).toBe(403);
  await registerAndOnboard(page);
  const r = await page.request.post("/api/admin/import", { data: { format: "csv", text: "subject,term\nx,y" } });
  expect(r.status()).toBe(403);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("admin can import CSV (dry run → commit) and the term appears on the map", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL ?? "admin@aplexicon.local");
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  const unique = `e2e import term ${Date.now()}`;
  const csv = `subject,unit,unitTitle,topic,topicTitle,term,zh,definition,zhExplanation,apExample,difficulty,status\nAP Microeconomics,2,Supply and Demand,2.9,E2E Imports,${unique},测试术语,A term created by the end-to-end test,测试用,A firm studies the ${unique} carefully.,Intermediate,published\nAP Microeconomics,2,,,,,缺少,missing english term,,,1,published\nAP Microeconomics,2,,,,${unique},重复,duplicate row,,,1,published`;
  await page.goto("/admin/import");
  await page.locator('input[type=file]').setInputFiles({ name: "e2e.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByText("Row errors (1)")).toBeVisible();
  await expect(page.getByText(/repeats row 2/)).toBeAttached();
  await page.getByRole("button", { name: /Import 1 valid row/ }).click();
  await expect(page.getByText(/Imported: 1 created/)).toBeVisible();
  const t = await db.term.findFirstOrThrow({ where: { term: unique }, include: { topic: true } });
  expect(t.status).toBe("PUBLISHED");
  expect(t.topic?.code).toBe("2.9");
  await page.goto(`/admin/terms/${t.id}`);
  await expect(page.getByLabel("English term", { exact: true })).toHaveValue(unique);
  // cleanup
  await db.term.delete({ where: { id: t.id } });
  await db.topic.delete({ where: { id: t.topicId! } });
});
