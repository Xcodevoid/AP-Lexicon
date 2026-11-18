import type { Prisma, Question, UserTermState } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { schedule, type MemoryState } from "@/lib/engine/fsrs";
import { applyAttempt, masteryScore, masteryStatus, weakestDimension, EMPTY_EVIDENCE, type MasteryEvidence, type SkillName } from "@/lib/engine/mastery";
import { classifyError, matchCloze, ratingFromOutcome } from "@/lib/engine/grading";
import { xpForAnswer, type StageName } from "@/lib/engine/gamification";
import { buildGenerated, canGenerate, hashString, mulberry32, parseRef, shuffle, type GenKind, type PlayableQuestion, type PoolTerm } from "@/lib/engine/questions";
import { loadPool } from "./pool";
import { checkAchievements } from "./stats";

type DbUser = { id: string; languageMode: "FULL" | "BALANCED" | "EXAM"; isDemo: boolean; tzOffset: number };

export function evidenceOf(s: Pick<UserTermState, "recognition" | "recognitionN" | "concept" | "conceptN" | "application" | "applicationN" | "independentOk" | "discoveredAt"> | null | undefined): MasteryEvidence {
  if (!s) return EMPTY_EVIDENCE;
  return { recognition: s.recognition, recognitionN: s.recognitionN, concept: s.concept, conceptN: s.conceptN, application: s.application, applicationN: s.applicationN, independentOk: s.independentOk, discovered: !!s.discoveredAt };
}

interface StoredOption { id: string; text: string; rationale?: string; termId?: string | null }

export function authoredToPlayable(q: Question & { terms: { termId: string; primary: boolean }[] }, pool: PoolTerm[]): PlayableQuestion {
  const byId = new Map(pool.map((p) => [p.id, p]));
  const options = (q.options as unknown as StoredOption[]) ?? [];
  const primary = q.terms.find((t) => t.primary)?.termId ?? q.terms[0]?.termId;
  const kind = q.type === "CLOZE" ? "cloze" : q.type === "WRITTEN" ? "written" : "choice";
  return {
    ref: `q:${q.id}`,
    kind,
    stage: q.stage,
    skill: q.skill,
    qtype: q.type,
    prompt: q.prompt,
    promptZh: q.promptZh || undefined,
    passage: q.passage || undefined,
    visual: q.visual ?? undefined,
    // Chinese support for options that name a term — translation help without revealing which is right
    options: kind === "choice" ? options.map((o) => ({ id: o.id, text: o.text, textZh: o.termId ? byId.get(o.termId)?.zh : undefined })) : undefined,
    hintZh: q.promptZh || undefined,
    rubric: kind === "written" ? q.rubric : undefined,
    termIds: q.terms.map((t) => t.termId),
    primaryTermId: primary,
    isAuthored: true,
    source: q.source,
    expectedMs: kind === "written" ? 120_000 : q.passage ? 30_000 : 20_000,
  };
}

const STAGE_KINDS: Record<Exclude<StageName, "DISCOVER">, GenKind[]> = {
  RECOGNIZE: ["en2zh", "zh2en"],
  UNDERSTAND: ["def2term", "term2def"],
  APPLY: ["clozeChoice", "def2term"],
  MASTER: ["cloze", "term2def"],
};

function generateFor(stage: Exclude<StageName, "DISCOVER">, t: PoolTerm, pool: PoolTerm[], seed: string, variant = 0) {
  const kinds = STAGE_KINDS[stage].filter((k) => canGenerate(k, t));
  const order = variant % 2 === 0 ? kinds : [...kinds].reverse();
  for (const k of order) {
    const q = buildGenerated(k, t, pool, `${seed}:${k}`);
    if (q) return q;
  }
  return null;
}

async function authoredFor(termIds: string[], stages: StageName[]) {
  return prisma.question.findMany({
    where: { status: "PUBLISHED", stage: { in: stages }, terms: { some: { termId: { in: termIds } } } },
    include: { terms: { select: { termId: true, primary: true } } },
  });
}

/**
 * At most one question per word: hand-written questions first (a question covers every word it is linked to),
 * then one generated question for each word that is still uncovered. Prevents the same word being asked twice
 * in one session.
 */
