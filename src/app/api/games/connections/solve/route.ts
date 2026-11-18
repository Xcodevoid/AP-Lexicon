import { z } from "zod";
import { route } from "@/lib/api";
import { solveConnections } from "@/lib/services/learning";

const body = z.object({ subjectSlug: z.string().regex(/^[a-z0-9-]+$/), termIds: z.array(z.string()).min(1).max(16) });
export const POST = route({ body }, async ({ body }) => solveConnections(body.subjectSlug, body.termIds));
