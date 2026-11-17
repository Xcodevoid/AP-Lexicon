"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "./cn";

type Toast = { id: number; title: string; body?: string; tone?: "default" | "success" | "error" | "gold" };
const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((x) => [...x.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 4200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={cn("pointer-events-auto w-full max-w-sm animate-fade-up rounded-2xl px-4 py-3 shadow-lift", t.tone === "error" ? "bg-coral-500 text-white" : t.tone === "success" ? "bg-teal-600 text-white" : t.tone === "gold" ? "bg-ink-900 text-gold-200 ring-1 ring-gold-400/50" : "bg-ink-900 text-white")}>
            <div className="text-sm font-semibold">{t.title}</div>
            {t.body && <div className="mt-0.5 text-[13px] opacity-90">{t.body}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
