/**
 * Original, parameterised concept diagrams. Term.visual / Question.visual = { kind, variant? }.
 * Each diagram has a text description for screen readers.
 */
import type { ReactNode } from "react";

type V = { kind?: string; variant?: string } | null | undefined;
const INK = "rgb(var(--fg))";
const MUTED = "rgb(var(--fg-subtle))";
const LINE = "rgb(var(--line))";
const B = "#2F6BFF", T = "#14A894", C = "#FF6B5A", G = "#F5B83D";

function Frame({ label, children, h = 200 }: { label: string; children: ReactNode; h?: number }) {
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 320 ${h}`} className="h-auto w-full" role="img" aria-label={label}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={INK} /></marker>
          <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={B} /></marker>
          <marker id="arrC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={C} /></marker>
        </defs>
        {children}
      </svg>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
const Axes = ({ x = "Quantity", y = "Price" }: { x?: string; y?: string }) => (
  <g fontSize="10" fill={MUTED}>
    <path d="M40 20 V170 H300" fill="none" stroke={INK} strokeWidth="1.5" markerEnd="url(#arr)" markerStart="url(#arr)" />
    <text x="300" y="186" textAnchor="end">{x}</text>
    <text x="34" y="16" textAnchor="start">{y}</text>
  </g>
);
const Lbl = ({ x, y, c = INK, children, a = "start" }: { x: number; y: number; c?: string; children: ReactNode; a?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize="11" fontWeight="600" fill={c} textAnchor={a}>{children}</text>
);

function SupplyDemand({ variant }: { variant?: string }) {
  const D = <path d="M60 40 L280 160" stroke={B} strokeWidth="2.5" fill="none" />;
  const S = <path d="M60 160 L280 40" stroke={T} strokeWidth="2.5" fill="none" />;
  const eq = <g><path d="M170 100 H40 M170 100 V170" stroke={MUTED} strokeDasharray="3 3" /><circle cx="170" cy="100" r="4" fill={INK} /><Lbl x={34} y={104} a="end">P*</Lbl><Lbl x={170} y={182} a="middle">Q*</Lbl></g>;
  if (variant === "demand-right")
    return <Frame label="Supply and demand graph. Demand shifts right from D1 to D2, raising equilibrium price and quantity."><Axes />{S}{D}<path d="M100 40 L300 150" stroke={B} strokeWidth="2.5" strokeDasharray="6 4" fill="none" /><path d="M190 105 L222 105" stroke={B} markerEnd="url(#arrB)" /><Lbl x={282} y={160} c={B}>D₁</Lbl><Lbl x={292} y={145} c={B}>D₂</Lbl><Lbl x={282} y={40} c={T}>S</Lbl></Frame>;
  if (variant === "supply-right")
    return <Frame label="Supply shifts right from S1 to S2, lowering equilibrium price and raising quantity."><Axes />{D}{S}<path d="M100 165 L300 60" stroke={T} strokeWidth="2.5" strokeDasharray="6 4" fill="none" /><path d="M200 80 L222 98" stroke={T} markerEnd="url(#arr)" /><Lbl x={282} y={40} c={T}>S₁</Lbl><Lbl x={300} y={60} c={T}>S₂</Lbl><Lbl x={282} y={160} c={B}>D</Lbl></Frame>;
  if (variant === "ceiling")
    return <Frame label="Binding price ceiling below equilibrium. Quantity demanded exceeds quantity supplied, creating a shortage."><Axes />{D}{S}{eq}<path d="M40 130 H300" stroke={C} strokeWidth="2" /><Lbl x={300} y={125} c={C} a="end">Price ceiling</Lbl><path d="M113 136 H226" stroke={C} strokeWidth="5" opacity=".35" /><Lbl x={170} y={150} c={C} a="middle">Shortage</Lbl></Frame>;
  if (variant === "floor")
    return <Frame label="Binding price floor above equilibrium. Quantity supplied exceeds quantity demanded, creating a surplus."><Axes />{D}{S}{eq}<path d="M40 70 H300" stroke={C} strokeWidth="2" /><Lbl x={300} y={64} c={C} a="end">Price floor</Lbl><path d="M113 76 H226" stroke={C} strokeWidth="5" opacity=".35" /><Lbl x={170} y={90} c={C} a="middle">Surplus</Lbl></Frame>;
  if (variant === "surplus")
    return <Frame label="Consumer surplus is the area below demand and above price; producer surplus is the area above supply and below price."><Axes /><path d="M60 40 L170 100 L40 100 L40 40 Z" fill={B} opacity=".18" /><path d="M60 160 L170 100 L40 100 L40 160 Z" fill={T} opacity=".18" />{D}{S}{eq}<Lbl x={70} y={82} c={B}>Consumer surplus</Lbl><Lbl x={70} y={128} c={T}>Producer surplus</Lbl></Frame>;
  if (variant === "ad-as")
    return <Frame label="Aggregate demand and short-run aggregate supply with a vertical long-run aggregate supply at full employment."><Axes x="Real GDP" y="Price level" /><path d="M60 40 L280 160" stroke={B} strokeWidth="2.5" /><path d="M60 160 L280 40" stroke={T} strokeWidth="2.5" /><path d="M170 30 V170" stroke={G} strokeWidth="2.5" /><Lbl x={282} y={160} c={B}>AD</Lbl><Lbl x={282} y={40} c={T}>SRAS</Lbl><Lbl x={175} y={30} c={G}>LRAS</Lbl></Frame>;
  return <Frame label="Supply and demand intersect at the equilibrium price and quantity."><Axes />{D}{S}{eq}<Lbl x={282} y={160} c={B}>D</Lbl><Lbl x={282} y={40} c={T}>S</Lbl></Frame>;
}

function PPC() {
  return (
    <Frame label="Production possibilities curve. Point A on the curve is efficient, B inside is inefficient, C outside is unattainable.">
      <Axes x="Good X" y="Good Y" />
      <path d="M40 40 C 170 40, 260 100, 270 170" stroke={B} strokeWidth="2.5" fill="none" />
      <circle cx="200" cy="72" r="5" fill={T} /><Lbl x={208} y={68} c={T}>A efficient</Lbl>
      <circle cx="120" cy="120" r="5" fill={G} /><Lbl x={128} y={124} c={G}>B inefficient</Lbl>
      <circle cx="262" cy="52" r="5" fill={C} /><Lbl x={240} y={36} c={C}>C unattainable</Lbl>
    </Frame>
  );
}

function CostCurves() {
  return (
    <Frame label="Cost curves: marginal cost crosses average total cost and average variable cost at their minimum points.">
      <Axes x="Quantity" y="Cost" />
      <path d="M60 130 C 110 175, 150 140, 270 30" stroke={C} strokeWidth="2.5" fill="none" />
      <path d="M60 60 C 120 150, 200 140, 285 70" stroke={B} strokeWidth="2.5" fill="none" />
      <path d="M60 90 C 110 160, 180 150, 285 100" stroke={T} strokeWidth="2" fill="none" strokeDasharray="5 4" />
      <Lbl x={262} y={30} c={C}>MC</Lbl><Lbl x={287} y={68} c={B}>ATC</Lbl><Lbl x={287} y={104} c={T}>AVC</Lbl>
      <circle cx="187" cy="128" r="4" fill={INK} /><Lbl x={192} y={146}>min ATC</Lbl>
    </Frame>
  );
}
function MRMC() {
  return (
    <Frame label="A firm maximises profit at the quantity where marginal revenue equals marginal cost.">
      <Axes x="Quantity" y="$" />
      <path d="M60 130 C 110 175, 150 140, 270 30" stroke={C} strokeWidth="2.5" fill="none" />
      <path d="M40 90 H300" stroke={B} strokeWidth="2.5" />
      <path d="M222 90 V170" stroke={MUTED} strokeDasharray="3 3" /><circle cx="222" cy="90" r="4" fill={INK} />
      <Lbl x={270} y={30} c={C}>MC</Lbl><Lbl x={300} y={84} c={B} a="end">MR = P</Lbl><Lbl x={222} y={182} a="middle">Q where MR = MC</Lbl>
    </Frame>
  );
}
function Monopoly() {
  return (
    <Frame label="Monopoly: output where MR equals MC, price read from the demand curve above MC, creating deadweight loss.">
      <Axes x="Quantity" y="Price" />
      <path d="M50 40 L290 160" stroke={B} strokeWidth="2.5" /><path d="M50 40 L170 160" stroke={B} strokeWidth="2" strokeDasharray="5 4" />
      <path d="M60 140 C 120 150, 180 100, 280 50" stroke={C} strokeWidth="2.5" fill="none" />
      <path d="M128 118 L128 79 L176 110 Z" fill={G} opacity=".45" />
      <path d="M128 118 V170 M128 79 H40" stroke={MUTED} strokeDasharray="3 3" />
      <Lbl x={290} y={160} c={B} a="end">D</Lbl><Lbl x={172} y={160} c={B}>MR</Lbl><Lbl x={282} y={48} c={C}>MC</Lbl><Lbl x={36} y={83} a="end">Pm</Lbl><Lbl x={128} y={182} a="middle">Qm</Lbl><Lbl x={180} y={96} c={G}>DWL</Lbl>
    </Frame>
  );
}
function Externality() {
  return (
    <Frame label="Negative externality: marginal social cost lies above marginal private cost, so the market quantity exceeds the socially optimal quantity.">
      <Axes x="Quantity" y="Price" />
      <path d="M60 40 L280 160" stroke={B} strokeWidth="2.5" /><path d="M60 160 L280 40" stroke={T} strokeWidth="2.5" /><path d="M40 130 L240 20" stroke={C} strokeWidth="2.5" />
      <circle cx="170" cy="100" r="4" fill={T} /><circle cx="137" cy="82" r="4" fill={C} />
      <Lbl x={282} y={160} c={B}>MSB = D</Lbl><Lbl x={282} y={40} c={T}>MPC</Lbl><Lbl x={240} y={18} c={C}>MSC</Lbl>
      <Lbl x={170} y={118} c={T} a="middle">Q market</Lbl><Lbl x={126} y={70} c={C} a="end">Q optimal</Lbl>
    </Frame>
  );
}
function Elasticity() {
  return (
    <Frame label="A steep demand curve is relatively inelastic; a flat demand curve is relatively elastic.">
      <Axes />
      <path d="M120 30 L160 165" stroke={B} strokeWidth="2.5" /><path d="M60 90 L290 120" stroke={T} strokeWidth="2.5" />
      <Lbl x={165} y={40} c={B}>Inelastic (steep)</Lbl><Lbl x={200} y={140} c={T}>Elastic (flat)</Lbl>
    </Frame>
  );
}

function Membrane({ variant }: { variant?: string }) {
  const dots = (n: number, x0: number, x1: number, color: string, r = 3.2) =>
    Array.from({ length: n }, (_, i) => <circle key={`${color}${i}`} cx={x0 + ((i * 37) % (x1 - x0))} cy={30 + ((i * 53) % 140)} r={r} fill={color} />);
  const wall = <g>{Array.from({ length: 14 }, (_, i) => <g key={i}><circle cx="160" cy={18 + i * 12.5} r="4" fill={MUTED} /></g>)}<rect x="154" y="14" width="12" height="172" fill="none" stroke={LINE} /></g>;
  if (variant === "osmosis")
    return <Frame label="Osmosis: water moves across a selectively permeable membrane toward the side with higher solute concentration."><Lbl x={20} y={16}>Low solute · high water</Lbl><Lbl x={300} y={16} a="end">High solute</Lbl>{dots(6, 20, 140, C, 6)}{dots(22, 175, 300, C, 6)}{dots(26, 20, 140, B, 2.6)}{dots(10, 175, 300, B, 2.6)}{wall}<path d="M110 110 H210" stroke={B} strokeWidth="3" markerEnd="url(#arrB)" /><Lbl x={160} y={128} c={B} a="middle">H₂O</Lbl></Frame>;
  if (variant === "active")
    return <Frame label="Active transport: a pump protein uses ATP to move particles against their concentration gradient."><Lbl x={20} y={16}>Low concentration</Lbl><Lbl x={300} y={16} a="end">High concentration</Lbl>{dots(5, 20, 140, T, 4)}{dots(20, 175, 300, T, 4)}{wall}<rect x="148" y="85" width="24" height="34" rx="6" fill={G} /><path d="M100 102 H215" stroke={C} strokeWidth="3" markerEnd="url(#arrC)" /><Lbl x={160} y={140} c={C} a="middle">ATP → ADP</Lbl></Frame>;
  return <Frame label="Diffusion: particles move from high to low concentration until evenly distributed."><Lbl x={20} y={16}>High concentration</Lbl><Lbl x={300} y={16} a="end">Low concentration</Lbl>{dots(26, 20, 140, T, 4)}{dots(6, 175, 300, T, 4)}{wall}<path d="M110 100 H210" stroke={T} strokeWidth="3" markerEnd="url(#arr)" /></Frame>;
}
function Enzyme() {
  return (
    <Frame label="Energy diagram: an enzyme lowers the activation energy without changing the overall energy change of the reaction.">
      <Axes x="Reaction progress" y="Energy" />
      <path d="M50 120 C 110 120, 120 30, 160 30 S 220 150, 290 150" stroke={MUTED} strokeWidth="2" fill="none" strokeDasharray="5 4" />
      <path d="M50 120 C 110 120, 125 80, 160 80 S 220 150, 290 150" stroke={T} strokeWidth="2.5" fill="none" />
      <path d="M160 120 V32" stroke={C} markerEnd="url(#arrC)" /><path d="M175 120 V82" stroke={T} markerEnd="url(#arr)" />
      <Lbl x={152} y={24} c={MUTED} a="end">without enzyme</Lbl><Lbl x={182} y={76} c={T}>with enzyme</Lbl><Lbl x={60} y={112}>Reactants</Lbl><Lbl x={290} y={144} a="end">Products</Lbl>
    </Frame>
  );
}
function CentralDogma({ variant }: { variant?: string }) {
  const hl = (k: string) => (variant === k ? C : MUTED);
  return (
    <Frame label="Central dogma: DNA is transcribed into mRNA, which is translated into a polypeptide at the ribosome." h={140}>
      <rect x="10" y="45" width="80" height="44" rx="10" fill="none" stroke={B} strokeWidth="2" /><Lbl x={50} y={72} c={B} a="middle">DNA</Lbl>
      <rect x="120" y="45" width="80" height="44" rx="10" fill="none" stroke={T} strokeWidth="2" /><Lbl x={160} y={72} c={T} a="middle">mRNA</Lbl>
      <rect x="230" y="45" width="80" height="44" rx="10" fill="none" stroke={G} strokeWidth="2" /><Lbl x={270} y={72} c={G} a="middle">Protein</Lbl>
      <path d="M92 67 H116" stroke={hl("transcription")} strokeWidth="2.5" markerEnd="url(#arr)" /><path d="M202 67 H226" stroke={hl("translation")} strokeWidth="2.5" markerEnd="url(#arr)" />
      <Lbl x={104} y={36} c={hl("transcription")} a="middle">transcription</Lbl><Lbl x={214} y={110} c={hl("translation")} a="middle">translation</Lbl>
      <Lbl x={104} y={124} c={MUTED} a="middle">nucleus</Lbl><Lbl x={214} y={130} c={MUTED} a="middle">ribosome</Lbl>
    </Frame>
  );
}
function CellDivision({ variant }: { variant?: string }) {
  const cell = (x: number, y: number, r: number, label: string, n: number) => (
    <g><circle cx={x} cy={y} r={r} fill="none" stroke={T} strokeWidth="2" />{Array.from({ length: n }, (_, i) => <rect key={i} x={x - n * 4 + i * 8} y={y - 7} width="4" height="14" rx="2" fill={i % 2 ? B : C} />)}<Lbl x={x} y={y + r + 14} a="middle" c={MUTED}>{label}</Lbl></g>
  );
  if (variant === "meiosis")
    return <Frame label="Meiosis: one diploid cell divides twice to make four genetically different haploid cells.">{cell(50, 90, 30, "2n", 4)}<path d="M84 90 H108" stroke={INK} markerEnd="url(#arr)" />{cell(140, 55, 22, "n", 2)}{cell(140, 130, 22, "n", 2)}<path d="M166 55 H190 M166 130 H190" stroke={INK} markerEnd="url(#arr)" />{[25, 70, 110, 155].map((y, i) => <g key={i}>{cell(240 + (i % 2) * 40, y, 14, "", 1)}</g>)}<Lbl x={300} y={190} a="end" c={MUTED}>4 unique haploid cells</Lbl></Frame>;
  return <Frame label="Mitosis: one cell divides once into two genetically identical cells.">{cell(70, 95, 36, "2n", 4)}<path d="M112 95 H160" stroke={INK} strokeWidth="2" markerEnd="url(#arr)" />{cell(215, 55, 28, "2n", 4)}{cell(215, 140, 28, "2n", 4)}<Lbl x={300} y={190} a="end" c={MUTED}>2 identical cells</Lbl></Frame>;
}
function Feedback({ variant }: { variant?: string }) {
  const pos = variant === "positive";
  return (
    <Frame label={pos ? "Positive feedback: the response amplifies the original change." : "Negative feedback: the response counteracts the change and returns the system to its set point."} h={170}>
      {[["Stimulus", 40, 40], ["Sensor", 240, 40], ["Response", 240, 130], ["Effect", 40, 130]].map(([l, x, y]) => <g key={l as string}><rect x={(x as number) - 30} y={(y as number) - 16} width="100" height="32" rx="10" fill="none" stroke={B} strokeWidth="1.8" /><Lbl x={(x as number) + 20} y={(y as number) + 4} a="middle">{l}</Lbl></g>)}
      <path d="M112 40 H206" stroke={INK} markerEnd="url(#arr)" /><path d="M260 58 V112" stroke={INK} markerEnd="url(#arr)" /><path d="M206 130 H112" stroke={INK} markerEnd="url(#arr)" />
      <path d="M60 112 V58" stroke={pos ? G : C} strokeWidth="2.5" markerEnd="url(#arrC)" />
      <Lbl x={72} y={90} c={pos ? G : C}>{pos ? "amplifies (+)" : "reverses (−)"}</Lbl>
    </Frame>
  );
}
function Logistic() {
  return (
    <Frame label="Logistic growth: population rises quickly, then levels off at the carrying capacity K.">
      <Axes x="Time" y="Population" />
      <path d="M40 50 H300" stroke={C} strokeDasharray="5 4" /><Lbl x={300} y={44} c={C} a="end">K (carrying capacity)</Lbl>
      <path d="M42 165 C 120 165, 140 55, 290 54" stroke={T} strokeWidth="2.8" fill="none" />
      <path d="M42 165 C 90 160, 110 120, 128 20" stroke={B} strokeWidth="2" fill="none" strokeDasharray="4 4" /><Lbl x={132} y={26} c={B}>exponential</Lbl><Lbl x={220} y={72} c={T}>logistic</Lbl>
    </Frame>
  );
}
function Trophic() {
  return (
    <Frame label="Energy pyramid: about 10 percent of energy passes from one trophic level to the next.">
      {[["Tertiary consumers", 10, 120], ["Secondary consumers", 100, 170], ["Primary consumers", 1000, 220], ["Producers", 10000, 270]].map(([l, e, w], i) => (
        <g key={l as string}><rect x={160 - (w as number) / 2} y={20 + i * 42} width={w as number} height="36" rx="6" fill={[C, G, T, B][i]} opacity=".85" /><Lbl x={160} y={42 + i * 42} c="#fff" a="middle">{l} · {(e as number).toLocaleString()} kcal</Lbl></g>
      ))}
    </Frame>
  );
}
function Vector() {
  return <Frame label="A vector has magnitude and direction; it can be resolved into horizontal and vertical components."><Axes x="x" y="y" /><path d="M40 170 L230 60" stroke={B} strokeWidth="3" markerEnd="url(#arrB)" /><path d="M40 170 H230" stroke={T} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arr)" /><path d="M230 170 V62" stroke={C} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arrC)" /><Lbl x={120} y={100} c={B}>v</Lbl><Lbl x={130} y={186} c={T} a="middle">vₓ = v cos θ</Lbl><Lbl x={236} y={120} c={C}>v_y = v sin θ</Lbl></Frame>;
}
function FreeBody() {
  return <Frame label="Free-body diagram of a box on a table: gravity down, normal force up, applied force right, friction left."><rect x="120" y="80" width="80" height="60" rx="6" fill="none" stroke={INK} strokeWidth="2" /><path d="M160 140 V190" stroke={C} strokeWidth="2.5" markerEnd="url(#arrC)" /><path d="M160 80 V30" stroke={B} strokeWidth="2.5" markerEnd="url(#arrB)" /><path d="M200 110 H280" stroke={T} strokeWidth="2.5" markerEnd="url(#arr)" /><path d="M120 110 H60" stroke={G} strokeWidth="2.5" markerEnd="url(#arr)" /><Lbl x={168} y={186} c={C}>F_g = mg</Lbl><Lbl x={168} y={34} c={B}>F_N</Lbl><Lbl x={284} y={104} c={T} a="end">F_applied</Lbl><Lbl x={58} y={104} c={G}>f</Lbl></Frame>;
}
function MotionGraph({ variant }: { variant?: string }) {
  if (variant === "xt") return <Frame label="Position-time graph: the slope of a tangent line gives instantaneous velocity."><Axes x="Time" y="Position" /><path d="M42 160 C 120 150, 200 90, 290 30" stroke={B} strokeWidth="2.5" fill="none" /><path d="M130 160 L260 60" stroke={C} strokeWidth="2" /><Lbl x={262} y={56} c={C}>slope = velocity</Lbl></Frame>;
  return <Frame label="Velocity-time graph: the slope gives acceleration and the area under the line gives displacement."><Axes x="Time" y="Velocity" /><path d="M42 140 L280 50 L280 170 L42 170 Z" fill={T} opacity=".18" /><path d="M42 140 L280 50" stroke={B} strokeWidth="2.5" /><Lbl x={160} y={150} c={T} a="middle">area = displacement</Lbl><Lbl x={200} y={70} c={B}>slope = acceleration</Lbl></Frame>;
}
function Spring() {
  const coil = Array.from({ length: 12 }, (_, i) => `${60 + i * 12},${i % 2 ? 80 : 120}`).join(" ");
  return <Frame label="Mass on a spring: the restoring force is proportional to displacement and points toward equilibrium (F = −kx)."><path d="M20 40 V160" stroke={INK} strokeWidth="4" /><polyline points={`20,100 50,100 ${coil} 200,100`} fill="none" stroke={B} strokeWidth="2" /><rect x="200" y="75" width="50" height="50" rx="6" fill={T} /><path d="M225 140 H170" stroke={C} strokeWidth="2.5" markerEnd="url(#arrC)" /><Lbl x={200} y={160} c={C} a="middle">F = −kx</Lbl><path d="M150 60 V140" stroke={MUTED} strokeDasharray="3 3" /><Lbl x={150} y={54} c={MUTED} a="middle">equilibrium</Lbl></Frame>;
}
function Pendulum() {
  return <Frame label="Simple pendulum: for small angles the period depends only on length and gravity."><path d="M120 20 H200" stroke={INK} strokeWidth="3" /><path d="M160 20 L210 150" stroke={B} strokeWidth="2" /><path d="M160 20 V160" stroke={MUTED} strokeDasharray="3 3" /><circle cx="210" cy="150" r="14" fill={T} /><Lbl x={168} y={70} c={MUTED}>θ</Lbl><Lbl x={196} y={90} c={B}>L</Lbl><Lbl x={160} y={192} a="middle">T = 2π√(L/g)</Lbl></Frame>;
}
function Curve({ variant }: { variant?: string }) {
  if (variant === "limit") return <Frame label="Limit: f(x) approaches L as x approaches a even if f(a) is undefined (an open circle)."><Axes x="x" y="y" /><path d="M50 150 C 120 140, 150 95, 170 90 S 230 50, 290 40" stroke={B} strokeWidth="2.5" fill="none" /><circle cx="170" cy="90" r="5" fill="rgb(var(--bg-elev))" stroke={B} strokeWidth="2" /><path d="M170 90 V170 M170 90 H40" stroke={MUTED} strokeDasharray="3 3" /><Lbl x={170} y={184} a="middle">a</Lbl><Lbl x={34} y={94} a="end">L</Lbl></Frame>;
  if (variant === "tangent") return <Frame label="The derivative at a point is the slope of the tangent line there."><Axes x="x" y="y" /><path d="M50 160 C 120 150, 200 100, 290 30" stroke={B} strokeWidth="2.5" fill="none" /><path d="M110 150 L270 70" stroke={C} strokeWidth="2" /><circle cx="190" cy="110" r="4" fill={C} /><Lbl x={200} y={124} c={C}>slope = f′(a)</Lbl></Frame>;
  if (variant === "area") return <Frame label="The definite integral is the signed area between the curve and the x-axis."><Axes x="x" y="y" /><path d="M80 170 L80 110 C 130 70, 200 60, 260 90 L260 170 Z" fill={T} opacity=".22" /><path d="M50 130 C 130 60, 200 55, 290 100" stroke={B} strokeWidth="2.5" fill="none" /><Lbl x={170} y={140} c={T} a="middle">∫ f(x) dx</Lbl></Frame>;
  if (variant === "concavity") return <Frame label="Concave up curves bend upward (f″ > 0); concave down curves bend downward (f″ < 0)."><Axes x="x" y="y" /><path d="M50 60 C 90 160, 130 160, 165 60" stroke={T} strokeWidth="2.5" fill="none" /><path d="M175 150 C 210 40, 250 40, 290 150" stroke={C} strokeWidth="2.5" fill="none" /><Lbl x={108} y={60} c={T} a="middle">concave up</Lbl><Lbl x={232} y={160} c={C} a="middle">concave down</Lbl></Frame>;
  if (variant === "secant") return <Frame label="The average rate of change is the slope of the secant line through two points."><Axes x="x" y="y" /><path d="M50 160 C 120 150, 200 100, 290 30" stroke={B} strokeWidth="2.5" fill="none" /><path d="M80 158 L270 48" stroke={G} strokeWidth="2" /><circle cx="100" cy="155" r="4" fill={G} /><circle cx="250" cy="58" r="4" fill={G} /><Lbl x={200} y={120} c={G}>secant slope</Lbl></Frame>;
  if (variant === "sine") return <Frame label="A sinusoidal function repeats every period; amplitude is half the distance between maximum and minimum."><Axes x="x" y="y" /><path d={`M40 100 ${Array.from({ length: 26 }, (_, i) => `L ${40 + i * 10} ${100 - 50 * Math.sin((i * 10 * Math.PI) / 120)}`).join(" ")}`} stroke={B} strokeWidth="2.5" fill="none" /><path d="M40 50 V100" stroke={C} markerEnd="url(#arrC)" /><Lbl x={46} y={70} c={C}>amplitude</Lbl><path d="M40 160 H280" stroke={T} markerEnd="url(#arr)" /><Lbl x={160} y={156} c={T} a="middle">period</Lbl></Frame>;
  return <Frame label="Graph of a function."><Axes x="x" y="y" /><path d="M50 150 C 120 140, 200 60, 290 40" stroke={B} strokeWidth="2.5" fill="none" /></Frame>;
}
function Riemann() {
  const f = (x: number) => 160 - 0.0018 * (x - 40) * (x - 40);
  return <Frame label="Left Riemann sum: rectangles use the left endpoint height; for an increasing function this underestimates the area."><Axes x="x" y="y" />{[60, 100, 140, 180, 220].map((x) => <rect key={x} x={x} y={f(x)} width="40" height={170 - f(x)} fill={T} opacity=".25" stroke={T} />)}<path d={`M50 ${f(50)} ${Array.from({ length: 25 }, (_, i) => `L ${50 + i * 10} ${f(50 + i * 10)}`).join(" ")}`} stroke={B} strokeWidth="2.5" fill="none" /></Frame>;
}
function Normal() {
  const pts = Array.from({ length: 61 }, (_, i) => { const x = -3 + i * 0.1; return `${160 + x * 45},${170 - 140 * Math.exp(-(x * x) / 2)}`; }).join(" ");
  return <Frame label="Normal distribution: about 68 percent within 1 standard deviation, 95 percent within 2, 99.7 percent within 3."><path d="M20 170 H300" stroke={INK} /><polyline points={pts} fill="none" stroke={B} strokeWidth="2.5" />{[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M${160 + k * 45} 170 V${170 - 140 * Math.exp(-(k * k) / 2)}`} stroke={MUTED} strokeDasharray="3 3" />)}<Lbl x={160} y={186} a="middle">μ</Lbl><Lbl x={160} y={120} c={T} a="middle">68%</Lbl><Lbl x={160} y={160} c={G} a="middle">95%</Lbl></Frame>;
}
function Scatter() {
  const pts = [[60, 150], [80, 140], [95, 130], [120, 120], [140, 112], [160, 95], [180, 98], [200, 80], [220, 70], [240, 62], [262, 48], [110, 135], [190, 85]];
  return <Frame label="Scatter plot with a positive linear association and a least-squares regression line."><Axes x="Explanatory (x)" y="Response (y)" />{pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={B} opacity=".75" />)}<path d="M50 156 L280 40" stroke={C} strokeWidth="2" /><Lbl x={282} y={36} c={C} a="end">ŷ = a + bx</Lbl></Frame>;
}

