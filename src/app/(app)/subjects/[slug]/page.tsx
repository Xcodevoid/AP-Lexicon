import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { subjectMap } from "@/lib/services/stats";
import { MasteryMap } from "@/components/map/MasteryMap";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: `Map · ${(await params).slug}` };
}

export default async function SubjectMapPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ node?: string }> }) {
  const user = await requireUserPage();
  const { slug } = await params;
  const { node } = await searchParams;
  const map = await subjectMap(user.id, slug);
  if (!map) notFound();
  return <MasteryMap data={JSON.parse(JSON.stringify(map))} initialNode={node} />;
}
