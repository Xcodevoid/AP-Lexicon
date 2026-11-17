"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";
import { ErrorNote } from "./ui/States";
import { api } from "./ui/fetcher";
import { cn } from "./ui/cn";
import { inputCls } from "./AuthForm";
import { THEMES } from "./map/themes";

type Subject = { slug: string; name: string; nameZh: string; shortName: string; theme: string; count: number };
const MODES = [
  { id: "FULL", t: "Full Support", z: "全中文辅助", d: "English with Chinese explanations shown alongside. Best when a subject is new to you in English.", sample: "Marginal Cost — 边际成本：每多生产一单位产品所增加的成本" },
  { id: "BALANCED", t: "Balanced", z: "双语平衡", d: "English first. Tap for a Chinese hint whenever you need it — hints are never penalised.", sample: "Marginal Cost — the additional cost of producing one more unit  [显示中文]" },
  { id: "EXAM", t: "Exam Mode", z: "考试模式", d: "English only during questions, like the real exam. Chinese appears in the review after you answer.", sample: "Explain why a profit-maximizing firm compares MR and MC." },
] as const;

export function Onboarding({ name: initialName, subjects }: { name: string; subjects: Subject[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState<number | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [mode, setMode] = useState<"FULL" | "BALANCED" | "EXAM">("BALANCED");
  const [dailyGoalXp, setDaily] = useState(60);
  const [examDate, setExamDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const steps = ["About you", "Your AP courses", "Language support", "Your rhythm"];

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      const goalSubject = focus.find((s) => s !== "ap-exam-language");
      const r = await api<{ next: string }>("/api/onboarding", {
        name: name.trim() || undefined, grade, languageMode: mode, focusSubjects: focus, dailyGoalXp,
        tzOffset: -new Date().getTimezoneOffset(),
        goal: examDate && goalSubject ? { title: `Prepare for ${subjects.find((s) => s.slug === goalSubject)?.name}`, subjectSlug: goalSubject, targetDate: examDate } : null,
      });
      router.push(r.next);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-8">
      <Logo />
      <ol className="mt-10 flex gap-2" aria-label="Onboarding steps">
        {steps.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand-500" : "sunken")} />
            <div className={cn("mt-2 hidden text-xs font-semibold sm:block", i === step ? "" : "text-subtle")} aria-current={i === step ? "step" : undefined}>{s}</div>
          </li>
        ))}
      </ol>
      <div className="mt-10 min-h-[420px] animate-fade-up" key={step}>
        {step === 0 && (
          <section>
            <h1 className="display text-3xl font-semibold">Welcome to AP Lexicon <span className="zh text-2xl">欢迎</span></h1>
            <p className="mt-2 text-muted">A few questions so your map and reviews fit how you study.</p>
            <label className="mt-8 block text-sm font-semibold" htmlFor="ob-name">What should we call you?</label>
            <input id="ob-name" className={cn(inputCls, "mt-1.5 max-w-sm")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Grade (optional)</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[9, 10, 11, 12].map((g) => (
                  <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(grade === g ? null : g)} className={cn("h-11 rounded-xl border px-5 font-semibold", grade === g ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100" : "hairline")}>Grade {g}</button>
                ))}
              </div>
            </fieldset>
          </section>
        )}
        {step === 1 && (
          <section>
            <h1 className="display text-3xl font-semibold">Which AP courses are you taking?</h1>
            <p className="mt-2 text-muted">Pick one or more. You can explore every map later.</p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {subjects.map((s) => {
                const on = focus.includes(s.slug);
                const th = THEMES[s.theme] ?? THEMES.blue;
                return (
                  <button key={s.slug} type="button" aria-pressed={on} onClick={() => setFocus(on ? focus.filter((x) => x !== s.slug) : [...focus, s.slug])}
                    className={cn("flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors", on ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "hairline hover:bg-[rgb(var(--bg-sunken))]")}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white" style={{ background: th.node }}>{s.shortName.slice(0, 2)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{s.name}</span><span className="zh text-xs text-subtle">{s.nameZh} · {s.count} terms</span></span>
                    {on && <Check size={18} className="text-brand-500" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {step === 2 && (
          <section>
            <h1 className="display text-3xl font-semibold">How much Chinese support do you want?</h1>
            <p className="mt-2 text-muted">You can switch anytime from the top bar. The aim is to need translation less over time — at your pace.</p>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Language support mode">
              {MODES.map((m) => (
                <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
                  className={cn("rounded-2xl border p-5 text-left transition-colors", mode === m.id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "hairline hover:bg-[rgb(var(--bg-sunken))]")}>
                  <div className="font-semibold">{m.t} <span className="zh ml-1 text-sm font-normal text-subtle">{m.z}</span></div>
                  <p className="mt-1 text-sm text-muted">{m.d}</p>
                  <p className="mt-3 rounded-lg sunken px-3 py-2 font-mono text-[12px] text-muted">{m.sample}</p>
                </button>
              ))}
            </div>
          </section>
        )}
        {step === 3 && (
          <section>
            <h1 className="display text-3xl font-semibold">Set a sustainable rhythm</h1>
            <p className="mt-2 text-muted">Daily XP is a gentle target, not a rule. Missing a day won’t erase your progress — consistent weeks earn rest days.</p>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Daily goal</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[[30, "Light", "≈5 min"], [60, "Steady", "≈10 min"], [120, "Focused", "≈20 min"], [200, "Intense", "≈30+ min"]].map(([v, l, t]) => (
                  <button key={v} type="button" aria-pressed={dailyGoalXp === v} onClick={() => setDaily(v as number)} className={cn("rounded-2xl border p-4 text-left", dailyGoalXp === v ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "hairline")}>
                    <div className="font-semibold">{l}</div><div className="text-xs text-subtle">{v} XP · {t}</div>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-6 block text-sm font-semibold" htmlFor="ob-exam">AP exam date for your first course (optional)</label>
            <input id="ob-exam" type="date" className={cn(inputCls, "mt-1.5 max-w-xs")} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <p className="mt-1 text-xs text-subtle">Creates a study goal; reviews for that subject get a priority boost.</p>
            {error && <div className="mt-6"><ErrorNote>{error}</ErrorNote></div>}
          </section>
        )}
      </div>
      <div className="mt-8 flex items-center justify-between border-t hairline pt-6">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
        {step < 3 ? (
          <Button variant="accent" onClick={() => setStep(step + 1)} disabled={step === 1 && focus.length === 0}>{step === 1 && focus.length === 0 ? "Choose at least one" : "Continue"}</Button>
        ) : (
          <Button variant="accent" onClick={finish} loading={busy}>Open my mastery map</Button>
        )}
      </div>
    </div>
  );
}