function onePerWord(authored: PlayableQuestion[], terms: PoolTerm[], makeGenerated: (t: PoolTerm, i: number) => PlayableQuestion | null, rand: () => number) {
  const covered = new Set<string>();
  const out: PlayableQuestion[] = [];
  for (const q of shuffle(authored, rand)) {
    if (q.termIds.some((id) => covered.has(id))) continue;
    q.termIds.forEach((id) => covered.add(id));
    out.push(q);
  }
  terms.forEach((t, i) => {
    if (covered.has(t.id)) return;
    const g = makeGenerated(t, i);
    if (g) { covered.add(t.id); out.push(g); }
  });
  return { questions: out, covered };
}

/** Learn mode: one map mission (topic), one stage. A fresh mix every time the stage is replayed. */
export async function buildLearnSession(user: DbUser, topicId: string, stage: Exclude<StageName, "DISCOVER">) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { unit: { include: { subject: true } } } });
  if (!topic) throw new HttpError(404, "Mission not found");
  const pool = await loadPool(topic.unit.subjectId);
  const terms = pool.filter((p) => p.topicId === topicId);
  if (!terms.length) throw new HttpError(404, "This mission has no published vocabulary yet");
  const seed = `${user.id}:${topicId}:${stage}:${Date.now()}`;
  const rand = mulberry32(hashString(seed));
  const authored = (await authoredFor(terms.map((t) => t.id), [stage])).map((q) => authoredToPlayable(q, pool));
  const { questions: picked, covered } = onePerWord(authored, shuffle(terms, rand), (t, i) => generateFor(stage, t, pool, `${seed}:${t.id}`, i + Math.floor(rand() * 2)), rand);
  let questions = shuffle(picked, rand).slice(0, stage === "RECOGNIZE" ? 10 : 12);
  if (stage === "MASTER") {
    // The written response uses a word not already asked in this session, when there is one.
    const usedNow = new Set(questions.flatMap((q) => q.termIds));
    const candidates = terms.filter((t) => !usedNow.has(t.id));
    const pick = candidates.length ? candidates[Math.floor(rand() * candidates.length)] : null;
    const w = pick ? buildGenerated("written", pick, pool, seed) : null;
    if (w) questions = [...questions.slice(0, 11), w];
  }
  void covered;
  return { questions, meta: { subject: topic.unit.subject.name, subjectSlug: topic.unit.subject.slug, topic: topic.title, topicZh: topic.titleZh, stage, englishOnly: stage === "MASTER" } };
}

/**
 * Daily review queue. Priority:
 *   1. overdue cards, most overdue relative to their stability first
 *   2. weak concepts (lowest mastery score among started terms)
 *   3. terms in subjects tied to an active study goal get a boost
 */
export async function reviewQueue(userId: string, opts: { subjectId?: string; limit?: number } = {}) {
  const now = new Date();
  const limit = opts.limit ?? 15;
  const goals = await prisma.studyGoal.findMany({ where: { userId, doneAt: null, targetDate: { gte: now } }, select: { subjectSlug: true } });
  const goalSlugs = new Set(goals.map((g) => g.subjectSlug).filter(Boolean) as string[]);
  const where: Prisma.UserTermStateWhereInput = { userId, term: { status: "PUBLISHED", ...(opts.subjectId ? { subjectId: opts.subjectId } : {}) } };
  const due = await prisma.userTermState.findMany({
    where: { ...where, due: { lte: now }, reps: { gt: 0 } },
    include: { term: { select: { subjectId: true, subject: { select: { slug: true } } } } },
    take: 400,
  });
  const scored = due
    .map((s) => {
      const elapsed = s.lastReview ? (now.getTime() - s.lastReview.getTime()) / 86_400_000 : 0;
      const overdueRatio = s.stability > 0 ? elapsed / s.stability : 1;
      const boost = goalSlugs.has(s.term.subject.slug) ? 0.5 : 0;
      return { s, priority: overdueRatio + (1 - s.score / 100) * 0.5 + boost };
    })
    .sort((a, b) => b.priority - a.priority);
  let picked = scored.slice(0, limit).map((x) => x.s);
  let weakFill: typeof picked = [];
  if (picked.length < Math.min(limit, 8)) {
    weakFill = await prisma.userTermState.findMany({
      where: { ...where, reps: { gt: 0 }, status: { in: ["LEARNING", "PRACTICING"] }, termId: { notIn: picked.map((p) => p.termId) } },
      include: { term: { select: { subjectId: true, subject: { select: { slug: true } } } } },
      orderBy: [{ score: "asc" }, { lastReview: "asc" }],
      take: Math.min(limit, 8) - picked.length,
    });
    picked = [...picked, ...weakFill];
  }
  const dueCount = await prisma.userTermState.count({ where: { ...where, due: { lte: now }, reps: { gt: 0 } } });
  return { items: picked, dueCount, weakFillCount: weakFill.length };
}

