"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { api } from "../ui/fetcher";
import { useToast } from "../ui/Toast";

type Row = { id: string; externalId: string; term: string; zh: string; status: string; reviewStatus: string; difficulty: number; subject: { shortName: string }; unit: { number: number } | null; _count: { questions: number } };
const RS: Record<string, "teal" | "gold" | "coral" | "neutral"> = { APPROVED: "teal", TEACHER_REVIEW: "gold", NEEDS_FIX: "coral", DRAFT: "neutral" };

export function TermTable({ terms, subjects, total, page, pageSize, filters }: { terms: Row[]; subjects: { slug: string; name: string }[]; total: number; page: number; pageSize: number; filters: Record<string, string | undefined> }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const bulk = async (data: Record<string, string>) => {
    setBusy(true);
    try { const r = await api<{ updated: number }>("/api/admin/terms/bulk", { ids: [...sel], ...data }, "PATCH"); toast({ title: `${r.updated} terms updated`, tone: "success" }); setSel(new Set()); router.refresh(); }
    catch (e) { toast({ title: "Update failed", body: (e as Error).message, tone: "error" }); } finally { setBusy(false); }
  };
  const qs = (p: number) => { const u = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]); u.set("page", String(p)); return `?${u}`; };
  return (
    <div>
      <form className="flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={filters.q} placeholder="Search term, 中文 or ID" aria-label="Search" className="h-10 rounded-xl border hairline bg-transparent px-3 text-sm" />
        <select name="subject" defaultValue={filters.subject ?? ""} aria-label="Subject" className="h-10 rounded-xl border hairline bg-transparent px-3 text-sm"><option value="">All subjects</option>{subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Publish status" className="h-10 rounded-xl border hairline bg-transparent px-3 text-sm"><option value="">Any status</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select>
        <select name="review" defaultValue={filters.review ?? ""} aria-label="Review status" className="h-10 rounded-xl border hairline bg-transparent px-3 text-sm"><option value="">Any review</option><option value="TEACHER_REVIEW">Teacher review</option><option value="APPROVED">Approved</option><option value="NEEDS_FIX">Needs fix</option><option value="DRAFT">Draft</option></select>
        <button className="h-10 rounded-xl px-4 text-sm font-semibold sunken">Filter</button>
        <Link href="/admin/terms/new" className="ml-auto inline-flex h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white dark:bg-brand-500">New term</Link>
      </form>
      {sel.size > 0 && (
        <div className="sticky top-16 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-sm text-white">
          <span className="mr-2">{sel.size} selected</span>
          <Button size="sm" variant="accent" loading={busy} onClick={() => bulk({ status: "PUBLISHED" })}>Publish</Button>
          <Button size="sm" variant="secondary" loading={busy} onClick={() => bulk({ status: "DRAFT" })}>Unpublish</Button>
          <Button size="sm" variant="secondary" loading={busy} onClick={() => bulk({ reviewStatus: "APPROVED" })}>Mark approved</Button>
          <Button size="sm" variant="secondary" loading={busy} onClick={() => bulk({ reviewStatus: "NEEDS_FIX" })}>Needs fix</Button>
        </div>
      )}
      <div className="surface mt-3 overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <caption className="sr-only">Vocabulary terms</caption>
          <thead><tr className="border-b hairline text-left text-muted">
            <th className="p-3"><input type="checkbox" aria-label="Select all on page" checked={terms.length > 0 && terms.every((t) => sel.has(t.id))} onChange={(e) => setSel(e.target.checked ? new Set(terms.map((t) => t.id)) : new Set())} /></th>
            <th className="p-3">Term</th><th className="p-3">中文</th><th className="p-3">Subject</th><th className="p-3">Unit</th><th className="p-3">Qs</th><th className="p-3">Review</th><th className="p-3">Status</th>
          </tr></thead>
          <tbody>{terms.map((t) => (
            <tr key={t.id} className="border-b hairline last:border-0 hover:bg-[rgb(var(--bg-sunken))]">
              <td className="p-3"><input type="checkbox" aria-label={`Select ${t.term}`} checked={sel.has(t.id)} onChange={(e) => { const s = new Set(sel); if (e.target.checked) s.add(t.id); else s.delete(t.id); setSel(s); }} /></td>
              <td className="p-3"><Link href={`/admin/terms/${t.id}`} className="font-semibold hover:text-brand-500">{t.term}</Link><div className="font-mono text-[10px] text-subtle">{t.externalId}</div></td>
              <td className="zh p-3">{t.zh}</td><td className="p-3">{t.subject.shortName}</td><td className="p-3">{t.unit?.number ?? "—"}</td><td className="p-3">{t._count.questions}</td>
              <td className="p-3"><Badge tone={RS[t.reviewStatus]}>{t.reviewStatus.replace("_", " ").toLowerCase()}</Badge></td>
              <td className="p-3"><Badge tone={t.status === "PUBLISHED" ? "teal" : "neutral"}>{t.status.toLowerCase()}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted">
        <span>{total} terms · page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
        <span className="flex gap-2">{page > 1 && <Link href={qs(page - 1)} className="font-semibold text-brand-500">← Prev</Link>}{page * pageSize < total && <Link href={qs(page + 1)} className="font-semibold text-brand-500">Next →</Link>}</span>
      </div>
    </div>
  );
}
