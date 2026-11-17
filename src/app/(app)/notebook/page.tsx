import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { NotebookView, type NoteRow } from "@/components/notebook/NotebookView";

export const metadata = { title: "Notebook" };
export const dynamic = "force-dynamic";

export default async function NotebookPage() {
  const user = await requireUserPage();
  const [states, collections, wrong] = await Promise.all([
    prisma.userTermState.findMany({
      where: { userId: user.id, term: { status: "PUBLISHED" }, OR: [{ discoveredAt: { not: null } }, { bookmarked: true }, { note: { not: "" } }, { reps: { gt: 0 } }] },
      include: { term: { select: { id: true, term: true, zh: true, definition: true, zhExplanation: true, difficulty: true, topicId: true, subject: { select: { slug: true, shortName: true, name: true } }, unit: { select: { number: true, title: true } } } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, include: { terms: { select: { termId: true } } } }),
    prisma.reviewLog.groupBy({ by: ["termId"], where: { userId: user.id, correct: false }, _count: true, _max: { createdAt: true } }),
  ]);
  const wrongBy = new Map(wrong.map((w) => [w.termId, { n: w._count, last: w._max.createdAt }]));
  const rows: NoteRow[] = states.map((s) => ({
    id: s.term.id, term: s.term.term, zh: s.term.zh, definition: s.term.definition, zhExplanation: s.term.zhExplanation, difficulty: s.term.difficulty,
    topicId: s.term.topicId, subjectSlug: s.term.subject.slug, subject: s.term.subject.shortName, unit: s.term.unit ? `${s.term.unit.number}. ${s.term.unit.title}` : "",
    status: s.status as NoteRow["status"], score: s.score, bookmarked: s.bookmarked, note: s.note,
    mistakes: wrongBy.get(s.termId)?.n ?? 0, lastMistake: wrongBy.get(s.termId)?.last?.toISOString() ?? null,
  }));
  return <NotebookView rows={rows} collections={collections.map((c) => ({ id: c.id, name: c.name, color: c.color, termIds: c.terms.map((t) => t.termId) }))} />;
}
