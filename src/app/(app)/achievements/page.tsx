import Link from "next/link";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { achievementStats } from "@/lib/services/stats";
import { ACHIEVEMENTS } from "@/lib/engine/achievements";
import { weekStart } from "@/lib/engine/gamification";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Progress";

export const metadata = { title: "Achievements" };
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const user = await requireUserPage();
  const [stats, unlocked] = await Promise.all([achievementStats(user.id), prisma.userAchievement.findMany({ where: { userId: user.id } })]);
  const have = new Map(unlocked.map((u) => [u.key, u.unlockedAt]));
  // Opt-in leaderboard: weekly XP among users who chose to appear, by alias only. Demo accounts never appear.
  const ws = weekStart(new Date());
  const board = await prisma.$queryRaw<{ alias: string; xp: bigint; me: boolean }[]>`
    SELECT u."leaderboardAlias" AS alias, sum(x.amount) AS xp, (u.id = ${user.id}) AS me FROM "XpEvent" x JOIN "User" u ON u.id = x."userId"
    WHERE u."leaderboardOptIn" = true AND u."isDemo" = false AND u."leaderboardAlias" IS NOT NULL AND x."createdAt" >= ${ws}
    GROUP BY u.id, u."leaderboardAlias" ORDER BY xp DESC LIMIT 20`;
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Achievements · 成就</p>
        <h1 className="display mt-1 text-4xl font-semibold">{have.size} of {ACHIEVEMENTS.length} unlocked</h1>
        <p className="mt-2 max-w-2xl text-muted">Achievements reward understanding and consistency — mastering terms, answering in English, reviewing on time — not endless clicking.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const [cur, goal] = a.progress(stats);
          const got = have.get(a.key);
          return (
            <li key={a.key} className="surface flex gap-4 rounded-2xl p-5">
              <AchievementBadge icon={a.icon} tier={a.tier} locked={!got} size={64} />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{a.title} <span className="zh text-sm font-normal text-subtle">{a.titleZh}</span></h2>
                <p className="mt-0.5 text-sm text-muted">{a.description}</p>
                {got ? <p className="mt-2 text-xs font-semibold text-teal-600 dark:text-teal-300">Unlocked {got.toLocaleDateString()}</p> : (
                  <div className="mt-2 flex items-center gap-2"><ProgressBar value={cur / goal} tone="gold" label={`${a.title} progress`} /><span className="font-mono text-xs text-subtle">{Math.min(cur, goal)}/{goal}</span></div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Card className="p-6">
        <CardHeader eyebrow="Optional · privacy-conscious" title="This week's leaderboard" />
        {user.leaderboardOptIn ? (
          board.length ? (
            <ol className="mt-4 divide-y hairline">
              {board.map((b, i) => <li key={i} className={`flex items-center gap-3 py-2 text-sm ${b.me ? "font-semibold text-brand-600 dark:text-brand-300" : ""}`}><span className="w-6 font-mono text-subtle">{i + 1}</span><span className="flex-1">{b.alias}{b.me ? " (you)" : ""}</span><span className="font-mono">{Number(b.xp)} XP</span></li>)}
            </ol>
          ) : <p className="mt-3 text-sm text-muted">No one has earned XP this week yet.</p>
        ) : (
          <p className="mt-3 text-sm text-muted">The leaderboard is off for you. If you join, only a nickname and this week’s XP are shown — never your name, email or mastery data. {user.isDemo ? "Demo accounts cannot join." : <Link href="/settings" className="font-semibold text-brand-500">Turn it on in Settings</Link>}</p>
        )}
      </Card>
    </div>
  );
}
