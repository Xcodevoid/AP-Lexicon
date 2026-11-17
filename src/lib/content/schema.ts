import { z } from "zod";

/** Canonical record shapes shared by the .lex compiler, CSV/JSON import and the admin API. */

const trimmed = z.string().transform((s) => s.trim());
const optText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((s) => (s ?? "").toString().trim());

/** Split "a; b; c" or arrays into a clean string list. */
export const listField = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return [] as string[];
    const arr = Array.isArray(v) ? v : v.split(/\s*(?:;|\|\|)\s*/);
    return arr.map((s) => s.trim()).filter(Boolean);
  });

export const DIFFICULTY_WORDS: Record<string, number> = {
  "1": 1, foundation: 1, foundational: 1, easy: 1, basic: 1,
  "2": 2, core: 2, intermediate: 2, medium: 2,
  "3": 3, advanced: 3, hard: 3, challenge: 3,
};

export const difficultyField = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((v, ctx) => {
    if (v == null || v === "") return 2;
    const key = String(v).trim().toLowerCase();
    const n = DIFFICULTY_WORDS[key];
    if (!n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `difficulty must be 1-3 or Foundation/Intermediate/Advanced (got "${v}")` });
      return z.NEVER;
    }
    return n;
  });

export const visualField = z
  .union([z.string(), z.record(z.any()), z.null(), z.undefined()])
  .transform((v, ctx) => {
    if (v == null || v === "") return null;
    if (typeof v === "object") return v as { kind: string; [k: string]: unknown };
    const s = v.trim();
    if (s.startsWith("{")) {
      try {
        return JSON.parse(s) as { kind: string };
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "visual is not valid JSON" });
        return z.NEVER;
      }
    }
    return { kind: s };
  });

const reviewStatus = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    const s = (v ?? "").toString().trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (s === "approved") return "APPROVED" as const;
    if (s === "draft") return "DRAFT" as const;
    if (s === "needs_fix") return "NEEDS_FIX" as const;
    return "TEACHER_REVIEW" as const;
  });

const contentStatus = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => ((v ?? "").toString().trim().toLowerCase() === "published" ? ("PUBLISHED" as const) : ("DRAFT" as const)));

export const termRecord = z.object({
  id: optText, // externalId; derived from subject + term when empty
  subject: trimmed.pipe(z.string().min(1, "subject is required")),
  unit: z.coerce.number().int().min(0, "unit must be a whole number").max(99),
  unitTitle: optText,
  topic: optText,
  topicTitle: optText,
  term: trimmed.pipe(z.string().min(1, "term is required").max(160)),
  zh: trimmed.pipe(z.string().min(1, "zh (Chinese translation) is required").max(160)),
  definition: trimmed.pipe(z.string().min(3, "definition is required").max(800)),
  zhExplanation: optText,
  pronunciation: optText,
  audioUrl: optText.refine((s) => !s || /^https?:\/\/|^\//.test(s), "audioUrl must be an http(s) URL or site path"),
  difficulty: difficultyField,
  category: optText,
  tags: listField,
  misconceptions: listField,
  apExample: optText,
  realWorld: optText,
  visual: visualField,
  imageUrl: optText.refine((s) => !s || /^https?:\/\/|^\//.test(s), "imageUrl must be an http(s) URL or site path"),
  related: listField,
  confusedWith: listField,
  writtenPrompt: optText,
  priority: optText,
  source: optText,
  reviewStatus,
  status: contentStatus,
});
export type TermRecordInput = z.input<typeof termRecord>;
export type TermRecord = z.output<typeof termRecord>;

export const optionRecord = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  rationale: z.string().default(""),
});

export const STAGES = ["DISCOVER", "RECOGNIZE", "UNDERSTAND", "APPLY", "MASTER"] as const;
export const SKILLS = ["TRANSLATION", "CONCEPT", "APPLICATION"] as const;
export const QTYPES = ["MCQ", "SCENARIO", "PASSAGE", "GRAPH", "CLOZE", "WRITTEN"] as const;

export const questionRecord = z
  .object({
    id: trimmed.pipe(z.string().min(1, "question id is required")),
    subject: trimmed,
    unit: z.coerce.number().int().min(0),
    type: z.enum(QTYPES),
    stage: z.enum(STAGES),
    skill: z.enum(SKILLS),
    difficulty: difficultyField,
    prompt: trimmed.pipe(z.string().min(5)),
    promptZh: optText,
    passage: optText,
    visual: visualField,
    options: z.array(optionRecord).default([]),
    answer: optText,
    rubric: listField,
    explanation: trimmed.pipe(z.string().min(5, "explanation is required")),
    explanationZh: optText,
    terms: listField.pipe(z.array(z.string()).min(1, "question must reference at least one term")),
    pair: optText,
    status: contentStatus,
  })
  .superRefine((q, ctx) => {
    if (["MCQ", "SCENARIO", "PASSAGE", "GRAPH"].includes(q.type)) {
      if (q.options.length < 2) ctx.addIssue({ code: "custom", message: "choice questions need at least 2 options" });
      if (!q.options.some((o) => o.id === q.answer)) ctx.addIssue({ code: "custom", message: "answer must match an option id" });
    }
    if (q.type === "CLOZE" && !q.answer) ctx.addIssue({ code: "custom", message: "cloze questions need accepted answers" });
    if (q.type === "WRITTEN" && q.rubric.length === 0) ctx.addIssue({ code: "custom", message: "written questions need rubric criteria" });
  });
export type QuestionRecord = z.output<typeof questionRecord>;

export const pairRecord = z.object({
  slug: trimmed.pipe(z.string().min(1)),
  subject: trimmed,
  termA: trimmed,
  termB: trimmed,
  keyDifference: trimmed.pipe(z.string().min(5)),
  keyDifferenceZh: optText,
  dimensions: z.array(z.object({ label: z.string(), a: z.string(), b: z.string() })).default([]),
  scenarios: z.array(z.object({ text: z.string(), answer: z.enum(["A", "B"]), why: z.string().default("") })).min(2, "pairs need at least two scenarios"),
  visual: visualField,
});
export type PairRecord = z.output<typeof pairRecord>;

export const subjectRecord = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits and dashes"),
  name: z.string().min(2),
  nameZh: z.string().min(1),
  shortName: z.string().min(1),
  theme: z.string().default("blue"),
  order: z.coerce.number().default(0),
  description: z.string().default(""),
  frameworkNote: z.string().default(""),
  status: contentStatus,
  units: z
    .array(
      z.object({
        number: z.number().int(),
        title: z.string(),
        titleZh: z.string().default(""),
        topics: z.array(z.object({ code: z.string(), title: z.string(), titleZh: z.string().default(""), objectives: z.array(z.string()).default([]) })),
      }),
    )
    .default([]),
});
export type SubjectRecord = z.output<typeof subjectRecord>;

export interface ContentBundle {
  subjects: SubjectRecord[];
  terms: TermRecord[];
  questions: QuestionRecord[];
  pairs: PairRecord[];
}

export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function termExternalId(subject: string, term: string, id?: string) {
  return id && id.length ? id : `${slugify(subject)}:${slugify(term)}`;
}

/** Normalised key used for duplicate detection: same subject + same English term (case/punctuation-insensitive). */
export function duplicateKey(subject: string, term: string) {
  return `${slugify(subject)}::${slugify(term)}`;
}
