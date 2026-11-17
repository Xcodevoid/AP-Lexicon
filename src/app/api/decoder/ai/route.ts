import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { HttpError, route } from "@/lib/api";

/**
 * Optional AI interpretation for the Question Decoder. Runs only on the server; the API key never
 * reaches the browser. If ANTHROPIC_API_KEY is not set this returns 503 and the deterministic decoder
 * keeps working. The model is told never to reveal or choose an answer.
 */
const SYSTEM = `You help Chinese-speaking high school students understand the WORDING of AP-style exam questions in English.
Rules:
- Never state, hint at, or eliminate answer choices, and never solve the question. If asked to, decline briefly.
- Explain what the question is asking, the meaning of difficult academic words or sentence structures, and what kind of reasoning is needed.
- Write in clear, simple English. After each section add a short Simplified Chinese explanation (中文).
- Be concise: at most about 220 English words plus the Chinese.
Use these sections with Markdown headings: "What the question asks", "Tricky wording", "Skill being tested", "How to approach it".`;

const body = z.object({ text: z.string().trim().min(10).max(4000), subject: z.string().max(80).optional() });

export const POST = route({ body, rate: { limit: 8, windowMs: 60_000, key: "decoder-ai" } }, async ({ body }) => {
  if (!process.env.ANTHROPIC_API_KEY) throw new HttpError(503, "AI interpretation is not configured on this server. The deterministic decoder still works.");
  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: `${body.subject ? `Course: ${body.subject}\n` : ""}Question to explain (do not answer it):\n"""\n${body.text}\n"""` }],
    });
    if (response.stop_reason === "refusal") throw new HttpError(422, "The AI could not explain this text. Try the deterministic decoder results above.");
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    return { text, model: response.model, disclaimer: "AI-generated explanation — may contain mistakes. It does not reveal answers." };
  } catch (e) {
    if (e instanceof HttpError) throw e;
    if (e instanceof Anthropic.RateLimitError) throw new HttpError(429, "The AI service is busy. Please try again shortly.");
    if (e instanceof Anthropic.AuthenticationError) throw new HttpError(503, "AI service credentials are invalid on this server.");
    if (e instanceof Anthropic.APIError) throw new HttpError(502, "The AI service returned an error.");
    throw e;
  }
});
