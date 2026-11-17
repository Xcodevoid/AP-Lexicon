import { z } from "zod";
import { route } from "@/lib/api";
import { recordAnswer } from "@/lib/services/learning";

const body = z.object({
  ref: z.string().min(3).max(600),
  choice: z.string().max(100).optional(),
  text: z.string().max(4000).optional(),
  selfScore: z.number().min(0).max(1).optional(),
  usedHint: z.boolean().default(false),
  chineseShown: z.boolean().default(false),
  responseMs: z.number().int().min(0).max(3_600_000).default(0),
  mode: z.enum(["learn", "review", "mastery", "lab", "challenge"]).default("learn"),
});

export const POST = route({ body, rate: { limit: 240, windowMs: 60_000, key: "answer" } }, async ({ user, body }) => recordAnswer(user, body));
