import Link from "next/link";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { THEMES } from "@/components/map/themes";
import { ProgressRing } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Mastery maps" };
export default async function Subjects() {
  const user = await requireUserPage();
  const subjects = await prisma.subject.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: { _count: { select: { terms: { where: { status: "PUBLISHED" } }, units: true } } },
  });
  const rows = await prisma.$queryRaw<{ subjectId: string; mastered: bigint; started: bigint }[]>`
    SELECT t."subjectId", count(*) FILTER (WHERE s.status = 'MASTERED') AS mastered, count(*) FILTER (WHERE s.status <> 'NOT_STARTED') AS started
    FROM "UserTermState" s JOIN "Term" t ON t.id = s."termId" WHERE s."userId" = ${user.id} AND t.status = 'PUBLISHED' GROUP BY 1`;
  const prog = new Map(rows.map((r) => [r.subjectId, { mastered: Number(r.mastered), started: Number(r.started) }]));
  const focus = new Set(user.focusSubjects);
  const sorted = [...subjects].sort((a, b) => Number(focus.has(b.slug)) - Number(focus.has(a.slug)));

  return (
    <div>
      <p className="eyebrow">Mastery maps · 掌握地图</p>
      <h1 className="display mt-1 text-4xl font-semibold">Choose a territory</h1>
      <p className="mt-2 max-w-2xl text-muted">Each AP course is a map. Units are regions, missions are vocabulary sets, and every region ends in a unit challenge. Your class may be on any unit — the first mission of every region is always open.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((s) => {
          const th = THEMES[s.theme] ?? THEMES.blue;
          const p = prog.get(s.id) ?? { mastered: 0, started: 0 };
          const total = s._count.terms;
          return (
            <li key={s.id}>
              <Link href={`/subjects/${s.slug}`} className="surface group relative block overflow-hidden rounded-2xl p-5 shadow-card transition-shadow hover:shadow-lift">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35" style={{ background: th.node }} aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="eyebrow" style={{ color: th.node }}>{th.name}</div>
                    <h2 className="mt-1 text-lg font-semibold leading-snug">{s.name}</h2>
                    <div className="zh text-sm text-subtle">{s.nameZh}</div>
                  </div>
                  <ProgressRing value={total ? p.mastered / total : 0} size={52} color={th.node} label={`${p.mastered} of ${total} mastered`}>
                    <span className="text-[11px]">{total ? Math.round((p.mastered / total) * 100) : 0}%</span>
                  </ProgressRing>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted">{s.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-subtle">
                  <span>{s._count.units} regions</span>·<span>{total} terms</span>·<span>{p.started} started</span>
                  {focus.has(s.slug) && <Badge tone="blue" className="ml-auto">Your course</Badge>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
