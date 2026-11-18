import { z } from "zod";
import { route } from "@/lib/api";
import { checkConnections } from "@/lib/services/learning";

const body = z.object({ subjectSlug: z.string().regex(/^[a-z0-9-]+$/), termIds: z.array(z.string()).length(4) });
export const POST = route({ body, rate: { limit: 120, windowMs: 60_000, key: "connections-check" } }, async ({ body }) => checkConnections(body.subjectSlug, body.termIds));
