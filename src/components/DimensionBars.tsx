const DIMS = [
  { k: "recognition", label: "Translation recognition", zh: "翻译识别", color: "var(--dim-rec)" },
  { k: "concept", label: "English concept", zh: "英文概念理解", color: "var(--dim-con)" },
  { k: "application", label: "AP application", zh: "AP 情境应用", color: "var(--dim-app)" },
] as const;

/** Three labelled meters (not a chart): average evidence-based score per mastery dimension. */
export function DimensionBars({ values, n }: { values: { recognition: number; concept: number; application: number }; n: number }) {
  return (
    <ul className="space-y-4">
      {DIMS.map((d) => (
        <li key={d.k}>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-medium">{d.label} <span className="zh text-xs text-subtle">{d.zh}</span></span>
            <span className="font-mono font-semibold">{n ? Math.round(values[d.k] * 100) : "—"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full sunken" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(values[d.k] * 100)} aria-label={d.label}>
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${values[d.k] * 100}%`, background: d.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
