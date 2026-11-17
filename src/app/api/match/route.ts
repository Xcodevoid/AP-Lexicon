import { z } from "zod";
import { route } from "@/lib/api";
import { recordMatch } from "@/lib/services/learning";

const body = z.object({
  subjectSlug: z.string().regex(/^[a-z0-9-]+$/),
  pairs: z.array(z.object({ termId: z.string(), zhTermId: z.string(), responseMs: z.number().int().min(0).max(600_000) })).min(1).max(20),
  durationMs: z.number().int().min(0).max(600_000),
});
export const POST = route({ body, rate: { limit: 30, windowMs: 60_000, key: "match" } }, async ({ user, body }) => recordMatch(user, body));