export async function buildReviewSession(user: DbUser, subjectId?: string) {
  const { items, dueCount } = await reviewQueue(user.id, { subjectId, limit: 15 });
  const today = new Date().toISOString().slice(0, 10);
  const pools = new Map<string, PoolTerm[]>();
  const questions: PlayableQuestion[] = [];
  const covered = new Set<string>();
  for (const s of items) {
    const subj = s.term.subjectId;
    if (!pools.has(subj)) pools.set(subj, await loadPool(subj));
    const pool = pools.get(subj)!;
    const t = pool.find((p) => p.id === s.termId);
    if (!t) continue;
    const ev = evidenceOf(s);
    const dim = weakestDimension(ev);
    const stage: Exclude<StageName, "DISCOVER"> =
      s.status === "MASTERED" ? "MASTER" : dim === "recognition" ? "RECOGNIZE" : dim === "concept" ? "UNDERSTAND" : "APPLY";
    // A hand-written question can cover several words; never ask a word twice in one review.
    if (covered.has(t.id)) continue;
    // prefer an authored item for concept/application when one exists
    if (stage === "UNDERSTAND" || stage === "APPLY") {
      const authored = (await authoredFor([t.id], [stage])).filter((q) => !q.terms.some((x) => covered.has(x.termId)));
      if (authored.length) {
        const q = authored[hashString(`${user.id}:${t.id}:${today}`) % authored.length];
        const playable = authoredToPlayable(q, pool);
        playable.termIds.forEach((id) => covered.add(id));
        questions.push(playable);
        continue;
      }
    }
    const g = generateFor(stage, t, pool, `${user.id}:${t.id}:${today}:review`, s.reps);
    if (g) { covered.add(t.id); questions.push(g); }
  }
  return { questions, meta: { dueCount, stage: "REVIEW" } };
}

/** Unit mastery challenge: English-only, timed, cumulative across the unit's started terms. */
export async function buildMasteryChallenge(user: DbUser, unitId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { subject: true } });
  if (!unit) throw new HttpError(404, "Unit not found");
  const pool = await loadPool(unit.subjectId);
  const terms = pool.filter((p) => p.unitId === unitId);
  if (terms.length < 3) throw new HttpError(400, "This unit needs at least 3 published terms for a challenge");
  const seed = `${user.id}:${unitId}:${Date.now() >> 20}`;
  const authored = (await authoredFor(terms.map((t) => t.id), ["APPLY", "MASTER"])).filter((q) => q.type !== "WRITTEN").map((q) => authoredToPlayable(q, pool));
  const generated = terms.map((t, i) => generateFor(i % 2 ? "MASTER" : "APPLY", t, pool, `${seed}:${t.id}`, i)).filter(Boolean) as PlayableQuestion[];
  const questions = shuffle([...authored, ...generated], mulberry32(hashString(seed))).slice(0, 10).map((q) => ({ ...q, hintZh: undefined, options: q.options?.map((o) => ({ id: o.id, text: o.text })) }));
  return { questions, meta: { subject: unit.subject.name, subjectSlug: unit.subject.slug, unit: unit.title, stage: "MASTER", englishOnly: true, timeLimitSec: 8 * 60 } };
}

/**
 * Game sessions (Games hub). Terms the student has already started come first so games reinforce
 * what they are learning; new terms fill the rest. Every answer is graded by /api/answer like any other.
 */
