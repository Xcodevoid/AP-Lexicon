import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { activityDays, bridgeTrend, errorBreakdown, streakFor, xpSummary } from "@/lib/services/stats";
import { dayKey } from "@/lib/engine/gamification";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { HintTrend } from "@/components/charts/Charts";
import { DimensionBars } from "@/components/DimensionBars";

export const metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

const ERR = [
  ["TRANSLATION", "Translation errors", "翻译错误", "Picked the wrong English↔中文 match."],
  ["CONCEPT", "Conceptual misunderstandings", "概念理解错误", "Recognised words but misread the idea."],
  ["APPLICATION", "Context / application errors", "情境应用错误", "Knew the concept but missed it in an AP scenario."],
  ["CONFUSION", "Confusion between related terms", "近义概念混淆", "Chose a commonly-confused neighbour. Try the Confusion Lab."],
] as const;

export default async function ProgressPage() {
  const user = await requireUserPage();
  const [days, streak, xp, trend, errors, perSubject, totals, bests] = await Promise.all([
    activityDays(user.id, user.tzOffset),
    streakFor(user.id, user.tzOffset),
    xpSummary(user.id, user.tzOffset),
    bridgeTrend(user.id, 8),
    errorBreakdown(user.id),
    prisma.$queryRaw<{ name: string; n: bigint; rec: number; con: number; app: number; mastered: bigint }[]>`
      SELECT sub.name, count(*) AS n, avg(s.recognition) AS rec, avg(s.concept) AS con, avg(s.application) AS app, count(*) FILTER (WHERE s.status='MASTERED') AS mastered
      FROM "UserTermState" s JOIN "Term" t ON t.id = s."termId" JOIN "Subject" sub ON sub.id = t."subjectId"
      WHERE s."userId" = ${user.id} AND s.reps > 0 GROUP BY sub.name, sub."order" ORDER BY sub."order"`,
    prisma.reviewLog.aggregate({ where: { userId: user.id }, _count: true, _avg: { responseMs: true } }),
    prisma.personalBest.findMany({ where: { userId: user.id } }),
  ]);
  const correct = await prisma.reviewLog.count({ where: { userId: user.id, correct: true } });
  const totalErr = Object.values(errors).reduce((a, b) => a + b, 0);

  // 12-week activity heatmap (single-hue sequential)
  const today = new Date();
  const cells: { day: string; n: number }[] = [];
  for (let i = 83; i >= 0; i--) { const d = dayKey(new Date(today.getTime() - i * 86_400_000), user.tzOffset); cells.push({ day: d, n: days.get(d) ?? 0 }); }
  const max = Math.max(1, ...cells.map((c) => c.n));
  const shade = (n: number) => (n === 0 ? "rgb(var(--bg-sunken))" : `color-mix(in oklab, var(--dim-rec) ${25 + Math.round((n / max) * 75)}%, rgb(var(--bg-elev)))`);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Progress analytics · 学习分析</p>
        <h1 className="display mt-1 text-4xl font-semibold">Your progress</h1>
        <p className="mt-2 max-w-2xl text-muted">Every number here is computed from your stored answers. Nothing is estimated or simulated, and none of it is a validated prediction of an AP score.</p>
      </div>
      {totals._count === 0 ? <EmptyState title="No practice yet" body="Answer a few questions in any mission and your analytics appear here." /> : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[["Answers", totals._count.toLocaleString()], ["Accuracy", `${Math.round((correct / totals._count) * 100)}%`], ["Longest streak", `${streak.longest} d`], ["Total XP", xp.total.toLocaleString()]].map(([l, v]) => (
              <Card key={l} className="p-5"><div className="text-xs text-muted">{l}</div><div className="mt-1 text-3xl font-bold">{v}</div></Card>
            ))}
          </div>

          <Card className="p-6">
            <CardHeader eyebrow="Last 12 weeks" title="Study activity" />
            <div className="mt-4 overflow-x-auto">
              <div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="img" aria-label={`Activity over the last 12 weeks; most active day had ${max} answers.`}>
                {cells.map((c) => <div key={c.day} title={`${c.day}: ${c.n} answers`} className="h-3.5 w-3.5 rounded-[4px]" style={{ background: shade(c.n) }} />)}
              </div>
            </div>
            <p className="mt-3 text-xs text-subtle">Darker = more answers that day. A day counts toward your streak at 5+ answers; every 7-day run banks a rest day (max 2).</p>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardHeader eyebrow="Bilingual Bridge · 双语桥梁" title="How often you opened Chinese support" />
              {trend.length ? <div className="mt-4"><HintTrend data={trend} /></div> : <p className="mt-4 text-sm text-muted">No data yet.</p>}
              <p className="mt-3 text-xs text-subtle">One possible signal of growing independence — never a penalty. Using Chinese support does not lower your scores, and language support is always available.</p>
            </Card>
            <Card className="p-6">
              <CardHeader eyebrow="Mistake analysis" title="What kind of errors?" />
              {totalErr ? (
                <ul className="mt-4 space-y-3">
                  {ERR.map(([k, l, z, hint]) => {
                    const n = errors[k] ?? 0;
                    return (
                      <li key={k}>
                        <div className="flex items-baseline justify-between text-sm"><span className="font-medium">{l} <span className="zh text-xs text-subtle">{z}</span></span><span className="font-mono">{n}</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full sunken"><div className="h-full rounded-full" style={{ width: `${(n / totalErr) * 100}%`, background: "var(--dim-rec)" }} /></div>
                        <p className="mt-0.5 text-[11px] text-subtle">{hint}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="mt-4 text-sm text-muted">No mistakes recorded yet.</p>}
            </Card>
          </div>

          <Card className="p-6">
            <CardHeader eyebrow="By subject" title="Recognition, concept and application" />
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              {perSubject.map((s) => (
                <div key={s.name}>
                  <div className="mb-3 flex justify-between text-sm"><span className="font-semibold">{s.name}</span><span className="text-subtle">{Number(s.mastered)} mastered of {Number(s.n)} practiced</span></div>
                  <DimensionBars values={{ recognition: Number(s.rec), concept: Number(s.con), application: Number(s.app) }} n={Number(s.n)} />
                </div>
              ))}
            </div>
          </Card>
          {bests.length > 0 && (
            <Card className="p-6">
              <CardHeader eyebrow="Personal bests" title="Timed match records" />
              <ul className="mt-3 flex flex-wrap gap-3">{bests.map((b) => <li key={b.key} className="rounded-xl sunken px-4 py-2 text-sm"><span className="text-muted">{b.key.replace("match:", "")}</span> <b className="ml-2">{b.value}</b></li>)}</ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
