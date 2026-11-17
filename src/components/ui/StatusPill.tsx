import { cn } from "./cn";

export type MasteryStatus = "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED" | "LOCKED";
const META: Record<MasteryStatus, { label: string; zh: string; cls: string; dot: string }> = {
  LOCKED: { label: "Locked", zh: "未解锁", cls: "bg-[rgb(var(--bg-sunken))] text-subtle", dot: "bg-ink-300" },
  NOT_STARTED: { label: "Not started", zh: "未开始", cls: "bg-[rgb(var(--bg-sunken))] text-muted", dot: "bg-ink-300" },
  LEARNING: { label: "Learning", zh: "学习中", cls: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200", dot: "bg-brand-500" },
  PRACTICING: { label: "Practicing", zh: "练习中", cls: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200", dot: "bg-teal-500" },
  MASTERED: { label: "Mastered", zh: "已掌握", cls: "bg-gold-50 text-gold-700 dark:bg-gold-700/25 dark:text-gold-200", dot: "bg-gold-400" },
};
export const STATUS_COLORS: Record<MasteryStatus, string> = { LOCKED: "#A3B1CF", NOT_STARTED: "#A3B1CF", LEARNING: "#2F6BFF", PRACTICING: "#14A894", MASTERED: "#F5B83D" };

export function StatusPill({ status, showZh, className }: { status: MasteryStatus; showZh?: boolean; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", m.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} aria-hidden />
      {m.label}
      {showZh && <span className="zh font-normal opacity-80">{m.zh}</span>}
    </span>
  );
}
