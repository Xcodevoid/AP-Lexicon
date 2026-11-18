"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Timer } from "lucide-react";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { GameHeader, GameOver, StartCard } from "./shared";

type Pair = { slug: string; a: string; b: string; aZh: string; bZh: string; keyDifference: string; scenarios: string[] };
type Card = { pair: Pair; index: number; text: string };
const LIMIT = 75;

/** Sort It: scenarios from up to 3 Confusion Lab pairs; each answer is graded and logged as concept evidence. */
export function SortIt({ subject, pairs, showZh }: { subject: { slug: string; name: string }; pairs: Pair[]; showZh: boolean }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [cards, setCards] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [time, setTime] = useState(LIMIT);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; why: string } | null>(null);
  const [missed, setMissed] = useState<{ term: string; zh: string; definition: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const t0 = useRef(Date.now());

  const start = () => {
    const chosen = [...pairs].sort(() => Math.random() - 0.5).slice(0, 3);
    const deck = chosen.flatMap((p) => p.scenarios.map((text, index) => ({ pair: p, index, text }))).sort(() => Math.random() - 0.5);
    setCards(deck); setI(0); setTime(LIMIT); setScore(0); setMissed([]); setFlash(null); setPhase("play"); t0.current = Date.now();
  };
  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setTime((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => { if (phase === "play" && (time === 0 || i >= cards.length)) setPhase("over"); }, [time, i, cards.length, phase]);

  const choose = async (side: "A" | "B") => {
    const c = cards[i];
    if (!c || busy || flash) return;
    setBusy(true);
    try {
      const r = await api<{ correct: boolean; answer: "A" | "B"; why: string }>(`/api/lab/${c.pair.slug}/answer`, { index: c.index, answer: side, responseMs: Date.now() - t0.current });
      if (r.correct) setScore((s) => s + 1);
      else setMissed((m) => [...m, { term: r.answer === "A" ? c.pair.a : c.pair.b, zh: r.answer === "A" ? c.pair.aZh : c.pair.bZh, definition: `${c.text} — ${r.why}` }]);
      setFlash({ ok: r.correct, why: r.why });
      setTimeout(() => { setFlash(null); setI((n) => n + 1); t0.current = Date.now(); }, r.correct ? 350 : 1400);
    } finally { setBusy(false); }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (phase !== "play") return; if (e.key === "ArrowLeft") void choose("A"); if (e.key === "ArrowRight") void choose("B"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!pairs.length) return <><GameHeader title="Sort It" subject={subject} /><p className="text-center text-muted">This course has no comparison pairs yet. Try another course.</p></>;
  if (phase === "ready") return <><GameHeader title="Sort It" subject={subject} /><StartCard title="Sort It" zh="快速分类" lines={[`${LIMIT} seconds, scenarios from up to 3 look-alike pairs`, "Send each scenario to the concept it describes", "Tap a side, or use ← and → keys", "Each answer counts as concept practice"]} onStart={start} /></>;
  if (phase === "over") return <><GameHeader title="Sort It" subject={subject} /><GameOver game="sort" subject={subject} score={score} unit={`/ ${cards.length}`} headline={i >= cards.length ? "All sorted!" : "Time!"} missed={missed} xp={Math.min(30, score * 2)} onReplay={start} /></>;
  const c = cards[i];
  if (!c) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <GameHeader title="Sort It" subject={subject}>
        <span className="font-mono text-lg font-bold">{score}</span>
        <span className={cn("flex items-center gap-1 font-mono text-lg font-bold", time <= 10 && "text-coral-500")} aria-live="polite"><Timer size={18} />{time}s</span>
      </GameHeader>
      <p className="text-center text-sm text-muted">{i + 1} / {cards.length}</p>
      <motion.div key={`${c.pair.slug}-${c.index}`} initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn("surface mx-auto mt-3 min-h-[150px] rounded-3xl p-6 text-center shadow-lift", flash && (flash.ok ? "ring-4 ring-teal-400" : "ring-4 ring-coral-400"))}>
        <p className="text-xl font-semibold leading-snug">{c.text}</p>
        {flash && !flash.ok && <p className="mt-3 text-sm text-coral-600 dark:text-coral-300">{flash.why}</p>}
      </motion.div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((side) => (
          <button key={side} type="button" onClick={() => choose(side)} disabled={!!flash}
            className={cn("rounded-2xl p-5 text-center font-semibold text-white shadow-card transition-transform active:scale-[.98]", side === "A" ? "bg-brand-500" : "bg-teal-600")}>
            <span className="block text-xs opacity-80">{side === "A" ? "← " : ""}{side === "A" ? "Left" : "Right"}{side === "B" ? " →" : ""}</span>
            {side === "A" ? c.pair.a : c.pair.b}
            {showZh && <span className="zh block text-sm font-normal opacity-80">{side === "A" ? c.pair.aZh : c.pair.bZh}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
