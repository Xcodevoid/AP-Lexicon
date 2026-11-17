import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";
export default async function AdminHome() {
  const [subjects, byStatus, byReview, qCount, jobs, users] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { terms: true, questions: true, units: true } } } }),
    prisma.term.groupBy({ by: ["status"], _count: true }),
    prisma.term.groupBy({ by: ["reviewStatus"], _count: true }),
    prisma.question.count(),
    prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true } } } }),
    prisma.user.groupBy({ by: ["isDemo"], _count: true }),
  ]);
  const n = (arr: { _count: number }[], pick: (x: never) => boolean) => (arr as never[]).filter(pick).reduce((a, x: { _count: number }) => a + x._count, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          ["Published terms", n(byStatus, (x: { status: string }) => x.status === "PUBLISHED")],
          ["Draft terms", n(byStatus, (x: { status: string }) => x.status === "DRAFT")],
          ["Needs review", n(byReview, (x: { reviewStatus: string }) => x.reviewStatus !== "APPROVED")],
          ["Questions", qCount],
          ["Students (real / demo)", `${n(users, (x: { isDemo: boolean }) => !x.isDemo)} / ${n(users, (x: { isDemo: boolean }) => x.isDemo)}`],
        ].map(([l, v]) => <Card key={l as string} className="p-5"><div className="text-xs text-muted">{l}</div><div className="mt-1 text-2xl font-bold">{v}</div></Card>)}
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <caption className="sr-only">Subjects</caption>
          <thead><tr className="border-b hairline text-left text-muted"><th className="p-3">Subject</th><th className="p-3">Units</th><th className="p-3">Terms</th><th className="p-3">Questions</th><th className="p-3">Status</th><th className="p-3" /></tr></thead>
          <tbody>{subjects.map((s) => (
            <tr key={s.id} className="border-b hairline last:border-0">
              <td className="p-3 font-semibold">{s.name} <span className="zh font-normal text-subtle">{s.nameZh}</span></td>
              <td className="p-3">{s._count.units}</td><td className="p-3">{s._count.terms}</td><td className="p-3">{s._count.questions}</td>
              <td className="p-3"><Badge tone={s.status === "PUBLISHED" ? "teal" : "neutral"}>{s.status.toLowerCase()}</Badge></td>
              <td className="p-3 text-right"><Link className="font-semibold text-brand-500" href={`/admin/terms?subject=${s.slug}`}>Terms →</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
      <Card className="p-5">
        <h2 className="font-semibold">Recent imports</h2>
        {jobs.length ? <ul className="mt-3 space-y-1 text-sm">{jobs.map((j) => <li key={j.id}>{j.createdAt.toLocaleString()} · {j.filename} · {j.created} created, {j.updated} updated, {j.skipped} skipped · {j.user.name}</li>)}</ul> : <p className="mt-2 text-sm text-muted">No imports yet. <Link href="/admin/import" className="font-semibold text-brand-500">Import vocabulary</Link></p>}
      </Card>
    </div>
  );
}
