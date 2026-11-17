"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/Button";
import { ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";
import { useToast } from "../ui/Toast";
import { Visual, VISUAL_KINDS } from "../visuals/Visual";
import { Field, inputCls, ta } from "./fields";

type Subj = { id: string; name: string; units: { id: string; number: number; title: string; topics: { id: string; code: string; title: string }[] }[] };
type Init = { id: string; externalId: string; subjectId: string; topicId: string | null; term: string; zh: string; definition: string; zhExplanation: string; pronunciation: string; audioUrl: string; imageUrl: string; difficulty: number; category: string; tags: string; misconceptions: string; apExample: string; realWorld: string; writtenPrompt: string; visual: string; related: string; confusedWith: string; reviewStatus: string; status: string; source: string; logs: number };

export function TermEditor({ subjects, initial }: { subjects: Subj[]; initial?: Init }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<Omit<Init, "id" | "externalId" | "logs" | "source">>(initial ?? { subjectId: subjects[0]?.id ?? "", topicId: null, term: "", zh: "", definition: "", zhExplanation: "", pronunciation: "", audioUrl: "", imageUrl: "", difficulty: 2, category: "Subject concept", tags: "", misconceptions: "", apExample: "", realWorld: "", writtenPrompt: "", visual: "", related: "", confusedWith: "", reviewStatus: "TEACHER_REVIEW", status: "DRAFT" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: k === "difficulty" ? Number(e.target.value) : e.target.value });
  const subj = subjects.find((s) => s.id === f.subjectId);
  let visualObj: { kind?: string; variant?: string } | null = null;
  try { visualObj = f.visual ? (f.visual.trim().startsWith("{") ? JSON.parse(f.visual) : { kind: f.visual.trim() }) : null; } catch { visualObj = null; }

  const save = async () => {
    setBusy(true); setErrs({}); setError(null);
    try {
      const body = { ...f, misconceptions: f.misconceptions.split("\n"), visual: f.visual || null };
      const r = await api<{ term: { id: string }; unresolved: string[] }>(initial ? `/api/admin/terms/${initial.id}` : "/api/admin/terms", body, initial ? "PATCH" : "POST");
      toast({ title: "Saved", body: r.unresolved.length ? `Not linked (no such term): ${r.unresolved.join(", ")}` : undefined, tone: "success" });
      if (!initial) router.push(`/admin/terms/${r.term.id}`); else router.refresh();
    } catch (e) {
      const d = (e as { details?: { path: string; message: string }[] }).details;
      if (Array.isArray(d)) setErrs(Object.fromEntries(d.map((x) => [x.path, x.message])));
      setError((e as Error).message);
    } finally { setBusy(false); }
  };
  const del = async () => {
    if (!initial || !confirm(`Delete “${initial.term}”? This cannot be undone.`)) return;
    try { await api(`/api/admin/terms/${initial.id}`, undefined, "DELETE"); router.push("/admin/terms"); } catch (e) { setError((e as Error).message); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        {initial && <p className="font-mono text-xs text-subtle">{initial.externalId} · {initial.logs} student review records{initial.source ? ` · source: ${initial.source}` : ""}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Subject"><select className={inputCls} value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value, topicId: null })}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Unit / mission"><select className={inputCls} value={f.topicId ?? ""} onChange={(e) => setF({ ...f, topicId: e.target.value || null })}><option value="">— not on the map —</option>{subj?.units.map((u) => <optgroup key={u.id} label={`${u.number}. ${u.title}`}>{u.topics.map((t) => <option key={t.id} value={t.id}>{t.code} {t.title}</option>)}</optgroup>)}</select></Field>
          <Field label="English term" error={errs.term}><input className={inputCls} value={f.term} onChange={set("term")} /></Field>
          <Field label="Chinese translation 中文翻译" error={errs.zh}><input className={inputCls} value={f.zh} onChange={set("zh")} lang="zh-CN" /></Field>
        </div>
        <Field label="English definition" error={errs.definition}><textarea className={ta} rows={2} value={f.definition} onChange={set("definition")} /></Field>
        <Field label="中文概念解释 Chinese conceptual explanation"><textarea className={ta} rows={3} value={f.zhExplanation} onChange={set("zhExplanation")} lang="zh-CN" /></Field>
        <Field label="AP-style example"><textarea className={ta} rows={2} value={f.apExample} onChange={set("apExample")} /></Field>
        <Field label="Real-world application"><textarea className={ta} rows={2} value={f.realWorld} onChange={set("realWorld")} /></Field>
        <Field label="Common misconceptions" hint="One per line."><textarea className={ta} rows={3} value={f.misconceptions} onChange={set("misconceptions")} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Related terms" hint="English terms in this subject, separated by ;"><input className={inputCls} value={f.related} onChange={set("related")} /></Field>
          <Field label="Easily confused with" hint="Feeds distractors and the Confusion Lab."><input className={inputCls} value={f.confusedWith} onChange={set("confusedWith")} /></Field>
          <Field label="Written-response prompt" hint="Optional; a default prompt is generated otherwise."><input className={inputCls} value={f.writtenPrompt} onChange={set("writtenPrompt")} /></Field>
          <Field label="Tags" hint="Separated by ;"><input className={inputCls} value={f.tags} onChange={set("tags")} /></Field>
          <Field label="Pronunciation (IPA)"><input className={inputCls} value={f.pronunciation} onChange={set("pronunciation")} /></Field>
          <Field label="Audio URL" hint="Optional; browser speech is used otherwise." error={errs.audioUrl}><input className={inputCls} value={f.audioUrl} onChange={set("audioUrl")} /></Field>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="surface space-y-4 rounded-2xl p-4">
          <Field label="Publish status"><select className={inputCls} value={f.status} onChange={set("status")}><option value="DRAFT">Draft (hidden from students)</option><option value="PUBLISHED">Published</option></select></Field>
          <Field label="Review status"><select className={inputCls} value={f.reviewStatus} onChange={set("reviewStatus")}><option value="DRAFT">Draft</option><option value="TEACHER_REVIEW">Teacher review</option><option value="APPROVED">Approved</option><option value="NEEDS_FIX">Needs fix</option></select></Field>
          <Field label="Difficulty"><select className={inputCls} value={f.difficulty} onChange={set("difficulty")}><option value={1}>Foundation</option><option value={2}>Core</option><option value={3}>Advanced</option></select></Field>
          <Field label="Category"><input className={inputCls} value={f.category} onChange={set("category")} /></Field>
          <div className="flex gap-2"><Button variant="accent" onClick={save} loading={busy} className="flex-1">Save</Button>{initial && <Button variant="danger" onClick={del}>Delete</Button>}</div>
        </div>
        <div className="surface space-y-3 rounded-2xl p-4">
          <Field label="Diagram" hint="Built-in diagram kind, or JSON like {&quot;kind&quot;:&quot;supply-demand&quot;,&quot;variant&quot;:&quot;ceiling&quot;}">
            <input className={inputCls} list="visual-kinds" value={f.visual} onChange={set("visual")} />
            <datalist id="visual-kinds">{VISUAL_KINDS.map((k) => <option key={k} value={k} />)}</datalist>
          </Field>
          <Field label="Illustration image URL" hint="Overrides the diagram. Use an image you have rights to." error={errs.imageUrl}><input className={inputCls} value={f.imageUrl} onChange={set("imageUrl")} /></Field>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {f.imageUrl ? <img src={f.imageUrl} alt="Illustration preview" className="rounded-xl" /> : visualObj ? <Visual visual={visualObj} /> : <p className="text-xs text-subtle">No visual.</p>}
        </div>
      </aside>
    </div>
  );
}
