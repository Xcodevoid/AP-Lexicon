import { cn } from "../ui/cn";
import { inputCls } from "../AuthForm";

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {(error || hint) && <span className={cn("mt-1 block text-xs", error ? "text-coral-500" : "text-subtle")}>{error ?? hint}</span>}
    </label>
  );
}
export const ta = "w-full rounded-xl border hairline bg-[rgb(var(--bg-elev))] p-3 text-[14px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";
export { inputCls };
