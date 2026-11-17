"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";
import { ErrorNote } from "./ui/States";
import { api } from "./ui/fetcher";
import { cn } from "./ui/cn";
import { useToast } from "./ui/Toast";
import { inputCls } from "./AuthForm";

type U = { name: string; email: string; isDemo: boolean; languageMode: "FULL" | "BALANCED" | "EXAM"; dailyGoalXp: number; focusSubjects: string[]; reducedMotion: boolean; leaderboardOptIn: boolean; leaderboardAlias: string | null };

export function SettingsForm({ user, subjects }: { user: U; subjects: { slug: string; name: string }[] }) {
  const [s, setS] = useState(user);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const save = async () => {
    setBusy(true); setError(null);
    try {
      await api("/api/settings", { name: s.name, languageMode: s.languageMode, dailyGoalXp: s.dailyGoalXp, focusSubjects: s.focusSubjects, reducedMotion: s.reducedMotion, leaderboardOptIn: s.leaderboardOptIn, leaderboardAlias: s.leaderboardOptIn ? s.leaderboardAlias : null, tzOffset: -new Date().getTimezoneOffset() }, "PATCH");
      toast({ title: "Settings saved", tone: "success" });
      router.refresh();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const section = "surface mt-6 rounded-2xl p-6";
  return (
    <div>
      {error && <div className="mt-6"><ErrorNote>{error}</ErrorNote></div>}
      <section className={section}>
        <h2 className="font-semibold">Profile</h2>
        <label className="mt-4 block text-sm font-semibold" htmlFor="s-name">Name</label>
        <input id="s-name" className={cn(inputCls, "mt-1")} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
        <p className="mt-2 text-sm text-muted">{s.isDemo ? "Demo account (isolated, may be reset)." : s.email}</p>
      </section>
      <section className={section}>
        <h2 className="font-semibold">Language support · 语言支持</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Language support mode">
          {([["FULL", "Full Support", "全中文辅助"], ["BALANCED", "Balanced", "双语平衡"], ["EXAM", "Exam Mode", "考试模式"]] as const).map(([id, l, z]) => (
            <button key={id} role="radio" aria-checked={s.languageMode === id} onClick={() => setS({ ...s, languageMode: id })} className={cn("rounded-xl border p-3 text-left text-sm", s.languageMode === id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/30" : "hairline")}><b>{l}</b><span className="zh block text-xs text-subtle">{z}</span></button>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="font-semibold">Study rhythm</h2>
        <label className="mt-3 block text-sm font-semibold" htmlFor="s-goal">Daily XP goal: {s.dailyGoalXp}</label>
        <input id="s-goal" type="range" min={20} max={400} step={10} value={s.dailyGoalXp} onChange={(e) => setS({ ...s, dailyGoalXp: Number(e.target.value) })} className="mt-2 w-full accent-brand-500" />
        <fieldset className="mt-5"><legend className="text-sm font-semibold">Focus subjects</legend>
          <div className="mt-2 flex flex-wrap gap-2">{subjects.map((x) => { const on = s.focusSubjects.includes(x.slug); return <button key={x.slug} aria-pressed={on} onClick={() => setS({ ...s, focusSubjects: on ? s.focusSubjects.filter((y) => y !== x.slug) : [...s.focusSubjects, x.slug] })} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", on ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "hairline text-muted")}>{x.name}</button>; })}</div>
        </fieldset>
      </section>
      <section className={section}>
        <h2 className="font-semibold">Accessibility & privacy</h2>
        <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-500" checked={s.reducedMotion} onChange={(e) => setS({ ...s, reducedMotion: e.target.checked })} /> Reduce motion (also follows your system setting)</label>
        <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-500" disabled={s.isDemo} checked={s.leaderboardOptIn} onChange={(e) => setS({ ...s, leaderboardOptIn: e.target.checked, leaderboardAlias: s.leaderboardAlias ?? "" })} /> Appear on the weekly XP leaderboard {s.isDemo && <span className="text-subtle">(not available for demo accounts)</span>}</label>
        {s.leaderboardOptIn && <><label htmlFor="s-alias" className="mt-3 block text-sm font-semibold">Leaderboard nickname</label><input id="s-alias" className={cn(inputCls, "mt-1 max-w-xs")} value={s.leaderboardAlias ?? ""} maxLength={24} onChange={(e) => setS({ ...s, leaderboardAlias: e.target.value })} placeholder="e.g. MarginalMaya" /></>}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="accent" onClick={save} loading={busy}>Save settings</Button>
        <Button variant="secondary" onClick={async () => { await api("/api/auth/logout", {}); router.push("/"); router.refresh(); }}>Sign out</Button>
      </div>
    </div>
  );
}
