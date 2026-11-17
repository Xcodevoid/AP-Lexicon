"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";
import { useToast } from "../ui/Toast";
import { Field, inputCls, ta } from "./fields";

type Subj = { id: string; name: string; units: { id: string; number: number; title: string }[]; terms: { id: string; term: string; zh: string }[] };
type Opt = { id: string; text: string; rationale: string; termId?: string | null };
type Init = { id: string; externalId: string; subjectId: string; unitId: string | null; type: string; stage: string; skill: string; difficulty: number; prompt: string; promptZh: string; passage: string; visual: string; options: Opt[]; answer: string; rubric: string; explanation: string; explanationZh: string; termIds: string[]; status: string; source: string };

export function QuestionEditor({ subjects, initial }: { subjects: Subj[]; initial?: Init }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<Omit<Init, "id" | "externalId" | "source">>(initial ?? { subjectId: subjects[0]?.id ?? "", unitId: null, type: "MCQ", stage: "APPLY", skill: "APPLICATION", difficulty: 2, prompt: "", promptZh: "", passage: "", visual: "", options: ["a", "b", "c", "d"].map((id) => ({ id, text: "", rationale: "" })), answer: "a", rubric: "", explanation: "", explanationZh: "", termIds: [], status: "DRAFT" });
  const [termQ, setTermQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const subj = subjects.find((s) => s.id === f.subjectId);
  const choice = ["MCQ", "SCENARIO", "PASSAGE", "GRAPH"].includes(f.type);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: k === "difficulty" ? Number(e.target.value) : e.target.value });
  const save = async () => {
    setBusy(true); setError(null);
    try {
      const body = { ...f, options: choice ? f.options : [], rubric: f.rubric.split("\n"), visual: f.visual || null };
      const r = await api<{ id: string }>(initial ? `/api/admin/questions/${initial.id}` : "/api/admin/questions", body, initial ? "PATCH" : "POST");
      toast({ title: "Question saved", tone: "success" });
      if (!initial) router.push(`/admin/questions/${r.id}`); else router.refresh();
    } catch (e) {
      const d = (e as { details?: { path: string; message: string }[] }).details;
      setError(Array.isArray(d) ? d.map((x) => `${x.path || "question"}: ${x.message}`).join(" · ") : (e as Error).message);
    } finally { setBusy(false); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        <p className="text-xs text-subtle">Questions you write here are labelled as original AP Lexicon practice items. Do not paste official College Board questions.</p>
        <Field label="Passage / stimulus (optional)"><textarea className={ta} rows={3} value={f.passage} onChange={set("passage")} /></Field>
        <Field label="Prompt"><textarea className={ta} rows={3} value={f.prompt} onChange={set("prompt")} /></Field>
        <Field label="Chinese support for the prompt (optional)" hint="Shown in Full mode or when a student opens a hint. Must not reveal the answer."><textarea className={ta} rows={2} value={f.promptZh} onChange={set("promptZh")} lang="zh-CN" /></Field>
        {choice && (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-semibold">Options — select the correct one</legend>
            {f.options.map((o, i) => (
              <div key={o.id} className="grid gap-2 rounded-xl sunken p-3 md:grid-cols-[auto_1fr_1fr_auto]">
                <input type="radio" name="answer" aria-label={`Option ${o.id} is correct`} checked={f.answer === o.id} onChange={() => setF({ ...f, answer: o.id })} className="mt-3" />
                <input className={inputCls} placeholder={`Option ${o.id.toUpperCase()}`} value={o.text} onChange={(e) => setF({ ...f, options: f.options.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                <input className={inputCls} placeholder="Why right / why wrong (distractor rationale)" value={o.rationale} onChange={(e) => setF({ ...f, options: f.options.map((x, j) => (j === i ? { ...x, rationale: e.target.value } : x)) })} />
                <button type="button" aria-label="Remove option" onClick={() => setF({ ...f, options: f.options.filter((_, j) => j !== i) })} className="grid h-11 w-11 place-items-center text-subtle"><Trash2 size={16} /></button>
              </div>
            ))}
            {f.options.length < 6 && <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => setF({ ...f, options: [...f.options, { id: String.fromCharCode(97 + f.options.length), text: "", rationale: "" }] })}>Add option</Button>}
          </fieldset>
        )}
        {f.type === "CLOZE" && <Field label="Accepted answers" hint="Separate alternatives with |"><input className={inputCls} value={f.answer} onChange={set("answer")} /></Field>}
        {f.type === "WRITTEN" && <Field label="Rubric criteria" hint="One per line. Students self-assess against these; it is not auto-graded."><textarea className={ta} rows={4} value={f.rubric} onChange={set("rubric")} /></Field>}
        <Field label="Explanation (English)"><textarea className={ta} rows={3} value={f.explanation} onChange={set("explanation")} /></Field>
        <Field label="中文解析"><textarea className={ta} rows={2} value={f.explanationZh} onChange={set("explanationZh")} lang="zh-CN" /></Field>
      </div>
      <aside className="space-y-4">
        <div className="surface space-y-3 rounded-2xl p-4">
          <Field label="Subject"><select className={inputCls} value={f.subjectId} onChange={(e) => setF({ ...f, subjectId: e.target.value, unitId: null, termIds: [] })}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Unit"><select className={inputCls} value={f.unitId ?? ""} onChange={(e) => setF({ ...f, unitId: e.target.value || null })}><option value="">—</option>{subj?.units.map((u) => <option key={u.id} value={u.id}>{u.number}. {u.title}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Type"><select className={inputCls} value={f.type} onChange={set("type")}>{["MCQ", "SCENARIO", "PASSAGE", "GRAPH", "CLOZE", "WRITTEN"].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Stage"><select className={inputCls} value={f.stage} onChange={set("stage")}>{["RECOGNIZE", "UNDERSTAND", "APPLY", "MASTER"].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Skill"><select className={inputCls} value={f.skill} onChange={set("skill")}>{["TRANSLATION", "CONCEPT", "APPLICATION"].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Difficulty"><select className={inputCls} value={f.difficulty} onChange={set("difficulty")}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></Field>
          </div>
          <Field label="Diagram (optional)"><input className={inputCls} value={f.visual} onChange={set("visual")} placeholder="e.g. cost-curves" /></Field>
          <Field label="Status"><select className={inputCls} value={f.status} onChange={set("status")}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></Field>
          <Button variant="accent" className="w-full" loading={busy} onClick={save}>Save question</Button>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-sm font-semibold">Linked vocabulary ({f.termIds.length})</p>
          <p className="text-xs text-subtle">The first term is primary for scheduling.</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">{f.termIds.map((id) => { const t = subj?.terms.find((x) => x.id === id); return <li key={id}><button onClick={() => setF({ ...f, termIds: f.termIds.filter((x) => x !== id) })} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{t?.term ?? id} ×</button></li>; })}</ul>
          <input className={`${inputCls} mt-3`} placeholder="Search terms to link…" value={termQ} onChange={(e) => setTermQ(e.target.value)} aria-label="Search terms to link" />
          <ul className="mt-2 max-h-48 overflow-y-auto text-sm">{termQ && subj?.terms.filter((t) => t.term.toLowerCase().includes(termQ.toLowerCase()) && !f.termIds.includes(t.id)).slice(0, 12).map((t) => <li key={t.id}><button className="w-full rounded-lg px-2 py-1 text-left hover:bg-[rgb(var(--bg-sunken))]" onClick={() => { setF({ ...f, termIds: [...f.termIds, t.id] }); setTermQ(""); }}>{t.term} <span className="zh text-subtle">{t.zh}</span></button></li>)}</ul>
        </div>
      </aside>
    </div>
  );
}
