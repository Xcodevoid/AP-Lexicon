"use client";
import { useState } from "react";
import { AlertTriangle, Bookmark, BookmarkCheck, ChevronDown, Globe2, Repeat2 } from "lucide-react";
import { Visual } from "../visuals/Visual";
import { Pronounce } from "./Pronounce";
import { StatusPill, type MasteryStatus } from "../ui/StatusPill";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { useToast } from "../ui/Toast";

export interface CardTerm {
  id: string;
  term: string;
  zh: string;
  definition: string;
  zhExplanation: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  apExample: string;
  realWorld: string;
  misconceptions: string[];
  visual?: { kind?: string; variant?: string } | null;
  imageUrl?: string | null;
  difficulty: number;
  reviewStatus: string;
  related: { id: string; term: string; zh: string; kind: string }[];
  status: MasteryStatus;
  bookmarked: boolean;
  dims?: { recognition: number; concept: number; application: number };
}

/** Bilingual term card. English and Chinese explanations are shown together; "flip" turns it into a self-test. */
export function TermCard({ t, subjectName, onBookmark }: { t: CardTerm; subjectName: string; onBookmark?: (v: boolean) => void }) {
  const [flipped, setFlipped] = useState(false);
  const [showMis, setShowMis] = useState(true);
  const [bookmarked, setBookmarked] = useState(t.bookmarked);
  const toast = useToast();
  const toggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await api(`/api/terms/${t.id}/state`, { bookmarked: next }, "PATCH");
      onBookmark?.(next);
      toast({ title: next ? "Saved to notebook" : "Removed from notebook" });
    } catch (e) {
      setBookmarked(!next);
      toast({ title: "Could not save", body: (e as Error).message, tone: "error" });
    }
  };
  const confused = t.related.filter((r) => r.kind === "confused");
  const related = t.related.filter((r) => r.kind === "related");

  return (
    <article className="card-flip" aria-roledescription="term card" aria-label={`${t.term}, ${t.zh}`}>
      <div className={cn("card-flip-inner relative", flipped && "flipped")}>
        {/* FRONT: full bilingual learning view */}
        <div className={cn("card-face surface rounded-3xl p-5 shadow-lift md:p-8", flipped && "invisible")} aria-hidden={flipped}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="eyebrow">{subjectName}</span>
              <StatusPill status={t.status} showZh />
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setFlipped(true)} className="grid h-10 w-10 place-items-center rounded-xl sunken hover:text-brand-500" aria-label="Flip card to test yourself" title="Flip to self-test"><Repeat2 size={18} /></button>
              <button type="button" onClick={toggleBookmark} aria-pressed={bookmarked} className={cn("grid h-10 w-10 place-items-center rounded-xl sunken", bookmarked ? "text-gold-500" : "hover:text-brand-500")} aria-label={bookmarked ? "Remove bookmark" : "Bookmark term"}>
                {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="display break-words text-[34px] font-semibold leading-[1.05] md:text-5xl">{t.term}</h2>
              <p className="zh mt-2 text-2xl font-medium text-brand-500 md:text-[28px]" lang="zh-CN">{t.zh}</p>
              {t.pronunciation && <p className="mt-1 font-mono text-sm text-subtle">{t.pronunciation}</p>}
            </div>
            <Pronounce text={t.term} audioUrl={t.audioUrl} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <section className="rounded-2xl sunken p-4">
              <h3 className="eyebrow mb-1.5">English definition</h3>
              <p className="text-[16px] leading-relaxed">{t.definition}</p>
            </section>
            <section className="rounded-2xl sunken p-4" lang="zh-CN">
              <h3 className="eyebrow mb-1.5">中文概念解释</h3>
              <p className="zh text-[16px] leading-relaxed">{t.zhExplanation || t.zh}</p>
            </section>
          </div>

          {(t.visual?.kind || t.imageUrl) && (
            <section className="mt-3 rounded-2xl border hairline p-4">
              <h3 className="eyebrow mb-2">Visual explanation</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {t.imageUrl ? <img src={t.imageUrl} alt={`Illustration of ${t.term}`} className="mx-auto max-h-64 rounded-xl" /> : <Visual visual={t.visual} className="mx-auto max-w-md" />}
            </section>
          )}

          {t.apExample && (
            <section className="mt-3 rounded-2xl border-l-4 border-brand-500 bg-brand-50/50 p-4 dark:bg-brand-900/20">
              <h3 className="eyebrow mb-1.5 text-brand-600 dark:text-brand-300">In an AP context</h3>
              <p className="text-[15px] leading-relaxed">{t.apExample}</p>
            </section>
          )}
          {t.realWorld && (
            <section className="mt-3 flex gap-3 rounded-2xl sunken p-4 text-[15px]">
              <Globe2 size={18} className="mt-0.5 shrink-0 text-teal-500" aria-hidden />
              <p><span className="font-semibold">Real world: </span>{t.realWorld}</p>
            </section>
          )}
          {t.misconceptions.length > 0 && (
            <section className="mt-3 rounded-2xl border border-coral-200 p-4 dark:border-coral-700/40">
              <button type="button" onClick={() => setShowMis(!showMis)} aria-expanded={showMis} className="flex w-full items-center gap-2 text-left">
                <AlertTriangle size={16} className="text-coral-500" aria-hidden />
                <h3 className="flex-1 text-sm font-semibold">Common misconception{t.misconceptions.length > 1 ? "s" : ""}</h3>
                <ChevronDown size={16} className={cn("transition-transform", showMis && "rotate-180")} />
              </button>
              {showMis && <ul className="mt-2 space-y-1.5 text-[14px] text-muted">{t.misconceptions.map((m) => <li key={m}>✗ {m}</li>)}</ul>}
            </section>
          )}
          {(confused.length > 0 || related.length > 0) && (
            <section className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {confused.length > 0 && <span className="eyebrow mr-1">Easily confused</span>}
              {confused.map((r) => <span key={r.id} className="rounded-full border border-coral-300 px-3 py-1 text-coral-600 dark:text-coral-300">{r.term} <span className="zh opacity-70">{r.zh}</span></span>)}
              {related.length > 0 && <span className="eyebrow ml-1 mr-1">Related</span>}
              {related.map((r) => <span key={r.id} className="rounded-full sunken px-3 py-1">{r.term} <span className="zh text-subtle">{r.zh}</span></span>)}
            </section>
          )}
          {t.reviewStatus !== "APPROVED" && <p className="mt-5 text-[11px] text-subtle">Sample content · pending teacher review · original wording, not an official College Board glossary.</p>}
        </div>

        {/* BACK: self-test — recall before revealing */}
        <div className={cn("card-face card-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-ink-900 p-8 text-center text-white shadow-lift", !flipped && "invisible")} aria-hidden={!flipped}>
          <p className="eyebrow text-ink-300">Self-test · 自测</p>
          <p className="display mt-4 text-4xl font-semibold md:text-5xl">{t.term}</p>
          <p className="mt-6 max-w-md text-ink-200">Say the Chinese meaning and explain the concept in English, then flip back to check.</p>
          <button type="button" onClick={() => setFlipped(false)} className="mt-8 rounded-xl bg-white px-5 py-3 font-semibold text-ink-900">Reveal · 显示答案</button>
        </div>
      </div>
    </article>
  );
}
