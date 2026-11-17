import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { LabDrill } from "@/components/lab/LabDrill";

export const metadata = { title: "Confusion Lab" };
export default async function LabPair({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUserPage();
  const { slug } = await params;
  const p = await prisma.confusionPair.findUnique({ where: { slug }, include: { subject: true } });
  if (!p || p.status !== "PUBLISHED") notFound();
  const terms = await prisma.term.findMany({ where: { id: { in: [p.termAId, p.termBId] } }, include: { states: { where: { userId: user.id } } } });
  const pick = (id: string) => { const t = terms.find((x) => x.id === id)!; return { id: t.id, term: t.term, zh: t.zh, definition: t.definition, zhExplanation: t.zhExplanation, apExample: t.apExample, status: (t.states[0]?.status ?? "NOT_STARTED") as "NOT_STARTED" }; };
  const scenarios = (p.scenarios as { text: string; answer: "A" | "B"; why: string }[]).map((s) => ({ text: s.text })); // answers stay on the server
  return (
    <LabDrill
      slug={p.slug}
      subject={p.subject.name}
      a={pick(p.termAId)} b={pick(p.termBId)}
      keyDifference={p.keyDifference} keyDifferenceZh={p.keyDifferenceZh}
      dimensions={p.dimensions as { label: string; a: string; b: string }[]}
      visual={(p.visual as { kind: string } | null) ?? null}
      scenarios={scenarios}
      languageMode={user.languageMode}
    />
  );
}
