import { prisma } from "@/lib/db";
import { StructureEditor } from "@/components/admin/StructureEditor";

export const metadata = { title: "Admin · Subjects" };
export const dynamic = "force-dynamic";
export default async function AdminSubjects() {
  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" }, include: { units: { orderBy: { number: "asc" }, include: { topics: { orderBy: { order: "asc" }, include: { _count: { select: { terms: true } } } } } } } });
  return <StructureEditor subjects={JSON.parse(JSON.stringify(subjects))} />;
}
