import Link from "next/link";
import { Flame } from "lucide-react";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { streakFor, xpSummary } from "@/lib/services/stats";
import { Logo, LogoMark } from "@/components/Logo";
import { BottomNav, SideNav } from "@/components/AppNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageModeSwitch } from "@/components/LanguageModeSwitch";
import { ProgressRing } from "@/components/ui/Progress";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserPage();
  const [xp, streak, dueCount] = await Promise.all([
    xpSummary(user.id, user.tzOffset),
    streakFor(user.id, user.tzOffset),
    prisma.userTermState.count({ where: { userId: user.id, reps: { gt: 0 }, due: { lte: new Date() }, term: { status: "PUBLISHED" } } }),
  ]);
  const isAdmin = user.role === "ADMIN" && !user.isDemo;
  return (
    <div className={user.reducedMotion ? "reduce-motion" : undefined}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r hairline bg-[rgb(var(--bg-elev))] px-4 py-5 md:flex">
        <Link href="/dashboard" className="mb-7 px-2" aria-label="AP Lexicon home"><Logo /></Link>
        <SideNav isAdmin={isAdmin} dueCount={dueCount} />
        <div className="mt-auto rounded-2xl sunken p-4">
          <div className="flex items-center gap-3">
            <ProgressRing value={xp.progress} size={44} stroke={5} label={`Level ${xp.level}, ${Math.round(xp.progress * 100)}% to next`}>{xp.level}</ProgressRing>
            <div className="min-w-0 text-sm">
              <div className="truncate font-semibold">{user.name}</div>
              <div className="text-xs text-muted">{xp.total.toLocaleString()} XP · {xp.toNext} to Lv {xp.level + 1}</div>
            </div>
          </div>
          {user.isDemo && <p className="mt-3 text-[11px] leading-snug text-subtle">Demo account — progress is real but isolated and may be reset.</p>}
        </div>
      </aside>
      <div className="md:pl-[264px]">
        <header className="sticky top-0 z-20 border-b hairline bg-[rgb(var(--bg))]/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-8">
            <Link href="/dashboard" className="md:hidden" aria-label="AP Lexicon home"><LogoMark size={30} /></Link>
            <div className="flex-1" />
            <LanguageModeSwitch initial={user.languageMode} />
            <Link href="/progress" className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-[rgb(var(--bg-sunken))]" aria-label={`Current streak ${streak.current} days`}>
              <Flame size={17} className={streak.activeToday ? "text-coral-400" : "text-subtle"} aria-hidden />
              {streak.current}
            </Link>
            <span className="hidden rounded-xl px-2.5 py-1.5 text-sm font-semibold sm:inline" aria-label={`${xp.today} XP today`}>
              <span className="text-gold-500">{xp.today}</span><span className="text-subtle"> / {user.dailyGoalXp} XP</span>
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-16">{children}</main>
      </div>
      <BottomNav dueCount={dueCount} />
    </div>
  );
}
