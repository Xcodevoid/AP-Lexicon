import { z } from "zod";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api";
import { invalidateContentCaches } from "@/lib/services/admin";

const body = z.object({ ids: z.array(z.string()).min(1).max(500), status: z.enum(["DRAFT", "PUBLISHED"]).optional(), reviewStatus: z.enum(["DRAFT", "TEACHER_REVIEW", "APPROVED", "NEEDS_FIX"]).optional() });
export const PATCH = route({ permission: "content:publish", body }, async ({ body }) => {
  const r = await prisma.term.updateMany({ where: { id: { in: body.ids } }, data: { ...(body.status ? { status: body.status } : {}), ...(body.reviewStatus ? { reviewStatus: body.reviewStatus } : {}) } });
  invalidateContentCaches();
  return { updated: r.count };
});
