import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { subjectMap } from "@/lib/services/stats";
import { ChallengeView } from "@/components/learn/ChallengeView";

export const metadata = { title: "Unit challenge" };
export default async function ChallengePage({ params }: { params: Promise<{ unitId: string }> }) {
  const user = await requireUserPage();
  const { unitId } = await params;
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { subject: true } });
  if (!unit) notFound();
  const map = await subjectMap(user.id, unit.subject.slug);
  const u = map?.units.find((x) => x.id === unitId);
  if (!u) notFound();
  return <ChallengeView unit={{ id: u.id, number: u.number, title: u.title }} subject={{ slug: unit.subject.slug, name: unit.subject.name }} unlocked={u.challengeUnlocked} languageMode={user.languageMode} />;
}
