import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { GAMES } from "@/components/games/catalog";
import { GamePlayer } from "@/components/games/GamePlayer";

export const metadata = { title: "Game" };
export default async function GamePage({ params, searchParams }: { params: Promise<{ game: string }>; searchParams: Promise<{ subject?: string }> }) {
  const user = await requireUserPage();
  const { game } = await params;
  const { subject: slug } = await searchParams;
  const def = GAMES.find((g) => g.id === game);
  const subject = slug ? await prisma.subject.findUnique({ where: { slug }, select: { slug: true, name: true, status: true } }) : null;
  if (!def || !subject || subject.status !== "PUBLISHED") notFound();
  let pairs: { slug: string; a: string; b: string; aZh: string; bZh: string; keyDifference: string; scenarios: string[] }[] = [];
  if (game === "sort") {
    const ps = await prisma.confusionPair.findMany({ where: { status: "PUBLISHED", subject: { slug: subject.slug } } });
    const terms = await prisma.term.findMany({ where: { id: { in: ps.flatMap((p) => [p.termAId, p.termBId]) } }, select: { id: true, term: true, zh: true } });
    const t = new Map(terms.map((x) => [x.id, x]));
    pairs = ps.map((p) => ({ slug: p.slug, a: t.get(p.termAId)!.term, b: t.get(p.termBId)!.term, aZh: t.get(p.termAId)!.zh, bZh: t.get(p.termBId)!.zh, keyDifference: p.keyDifference, scenarios: (p.scenarios as { text: string }[]).map((s) => s.text) }));
  }
  return <GamePlayer game={def.id} subject={{ slug: subject.slug, name: subject.name }} pairs={pairs} languageMode={user.languageMode} />;
}
