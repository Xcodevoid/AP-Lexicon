import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { questionEditSchema, saveQuestion } from "@/lib/services/admin";

export const PATCH = route({ permission: "content:write", body: questionEditSchema }, async ({ body, params }) => {
  if (!(await prisma.question.findUnique({ where: { id: params.id } }))) throw new HttpError(404, "Question not found");
  return saveQuestion(params.id, body);
});
export const DELETE = route({ permission: "content:write" }, async ({ params }) => {
  const n = await prisma.reviewLog.count({ where: { questionId: params.id } });
  if (n) throw new HttpError(409, `This question has ${n} student responses. Unpublish it instead so history is preserved.`);
  await prisma.question.delete({ where: { id: params.id } }).catch(() => { throw new HttpError(404, "Question not found"); });
  return { ok: true };
});
