import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TermEditor } from "@/components/admin/TermEditor";

export const metadata = { title: "Admin · Edit term" };
export default async function EditTerm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true, units: { orderBy: { number: "asc" }, select: { id: true, number: true, title: true, topics: { orderBy: { order: "asc" }, select: { id: true, code: true, title: true } } } } } });
  if (id === "new") return <TermEditor subjects={subjects} />;
  const t = await prisma.term.findUnique({ where: { id }, include: { relationsFrom: { include: { to: { select: { term: true } } } }, _count: { select: { logs: true } } } });
  if (!t) notFound();
  return (
    <TermEditor
      subjects={subjects}
      initial={{
        id: t.id, externalId: t.externalId, subjectId: t.subjectId, topicId: t.topicId, term: t.term, zh: t.zh, definition: t.definition, zhExplanation: t.zhExplanation,
        pronunciation: t.pronunciation ?? "", audioUrl: t.audioUrl ?? "", imageUrl: t.imageUrl ?? "", difficulty: t.difficulty, category: t.category, tags: t.tags.join("; "),
        misconceptions: t.misconceptions.join("\n"), apExample: t.apExample, realWorld: t.realWorld, writtenPrompt: t.writtenPrompt,
        visual: t.visual ? JSON.stringify(t.visual) : "", related: t.relationsFrom.filter((r) => r.kind === "related").map((r) => r.to.term).join("; "),
        confusedWith: t.relationsFrom.filter((r) => r.kind === "confused").map((r) => r.to.term).join("; "), reviewStatus: t.reviewStatus, status: t.status, source: t.source, logs: t._count.logs,
      }}
    />
  );
}
