/** Achievement definitions. Each predicate is evaluated server-side against real stored activity. */
export interface AchievementStats {
  totalCorrect: number;
  termsDiscovered: number;
  masteredCount: number;
  currentStreak: number;
  longestStreak: number;
  subjectsStarted: number;
  labSessions: number;
  noHintCorrect: number;
  independentApplications: number;
  notesCount: number;
  dueReviewsDone: number;
  topicsMastered: number;
  bestMatchScore: number;
}

export interface AchievementDef {
  key: string;
  title: string;
  titleZh: string;
  description: string;
  icon: "spark" | "flame" | "crown" | "compass" | "flask" | "book" | "bridge" | "clock" | "medal" | "target" | "map";
  tier: "bronze" | "silver" | "gold";
  test: (s: AchievementStats) => boolean;
  progress: (s: AchievementStats) => [number, number];
}

const def = (d: Omit<AchievementDef, "test"> & { test?: AchievementDef["test"] }): AchievementDef => ({
  ...d,
  test: d.test ?? ((s) => { const [a, b] = d.progress(s); return a >= b; }),
});

export const ACHIEVEMENTS: AchievementDef[] = [
  def({ key: "first-discovery", title: "First Discovery", titleZh: "初次发现", description: "Study your first bilingual term card.", icon: "spark", tier: "bronze", progress: (s) => [s.termsDiscovered, 1] }),
  def({ key: "correct-25", title: "Warming Up", titleZh: "热身完成", description: "Answer 25 questions correctly.", icon: "target", tier: "bronze", progress: (s) => [s.totalCorrect, 25] }),
  def({ key: "correct-250", title: "Deep Practice", titleZh: "深度练习", description: "Answer 250 questions correctly.", icon: "target", tier: "silver", progress: (s) => [s.totalCorrect, 250] }),
  def({ key: "mastered-1", title: "True Mastery", titleZh: "真正掌握", description: "Master a term in all three dimensions: recognition, concept and application.", icon: "crown", tier: "bronze", progress: (s) => [s.masteredCount, 1] }),
  def({ key: "mastered-25", title: "Fluent Thinker", titleZh: "思维流畅", description: "Master 25 terms.", icon: "crown", tier: "silver", progress: (s) => [s.masteredCount, 25] }),
  def({ key: "mastered-100", title: "Lexicon Laureate", titleZh: "词汇桂冠", description: "Master 100 terms.", icon: "crown", tier: "gold", progress: (s) => [s.masteredCount, 100] }),
  def({ key: "streak-3", title: "Three-Day Rhythm", titleZh: "三日节奏", description: "Study meaningfully on 3 consecutive days.", icon: "flame", tier: "bronze", progress: (s) => [s.longestStreak, 3] }),
  def({ key: "streak-14", title: "Fortnight Focus", titleZh: "两周专注", description: "Reach a 14-day streak (rest days count).", icon: "flame", tier: "silver", progress: (s) => [s.longestStreak, 14] }),
  def({ key: "explorer-3", title: "Cartographer", titleZh: "制图师", description: "Start learning in 3 different AP subjects.", icon: "compass", tier: "bronze", progress: (s) => [s.subjectsStarted, 3] }),
  def({ key: "lab-5", title: "Untangler", titleZh: "辨析能手", description: "Complete 5 Confusion Lab drills.", icon: "flask", tier: "silver", progress: (s) => [s.labSessions, 5] }),
  def({ key: "bridge-25", title: "Bridge Crosser", titleZh: "跨越语言桥", description: "Answer 25 questions correctly with no Chinese hints.", icon: "bridge", tier: "silver", progress: (s) => [s.noHintCorrect, 25] }),
  def({ key: "independent-10", title: "Independent Voice", titleZh: "独立表达", description: "Answer 10 English-only application questions correctly.", icon: "medal", tier: "gold", progress: (s) => [s.independentApplications, 10] }),
  def({ key: "notes-5", title: "Annotator", titleZh: "批注者", description: "Write notes on 5 terms in your notebook.", icon: "book", tier: "bronze", progress: (s) => [s.notesCount, 5] }),
  def({ key: "reviews-50", title: "Memory Keeper", titleZh: "记忆守护者", description: "Complete 50 reviews that were due.", icon: "clock", tier: "silver", progress: (s) => [s.dueReviewsDone, 50] }),
  def({ key: "region-1", title: "Region Conquered", titleZh: "攻克区域", description: "Bring every term in one map mission to Mastered.", icon: "map", tier: "gold", progress: (s) => [s.topicsMastered, 1] }),
  def({ key: "match-12", title: "Quick Matcher", titleZh: "快速配对", description: "Score 12 or more in a timed match challenge.", icon: "spark", tier: "bronze", progress: (s) => [s.bestMatchScore, 12] }),
];

export function evaluateAchievements(stats: AchievementStats, unlocked: Set<string>) {
  return ACHIEVEMENTS.filter((a) => !unlocked.has(a.key) && a.test(stats)).map((a) => a.key);
}
