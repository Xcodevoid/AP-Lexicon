import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { invalidateContentCaches, saveTerm, termEditSchema } from "@/lib/services/admin";

export const PATCH = route({ permission: "content:write", body: termEditSchema }, async ({ body, params }) => {
  if (!(await prisma.term.findUnique({ where: { id: params.id } }))) throw new HttpError(404, "Term not found");
  return saveTerm(params.id, body);
});
export const DELETE = route({ permission: "content:write" }, async ({ params }) => {
  const n = await prisma.reviewLog.count({ where: { termId: params.id } });
  if (n > 0) throw new HttpError(409, `This term has ${n} student review records. Unpublish it instead of deleting, so history is preserved.`);
  await prisma.term.delete({ where: { id: params.id } }).catch(() => { throw new HttpError(404, "Term not found"); });
  invalidateContentCaches();
  return { ok: true };
});