export async function buildGameSession(user: DbUser, subjectSlug: string, game: "lightning" | "spell" | "boss") {
  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") throw new HttpError(404, "Subject not found");
  const pool = await loadPool(subject.id);
  if (pool.length < 6) throw new HttpError(400, "This subject needs more vocabulary for games");
  const started = new Set((await prisma.userTermState.findMany({ where: { userId: user.id, termId: { in: pool.map((p) => p.id) }, status: { not: "NOT_STARTED" } }, select: { termId: true } })).map((s) => s.termId));
  const seed = `${user.id}:${game}:${Date.now()}`;
  const rand = mulberry32(hashString(seed));
  const ordered = [...shuffle(pool.filter((p) => started.has(p.id)), rand), ...shuffle(pool.filter((p) => !started.has(p.id)), rand)];
  const questions: PlayableQuestion[] = [];
  if (game === "lightning") {
    for (const t of ordered.slice(0, 40)) { const q = buildGenerated("def2term", t, pool, `${seed}:${t.id}`); if (q) questions.push({ ...q, hintZh: undefined, options: q.options?.map((o) => ({ id: o.id, text: o.text })) }); }
  } else if (game === "spell") {
    for (const t of ordered.filter((x) => x.term.length <= 28).slice(0, 10)) { const q = buildGenerated("spell", t, pool, seed); if (q) questions.push(q); }
  } else {
    const focus = ordered.slice(0, 14);
    const authored = (await authoredFor(focus.map((t) => t.id), ["UNDERSTAND", "APPLY"])).filter((q) => q.type !== "WRITTEN").map((q) => authoredToPlayable(q, pool));
    const { questions: mixed } = onePerWord(authored, focus, (t, i) => generateFor(i % 3 === 0 ? "UNDERSTAND" : "APPLY", t, pool, `${seed}:${t.id}`, i), rand);
    questions.push(...shuffle(mixed, rand).slice(0, 12).map((q) => ({ ...q, hintZh: undefined, options: q.options?.map((o) => ({ id: o.id, text: o.text })) })));
  }
  return { questions, meta: { subject: subject.name, subjectSlug: subject.slug, game } };
}

/** Connections puzzle: 4 missions × 4 terms. The grouping stays on the server; tiles carry no topic info. */
export async function buildConnections(subjectSlug: string) {
  const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
  if (!subject || subject.status !== "PUBLISHED") throw new HttpError(404, "Subject not found");
  const pool = await loadPool(subject.id);
  const byTopic = new Map<string, PoolTerm[]>();
  for (const t of pool) if (t.topicId) byTopic.set(t.topicId, [...(byTopic.get(t.topicId) ?? []), t]);
  const rand = mulberry32(hashString(`${subjectSlug}:${Date.now()}`));
  const eligible = shuffle([...byTopic.entries()].filter(([, ts]) => ts.length >= 4), rand).slice(0, 4);
  if (eligible.length < 4) throw new HttpError(400, "This subject needs at least four missions for Connections");
  const tiles = shuffle(eligible.flatMap(([, ts]) => shuffle(ts, rand).slice(0, 4)), rand).map((t) => ({ id: t.id, term: t.term, zh: t.zh }));
  return { tiles };
}

export async function checkConnections(subjectSlug: string, termIds: string[]) {
  const terms = await prisma.term.findMany({ where: { id: { in: termIds }, status: "PUBLISHED", subject: { slug: subjectSlug } }, select: { id: true, topicId: true, topic: { select: { title: true, titleZh: true } } } });
  if (terms.length !== termIds.length) throw new HttpError(400, "Unknown tiles");
  const counts = new Map<string, number>();
  terms.forEach((t) => counts.set(t.topicId ?? "", (counts.get(t.topicId ?? "") ?? 0) + 1));
  const top = Math.max(...counts.values());
  if (termIds.length === 4 && top === 4) return { correct: true, oneAway: false, label: terms[0].topic?.title ?? "", labelZh: terms[0].topic?.titleZh ?? "" };
  return { correct: false, oneAway: top === 3, label: "", labelZh: "" };
}

export async function solveConnections(subjectSlug: string, termIds: string[]) {
  const terms = await prisma.term.findMany({ where: { id: { in: termIds }, status: "PUBLISHED", subject: { slug: subjectSlug } }, select: { id: true, topicId: true, topic: { select: { title: true, titleZh: true } } } });
  const groups = new Map<string, { label: string; labelZh: string; ids: string[] }>();
  for (const t of terms) { const k = t.topicId ?? ""; const g = groups.get(k) ?? { label: t.topic?.title ?? "", labelZh: t.topic?.titleZh ?? "", ids: [] }; g.ids.push(t.id); groups.set(k, g); }
  return { groups: [...groups.values()] };
}

