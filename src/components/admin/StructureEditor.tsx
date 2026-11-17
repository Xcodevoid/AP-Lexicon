"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { api } from "../ui/fetcher";
import { useToast } from "../ui/Toast";
import { inputCls } from "./fields";

type Topic = { id: string; code: string; title: string; _count: { terms: number } };
type Unit = { id: string; number: number; title: string; topics: Topic[] };
type Subj = { id: string; slug: string; name: string; nameZh: string; status: string; units: Unit[] };

export function StructureEditor({ subjects }: { subjects: Subj[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(subjects[0]?.id ?? null);
  const call = async (url: string, body: unknown, method = "POST") => {
    try { await api(url, body, method); toast({ title: "Saved", tone: "success" }); router.refresh(); return true; } catch (e) { toast({ title: "Not saved", body: (e as Error).message, tone: "error" }); return false; }
  };
  return (
    <div className="space-y-4">
      <form className="surface grid gap-2 rounded-2xl p-4 md:grid-cols-[1fr_1fr_1fr_120px_auto]" onSubmit={async (e) => {
        e.preventDefault(); const f = new FormData(e.currentTarget);
        if (await call("/api/admin/subjects", { slug: f.get("slug"), name: f.get("name"), nameZh: f.get("nameZh"), shortName: f.get("short") })) e.currentTarget.reset();
      }}>
        <input name="name" required placeholder="New subject name (e.g. AP Human Geography)" className={inputCls} aria-label="Subject name" />
        <input name="nameZh" required placeholder="中文名" className={inputCls} aria-label="Chinese name" />
        <input name="slug" required pattern="[a-z0-9-]+" placeholder="slug (ap-human-geography)" className={inputCls} aria-label="Slug" />
        <input name="short" required placeholder="Short name" className={inputCls} aria-label="Short name" />
        <Button type="submit">Add subject</Button>
      </form>
      {subjects.map((s) => (
        <div key={s.id} className="surface rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <button className="flex-1 text-left font-semibold" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>{s.name} <span className="zh font-normal text-subtle">{s.nameZh}</span></button>
            <Badge tone={s.status === "PUBLISHED" ? "teal" : "neutral"}>{s.status.toLowerCase()}</Badge>
            <Button size="sm" variant="secondary" onClick={() => call(`/api/admin/subjects/${s.id}`, { status: s.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }, "PATCH")}>{s.status === "PUBLISHED" ? "Unpublish" : "Publish"}</Button>
          </div>
          {open === s.id && (
            <div className="space-y-3 border-t hairline p-4">
              {s.units.map((u) => (
                <div key={u.id} className="rounded-xl sunken p-3">
                  <p className="text-sm font-semibold">Unit {u.number}. {u.title}</p>
                  <ul className="mt-1 text-sm text-muted">{u.topics.map((t) => <li key={t.id}>{t.code} {t.title} · {t._count.terms} terms</li>)}</ul>
                  <form className="mt-2 flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); if (await call("/api/admin/topics", { unitId: u.id, code: f.get("code"), title: f.get("title"), titleZh: f.get("titleZh") })) e.currentTarget.reset(); }}>
                    <input name="code" required placeholder={`${u.number}.${u.topics.length + 1}`} className={`${inputCls} h-9 w-20`} aria-label="Mission code" />
                    <input name="title" required placeholder="New mission title" className={`${inputCls} h-9 flex-1`} aria-label="Mission title" />
                    <input name="titleZh" placeholder="中文" className={`${inputCls} h-9 w-28`} aria-label="Mission Chinese title" />
                    <Button size="sm" type="submit" variant="secondary">Add mission</Button>
                  </form>
                </div>
              ))}
              <form className="flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); if (await call("/api/admin/units", { subjectId: s.id, number: Number(f.get("number")), title: f.get("title"), titleZh: f.get("titleZh") })) e.currentTarget.reset(); }}>
                <input name="number" type="number" min={0} max={99} required placeholder="#" className={`${inputCls} w-20`} aria-label="Unit number" />
                <input name="title" required placeholder="New unit title" className={`${inputCls} flex-1`} aria-label="Unit title" />
                <input name="titleZh" placeholder="中文" className={`${inputCls} w-32`} aria-label="Unit Chinese title" />
                <Button type="submit">Add unit</Button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
