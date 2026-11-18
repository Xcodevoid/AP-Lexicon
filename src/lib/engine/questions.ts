/**
 * Question model shared by authored and auto-generated items.
 * Auto-generated items are built deterministically from vocabulary records so that the server can
 * re-derive and grade them from the `ref` alone (no answers are trusted from the client).
 */
export type StageName = "DISCOVER" | "RECOGNIZE" | "UNDERSTAND" | "APPLY" | "MASTER";
export type SkillName = "TRANSLATION" | "CONCEPT" | "APPLICATION";
export type GenKind = "en2zh" | "zh2en" | "def2term" | "term2def" | "cloze" | "clozeChoice" | "written" | "spell";

export interface PoolTerm {
  id: string;
  term: string;
  zh: string;
  definition: string;
  zhExplanation: string;
  apExample: string;
  writtenPrompt: string;
  unitId: string | null;
  topicId: string | null;
  difficulty: number;
  confusedIds: string[];
  relatedIds: string[];
}

export interface PlayOption {
  id: string;
  text: string;
  textZh?: string;
}

export interface PlayableQuestion {
  ref: string; // "q:<questionId>" | "gen:<kind>:<termId>:<optionIds>"
  kind: "choice" | "cloze" | "written";
  stage: StageName;
  skill: SkillName;
  qtype: string;
  prompt: string;
  promptZh?: string;
  passage?: string;
  visual?: unknown;
  options?: PlayOption[];
  hintZh?: string; // Chinese support shown on request (Balanced) or by default (Full)
  rubric?: string[];
  termIds: string[];
  primaryTermId: string;
  subjectName?: string;
  isAuthored: boolean;
  source?: string;
  expectedMs: number;
}

