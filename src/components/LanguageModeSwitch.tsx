"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./ui/fetcher";
import { useToast } from "./ui/Toast";
import { cn } from "./ui/cn";

const MODES = [
  { id: "FULL", label: "Full", zh: "全中文辅助", title: "Full Support — English with extensive Chinese explanations", effect: "Chinese is shown with every question and answer option, and on every word card." },
  { id: "BALANCED", label: "Balanced", zh: "双语平衡", title: "Balanced — English first, Chinese hints on request", effect: "Questions are in English; tap “Show Chinese hint” whenever you need it. Word cards show both languages." },
  { id: "EXAM", label: "Exam", zh: "考试模式", title: "Exam Mode — English only; Chinese appears in post-question review", effect: "English only, like the real exam. Chinese is hidden on cards (tap to reveal) and appears in explanations after you answer." },
] as const;

export function LanguageModeSwitch({ initial }: { initial: "FULL" | "BALANCED" | "EXAM" }) {
  const [mode, setMode] = useState(initial);
  const router = useRouter();
  const toast = useToast();
  const set = async (m: typeof mode) => {
    if (m === mode) return;
    const prev = mode;
    setMode(m);
    try {
      await api("/api/settings", { languageMode: m }, "PATCH");
      const info = MODES.find((x) => x.id === m)!;
      toast({ title: `${info.label} mode · ${info.zh}`, body: info.effect });
      router.refresh();
    } catch (e) {
      setMode(prev);
      toast({ title: "Mode not changed", body: (e as Error).message, tone: "error" });
    }
  };
  return (
    <div role="radiogroup" aria-label="Language support mode" className="hidden items-center rounded-xl sunken p-0.5 sm:flex">
      {MODES.map((m) => (
        <button key={m.id} role="radio" aria-checked={mode === m.id} title={m.title} onClick={() => set(m.id)}
          className={cn("rounded-[10px] px-2.5 py-1 text-xs font-semibold transition-colors", mode === m.id ? "bg-[rgb(var(--bg-elev))] text-[rgb(var(--fg))] shadow-card" : "text-subtle hover:text-[rgb(var(--fg))]")}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
