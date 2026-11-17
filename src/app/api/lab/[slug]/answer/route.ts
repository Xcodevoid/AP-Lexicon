import { z } from "zod";
import { route } from "@/lib/api";
import { recordLabAnswer } from "@/lib/services/learning";

const body = z.object({ index: z.number().int().min(0).max(50), answer: z.enum(["A", "B"]), responseMs: z.number().int().min(0).max(600_000) });
export const POST = route({ body, rate: { limit: 120, windowMs: 60_000, key: "lab" } }, async ({ user, body, params }) => recordLabAnswer(user, { slug: params.slug, ...body }));
