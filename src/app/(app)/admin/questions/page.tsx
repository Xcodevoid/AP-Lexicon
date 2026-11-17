import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Admin · Questions" };
export const dynamic = "force-dynamic";
export default async function AdminQuestions({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const [subjects, qs] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.question.findMany({ where: subject ? { subject: { slug: subject } } : {}, orderBy: [{ subject: { order: "asc" } }, { externalId: "asc" }], include: { subject: { select: { shortName: true } }, terms: { include: { term: { select: { term: true } } } }, _count: { select: { logs: true } } } }),
  ]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex gap-2"><select name="subject" defaultValue={subject ?? ""} className="h-10 rounded-xl border hairline bg-transparent px-3 text-sm" aria-label="Subject"><option value="">All subjects</option>{subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select><button className="h-10 rounded-xl px-3 text-sm font-semibold sunken">Filter</button></form>
        <Link href="/admin/questions/new" className="inline-flex h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white dark:bg-brand-500">New question</Link>
      </div>
      <ul className="mt-4 space-y-2">
        {qs.map((q) => (
          <li key={q.id}><Link href={`/admin/questions/${q.id}`} className="surface block rounded-2xl px-4 py-3 hover:shadow-card">
            <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-mono text-subtle">{q.externalId}</span><Badge>{q.subject.shortName}</Badge><Badge tone="blue">{q.stage}</Badge><Badge tone="teal">{q.type}</Badge><Badge tone={q.status === "PUBLISHED" ? "teal" : "neutral"}>{q.status.toLowerCase()}</Badge><span className="text-subtle">{q._count.logs} responses</span></div>
            <p className="mt-1 line-clamp-2 text-sm">{q.prompt}</p>
            <p className="mt-0.5 text-xs text-subtle">Terms: {q.terms.map((t) => t.term.term).join(", ")}</p>
          </Link></li>
        ))}
      </ul>
    </div>
  );
}
