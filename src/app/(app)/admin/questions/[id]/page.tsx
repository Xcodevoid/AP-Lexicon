import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { QuestionEditor } from "@/components/admin/QuestionEditor";

export const metadata = { title: "Admin · Question" };
export default async function EditQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true, units: { orderBy: { number: "asc" }, select: { id: true, number: true, title: true } }, terms: { orderBy: { term: "asc" }, select: { id: true, term: true, zh: true } } } });
  if (id === "new") return <QuestionEditor subjects={subjects} />;
  const q = await prisma.question.findUnique({ where: { id }, include: { terms: { orderBy: { primary: "desc" } } } });
  if (!q) notFound();
  return <QuestionEditor subjects={subjects} initial={{ id: q.id, externalId: q.externalId, subjectId: q.subjectId, unitId: q.unitId, type: q.type, stage: q.stage, skill: q.skill, difficulty: q.difficulty, prompt: q.prompt, promptZh: q.promptZh, passage: q.passage, visual: q.visual ? JSON.stringify(q.visual) : "", options: q.options as { id: string; text: string; rationale: string; termId?: string | null }[], answer: q.answer, rubric: q.rubric.join("\n"), explanation: q.explanation, explanationZh: q.explanationZh, termIds: q.terms.map((t) => t.termId), status: q.status, source: q.source }} />;
}