/**
 * Personal bests for games. The client reports a score, but it is capped by what the server actually
 * recorded: correct graded answers in "challenge" mode during the last few minutes.
 */
export async function saveGameBest(userId: string, game: string, subjectSlug: string, score: number) {
  let cap = 4; // Connections: at most 4 groups
  if (game !== "connections") cap = await prisma.reviewLog.count({ where: { userId, mode: game === "sort" ? "lab" : "challenge", correct: true, createdAt: { gte: new Date(Date.now() - 5 * 60_000) } } });
  if (game === "lightning") cap *= 3; // streak multiplier can triple a correct answer's points
  if (game === "spell") cap *= 2; // 2 points per word without the audio hint
  const value = Math.max(0, Math.min(Math.round(score), cap));
  const key = `${game}:${subjectSlug}`;
  const prev = await prisma.personalBest.findUnique({ where: { userId_key: { userId, key } } });
  const isBest = !prev || value > prev.value;
  if (isBest) await prisma.personalBest.upsert({ where: { userId_key: { userId, key } }, update: { value }, create: { userId, key, value } });
  if ((game === "connections" || game === "sort") && value > 0) await prisma.xpEvent.create({ data: { userId, amount: Math.min(30, value * (game === "connections" ? 3 : 2)), reason: `game:${game}` } });
  return { value, isBest, previousBest: prev?.value ?? 0, achievements: await checkAchievements(userId) };
}

// ------------------------------------------------------------------------------------------------
export interface AnswerInput {
  ref: string;
  choice?: string;
  text?: string;
  selfScore?: number; // 0..1 for written self-assessment
  usedHint: boolean;
  chineseShown: boolean;
  responseMs: number;
  mode: "learn" | "review" | "mastery" | "lab" | "challenge";
}

async function upsertState(userId: string, termId: string) {
  return prisma.userTermState.upsert({ where: { userId_termId: { userId, termId } }, update: {}, create: { userId, termId } });
}

