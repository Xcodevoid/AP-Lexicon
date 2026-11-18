"use client";
import { useRef, useState } from "react";
import { Check, Volume2, X } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/Progress";
import { cn } from "../ui/cn";
import { GameHeader, GameOver, StartCard, loadGame, submitAnswer, type AnswerResult } from "./shared";
import { dedupe } from "./Lightning";

export function SpellIt({ subject }: { subject: { slug: string; name: string } }) {
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [qs, setQs] = useState<PlayableQuestion[]>([]);
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [heard, setHeard] = useState(false);
  const [res, setRes] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<AnswerResult["terms"]>([]);
  const [xp, setXp] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t0 = useRef(Date.now());
  const input = useRef<HTMLInputElement>(null);

  const start = async () => {
    setBusy(true); setError(null);
    try { const r = await loadGame("spell", subject.slug); setQs(r.questions); setI(0); setScore(0); setMissed([]); setXp(0); setText(""); setRes(null); setHeard(false); setPhase("play"); t0.current = Date.now(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const q = qs[i];
  const [definition, pattern] = (q?.prompt ?? "").split("\n\n");
  // "Hear it" speaks the word — a real hint, so it halves the points for this word.
  const hear = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(word); u.lang = "en-US"; u.rate = 0.85;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); setHeard(true);
  };
  const submit = async () => {
    if (!q || !text.trim() || busy || res) return;
    setBusy(true);
    try {
      const r = await submitAnswer(q, { text, usedHint: heard, responseMs: Date.now() - t0.current });
      setRes(r); setXp((x) => x + r.xp);
      if (r.correct) setScore((s) => s + (heard ? 1 : 2)); else setMissed((m) => [...m, ...r.terms]);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const next = () => {
    if (i + 1 >= qs.length) { setPhase("over"); return; }
    setI(i + 1); setText(""); setRes(null); setHeard(false); t0.current = Date.now(); setTimeout(() => input.current?.focus(), 50);
  };

  if (phase === "ready") return <><GameHeader title="Spell It" subject={subject} /><StartCard title="Spell It" zh="拼写挑战" lines={["10 words from this course", "Read the English definition and type the word", "You see the first letter and the length", "2 points per word — 1 if you use “Hear it”"]} onStart={start} busy={busy} error={error} /></>;
  if (phase === "over") return <><GameHeader title="Spell It" subject={subject} /><GameOver game="spell" subject={subject} score={score} unit={`/ ${qs.length * 2}`} headline="Spelling complete" missed={dedupe(missed)} xp={xp} onReplay={start} /></>;
  if (!q) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <GameHeader title="Spell It" subject={subject}><span className="font-mono text-sm">{i + 1}/{qs.length} · {score} pts</span></GameHeader>
      <ProgressBar value={(i + (res ? 1 : 0)) / qs.length} label="Progress" />
      <div className="surface mt-5 rounded-3xl p-6 shadow-card">
        <p className="eyebrow">Type the English word</p>
        <p className="mt-2 text-xl font-semibold leading-snug">{definition}</p>
        <p className="mt-4 font-mono text-2xl tracking-wider text-brand-600 dark:text-brand-300" aria-label="Letter pattern">{pattern}</p>
        <form className="mt-5 flex gap-2" onSubmit={(e) => { e.preventDefault(); res ? next() : void submit(); }}>
          <label htmlFor="spell" className="sr-only">Your spelling</label>
          <input id="spell" ref={input} autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={!!res} value={text} onChange={(e) => setText(e.target.value)}
            className={cn("h-14 flex-1 rounded-2xl border-2 bg-[rgb(var(--bg-elev))] px-4 text-lg outline-none focus:border-brand-500", res ? (res.correct ? "border-teal-500" : "border-coral-400") : "hairline")} />
          {!res ? <Button type="submit" variant="accent" size="lg" loading={busy} disabled={!text.trim()}>Check</Button> : <Button type="submit" size="lg" autoFocus>{i + 1 < qs.length ? "Next" : "Finish"}</Button>}
        </form>
        {res && (
          <div className={cn("mt-4 flex items-center gap-3 rounded-2xl p-4", res.correct ? "bg-teal-50 dark:bg-teal-900/25" : "bg-coral-50 dark:bg-coral-700/15")} aria-live="polite">
            {res.correct ? <Check className="text-teal-600" /> : <X className="text-coral-500" />}
            <div className="flex-1"><b>{res.terms[0]?.term}</b> <span className="zh text-subtle">{res.terms[0]?.zh}</span></div>
            <button type="button" onClick={() => hear(res.terms[0]?.term ?? "")} className="grid h-9 w-9 place-items-center rounded-xl sunken" aria-label="Hear the word"><Volume2 size={16} /></button>
          </div>
        )}
        {!res && <SpeakHint onHeard={() => setHeard(true)} qRef={q.ref} heard={heard} />}
      </div>
    </div>
  );
}

/** Speaks the hidden word on request (counts as a hint, so the word scores half points). */
function SpeakHint({ qRef, onHeard, heard }: { qRef: string; onHeard: () => void; heard: boolean }) {
  const [busy, setBusy] = useState(false);
  const speak = async () => {
    if (!("speechSynthesis" in window)) return;
    setBusy(true);
    try {
      const termId = qRef.split(":")[2];
      const r = await fetch(`/api/games/pronounce?termId=${encodeURIComponent(termId)}`);
      const { term } = await r.json();
      const u = new SpeechSynthesisUtterance(term); u.lang = "en-US"; u.rate = 0.85;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); onHeard();
    } finally { setBusy(false); }
  };
  return (
    <button type="button" onClick={speak} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-[rgb(var(--bg-sunken))]">
      <Volume2 size={16} /> {heard ? "Hear it again" : "Hear it (half points)"}
    </button>
  );
}