// ---------- deterministic RNG ----------
export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(arr: T[], rand: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Choose plausible distractors: commonly-confused terms first, then related terms, same topic,
 * same unit, then the rest of the subject. Excludes terms whose English or Chinese text collides.
 */
export function pickDistractors(target: PoolTerm, pool: PoolTerm[], n: number, seed: string) {
  const rand = mulberry32(hashString(seed));
  const usable = pool.filter(
    (p) => p.id !== target.id && p.term.toLowerCase() !== target.term.toLowerCase() && p.zh !== target.zh && p.definition !== target.definition,
  );
  const tiers: PoolTerm[][] = [
    usable.filter((p) => target.confusedIds.includes(p.id) || p.confusedIds.includes(target.id)),
    usable.filter((p) => target.relatedIds.includes(p.id)),
    usable.filter((p) => target.topicId && p.topicId === target.topicId),
    usable.filter((p) => target.unitId && p.unitId === target.unitId),
    usable,
  ];
  const chosen: PoolTerm[] = [];
  for (const tier of tiers) {
    for (const p of shuffle(tier, rand)) {
      if (chosen.length >= n) break;
      if (!chosen.some((c) => c.id === p.id)) chosen.push(p);
    }
    if (chosen.length >= n) break;
  }
  return chosen;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Returns the example sentence with the term blanked, or null if the term does not occur in it. */
export function blankTerm(example: string, term: string) {
  if (!example) return null;
  const re = new RegExp(`(^|[^A-Za-z])(${escapeRe(term)}(?:s|es)?)(?=$|[^A-Za-z])`, "i");
  const m = example.match(re);
  if (!m) return null;
  return example.replace(re, (_all, pre) => `${pre}______`);
}

export function canGenerate(kind: GenKind, t: PoolTerm) {
  if (kind === "cloze" || kind === "clozeChoice") return blankTerm(t.apExample, t.term) != null;
  return true;
}

/** Build an auto-generated question. `optionIds` lets the server rebuild the exact item from its ref. */
export function buildGenerated(kind: GenKind, target: PoolTerm, pool: PoolTerm[], seed: string, optionIdsFromRef?: string[]): PlayableQuestion | null {
  const byId = new Map(pool.map((p) => [p.id, p]));
  let options: PoolTerm[] = [];
  const needsOptions = kind === "en2zh" || kind === "zh2en" || kind === "def2term" || kind === "term2def" || kind === "clozeChoice";
  if (needsOptions) {
    if (optionIdsFromRef) {
      options = optionIdsFromRef.map((id) => (id === target.id ? target : byId.get(id))).filter(Boolean) as PoolTerm[];
      if (!options.some((o) => o.id === target.id)) return null;
    } else {
      const distractors = pickDistractors(target, pool, 3, seed);
      if (distractors.length < 2) return null;
      options = shuffle([target, ...distractors], mulberry32(hashString(seed + ":order")));
    }
  }
  const ref = `gen:${kind}:${target.id}:${options.map((o) => o.id).join(",")}`;
  const base = { ref, termIds: [target.id] as string[], primaryTermId: target.id, isAuthored: false as const, qtype: kind as string };

  switch (kind) {
    case "en2zh":
      return { ...base, kind: "choice", stage: "RECOGNIZE", skill: "TRANSLATION", expectedMs: 6000,
        prompt: `Which Chinese term matches “${target.term}”?`, promptZh: `“${target.term}”的中文意思是？`,
        options: options.map((o) => ({ id: o.id, text: o.zh })) };
    case "zh2en":
      // If another word shares this Chinese translation (e.g. moreover / furthermore = 此外), the question would
      // have two right answers, so return null and let the caller ask English → Chinese instead.
      if (pool.some((p) => p.id !== target.id && p.zh === target.zh)) return null;
      return { ...base, kind: "choice", stage: "RECOGNIZE", skill: "TRANSLATION", expectedMs: 6000,
        prompt: `Which English academic term means “${target.zh}”?`, promptZh: `哪个英文术语对应“${target.zh}”？`,
        options: options.map((o) => ({ id: o.id, text: o.term })) };
    case "def2term":
      return { ...base, kind: "choice", stage: "UNDERSTAND", skill: "CONCEPT", expectedMs: 12000,
        prompt: `Which term fits this definition?\n“${target.definition}”`, hintZh: target.zhExplanation || target.zh,
        options: options.map((o) => ({ id: o.id, text: o.term, textZh: o.zh })) };
    case "term2def":
      return { ...base, kind: "choice", stage: "UNDERSTAND", skill: "CONCEPT", expectedMs: 15000,
        prompt: `Which statement best defines “${target.term}”?`, hintZh: `${target.term} = ${target.zh}`,
        options: options.map((o) => ({ id: o.id, text: o.definition })) };
    case "clozeChoice": {
      const blanked = blankTerm(target.apExample, target.term);
      if (!blanked) return null;
      return { ...base, kind: "choice", stage: "APPLY", skill: "APPLICATION", expectedMs: 15000,
        prompt: `Complete the AP-style sentence:\n${blanked}`, hintZh: `提示：空格处的概念与“${target.zh}”有关。`,
        options: options.map((o) => ({ id: o.id, text: o.term, textZh: o.zh })) };
    }
    case "spell": {
      // Spell It game: English definition → type the English term. The letter pattern shows only the length,
      // word breaks and first letter, so it still requires recall (and correct spelling).
      const pattern = target.term.split(" ").map((w, wi) => [...w].map((ch, ci) => (/[A-Za-z]/.test(ch) && !(wi === 0 && ci === 0) ? "_" : ch)).join(" ")).join("   ");
      return { ...base, kind: "cloze", stage: "MASTER", skill: "CONCEPT", expectedMs: 20000, ref: `gen:spell:${target.id}:`, qtype: "spell",
        prompt: `${target.definition}\n\n${pattern.trim()}` };
    }
    case "cloze": {
      const blanked = blankTerm(target.apExample, target.term);
      if (!blanked) return null;
      return { ...base, kind: "cloze", stage: "MASTER", skill: "APPLICATION", expectedMs: 20000, ref: `gen:cloze:${target.id}:`,
        prompt: `Type the missing academic term (English only):\n${blanked}` };
    }
    case "written":
      return { ...base, kind: "written", stage: "MASTER", skill: "APPLICATION", expectedMs: 90000, ref: `gen:written:${target.id}:`,
        prompt: target.writtenPrompt || `In your own English words, explain what “${target.term}” means and use it correctly in a specific example from this course.`,
        rubric: [
          "My definition is accurate and in my own words (not a translation).",
          "I connected the term to a specific example or scenario.",
          "I used related vocabulary correctly.",
          "A teacher could follow my reasoning without Chinese.",
        ] };
  }
}

export function parseRef(ref: string) {
  if (ref.startsWith("q:")) return { type: "authored" as const, questionId: ref.slice(2) };
  const m = ref.match(/^gen:([a-zA-Z0-9]+):([^:]+):(.*)$/);
  if (!m) return null;
  return { type: "generated" as const, kind: m[1] as GenKind, termId: m[2], optionIds: m[3] ? m[3].split(",").filter(Boolean) : [] };
}

/** Which generated item kinds can measure a given dimension, in increasing difficulty. */
export const KINDS_FOR_STAGE: Record<Exclude<StageName, "DISCOVER">, GenKind[]> = {
  RECOGNIZE: ["en2zh", "zh2en"],
  UNDERSTAND: ["def2term", "term2def"],
  APPLY: ["clozeChoice", "def2term"],
  MASTER: ["cloze", "written"],
};
