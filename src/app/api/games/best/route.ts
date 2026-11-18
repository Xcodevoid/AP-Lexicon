import { z } from "zod";
import { route } from "@/lib/api";
import { saveGameBest } from "@/lib/services/learning";

const body = z.object({ game: z.enum(["lightning", "spell", "boss", "connections", "sort"]), subjectSlug: z.string().regex(/^[a-z0-9-]+$/), score: z.number().min(0).max(500) });
export const POST = route({ body, rate: { limit: 30, windowMs: 60_000, key: "game-best" } }, async ({ user, body }) => saveGameBest(user.id, body.game, body.subjectSlug, body.score));
