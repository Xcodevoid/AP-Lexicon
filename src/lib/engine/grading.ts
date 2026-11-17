import type { Rating } from "./fsrs";
import type { SkillName } from "./mastery";

export type ErrorKind = "TRANSLATION" | "CONCEPT" | "APPLICATION" | "CONFUSION";

/**
 * Convert an answer outcome into an FSRS rating.
 * Hint use deliberately does NOT lower the rating: language support is not penalised.
 */
export function ratingFromOutcome(input: { correct: boolean; responseMs: number; expectedMs?: number; selfScore?: number }): Rating {
  if (input.selfScore != null) {
    if (input.selfScore < 0.5) return 1;
    if (input.selfScore < 0.75) return 2;
    return 3;
  }
  if (!input.correct) return 1;
  const expected = input.expectedMs ?? 12_000;
  if (input.responseMs > expected * 2) return 2; // correct but effortful
  if (input.responseMs > 0 && input.responseMs < expected * 0.35) return 4; // fast and fluent
  return 3;
}

/**
 * Classify a wrong answer.
 * - If the chosen distractor is a term the correct term is commonly confused with → CONFUSION
 * - Otherwise the error type follows the skill the question measured.
 */
export function classifyError(input: { skill: SkillName; chosenTermId?: string | null; correctTermIds: string[]; confusedWith: Map<string, Set<string>> }): ErrorKind {
  if (input.chosenTermId) {
    for (const t of input.correctTermIds) {
      if (input.confusedWith.get(t)?.has(input.chosenTermId)) return "CONFUSION";
    }
  }
  return input.skill;
}

/** Normalise free-text answers for cloze matching: case, punctuation, whitespace, simple plurals. */
export function normaliseAnswer(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9一-鿿]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchCloze(given: string, accepted: string[]) {
  const g = normaliseAnswer(given);
  if (!g) return false;
  return accepted.some((a) => {
    const n = normaliseAnswer(a);
    return n === g || n + "s" === g || n === g + "s" || n + "es" === g;
  });
}