/** Grades an answer on the server, updates FSRS + mastery, logs it, awards XP, checks achievements. */
export async function recordAnswer(user: DbUser, input: AnswerInput) {
  const parsed = parseRef(input.ref);
  if (!parsed) throw new HttpError(400, "Unknown question reference");
  const now = new Date();

  let stage: StageName;
  let skill: SkillName;
  let termIds: string[];
  let correct = false;
  let correctOptionId: string | undefined;
  let accepted: string[] | undefined;
  let rationales: Record<string, string> = {};
  let explanation = "";
  let explanationZh = "";
  let chosenTermId: string | null = null;
  let questionId: string | null = null;
  let generatedKey: string | null = null;
  let subjectId: string;
  let rubric: string[] | undefined;

  if (parsed.type === "authored") {
    const q = await prisma.question.findUnique({ where: { id: parsed.questionId }, include: { terms: true } });
    if (!q || q.status !== "PUBLISHED") throw new HttpError(404, "Question not found");
    questionId = q.id;
    stage = q.stage;
    skill = q.skill;
    subjectId = q.subjectId;
    termIds = q.terms.sort((a, b) => Number(b.primary) - Number(a.primary)).map((t) => t.termId);
    explanation = q.explanation;
    explanationZh = q.explanationZh;
    const options = (q.options as unknown as StoredOption[]) ?? [];
    rationales = Object.fromEntries(options.map((o) => [o.id, o.rationale ?? ""]));
    if (q.type === "CLOZE") {
      accepted = q.answer.split("|").map((s) => s.trim()).filter(Boolean);
      correct = matchCloze(input.text ?? "", accepted);
    } else if (q.type === "WRITTEN") {
      if (input.selfScore == null) throw new HttpError(400, "Written answers need a self-assessment");
      rubric = q.rubric;
      correct = input.selfScore >= 0.75;
    } else {
      correctOptionId = q.answer;
      correct = input.choice === q.answer;
      chosenTermId = options.find((o) => o.id === input.choice)?.termId ?? null;
    }
  } else {
    const term = await prisma.term.findUnique({ where: { id: parsed.termId }, select: { id: true, subjectId: true, status: true } });
    if (!term || term.status !== "PUBLISHED") throw new HttpError(404, "Term not found");
    subjectId = term.subjectId;
    const pool = await loadPool(term.subjectId);
    const target = pool.find((p) => p.id === term.id)!;
    const q = buildGenerated(parsed.kind, target, pool, "grade", parsed.optionIds.length ? parsed.optionIds : undefined);
    if (!q) throw new HttpError(400, "This practice item can no longer be generated");
    generatedKey = `${parsed.kind}:${term.id}`;
    stage = q.stage;
    skill = q.skill;
    termIds = [term.id];
    const byId = new Map(pool.map((p) => [p.id, p]));
    if (q.kind === "choice") {
      correctOptionId = target.id;
      correct = input.choice === target.id;
      chosenTermId = input.choice && byId.has(input.choice) ? input.choice : null;
      rationales = Object.fromEntries(
        (q.options ?? []).map((o) => {
          const t = byId.get(o.id)!;
          return [o.id, o.id === target.id ? `Correct: “${t.term}” = ${t.zh}.` : `“${t.term}” (${t.zh}) means: ${t.definition}`];
        }),
      );
    } else if (q.kind === "cloze") {
      accepted = [target.term];
      correct = matchCloze(input.text ?? "", accepted);
    } else {
      if (input.selfScore == null) throw new HttpError(400, "Written answers need a self-assessment");
      rubric = q.rubric;
      correct = input.selfScore >= 0.75;
    }
    explanation = `${target.term}: ${target.definition}${target.apExample ? `\nIn context: ${target.apExample}` : ""}`;
    explanationZh = `${target.term} = ${target.zh}。${target.zhExplanation}`;
  }

  // Load states for all linked terms
  const states = await Promise.all(termIds.map((id) => upsertState(user.id, id)));
  const confusedRows = await prisma.termRelation.findMany({ where: { fromId: { in: termIds }, kind: "confused" } });
  const confusedWith = new Map<string, Set<string>>();
  confusedRows.forEach((r) => confusedWith.set(r.fromId, (confusedWith.get(r.fromId) ?? new Set()).add(r.toId)));
  const errorType = correct ? null : classifyError({ skill, chosenTermId, correctTermIds: termIds, confusedWith });

  const englishOnly = !input.chineseShown && !input.usedHint && (user.languageMode !== "FULL" || stage === "MASTER");
  const selfScore = input.selfScore != null ? Math.min(1, Math.max(0, input.selfScore)) : undefined;
  const outcome = selfScore ?? (correct ? 1 : 0);
  const rating = ratingFromOutcome({ correct, responseMs: input.responseMs, selfScore });

  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const sameTermCorrectToday = await prisma.reviewLog.count({ where: { userId: user.id, termId: termIds[0], correct: true, createdAt: { gte: startOfDay } } });

  const masteryChanges: { termId: string; before: string; after: string; score: number; evidence: MasteryEvidence }[] = [];
  let xp = 0;
  let nextDueDays = 0;

  await prisma.$transaction(async (tx) => {
    for (const [i, st] of states.entries()) {
      const prevEv = evidenceOf(st);
      const before = masteryStatus(prevEv);
      const ev = applyAttempt(prevEv, { skill, outcome, usedHint: input.usedHint, englishOnly, selfAssessed: selfScore != null });
      const after = masteryStatus(ev);
      const mem: MemoryState = { stability: st.stability, difficulty: st.difficulty, reps: st.reps, lapses: st.lapses, lastReview: st.lastReview, state: st.state };
      const sched = schedule(mem, rating, now);
      if (i === 0) nextDueDays = sched.intervalDays;
      const wasDue = !!st.due && st.due <= now && st.state === "REVIEW";
      await tx.userTermState.update({
        where: { userId_termId: { userId: user.id, termId: st.termId } },
        data: {
          state: sched.next.state, stability: sched.next.stability, difficulty: sched.next.difficulty, due: sched.due, lastReview: now,
          reps: sched.next.reps, lapses: sched.next.lapses,
          recognition: ev.recognition, recognitionN: ev.recognitionN, concept: ev.concept, conceptN: ev.conceptN,
          application: ev.application, applicationN: ev.applicationN, independentOk: ev.independentOk,
          discoveredAt: st.discoveredAt ?? now, hintsUsed: st.hintsUsed + (input.usedHint ? 1 : 0),
          status: after, score: masteryScore(ev),
        },
      });
      await tx.reviewLog.create({
        data: {
          userId: user.id, termId: st.termId, questionId, generatedKey, skill, stage, correct, rating, errorType,
          confusedWithId: errorType === "CONFUSION" ? chosenTermId : null, usedHint: input.usedHint, responseMs: Math.min(input.responseMs, 3_600_000),
          answer: (input.choice ?? input.text ?? (selfScore != null ? `self:${selfScore}` : "")).slice(0, 2000), mode: input.mode,
          elapsedDays: sched.elapsedDays, scheduledDays: sched.intervalDays, stabilityAfter: sched.next.stability,
        },
      });
      masteryChanges.push({ termId: st.termId, before, after, score: masteryScore(ev), evidence: ev });
      if (i === 0) {
        xp = xpForAnswer({ stage, correct, wasDue, sameTermCorrectToday, becameMastered: before !== "MASTERED" && after === "MASTERED", selfScore });
      } else if (before !== "MASTERED" && after === "MASTERED") {
        xp += 25;
      }
    }
    if (xp > 0) await tx.xpEvent.create({ data: { userId: user.id, amount: xp, reason: correct ? `answer:${stage.toLowerCase()}` : "effort" } });
  });

  const terms = await prisma.term.findMany({ where: { id: { in: termIds } }, select: { id: true, term: true, zh: true, definition: true, zhExplanation: true } });
  const unlocked = await checkAchievements(user.id);
  return {
    correct,
    correctOptionId,
    acceptedAnswers: accepted,
    rationales,
    explanation,
    explanationZh,
    rubric,
    errorType,
    xp,
    nextDueDays,
    terms,
    mastery: masteryChanges.map((m) => ({ termId: m.termId, before: m.before, after: m.after, score: m.score, recognition: m.evidence.recognition, concept: m.evidence.concept, application: m.evidence.application })),
    achievements: unlocked,
    subjectId,
  };
}

