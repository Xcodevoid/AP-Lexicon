"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpen, Castle, Check, ChevronRight, Gamepad2, Lock, Target, X } from "lucide-react";
import type { subjectMap, NodeStatus } from "@/lib/services/stats";
import { THEMES } from "./themes";
import { cn } from "../ui/cn";
import { ProgressBar, ProgressRing } from "../ui/Progress";
import { StatusPill, STATUS_COLORS } from "../ui/StatusPill";
import { ButtonLink } from "../ui/Button";
import { useToast } from "../ui/Toast";

type MapData = NonNullable<Awaited<ReturnType<typeof subjectMap>>>;
type Topic = MapData["units"][number]["topics"][number];
type Unit = MapData["units"][number];

const X_PATTERN = [50, 76, 60, 26, 38, 70, 82, 54, 22];
const NODE_GAP = 132;

function terrainStyle(kind: string, color: string): React.CSSProperties {
  const c = encodeURIComponent(color);
  const svg =
    kind === "contour"
      ? `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><g fill='none' stroke='${c}' stroke-opacity='.16'><path d='M-20 120 C 30 80 60 140 110 100 S 170 60 190 90'/><path d='M-20 90 C 30 50 70 110 120 70 S 170 30 190 60'/><path d='M-20 60 C 40 20 80 80 130 40 S 170 0 190 30'/></g></svg>`
      : kind === "cells"
        ? `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><g fill='none' stroke='${c}' stroke-opacity='.15'><circle cx='20' cy='22' r='12'/><circle cx='64' cy='58' r='18'/><circle cx='70' cy='12' r='6'/></g></svg>`
        : `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M44 0H0V44' fill='none' stroke='${c}' stroke-opacity='.12'/></svg>`;
  return { backgroundImage: `url("data:image/svg+xml,${svg}")` };
}

function nodeLabel(status: NodeStatus) {
  return status === "LOCKED" ? "Locked" : status === "NOT_STARTED" ? "Not started" : status === "LEARNING" ? "Learning" : status === "PRACTICING" ? "Practicing" : "Mastered";
}

