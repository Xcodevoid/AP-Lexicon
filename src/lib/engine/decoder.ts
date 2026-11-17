/**
 * Deterministic AP Question Decoder. No AI: longest-match glossary lookup plus rule-based
 * detection of command verbs, connectors, skills and wording traps. It never reveals answers.
 */
export interface GlossaryEntry {
  id: string;
  term: string;
  zh: string;
  definition: string;
  zhExplanation?: string;
  subjectSlug: string;
  subjectShort: string;
  category: string;
}

export interface Highlight {
  start: number;
  end: number;
  kind: "term" | "command" | "connector" | "trap";
  entryId?: string;
  text: string;
}

/** Common English words that are also glossary entries; only matched as subject terms when a subject is chosen. */
const AMBIGUOUS = new Set([
  "set", "state", "mean", "range", "power", "work", "force", "list", "bit", "byte", "class", "object", "method", "period", "function", "element",
  "factor", "constant", "degree", "origin", "index", "claim", "trend", "support", "label", "plot", "approach", "reverse", "evaluate", "define",
  "describe", "identify", "explain", "variable", "evidence", "sample", "experiment", "population", "demand", "supply", "sequence", "series",
  "pressure", "density", "tension", "mass", "weight", "speed", "slope", "limit", "vertex", "parallel", "similar", "union", "relation", "frequency",
  "amplitude", "current", "resistance", "argument", "parameter", "statistic", "assignment", "iteration", "procedure", "selection", "protocol",
  "packet", "abstraction", "mutation", "fitness", "niche", "receptor", "translation", "transcription", "revolution", "tribute", "bureaucracy",
]);

export const COMMAND_FAMILIES: { verbs: string[]; skill: string; skillZh: string; plan: string; planZh: string }[] = [
  { verbs: ["identify", "state", "define", "label", "classify"], skill: "Recall a fact, definition or feature", skillZh: "回忆事实、定义或特征", plan: "Give a short, precise answer. One accurate sentence is usually enough.", planZh: "简短准确地回答，一句话通常即可。" },
  { verbs: ["describe", "outline", "summarize"], skill: "Describe characteristics or a process", skillZh: "描述特征或过程", plan: "Say WHAT happens or what it looks like, with specific details. You do not need to explain why unless asked.", planZh: "说明“是什么/怎么样”，给出具体细节；除非题目要求，不必解释原因。" },
  { verbs: ["explain", "justify", "account for", "predict", "infer"], skill: "Causal reasoning", skillZh: "因果推理", plan: "Build a because → therefore chain: name the cause, the mechanism, and the result. Use the key terms.", planZh: "建立“因为 → 所以”的因果链：原因、机制、结果，并使用关键术语。" },
  { verbs: ["compare", "contrast", "distinguish"], skill: "Comparison", skillZh: "比较", plan: "Address BOTH items directly. Use a comparison word (whereas, similarly, in contrast) and a specific point for each side.", planZh: "两边都要写到，用 whereas / similarly / in contrast 等比较词，并给出各自的具体要点。" },
  { verbs: ["evaluate", "assess", "to what extent", "qualify", "support", "refute", "corroborate"], skill: "Argumentation and evaluation", skillZh: "论证与评价", plan: "Take a defensible position, support it with specific evidence, and acknowledge a limitation or counterpoint.", planZh: "提出可辩护的立场，用具体证据支持，并承认局限或反方观点。" },
  { verbs: ["calculate", "determine", "estimate"], skill: "Quantitative reasoning", skillZh: "定量推理", plan: "Write the relationship or formula, substitute values with units, and state the result in context.", planZh: "写出关系式或公式，代入带单位的数值，并结合情境写出结论。" },
  { verbs: ["sketch", "plot", "construct", "illustrate", "draw"], skill: "Representation (graph or diagram)", skillZh: "图形或图示表达", plan: "Label axes, curves and key points. Show the change the question asks about (shift, equilibrium, trend).", planZh: "标注坐标轴、曲线和关键点，画出题目所问的变化（移动、均衡、趋势）。" },
  { verbs: ["interpret", "analyze", "synthesize"], skill: "Data or source analysis", skillZh: "数据或史料分析", plan: "Point to the specific evidence (value, trend, phrase), then explain what it means in this context.", planZh: "指出具体证据（数值、趋势、语句），再解释它在该情境中的含义。" },
];