/** Marks terms as studied in the Discover stage. This is NOT mastery evidence and earns no XP. */
export async function markDiscovered(userId: string, termIds: string[]) {
  const now = new Date();
  for (const termId of termIds.slice(0, 50)) {
    await prisma.userTermState.upsert({
      where: { userId_termId: { userId, termId } },
      update: { discoveredAt: now, status: undefined },
      create: { userId, termId, discoveredAt: now, status: "LEARNING" },
    });
    await prisma.userTermState.updateMany({ where: { userId, termId, status: "NOT_STARTED" }, data: { status: "LEARNING" } });
  }
  return checkAchievements(userId);
}

/** Timed EN↔中文 matching: each pair is graded on the server and logged as a TRANSLATION attempt. */
export async function recordMatch(user: DbUser, input: { subjectSlug: string; pairs: { termId: string; zhTermId: string; responseMs: number }[]; durationMs: number }) {
  const termIds = [...new Set(input.pairs.map((p) => p.termId))].slice(0, 20);
  const terms = await prisma.term.findMany({ where: { id: { in: termIds }, status: "PUBLISHED" }, select: { id: true } });
  const valid = new Set(terms.map((t) => t.id));
  let score = 0;
  for (const p of input.pairs) {
    if (!valid.has(p.termId)) continue;
    const correct = p.termId === p.zhTermId;
    if (correct) score++;
    const st = await upsertState(user.id, p.termId);
    const ev = applyAttempt(evidenceOf(st), { skill: "TRANSLATION", outcome: correct ? 1 : 0, usedHint: false, englishOnly: false });
    const sched = schedule({ stability: st.stability, difficulty: st.difficulty, reps: st.reps, lapses: st.lapses, lastReview: st.lastReview, state: st.state }, correct ? 3 : 1, new Date());
    await prisma.userTermState.update({
      where: { userId_termId: { userId: user.id, termId: p.termId } },
      data: {
        recognition: ev.recognition, recognitionN: ev.recognitionN, discoveredAt: st.discoveredAt ?? new Date(), status: masteryStatus(ev), score: masteryScore(ev),
        state: sched.next.state, stability: sched.next.stability, difficulty: sched.next.difficulty, due: sched.due, lastReview: new Date(), reps: sched.next.reps, lapses: sched.next.lapses,
      },
    });
    await prisma.reviewLog.create({
      data: { userId: user.id, termId: p.termId, generatedKey: `match:${p.termId}`, skill: "TRANSLATION", stage: "RECOGNIZE", correct, rating: correct ? 3 : 1, errorType: correct ? null : "TRANSLATION", responseMs: Math.min(p.responseMs, 600_000), mode: "challenge", answer: p.zhTermId },
    });
  }
  const key = `match:${input.subjectSlug}`;
  const prev = await prisma.personalBest.findUnique({ where: { userId_key: { userId: user.id, key } } });
  const isBest = !prev || score > prev.value;
  if (isBest) await prisma.personalBest.upsert({ where: { userId_key: { userId: user.id, key } }, update: { value: score }, create: { userId: user.id, key, value: score } });
  const xp = Math.min(score * 2, 30);
  if (xp) await prisma.xpEvent.create({ data: { userId: user.id, amount: xp, reason: "match" } });
  const achievements = await checkAchievements(user.id);
  return { score, total: input.pairs.length, isBest, previousBest: prev?.value ?? 0, xp, achievements };
}

