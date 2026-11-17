import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { TermTable } from "@/components/admin/TermTable";

export const metadata = { title: "Admin · Terms" };
export const dynamic = "force-dynamic";
const PAGE = 50;
export default async function AdminTerms({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const where: Prisma.TermWhereInput = {
    ...(sp.subject ? { subject: { slug: sp.subject } } : {}),
    ...(sp.status ? { status: sp.status as "DRAFT" | "PUBLISHED" } : {}),
    ...(sp.review ? { reviewStatus: sp.review as "APPROVED" } : {}),
    ...(sp.q ? { OR: [{ term: { contains: sp.q, mode: "insensitive" } }, { zh: { contains: sp.q } }, { externalId: { contains: sp.q } }] } : {}),
  };
  const [subjects, total, terms] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.term.count({ where }),
    prisma.term.findMany({ where, orderBy: [{ subject: { order: "asc" } }, { unit: { number: "asc" } }, { order: "asc" }], skip: (page - 1) * PAGE, take: PAGE, select: { id: true, externalId: true, term: true, zh: true, status: true, reviewStatus: true, difficulty: true, subject: { select: { shortName: true } }, unit: { select: { number: true } }, _count: { select: { questions: true } } } }),
  ]);
  return <TermTable terms={terms} subjects={subjects} total={total} page={page} pageSize={PAGE} filters={sp} />;
}
