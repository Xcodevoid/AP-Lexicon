import { cn } from "./cn";

export type Tone = "neutral" | "blue" | "teal" | "coral" | "gold" | "ink";
const tones: Record<Tone, string> = {
  neutral: "bg-[rgb(var(--bg-sunken))] text-muted",
  blue: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200",
  coral: "bg-coral-50 text-coral-700 dark:bg-coral-700/25 dark:text-coral-200",
  gold: "bg-gold-50 text-gold-700 dark:bg-gold-700/25 dark:text-gold-200",
  ink: "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900",
};
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