const CUES: { re: RegExp; skill: string; skillZh: string }[] = [
  { re: /^\s*(what (is|are|does)|what's|define|which term|which of the following (is|best describes))\b/i, skill: "Recall a definition or identify a concept", skillZh: "回忆定义或识别概念" },
  { re: /\b(graph|curve|diagram|axis|axes|shift(?:s|ed)?)\b/i, skill: "Interpreting a graph or diagram", skillZh: "图表解读" },
  { re: /\b(data|table|values?|percent|%|rate)\b/i, skill: "Working with data", skillZh: "数据处理" },
  { re: /\b(source|document|passage|excerpt|author|historian|speech|letter)\b/i, skill: "Source analysis (author, purpose, context)", skillZh: "史料分析（作者、目的、背景）" },
  { re: /\b(experiment|hypothesis|control group|independent variable|dependent variable|trial)\b/i, skill: "Experimental design", skillZh: "实验设计" },
  { re: /\b(scenario|suppose|assume|if (?:the|a|an))\b/i, skill: "Applying a concept to a new scenario", skillZh: "在新情境中应用概念" },
];

const TRAPS: { re: RegExp; note: string; noteZh: string }[] = [
  { re: /\b(NOT|EXCEPT|LEAST)\b/, note: "Negative wording: you are looking for the option that does NOT fit.", noteZh: "否定式提问：要找“不符合”的选项。" },
  { re: /\b(most likely|best|primarily|most directly)\b/i, note: "Several options may be partly true — choose the one that fits BEST or most directly.", noteZh: "多个选项可能部分正确，要选“最”符合的。" },
  { re: /\b(always|never|only|all)\b/i, note: "Absolute words (always, never, only) are often signs of an incorrect option.", noteZh: "always / never / only 等绝对化词语常出现在错误选项中。" },
  { re: /\b(increase by|increase to|decrease by|decrease to)\b/i, note: "“by” gives the amount of change; “to” gives the final value.", noteZh: "by 表示变化量，to 表示最终值。" },
  { re: /\b(ceteris paribus|other things (?:being )?equal|holding .* constant)\b/i, note: "Only the stated factor changes; keep everything else fixed.", noteZh: "其他条件不变：只改变题目所说的因素。" },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface DecodeResult {
  highlights: Highlight[];
  terms: (GlossaryEntry & { occurrences: number })[];
  commands: { verb: string; entryId?: string; skill: string; skillZh: string; plan: string; planZh: string }[];
  connectors: { text: string; entryId?: string }[];
  skills: { skill: string; skillZh: string }[];
  traps: { note: string; noteZh: string }[];
  subjectGuess: { slug: string; short: string; matches: number } | null;
  wording: { longSentences: string[]; wordCount: number; passive: boolean };
  steps: { title: string; titleZh: string; body: string; bodyZh: string }[];
}

export function decodeQuestion(text: string, glossary: GlossaryEntry[], opts: { subjectSlug?: string } = {}): DecodeResult {
  const src = text.slice(0, 6000);
  const occupied: boolean[] = new Array(src.length).fill(false);
  const highlights: Highlight[] = [];
  const mark = (start: number, end: number, h: Omit<Highlight, "start" | "end" | "text">) => {
    for (let i = start; i < end; i++) if (occupied[i]) return false;
    for (let i = start; i < end; i++) occupied[i] = true;
    highlights.push({ start, end, text: src.slice(start, end), ...h });
    return true;
  };

  const commandsEntries = glossary.filter((g) => g.category === "Exam command verb");
  const connectorEntries = glossary.filter((g) => g.category === "Logical connector");
  const subjectEntries = glossary.filter((g) => g.subjectSlug !== "ap-exam-language");

  // 1) command verbs (incl. "to what extent", "account for")
  const commandsFound: DecodeResult["commands"] = [];
  const allVerbs = [...new Set([...COMMAND_FAMILIES.flatMap((f) => f.verbs), ...commandsEntries.map((c) => c.term.toLowerCase())])].sort((a, b) => b.length - a.length);
  for (const verb of allVerbs) {
    const re = new RegExp(`\\b${escapeRe(verb)}(?:s|d|ed)?\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      // command verbs are imperative: sentence start, after a list marker/quote, or after "and"/"then"/"(a)"
      const before = src.slice(Math.max(0, m.index - 12), m.index);
      const isImperative = m.index === 0 || /(^|[.?!:;\n)\]]\s*|\b(and|then|also|briefly)\s+|\(\w\)\s*)$/i.test(before);
      if (!isImperative && verb !== "to what extent") continue;
      const entry = commandsEntries.find((c) => c.term.toLowerCase() === verb);
      if (mark(m.index, m.index + m[0].length, { kind: "command", entryId: entry?.id })) {
        const fam = COMMAND_FAMILIES.find((f) => f.verbs.includes(verb));
        if (!commandsFound.some((c) => c.verb === verb))
          commandsFound.push({ verb, entryId: entry?.id, skill: fam?.skill ?? "Follow the task verb", skillZh: fam?.skillZh ?? "按指令动词作答", plan: fam?.plan ?? entry?.definition ?? "", planZh: fam?.planZh ?? entry?.zhExplanation ?? "" });
      }
    }
  }

  // 2) subject terms — choose subject: explicit, else the one with most unambiguous matches
  const counts = new Map<string, number>();
  const candidate = subjectEntries.filter((g) => !opts.subjectSlug || g.subjectSlug === opts.subjectSlug);
  const sorted = [...candidate].sort((a, b) => b.term.length - a.term.length);
  const prelim: { e: GlossaryEntry; idx: number; len: number }[] = [];
  for (const e of sorted) {
    if (e.term.length < 3) continue;
    if (!opts.subjectSlug && AMBIGUOUS.has(e.term.toLowerCase())) continue;
    const re = new RegExp(`(?<![A-Za-z])${escapeRe(e.term)}(?:s|es)?(?![A-Za-z])`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) prelim.push({ e, idx: m.index, len: m[0].length });
  }
  prelim.forEach((p) => counts.set(p.e.subjectSlug, (counts.get(p.e.subjectSlug) ?? 0) + 1));
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const guess = opts.subjectSlug ?? best?.[0];
  const termCounts = new Map<string, number>();
  // prefer the guessed subject's entries, longest first
  prelim
    .sort((a, b) => Number(b.e.subjectSlug === guess) - Number(a.e.subjectSlug === guess) || b.len - a.len)
    .forEach((p) => {
      if (mark(p.idx, p.idx + p.len, { kind: "term", entryId: p.e.id })) termCounts.set(p.e.id, (termCounts.get(p.e.id) ?? 0) + 1);
    });

  // 3) connectors
  const connectorsFound: DecodeResult["connectors"] = [];
  for (const c of [...connectorEntries].sort((a, b) => b.term.length - a.term.length)) {
    const re = new RegExp(`\\b${escapeRe(c.term)}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      if (mark(m.index, m.index + m[0].length, { kind: "connector", entryId: c.id }) && !connectorsFound.some((x) => x.entryId === c.id)) connectorsFound.push({ text: c.term, entryId: c.id });
    }
  }

  // 4) traps
  const traps: DecodeResult["traps"] = [];
  for (const t of TRAPS) {
    const m = src.match(t.re);
    if (m && m.index != null) {
      mark(m.index, m.index + m[0].length, { kind: "trap" });
      traps.push({ note: t.note, noteZh: t.noteZh });
    }
  }

  const skills: DecodeResult["skills"] = [];
  commandsFound.forEach((c) => { if (!skills.some((s) => s.skill === c.skill)) skills.push({ skill: c.skill, skillZh: c.skillZh }); });
  CUES.forEach((c) => { if (c.re.test(src) && !skills.some((s) => s.skill === c.skill)) skills.push({ skill: c.skill, skillZh: c.skillZh }); });
  if (/\d/.test(src) && !skills.some((s) => s.skill.startsWith("Quantitative"))) skills.push({ skill: "Numbers in the stem — check units and what is being asked", skillZh: "题干含数字：注意单位和所求量" });

  const sentences = src.split(/(?<=[.?!])\s+/).filter(Boolean);
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 28);
  const passive = /\b(is|are|was|were|been|being)\s+\w+ed\b/i.test(src);

  const termsOut = [...termCounts.entries()].map(([id, n]) => ({ ...glossary.find((g) => g.id === id)!, occurrences: n }));
  const steps: DecodeResult["steps"] = [];
  if (commandsFound.length) steps.push({ title: "1 · What is the task?", titleZh: "1 · 题目要求做什么？", body: commandsFound.map((c) => `“${c.verb}” → ${c.plan}`).join("\n"), bodyZh: commandsFound.map((c) => `“${c.verb}” → ${c.planZh}`).join("\n") });
  else steps.push({ title: "1 · What is the task?", titleZh: "1 · 题目要求做什么？", body: "No explicit command verb found. Rephrase the question as “Which option…?” or “What happens to…?” before answering.", bodyZh: "没有找到明确的指令动词。先把题目改写成“哪个选项……？”或“……会发生什么？”再作答。" });
  if (termsOut.length) steps.push({ title: "2 · Recall the key concepts", titleZh: "2 · 回忆关键概念", body: termsOut.slice(0, 6).map((t) => `${t.term}: ${t.definition}`).join("\n"), bodyZh: termsOut.slice(0, 6).map((t) => `${t.term}（${t.zh}）`).join("、") });
  if (traps.length || longSentences.length) steps.push({ title: "3 · Watch the wording", titleZh: "3 · 注意措辞", body: [...traps.map((t) => t.note), ...(longSentences.length ? ["Long sentence: split it at commas and find the subject and main verb."] : [])].join("\n"), bodyZh: [...traps.map((t) => t.noteZh), ...(longSentences.length ? ["长句：按逗号拆分，先找主语和谓语。"] : [])].join("\n") });
  steps.push({ title: `${steps.length + 1} · Plan before answering`, titleZh: `${steps.length + 1} · 先计划再作答`, body: "Predict your answer in one sentence BEFORE looking at the options (or writing). Then check that it uses the key terms above in English.", bodyZh: "在看选项（或动笔）之前，先用一句话预测答案，再确认使用了上面的英文关键词。" });

  return {
    highlights: highlights.sort((a, b) => a.start - b.start),
    terms: termsOut,
    commands: commandsFound,
    connectors: connectorsFound,
    skills,
    traps,
    subjectGuess: guess ? { slug: guess, short: glossary.find((g) => g.subjectSlug === guess)?.subjectShort ?? guess, matches: counts.get(guess) ?? 0 } : null,
    wording: { longSentences, wordCount: src.split(/\s+/).filter(Boolean).length, passive },
    steps,
  };
}
