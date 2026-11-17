import { z } from "zod";
import { route } from "@/lib/api";
import { markDiscovered } from "@/lib/services/learning";

const body = z.object({ termIds: z.array(z.string().min(1)).min(1).max(50) });
export const POST = route({ body }, async ({ user, body }) => ({ achievements: await markDiscovered(user.id, body.termIds) }));
