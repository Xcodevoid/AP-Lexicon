import { cn } from "./cn";

export function ProgressBar({ value, className, tone = "brand", label }: { value: number; className?: string; tone?: "brand" | "teal" | "gold" | "coral"; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  const color = { brand: "bg-brand-500", teal: "bg-teal-500", gold: "bg-gold-400", coral: "bg-coral-400" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full sunken", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label}>
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", color)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 6, label, children, color = "rgb(47 107 255)" }: { value: number; size?: number; stroke?: number; label?: string; children?: React.ReactNode; color?: string }) {
  const v = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset .8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-semibold">{children}</div>
    </div>
  );
}
