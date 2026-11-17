import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { authoredToPlayable } from "@/lib/services/learning";
import { DecoderView } from "@/components/decoder/DecoderView";

export const metadata = { title: "Question Decoder" };
export default async function DecoderPage() {
  const user = await requireUserPage();
  const [subjects, qs] = await Promise.all([
    prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.question.findMany({ where: { status: "PUBLISHED", type: { in: ["MCQ", "SCENARIO", "PASSAGE", "GRAPH"] } }, include: { terms: { select: { termId: true, primary: true } }, subject: { select: { slug: true, shortName: true, order: true } } } }),
  ]);
  const practice = qs
    .sort((a, b) => a.subject.order - b.subject.order)
    .map((q) => ({ subjectSlug: q.subject.slug, subject: q.subject.shortName, question: authoredToPlayable(q, []) }));
  return <DecoderView subjects={subjects} practice={practice} languageMode={user.languageMode} focus={user.focusSubjects} />;
}