export function Visual({ visual, className }: { visual: V; className?: string }) {
  if (!visual?.kind) return null;
  const v = visual.variant;
  const map: Record<string, ReactNode> = {
    "supply-demand": <SupplyDemand variant={v} />, ppc: <PPC />, "cost-curves": <CostCurves />, "mr-mc": <MRMC />, monopoly: <Monopoly />, externality: <Externality />, elasticity: <Elasticity />,
    membrane: <Membrane variant={v} />, enzyme: <Enzyme />, "central-dogma": <CentralDogma variant={v} />, "cell-division": <CellDivision variant={v} />, feedback: <Feedback variant={v} />, logistic: <Logistic />, trophic: <Trophic />,
    vector: <Vector />, "free-body": <FreeBody />, "motion-graph": <MotionGraph variant={v} />, spring: <Spring />, pendulum: <Pendulum />, curve: <Curve variant={v} />, riemann: <Riemann />, normal: <Normal />, scatter: <Scatter />,
  };
  const node = map[visual.kind];
  if (!node) return null;
  return <div className={className}>{node}</div>;
}

export const VISUAL_KINDS = ["supply-demand", "ppc", "cost-curves", "mr-mc", "monopoly", "externality", "elasticity", "membrane", "enzyme", "central-dogma", "cell-division", "feedback", "logistic", "trophic", "vector", "free-body", "motion-graph", "spring", "pendulum", "curve", "riemann", "normal", "scatter"];
