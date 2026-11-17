import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

export const PATCH = route({ body: z.object({ done: z.boolean() }) }, async ({ user, body, params }) => {
  const g = await prisma.studyGoal.findUnique({ where: { id: params.id } });
  if (!g || g.userId !== user.id) throw new HttpError(404, "Goal not found");
  return prisma.studyGoal.update({ where: { id: g.id }, data: { doneAt: body.done ? new Date() : null } });
});
export const DELETE = route({}, async ({ user, params }) => {
  const r = await prisma.studyGoal.deleteMany({ where: { id: params.id, userId: user.id } });
  if (!r.count) throw new HttpError(404, "Goal not found");
  return { ok: true };
});
