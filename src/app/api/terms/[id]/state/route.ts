import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { checkAchievements } from "@/lib/services/stats";

const body = z.object({ bookmarked: z.boolean().optional(), note: z.string().max(4000).optional() });

/** Bookmark / note on a term. Creating a state here is not mastery evidence. */
export const PATCH = route({ body }, async ({ user, body, params }) => {
  const term = await prisma.term.findUnique({ where: { id: params.id }, select: { id: true, status: true } });
  if (!term || term.status !== "PUBLISHED") throw new HttpError(404, "Term not found");
  const state = await prisma.userTermState.upsert({
    where: { userId_termId: { userId: user.id, termId: term.id } },
    update: body,
    create: { userId: user.id, termId: term.id, ...body },
  });
  const achievements = body.note ? await checkAchievements(user.id) : [];
  return { bookmarked: state.bookmarked, note: state.note, achievements };
});
