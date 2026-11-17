/**
 * Three-dimensional mastery model. Each term tracks evidence separately for:
 *   - recognition  (TRANSLATION skill: EN↔中文 mapping)
 *   - concept      (CONCEPT skill: English definition / scenario identification)
 *   - application  (APPLICATION skill: using the term in AP-style context)
 * Viewing a card is never evidence. Scores are an exponentially weighted moving average of graded outcomes.
 * Thresholds are product decisions, documented in docs/SCHEDULER.md — not validated psychometric cut scores.
 */
export type Dimension = "recognition" | "concept" | "application";
export type SkillName = "TRANSLATION" | "CONCEPT" | "APPLICATION";
export type MasteryStatus = "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED";

export const SKILL_TO_DIMENSION: Record<SkillName, Dimension> = {
  TRANSLATION: "recognition",
  CONCEPT: "concept",
  APPLICATION: "application",
};

export interface MasteryEvidence {
  recognition: number;
  recognitionN: number;
  concept: number;
  conceptN: number;
  application: number;
  applicationN: number;
  independentOk: number;
  discovered: boolean;
}

export const EMPTY_EVIDENCE: MasteryEvidence = {
  recognition: 0, recognitionN: 0, concept: 0, conceptN: 0, application: 0, applicationN: 0, independentOk: 0, discovered: false,
};

export const MASTERY_RULES = {
  /** EWMA learning rate after the first few attempts. Early attempts use 1/(n+1) (a running mean). */
  alpha: 0.35,
  practicing: { recognition: 0.6, minAttempts: 2 },
  mastered: { threshold: 0.8, minPerDimension: 2, minIndependent: 1 },
};

/** Update one dimension with a graded outcome in [0, 1]. */
export function updateDimension(score: number, n: number, outcome: number) {
  const o = Math.min(1, Math.max(0, outcome));
  const alpha = n < 3 ? 1 / (n + 1) : MASTERY_RULES.alpha;
  return { score: score + alpha * (o - score), n: n + 1 };
}

export interface GradedAttempt {
  skill: SkillName;
  outcome: number; // 1 = correct, 0 = wrong, fractional for rubric self-assessment
  usedHint: boolean;
  englishOnly: boolean; // question was presented without Chinese support (Exam mode / Master stage)
  selfAssessed?: boolean;
}

export function applyAttempt(ev: MasteryEvidence, a: GradedAttempt): MasteryEvidence {
  const dim = SKILL_TO_DIMENSION[a.skill];
  const key = dim;
  const nKey = `${dim}N` as const;
  const { score, n } = updateDimension(ev[key], ev[nKey], a.outcome);
  const independent = a.skill === "APPLICATION" && a.outcome >= 1 && !a.usedHint && a.englishOnly && !a.selfAssessed;
  return { ...ev, [key]: score, [nKey]: n, independentOk: ev.independentOk + (independent ? 1 : 0), discovered: true };
}

export function masteryStatus(ev: MasteryEvidence): MasteryStatus {
  const attempts = ev.recognitionN + ev.conceptN + ev.applicationN;
  if (!ev.discovered && attempts === 0) return "NOT_STARTED";
  const m = MASTERY_RULES.mastered;
  const isMastered =
    ev.recognition >= m.threshold && ev.recognitionN >= m.minPerDimension &&
    ev.concept >= m.threshold && ev.conceptN >= m.minPerDimension &&
    ev.application >= m.threshold && ev.applicationN >= m.minPerDimension &&
    ev.independentOk >= m.minIndependent;
  if (isMastered) return "MASTERED";
  if (attempts >= MASTERY_RULES.practicing.minAttempts && ev.recognition >= MASTERY_RULES.practicing.recognition) return "PRACTICING";
  return "LEARNING";
}

/** 0..100 summary. Each dimension is discounted until it has at least two graded attempts. */
export function masteryScore(ev: MasteryEvidence) {
  const conf = (n: number) => Math.min(1, n / 2);
  const s = 0.25 * ev.recognition * conf(ev.recognitionN) + 0.35 * ev.concept * conf(ev.conceptN) + 0.4 * ev.application * conf(ev.applicationN);
  return Math.round(s * 100);
}

/** Which dimension most needs evidence/practice next. */
export function weakestDimension(ev: MasteryEvidence): Dimension {
  const dims: Dimension[] = ["recognition", "concept", "application"];
  // Unlock order: recognition must have some evidence before we push application.
  if (ev.recognitionN === 0) return "recognition";
  return dims
    .map((d) => ({ d, v: ev[d] * Math.min(1, ev[`${d}N` as const] / 2) }))
    .sort((a, b) => a.v - b.v)[0].d;
}

export const STATUS_LABEL: Record<MasteryStatus, string> = {
  NOT_STARTED: "Not started",
  LEARNING: "Learning",
  PRACTICING: "Practicing",
  MASTERED: "Mastered",
};
export const STATUS_LABEL_ZH: Record<MasteryStatus, string> = {
  NOT_STARTED: "未开始",
  LEARNING: "学习中",
  PRACTICING: "练习中",
  MASTERED: "已掌握",
};
