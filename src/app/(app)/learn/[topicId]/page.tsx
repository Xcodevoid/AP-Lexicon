import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { MissionView } from "@/components/learn/MissionView";
import type { CardTerm } from "@/components/learn/TermCard";

export const metadata = { title: "Mission" };

export default async function LearnPage({ params, searchParams }: { params: Promise<{ topicId: string }>; searchParams: Promise<{ stage?: string }> }) {
  const user = await requireUserPage();
  const { topicId } = await params;
  const { stage } = await searchParams;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      unit: { include: { subject: true } },
      terms: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: { relationsFrom: { include: { to: { select: { id: true, term: true, zh: true, status: true } } } }, states: { where: { userId: user.id } } },
      },
    },
  });
  if (!topic || topic.unit.subject.status !== "PUBLISHED" || !topic.terms.length) notFound();
  const terms: CardTerm[] = topic.terms.map((t) => {
    const s = t.states[0];
    return {
      id: t.id, term: t.term, zh: t.zh, definition: t.definition, zhExplanation: t.zhExplanation, pronunciation: t.pronunciation, audioUrl: t.audioUrl,
      apExample: t.apExample, realWorld: t.realWorld, misconceptions: t.misconceptions, visual: (t.visual as CardTerm["visual"]) ?? null, imageUrl: t.imageUrl,
      difficulty: t.difficulty, reviewStatus: t.reviewStatus,
      related: t.relationsFrom.filter((r) => r.to.status === "PUBLISHED").map((r) => ({ id: r.to.id, term: r.to.term, zh: r.to.zh, kind: r.kind })),
      status: (s?.status ?? "NOT_STARTED") as CardTerm["status"], bookmarked: s?.bookmarked ?? false,
      dims: { recognition: s?.recognition ?? 0, concept: s?.concept ?? 0, application: s?.application ?? 0 },
    };
  });
  const valid = ["discover", "recognize", "understand", "apply", "master", "match"];
  return (
    <MissionView
      key={stage ?? "discover"}
      topic={{ id: topic.id, code: topic.code, title: topic.title, titleZh: topic.titleZh, objectives: topic.objectives }}
      subject={{ slug: topic.unit.subject.slug, name: topic.unit.subject.name, theme: topic.unit.subject.theme }}
      unit={{ number: topic.unit.number, title: topic.unit.title }}
      terms={terms}
      languageMode={user.languageMode}
      initialStage={valid.includes(stage ?? "") ? (stage as string) : "discover"}
    />
  );
}
