import { prisma } from "@/lib/db";
import { ACHIEVEMENTS, evaluateAchievements, type AchievementStats } from "@/lib/engine/achievements";
import { computeStreak, dayKey, levelFromXp, subjectRank, weeklyChallenge, weekStart } from "@/lib/engine/gamification";

const MEANINGFUL_ANSWERS_PER_DAY = 5;

export async function activityDays(userId: string, tzOffset: number) {
  const rows = await prisma.$queryRaw<{ day: string; n: bigint }[]>`
    SELECT to_char(("createdAt" + make_interval(mins => ${tzOffset}::int)), 'YYYY-MM-DD') AS day, count(*) AS n
    FROM "ReviewLog" WHERE "userId" = ${userId}
    GROUP BY 1`;
  return new Map(rows.map((r) => [r.day, Number(r.n)]));
}

export async function streakFor(userId: string, tzOffset: number) {
  const days = await activityDays(userId, tzOffset);
  const active = new Set([...days.entries()].filter(([, n]) => n >= MEANINGFUL_ANSWERS_PER_DAY).map(([d]) => d));
  return { ...computeStreak(active, dayKey(new Date(), tzOffset)), days };
}

export async function achievementStats(userId: string): Promise<AchievementStats> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tzOffset: true } });
  const [totalCorrect, termsDiscovered, masteredCount, subjectRows, labSessions, noHintCorrect, independentApplications, notesCount, dueReviewsDone, bests, streak] = await Promise.all([
    prisma.reviewLog.count({ where: { userId, correct: true } }),
    prisma.userTermState.count({ where: { userId, discoveredAt: { not: null } } }),
    prisma.userTermState.count({ where: { userId, status: "MASTERED" } }),
    prisma.$queryRaw<{ n: bigint }[]>`SELECT count(DISTINCT t."subjectId") AS n FROM "UserTermState" s JOIN "Term" t ON t.id = s."termId" WHERE s."userId" = ${userId} AND s."discoveredAt" IS NOT NULL`,
    prisma.xpEvent.count({ where: { userId, reason: "lab-complete" } }),
    prisma.reviewLog.count({ where: { userId, correct: true, usedHint: false } }),
    prisma.userTermState.aggregate({ where: { userId }, _sum: { independentOk: true } }),
    prisma.userTermState.count({ where: { userId, note: { not: "" } } }),
    prisma.reviewLog.count({ where: { userId, mode: "review" } }),
    prisma.personalBest.findMany({ where: { userId, key: { startsWith: "match:" } } }),
    streakFor(userId, user?.tzOffset ?? 0),
  ]);
  const topicsMastered = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT count(*) AS n FROM (
      SELECT t."topicId" FROM "Term" t
      LEFT JOIN "UserTermState" s ON s."termId" = t.id AND s."userId" = ${userId}
      WHERE t.status = 'PUBLISHED' AND t."topicId" IS NOT NULL
      GROUP BY t."topicId"
      HAVING bool_and(s.status = 'MASTERED')
    ) x`;
  return {
    totalCorrect, termsDiscovered, masteredCount,
    currentStreak: streak.current, longestStreak: streak.longest,
    subjectsStarted: Number(subjectRows[0]?.n ?? 0), labSessions, noHintCorrect,
    independentApplications: independentApplications._sum.independentOk ?? 0, notesCount, dueReviewsDone,
    topicsMastered: Number(topicsMastered[0]?.n ?? 0),
    bestMatchScore: Math.max(0, ...bests.map((b) => b.value)),
  };
}

/** Evaluates achievements and stores new unlocks. Returns definitions of newly unlocked achievements. */
export async function checkAchievements(userId: string) {
  const [stats, have] = await Promise.all([achievementStats(userId), prisma.userAchievement.findMany({ where: { userId }, select: { key: true } })]);
  const fresh = evaluateAchievements(stats, new Set(have.map((h) => h.key)));
  if (fresh.length) await prisma.userAchievement.createMany({ data: fresh.map((key) => ({ userId, key })), skipDuplicates: true });
  return ACHIEVEMENTS.filter((a) => fresh.includes(a.key)).map(({ key, title, titleZh, description, icon, tier }) => ({ key, title, titleZh, description, icon, tier }));
}

export async function xpSummary(userId: string, tzOffset: number) {
  const total = await prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } });
  const now = new Date();
  const startToday = new Date(dayKey(now, tzOffset) + "T00:00:00Z");
  startToday.setUTCMinutes(startToday.getUTCMinutes() - tzOffset);
  const today = await prisma.xpEvent.aggregate({ where: { userId, createdAt: { gte: startToday } }, _sum: { amount: true } });
  const xp = total._sum.amount ?? 0;
  return { total: xp, today: today._sum.amount ?? 0, ...levelFromXp(xp) };
}

// ---------------------------------------------------------------- Mastery map
export type NodeStatus = "LOCKED" | "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED";

export function nodeStatusFrom(counts: { total: number; learning: number; practicing: number; mastered: number }): Exclude<NodeStatus, "LOCKED"> {
  if (counts.total === 0) return "NOT_STARTED";
  if (counts.mastered === counts.total) return "MASTERED";
  if ((counts.practicing + counts.mastered) / counts.total >= 0.6) return "PRACTICING";
  if (counts.learning + counts.practicing + counts.mastered > 0) return "LEARNING";
  return "NOT_STARTED";
}

export async function subjectMap(userId: string, slug: string, opts: { includeDraft?: boolean } = {}) {
  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      units: {
        orderBy: { number: "asc" },
        include: {
          topics: {
            orderBy: [{ order: "asc" }, { code: "asc" }],
            include: { terms: { where: opts.includeDraft ? {} : { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { id: true, term: true, zh: true, difficulty: true } } },
          },
        },
      },
    },
  });
  if (!subject || (subject.status !== "PUBLISHED" && !opts.includeDraft)) return null;
  const termIds = subject.units.flatMap((u) => u.topics.flatMap((t) => t.terms.map((x) => x.id)));
  const states = await prisma.userTermState.findMany({ where: { userId, termId: { in: termIds } } });
  const byTerm = new Map(states.map((s) => [s.termId, s]));

  const units = subject.units.map((u) => {
    let prevReady = true; // first mission of every unit is open: classes move through units in different orders
    const topics = u.topics
      .filter((t) => t.terms.length)
      .map((t) => {
        const counts = { total: t.terms.length, learning: 0, practicing: 0, mastered: 0 };
        let scoreSum = 0;
        const terms = t.terms.map((term) => {
          const s = byTerm.get(term.id);
          const status = (s?.status ?? "NOT_STARTED") as "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED";
          if (status === "LEARNING") counts.learning++;
          if (status === "PRACTICING") counts.practicing++;
          if (status === "MASTERED") counts.mastered++;
          scoreSum += s?.score ?? 0;
          return { ...term, status, score: s?.score ?? 0, recognition: s?.recognition ?? 0, concept: s?.concept ?? 0, application: s?.application ?? 0, bookmarked: s?.bookmarked ?? false };
        });
        const status = nodeStatusFrom(counts);
        const unlocked = prevReady;
        prevReady = status === "PRACTICING" || status === "MASTERED";
        return { id: t.id, code: t.code, title: t.title, titleZh: t.titleZh, objectives: t.objectives, terms, counts, status: (unlocked ? status : "LOCKED") as NodeStatus, mastery: Math.round(scoreSum / t.terms.length) };
      });
    const allReady = topics.length > 0 && topics.every((t) => t.status === "PRACTICING" || t.status === "MASTERED");
    const total = topics.reduce((a, t) => a + t.counts.total, 0);
    const mastered = topics.reduce((a, t) => a + t.counts.mastered, 0);
    return { id: u.id, number: u.number, title: u.title, titleZh: u.titleZh, topics, challengeUnlocked: allReady, total, mastered };
  });
  const total = units.reduce((a, u) => a + u.total, 0);
  const mastered = units.reduce((a, u) => a + u.mastered, 0);
  const started = states.filter((s) => s.status !== "NOT_STARTED").length;
  const avgScore = total ? Math.round(states.reduce((a, s) => a + s.score, 0) / total) : 0;
  return {
    subject: { id: subject.id, slug: subject.slug, name: subject.name, nameZh: subject.nameZh, shortName: subject.shortName, theme: subject.theme, description: subject.description, frameworkNote: subject.frameworkNote },
    units,
    progress: { total, mastered, started, avgScore, rank: subjectRank(total ? mastered / total : 0) },
  };
}

// ---------------------------------------------------------------- Dashboard
export async function dashboard(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const tz = user.tzOffset;
  const now = new Date();
  const [xp, streak, dueCount, statusRows, dims, subjects, weak, goals, unlocked] = await Promise.all([
    xpSummary(userId, tz),
    streakFor(userId, tz),
    prisma.userTermState.count({ where: { userId, reps: { gt: 0 }, due: { lte: now }, term: { status: "PUBLISHED" } } }),
    prisma.$queryRaw<{ subjectId: string; status: string; n: bigint }[]>`
      SELECT t."subjectId", s.status, count(*) AS n FROM "UserTermState" s JOIN "Term" t ON t.id = s."termId"
      WHERE s."userId" = ${userId} AND t.status = 'PUBLISHED' GROUP BY 1, 2`,
    prisma.userTermState.aggregate({ where: { userId, reps: { gt: 0 } }, _avg: { recognition: true, concept: true, application: true }, _count: true }),
    prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { id: true, slug: true, name: true, nameZh: true, shortName: true, theme: true, _count: { select: { terms: { where: { status: "PUBLISHED" } } } } } }),
    prisma.userTermState.findMany({
      where: { userId, reps: { gte: 2 }, status: { not: "MASTERED" } },
      orderBy: [{ score: "asc" }, { lapses: "desc" }],
      take: 5,
      include: { term: { select: { id: true, term: true, zh: true, subject: { select: { slug: true, shortName: true } } } } },
    }),
    prisma.studyGoal.findMany({ where: { userId, doneAt: null }, orderBy: { targetDate: "asc" }, take: 4 }),
    prisma.userAchievement.count({ where: { userId } }),
  ]);

  // weekly activity (last 7 local days)
  const week: { day: string; answers: number; correct: number; xp: number }[] = [];
  const since = new Date(now.getTime() - 8 * 86_400_000);
  const logs = await prisma.reviewLog.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true, correct: true, usedHint: true } });
  const xps = await prisma.xpEvent.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true, amount: true } });
  for (let i = 6; i >= 0; i--) {
    const d = dayKey(new Date(now.getTime() - i * 86_400_000), tz);
    const dayLogs = logs.filter((l) => dayKey(l.createdAt, tz) === d);
    week.push({ day: d, answers: dayLogs.length, correct: dayLogs.filter((l) => l.correct).length, xp: xps.filter((x) => dayKey(x.createdAt, tz) === d).reduce((a, x) => a + x.amount, 0) });
  }

  const perSubject = subjects.map((s) => {
    const rows = statusRows.filter((r) => r.subjectId === s.id);
    const get = (st: string) => Number(rows.find((r) => r.status === st)?.n ?? 0);
    return { ...s, total: s._count.terms, learning: get("LEARNING"), practicing: get("PRACTICING"), mastered: get("MASTERED") };
  });
  const started = perSubject.filter((s) => s.learning + s.practicing + s.mastered > 0);

  // weekly challenge progress
  const challenge = weeklyChallenge(now);
  const ws = weekStart(now);
  let challengeProgress = 0;
  if (challenge.metric === "applyCorrect") challengeProgress = await prisma.reviewLog.count({ where: { userId, createdAt: { gte: ws }, correct: true, stage: { in: ["APPLY", "MASTER"] } } });
  if (challenge.metric === "dueReviews") challengeProgress = await prisma.reviewLog.count({ where: { userId, createdAt: { gte: ws }, mode: "review" } });
  if (challenge.metric === "noHintCorrect") challengeProgress = await prisma.reviewLog.count({ where: { userId, createdAt: { gte: ws }, correct: true, usedHint: false } });
  if (challenge.metric === "labSessions") challengeProgress = await prisma.xpEvent.count({ where: { userId, createdAt: { gte: ws }, reason: "lab-complete" } });

  const recommendation = await recommendNext(userId, dueCount, user.focusSubjects);

  // goal progress: mastered terms in goal subject since goal creation
  const goalProgress = await Promise.all(
    goals.map(async (g) => {
      const mastered = await prisma.userTermState.count({ where: { userId, status: { in: ["PRACTICING", "MASTERED"] }, updatedAt: { gte: g.createdAt }, ...(g.subjectSlug ? { term: { subject: { slug: g.subjectSlug } } } : {}) } });
      return { ...g, progress: mastered };
    }),
  );

  return {
    user: { name: user.name, languageMode: user.languageMode, dailyGoalXp: user.dailyGoalXp, isDemo: user.isDemo },
    xp, streak: { current: streak.current, longest: streak.longest, restDays: streak.restDays, activeToday: streak.activeToday },
    dueCount,
    totals: {
      mastered: perSubject.reduce((a, s) => a + s.mastered, 0),
      practicing: perSubject.reduce((a, s) => a + s.practicing, 0),
      learning: perSubject.reduce((a, s) => a + s.learning, 0),
      attempted: dims._count,
    },
    dimensions: { recognition: dims._avg.recognition ?? 0, concept: dims._avg.concept ?? 0, application: dims._avg.application ?? 0, n: dims._count },
    week,
    subjects: perSubject,
    startedSubjects: started.map((s) => s.slug),
    weak: weak.map((w) => ({ id: w.term.id, term: w.term.term, zh: w.term.zh, subject: w.term.subject.shortName, subjectSlug: w.term.subject.slug, score: w.score, lapses: w.lapses })),
    goals: goalProgress,
    challenge: { ...challenge, progress: challengeProgress },
    recommendation,
    achievementsUnlocked: unlocked,
  };
}

/** Suggest the next most useful activity from real state. */
export async function recommendNext(userId: string, dueCount: number, focusSubjects: string[]) {
  if (dueCount >= 5) return { kind: "review" as const, title: `Review ${dueCount} due term${dueCount === 1 ? "" : "s"}`, reason: "Reviewing before you forget strengthens memory the most.", href: "/review" };
  // continue the most recent mission that is not yet practicing
  const recent = await prisma.reviewLog.findFirst({ where: { userId, mode: "learn" }, orderBy: { createdAt: "desc" }, include: { term: { select: { topicId: true, subject: { select: { slug: true } } } } } });
  if (recent?.term.topicId) {
    const topicTerms = await prisma.term.findMany({ where: { topicId: recent.term.topicId, status: "PUBLISHED" }, select: { id: true } });
    const states = await prisma.userTermState.findMany({ where: { userId, termId: { in: topicTerms.map((t) => t.id) } } });
    const ready = states.filter((s) => s.status === "PRACTICING" || s.status === "MASTERED").length;
    const topic = await prisma.topic.findUnique({ where: { id: recent.term.topicId } });
    if (topic && ready / Math.max(1, topicTerms.length) < 1) {
      return { kind: "mission" as const, title: `Continue “${topic.title}”`, reason: `${ready}/${topicTerms.length} terms are at Practicing or better.`, href: `/learn/${topic.id}` };
    }
  }
  const slug = focusSubjects[0];
  if (slug) {
    const firstTopic = await prisma.topic.findFirst({
      where: { unit: { subject: { slug } }, terms: { some: { status: "PUBLISHED", states: { none: { userId } } } } },
      orderBy: [{ unit: { number: "asc" } }, { order: "asc" }],
    });
    if (firstTopic) return { kind: "mission" as const, title: `Start “${firstTopic.title}”`, reason: "A new mission in your focus subject.", href: `/learn/${firstTopic.id}` };
  }
  if (dueCount > 0) return { kind: "review" as const, title: `Review ${dueCount} due term${dueCount === 1 ? "" : "s"}`, reason: "Keep your memory fresh.", href: "/review" };
  return { kind: "explore" as const, title: "Choose a subject map", reason: "Pick a mission to begin.", href: "/subjects" };
}

/** Bilingual Bridge: how often Chinese support was used, by week (informational, never a penalty). */
export async function bridgeTrend(userId: string, weeks = 6) {
  const since = new Date(Date.now() - weeks * 7 * 86_400_000);
  const rows = await prisma.$queryRaw<{ wk: Date; total: bigint; hinted: bigint; correct_nohint: bigint }[]>`
    SELECT date_trunc('week', "createdAt") AS wk, count(*) AS total, count(*) FILTER (WHERE "usedHint") AS hinted,
           count(*) FILTER (WHERE correct AND NOT "usedHint") AS correct_nohint
    FROM "ReviewLog" WHERE "userId" = ${userId} AND "createdAt" >= ${since}
    GROUP BY 1 ORDER BY 1`;
  return rows.map((r) => ({ week: r.wk.toISOString().slice(0, 10), total: Number(r.total), hintRate: Number(r.total) ? Number(r.hinted) / Number(r.total) : 0, correctNoHint: Number(r.correct_nohint) }));
}

export async function errorBreakdown(userId: string) {
  const rows = await prisma.reviewLog.groupBy({ by: ["errorType"], where: { userId, correct: false }, _count: true });
  return Object.fromEntries(rows.filter((r) => r.errorType).map((r) => [r.errorType!, r._count])) as Record<string, number>;
}

/** Confusion Lab recommendations from the learner's own CONFUSION errors. */
export async function confusionRecommendations(userId: string) {
  const errs = await prisma.reviewLog.findMany({ where: { userId, errorType: "CONFUSION", confusedWithId: { not: null } }, select: { termId: true, confusedWithId: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 });
  const pairs = await prisma.confusionPair.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, termAId: true, termBId: true } });
  const counts = new Map<string, number>();
  for (const e of errs) {
    const p = pairs.find((p) => (p.termAId === e.termId && p.termBId === e.confusedWithId) || (p.termBId === e.termId && p.termAId === e.confusedWithId));
    if (p) counts.set(p.slug, (counts.get(p.slug) ?? 0) + 1);
  }
  // also count plain wrong answers on either term of a pair
  const wrong = await prisma.reviewLog.groupBy({ by: ["termId"], where: { userId, correct: false }, _count: true });
  const wrongBy = new Map(wrong.map((w) => [w.termId, w._count]));
  return pairs
    .map((p) => ({ slug: p.slug, confusions: counts.get(p.slug) ?? 0, mistakes: (wrongBy.get(p.termAId) ?? 0) + (wrongBy.get(p.termBId) ?? 0) }))
    .filter((p) => p.confusions + p.mistakes > 0)
    .sort((a, b) => b.confusions * 3 + b.mistakes - (a.confusions * 3 + a.mistakes));
}
