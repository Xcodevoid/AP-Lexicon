"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Visual } from "../visuals/Visual";
import { Button } from "../ui/Button";
import { StatusPill, type MasteryStatus } from "../ui/StatusPill";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { useToast } from "../ui/Toast";
import { Celebration, type UnlockedAchievement } from "../learn/Celebration";

type T = { id: string; term: string; zh: string; definition: string; zhExplanation: string; apExample: string; status: MasteryStatus };

export function LabDrill({ slug, subject, a, b, keyDifference, keyDifferenceZh, dimensions, visual, scenarios, languageMode }: {
  slug: string; subject: string; a: T; b: T; keyDifference: string; keyDifferenceZh: string; dimensions: { label: string; a: string; b: string }[]; visual: { kind: string } | null; scenarios: { text: string }[]; languageMode: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [phase, setPhase] = useState<"compare" | "drill" | "done">("compare");
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ choice: "A" | "B"; correct: boolean; answer: "A" | "B"; why: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [ach, setAch] = useState<UnlockedAchievement[]>([]);
  const [xp, setXp] = useState(0);
  const t0 = useRef(Date.now());
  const showZh = languageMode !== "EXAM";
  const cur = res[i];

  const answer = async (choice: "A" | "B") => {
    if (busy || cur) return;
    setBusy(true);
    try {
      const r = await api<{ correct: boolean; answer: "A" | "B"; why: string }>(`/api/lab/${slug}/answer`, { index: i, answer: choice, responseMs: Date.now() - t0.current });
      setRes([...res, { choice, ...r }]);
    } catch (e) { toast({ title: "Not saved", body: (e as Error).message, tone: "error" }); } finally { setBusy(false); }
  };
  const next = async () => {
    if (i + 1 < scenarios.length) { setI(i + 1); t0.current = Date.now(); return; }
    try {
      const r = await api<{ xp: number; achievements: UnlockedAchievement[] }>(`/api/lab/${slug}/complete`, { score: res.filter((x) => x.correct).length, total: scenarios.length });
      setXp(r.xp);
      if (r.achievements.length) setAch(r.achievements);
    } catch (e) { toast({ title: "Could not complete", body: (e as Error).message, tone: "error" }); }
    setPhase("done");
    router.refresh();
  };

  const Col = ({ t, side }: { t: T; side: "A" | "B" }) => (
    <div className={cn("rounded-3xl p-5 md:p-6", side === "A" ? "bg-brand-50 dark:bg-brand-900/25" : "bg-teal-50 dark:bg-teal-900/25")}>
      <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold">{side}</span><StatusPill status={t.status} /></div>
      <h2 className="display mt-2 text-3xl font-semibold">{t.term}</h2>
      <p className="zh text-lg text-subtle">{t.zh}</p>
      <p className="mt-4 text-[15px] leading-relaxed">{t.definition}</p>
      {showZh && <p className="zh mt-2 text-[14px] text-muted" lang="zh-CN">{t.zhExplanation}</p>}
      {t.apExample && <p className="mt-4 rounded-xl bg-[rgb(var(--bg-elev))]/70 p-3 text-sm"><span className="eyebrow mr-1">Example</span>{t.apExample}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/lab" className="mb-4 inline-flex items-center gap-1 text-sm text-muted"><ArrowLeft size={16} /> Confusion Lab</Link>
      <p className="eyebrow">{subject}</p>
      <h1 className="display mt-1 text-3xl font-semibold md:text-4xl">{a.term} <span className="text-subtle">vs</span> {b.term}</h1>

      {phase === "compare" && (
        <>
          <div className="mt-6 rounded-3xl bg-ink-900 p-6 text-white">
            <p className="eyebrow text-ink-300">The key difference · 关键区别</p>
            <p className="mt-2 text-lg leading-relaxed">{keyDifference}</p>
            {showZh && keyDifferenceZh && <p className="zh mt-2 text-ink-200" lang="zh-CN">{keyDifferenceZh}</p>}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2"><Col t={a} side="A" /><Col t={b} side="B" /></div>
          {dimensions.length > 0 && (
            <div className="surface mt-4 overflow-x-auto rounded-2xl">
              <table className="w-full text-sm">
                <caption className="sr-only">Comparison of {a.term} and {b.term}</caption>
                <thead><tr className="border-b hairline text-left"><th scope="col" className="p-3 font-semibold text-muted">Aspect</th><th scope="col" className="p-3 font-semibold">{a.term}</th><th scope="col" className="p-3 font-semibold">{b.term}</th></tr></thead>
                <tbody>{dimensions.map((d) => <tr key={d.label} className="border-b hairline last:border-0"><th scope="row" className="p-3 text-left font-medium text-muted">{d.label}</th><td className="p-3">{d.a}</td><td className="p-3">{d.b}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {visual && <div className="surface mt-4 rounded-2xl p-4"><Visual visual={visual} className="mx-auto max-w-md" /></div>}
          <div className="mt-6 flex justify-end"><Button variant="accent" size="lg" onClick={() => { setPhase("drill"); t0.current = Date.now(); }}>Sort {scenarios.length} scenarios →</Button></div>
        </>
      )}

      {phase === "drill" && (
        <div className="mt-6">
          <div className="mb-3 font-mono text-sm text-subtle">Scenario {i + 1} / {scenarios.length}</div>
          <div className="surface rounded-3xl p-6 shadow-card">
            <p className="text-xl font-semibold leading-snug">{scenarios[i].text}</p>
            <p className="mt-2 text-sm text-muted">Which concept does this describe?</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["A", "B"] as const).map((side) => {
                const t = side === "A" ? a : b;
                const isAns = cur && cur.answer === side;
                const isWrong = cur && cur.choice === side && !cur.correct;
                return (
                  <button key={side} disabled={!!cur || busy} onClick={() => answer(side)} className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-left", isAns ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30" : isWrong ? "border-coral-400 bg-coral-50 dark:bg-coral-700/20" : "hairline hover:border-brand-400")}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 font-mono text-sm font-bold text-white">{isAns ? <Check size={16} /> : isWrong ? <X size={16} /> : side}</span>
                    <span><span className="block font-semibold">{t.term}</span>{showZh && <span className="zh text-sm text-subtle">{t.zh}</span>}</span>
                  </button>
                );
              })}
            </div>
            {cur && (
              <div className={cn("mt-5 rounded-2xl p-4", cur.correct ? "bg-teal-50 dark:bg-teal-900/25" : "bg-coral-50 dark:bg-coral-700/15")} aria-live="polite">
                <p className="font-semibold">{cur.correct ? "Correct" : `It's ${cur.answer === "A" ? a.term : b.term}`}</p>
                <p className="mt-1 text-sm">{cur.why}</p>
                <div className="mt-3 flex justify-end"><Button onClick={next} autoFocus>{i + 1 < scenarios.length ? "Next scenario" : "Finish"}</Button></div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="surface mt-6 rounded-3xl p-8 text-center shadow-card">
          <p className="eyebrow">Drill complete</p>
          <p className="display mt-2 text-4xl font-semibold">{res.filter((r) => r.correct).length} / {scenarios.length}</p>
          <p className="mt-2 text-muted">{xp ? `+${xp} XP · ` : ""}Each scenario counted as concept evidence for the term it describes.</p>
          <div className="mt-6 flex justify-center gap-3"><Link href="/lab" className="surface inline-flex h-11 items-center rounded-xl px-4 font-semibold">More comparisons</Link><Button onClick={() => { setPhase("compare"); setI(0); setRes([]); }}>Review comparison</Button></div>
        </div>
      )}
      <Celebration items={ach} onClose={() => setAch([])} />
    </div>
  );
}
