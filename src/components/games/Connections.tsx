"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { Button } from "../ui/Button";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { GameHeader, GameOver, StartCard } from "./shared";

type Tile = { id: string; term: string; zh: string };
type Group = { label: string; labelZh: string; ids: string[] };
const COLORS = ["#F5B83D", "#2CC6AF", "#5C86FF", "#C24FA8"];
const MAX_MISTAKES = 4;

/** Connections: find 4 groups of 4 words (each group is one map mission). Practice for fun — earns XP, not mastery. */
export function Connections({ subject, showZh }: { subject: { slug: string; name: string }; showZh: boolean }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [all, setAll] = useState<Tile[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [solved, setSolved] = useState<Group[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Group[]>([]);

  const start = async () => {
    setBusy(true); setError(null);
    try {
      const r = await api<{ tiles: Tile[] }>(`/api/games/connections?subject=${subject.slug}`);
      setTiles(r.tiles); setAll(r.tiles); setSel([]); setSolved([]); setMistakes(0); setMsg(null); setRevealed([]); setPhase("play");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const finish = async (s: Group[]) => {
    const rest = all.filter((t) => !s.some((g) => g.ids.includes(t.id))).map((t) => t.id);
    if (rest.length) { try { setRevealed((await api<{ groups: Group[] }>("/api/games/connections/solve", { subjectSlug: subject.slug, termIds: rest })).groups); } catch {} }
    setPhase("over");
  };
  const submit = async () => {
    if (sel.length !== 4 || busy) return;
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ correct: boolean; oneAway: boolean; label: string; labelZh: string }>("/api/games/connections/check", { subjectSlug: subject.slug, termIds: sel });
      if (r.correct) {
        const s = [...solved, { label: r.label, labelZh: r.labelZh, ids: sel }];
        setSolved(s); setTiles(tiles.filter((t) => !sel.includes(t.id))); setSel([]);
        if (s.length === 4) await finish(s);
      } else {
        const m = mistakes + 1;
        setMistakes(m); setMsg(r.oneAway ? "One away…" : "Not a group."); setShake(true); setTimeout(() => setShake(false), 400);
        if (m >= MAX_MISTAKES) await finish(solved);
      }
    } finally { setBusy(false); }
  };
  const byId = new Map(all.map((t) => [t.id, t]));

  if (phase === "ready") return <><GameHeader title="Connections" subject={subject} /><StartCard title="Connections" zh="词汇连连看" lines={["16 words hide 4 groups of 4", "Each group is one mission from this course’s map", "Select 4 words and submit — 4 mistakes allowed", "Just for fun: earns XP, doesn’t change mastery"]} onStart={start} busy={busy} error={error} /></>;
  if (phase === "over") {
    const allGroups = [...solved, ...revealed];
    return (
      <>
        <GameHeader title="Connections" subject={subject} />
        <div className="mx-auto mb-6 max-w-xl space-y-2">
          {allGroups.map((g, k) => (
            <div key={g.label + k} className="rounded-2xl p-3 text-center" style={{ background: COLORS[k % 4] + (k < solved.length ? "" : "66") }}>
              <p className="text-sm font-bold text-ink-900">{g.label} {g.labelZh && <span className="zh font-normal">· {g.labelZh}</span>}{k >= solved.length && " (missed)"}</p>
              <p className="text-sm text-ink-900/80">{g.ids.map((id) => byId.get(id)?.term).join(" · ")}</p>
            </div>
          ))}
        </div>
        <GameOver game="connections" subject={subject} score={solved.length} unit="/ 4 groups" headline={solved.length === 4 ? "All groups found!" : "Out of guesses"} missed={[]} xp={solved.length * 3} onReplay={start} />
      </>
    );
  }
  return (
    <div className="mx-auto max-w-2xl">
      <GameHeader title="Connections" subject={subject}>
        <span className="text-sm text-muted">Mistakes left</span>
        <span className="flex gap-1" aria-label={`${MAX_MISTAKES - mistakes} mistakes left`}>{Array.from({ length: MAX_MISTAKES }).map((_, k) => <span key={k} className={cn("h-3 w-3 rounded-full", k < MAX_MISTAKES - mistakes ? "bg-ink-700 dark:bg-ink-200" : "bg-[rgb(var(--line))]")} />)}</span>
      </GameHeader>
      <div className="space-y-2">
        {solved.map((g, k) => (
          <motion.div key={g.label} initial={reduce ? false : { scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl p-3 text-center" style={{ background: COLORS[k] }}>
            <p className="text-sm font-bold text-ink-900">{g.label} {g.labelZh && <span className="zh font-normal">· {g.labelZh}</span>}</p>
            <p className="text-sm text-ink-900/80">{g.ids.map((id) => byId.get(id)?.term).join(" · ")}</p>
          </motion.div>
        ))}
      </div>
      <motion.div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" animate={shake && !reduce ? { x: [0, -8, 8, -4, 0] } : {}} transition={{ duration: 0.35 }}>
        {tiles.map((t) => {
          const on = sel.includes(t.id);
          return (
            <button key={t.id} type="button" aria-pressed={on} onClick={() => setSel(on ? sel.filter((x) => x !== t.id) : sel.length < 4 ? [...sel, t.id] : sel)}
              className={cn("min-h-[72px] rounded-2xl px-2 py-2 text-center text-[14px] font-semibold leading-tight transition-colors", on ? "bg-ink-900 text-white dark:bg-brand-500" : "sunken hover:bg-[rgb(var(--line))]")}>
              {t.term}{showZh && <span className="zh mt-0.5 block text-[11px] font-normal opacity-70">{t.zh}</span>}
            </button>
          );
        })}
      </motion.div>
      <p className="mt-3 h-5 text-center text-sm font-semibold text-coral-500" aria-live="polite">{msg}</p>
      <div className="mt-2 flex justify-center gap-2">
        <Button variant="secondary" onClick={() => setTiles([...tiles].sort(() => Math.random() - 0.5))} icon={<Shuffle size={16} />}>Shuffle</Button>
        <Button variant="secondary" onClick={() => setSel([])} disabled={!sel.length}>Deselect</Button>
        <Button variant="accent" onClick={submit} loading={busy} disabled={sel.length !== 4}>Submit</Button>
      </div>
    </div>
  );
}
