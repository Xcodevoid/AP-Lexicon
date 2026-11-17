"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Castle, Lock } from "lucide-react";
import type { PlayableQuestion } from "@/lib/engine/questions";
import { PracticePlayer } from "./PracticePlayer";
import { Button } from "../ui/Button";
import { ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";

export function ChallengeView({ unit, subject, unlocked, languageMode }: { unit: { id: string; number: number; title: string }; subject: { slug: string; name: string }; unlocked: boolean; languageMode: "FULL" | "BALANCED" | "EXAM" }) {
  const router = useRouter();
  const [s, setS] = useState<{ questions: PlayableQuestion[]; meta: { timeLimitSec: number } } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = `/subjects/${subject.slug}`;
  if (s) return <PracticePlayer questions={s.questions} mode="mastery" languageMode={languageMode} englishOnly delayedFeedback timeLimitSec={s.meta.timeLimitSec} title={`Unit challenge · ${unit.title}`} backHref={back} onFinished={() => router.refresh()} />;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={back} className="mb-4 inline-flex items-center gap-1 text-sm text-muted"><ArrowLeft size={16} /> {subject.name} map</Link>
      <div className="overflow-hidden rounded-3xl bg-ink-900 p-8 text-white shadow-lift">
        <Castle size={34} className="text-gold-300" />
        <p className="eyebrow mt-4 text-ink-300">Region {unit.number} · Unit challenge</p>
        <h1 className="display mt-1 text-3xl font-semibold">{unit.title}</h1>
        <ul className="mt-5 space-y-1.5 text-ink-200">
          <li>· 10 cumulative questions across the unit</li>
          <li>· 8 minutes · English only — no Chinese hints during the challenge</li>
          <li>· Feedback, explanations and 中文解析 appear at the end</li>
        </ul>
        {error && <div className="mt-5"><ErrorNote>{error}</ErrorNote></div>}
        {unlocked ? (
          <Button variant="accent" size="lg" className="mt-8" loading={busy} onClick={async () => {
            setBusy(true); setError(null);
            try { setS(await api("/api/session", { mode: "mastery", unitId: unit.id })); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
          }}>Begin · 开始</Button>
        ) : (
          <p className="mt-8 flex items-center gap-2 rounded-2xl bg-white/10 p-4 text-sm"><Lock size={16} /> Locked: bring every mission in this region to Practicing first.</p>
        )}
      </div>
    </div>
  );
}
