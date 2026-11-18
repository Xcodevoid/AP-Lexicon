"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Timer, Zap } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { cn } from "../ui/cn";
import { GameHeader, GameOver, StartCard, loadGame, submitAnswer, type AnswerResult } from "./shared";

const LIMIT = 60;

export function Lightning({ subject }: { subject: { slug: string; name: string } }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [qs, setQs] = useState<PlayableQuestion[]>([]);
  const [i, setI] = useState(0);
  const [time, setTime] = useState(LIMIT);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<{ id: string; ok: boolean; correctId?: string } | null>(null);
  const [missed, setMissed] = useState<AnswerResult["terms"]>([]);
  const [xp, setXp] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t0 = useRef(Date.now());

  const start = async () => {
    setBusy(true); setError(null);
    try {
      const r = await loadGame("lightning", subject.slug);
      setQs(r.questions); setI(0); setTime(LIMIT); setScore(0); setCombo(0); setMissed([]); setXp(0); setPhase("play"); t0.current = Date.now();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setTime((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => { if (phase === "play" && (time === 0 || i >= qs.length)) setPhase("over"); }, [time, i, qs.length, phase]);

  const pick = async (optId: string) => {
    const q = qs[i];
    if (!q || flash || busy) return;
    setBusy(true);
    try {
      const r = await submitAnswer(q, { choice: optId, responseMs: Date.now() - t0.current });
      setXp((x) => x + r.xp);
      if (r.correct) { const c = combo + 1; setCombo(c); setScore((s) => s + (c >= 5 ? 3 : c >= 3 ? 2 : 1)); }
      else { setCombo(0); setMissed((m) => [...m, ...r.terms]); }
      setFlash({ id: optId, ok: r.correct, correctId: r.correctOptionId });
      setTimeout(() => { setFlash(null); setI((n) => n + 1); t0.current = Date.now(); }, r.correct ? 220 : 650);
    } catch { setI((n) => n + 1); } finally { setBusy(false); }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (phase === "play" && /^[1-4]$/.test(e.key)) { const o = qs[i]?.options?.[Number(e.key) - 1]; if (o) void pick(o.id); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "ready") return <><GameHeader title="Lightning Round" subject={subject} /><StartCard title="Lightning Round" zh="闪电挑战" lines={["60 seconds on the clock", "Read the English definition, choose the word (keys 1–4 work)", "3 in a row = double points, 5 in a row = triple", "English only — no Chinese hints"]} onStart={start} busy={busy} error={error} /></>;
  if (phase === "over") return <><GameHeader title="Lightning Round" subject={subject} /><GameOver game="lightning" subject={subject} score={score} unit="points" headline="Time!" missed={dedupe(missed)} xp={xp} onReplay={start} /></>;
  const q = qs[i];
  if (!q) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <GameHeader title="Lightning Round" subject={subject}>
        {combo >= 3 && <span className="flex items-center gap-1 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-bold text-ink-900"><Zap size={13} />×{combo >= 5 ? 3 : 2}</span>}
        <span className="font-mono text-lg font-bold">{score}</span>
        <span className={cn("flex items-center gap-1 font-mono text-lg font-bold", time <= 10 && "text-coral-500")} aria-live="polite"><Timer size={18} />{time}s</span>
      </GameHeader>
      <div className="h-1.5 overflow-hidden rounded-full sunken"><div className="h-full bg-brand-500 transition-[width] duration-1000 ease-linear" style={{ width: `${(time / LIMIT) * 100}%` }} /></div>
      <motion.div key={q.ref} initial={reduce ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="surface mt-5 rounded-3xl p-6 shadow-card">
        <p className="eyebrow">Which word fits this definition?</p>
        <p className="mt-2 text-xl font-semibold leading-snug">{q.prompt.replace(/^Which term fits this definition\?\n/, "").replace(/^“|”$/g, "")}</p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {q.options!.map((o, k) => (
            <button key={o.id} type="button" onClick={() => pick(o.id)} disabled={!!flash}
              className={cn("rounded-2xl border-2 px-4 py-4 text-left text-[16px] font-semibold transition-colors",
                flash && o.id === flash.correctId ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30" : flash && o.id === flash.id && !flash.ok ? "border-coral-400 bg-coral-50 dark:bg-coral-700/20" : "border-transparent sunken hover:border-brand-300")}>
              <span className="mr-2 font-mono text-xs text-subtle">{k + 1}</span>{o.text}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function dedupe<T extends { term: string }>(xs: T[]) { return xs.filter((x, i) => xs.findIndex((y) => y.term === x.term) === i); }
