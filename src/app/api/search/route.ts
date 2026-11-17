import { prisma } from "@/lib/db";
import { route } from "@/lib/api";

/** Search all published vocabulary by English, Chinese or definition text. */
export const GET = route({ rate: { limit: 60, windowMs: 60_000, key: "search" } }, async ({ user, req }) => {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 1) return { results: [] };
  const terms = await prisma.term.findMany({
    where: { status: "PUBLISHED", subject: { status: "PUBLISHED" }, OR: [{ term: { contains: q, mode: "insensitive" } }, { zh: { contains: q } }, { definition: { contains: q, mode: "insensitive" } }] },
    take: 30,
    orderBy: [{ term: "asc" }],
    select: { id: true, term: true, zh: true, definition: true, difficulty: true, subject: { select: { shortName: true, slug: true } }, topicId: true, states: { where: { userId: user.id }, select: { status: true, bookmarked: true } } },
  });
  const exact = (t: { term: string }) => (t.term.toLowerCase() === q.toLowerCase() ? 0 : t.term.toLowerCase().startsWith(q.toLowerCase()) ? 1 : 2);
  return { results: terms.sort((a, b) => exact(a) - exact(b)).map((t) => ({ ...t, status: t.states[0]?.status ?? "NOT_STARTED", bookmarked: t.states[0]?.bookmarked ?? false, states: undefined })) };
});
