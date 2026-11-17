import { z } from "zod";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api";
import { invalidateContentCaches } from "@/lib/services/admin";

const body = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]).optional(), name: z.string().trim().min(2).max(80).optional(), nameZh: z.string().max(80).optional(), description: z.string().max(400).optional(), frameworkNote: z.string().max(400).optional(), theme: z.string().max(20).optional() });
export const PATCH = route({ permission: "content:publish", body }, async ({ body, params }) => {
  const s = await prisma.subject.update({ where: { id: params.id }, data: body });
  invalidateContentCaches();
  return s;
});
