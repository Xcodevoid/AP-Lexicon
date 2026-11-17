export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#0B1530" />
      {/* an open book whose two pages form an "A" bridge between two languages */}
      <path d="M8 28.5 L20 9 L32 28.5" fill="none" stroke="#3D8DF0" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 22.5 C17 20.5 23 20.5 27 22.5" fill="none" stroke="#F5B83D" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="9" r="2.2" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark />
      <span className="leading-none">
        <span className="display block text-[19px] font-semibold tracking-tight">AP Lexicon</span>
        <span className="zh block text-[10px] tracking-[0.3em] text-subtle">学术词汇 · 双语掌握</span>
      </span>
    </span>
  );
}
