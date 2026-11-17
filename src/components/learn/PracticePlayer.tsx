"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Clock, Languages, Lightbulb, X } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { Visual } from "../visuals/Visual";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/Progress";
import { StatusPill, type MasteryStatus } from "../ui/StatusPill";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { useToast } from "../ui/Toast";
import { Celebration, type UnlockedAchievement } from "./Celebration";

export interface Feedback {
  correct: boolean;
  correctOptionId?: string;
  acceptedAnswers?: string[];
  rationales: Record<string, string>;
  explanation: string;
  explanationZh: string;
  rubric?: string[];
  errorType: string | null;
  xp: number;
  nextDueDays: number;
  terms: { id: string; term: string; zh: string; definition: string }[];
  mastery: { termId: string; before: string; after: string; score: number; recognition: number; concept: number; application: number }[];
  achievements: UnlockedAchievement[];
}

type LangMode = "FULL" | "BALANCED" | "EXAM";
const STAGE_LABEL: Record<string, string> = { RECOGNIZE: "Recognize · 识别", UNDERSTAND: "Understand · 理解", APPLY: "Apply · 应用", MASTER: "Master · 精通" };
const SKILL_LABEL: Record<string, string> = { TRANSLATION: "Translation recognition", CONCEPT: "English concept", APPLICATION: "AP application" };
const ERROR_LABEL: Record<string, string> = { TRANSLATION: "Translation error", CONCEPT: "Conceptual misunderstanding", APPLICATION: "Context / application error", CONFUSION: "Confused with a related term" };

