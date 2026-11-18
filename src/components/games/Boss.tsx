"use client";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { Visual } from "../visuals/Visual";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { GameHeader, GameOver, StartCard, loadGame, submitAnswer, type AnswerResult } from "./shared";
import { dedupe } from "./Lightning";

const HEARTS = 3;

/** Boss Battle: AP-style questions; each correct answer damages the boss, each wrong answer costs a heart. */
export function Boss({ subject }: { subject: { slug: string; name: string } }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [qs, setQs] = useState<PlayableQuestion[]>([]);
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [choice, setChoice] = useState<string | null>(null);
  const [res, setRes] = useState<AnswerResult | null>(null);
  const [hit, setHit] = useState(false);
  const [missed, setMissed] = useState<AnswerResult["terms"]>([]);
  const [xp, setXp] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t0 = useRef(Date.now());

  const start = async () => {
    setBusy(true); setError(null);
    try { const r = await loadGame("boss", subject.slug); setQs(r.questions); setHp(r.questions.length); setHearts(HEARTS); setI(0); setChoice(null); setRes(null); setMissed([]); setXp(0); setPhase("play"); t0.current = Date.now(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const q = qs[i];
  const maxHp = qs.length || 1;
  const attack = async () => {
    if (!q || !choice || busy || res) return;
    setBusy(true);
    try {
      const r = await submitAnswer(q, { choice, responseMs: Date.now() - t0.current });
      setRes(r); setXp((x) => x + r.xp);
      if (r.correct) { setHp((h) => h - 1); setHit(true); setTimeout(() => setHit(false), 450); }
      else { setHearts((h) => h - 1); setMissed((m) => [...m, ...r.terms]); }
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const next = () => {
    if (hearts <= 0 || hp <= 0 || i + 1 >= qs.length) { setPhase("over"); return; }
    setI(i + 1); setChoice(null); setRes(null); t0.current = Date.now();
  };

  if (phase === "ready") return <><GameHeader title="Boss Battle" subject={subject} /><StartCard title="Boss Battle" zh="首领对决" lines={["The boss has one health bar segment per question", "Correct answer = hit the boss; wrong answer = lose a heart", "3 hearts. AP-style questions, English only", "Explanations appear after each answer"]} onStart={start} busy={busy} error={error} /></>;
  if (phase === "over") {
    const won = hp <= 0;
    return <><GameHeader title="Boss Battle" subject={subject} /><GameOver game="boss" subject={subject} score={maxHp - hp} unit={`/ ${maxHp} hits`} headline={won ? "Boss defeated! 🏆" : hearts <= 0 ? "Defeated — try again" : "Battle over"} missed={dedupe(missed)} xp={xp} onReplay={start} /></>;
  }
  if (!q) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <GameHeader title="Boss Battle" subject={subject}>
        <span className="flex gap-0.5" aria-label={`${hearts} hearts left`}>{Array.from({ length: HEARTS }).map((_, k) => <Heart key={k} size={20} className={k < hearts ? "fill-coral-400 text-coral-400" : "text-[rgb(var(--line))]"} />)}</span>
      </GameHeader>
      <div className="flex items-center gap-4 rounded-3xl bg-ink-900 p-4 text-white">
        <motion.svg viewBox="0 0 64 64" width="64" height="64" aria-hidden animate={hit && !reduce ? { x: [0, -6, 6, -3, 0], rotate: [0, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
          <path d="M32 4 L56 16 V34 C56 48 45 57 32 60 C19 57 8 48 8 34 V16 Z" fill={hit ? "#FF6B5A" : "#F5B83D"} />
          <circle cx="24" cy="30" r="4" fill="#0B1530" /><circle cx="40" cy="30" r="4" fill="#0B1530" /><path d="M22 44 Q32 38 42 44" stroke="#0B1530" strokeWidth="3" fill="none" strokeLinecap="round" />
        </motion.svg>
        <div className="flex-1">
          <p className="text-sm font-semibold">The {subject.name} Examiner</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15" role="meter" aria-label="Boss health" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={maxHp}>
            <div className="h-full rounded-full bg-gradient-to-r from-coral-400 to-gold-400 transition-[width] duration-500" style={{ width: `${(hp / maxHp) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink-300">{hp} / {maxHp} HP · question {i + 1}</p>
        </div>
      </div>
      <div className="surface mt-4 rounded-3xl p-6 shadow-card">
        {q.passage && <blockquote className="mb-3 rounded-2xl border-l-4 border-gold-400 sunken p-3 text-sm">{q.passage}</blockquote>}
        {q.visual ? <div className="mx-auto mb-3 max-w-sm"><Visual visual={q.visual as { kind: string }} /></div> : null}
        <p className="whitespace-pre-line text-lg font-semibold leading-snug">{q.prompt}</p>
        <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Answer options">
          {q.options?.map((o) => {
            const right = res && o.id === res.correctOptionId;
            const wrong = res && o.id === choice && !res.correct;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={choice === o.id} disabled={!!res} onClick={() => setChoice(o.id)}
                className={cn("rounded-2xl border-2 px-4 py-3 text-left text-[15px]", right ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30" : wrong ? "border-coral-400 bg-coral-50 dark:bg-coral-700/20" : choice === o.id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "border-transparent sunken")}>
                {o.text}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          {!res ? <Button variant="accent" onClick={attack} loading={busy} disabled={!choice}>Attack ⚔️</Button> : <Button onClick={next} autoFocus>{hearts <= 0 || hp <= 0 || i + 1 >= qs.length ? "See result" : "Next"}</Button>}
        </div>
        {res && !res.correct && res.terms[0] && <p className="mt-3 text-sm text-muted"><b>{res.terms[0].term}</b> <span className="zh">{res.terms[0].zh}</span> — {res.terms[0].definition}</p>}
      </div>
    </div>
  );
}