export function MasteryMap({ data, initialNode }: { data: MapData; initialNode?: string }) {
  const th = THEMES[data.subject.theme] ?? THEMES.blue;
  const reduce = useReducedMotion();
  const toast = useToast();
  const allTopics = useMemo(() => data.units.flatMap((u) => u.topics.map((t) => ({ ...t, unit: u }))), [data]);
  const [openId, setOpenId] = useState<string | null>(initialNode ?? null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const open = allTopics.find((t) => t.id === openId) ?? null;
  const openChallenge = data.units.find((u) => `challenge:${u.id}` === openId) ?? null;

  // Unlock & mastery celebrations: compare with the statuses seen on the previous visit (per device).
  useEffect(() => {
    const key = `apl-map:${data.subject.slug}`;
    let prev: Record<string, string> = {};
    try { prev = JSON.parse(localStorage.getItem(key) ?? "{}"); } catch {}
    const now: Record<string, string> = {};
    const newly = new Set<string>();
    for (const t of allTopics) {
      now[t.id] = t.status;
      if (prev[t.id] && prev[t.id] !== t.status) {
        if (prev[t.id] === "LOCKED") newly.add(t.id);
        if (t.status === "MASTERED") toast({ title: `Mission mastered: ${t.title}`, body: "Every term reached Mastered in all three dimensions.", tone: "gold" });
      }
    }
    for (const u of data.units) {
      now[`c:${u.id}`] = u.challengeUnlocked ? "1" : "0";
      if (prev[`c:${u.id}`] === "0" && u.challengeUnlocked) toast({ title: `Unit challenge unlocked`, body: `${u.title} — test yourself in English only.`, tone: "gold" });
    }
    if (newly.size) {
      setFresh(newly);
      toast({ title: newly.size === 1 ? "New mission unlocked" : `${newly.size} missions unlocked`, body: "Your practice opened the next part of the map.", tone: "success" });
    }
    try { localStorage.setItem(key, JSON.stringify(now)); } catch {}
  }, [allTopics, data.units, data.subject.slug, toast]);

  // Escape closes the panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pct = data.progress.total ? data.progress.mastered / data.progress.total : 0;

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/subjects" className="inline-flex items-center gap-1 text-sm text-muted hover:text-[rgb(var(--fg))]"><ArrowLeft size={16} /> All maps</Link>
        <Link href={`/games?subject=${data.subject.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 text-sm font-semibold text-white dark:bg-brand-500"><Gamepad2 size={16} /> Play games</Link>
      </div>

      {/* Subject header with overall progress */}
      <header className="surface relative overflow-hidden rounded-3xl p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={terrainStyle(th.terrain, th.node)} aria-hidden />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow" style={{ color: th.node }}>{th.name}</div>
            <h1 className="display mt-1 text-3xl font-semibold md:text-4xl">{data.subject.name}</h1>
            <div className="zh mt-1 text-subtle">{data.subject.nameZh}</div>
            <p className="mt-3 max-w-xl text-sm text-muted">{data.subject.description}</p>
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing value={pct} size={84} stroke={8} color={th.node} label={`${data.progress.mastered} of ${data.progress.total} terms mastered`}>
              <span className="text-lg font-bold">{Math.round(pct * 100)}%</span>
            </ProgressRing>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <dt className="text-subtle">Mastered</dt><dd className="font-semibold">{data.progress.mastered} / {data.progress.total}</dd>
              <dt className="text-subtle">Started</dt><dd className="font-semibold">{data.progress.started}</dd>
              <dt className="text-subtle">Avg mastery</dt><dd className="font-semibold">{data.progress.avgScore}</dd>
              <dt className="text-subtle">Rank</dt><dd className="font-semibold">{data.progress.rank.name} <span className="zh font-normal text-subtle">{data.progress.rank.zh}</span></dd>
            </dl>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3 text-xs text-muted" aria-label="Legend">
          {(["NOT_STARTED", "LEARNING", "PRACTICING", "MASTERED", "LOCKED"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />{nodeLabel(s)}</span>
          ))}
        </div>
        {data.subject.frameworkNote && <p className="relative mt-3 text-[11px] text-subtle">{data.subject.frameworkNote}</p>}
      </header>

      {/* Regions */}
      <div className="mt-8 space-y-6">
        {data.units.map((u, ui) => (
          <Region key={u.id} unit={u} index={ui} theme={th} reduce={!!reduce} fresh={fresh} onOpen={setOpenId} openId={openId} />
        ))}
      </div>

      {/* Detail panel: side sheet on desktop, bottom sheet on mobile */}
      <AnimatePresence>
        {(open || openChallenge) && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(null)} aria-hidden />
            <motion.aside
              role="dialog" aria-modal="true" aria-labelledby="node-title"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[86dvh] overflow-y-auto rounded-t-3xl bg-[rgb(var(--bg-elev))] p-6 shadow-lift md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
              initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              {open ? <TopicPanel topic={open} unit={open.unit} theme={th} onClose={() => setOpenId(null)} /> : openChallenge ? <ChallengePanel unit={openChallenge} theme={th} onClose={() => setOpenId(null)} /> : null}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Region({ unit, index, theme, reduce, fresh, onOpen, openId }: { unit: Unit; index: number; theme: (typeof THEMES)[string]; reduce: boolean; fresh: Set<string>; onOpen: (id: string) => void; openId: string | null }) {
  const n = unit.topics.length;
  const points = unit.topics.map((t, i) => ({ x: X_PATTERN[(i + index * 3) % X_PATTERN.length], y: 70 + i * NODE_GAP }));
  const challenge = { x: 50, y: 70 + n * NODE_GAP };
  const height = challenge.y + 90;
  const all = [...points, challenge];
  const d = all.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = all[i - 1];
    const my = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }, "");
  const reachedIdx = unit.topics.findIndex((t) => t.status === "LOCKED");
  const reached = reachedIdx === -1 ? n : reachedIdx;
  const unitPct = unit.total ? unit.mastered / unit.total : 0;
  const ref = useRef<HTMLDivElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => { if (pathRef.current) setPathLen(pathRef.current.getTotalLength()); }, [d]);

  return (
    <section aria-labelledby={`unit-${unit.id}`} className="surface relative overflow-hidden rounded-3xl shadow-card">
      <div className="pointer-events-none absolute inset-0" style={terrainStyle(theme.terrain, theme.node)} aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b hairline px-5 py-4 md:px-7">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-subtle">Region {unit.number}</div>
          <h2 id={`unit-${unit.id}`} className="text-lg font-semibold">{unit.title} <span className="zh ml-1 text-sm font-normal text-subtle">{unit.titleZh}</span></h2>
        </div>
        <div className="flex w-44 items-center gap-2">
          <ProgressBar value={unitPct} label={`${unit.title}: ${unit.mastered} of ${unit.total} mastered`} />
          <span className="whitespace-nowrap font-mono text-xs text-subtle">{unit.mastered}/{unit.total}</span>
        </div>
      </div>
      <div ref={ref} className="relative mx-auto max-w-3xl" style={{ height }}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
          <path d={d} fill="none" stroke="rgb(var(--line))" strokeWidth={10} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke="rgb(var(--bg-elev))" strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {/* progress overlay up to the furthest unlocked node */}
          <path ref={pathRef} d={d} fill="none" stroke={theme.path} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke"
            style={pathLen ? { strokeDasharray: pathLen, strokeDashoffset: pathLen * (1 - Math.min(1, reached / Math.max(1, n))), transition: reduce ? undefined : "stroke-dashoffset 1.2s ease-out" } : { opacity: 0 }} />
        </svg>
        {unit.topics.map((t, i) => (
          <MapNode key={t.id} topic={t} x={points[i].x} y={points[i].y} theme={theme} fresh={fresh.has(t.id)} reduce={reduce} active={openId === t.id} onOpen={() => onOpen(t.id)} delay={i * 0.05} />
        ))}
        {/* Unit challenge citadel */}
        <button type="button" onClick={() => onOpen(`challenge:${unit.id}`)}
          className={cn("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl p-1", !unit.challengeUnlocked && "opacity-80")}
          style={{ left: `${challenge.x}%`, top: challenge.y }} aria-label={`${unit.title} unit challenge — ${unit.challengeUnlocked ? "unlocked" : "locked: reach Practicing in every mission"}`}>
          <span className={cn("grid h-16 w-16 place-items-center rounded-2xl border-2 shadow-lift", unit.challengeUnlocked ? "text-white" : "border-dashed bg-[rgb(var(--bg-elev))] text-subtle hairline")}
            style={unit.challengeUnlocked ? { background: `linear-gradient(135deg, ${theme.node}, #0B1530)`, borderColor: "#F5B83D" } : undefined}>
            {unit.challengeUnlocked ? <Castle size={26} /> : <Lock size={20} />}
          </span>
          <span className="rounded-full bg-[rgb(var(--bg-elev))]/90 px-2.5 py-0.5 text-xs font-semibold shadow-card">Unit challenge</span>
        </button>
      </div>
    </section>
  );
}

function MapNode({ topic, x, y, theme, fresh, reduce, active, onOpen, delay }: { topic: Topic; x: number; y: number; theme: (typeof THEMES)[string]; fresh: boolean; reduce: boolean; active: boolean; onOpen: () => void; delay: number }) {
  const locked = topic.status === "LOCKED";
  const color = STATUS_COLORS[topic.status];
  const labelLeft = x > 55;
  const size = 64;
  const r = 28;
  const c = 2 * Math.PI * r;
  const readyFrac = (topic.counts.practicing + topic.counts.mastered) / Math.max(1, topic.counts.total);
  return (
    <motion.div className="absolute w-0" style={{ left: `${x}%`, top: y }} initial={reduce ? false : { opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}>
      <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-expanded={active}
        aria-label={`${topic.code} ${topic.title}. ${nodeLabel(topic.status)}. ${topic.counts.total} terms, ${topic.counts.mastered} mastered, mastery ${topic.mastery}.`}
        className={cn("group relative -translate-x-1/2 -translate-y-1/2 rounded-full", fresh && !reduce && "animate-pulse-ring")}>
        <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-[0_6px_14px_rgba(11,21,48,.25)] transition-transform group-hover:scale-105">
          <circle cx="32" cy="32" r="30" fill={locked ? "rgb(var(--bg-sunken))" : "rgb(var(--bg-elev))"} stroke={active ? theme.node : "rgb(var(--line))"} strokeWidth={active ? 3 : 1.5} />
          {!locked && <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="5" />}
          {!locked && <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0.02, readyFrac))} transform="rotate(-90 32 32)" />}
          {topic.status === "MASTERED" && <circle cx="32" cy="32" r="19" fill="#F5B83D" />}
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          {locked ? <Lock size={18} className="text-subtle" /> : topic.status === "MASTERED" ? <Check size={20} className="text-ink-900" strokeWidth={3} /> : <span className="font-mono text-[12px] font-bold">{topic.code}</span>}
        </span>
      </button>
      <div className={cn("pointer-events-none absolute top-0 w-[min(42vw,220px)] -translate-y-1/2", labelLeft ? "right-[44px] text-right" : "left-[44px]")}>
        <div className={cn("text-[13px] font-semibold leading-tight", locked && "text-subtle")}>{topic.title}</div>
        <div className="zh text-[11px] text-subtle">{topic.titleZh}</div>
        <div className="mt-0.5 font-mono text-[10.5px] text-subtle">{topic.counts.mastered}/{topic.counts.total} mastered · {topic.mastery}%</div>
      </div>
    </motion.div>
  );
}

