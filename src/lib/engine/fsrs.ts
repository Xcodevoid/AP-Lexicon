/**
 * FSRS-4.5 scheduler (Free Spaced Repetition Scheduler), implemented from the published open-source
 * algorithm description (github.com/open-spaced-repetition). Pure and deterministic.
 *
 * - Ratings: 1 Again, 2 Hard, 3 Good, 4 Easy
 * - Memory state per card: stability S (days until R falls to 90%), difficulty D (1..10)
 * - Retrievability: R(t, S) = (1 + FACTOR * t / S) ^ DECAY
 *
 * The default weights are FSRS-4.5's published defaults, fitted on large general flashcard datasets.
 * They are NOT validated for AP vocabulary or for this student population — see docs/SCHEDULER.md.
 */
export const DEFAULT_WEIGHTS = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
] as const;

export const DECAY = -0.5;
export const FACTOR = 19 / 81; // chosen so that R(S, S) = 0.9
export type Rating = 1 | 2 | 3 | 4;

export interface MemoryState {
  stability: number; // days
  difficulty: number; // 1..10
  reps: number;
  lapses: number;
  lastReview: Date | null;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
}

export interface SchedulerOptions {
  weights?: readonly number[];
  desiredRetention?: number; // 0.7..0.97
  maximumInterval?: number; // days
  /** Same-day learning steps (minutes) used before a card graduates to day-scale intervals. */
  learningStepsMinutes?: number[];
}

export interface ScheduleResult {
  next: MemoryState;
  due: Date;
  intervalDays: number; // may be fractional for learning steps
  elapsedDays: number;
  retrievability: number | null;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
/** AP Lexicon extension (not part of FSRS-4.5): stability multiplier for same-day successful re-study. */
export const SAME_DAY_MULTIPLIER: Record<Rating, number> = { 1: 1, 2: 1, 3: 1.2, 4: 1.5 };
const DAY_MS = 86_400_000;

export function retrievability(elapsedDays: number, stability: number) {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

/** Interval (days) at which predicted recall equals desiredRetention. */
export function nextIntervalDays(stability: number, desiredRetention = 0.9, maximumInterval = 365) {
  const raw = (stability / FACTOR) * (Math.pow(desiredRetention, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, maximumInterval);
}

export function initStability(w: readonly number[], g: Rating) {
  return Math.max(w[g - 1], 0.1);
}
export function initDifficulty(w: readonly number[], g: Rating) {
  return clamp(w[4] - (g - 3) * w[5], 1, 10);
}
function nextDifficulty(w: readonly number[], d: number, g: Rating) {
  const delta = d - w[6] * (g - 3);
  // mean reversion toward the "Easy" initial difficulty
  return clamp(w[7] * initDifficulty(w, 4) + (1 - w[7]) * delta, 1, 10);
}
function stabilityAfterSuccess(w: readonly number[], d: number, s: number, r: number, g: Rating) {
  const hardPenalty = g === 2 ? w[15] : 1;
  const easyBonus = g === 4 ? w[16] : 1;
  return s * (Math.exp(w[8]) * (11 - d) * Math.pow(s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus + 1);
}
function stabilityAfterLapse(w: readonly number[], d: number, s: number, r: number) {
  const next = w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r));
  return Math.min(next, s); // a lapse never increases stability
}

export function newMemoryState(): MemoryState {
  return { stability: 0, difficulty: 0, reps: 0, lapses: 0, lastReview: null, state: "NEW" };
}

/**
 * Apply one review. Learning-phase cards (NEW/LEARNING/RELEARNING) use short same-day steps for
 * "Again"/"Hard" so mistakes come back within the session window; "Good"/"Easy" graduate the card.
 */
export function schedule(prev: MemoryState, rating: Rating, now: Date, opts: SchedulerOptions = {}): ScheduleResult {
  const w = opts.weights ?? DEFAULT_WEIGHTS;
  const desired = clamp(opts.desiredRetention ?? 0.9, 0.7, 0.97);
  const maxIvl = opts.maximumInterval ?? 365;
  const steps = opts.learningStepsMinutes ?? [10];
  const elapsedDays = prev.lastReview ? Math.max(0, (now.getTime() - prev.lastReview.getTime()) / DAY_MS) : 0;

  let stability: number;
  let difficulty: number;
  let r: number | null = null;
  let lapses = prev.lapses;

  if (prev.state === "NEW" || prev.stability <= 0) {
    stability = initStability(w, rating);
    difficulty = initDifficulty(w, rating);
  } else {
    r = retrievability(elapsedDays, prev.stability);
    difficulty = nextDifficulty(w, prev.difficulty, rating);
    if (rating === 1) {
      stability = stabilityAfterLapse(w, prev.difficulty, prev.stability, r);
      if (prev.state === "REVIEW") lapses += 1;
    } else if (elapsedDays < 1 && prev.state !== "REVIEW") {
      // Same-day re-study while still learning: FSRS-4.5 has no short-term model, so we apply a small,
      // documented multiplier instead of the long-term formula (which assumes day-scale gaps).
      stability = prev.stability * SAME_DAY_MULTIPLIER[rating];
    } else {
      stability = stabilityAfterSuccess(w, prev.difficulty, prev.stability, r, rating);
    }
  }
  stability = clamp(stability, 0.1, 36500);

  let state: MemoryState["state"];
  let intervalDays: number;
  const inLearning = prev.state === "NEW" || prev.state === "LEARNING" || prev.state === "RELEARNING";

  if (rating === 1) {
    state = prev.state === "REVIEW" ? "RELEARNING" : "LEARNING";
    intervalDays = steps[0] / 1440;
  } else if (inLearning && rating === 2) {
    state = prev.state === "RELEARNING" ? "RELEARNING" : "LEARNING";
    intervalDays = (steps[1] ?? steps[0] * 1.5) / 1440;
  } else {
    state = "REVIEW";
    intervalDays = nextIntervalDays(stability, desired, maxIvl);
    if (rating === 4 && inLearning) intervalDays = Math.max(intervalDays, 2);
  }

  return {
    next: { stability, difficulty, reps: prev.reps + 1, lapses, lastReview: now, state },
    due: new Date(now.getTime() + intervalDays * DAY_MS),
    intervalDays,
    elapsedDays,
    retrievability: r,
  };
}
