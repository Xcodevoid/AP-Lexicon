import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings" };
export default async function SettingsPage() {
  const user = await requireUserPage();
  const subjects = await prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true } });
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Settings · 设置</p>
      <h1 className="display mt-1 text-4xl font-semibold">Settings</h1>
      <SettingsForm user={{ name: user.name, email: user.email, isDemo: user.isDemo, languageMode: user.languageMode, dailyGoalXp: user.dailyGoalXp, focusSubjects: user.focusSubjects, reducedMotion: user.reducedMotion, leaderboardOptIn: user.leaderboardOptIn, leaderboardAlias: user.leaderboardAlias }} subjects={subjects} />
    </div>
  );
}
