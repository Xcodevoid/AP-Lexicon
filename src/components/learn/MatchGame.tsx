"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Timer, Trophy } from "lucide-react";
import { Button } from "../ui/Button";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { useToast } from "../ui/Toast";
import { Celebration, type UnlockedAchievement } from "./Celebration";

type T = { id: string; term: string; zh: string };
const ROUND = 6;
const LIMIT = 60;

function shuffle<A>(a: A[]) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

/** Timed matching: pick an English term, then its Chinese meaning. Every pair is logged on the server. */
export function MatchGame({ terms, subjectSlug, onExit }: { terms: T[]; subjectSlug: string; onExit: () => void }) {
  const toast = useToast();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "play" | "done">("ready");
  const [deck, setDeck] = useState<T[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [left, setLeft] = useState<T[]>([]);
  const [right, setRight] = useState<T[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [time, setTime] = useState(LIMIT);
  const [result, setResult] = useState<{ score: number; total: number; isBest: boolean; previousBest: number; xp: number } | null>(null);
  const [ach, setAch] = useState<UnlockedAchievement[]>([]);
  const log = useRef<{ termId: string; zhTermId: string; responseMs: number }[]>([]);
  const lastT = useRef(Date.now());
  const startT = useRef(Date.now());

  const pool = useMemo(() => terms.filter((t, i, a) => a.findIndex((x) => x.zh === t.zh) === i), [terms]);

  const dealRound = (d: T[], r: number) => {
    const slice = d.slice(r * ROUND, r * ROUND + ROUND);
    setLeft(shuffle(slice));
    setRight(shuffle(slice));
    setMatched(new Set());
    setPick(null);
  };
  const start = () => {
    const d = shuffle(pool).slice(0, Math.min(pool.length, 18));
    setDeck(d);
    setRoundIdx(0);
    dealRound(d, 0);
    log.current = [];
    setTime(LIMIT);
    startT.current = lastT.current = Date.now();
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const finish = async () => {
    setPhase("done");
    if (!log.current.length) { setResult({ score: 0, total: 0, isBest: false, previousBest: 0, xp: 0 }); return; }
    try {
      const r = await api<{ score: number; total: number; isBest: boolean; previousBest: number; xp: number; achievements: UnlockedAchievement[] }>("/api/match", { subjectSlug, pairs: log.current, durationMs: Date.now() - startT.current });
      setResult(r);
      if (r.achievements.length) setAch(r.achievements);
    } catch (e) {
      toast({ title: "Result not saved", body: (e as Error).message, tone: "error" });
    }
  };
  useEffect(() => { if (phase === "play" && time <= 0) void finish(); }); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseZh = (t: T) => {
    if (!pick || matched.has(t.id)) return;
    const now = Date.now();
    log.current.push({ termId: pick, zhTermId: t.id, responseMs: now - lastT.current });
    lastT.current = now;
    if (pick === t.id) {
      const m = new Set(matched).add(t.id);
      setMatched(m);
      setPick(null);
      if (m.size === left.length) {
        const next = roundIdx + 1;
        if (next * ROUND < deck.length) { setRoundIdx(next); setTimeout(() => dealRound(deck, next), reduce ? 0 : 250); }
        else void finish();
      }
    } else {
      setWrong(t.id);
      setTimeout(() => setWrong(null), 450);
      setPick(null);
    }
  };

  if (pool.length < 3) return <p className="text-muted">This mission needs at least 3 terms with distinct Chinese meanings for a match round.</p>;

  if (phase === "ready")
    return (
      <div className="surface mx-auto max-w-xl rounded-3xl p-8 text-center shadow-card">
        <Timer className="mx-auto text-brand-500" size={32} />
        <h2 className="display mt-3 text-2xl font-semibold">Timed match · 限时配对</h2>
        <p className="mt-2 text-muted">{LIMIT} seconds. Choose an English term, then its Chinese meaning. Each match counts as translation-recognition evidence; personal bests are saved per subject.</p>
        <div className="mt-6 flex justify-center gap-3"><Button variant="ghost" onClick={onExit}>Back</Button><Button variant="accent" onClick={start}>Start</Button></div>
      </div>
    );

  if (phase === "done")
    return (
      <div className="surface mx-auto max-w-xl rounded-3xl p-8 text-center shadow-card" aria-live="polite">
        <Trophy className="mx-auto text-gold-400" size={34} />
        <h2 className="display mt-3 text-2xl font-semibold">{result ? `${result.score} correct matches` : "Saving…"}</h2>
        {result && <p className="mt-2 text-muted">{result.isBest && result.score > 0 ? `New personal best! (previous: ${result.previousBest})` : `Personal best: ${result.previousBest}`} · +{result.xp} XP</p>}
        <div className="mt-6 flex justify-center gap-3"><Button variant="ghost" onClick={onExit}>Done</Button><Button variant="accent" onClick={start}>Play again</Button></div>
        <Celebration items={ach} onClose={() => setAch([])} />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-sm text-subtle">Round {roundIdx + 1} / {Math.ceil(deck.length / ROUND)}</span>
        <span className={cn("flex items-center gap-1 font-mono text-lg font-bold", time <= 10 && "text-coral-500")} aria-live="polite"><Timer size={18} />{Math.max(0, time)}s</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ul className="space-y-2" aria-label="English terms">
          {left.map((t) => (
            <li key={t.id}>
              <button type="button" disabled={matched.has(t.id)} onClick={() => setPick(t.id)} aria-pressed={pick === t.id}
                className={cn("min-h-[56px] w-full rounded-2xl border-2 px-3 py-2 text-left text-[15px] font-semibold transition-all", matched.has(t.id) ? "border-transparent bg-teal-50 text-teal-700 opacity-60 dark:bg-teal-900/30 dark:text-teal-200" : pick === t.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "hairline surface hover:border-brand-300")}>
                {t.term}
              </button>
            </li>
          ))}
        </ul>
        <ul className="space-y-2" aria-label="Chinese meanings">
          {right.map((t) => (
            <li key={t.id}>
              <motion.button type="button" disabled={matched.has(t.id)} onClick={() => chooseZh(t)} animate={wrong === t.id && !reduce ? { x: [0, -8, 8, -4, 0] } : {}} transition={{ duration: 0.35 }}
                className={cn("zh min-h-[56px] w-full rounded-2xl border-2 px-3 py-2 text-left text-[16px] transition-colors", matched.has(t.id) ? "border-transparent bg-teal-50 text-teal-700 opacity-60 dark:bg-teal-900/30 dark:text-teal-200" : wrong === t.id ? "border-coral-400 bg-coral-50 dark:bg-coral-700/20" : "hairline surface hover:border-brand-300", !pick && !matched.has(t.id) && "opacity-80")}
                lang="zh-CN">
                {t.zh}
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 text-center"><Button variant="ghost" size="sm" onClick={() => void finish()}>End round</Button></div>
    </div>
  );
}
