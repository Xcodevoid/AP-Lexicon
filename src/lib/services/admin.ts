import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api";
import { listField, optionRecord, QTYPES, SKILLS, STAGES, slugify, visualField } from "@/lib/content/schema";
import { invalidatePool } from "./pool";
import { invalidateGlossary } from "./glossary";

export function invalidateContentCaches() { invalidatePool(); invalidateGlossary(); }

export const termEditSchema = z.object({
  subjectId: z.string().min(1),
  unitId: z.string().nullable().optional(),
  topicId: z.string().nullable().optional(),
  term: z.string().trim().min(1).max(160),
  zh: z.string().trim().min(1).max(160),
  definition: z.string().trim().min(3).max(800),
  zhExplanation: z.string().max(2000).default(""),
  pronunciation: z.string().max(120).nullable().optional(),
  audioUrl: z.string().max(500).refine((s) => !s || /^https?:\/\/|^\//.test(s), "audioUrl must be a URL").nullable().optional(),
  imageUrl: z.string().max(500).refine((s) => !s || /^https?:\/\/|^\//.test(s), "imageUrl must be a URL").nullable().optional(),
  difficulty: z.number().int().min(1).max(3),
  category: z.string().max(80).default("Subject concept"),
  tags: listField,
  misconceptions: listField,
  apExample: z.string().max(1000).default(""),
  realWorld: z.string().max(1000).default(""),
  writtenPrompt: z.string().max(1000).default(""),
  visual: visualField,
  related: listField,
  confusedWith: listField,
  reviewStatus: z.enum(["DRAFT", "TEACHER_REVIEW", "APPROVED", "NEEDS_FIX"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
export type TermEdit = z.output<typeof termEditSchema>;

async function setRelations(termId: string, subjectId: string, related: string[], confused: string[]) {
  await prisma.termRelation.deleteMany({ where: { fromId: termId } });
  const names = [...related, ...confused].map((n) => n.toLowerCase());
  if (!names.length) return [];
  const found = await prisma.term.findMany({ where: { OR: [{ subjectId }, { subject: { slug: "ap-exam-language" } }], term: { in: [...related, ...confused], mode: "insensitive" } }, select: { id: true, term: true } });
  const id = (n: string) => found.find((f) => f.term.toLowerCase() === n.toLowerCase())?.id;
  const rows = [
    ...related.map((n) => ({ toId: id(n), kind: "related" })),
    ...confused.map((n) => ({ toId: id(n), kind: "confused" })),
  ].filter((r) => r.toId && r.toId !== termId) as { toId: string; kind: string }[];
  if (rows.length) await prisma.termRelation.createMany({ data: rows.map((r) => ({ fromId: termId, ...r })), skipDuplicates: true });
  return names.filter((n) => !found.some((f) => f.term.toLowerCase() === n));
}

export async function saveTerm(id: string | null, data: TermEdit) {
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) throw new HttpError(400, "Subject not found");
  if (data.topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: data.topicId }, include: { unit: true } });
    if (!topic || topic.unit.subjectId !== subject.id) throw new HttpError(400, "Topic does not belong to this subject");
    data.unitId = topic.unitId;
  }
  const dup = await prisma.term.findFirst({ where: { subjectId: subject.id, term: { equals: data.term, mode: "insensitive" }, ...(id ? { NOT: { id } } : {}) } });
  if (dup) throw new HttpError(409, `“${data.term}” already exists in ${subject.name} (${dup.externalId}).`);
  const { related, confusedWith, visual, ...rest } = data;
  const payload = { ...rest, visual: (visual ?? undefined) as Prisma.InputJsonValue | undefined, pronunciation: rest.pronunciation || null, audioUrl: rest.audioUrl || null, imageUrl: rest.imageUrl || null };
  const term = id
    ? await prisma.term.update({ where: { id }, data: payload })
    : await prisma.term.create({ data: { ...payload, externalId: `${subject.slug}:${slugify(data.term)}` } });
  const unresolved = await setRelations(term.id, subject.id, related, confusedWith);
  invalidateContentCaches();
  return { term, unresolved };
}

export const questionEditSchema = z.object({
  subjectId: z.string().min(1),
  unitId: z.string().nullable().optional(),
  type: z.enum(QTYPES),
  stage: z.enum(STAGES),
  skill: z.enum(SKILLS),
  difficulty: z.number().int().min(1).max(3),
  prompt: z.string().trim().min(5).max(2000),
  promptZh: z.string().max(2000).default(""),
  passage: z.string().max(4000).default(""),
  visual: visualField,
  options: z.array(optionRecord.extend({ termId: z.string().nullable().optional() })).max(6).default([]),
  answer: z.string().max(400).default(""),
  rubric: listField,
  explanation: z.string().trim().min(5).max(3000),
  explanationZh: z.string().max(3000).default(""),
  termIds: z.array(z.string()).min(1, "Link at least one term"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
}).superRefine((q, ctx) => {
  if (["MCQ", "SCENARIO", "PASSAGE", "GRAPH"].includes(q.type)) {
    if (q.options.length < 2) ctx.addIssue({ code: "custom", path: ["options"], message: "Add at least 2 options" });
    if (!q.options.some((o) => o.id === q.answer)) ctx.addIssue({ code: "custom", path: ["answer"], message: "Mark the correct option" });
  }
  if (q.type === "CLOZE" && !q.answer) ctx.addIssue({ code: "custom", path: ["answer"], message: "Enter accepted answers separated by |" });
  if (q.type === "WRITTEN" && !q.rubric.length) ctx.addIssue({ code: "custom", path: ["rubric"], message: "Add rubric criteria" });
});

export async function saveQuestion(id: string | null, data: z.output<typeof questionEditSchema>) {
  const terms = await prisma.term.findMany({ where: { id: { in: data.termIds }, subjectId: data.subjectId } });
  if (terms.length !== data.termIds.length) throw new HttpError(400, "All linked terms must belong to the question's subject");
  const { termIds, visual, ...rest } = data;
  const payload = { ...rest, visual: (visual ?? undefined) as Prisma.InputJsonValue | undefined, options: rest.options as Prisma.InputJsonValue };
  const q = id
    ? await prisma.question.update({ where: { id }, data: payload })
    : await prisma.question.create({ data: { ...payload, externalId: `custom:${Date.now().toString(36)}` } });
  await prisma.questionTerm.deleteMany({ where: { questionId: q.id } });
  await prisma.questionTerm.createMany({ data: termIds.map((t, i) => ({ questionId: q.id, termId: t, primary: i === 0 })) });
  return q;
}