/** Confusion Lab sorting drill: each scenario is graded on the server and logged as CONCEPT evidence. */
export async function recordLabAnswer(user: DbUser, input: { slug: string; index: number; answer: "A" | "B"; responseMs: number }) {
  const pair = await prisma.confusionPair.findUnique({ where: { slug: input.slug } });
  if (!pair || pair.status !== "PUBLISHED") throw new HttpError(404, "Comparison not found");
  const scenarios = pair.scenarios as unknown as { text: string; answer: "A" | "B"; why: string }[];
  const sc = scenarios[input.index];
  if (!sc) throw new HttpError(400, "Unknown scenario");
  const correct = sc.answer === input.answer;
  const termId = sc.answer === "A" ? pair.termAId : pair.termBId;
  const otherId = sc.answer === "A" ? pair.termBId : pair.termAId;
  const st = await upsertState(user.id, termId);
  const before = masteryStatus(evidenceOf(st));
  const ev = applyAttempt(evidenceOf(st), { skill: "CONCEPT", outcome: correct ? 1 : 0, usedHint: false, englishOnly: user.languageMode !== "FULL" });
  const sched = schedule({ stability: st.stability, difficulty: st.difficulty, reps: st.reps, lapses: st.lapses, lastReview: st.lastReview, state: st.state }, correct ? 3 : 1, new Date());
  await prisma.userTermState.update({
    where: { userId_termId: { userId: user.id, termId } },
    data: {
      concept: ev.concept, conceptN: ev.conceptN, discoveredAt: st.discoveredAt ?? new Date(), status: masteryStatus(ev), score: masteryScore(ev),
      state: sched.next.state, stability: sched.next.stability, difficulty: sched.next.difficulty, due: sched.due, lastReview: new Date(), reps: sched.next.reps, lapses: sched.next.lapses,
    },
  });
  await prisma.reviewLog.create({
    data: { userId: user.id, termId, generatedKey: `lab:${pair.slug}:${input.index}`, skill: "CONCEPT", stage: "UNDERSTAND", correct, rating: correct ? 3 : 1, errorType: correct ? null : "CONFUSION", confusedWithId: correct ? null : otherId, responseMs: Math.min(input.responseMs, 600_000), mode: "lab", answer: input.answer },
  });
  return { correct, answer: sc.answer, why: sc.why, status: masteryStatus(ev), statusBefore: before };
}

export async function completeLab(userId: string, slug: string, score: number, total: number) {
  const pair = await prisma.confusionPair.findUnique({ where: { slug } });
  if (!pair) throw new HttpError(404, "Comparison not found");
  // Only award completion when every scenario in this drill was actually answered today.
  const since = new Date(Date.now() - 2 * 3600_000);
  const answered = await prisma.reviewLog.count({ where: { userId, mode: "lab", generatedKey: { startsWith: `lab:${slug}:` }, createdAt: { gte: since } } });
  if (answered < total) throw new HttpError(400, "Finish every scenario first");
  const xp = 6 + Math.round((score / Math.max(1, total)) * 10);
  await prisma.xpEvent.create({ data: { userId, amount: xp, reason: "lab-complete" } });
  return { xp, achievements: await checkAchievements(userId) };
}
