"use client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { stroke: "rgb(var(--fg-subtle))", fontSize: 11, tickLine: false, axisLine: false } as const;
function Tip({ active, payload, label, fmt }: { active?: boolean; payload?: { value: number; payload: Record<string, number | string> }[]; label?: string; fmt: (p: Record<string, number | string>, label?: string) => React.ReactNode }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-lift">{fmt(payload[0].payload, label)}</div>;
}

/** Single-series bar chart: correct answers per day (tooltip also shows total answers and XP). */
export function WeeklyBars({ data }: { data: { day: string; answers: number; correct: number; xp: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: new Date(d.day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" }) }));
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" strokeDasharray="2 4" />
          <XAxis dataKey="label" {...axis} />
          <YAxis allowDecimals={false} {...axis} width={40} />
          <Tooltip cursor={{ fill: "rgb(var(--bg-sunken))" }} content={<Tip fmt={(p) => <><div className="font-semibold">{p.day}</div><div>{p.correct} correct of {p.answers} answers</div><div>{p.xp} XP</div></>} />} />
          <Bar dataKey="correct" fill="var(--dim-rec)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Single-series line: share of answers where Chinese support was opened, per week. */
export function HintTrend({ data }: { data: { week: string; hintRate: number; total: number }[] }) {
  const rows = data.map((d) => ({ ...d, pct: Math.round(d.hintRate * 100) }));
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" strokeDasharray="2 4" />
          <XAxis dataKey="week" {...axis} tickFormatter={(w) => new Date(w + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
          <YAxis domain={[0, 100]} unit="%" {...axis} width={44} />
          <Tooltip content={<Tip fmt={(p) => <><div className="font-semibold">Week of {p.week}</div><div>Chinese support opened on {p.pct}% of {p.total} answers</div></>} />} />
          <Line isAnimationActive={false} dataKey="pct" stroke="var(--dim-con)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: "rgb(var(--bg-elev))" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
