import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { can } from "@/lib/auth/permissions";

const body = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  languageMode: z.enum(["FULL", "BALANCED", "EXAM"]).optional(),
  dailyGoalXp: z.number().int().min(20).max(400).optional(),
  focusSubjects: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(8).optional(),
  reducedMotion: z.boolean().optional(),
  leaderboardOptIn: z.boolean().optional(),
  leaderboardAlias: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N} _.-]+$/u, "Alias may contain letters, numbers, spaces, . _ -").nullable().optional(),
  tzOffset: z.number().int().min(-840).max(840).optional(),
});

export const PATCH = route({ body }, async ({ user, body }) => {
  if (body.leaderboardOptIn && !can(user, "leaderboard:join")) throw new HttpError(403, "Demo accounts cannot join the leaderboard.");
  await prisma.user.update({ where: { id: user.id }, data: body });
  return { ok: true };
});
