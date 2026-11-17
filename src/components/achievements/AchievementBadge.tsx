/** Original vector badge art for achievements. Tier sets the metal; icon sets the emblem. */
const TIER = {
  bronze: ["#E9B48A", "#A0623A"],
  silver: ["#E6EBF5", "#7487B3"],
  gold: ["#FCD98A", "#C99419"],
} as const;

const EMBLEM: Record<string, React.ReactNode> = {
  spark: <path d="M32 18 L35 29 L46 32 L35 35 L32 46 L29 35 L18 32 L29 29 Z" />,
  flame: <path d="M32 16 C38 24 42 28 42 35 a10 10 0 0 1 -20 0 c0 -5 3 -8 5 -11 c1 4 3 6 5 6 c-1 -5 -1 -9 0 -14 Z" />,
  crown: <path d="M18 40 L20 24 L27 31 L32 20 L37 31 L44 24 L46 40 Z M19 43 H45 V46 H19 Z" />,
  compass: <><circle cx="32" cy="32" r="13" fill="none" strokeWidth="2.5" stroke="currentColor" /><path d="M32 22 L36 32 L32 42 L28 32 Z" /></>,
  flask: <path d="M27 17 H37 V20 H35 V28 L43 42 a3 3 0 0 1 -3 4 H24 a3 3 0 0 1 -3 -4 L29 28 V20 H27 Z" />,
  book: <path d="M18 22 C24 20 28 21 32 24 C36 21 40 20 46 22 V43 C40 41 36 42 32 45 C28 42 24 41 18 43 Z" />,
  bridge: <path d="M16 40 Q32 18 48 40 V44 H44 V40 Q32 26 20 40 V44 H16 Z M23 34 V44 M41 34 V44 M32 30 V44" stroke="currentColor" strokeWidth="2" />,
  clock: <><circle cx="32" cy="32" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="M32 24 V32 L38 36" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>,
  medal: <><circle cx="32" cy="36" r="9" /><path d="M26 16 L30 27 M38 16 L34 27" stroke="currentColor" strokeWidth="3" /></>,
  target: <><circle cx="32" cy="32" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" /><circle cx="32" cy="32" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" /><circle cx="32" cy="32" r="2.5" /></>,
  map: <path d="M17 22 L27 18 L37 22 L47 18 V42 L37 46 L27 42 L17 46 Z M27 18 V42 M37 22 V46" stroke="currentColor" strokeWidth="2" fill="none" />,
};

export function AchievementBadge({ icon, tier, locked, size = 72 }: { icon: string; tier: "bronze" | "silver" | "gold"; locked?: boolean; size?: number }) {
  const [hi, lo] = TIER[tier];
  const id = `b-${icon}-${tier}-${locked ? "l" : "u"}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={locked ? "opacity-45 grayscale" : undefined}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hi} /><stop offset="1" stopColor={lo} /></linearGradient>
      </defs>
      <path d="M32 3 L56 15 V35 C56 49 45 58 32 61 C19 58 8 49 8 35 V15 Z" fill={`url(#${id})`} />
      <path d="M32 8 L51 18 V35 C51 46 43 53 32 56 C21 53 13 46 13 35 V18 Z" fill="#0B1530" opacity=".9" />
      <g fill={hi} color={hi}>{EMBLEM[icon] ?? EMBLEM.spark}</g>
    </svg>
  );
}
