import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

const body = z.object({ title: z.string().trim().min(2).max(120), subjectSlug: z.string().regex(/^[a-z0-9-]+$/).optional(), targetDate: z.string(), targetTerms: z.number().int().min(1).max(500).default(20) });
export const POST = route({ body }, async ({ user, body }) => {
  const d = new Date(body.targetDate);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, "Invalid date");
  if ((await prisma.studyGoal.count({ where: { userId: user.id, doneAt: null } })) >= 10) throw new HttpError(400, "You can have up to 10 active goals.");
  return prisma.studyGoal.create({ data: { userId: user.id, title: body.title, subjectSlug: body.subjectSlug ?? null, targetDate: d, targetTerms: body.targetTerms } });
});
