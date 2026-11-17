import { cn } from "./cn";

export function EmptyState({ title, body, action, art, className }: { title: string; body?: React.ReactNode; action?: React.ReactNode; art?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed hairline px-6 py-12 text-center", className)}>
      {art ?? (
        <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden className="mb-4 text-brand-300">
          <rect x="6" y="10" width="40" height="30" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="26" y="18" width="40" height="30" rx="6" fill="rgb(var(--bg-elev))" stroke="currentColor" strokeWidth="2" />
          <path d="M34 30h22M34 37h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {body && <div className="mt-1 max-w-md text-sm text-muted">{body}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return <div role="alert" className="rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700 dark:border-coral-700/40 dark:bg-coral-700/15 dark:text-coral-200">{children}</div>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}
