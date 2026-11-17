import Link from "next/link";
import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-900 p-12 text-white md:flex md:flex-col">
        <Link href="/" className="text-white"><Logo /></Link>
        <div className="mt-auto">
          <p className="display text-4xl font-semibold leading-tight">“The goal is not to stop needing Chinese overnight. It is to need it a little less each week.”</p>
          <p className="mt-4 text-ink-300">Bilingual Bridge · 双语桥梁</p>
        </div>
        <svg className="pointer-events-none absolute -right-24 top-24 opacity-30" width="420" height="420" viewBox="0 0 420 420" aria-hidden>
          {[...Array(7)].map((_, i) => <circle key={i} cx="210" cy="210" r={40 + i * 28} fill="none" stroke="#5C86FF" strokeDasharray="3 9" />)}
          <path d="M60 330 C140 260 160 200 210 210 S300 120 360 80" stroke="#2CC6AF" strokeWidth="3" fill="none" />
          {[[60, 330], [140, 262], [210, 210], [290, 140], [360, 80]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill={i < 3 ? "#F5B83D" : "#14244B"} stroke="#fff" strokeWidth="2" />)}
        </svg>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block md:hidden"><Logo /></Link>
          <h1 className="display text-3xl font-semibold">{title}</h1>
          <p className="mb-8 mt-2 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
