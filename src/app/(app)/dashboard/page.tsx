import Link from "next/link";
import { ArrowRight, CalendarCheck, Flame, Sparkles, Target } from "lucide-react";
import { requireUserPage } from "@/lib/auth/session";
import { dashboard } from "@/lib/services/stats";
import { Card, CardHeader } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/States";
import { WeeklyBars } from "@/components/charts/Charts";
import { DimensionBars } from "@/components/DimensionBars";
import { GoalForm } from "@/components/GoalForm";
import { THEMES } from "@/components/map/themes";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUserPage();
  const d = await dashboard(user.id);
  const hour = new Date(Date.now() + user.tzOffset * 60_000).getUTCHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const goalPct = Math.min(1, d.xp.today / d.user.dailyGoalXp);
  const started = d.subjects.filter((s) => s.learning + s.practicing + s.mastered > 0 || user.focusSubjects.includes(s.slug));
  const anyActivity = d.dimensions.n > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="display mt-1 text-4xl font-semibold">{greet}, {d.user.name.split(" ")[0]}</h1>
        </div>
        {d.user.isDemo && <p className="max-w-xs text-xs text-subtle">You are in an isolated demo account. Everything you see is computed from what you do here.</p>}
      </div>

      {/* Today's mission */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white shadow-lift md:p-8" aria-labelledby="mission">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow text-ink-300">Today’s mission · 今日任务</p>
            <h2 id="mission" className="display mt-2 text-2xl font-semibold md:text-3xl">{d.recommendation.title}</h2>
            <p className="mt-2 text-ink-200">{d.recommendation.reason}</p>
            <ButtonLink href={d.recommendation.href} variant="accent" size="lg" className="mt-5">Start <ArrowRight size={18} /></ButtonLink>
          </div>
          <div className="flex items-center gap-6">
            <ProgressRing value={goalPct} size={96} stroke={9} color="#F5B83D" label={`${d.xp.today} of ${d.user.dailyGoalXp} daily XP`}>
              <div className="text-center leading-tight"><div className="text-xl font-bold">{d.xp.today}</div><div className="text-[10px] text-ink-300">/ {d.user.dailyGoalXp} XP</div></div>
            </ProgressRing>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Flame size={16} className={d.streak.activeToday ? "text-coral-400" : "text-ink-400"} /> <b>{d.streak.current}</b> day streak</div>
              <div className="text-ink-300">{d.streak.restDays} rest day{d.streak.restDays === 1 ? "" : "s"} banked</div>
              <div className="text-ink-300">Level {d.xp.level} · {d.xp.toNext} XP to next</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader eyebrow="Review queue" title="Due now" action={<CalendarCheck size={18} className="text-brand-500" />} />
          <div className="mt-4 flex items-end gap-2"><span className="display text-5xl font-semibold">{d.dueCount}</span><span className="pb-1.5 text-muted">term{d.dueCount === 1 ? "" : "s"}</span></div>
          <p className="mt-2 text-sm text-muted">{d.dueCount ? "Reviewing now gives the biggest memory boost." : anyActivity ? "Nothing due — you're on schedule." : "Reviews appear after your first practice."}</p>
          <ButtonLink href="/review" variant="secondary" className="mt-4 w-full">{d.dueCount ? "Review now" : "Open review"}</ButtonLink>
        </Card>
        <Card className="p-6">
          <CardHeader eyebrow="Vocabulary" title="Mastery status" />
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[["Mastered", d.totals.mastered, "已掌握"], ["Practicing", d.totals.practicing, "练习中"], ["Learning", d.totals.learning, "学习中"]].map(([l, v, z]) => (
              <div key={l as string} className="rounded-2xl sunken px-2 py-3"><dd className="text-2xl font-bold">{v}</dd><dt className="text-xs text-muted">{l}<span className="zh block text-[10px] text-subtle">{z}</span></dt></div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-subtle">Mastered requires recognition, concept and English-only application evidence.</p>
        </Card>
        <Card className="p-6">
          <CardHeader eyebrow={`Weekly challenge · ${d.challenge.titleZh}`} title={d.challenge.title} action={<Sparkles size={18} className="text-gold-500" />} />
          <p className="mt-2 text-sm text-muted">{d.challenge.description}</p>
          <div className="mt-4 flex items-center gap-3"><ProgressBar value={d.challenge.progress / d.challenge.goal} tone="gold" label="Weekly challenge progress" /><span className="font-mono text-sm">{Math.min(d.challenge.progress, d.challenge.goal)}/{d.challenge.goal}</span></div>
          {d.challenge.progress >= d.challenge.goal && <p className="mt-2 text-sm font-semibold text-teal-600">Completed this week ✓</p>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <CardHeader eyebrow="Last 7 days" title="Correct answers per day" />
          {anyActivity ? <div className="mt-4"><WeeklyBars data={d.week} /></div> : <EmptyState className="mt-4" title="No activity yet" body="Your chart fills in as you answer questions." />}
        </Card>
        <Card className="p-6">
          <CardHeader eyebrow="Three-dimensional mastery" title="Recognition vs application" />
          <div className="mt-5"><DimensionBars values={d.dimensions} n={d.dimensions.n} /></div>
          <p className="mt-4 text-xs text-subtle">{anyActivity ? `Average over ${d.dimensions.n} practiced term${d.dimensions.n === 1 ? "" : "s"}. A large gap between recognition and application means you know the translation but need more practice using the concept.` : "Scores come only from graded answers — never from viewing cards."}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <CardHeader eyebrow="Subjects" title="Subject progress" action={<Link href="/subjects" className="text-sm font-semibold text-brand-500">All maps</Link>} />
          {started.length ? (
            <ul className="mt-4 space-y-4">
              {started.map((s) => {
                const th = THEMES[s.theme] ?? THEMES.blue;
                return (
                  <li key={s.slug}>
                    <Link href={`/subjects/${s.slug}`} className="group block">
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm"><span className="font-semibold group-hover:text-brand-500">{s.name}</span><span className="font-mono text-xs text-subtle">{s.mastered} mastered · {s.practicing} practicing / {s.total}</span></div>
                      <div className="flex h-2.5 overflow-hidden rounded-full sunken" aria-label={`${s.name}: ${s.mastered} mastered, ${s.practicing} practicing, ${s.learning} learning of ${s.total}`} role="img">
                        <div style={{ width: `${(s.mastered / Math.max(1, s.total)) * 100}%`, background: th.node }} />
                        <div style={{ width: `${(s.practicing / Math.max(1, s.total)) * 100}%`, background: th.node, opacity: 0.55, marginLeft: s.mastered ? 2 : 0 }} />
                        <div style={{ width: `${(s.learning / Math.max(1, s.total)) * 100}%`, background: th.node, opacity: 0.25, marginLeft: s.practicing ? 2 : 0 }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState className="mt-4" title="Pick your first subject" action={<ButtonLink href="/subjects" size="sm">Open maps</ButtonLink>} />}
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader eyebrow="Needs attention" title="Weakest concepts" action={<Target size={18} className="text-coral-400" />} />
            {d.weak.length ? (
              <ul className="mt-3 divide-y hairline">
                {d.weak.map((w) => (
                  <li key={w.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <div className="min-w-0 flex-1"><div className="truncate font-semibold">{w.term}</div><div className="zh truncate text-xs text-subtle">{w.zh} · {w.subject}</div></div>
                    <span className="font-mono text-xs text-subtle">{w.score}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-muted">Terms appear here after at least two attempts.</p>}
            {d.weak.length > 0 && <ButtonLink href="/review" variant="ghost" size="sm" className="mt-2">Practice these</ButtonLink>}
          </Card>
          <Card className="p-6">
            <CardHeader eyebrow="Study goals" title="Upcoming" />
            {d.goals.length > 0 && (
              <ul className="mt-3 space-y-3">
                {d.goals.map((g) => (
                  <li key={g.id} className="text-sm">
                    <div className="flex justify-between gap-2"><span className="font-semibold">{g.title}</span><span className="text-xs text-subtle">{new Date(g.targetDate).toLocaleDateString()}</span></div>
                    <div className="mt-1.5 flex items-center gap-2"><ProgressBar value={g.progress / g.targetTerms} tone="teal" label={`${g.title} progress`} /><span className="font-mono text-xs">{g.progress}/{g.targetTerms}</span></div>
                  </li>
                ))}
              </ul>
            )}
            <GoalForm subjects={d.subjects.map((s) => ({ slug: s.slug, name: s.name }))} />
          </Card>
        </div>
      </div>
    </div>
  );
}
