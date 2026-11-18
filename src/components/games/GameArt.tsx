/** Small original illustrations for each game card. */
export function GameArt({ game }: { game: string }) {
  const W = "rgba(255,255,255,.9)", F = "rgba(255,255,255,.18)";
  return (
    <svg viewBox="0 0 320 128" className="h-full w-full" aria-hidden>
      {game === "lightning" && <><path d="M170 14 L130 70 H160 L146 116 L194 52 H162 Z" fill={W} />{[30, 60, 90].map((y) => <path key={y} d={`M40 ${y} H100`} stroke={F} strokeWidth="6" strokeLinecap="round" />)}<path d="M220 40 H290 M230 70 H300 M220 100 H280" stroke={F} strokeWidth="6" strokeLinecap="round" /></>}
      {game === "connections" && [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={92 + c * 36} y={10 + r * 28} width="30" height="22" rx="5" fill={r === 0 ? W : F} />))}
      {game === "sort" && <><rect x="40" y="30" width="80" height="80" rx="14" fill={F} /><rect x="200" y="30" width="80" height="80" rx="14" fill={F} /><rect x="135" y="18" width="50" height="36" rx="8" fill={W} /><path d="M150 70 L110 90 M170 70 L210 90" stroke={W} strokeWidth="5" strokeLinecap="round" /></>}
      {game === "spell" && ["S", "P", "E", "L", "L"].map((ch, i) => <g key={i}><rect x={70 + i * 38} y="40" width="32" height="44" rx="7" fill={i < 3 ? W : F} /><text x={86 + i * 38} y="70" textAnchor="middle" fontSize="22" fontWeight="700" fill={i < 3 ? "#7A4FD9" : "white"}>{i < 3 ? ch : "_"}</text></g>)}
      {game === "boss" && <><path d="M160 22 L196 40 V72 C196 96 178 108 160 114 C142 108 124 96 124 72 V40 Z" fill={W} /><rect x="60" y="14" width="200" height="8" rx="4" fill={F} /><rect x="60" y="14" width="120" height="8" rx="4" fill={W} />{[0, 1, 2].map((i) => <path key={i} transform={`translate(${236 + i * 22} 96)`} d="M8 14 C-4 4 2 -4 8 2 C14 -4 20 4 8 14 Z" fill={W} />)}</>}
    </svg>
  );
}
