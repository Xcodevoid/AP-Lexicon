import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

export const GET = route({}, async ({ user }) =>
  prisma.collection.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" }, include: { _count: { select: { terms: true } } } }));

const body = z.object({ name: z.string().trim().min(1).max(40), color: z.enum(["blue", "teal", "coral", "gold", "violet"]).default("blue") });
export const POST = route({ body }, async ({ user, body }) => {
  if ((await prisma.collection.count({ where: { userId: user.id } })) >= 30) throw new HttpError(400, "Collection limit reached (30).");
  const exists = await prisma.collection.findUnique({ where: { userId_name: { userId: user.id, name: body.name } } });
  if (exists) throw new HttpError(409, "You already have a collection with that name.");
  return prisma.collection.create({ data: { userId: user.id, ...body } });
});
