/**
 * Gamification rules (pure). Rewards favour quality and consistency:
 *  - more XP for higher stages and for recalling items that were actually due
 *  - diminishing returns for grinding the same term repeatedly on one day
 *  - streaks are protected by earned "rest days" so one missed day is not punished
 */
export type StageName = "DISCOVER" | "RECOGNIZE" | "UNDERSTAND" | "APPLY" | "MASTER";

export const STAGE_XP: Record<StageName, number> = { DISCOVER: 0, RECOGNIZE: 4, UNDERSTAND: 7, APPLY: 10, MASTER: 14 };

export function xpForAnswer(input: { stage: StageName; correct: boolean; wasDue: boolean; sameTermCorrectToday: number; becameMastered: boolean; selfScore?: number }) {
  if (!input.correct && input.selfScore == null) return 1; // effort credit, small on purpose
  let xp = STAGE_XP[input.stage];
  if (input.selfScore != null) xp = Math.round(xp * Math.max(0.3, input.selfScore));
  if (input.wasDue) xp = Math.round(xp * 1.5);
  // diminishing returns: 100%, 50%, 25%, then nothing for the same term on the same day
  const factor = [1, 0.5, 0.25][input.sameTermCorrectToday] ?? 0;
  xp = Math.round(xp * factor);
  if (input.becameMastered) xp += 25;
  return xp;
}

/** Total XP needed to reach a level (level 1 = 0 XP). */
export function xpForLevel(level: number) {
  return Math.round(120 * Math.pow(level - 1, 1.6));
}
export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, progress: (xp - floor) / (ceil - floor), toNext: ceil - xp };
}

export const RANKS = [
  { min: 0, name: "Novice", zh: "新手" },
  { min: 0.1, name: "Apprentice", zh: "学徒" },
  { min: 0.3, name: "Practitioner", zh: "进阶者" },
  { min: 0.55, name: "Scholar", zh: "学者" },
  { min: 0.8, name: "Expert", zh: "专家" },
  { min: 0.95, name: "Laureate", zh: "桂冠" },
];
export function subjectRank(masteredFraction: number) {
  return [...RANKS].reverse().find((r) => masteredFraction >= r.min) ?? RANKS[0];
}

/** Day key in the learner's timezone offset (minutes east of UTC). */
export function dayKey(d: Date, tzOffsetMinutes = 0) {
  return new Date(d.getTime() + tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}
function addDays(key: string, n: number) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Streak with rest days. activeDays: set of YYYY-MM-DD with a meaningful session.
 * Every 7 consecutive active days earns one rest day (max 2 banked) that covers a single missed day.
 * Today being inactive does not break the streak (the day is not over).
 */
export function computeStreak(activeDays: Set<string>, today: string) {
  const sorted = [...activeDays].filter((d) => d <= today).sort();
  if (!sorted.length) return { current: 0, longest: 0, restDays: 0, activeToday: false };
  let longest = 0;
  let current = 0;
  let restDays = 0;
  let sinceEarn = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev) {
      let gap = 0;
      let cursor = addDays(prev, 1);
      while (cursor < day) { gap++; cursor = addDays(cursor, 1); }
      if (gap === 0) { /* consecutive */ }
      else if (gap <= restDays) { restDays -= gap; }
      else { current = 0; restDays = 0; sinceEarn = 0; }
    }
    current++;
    sinceEarn++;
    if (sinceEarn >= 7) { restDays = Math.min(2, restDays + 1); sinceEarn = 0; }
    longest = Math.max(longest, current);
    prev = day;
  }
  // gap between last active day and today
  const activeToday = activeDays.has(today);
  if (prev && prev < today) {
    let gap = 0;
    let cursor = addDays(prev, 1);
    while (cursor < today) { gap++; cursor = addDays(cursor, 1); }
    if (gap > restDays) current = 0;
    else restDays -= gap;
  }
  return { current, longest, restDays, activeToday };
}

/** Weekly challenge chosen deterministically from the ISO week so everyone sees the same one. */
export const WEEKLY_CHALLENGES = [
  { key: "apply-15", title: "Context Week", titleZh: "语境周", description: "Answer 15 Apply- or Master-stage questions correctly.", goal: 15, metric: "applyCorrect" as const },
  { key: "review-30", title: "Memory Keeper", titleZh: "记忆守护者", description: "Complete 30 due reviews.", goal: 30, metric: "dueReviews" as const },
  { key: "english-10", title: "English Only", titleZh: "纯英文挑战", description: "Answer 10 questions correctly without Chinese hints.", goal: 10, metric: "noHintCorrect" as const },
  { key: "lab-3", title: "Untangle It", titleZh: "辨析达人", description: "Finish 3 Confusion Lab drills.", goal: 3, metric: "labSessions" as const },
];
export function weekIndex(d: Date) {
  const start = Date.UTC(2024, 0, 1); // a Monday
  return Math.floor((d.getTime() - start) / (7 * 86_400_000));
}
export function weeklyChallenge(d: Date) {
  return WEEKLY_CHALLENGES[((weekIndex(d) % WEEKLY_CHALLENGES.length) + WEEKLY_CHALLENGES.length) % WEEKLY_CHALLENGES.length];
}
export function weekStart(d: Date) {
  const start = Date.UTC(2024, 0, 1);
  return new Date(start + weekIndex(d) * 7 * 86_400_000);
}
