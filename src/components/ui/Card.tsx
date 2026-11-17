import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface rounded-2xl shadow-card", className)} {...rest} />;
}
export function CardHeader({ title, eyebrow, action, className }: { title: React.ReactNode; eyebrow?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="text-[17px] font-semibold leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
