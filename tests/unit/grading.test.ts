import { describe, expect, it } from "vitest";
import { classifyError, matchCloze, ratingFromOutcome } from "@/lib/engine/grading";
import { computeStreak, levelFromXp, xpForAnswer, xpForLevel } from "@/lib/engine/gamification";
import { evaluateAchievements } from "@/lib/engine/achievements";

describe("grading", () => {
  it("maps outcomes to FSRS ratings without penalising hints", () => {
    expect(ratingFromOutcome({ correct: false, responseMs: 3000 })).toBe(1);
    expect(ratingFromOutcome({ correct: true, responseMs: 30_000, expectedMs: 10_000 })).toBe(2);
    expect(ratingFromOutcome({ correct: true, responseMs: 8_000, expectedMs: 10_000 })).toBe(3);
    expect(ratingFromOutcome({ correct: true, responseMs: 2_000, expectedMs: 10_000 })).toBe(4);
    expect(ratingFromOutcome({ correct: true, responseMs: 0, selfScore: 0.25 })).toBe(1);
    expect(ratingFromOutcome({ correct: true, responseMs: 0, selfScore: 0.5 })).toBe(2);
    expect(ratingFromOutcome({ correct: true, responseMs: 0, selfScore: 1 })).toBe(3);
  });
  it("classifies picking a commonly-confused term as a CONFUSION error", () => {
    const confused = new Map([["mc", new Set(["atc"])]]);
    expect(classifyError({ skill: "CONCEPT", chosenTermId: "atc", correctTermIds: ["mc"], confusedWith: confused })).toBe("CONFUSION");
    expect(classifyError({ skill: "CONCEPT", chosenTermId: "other", correctTermIds: ["mc"], confusedWith: confused })).toBe("CONCEPT");
    expect(classifyError({ skill: "TRANSLATION", correctTermIds: ["mc"], confusedWith: confused })).toBe("TRANSLATION");
  });
  it("cloze matching tolerates case, punctuation and simple plurals", () => {
    expect(matchCloze("  Deadweight-Loss ", ["deadweight loss"])).toBe(true);
    expect(matchCloze("externalities", ["externality"])).toBe(false);
    expect(matchCloze("enzymes", ["enzyme"])).toBe(true);
    expect(matchCloze("", ["x"])).toBe(false);
  });
});

describe("gamification", () => {
  it("rewards harder stages and due recalls, with diminishing returns for grinding", () => {
    const base = { correct: true, wasDue: false, sameTermCorrectToday: 0, becameMastered: false };
    expect(xpForAnswer({ ...base, stage: "APPLY" })).toBeGreaterThan(xpForAnswer({ ...base, stage: "RECOGNIZE" }));
    expect(xpForAnswer({ ...base, stage: "APPLY", wasDue: true })).toBeGreaterThan(xpForAnswer({ ...base, stage: "APPLY" }));
    expect(xpForAnswer({ ...base, stage: "APPLY", sameTermCorrectToday: 3 })).toBe(0);
    expect(xpForAnswer({ ...base, stage: "MASTER", correct: false })).toBe(1);
  });
  it("levels are monotonic", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(xpForLevel(5)).level).toBe(5);
    expect(levelFromXp(xpForLevel(5) - 1).level).toBe(4);
  });
  it("streak tolerates a missed day once a rest day is earned, and today is not yet a miss", () => {
    const days = (arr: string[]) => new Set(arr);
    expect(computeStreak(days(["2026-03-01", "2026-03-02"]), "2026-03-03").current).toBe(2);
    expect(computeStreak(days(["2026-03-01", "2026-03-02"]), "2026-03-05").current).toBe(0);
    const week = Array.from({ length: 7 }, (_, i) => `2026-03-0${i + 1}`);
    const s = computeStreak(days([...week, "2026-03-09"]), "2026-03-09"); // missed the 8th, covered by rest day
    expect(s.current).toBe(8);
    expect(s.restDays).toBe(0);
  });
  it("achievements unlock only from real stats and never twice", () => {
    const stats = { totalCorrect: 30, termsDiscovered: 3, masteredCount: 0, currentStreak: 0, longestStreak: 0, subjectsStarted: 1, labSessions: 0, noHintCorrect: 0, independentApplications: 0, notesCount: 0, dueReviewsDone: 0, topicsMastered: 0, bestMatchScore: 0 };
    const fresh = evaluateAchievements(stats, new Set());
    expect(fresh).toContain("first-discovery");
    expect(fresh).toContain("correct-25");
    expect(fresh).not.toContain("mastered-1");
    expect(evaluateAchievements(stats, new Set(fresh))).toEqual([]);
  });
});
