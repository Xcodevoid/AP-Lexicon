import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

const body = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), name: z.string().trim().min(2).max(80), nameZh: z.string().trim().min(1).max(80), shortName: z.string().trim().min(1).max(20), description: z.string().max(400).default(""), theme: z.string().default("blue") });
export const POST = route({ permission: "content:write", body }, async ({ body }) => {
  if (await prisma.subject.findUnique({ where: { slug: body.slug } })) throw new HttpError(409, "That slug is already used");
  const order = (await prisma.subject.aggregate({ _max: { order: true } }))._max.order ?? 0;
  return prisma.subject.create({ data: { ...body, order: order + 1, status: "DRAFT" } });
});