const STAGES = [
  { id: "discover", label: "Discover", zh: "认识" },
  { id: "recognize", label: "Recognize", zh: "识别" },
  { id: "understand", label: "Understand", zh: "理解" },
  { id: "apply", label: "Apply", zh: "应用" },
  { id: "master", label: "Master", zh: "精通" },
];

function TopicPanel({ topic, unit, theme, onClose }: { topic: Topic; unit: Unit; theme: (typeof THEMES)[string]; onClose: () => void }) {
  const locked = topic.status === "LOCKED";
  const avg = (k: "recognition" | "concept" | "application") => topic.terms.reduce((a, t) => a + t[k], 0) / Math.max(1, topic.terms.length);
  const suggested = avg("recognition") < 0.6 ? (topic.terms.some((t) => t.status !== "NOT_STARTED") ? "recognize" : "discover") : avg("concept") < 0.6 ? "understand" : avg("application") < 0.6 ? "apply" : "master";
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-subtle">Region {unit.number} · Mission {topic.code}</div>
          <h2 id="node-title" className="mt-1 text-2xl font-semibold leading-tight">{topic.title}</h2>
          <div className="zh text-subtle">{topic.titleZh}</div>
        </div>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[rgb(var(--bg-sunken))]" aria-label="Close"><X size={18} /></button>
      </div>
      <div className="mt-4 flex items-center gap-2"><StatusPill status={topic.status} showZh /><span className="text-xs text-subtle">Mission mastery {topic.mastery}%</span></div>

      {locked ? (
        <div className="mt-6 rounded-2xl sunken p-5 text-sm">
          <Lock size={18} className="mb-2 text-subtle" />
          <p className="font-semibold">Locked — bring the previous mission to Practicing.</p>
          <p className="mt-1 text-muted">A mission reaches Practicing when at least 60% of its terms are Practicing or Mastered. This keeps new vocabulary from piling up before earlier terms are secure.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {([["recognition", "Recognition", "识别", "bg-[var(--dim-rec)]"], ["concept", "Concept", "理解", "bg-[var(--dim-con)]"], ["application", "Application", "应用", "bg-[var(--dim-app)]"]] as const).map(([k, l, z, c]) => (
              <div key={k} className="rounded-xl sunken p-3">
                <div className="text-[11px] font-semibold text-muted">{l} <span className="zh font-normal">{z}</span></div>
                <div className="mt-1 text-lg font-bold">{Math.round(avg(k) * 100)}</div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[rgb(var(--line))]"><div className={cn("h-full", c)} style={{ width: `${avg(k) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <h3 className="eyebrow mt-6">Learning journey</h3>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {STAGES.map((s) => (
              <Link key={s.id} href={`/learn/${topic.id}?stage=${s.id}`} className={cn("rounded-xl border px-1 py-2.5 text-center text-[11px] font-semibold transition-colors", s.id === suggested ? "border-transparent text-white" : "hairline hover:bg-[rgb(var(--bg-sunken))]")} style={s.id === suggested ? { background: theme.node } : undefined}>
                {s.label}<span className="zh block font-normal opacity-80">{s.zh}</span>
              </Link>
            ))}
          </div>
          <ButtonLink href={`/learn/${topic.id}?stage=${suggested}`} variant="accent" className="mt-4 w-full">
            {suggested === "discover" ? <BookOpen size={18} /> : <Target size={18} />} Continue: {STAGES.find((s) => s.id === suggested)?.label} <ChevronRight size={16} />
          </ButtonLink>
        </>
      )}

      {topic.objectives.length > 0 && (
        <>
          <h3 className="eyebrow mt-7">Learning objectives</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">{topic.objectives.map((o) => <li key={o} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" />{o}</li>)}</ul>
        </>
      )}
      <h3 className="eyebrow mt-7">Vocabulary · {topic.terms.length}</h3>
      <ul className="mt-2 divide-y hairline rounded-2xl border hairline">
        {topic.terms.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{t.term}</div>
              <div className="zh truncate text-xs text-subtle">{t.zh}</div>
            </div>
            <StatusPill status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChallengePanel({ unit, theme, onClose }: { unit: Unit; theme: (typeof THEMES)[string]; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs text-subtle">Region {unit.number}</div>
          <h2 id="node-title" className="mt-1 text-2xl font-semibold">Unit challenge</h2>
          <div className="text-muted">{unit.title}</div>
        </div>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[rgb(var(--bg-sunken))]" aria-label="Close"><X size={18} /></button>
      </div>
      <div className="mt-6 rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${theme.node}, #0B1530)` }}>
        <Castle size={26} />
        <p className="mt-3 font-semibold">10 cumulative questions · 8 minutes · English only</p>
        <p className="mt-1 text-sm opacity-85">Feedback is shown at the end, like a real assessment. Results count as independent application evidence.</p>
      </div>
      {unit.challengeUnlocked ? (
        <ButtonLink href={`/challenge/${unit.id}`} variant="accent" className="mt-5 w-full">Begin challenge</ButtonLink>
      ) : (
        <div className="mt-5 rounded-2xl sunken p-4 text-sm">
          <p className="font-semibold">Locked</p>
          <p className="mt-1 text-muted">Bring every mission in this region to Practicing (60% of terms Practicing or Mastered).</p>
          <ul className="mt-3 space-y-1">
            {unit.topics.map((t) => <li key={t.id} className="flex items-center justify-between gap-2"><span className="truncate">{t.code} {t.title}</span><StatusPill status={t.status} /></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
