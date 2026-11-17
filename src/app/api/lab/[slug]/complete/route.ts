import { z } from "zod";
import { route } from "@/lib/api";
import { completeLab } from "@/lib/services/learning";

const body = z.object({ score: z.number().int().min(0).max(50), total: z.number().int().min(1).max(50) });
export const POST = route({ body }, async ({ user, body, params }) => completeLab(user.id, params.slug, body.score, body.total));
