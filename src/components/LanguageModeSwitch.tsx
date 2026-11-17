"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./ui/fetcher";
import { cn } from "./ui/cn";

const MODES = [
  { id: "FULL", label: "Full", zh: "全中文辅助", title: "Full Support — English with extensive Chinese explanations" },
  { id: "BALANCED", label: "Balanced", zh: "双语平衡", title: "Balanced — English first, Chinese hints on request" },
  { id: "EXAM", label: "Exam", zh: "考试模式", title: "Exam Mode — English only; Chinese appears in post-question review" },
] as const;

export function LanguageModeSwitch({ initial }: { initial: "FULL" | "BALANCED" | "EXAM" }) {
  const [mode, setMode] = useState(initial);
  const router = useRouter();
  const set = async (m: typeof mode) => {
    setMode(m);
    await api("/api/settings", { languageMode: m }, "PATCH").catch(() => setMode(initial));
    router.refresh();
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
