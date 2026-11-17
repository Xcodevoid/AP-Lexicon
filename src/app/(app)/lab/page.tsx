import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { confusionRecommendations } from "@/lib/services/stats";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Confusion Lab" };
export const dynamic = "force-dynamic";

export default async function LabPage() {
  const user = await requireUserPage();
  const [pairs, recs] = await Promise.all([
    prisma.confusionPair.findMany({ where: { status: "PUBLISHED", subject: { status: "PUBLISHED" } }, include: { subject: { select: { name: true, shortName: true, slug: true, order: true } } } }),
    confusionRecommendations(user.id),
  ]);
  const terms = await prisma.term.findMany({ where: { id: { in: pairs.flatMap((p) => [p.termAId, p.termBId]) } }, select: { id: true, term: true, zh: true } });
  const t = new Map(terms.map((x) => [x.id, x]));
  const recSet = new Map(recs.map((r) => [r.slug, r]));
  const focus = new Set(user.focusSubjects);
  const sorted = [...pairs].sort((a, b) => (recSet.has(b.slug) ? 1 : 0) - (recSet.has(a.slug) ? 1 : 0) || Number(focus.has(b.subject.slug)) - Number(focus.has(a.subject.slug)) || a.subject.order - b.subject.order);
  const recommended = sorted.filter((p) => recSet.has(p.slug));
  const Item = ({ p }: { p: (typeof pairs)[number] }) => {
    const a = t.get(p.termAId)!, b = t.get(p.termBId)!;
    const r = recSet.get(p.slug);
    return (
      <li>
        <Link href={`/lab/${p.slug}`} className="surface block rounded-2xl p-5 transition-shadow hover:shadow-lift">
          <div className="flex items-center justify-between gap-2"><span className="eyebrow">{p.subject.shortName}</span>{r && <Badge tone="coral">{r.confusions ? `${r.confusions} mix-up${r.confusions > 1 ? "s" : ""}` : `${r.mistakes} mistake${r.mistakes > 1 ? "s" : ""}`}</Badge>}</div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            <div><div className="font-semibold">{a.term}</div><div className="zh text-xs text-subtle">{a.zh}</div></div>
            <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-ink-100 dark:text-ink-900">VS</span>
            <div><div className="font-semibold">{b.term}</div><div className="zh text-xs text-subtle">{b.zh}</div></div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted">{p.keyDifference}</p>
        </Link>
      </li>
    );
  };
  return (
    <div>
      <p className="eyebrow">Confusion Lab · 易混辨析实验室</p>
      <h1 className="display mt-1 text-4xl font-semibold">Untangle look-alike concepts</h1>
      <p className="mt-2 max-w-2xl text-muted">Compare frequently confused AP terms side by side, then sort real scenarios. When you pick a related term by mistake during practice, that comparison is recommended here.</p>
      {recommended.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><FlaskConical size={18} className="text-coral-400" /> Recommended from your mistakes</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{recommended.map((p) => <Item key={p.id} p={p} />)}</ul>
        </section>
      )}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">All comparisons · {pairs.length}</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{sorted.filter((p) => !recSet.has(p.slug)).map((p) => <Item key={p.id} p={p} />)}</ul>
      </section>
    </div>
  );
}
