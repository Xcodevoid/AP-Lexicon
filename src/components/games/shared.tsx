"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { api } from "../ui/fetcher";
import { Button } from "../ui/Button";
import { Celebration, type UnlockedAchievement } from "../learn/Celebration";

export type AnswerResult = { correct: boolean; correctOptionId?: string; acceptedAnswers?: string[]; xp: number; achievements: UnlockedAchievement[]; terms: { id: string; term: string; zh: string; definition: string }[] };

/** Every game answer is graded on the server and recorded like practice (mode "challenge"). */
export function submitAnswer(q: PlayableQuestion, a: { choice?: string; text?: string; usedHint?: boolean; responseMs: number }) {
  return api<AnswerResult>("/api/answer", { ref: q.ref, choice: a.choice, text: a.text, usedHint: !!a.usedHint, chineseShown: !!a.usedHint, responseMs: a.responseMs, mode: "challenge" });
}

export function loadGame(game: "lightning" | "spell" | "boss", subjectSlug: string) {
  return api<{ questions: PlayableQuestion[] }>("/api/session", { mode: "game", game, subjectSlug });
}

export function GameHeader({ title, subject, children }: { title: string; subject: { slug: string; name: string }; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <Link href={`/games?subject=${subject.slug}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-[rgb(var(--fg))]"><ArrowLeft size={16} /> Games</Link>
      <h1 className="text-lg font-semibold">{title} <span className="text-sm font-normal text-subtle">· {subject.name}</span></h1>
      <div className="ml-auto flex items-center gap-3">{children}</div>
    </div>
  );
}

/** End screen: saves the personal best (server caps it to what was actually answered) and shows missed words. */
export function GameOver({ game, subject, score, unit, headline, missed, xp, onReplay, extraAchievements = [] }: {
  game: string; subject: { slug: string; name: string }; score: number; unit: string; headline: string;
  missed: { term: string; zh: string; definition: string }[]; xp: number; onReplay: () => void; extraAchievements?: UnlockedAchievement[];
}) {
  const [best, setBest] = useState<{ value: number; isBest: boolean; previousBest: number } | null>(null);
  const [ach, setAch] = useState<UnlockedAchievement[]>(extraAchievements);
  useEffect(() => {
    api<{ value: number; isBest: boolean; previousBest: number; achievements: UnlockedAchievement[] }>("/api/games/best", { game, subjectSlug: subject.slug, score })
      .then((r) => { setBest(r); if (r.achievements.length) setAch((a) => [...a, ...r.achievements]); })
      .catch(() => {});
  }, [game, subject.slug, score]);
  return (
    <div className="mx-auto max-w-xl">
      <div className="surface overflow-hidden rounded-3xl shadow-lift">
        <div className="bg-ink-900 p-7 text-center text-white">
          <Trophy className="mx-auto text-gold-300" size={34} />
          <p className="eyebrow mt-3 text-ink-300">{headline}</p>
          <p className="display mt-1 text-5xl font-semibold">{score} <span className="text-2xl text-ink-300">{unit}</span></p>
          <p className="mt-2 text-sm text-ink-200">
            {best ? (best.isBest && best.value > 0 ? `New personal best! (previous ${best.previousBest})` : `Personal best: ${Math.max(best.value, best.previousBest)}`) : "Saving…"}
            {xp > 0 && ` · +${xp} XP`}
          </p>
        </div>
        {missed.length > 0 && (
          <div className="p-6">
            <h2 className="eyebrow">Words to review · 需要复习</h2>
            <ul className="mt-3 divide-y hairline">
              {missed.map((m) => <li key={m.term} className="py-2 text-sm"><b>{m.term}</b> <span className="zh text-subtle">{m.zh}</span><p className="text-muted">{m.definition}</p></li>)}
            </ul>
            <p className="mt-3 text-xs text-subtle">These are now scheduled to come back soon in your review queue.</p>
          </div>
        )}
        <div className="flex justify-center gap-3 p-6 pt-0">
          <Link href={`/games?subject=${subject.slug}`} className="surface inline-flex h-11 items-center rounded-xl px-4 font-semibold">All games</Link>
          <Button variant="accent" onClick={onReplay} icon={<RotateCcw size={16} />}>Play again</Button>
        </div>
      </div>
      <Celebration items={ach} onClose={() => setAch([])} />
    </div>
  );
}

export function StartCard({ title, zh, lines, onStart, busy, error }: { title: string; zh: string; lines: string[]; onStart: () => void; busy?: boolean; error?: string | null }) {
  return (
    <div className="surface mx-auto max-w-xl rounded-3xl p-8 text-center shadow-card">
      <h2 className="display text-3xl font-semibold">{title}</h2>
      <p className="zh text-subtle">{zh}</p>
      <ul className="mx-auto mt-5 max-w-sm space-y-1.5 text-left text-sm text-muted">{lines.map((l) => <li key={l}>• {l}</li>)}</ul>
      {error && <p className="mt-4 text-sm text-coral-500" role="alert">{error}</p>}
      <Button variant="accent" size="lg" className="mt-6" loading={busy} onClick={onStart}>Start</Button>
    </div>
  );
}
