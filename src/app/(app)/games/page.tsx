import Link from "next/link";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { GAMES } from "@/components/games/catalog";
import { GameArt } from "@/components/games/GameArt";

export const metadata = { title: "Games" };
export const dynamic = "force-dynamic";

export default async function GamesHub({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const user = await requireUserPage();
  const subjects = await prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true, shortName: true } });
  const focus = new Set(user.focusSubjects);
  const sorted = [...subjects].sort((a, b) => Number(focus.has(b.slug)) - Number(focus.has(a.slug)));
  const { subject: q } = await searchParams;
  const subject = sorted.find((s) => s.slug === q) ?? sorted[0];
  const bests = await prisma.personalBest.findMany({ where: { userId: user.id, key: { endsWith: `:${subject.slug}` } } });
  const best = (g: string) => bests.find((b) => b.key === `${g}:${subject.slug}`)?.value;
  return (
    <div>
      <p className="eyebrow">Games · 词汇游戏</p>
      <h1 className="display mt-1 text-4xl font-semibold">Play to remember</h1>
      <p className="mt-2 max-w-2xl text-muted">Short games built from your course vocabulary. Words you are already learning come up first, and every answer is graded like practice, so games count toward mastery (except Connections, which is just for fun and XP).</p>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" aria-label="Choose a subject">
        {sorted.map((s) => (
          <Link key={s.slug} href={`/games?subject=${s.slug}`} aria-current={s.slug === subject.slug ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold ${s.slug === subject.slug ? "bg-ink-900 text-white dark:bg-brand-500" : "sunken text-muted hover:text-[rgb(var(--fg))]"}`}>{s.shortName}</Link>
        ))}
      </nav>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <li key={g.id}>
            <Link href={`/games/${g.id}?subject=${subject.slug}`} className="surface group block overflow-hidden rounded-3xl shadow-card transition-shadow hover:shadow-lift">
              <div className="h-32" style={{ background: g.bg }}><GameArt game={g.id} /></div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">{g.name} <span className="zh text-sm font-normal text-subtle">{g.zh}</span></h2>
                  <span className="text-xs text-subtle">{g.time}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{g.blurb}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-full sunken px-2.5 py-1 font-semibold text-muted">Trains: {g.trains}</span>
                  {best(g.id) != null && <span className="font-semibold text-gold-600 dark:text-gold-300">Best {best(g.id)}</span>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
