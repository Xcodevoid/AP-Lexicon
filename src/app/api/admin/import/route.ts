import { z } from "zod";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api";
import { commitTerms, parseTermUpload } from "@/lib/content/import";
import { slugify } from "@/lib/content/schema";
import { invalidateContentCaches } from "@/lib/services/admin";

const body = z.object({
  filename: z.string().max(200).default("upload"),
  format: z.enum(["csv", "json"]),
  text: z.string().min(1, "File is empty").max(5_000_000, "File too large (5 MB max)"),
  commit: z.boolean().default(false),
  onDuplicate: z.enum(["skip", "update"]).default("skip"),
});

/** Dry-run by default: validates every row and reports errors/duplicates. With commit=true, writes valid rows. */
export const POST = route({ permission: "content:import", body, rate: { limit: 20, windowMs: 60_000, key: "import" } }, async ({ user, body }) => {
  const subjects = await prisma.subject.findMany({ select: { slug: true, name: true, shortName: true } });
  const resolve = (s: string) => {
    const k = s.trim().toLowerCase();
    return subjects.find((x) => x.slug === k || x.name.toLowerCase() === k || x.shortName.toLowerCase() === k || slugify(x.name) === slugify(s))?.slug
      ?? (k === "all ap courses" ? "ap-exam-language" : null);
  };
  const parsed = parseTermUpload(body.format, body.text, resolve);
  // duplicates against existing DB terms
  const existing = await prisma.term.findMany({ select: { externalId: true, term: true, subject: { select: { slug: true } } } });
  const exKeys = new Map(existing.map((e) => [`${e.subject.slug}::${slugify(e.term)}`, e.externalId]));
  const exIds = new Set(existing.map((e) => e.externalId));
  const dbDuplicates = parsed.rows
    .filter((r) => exKeys.has(`${r.record.subject}::${slugify(r.record.term)}`) && !(r.record.id && exIds.has(r.record.id)))
    .map((r) => ({ row: r.row, term: r.record.term, existingId: exKeys.get(`${r.record.subject}::${slugify(r.record.term)}`)! }));
  const updatesById = parsed.rows.filter((r) => r.record.id && exIds.has(r.record.id)).length;
  const preview = parsed.rows.slice(0, 8).map((r) => ({ row: r.row, subject: r.record.subject, unit: r.record.unit, term: r.record.term, zh: r.record.zh, definition: r.record.definition, status: r.record.status }));
  const report = { valid: parsed.rows.length, errors: parsed.errors.slice(0, 300), errorCount: parsed.errors.length, duplicatesInFile: parsed.duplicatesInFile, dbDuplicates, updatesById, preview };
  if (!body.commit) return { dryRun: true, ...report };
  const result = await commitTerms(prisma, parsed.rows, { onDuplicate: body.onDuplicate });
  await prisma.importJob.create({ data: { userId: user.id, filename: body.filename, format: body.format, created: result.created, updated: result.updated, skipped: result.skipped + parsed.duplicatesInFile.length, errors: [...parsed.errors.slice(0, 200), ...result.skippedRows.map((s) => ({ row: s.row, message: s.reason }))] } });
  invalidateContentCaches();
  return { dryRun: false, ...report, result };
});
