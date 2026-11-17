import { describe, expect, it } from "vitest";
import { applyAttempt, EMPTY_EVIDENCE, masteryScore, masteryStatus, weakestDimension, type MasteryEvidence } from "@/lib/engine/mastery";

const correct = (ev: MasteryEvidence, skill: "TRANSLATION" | "CONCEPT" | "APPLICATION", extra: Partial<{ usedHint: boolean; englishOnly: boolean }> = {}) =>
  applyAttempt(ev, { skill, outcome: 1, usedHint: false, englishOnly: true, ...extra });

describe("three-dimensional mastery", () => {
  it("viewing nothing is NOT_STARTED; discovery alone is LEARNING with zero score", () => {
    expect(masteryStatus(EMPTY_EVIDENCE)).toBe("NOT_STARTED");
    const seen = { ...EMPTY_EVIDENCE, discovered: true };
    expect(masteryStatus(seen)).toBe("LEARNING");
    expect(masteryScore(seen)).toBe(0);
  });
  it("repeatedly choosing the right translation can never reach MASTERED", () => {
    let ev = EMPTY_EVIDENCE;
    for (let i = 0; i < 50; i++) ev = correct(ev, "TRANSLATION");
    expect(masteryStatus(ev)).toBe("PRACTICING");
    expect(masteryScore(ev)).toBeLessThanOrEqual(25);
  });
  it("mastery needs all three dimensions plus independent English-only application", () => {
    let ev = EMPTY_EVIDENCE;
    for (let i = 0; i < 2; i++) ev = correct(ev, "TRANSLATION");
    for (let i = 0; i < 2; i++) ev = correct(ev, "CONCEPT");
    for (let i = 0; i < 2; i++) ev = correct(ev, "APPLICATION", { usedHint: true, englishOnly: false });
    expect(masteryStatus(ev)).toBe("PRACTICING"); // no independent evidence yet
    ev = correct(ev, "APPLICATION");
    expect(masteryStatus(ev)).toBe("MASTERED");
    expect(masteryScore(ev)).toBe(100);
  });
  it("hint use does not lower the dimension score", () => {
    const a = correct(EMPTY_EVIDENCE, "CONCEPT", { usedHint: true, englishOnly: false });
    const b = correct(EMPTY_EVIDENCE, "CONCEPT");
    expect(a.concept).toBe(b.concept);
  });
  it("a wrong answer pulls a dimension down and can drop status out of MASTERED", () => {
    let ev = EMPTY_EVIDENCE;
    for (const s of ["TRANSLATION", "TRANSLATION", "CONCEPT", "CONCEPT", "APPLICATION", "APPLICATION"] as const) ev = correct(ev, s);
    expect(masteryStatus(ev)).toBe("MASTERED");
    ev = applyAttempt(ev, { skill: "APPLICATION", outcome: 0, usedHint: false, englishOnly: true });
    expect(ev.application).toBeLessThan(0.8);
    expect(masteryStatus(ev)).not.toBe("MASTERED");
  });
  it("weakest dimension starts with recognition, then the lowest evidence-weighted score", () => {
    expect(weakestDimension(EMPTY_EVIDENCE)).toBe("recognition");
    let ev = correct(correct(EMPTY_EVIDENCE, "TRANSLATION"), "TRANSLATION");
    ev = correct(ev, "CONCEPT");
    expect(weakestDimension(ev)).toBe("application");
  });
});
