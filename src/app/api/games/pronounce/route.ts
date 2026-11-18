import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";

/** Spell It "Hear it" hint: returns the English term so the browser can pronounce it. */
export const GET = route({ rate: { limit: 60, windowMs: 60_000, key: "pronounce" } }, async ({ req }) => {
  const id = req.nextUrl.searchParams.get("termId") ?? "";
  const t = await prisma.term.findFirst({ where: { id, status: "PUBLISHED" }, select: { term: true } });
  if (!t) throw new HttpError(404, "Term not found");
  return { term: t.term };
});
