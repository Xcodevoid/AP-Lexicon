import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Onboarding } from "@/components/Onboarding";

export const metadata = { title: "Welcome" };
export default async function OnboardingPage() {
  const user = await requireUserPage({ allowUnonboarded: true });
  const subjects = await prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true, nameZh: true, shortName: true, theme: true, _count: { select: { terms: { where: { status: "PUBLISHED" } } } } } });
  return <Onboarding name={user.isDemo ? "" : user.name} subjects={subjects.map((s) => ({ ...s, count: s._count.terms }))} />;
}
