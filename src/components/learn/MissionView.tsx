"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { TermCard, type CardTerm } from "./TermCard";
import { PracticePlayer } from "./PracticePlayer";
import { MatchGame } from "./MatchGame";
import { Celebration, type UnlockedAchievement } from "./Celebration";
import { Button } from "../ui/Button";
import { ErrorNote, Skeleton } from "../ui/States";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";

const STAGES = [
  { id: "discover", label: "Discover", zh: "认识", desc: "Study each bilingual card." },
  { id: "recognize", label: "Recognize", zh: "识别", desc: "Match English and Chinese." },
  { id: "understand", label: "Understand", zh: "理解", desc: "Identify concepts from definitions and scenarios." },
  { id: "apply", label: "Apply", zh: "应用", desc: "AP-style context questions." },
  { id: "master", label: "Master", zh: "精通", desc: "English only: type, explain, apply." },
] as const;
type StageId = (typeof STAGES)[number]["id"] | "match";

export function MissionView({ topic, subject, unit, terms, languageMode, initialStage }: {
  topic: { id: string; code: string; title: string; titleZh: string; objectives: string[] };
  subject: { slug: string; name: string; theme: string };
  unit: { number: number; title: string };
  terms: CardTerm[];
  languageMode: "FULL" | "BALANCED" | "EXAM";
  initialStage: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<StageId>(initialStage as StageId);
  const [cardIdx, setCardIdx] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [session, setSession] = useState<{ questions: PlayableQuestion[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ach, setAch] = useState<UnlockedAchievement[]>([]);
  const [discoverSaved, setDiscoverSaved] = useState(false);
  const mapHref = `/subjects/${subject.slug}?node=${topic.id}`;

  const load = useCallback(async (st: StageId) => {
    if (st === "discover" || st === "match") return;
    setLoading(true);
    setError(null);
    setSession(null);
    try {
      const r = await api<{ questions: PlayableQuestion[] }>("/api/session", { mode: "learn", topicId: topic.id, stage: st.toUpperCase() });
      setSession(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [topic.id]);

  useEffect(() => { void load(stage); }, [stage, load]);

  const goStage = (s: StageId) => {
    setStage(s);
    const url = new URL(window.location.href);
    url.searchParams.set("stage", s);
    window.history.replaceState(null, "", url.toString());
  };

  const saveDiscover = async () => {
    try {
      const r = await api<{ achievements: UnlockedAchievement[] }>("/api/discover", { termIds: terms.map((t) => t.id) });
      setDiscoverSaved(true);
      if (r.achievements.length) setAch(r.achievements);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Arrow keys move between cards in Discover
  useEffect(() => {
    if (stage !== "discover") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "TEXTAREA" || (e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const move = (d: number) => {
    const n = Math.min(terms.length - 1, Math.max(0, cardIdx + d));
    setCardIdx(n);
    setSeen((s) => new Set(s).add(n));
  };
  const nextStage = STAGES[STAGES.findIndex((s) => s.id === stage) + 1];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={mapHref} className="inline-flex items-center gap-1 text-sm text-muted hover:text-[rgb(var(--fg))]"><ArrowLeft size={16} /> {subject.name} map</Link>
      </div>
      <header className="mb-6">
        <div className="font-mono text-xs text-subtle">Region {unit.number} · {unit.title} · Mission {topic.code}</div>
        <h1 className="display mt-1 text-3xl font-semibold md:text-4xl">{topic.title} <span className="zh text-xl font-normal text-subtle">{topic.titleZh}</span></h1>
      </header>

      {/* Stage stepper */}
      <nav aria-label="Learning stages" className="mb-8 overflow-x-auto scrollbar-thin">
        <ol className="flex min-w-max gap-2">
          {STAGES.map((s, i) => {
            const active = stage === s.id || (stage === "match" && s.id === "recognize");
            return (
              <li key={s.id}>
                <button type="button" onClick={() => goStage(s.id)} aria-current={active ? "step" : undefined}
                  className={cn("flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-left transition-colors", active ? "border-transparent bg-ink-900 text-white dark:bg-brand-500" : "hairline hover:bg-[rgb(var(--bg-sunken))]")}>
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] font-bold", active ? "bg-white/20" : "sunken")}>{i + 1}</span>
                  <span><span className="block text-sm font-semibold">{s.label} <span className="zh font-normal opacity-70">{s.zh}</span></span><span className={cn("hidden text-[11px] md:block", active ? "opacity-80" : "text-subtle")}>{s.desc}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}

      {stage === "discover" && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between text-sm text-muted">
            <span>Card {cardIdx + 1} of {terms.length}</span>
            <span className="hidden sm:inline">Use <span className="kbd">←</span> <span className="kbd">→</span> to move</span>
          </div>
          <TermCard key={terms[cardIdx].id} t={terms[cardIdx]} subjectName={subject.name} />
          <div className="mt-5 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => move(-1)} disabled={cardIdx === 0} aria-label="Previous card"><ChevronLeft size={18} /> Previous</Button>
            <div className="hidden gap-1.5 sm:flex" aria-hidden>
              {terms.map((t, i) => <button key={t.id} tabIndex={-1} onClick={() => { setCardIdx(i); setSeen((s) => new Set(s).add(i)); }} className={cn("h-2 rounded-full transition-all", i === cardIdx ? "w-6 bg-brand-500" : seen.has(i) ? "w-2 bg-brand-200" : "w-2 bg-[rgb(var(--line))]")} />)}
            </div>
            {cardIdx < terms.length - 1 ? (
              <Button onClick={() => move(1)}>Next <ChevronRight size={18} /></Button>
            ) : discoverSaved ? (
              <Button variant="accent" onClick={() => goStage("recognize")}>Practice: Recognize <ArrowRight size={16} /></Button>
            ) : (
              <Button variant="accent" onClick={saveDiscover} icon={<Check size={18} />}>Finish studying</Button>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-subtle">Studying cards marks terms as “Learning”. Mastery only grows from answering questions.</p>
        </div>
      )}

      {stage === "recognize" && (
        <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl sunken px-4 py-3 text-sm">
          <span><BookOpen size={15} className="mr-1.5 inline text-brand-500" />Prefer speed? Try a timed match round.</span>
          <Button size="sm" variant="secondary" onClick={() => goStage("match")} icon={<Timer size={15} />}>Timed match</Button>
        </div>
      )}
      {stage === "match" && <MatchGame terms={terms.map((t) => ({ id: t.id, term: t.term, zh: t.zh }))} subjectSlug={subject.slug} onExit={() => { goStage("recognize"); router.refresh(); }} />}

      {stage !== "discover" && stage !== "match" && (
        loading ? (
          <div className="mx-auto max-w-3xl space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-48 w-full" /><Skeleton className="h-14 w-full" /></div>
        ) : session && session.questions.length ? (
          <PracticePlayer
            key={stage}
            questions={session.questions}
            mode="learn"
            languageMode={languageMode}
            englishOnly={stage === "master"}
            title={`${topic.title} · ${STAGES.find((s) => s.id === stage)?.label}`}
            backHref={mapHref}
            nextHref={nextStage ? `/learn/${topic.id}?stage=${nextStage.id}` : undefined}
            nextLabel={nextStage ? `Next stage: ${nextStage.label}` : undefined}
            onFinished={() => router.refresh()}
          />
        ) : session ? (
          <p className="text-center text-muted">No questions are available for this stage yet.</p>
        ) : null
      )}
      <Celebration items={ach} onClose={() => setAch([])} />
    </div>
  );
}
