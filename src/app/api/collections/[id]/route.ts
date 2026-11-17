import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

async function own(userId: string, id: string) {
  const c = await prisma.collection.findUnique({ where: { id } });
  if (!c || c.userId !== userId) throw new HttpError(404, "Collection not found");
  return c;
}
const body = z.object({ name: z.string().trim().min(1).max(40).optional(), add: z.array(z.string()).max(200).optional(), remove: z.array(z.string()).max(200).optional() });
export const PATCH = route({ body }, async ({ user, body, params }) => {
  const c = await own(user.id, params.id);
  if (body.name) await prisma.collection.update({ where: { id: c.id }, data: { name: body.name } });
  if (body.add?.length) {
    const ok = await prisma.term.findMany({ where: { id: { in: body.add }, status: "PUBLISHED" }, select: { id: true } });
    await prisma.collectionTerm.createMany({ data: ok.map((t) => ({ collectionId: c.id, termId: t.id })), skipDuplicates: true });
  }
  if (body.remove?.length) await prisma.collectionTerm.deleteMany({ where: { collectionId: c.id, termId: { in: body.remove } } });
  return { ok: true };
});
export const DELETE = route({}, async ({ user, params }) => {
  const c = await own(user.id, params.id);
  await prisma.collection.delete({ where: { id: c.id } });
  return { ok: true };
});
