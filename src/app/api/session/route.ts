import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { buildLearnSession, buildMasteryChallenge, buildReviewSession } from "@/lib/services/learning";

const body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("learn"), topicId: z.string().min(1), stage: z.enum(["RECOGNIZE", "UNDERSTAND", "APPLY", "MASTER"]) }),
  z.object({ mode: z.literal("review"), subjectSlug: z.string().optional() }),
  z.object({ mode: z.literal("mastery"), unitId: z.string().min(1) }),
]);

export const POST = route({ body, rate: { limit: 120, windowMs: 60_000, key: "session" } }, async ({ user, body }) => {
  if (body.mode === "learn") return buildLearnSession(user, body.topicId, body.stage);
  if (body.mode === "mastery") return buildMasteryChallenge(user, body.unitId);
  let subjectId: string | undefined;
  if (body.subjectSlug) {
    const s = await prisma.subject.findUnique({ where: { slug: body.subjectSlug } });
    if (!s) throw new HttpError(404, "Subject not found");
    subjectId = s.id;
  }
  return buildReviewSession(user, subjectId);
});
