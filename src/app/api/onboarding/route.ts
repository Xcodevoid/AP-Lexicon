import { z } from "zod";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api";

const body = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  grade: z.number().int().min(8).max(13).nullable().optional(),
  languageMode: z.enum(["FULL", "BALANCED", "EXAM"]),
  focusSubjects: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(8),
  dailyGoalXp: z.number().int().min(20).max(400),
  tzOffset: z.number().int().min(-840).max(840),
  goal: z.object({ title: z.string().trim().min(2).max(120), subjectSlug: z.string().optional(), targetDate: z.string() }).nullable().optional(),
});

export const POST = route({ body }, async ({ user, body }) => {
  const valid = await prisma.subject.findMany({ where: { slug: { in: body.focusSubjects }, status: "PUBLISHED" }, select: { slug: true } });
  await prisma.user.update({
    where: { id: user.id },
    data: { name: body.name ?? user.name, grade: body.grade ?? null, languageMode: body.languageMode, focusSubjects: valid.map((v) => v.slug), dailyGoalXp: body.dailyGoalXp, tzOffset: body.tzOffset, onboardedAt: new Date() },
  });
  if (body.goal) {
    const d = new Date(body.goal.targetDate);
    if (!Number.isNaN(d.getTime())) await prisma.studyGoal.create({ data: { userId: user.id, title: body.goal.title, subjectSlug: body.goal.subjectSlug || null, targetDate: d } });
  }
  return { ok: true, next: valid[0] ? `/subjects/${valid[0].slug}` : "/dashboard" };
});
