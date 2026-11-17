import { requireUserPage } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { reviewQueue } from "@/lib/services/learning";
import { ReviewView } from "@/components/learn/ReviewView";

export const metadata = { title: "Review" };
export default async function ReviewPage() {
  const user = await requireUserPage();
  const { dueCount } = await reviewQueue(user.id, { limit: 1 });
  const bySubject = await prisma.$queryRaw<{ slug: string; name: string; n: bigint }[]>`
    SELECT sub.slug, sub.name, count(*) AS n FROM "UserTermState" s JOIN "Term" t ON t.id = s."termId" JOIN "Subject" sub ON sub.id = t."subjectId"
    WHERE s."userId" = ${user.id} AND s.reps > 0 AND s.due <= now() AND t.status = 'PUBLISHED' GROUP BY 1, 2 ORDER BY 3 DESC`;
  const upcoming = await prisma.$queryRaw<{ day: string; n: bigint }[]>`
    SELECT to_char(s.due + make_interval(mins => ${user.tzOffset}::int), 'YYYY-MM-DD') AS day, count(*) AS n FROM "UserTermState" s
    WHERE s."userId" = ${user.id} AND s.reps > 0 AND s.due > now() AND s.due < now() + interval '7 days' GROUP BY 1 ORDER BY 1`;
  const started = await prisma.userTermState.count({ where: { userId: user.id, reps: { gt: 0 } } });
  return (
    <ReviewView
      dueCount={dueCount}
      started={started}
      bySubject={bySubject.map((b) => ({ slug: b.slug, name: b.name, n: Number(b.n) }))}
      upcoming={upcoming.map((u) => ({ day: u.day, n: Number(u.n) }))}
      languageMode={user.languageMode}
    />
  );
}
