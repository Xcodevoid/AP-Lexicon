"use client";
import type { GameId } from "./catalog";
import { Lightning } from "./Lightning";
import { Connections } from "./Connections";
import { SortIt } from "./SortIt";
import { SpellIt } from "./SpellIt";
import { Boss } from "./Boss";

type Pair = { slug: string; a: string; b: string; aZh: string; bZh: string; keyDifference: string; scenarios: string[] };

export function GamePlayer({ game, subject, pairs, languageMode }: { game: GameId; subject: { slug: string; name: string }; pairs: Pair[]; languageMode: "FULL" | "BALANCED" | "EXAM" }) {
  const showZh = languageMode === "FULL";
  if (game === "lightning") return <Lightning subject={subject} />;
  if (game === "connections") return <Connections subject={subject} showZh={showZh} />;
  if (game === "sort") return <SortIt subject={subject} pairs={pairs} showZh={showZh} />;
  if (game === "spell") return <SpellIt subject={subject} />;
  return <Boss subject={subject} />;
}
