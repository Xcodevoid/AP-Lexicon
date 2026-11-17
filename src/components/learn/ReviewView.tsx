"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, RotateCcw } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { PracticePlayer } from "./PracticePlayer";
import { Button } from "../ui/Button";
import { EmptyState, ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";

export function ReviewView({ dueCount, started, bySubject, upcoming, languageMode }: { dueCount: number; started: number; bySubject: { slug: string; name: string; n: number }[]; upcoming: { day: string; n: number }[]; languageMode: "FULL" | "BALANCED" | "EXAM" }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<PlayableQuestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = async (subjectSlug?: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ questions: PlayableQuestion[] }>("/api/session", { mode: "review", subjectSlug });
      if (!r.questions.length) setError("Nothing to review right now.");
      else setQuestions(r.questions);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (questions) return <PracticePlayer questions={questions} mode="review" languageMode={languageMode} title="Daily review" backHref="/review" nextHref="/dashboard" nextLabel="Back to today" onFinished={() => router.refresh()} />;

  return (
    <div>
      <p className="eyebrow">Review queue · 复习队列</p>
      <h1 className="display mt-1 text-4xl font-semibold">Daily review</h1>
      <p className="mt-2 max-w-2xl text-muted">Items come back just before you are likely to forget them. Overdue terms come first, then your weakest concepts, with a boost for subjects tied to an upcoming study goal. Each item targets the dimension you most need — translation, concept, or application.</p>
      {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface rounded-3xl p-6 shadow-card">
          {dueCount > 0 ? (
            <>
              <div className="flex items-end gap-3"><span className="display text-6xl font-semibold">{dueCount}</span><span className="pb-2 text-muted">term{dueCount === 1 ? "" : "s"} due now</span></div>
              <Button variant="accent" size="lg" className="mt-6 w-full sm:w-auto" loading={busy} onClick={() => start()} icon={<RotateCcw size={18} />}>Start review (up to 15)</Button>
              {bySubject.length > 1 && (
                <div className="mt-6">
                  <div className="eyebrow mb-2">Or review one subject</div>
                  <div className="flex flex-wrap gap-2">{bySubject.map((s) => <Button key={s.slug} size="sm" variant="secondary" onClick={() => start(s.slug)}>{s.name} · {s.n}</Button>)}</div>
                </div>
              )}
            </>
          ) : started > 0 ? (
            <EmptyState title="You're all caught up" body="No terms are due. Weak concepts will still be offered if you start a review — or learn something new on your map." action={<div className="flex gap-2"><Button variant="secondary" loading={busy} onClick={() => start()}>Practice weak terms</Button><Link href="/subjects" className="inline-flex h-11 items-center rounded-xl bg-ink-900 px-4 font-semibold text-white dark:bg-brand-500">Open maps</Link></div>} />
          ) : (
            <EmptyState title="Your review queue starts after your first practice" body="Answer questions in any mission. Mistakes return within minutes; strong answers wait days." action={<Link href="/subjects" className="inline-flex h-11 items-center rounded-xl bg-ink-900 px-4 font-semibold text-white dark:bg-brand-500">Choose a mission</Link>} />
          )}
        </div>
        <div className="surface rounded-3xl p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold"><CalendarClock size={18} className="text-brand-500" /> Coming up this week</h2>
          {upcoming.length ? (
            <ul className="mt-4 space-y-2">
              {upcoming.map((u) => (
                <li key={u.day} className="flex items-center gap-3 text-sm">
                  <span className="w-24 font-mono text-subtle">{new Date(u.day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="h-2 rounded-full bg-brand-400" style={{ width: `${Math.min(100, u.n * 6)}%` }} aria-hidden /><span className="font-semibold">{u.n}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-muted">No scheduled reviews in the next 7 days.</p>}
        </div>
      </div>
    </div>
  );
}
