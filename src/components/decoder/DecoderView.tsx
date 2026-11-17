"use client";
import { useMemo, useState } from "react";
import { Bot, Eye, EyeOff, ListChecks, ScanText, Sparkles, TriangleAlert } from "lucide-react";
import type { DecodeResult } from "@/lib/engine/decoder";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { PracticePlayer } from "../learn/PracticePlayer";
import { Button } from "../ui/Button";
import { ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { inputCls } from "../AuthForm";

type Practice = { subjectSlug: string; subject: string; question: PlayableQuestion };
const KIND_STYLE: Record<string, string> = {
  term: "bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-100 underline decoration-brand-400 decoration-2 underline-offset-4",
  command: "bg-coral-100 text-coral-700 dark:bg-coral-700/30 dark:text-coral-100 font-semibold",
  connector: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-100",
  trap: "bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-100 font-semibold",
};

export function DecoderView({ subjects, practice, languageMode, focus }: { subjects: { slug: string; name: string }[]; practice: Practice[]; languageMode: "FULL" | "BALANCED" | "EXAM"; focus: string[] }) {
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [res, setRes] = useState<(DecodeResult & { aiAvailable: boolean }) | null>(null);
  const [decodedText, setDecodedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zh, setZh] = useState(languageMode !== "EXAM");
  const [guided, setGuided] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [practiceQ, setPracticeQ] = useState<Practice | null>(null);
  const [attempt, setAttempt] = useState(false);
  const [ai, setAi] = useState<{ text: string; disclaimer: string } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [pickSubject, setPickSubject] = useState(focus[0] ?? "");

  const decode = async (t = text, s = subject) => {
    setBusy(true); setError(null); setAi(null); setAiErr(null); setGuided(false);
    try {
      const r = await api<DecodeResult & { aiAvailable: boolean }>("/api/decoder", { text: t, subjectSlug: s || undefined });
      setRes(r);
      setDecodedText(t.slice(0, 6000));
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const loadPractice = (p: Practice) => {
    setPracticeQ(p);
    setAttempt(false);
    const t = [p.question.passage, p.question.prompt].filter(Boolean).join("\n\n");
    setText(t);
    setSubject(p.subjectSlug);
    void decode(t, p.subjectSlug);
  };

  const segments = useMemo(() => {
    if (!res) return [];
    const out: { text: string; h?: DecodeResult["highlights"][number] }[] = [];
    let pos = 0;
    for (const h of res.highlights) { if (h.start > pos) out.push({ text: decodedText.slice(pos, h.start) }); out.push({ text: decodedText.slice(h.start, h.end), h }); pos = h.end; }
    if (pos < decodedText.length) out.push({ text: decodedText.slice(pos) });
    return out;
  }, [res, decodedText]);
  const termById = useMemo(() => new Map(res?.terms.map((t) => [t.id, t]) ?? []), [res]);
  const practiceList = practice.filter((p) => !pickSubject || p.subjectSlug === pickSubject);

  return (
    <div>
      <p className="eyebrow">AP Question Decoder · 题目解码器</p>
      <h1 className="display mt-1 text-4xl font-semibold">Understand the question before you answer it</h1>
      <p className="mt-2 max-w-2xl text-muted">Paste an AP-style question. The decoder highlights academic vocabulary, command verbs and tricky wording, and explains what skill is being tested — it never reveals the answer.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface rounded-3xl p-5 shadow-card">
          <label htmlFor="dq" className="text-sm font-semibold">Question text</label>
          <textarea id="dq" rows={7} value={text} onChange={(e) => { setText(e.target.value); setPracticeQ(null); }} maxLength={6000} placeholder="e.g. Explain why a binding price ceiling set below the equilibrium price results in a shortage. Use a correctly labeled graph." className="mt-1.5 w-full rounded-2xl border hairline bg-transparent p-4 text-[15px] leading-relaxed outline-none focus:border-brand-500" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="ds" className="sr-only">Subject</label>
            <select id="ds" value={subject} onChange={(e) => setSubject(e.target.value)} className={cn(inputCls, "w-auto")}><option value="">Detect subject automatically</option>{subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
            <Button variant="accent" onClick={() => decode()} loading={busy} disabled={text.trim().length < 10} icon={<ScanText size={17} />}>Decode</Button>
          </div>
          {error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}
        </div>
        <div className="surface rounded-3xl p-5 shadow-card">
          <h2 className="font-semibold">Or pick a practice question</h2>
          <p className="text-xs text-subtle">Original AP Lexicon items — not official College Board questions.</p>
          <select aria-label="Filter practice questions by subject" value={pickSubject} onChange={(e) => setPickSubject(e.target.value)} className={cn(inputCls, "mt-3")}><option value="">All subjects</option>{subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
          <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {practiceList.map((p) => (
              <li key={p.question.ref}><button onClick={() => loadPractice(p)} className={cn("w-full rounded-xl px-3 py-2 text-left text-sm", practiceQ?.question.ref === p.question.ref ? "bg-brand-50 dark:bg-brand-900/30" : "hover:bg-[rgb(var(--bg-sunken))]")}><span className="mr-2 font-mono text-[11px] text-subtle">{p.subject}</span><span className="line-clamp-2">{p.question.prompt}</span></button></li>
            ))}
            {!practiceList.length && <li className="text-sm text-muted">No practice questions for this subject yet.</li>}
          </ul>
        </div>
      </div>

      {res && (
        <div className="mt-6 space-y-5 animate-fade-up">
          <div className="surface rounded-3xl p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Decoded question {res.subjectGuess && <span className="ml-2 text-sm font-normal text-subtle">· {res.subjectGuess.short}</span>}</h2>
              <button onClick={() => setZh(!zh)} aria-pressed={zh} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold sunken">{zh ? <EyeOff size={15} /> : <Eye size={15} />}{zh ? "Hide 中文" : "Show 中文"}</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs" aria-label="Highlight legend">
              {[["term", "Academic term"], ["command", "Command verb"], ["connector", "Connector"], ["trap", "Watch this wording"]].map(([k, l]) => <span key={k} className={cn("rounded px-1.5 py-0.5", KIND_STYLE[k])}>{l}</span>)}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[17px] leading-[2]">
              {segments.map((s, i) => s.h ? (
                <button key={i} type="button" onClick={() => setActive(s.h!.entryId ?? null)} className={cn("rounded px-0.5", KIND_STYLE[s.h.kind])} title={s.h.entryId ? termById.get(s.h.entryId)?.zh : undefined}>{s.text}</button>
              ) : <span key={i}>{s.text}</span>)}
            </p>
            {active && termById.get(active) && (() => { const t = termById.get(active)!; return (
              <div className="mt-4 rounded-2xl sunken p-4 text-sm" role="status"><b>{t.term}</b> {zh && <span className="zh text-brand-600 dark:text-brand-300">{t.zh}</span>}<p className="mt-1">{t.definition}</p>{zh && t.zhExplanation && <p className="zh mt-1 text-muted">{t.zhExplanation}</p>}</div>
            ); })()}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="surface rounded-3xl p-5">
              <h3 className="eyebrow">Command verbs · 指令动词</h3>
              {res.commands.length ? res.commands.map((c) => (
                <div key={c.verb} className="mt-3"><p className="font-semibold text-coral-600 dark:text-coral-300">“{c.verb}”</p><p className="text-sm">{c.plan}</p>{zh && <p className="zh mt-1 text-sm text-muted">{c.planZh}</p>}</div>
              )) : <p className="mt-3 text-sm text-muted">No explicit command verb — likely a multiple-choice stem.</p>}
            </div>
            <div className="surface rounded-3xl p-5">
              <h3 className="eyebrow">Skill being tested · 考查能力</h3>
              <ul className="mt-3 space-y-2 text-sm">{res.skills.map((s) => <li key={s.skill} className="flex gap-2"><ListChecks size={16} className="mt-0.5 shrink-0 text-teal-500" /><span>{s.skill}{zh && <span className="zh block text-xs text-subtle">{s.skillZh}</span>}</span></li>)}</ul>
            </div>
            <div className="surface rounded-3xl p-5">
              <h3 className="eyebrow">Wording to watch · 注意措辞</h3>
              {res.traps.length || res.wording.longSentences.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {res.traps.map((t) => <li key={t.note} className="flex gap-2"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-500" /><span>{t.note}{zh && <span className="zh block text-xs text-subtle">{t.noteZh}</span>}</span></li>)}
                  {res.wording.longSentences.length > 0 && <li className="flex gap-2"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold-500" /><span>{res.wording.longSentences.length} long sentence{res.wording.longSentences.length > 1 ? "s" : ""} — split at commas and find the main verb.{zh && <span className="zh block text-xs text-subtle">长句：按逗号拆分，找主谓。</span>}</span></li>}
                </ul>
              ) : <p className="mt-3 text-sm text-muted">No common traps detected.</p>}
            </div>
          </div>

          {res.terms.length > 0 && (
            <div className="surface rounded-3xl p-5">
              <h3 className="eyebrow">Key vocabulary · 关键词汇 ({res.terms.length})</h3>
              <ul className="mt-3 grid gap-2 md:grid-cols-2">{res.terms.map((t) => <li key={t.id} className="rounded-xl sunken px-3 py-2 text-sm"><b>{t.term}</b> {zh && <span className="zh text-brand-600 dark:text-brand-300">{t.zh}</span>} <span className="text-xs text-subtle">· {t.subjectShort}</span><p className="text-muted">{t.definition}</p></li>)}</ul>
            </div>
          )}

          <div className="surface rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Guided explanation · 解题引导</h3>
              <Button size="sm" variant="secondary" onClick={() => setGuided(!guided)}>{guided ? "Hide" : "Show step-by-step plan"}</Button>
            </div>
            {guided && <ol className="mt-4 space-y-4">{res.steps.map((s) => <li key={s.title}><p className="font-semibold">{s.title} {zh && <span className="zh text-sm font-normal text-subtle">{s.titleZh}</span>}</p><p className="mt-1 whitespace-pre-line text-sm">{s.body}</p>{zh && <p className="zh mt-1 whitespace-pre-line text-sm text-muted">{s.bodyZh}</p>}</li>)}</ol>}
          </div>

          <div className="surface rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold"><Bot size={18} className="text-brand-500" /> AI interpretation <span className="text-xs font-normal text-subtle">(optional)</span></h3>
              {res.aiAvailable ? (
                <Button size="sm" variant="secondary" loading={aiBusy} icon={<Sparkles size={15} />} onClick={async () => {
                  setAiBusy(true); setAiErr(null);
                  try { setAi(await api("/api/decoder/ai", { text: decodedText, subject: subjects.find((s) => s.slug === (subject || res.subjectGuess?.slug))?.name })); } catch (e) { setAiErr((e as Error).message); } finally { setAiBusy(false); }
                }}>Explain the wording with AI</Button>
              ) : <span className="text-sm text-subtle">Not configured on this server.</span>}
            </div>
            {aiErr && <div className="mt-3"><ErrorNote>{aiErr}</ErrorNote></div>}
            {ai && <div className="mt-4"><p className="whitespace-pre-wrap text-sm leading-relaxed">{ai.text}</p><p className="mt-3 text-xs text-subtle">{ai.disclaimer}</p></div>}
          </div>

          {practiceQ && (
            <div className="rounded-3xl border-2 border-dashed hairline p-5">
              {attempt ? (
                <PracticePlayer questions={[practiceQ.question]} mode="learn" languageMode={languageMode} title="Decoder practice" backHref="/decoder" />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">Ready? Attempt the question — the answer and explanation appear only after you submit.</p><Button variant="accent" onClick={() => setAttempt(true)}>Attempt this question</Button></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
