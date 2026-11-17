import { z } from "zod";
import { route } from "@/lib/api";
import { decodeQuestion } from "@/lib/engine/decoder";
import { loadGlossary } from "@/lib/services/glossary";

const body = z.object({ text: z.string().trim().min(10, "Paste a full question (at least 10 characters)").max(6000), subjectSlug: z.string().regex(/^[a-z0-9-]+$/).optional() });
export const POST = route({ body, rate: { limit: 60, windowMs: 60_000, key: "decoder" } }, async ({ body }) => {
  const result = decodeQuestion(body.text, await loadGlossary(), { subjectSlug: body.subjectSlug });
  return { ...result, aiAvailable: !!process.env.ANTHROPIC_API_KEY };
});
