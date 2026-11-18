export type GameId = "lightning" | "connections" | "sort" | "spell" | "boss";
export const GAMES: { id: GameId; name: string; zh: string; blurb: string; trains: string; time: string; bg: string }[] = [
  { id: "lightning", name: "Lightning Round", zh: "闪电挑战", blurb: "60 seconds. Read the English definition, pick the word. Streaks multiply your score.", trains: "English concept", time: "1 min", bg: "linear-gradient(135deg,#0B1530,#2F6BFF)" },
  { id: "connections", name: "Connections", zh: "词汇连连看", blurb: "16 words, 4 hidden groups. Find which words belong together. Four mistakes and it's over.", trains: "How ideas connect", time: "2–4 min", bg: "linear-gradient(135deg,#0E8778,#2CC6AF)" },
  { id: "sort", name: "Sort It", zh: "快速分类", blurb: "Look-alike concepts, real scenarios. Send each one to the right side before time runs out.", trains: "Telling concepts apart", time: "1–2 min", bg: "linear-gradient(135deg,#B4271A,#FF6B5A)" },
  { id: "spell", name: "Spell It", zh: "拼写挑战", blurb: "Read the definition and type the English word. Exam answers need correct spelling.", trains: "English recall & spelling", time: "2–3 min", bg: "linear-gradient(135deg,#7A4FD9,#9C79EE)" },
  { id: "boss", name: "Boss Battle", zh: "首领对决", blurb: "Correct answers hit the boss; wrong ones cost a heart. Twelve AP-style questions, three hearts.", trains: "AP application", time: "3–5 min", bg: "linear-gradient(135deg,#8F5C10,#F5B83D)" },
];
