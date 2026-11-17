import { prisma } from "@/lib/db";
import type { GlossaryEntry } from "@/lib/engine/decoder";

let cache: { at: number; entries: GlossaryEntry[] } | null = null;
/** Published glossary used by the Question Decoder (cached for 5 minutes). */
export async function loadGlossary(): Promise<GlossaryEntry[]> {
  if (cache && Date.now() - cache.at < 300_000) return cache.entries;
  const rows = await prisma.term.findMany({
    where: { status: "PUBLISHED", subject: { status: "PUBLISHED" } },
    select: { id: true, term: true, zh: true, definition: true, zhExplanation: true, category: true, subject: { select: { slug: true, shortName: true } } },
  });
  const entries = rows.map((r) => ({ id: r.id, term: r.term, zh: r.zh, definition: r.definition, zhExplanation: r.zhExplanation, category: r.category, subjectSlug: r.subject.slug, subjectShort: r.subject.shortName }));
  cache = { at: Date.now(), entries };
  return entries;
}
export function invalidateGlossary() { cache = null; }
