import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

const body = z.object({ subjectId: z.string(), number: z.number().int().min(0).max(99), title: z.string().trim().min(2).max(120), titleZh: z.string().max(120).default("") });
export const POST = route({ permission: "content:write", body }, async ({ body }) => {
  if (await prisma.unit.findUnique({ where: { subjectId_number: { subjectId: body.subjectId, number: body.number } } })) throw new HttpError(409, `Unit ${body.number} already exists`);
  return prisma.unit.create({ data: body });
});
