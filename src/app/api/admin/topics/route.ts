import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

const body = z.object({ unitId: z.string(), code: z.string().trim().min(1).max(10), title: z.string().trim().min(2).max(120), titleZh: z.string().max(120).default(""), objectives: z.array(z.string().max(300)).max(10).default([]) });
export const POST = route({ permission: "content:write", body }, async ({ body }) => {
  if (await prisma.topic.findUnique({ where: { unitId_code: { unitId: body.unitId, code: body.code } } })) throw new HttpError(409, `Mission ${body.code} already exists in this unit`);
  const order = await prisma.topic.count({ where: { unitId: body.unitId } });
  return prisma.topic.create({ data: { ...body, order } });
});