function fmtDue(days: number) {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))} min`;
  if (days < 1) return `${Math.round(days * 24)} h`;
  return `${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`;
}

export function PracticePlayer({
  questions, mode, languageMode, englishOnly = false, delayedFeedback = false, timeLimitSec, title, backHref, onFinished, nextHref, nextLabel,
}: {
  questions: PlayableQuestion[];
  mode: "learn" | "review" | "mastery";
  languageMode: LangMode;
  englishOnly?: boolean;
  delayedFeedback?: boolean;
  timeLimitSec?: number;
  title: string;
  backHref: string;
  onFinished?: (results: { q: PlayableQuestion; fb: Feedback; answer: string }[]) => void;
  nextHref?: string;
  nextLabel?: string;
}) {
  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [writtenPhase, setWrittenPhase] = useState<"draft" | "assess">("draft");
  const [checks, setChecks] = useState<boolean[]>([]);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ q: PlayableQuestion; fb: Feedback; answer: string }[]>([]);
  const [celebrate, setCelebrate] = useState<UnlockedAchievement[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec ?? 0);
  const started = useRef(Date.now());
  const toast = useToast();
  const reduce = useReducedMotion();
  const q = questions[i];
  const done = i >= questions.length;

  const fullSupport = languageMode === "FULL" && !englishOnly;
  const canHint = languageMode === "BALANCED" && !englishOnly && !delayedFeedback;
  const showZh = fullSupport || hintOpen;

  useEffect(() => { started.current = Date.now(); }, [i]);
  useEffect(() => {
    if (!timeLimitSec || done) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLimitSec, done]);

  const finish = useCallback((all: typeof results) => {
    onFinished?.(all);
  }, [onFinished]);

  useEffect(() => {
    if (timeLimitSec && timeLeft === 0 && !done && results.length > 0) {
      toast({ title: "Time is up", body: "Unanswered questions were not counted." });
      setI(questions.length);
      finish(results);
    }
  }, [timeLeft, timeLimitSec, done, results, questions.length, toast, finish]);

  const submit = async (opts: { selfScore?: number } = {}) => {
    if (!q || busy) return;
    if (q.kind === "choice" && !choice) return;
    if (q.kind === "cloze" && !text.trim()) return;
    setBusy(true);
    try {
      const res = await api<Feedback>("/api/answer", {
        ref: q.ref, choice: choice ?? undefined, text: q.kind !== "choice" ? text : undefined, selfScore: opts.selfScore,
        usedHint: hintOpen, chineseShown: showZh, responseMs: Date.now() - started.current, mode,
      });
      const answer = q.kind === "choice" ? (q.options?.find((o) => o.id === choice)?.text ?? "") : text;
      const all = [...results, { q, fb: res, answer }];
      setResults(all);
      if (res.achievements.length) setCelebrate((c) => [...c, ...res.achievements]);
      if (delayedFeedback) {
        advance(all);
      } else {
        setFb(res);
        const became = res.mastery.find((m) => m.before !== m.after && m.after === "MASTERED");
        if (became) toast({ title: "Term mastered", body: `${res.terms.find((t) => t.id === became.termId)?.term} reached Mastered in all three dimensions.`, tone: "gold" });
      }
    } catch (e) {
      toast({ title: "Answer not saved", body: (e as Error).message, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  const advance = (all = results) => {
    setFb(null);
    setChoice(null);
    setText("");
    setHintOpen(false);
    setWrittenPhase("draft");
    setChecks([]);
    const next = i + 1;
    setI(next);
    if (next >= questions.length) finish(all);
  };

  // Keyboard: 1–4 choose, Enter submit/continue, H hint
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || (tag === "INPUT" && e.key !== "Enter")) return;
      if (!q || done) return;
      if (fb && e.key === "Enter") { e.preventDefault(); advance(); return; }
      if (!fb && q.kind === "choice" && /^[1-6]$/.test(e.key)) { const o = q.options?.[Number(e.key) - 1]; if (o) setChoice(o.id); }
      if (!fb && e.key === "Enter" && q.kind === "choice" && choice) { e.preventDefault(); void submit(); }
      if (!fb && (e.key === "h" || e.key === "H") && canHint) setHintOpen((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!questions.length) return null;
  if (done) return <Summary results={results} title={title} backHref={backHref} delayed={delayedFeedback} nextHref={nextHref} nextLabel={nextLabel} celebrate={celebrate} onCloseCelebrate={() => setCelebrate([])} />;

  const m = fb?.mastery[0];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <Link href={backHref} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[rgb(var(--bg-sunken))]" aria-label="Exit session"><X size={18} /></Link>
        <ProgressBar value={(i + (fb ? 1 : 0)) / questions.length} label={`Question ${i + 1} of ${questions.length}`} />
        <span className="whitespace-nowrap font-mono text-xs text-subtle">{i + 1}/{questions.length}</span>
        {timeLimitSec ? <span className={cn("flex items-center gap-1 font-mono text-sm font-semibold", timeLeft < 60 && "text-coral-500")} aria-live="polite"><Clock size={15} />{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</span> : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.ref + i} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
          <div className="surface rounded-3xl p-5 shadow-card md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-ink-900 px-2.5 py-0.5 font-semibold text-white dark:bg-ink-100 dark:text-ink-900">{STAGE_LABEL[q.stage] ?? q.stage}</span>
              <span className="text-subtle">{SKILL_LABEL[q.skill]}</span>
              {englishOnly && <span className="rounded-full border hairline px-2 py-0.5 text-subtle">English only</span>}
              {q.isAuthored && <span className="ml-auto text-[11px] text-subtle" title={q.source}>Original practice item</span>}
            </div>

            {q.passage && <blockquote className="mb-4 rounded-2xl border-l-4 border-gold-400 sunken p-4 text-[15px] leading-relaxed">{q.passage}</blockquote>}
            {q.visual ? <div className="mx-auto mb-4 max-w-md"><Visual visual={q.visual as { kind: string }} /></div> : null}
            <h2 className="whitespace-pre-line text-[19px] font-semibold leading-snug md:text-[21px]">{q.prompt}</h2>
            {showZh && q.promptZh && <p className="zh mt-2 text-[15px] text-brand-600 dark:text-brand-300" lang="zh-CN">{q.promptZh}</p>}
            {showZh && q.hintZh && q.hintZh !== q.promptZh && <p className="zh mt-2 rounded-xl bg-brand-50 px-3 py-2 text-[14px] text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" lang="zh-CN">{q.hintZh}</p>}

            {/* CHOICE */}
            {q.kind === "choice" && (
              <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="Answer options">
                {q.options!.map((o, idx) => {
                  const isCorrect = fb && o.id === fb.correctOptionId;
                  const isWrongPick = fb && choice === o.id && !fb.correct;
                  return (
                    <div key={o.id}>
                      <button type="button" role="radio" aria-checked={choice === o.id} disabled={!!fb} onClick={() => setChoice(o.id)}
                        className={cn("flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15.5px] transition-colors",
                          isCorrect ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30" : isWrongPick ? "border-coral-400 bg-coral-50 dark:bg-coral-700/20" : choice === o.id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "border-transparent sunken hover:border-[rgb(var(--line))]")}>
                        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold", isCorrect ? "bg-teal-500 text-white" : isWrongPick ? "bg-coral-400 text-white" : choice === o.id ? "bg-brand-500 text-white" : "bg-[rgb(var(--bg-elev))] text-subtle")}>
                          {isCorrect ? <Check size={15} /> : isWrongPick ? <X size={15} /> : idx + 1}
                        </span>
                        <span className="flex-1">
                          {o.text}
                          {(showZh || fb) && o.textZh && <span className="zh ml-2 text-[13px] text-subtle" lang="zh-CN">{o.textZh}</span>}
                        </span>
                      </button>
                      {fb && fb.rationales[o.id] && (isCorrect || choice === o.id || q.isAuthored) && <p className="ml-12 mt-1.5 text-[13px] leading-snug text-muted">{fb.rationales[o.id]}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CLOZE */}
            {q.kind === "cloze" && (
              <form className="mt-5" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
                <label htmlFor="cloze" className="sr-only">Your answer</label>
                <input id="cloze" autoFocus autoComplete="off" spellCheck={false} disabled={!!fb} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type the English term…"
                  className={cn("h-14 w-full rounded-2xl border-2 bg-[rgb(var(--bg-elev))] px-4 text-lg outline-none focus:border-brand-500", fb ? (fb.correct ? "border-teal-500" : "border-coral-400") : "hairline")} />
                {fb && !fb.correct && fb.acceptedAnswers && <p className="mt-2 text-sm">Accepted answer: <span className="font-semibold">{fb.acceptedAnswers[0]}</span></p>}
              </form>
            )}

            {/* WRITTEN — rubric-based self-assessment, never auto-graded */}
            {q.kind === "written" && (
              <div className="mt-5">
                <label htmlFor="written" className="mb-1.5 block text-sm font-semibold">Your response (English)</label>
                <textarea id="written" rows={6} disabled={writtenPhase === "assess" || !!fb} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-2xl border hairline bg-[rgb(var(--bg-elev))] p-4 text-[15px] leading-relaxed outline-none focus:border-brand-500" placeholder="Write 2–4 sentences…" />
                <p className="mt-1 text-xs text-subtle">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
                {writtenPhase === "assess" && !fb && (
                  <div className="mt-4 rounded-2xl sunken p-4">
                    <p className="text-sm font-semibold">Check your response against the rubric</p>
                    <p className="mt-1 text-xs text-subtle">Self-assessment is a learning tool, not AP-level grading. Be honest — it only changes what you review next.</p>
                    <ul className="mt-3 space-y-2">
                      {(q.rubric ?? []).map((r, k) => (
                        <li key={k}>
                          <label className="flex cursor-pointer items-start gap-3 text-[14px]">
                            <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-500" checked={!!checks[k]} onChange={(e) => { const c = [...checks]; c[k] = e.target.checked; setChecks(c); }} />
                            {r}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {!fb && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {q.kind === "written" ? (
                  writtenPhase === "draft" ? (
                    <Button variant="accent" onClick={() => setWrittenPhase("assess")} disabled={text.trim().split(/\s+/).length < 5}>Done writing — self-check</Button>
                  ) : (
                    <Button variant="accent" loading={busy} onClick={() => submit({ selfScore: (q.rubric?.length ? checks.filter(Boolean).length / q.rubric.length : 0) })}>Save self-assessment</Button>
                  )
                ) : (
                  <Button variant="accent" loading={busy} onClick={() => submit()} disabled={q.kind === "choice" ? !choice : !text.trim()}>{delayedFeedback ? "Submit & next" : "Check answer"}</Button>
                )}
                {canHint && (q.hintZh || q.promptZh || q.options?.some((o) => o.textZh)) && (
                  <button type="button" onClick={() => setHintOpen(!hintOpen)} aria-pressed={hintOpen} className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold", hintOpen ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "text-muted hover:bg-[rgb(var(--bg-sunken))]")}>
                    <Languages size={16} /> {hintOpen ? "Hide Chinese" : "Show Chinese hint"} <span className="kbd ml-1 hidden sm:inline-flex">H</span>
                  </button>
                )}
                <span className="ml-auto hidden text-xs text-subtle sm:block">{q.kind === "choice" ? <>Keys <span className="kbd">1</span>–<span className="kbd">{q.options?.length}</span> · <span className="kbd">Enter</span></> : null}</span>
              </div>
            )}
          </div>

          {/* Immediate feedback */}
          {fb && (
            <motion.section initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-4 rounded-3xl p-5 md:p-6", fb.correct ? "bg-teal-50 dark:bg-teal-900/25" : "bg-coral-50 dark:bg-coral-700/15")} aria-live="polite">
              <div className="flex flex-wrap items-center gap-3">
                <motion.span initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className={cn("grid h-10 w-10 place-items-center rounded-full text-white", fb.correct ? "bg-teal-500" : "bg-coral-400")}>{fb.correct ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}</motion.span>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{q.kind === "written" ? "Self-assessment saved" : fb.correct ? "Correct" : "Not quite"}</div>
                  {!fb.correct && fb.errorType && <div className="text-sm text-muted">{ERROR_LABEL[fb.errorType]}</div>}
                </div>
                {fb.xp > 0 && <span className="rounded-full bg-gold-400 px-3 py-1 text-sm font-bold text-ink-900">+{fb.xp} XP</span>}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[rgb(var(--bg-elev))] p-4">
                  <div className="eyebrow mb-1"><Lightbulb size={12} className="mr-1 inline" />Why</div>
                  <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{fb.explanation}</p>
                </div>
                <div className="rounded-2xl bg-[rgb(var(--bg-elev))] p-4" lang="zh-CN">
                  <div className="eyebrow mb-1">中文解析</div>
                  <p className="zh whitespace-pre-line text-[14.5px] leading-relaxed">{fb.explanationZh || fb.terms.map((t) => `${t.term} = ${t.zh}`).join("；")}</p>
                </div>
              </div>
              {m && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="font-semibold">{fb.terms.find((t) => t.id === m.termId)?.term}</span>
                  <StatusPill status={m.after as MasteryStatus} />
                  {(["recognition", "concept", "application"] as const).map((k) => (
                    <span key={k} className="flex items-center gap-1.5 text-xs text-muted">{k}<span className="h-1.5 w-14 overflow-hidden rounded-full bg-[rgb(var(--line))]"><span className={cn("block h-full", k === "recognition" ? "bg-[var(--dim-rec)]" : k === "concept" ? "bg-[var(--dim-con)]" : "bg-[var(--dim-app)]")} style={{ width: `${m[k] * 100}%` }} /></span></span>
                  ))}
                  <span className="text-xs text-subtle">Next review in {fmtDue(fb.nextDueDays)}</span>
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <Button onClick={() => advance()} autoFocus>{i + 1 < questions.length ? "Continue" : "See results"} <ChevronRight size={16} /></Button>
              </div>
            </motion.section>
          )}
        </motion.div>
      </AnimatePresence>
      <Celebration items={celebrate} onClose={() => setCelebrate([])} />
    </div>
  );
}

function Summary({ results, title, backHref, delayed, nextHref, nextLabel, celebrate, onCloseCelebrate }: { results: { q: PlayableQuestion; fb: Feedback; answer: string }[]; title: string; backHref: string; delayed: boolean; nextHref?: string; nextLabel?: string; celebrate: UnlockedAchievement[]; onCloseCelebrate: () => void }) {
  const correct = results.filter((r) => r.fb.correct).length;
  const xp = results.reduce((a, r) => a + r.fb.xp, 0);
  const changes = useMemo(() => {
    const map = new Map<string, { term: string; zh: string; before: string; after: string }>();
    for (const r of results) for (const mm of r.fb.mastery) {
      const t = r.fb.terms.find((x) => x.id === mm.termId);
      const prev = map.get(mm.termId);
      map.set(mm.termId, { term: t?.term ?? "", zh: t?.zh ?? "", before: prev?.before ?? mm.before, after: mm.after });
    }
    return [...map.values()];
  }, [results]);
  const pct = results.length ? correct / results.length : 0;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="surface overflow-hidden rounded-3xl shadow-lift">
        <div className="bg-ink-900 p-7 text-white">
          <p className="eyebrow text-ink-300">Session complete · 本轮完成</p>
          <h1 className="display mt-2 text-3xl font-semibold">{title}</h1>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div><div className="text-3xl font-bold">{correct}/{results.length}</div><div className="text-sm text-ink-300">correct</div></div>
            <div><div className="text-3xl font-bold text-gold-300">+{xp}</div><div className="text-sm text-ink-300">XP earned</div></div>
            <div><div className="text-3xl font-bold">{Math.round(pct * 100)}%</div><div className="text-sm text-ink-300">accuracy</div></div>
          </div>
        </div>
        <div className="p-6">
          <h2 className="eyebrow">Mastery updates</h2>
          <ul className="mt-3 divide-y hairline">
            {changes.map((c) => (
              <li key={c.term} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold">{c.term} <span className="zh font-normal text-subtle">{c.zh}</span></span>
                {c.before !== c.after && <><StatusPill status={c.before as MasteryStatus} /><ChevronRight size={14} className="text-subtle" /></>}
                <StatusPill status={c.after as MasteryStatus} />
              </li>
            ))}
          </ul>
          {delayed && (
            <>
              <h2 className="eyebrow mt-8">Review your answers</h2>
              <ol className="mt-3 space-y-3">
                {results.map((r, k) => (
                  <li key={k} className={cn("rounded-2xl border-l-4 p-4 sunken", r.fb.correct ? "border-teal-500" : "border-coral-400")}>
                    <p className="text-sm font-semibold">{k + 1}. {r.q.prompt}</p>
                    <p className="mt-1 text-sm">Your answer: <span className={r.fb.correct ? "text-teal-600" : "text-coral-500"}>{r.answer || "—"}</span></p>
                    {!r.fb.correct && r.fb.correctOptionId && <p className="text-sm">Correct: <span className="font-semibold">{r.q.options?.find((o) => o.id === r.fb.correctOptionId)?.text}</span></p>}
                    {!r.fb.correct && r.fb.acceptedAnswers && <p className="text-sm">Correct: <span className="font-semibold">{r.fb.acceptedAnswers[0]}</span></p>}
                    <p className="mt-2 whitespace-pre-line text-[13px] text-muted">{r.fb.explanation}</p>
                    {r.fb.explanationZh && <p className="zh mt-1 text-[13px] text-subtle" lang="zh-CN">{r.fb.explanationZh}</p>}
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={backHref} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink-900 px-5 font-semibold text-white dark:bg-brand-500">Return to map</Link>
            {nextHref && <Link href={nextHref} className="surface inline-flex h-11 items-center gap-2 rounded-xl px-5 font-semibold">{nextLabel ?? "Next"} <ChevronRight size={16} /></Link>}
          </div>
        </div>
      </div>
      <Celebration items={celebrate} onClose={onCloseCelebrate} />
    </div>
  );
}
