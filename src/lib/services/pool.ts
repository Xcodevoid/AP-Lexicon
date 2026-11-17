import { prisma } from "@/lib/db";
import type { PoolTerm } from "@/lib/engine/questions";

/** Published vocabulary pool per subject, cached briefly in-process. Admin edits call invalidatePool(). */
const cache = new Map<string, { at: number; terms: PoolTerm[] }>();
const TTL = 60_000;

export function invalidatePool() {
  cache.clear();
}

export async function loadPool(subjectId: string): Promise<PoolTerm[]> {
  const hit = cache.get(subjectId);
  if (hit && Date.now() - hit.at < TTL) return hit.terms;
  const rows = await prisma.term.findMany({
    where: { subjectId, status: "PUBLISHED" },
    select: {
      id: true, term: true, zh: true, definition: true, zhExplanation: true, apExample: true, writtenPrompt: true,
      unitId: true, topicId: true, difficulty: true,
      relationsFrom: { select: { toId: true, kind: true } },
    },
    orderBy: { order: "asc" },
  });
  const terms: PoolTerm[] = rows.map((r) => ({
    id: r.id, term: r.term, zh: r.zh, definition: r.definition, zhExplanation: r.zhExplanation, apExample: r.apExample,
    writtenPrompt: r.writtenPrompt, unitId: r.unitId, topicId: r.topicId, difficulty: r.difficulty,
    confusedIds: r.relationsFrom.filter((x) => x.kind === "confused").map((x) => x.toId),
    relatedIds: r.relationsFrom.filter((x) => x.kind === "related").map((x) => x.toId),
  }));
  cache.set(subjectId, { at: Date.now(), terms });
  return terms;
}
