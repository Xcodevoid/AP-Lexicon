import Papa from "papaparse";
import type { Prisma, PrismaClient } from "@prisma/client";
import { duplicateKey, slugify, termExternalId, termRecord, type ContentBundle, type TermRecord } from "./schema";

/** Header aliases so the master spreadsheet (exported to CSV) and our template both import cleanly. */
const HEADER_ALIASES: Record<string, string> = {
  id: "id", externalid: "id", "term id": "id",
  subject: "subject", course: "subject", "subject slug": "subject",
  unit: "unit", "unit number": "unit",
  unittitle: "unitTitle", "unit title": "unitTitle",
  topic: "topic", "topic code": "topic", topictitle: "topicTitle", "topic title": "topicTitle", "topic / map node": "topicTitle",
  term: "term", "english term": "term", english: "term", "english（英文）": "term",
  zh: "zh", chinese: "zh", "中文翻译": "zh", "中文": "zh", "chinese translation": "zh",
  definition: "definition", "english definition": "definition",
  zhexplanation: "zhExplanation", "中文概念解释": "zhExplanation", "chinese explanation": "zhExplanation",
  pronunciation: "pronunciation", ipa: "pronunciation", audiourl: "audioUrl", "audio url": "audioUrl",
  difficulty: "difficulty", category: "category", tags: "tags",
  misconceptions: "misconceptions", "common misconceptions": "misconceptions",
  apexample: "apExample", "ap example": "apExample", example: "apExample",
  realworld: "realWorld", "real world": "realWorld", "real-world application": "realWorld",
  visual: "visual", imageurl: "imageUrl", "image url": "imageUrl",
  related: "related", "related terms": "related", confusedwith: "confusedWith", "confused with": "confusedWith",
  writtenprompt: "writtenPrompt", "original practice prompt": "writtenPrompt", "written prompt": "writtenPrompt",
  priority: "priority", source: "source", "reference url": "source", reviewstatus: "reviewStatus", "review status": "reviewStatus", status: "status",
};

export const TEMPLATE_COLUMNS = [
  "id", "subject", "unit", "unitTitle", "topic", "topicTitle", "term", "zh", "definition", "zhExplanation", "pronunciation", "audioUrl",
  "difficulty", "category", "tags", "misconceptions", "apExample", "realWorld", "visual", "imageUrl", "related", "confusedWith",
  "writtenPrompt", "priority", "source", "reviewStatus", "status",
];

export interface RowError { row: number; field?: string; message: string }
export interface ParsedImport {
  rows: { row: number; record: TermRecord }[];
  errors: RowError[];
  duplicatesInFile: { row: number; firstRow: number; term: string }[];
}

/** Subject names (e.g. "AP Microeconomics") are resolved to slugs by the caller-provided lookup. */
export function parseTermUpload(format: "csv" | "json", text: string, resolveSubject: (s: string) => string | null): ParsedImport {
  let rawRows: Record<string, unknown>[] = [];
  const errors: RowError[] = [];
  if (format === "csv") {
    const res = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim(),
    });
    res.errors.slice(0, 20).forEach((e) => errors.push({ row: (e.row ?? 0) + 2, message: `CSV: ${e.message}` }));
    rawRows = res.data;
  } else {
    try {
      const data = JSON.parse(text);
      rawRows = Array.isArray(data) ? data : Array.isArray(data?.terms) ? data.terms : [];
      if (!rawRows.length) errors.push({ row: 0, message: "JSON must be an array of term objects or { terms: [...] }" });
      rawRows = rawRows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [HEADER_ALIASES[k.trim().toLowerCase()] ?? k, v])));
    } catch (e) {
      errors.push({ row: 0, message: `Invalid JSON: ${(e as Error).message}` });
    }
  }
  if (rawRows.length > 5000) {
    errors.push({ row: 0, message: "Too many rows in one file (max 5000). Split the file and import in parts." });
    rawRows = rawRows.slice(0, 5000);
  }

  const rows: ParsedImport["rows"] = [];
  const seen = new Map<string, number>();
  const duplicatesInFile: ParsedImport["duplicatesInFile"] = [];
  rawRows.forEach((raw, i) => {
    const rowNo = format === "csv" ? i + 2 : i + 1; // CSV: header is row 1
    const subjectRaw = String(raw.subject ?? "").trim();
    const slug = resolveSubject(subjectRaw);
    if (!slug) {
      errors.push({ row: rowNo, field: "subject", message: subjectRaw ? `Unknown subject "${subjectRaw}". Create it first in Admin → Subjects.` : "subject is required" });
      return;
    }
    const parsed = termRecord.safeParse({ ...raw, subject: slug, unit: raw.unit === "" || raw.unit == null ? 0 : raw.unit });
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => errors.push({ row: rowNo, field: iss.path.join("."), message: iss.message }));
      return;
    }
    const key = duplicateKey(parsed.data.subject, parsed.data.term);
    if (seen.has(key)) {
      duplicatesInFile.push({ row: rowNo, firstRow: seen.get(key)!, term: parsed.data.term });
      return;
    }
    seen.set(key, rowNo);
    rows.push({ row: rowNo, record: parsed.data });
  });
  return { rows, errors, duplicatesInFile };
}

type Tx = Prisma.TransactionClient | PrismaClient;

async function ensureUnitAndTopic(tx: Tx, subjectId: string, rec: TermRecord, cache: Map<string, { unitId: string; topicId: string | null }>) {
  const ck = `${subjectId}:${rec.unit}:${rec.topic}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const unit = await tx.unit.upsert({
    where: { subjectId_number: { subjectId, number: rec.unit } },
    update: rec.unitTitle ? {} : {},
    create: { subjectId, number: rec.unit, title: rec.unitTitle || `Unit ${rec.unit}` },
  });
  let topicId: string | null = null;
  const code = rec.topic || `${rec.unit}.1`;
  const topic = await tx.topic.upsert({
    where: { unitId_code: { unitId: unit.id, code } },
    update: {},
    create: { unitId: unit.id, code, title: rec.topicTitle || unit.title, order: Number(code.split(".")[1] ?? 1) || 1 },
  });
  topicId = topic.id;
  const v = { unitId: unit.id, topicId };
  cache.set(ck, v);
  return v;
}

function termData(rec: TermRecord) {
  return {
    term: rec.term,
    zh: rec.zh,
    definition: rec.definition,
    zhExplanation: rec.zhExplanation,
    pronunciation: rec.pronunciation || null,
    audioUrl: rec.audioUrl || null,
    difficulty: rec.difficulty,
    category: rec.category || "Subject concept",
    tags: rec.tags,
    misconceptions: rec.misconceptions,
    apExample: rec.apExample,
    realWorld: rec.realWorld,
    visual: (rec.visual ?? undefined) as Prisma.InputJsonValue | undefined,
    imageUrl: rec.imageUrl || null,
    writtenPrompt: rec.writtenPrompt,
    priority: rec.priority || "Medium",
    source: rec.source,
    reviewStatus: rec.reviewStatus,
    status: rec.status,
  };
}

export interface CommitResult { created: number; updated: number; skipped: number; skippedRows: { row: number; term: string; reason: string }[] }

/**
 * Upsert validated term rows. Duplicate policy:
 *  - same externalId → update
 *  - different externalId but same subject + English term → "skip" (default) or "update" the existing term
 */
export async function commitTerms(db: Tx, rows: ParsedImport["rows"], opts: { onDuplicate: "skip" | "update" }): Promise<CommitResult> {
  const subjects = await db.subject.findMany({ select: { id: true, slug: true } });
  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s.id]));
  const existing = await db.term.findMany({ select: { id: true, externalId: true, subjectId: true, term: true } });
  const byExt = new Map(existing.map((t) => [t.externalId, t]));
  const byKey = new Map(existing.map((t) => [`${t.subjectId}::${slugify(t.term)}`, t]));
  const cache = new Map<string, { unitId: string; topicId: string | null }>();
  const result: CommitResult = { created: 0, updated: 0, skipped: 0, skippedRows: [] };
  const relationQueue: { termId: string; subjectId: string; related: string[]; confused: string[] }[] = [];
  let order = 0;

  for (const { row, record } of rows) {
    const subjectId = subjectBySlug.get(record.subject);
    if (!subjectId) {
      result.skipped++;
      result.skippedRows.push({ row, term: record.term, reason: "subject not found" });
      continue;
    }
    const ext = termExternalId(record.subject, record.term, record.id);
    const { unitId, topicId } = await ensureUnitAndTopic(db, subjectId, record, cache);
    const sameKey = byKey.get(`${subjectId}::${slugify(record.term)}`);
    let target = byExt.get(ext);
    if (!target && sameKey) {
      if (opts.onDuplicate === "skip") {
        result.skipped++;
        result.skippedRows.push({ row, term: record.term, reason: `duplicate of existing term (${sameKey.externalId})` });
        continue;
      }
      target = sameKey;
    }
    const data = { ...termData(record), subjectId, unitId, topicId, order: order++ };
    let termId: string;
    if (target) {
      await db.term.update({ where: { id: target.id }, data });
      termId = target.id;
      result.updated++;
    } else {
      const t = await db.term.create({ data: { ...data, externalId: ext } });
      termId = t.id;
      byKey.set(`${subjectId}::${slugify(record.term)}`, { id: t.id, externalId: ext, subjectId, term: record.term });
      result.created++;
    }
    relationQueue.push({ termId, subjectId, related: record.related, confused: record.confusedWith });
  }

  // Relations: resolve by English term within the same subject, falling back to cross-course exam language.
  const all = await db.term.findMany({ select: { id: true, subjectId: true, term: true, subject: { select: { slug: true } } } });
  const examLang = all.filter((t) => t.subject.slug === "ap-exam-language");
  const find = (subjectId: string, name: string) =>
    all.find((t) => t.subjectId === subjectId && t.term.toLowerCase() === name.toLowerCase()) ??
    examLang.find((t) => t.term.toLowerCase() === name.toLowerCase());
  for (const r of relationQueue) {
    await db.termRelation.deleteMany({ where: { fromId: r.termId } });
    const rels: { fromId: string; toId: string; kind: string }[] = [];
    for (const n of r.related) { const t = find(r.subjectId, n); if (t && t.id !== r.termId) rels.push({ fromId: r.termId, toId: t.id, kind: "related" }); }
    for (const n of r.confused) { const t = find(r.subjectId, n); if (t && t.id !== r.termId) rels.push({ fromId: r.termId, toId: t.id, kind: "confused" }); }
    if (rels.length) await db.termRelation.createMany({ data: rels, skipDuplicates: true });
  }
  return result;
}

/** Import a full compiled bundle (subjects, units, topics, terms, questions, confusion pairs). Used by the seed. */
export async function importBundle(db: PrismaClient, bundle: ContentBundle, log: (s: string) => void = () => {}) {
  for (const s of bundle.subjects) {
    const subject = await db.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, nameZh: s.nameZh, shortName: s.shortName, theme: s.theme, order: s.order, description: s.description, frameworkNote: s.frameworkNote },
      create: { slug: s.slug, name: s.name, nameZh: s.nameZh, shortName: s.shortName, theme: s.theme, order: s.order, description: s.description, frameworkNote: s.frameworkNote, status: "PUBLISHED" },
    });
    for (const u of s.units) {
      const unit = await db.unit.upsert({
        where: { subjectId_number: { subjectId: subject.id, number: u.number } },
        update: { title: u.title, titleZh: u.titleZh },
        create: { subjectId: subject.id, number: u.number, title: u.title, titleZh: u.titleZh },
      });
      let i = 0;
      for (const t of u.topics) {
        await db.topic.upsert({
          where: { unitId_code: { unitId: unit.id, code: t.code } },
          update: { title: t.title, titleZh: t.titleZh, objectives: t.objectives, order: i },
          create: { unitId: unit.id, code: t.code, title: t.title, titleZh: t.titleZh, objectives: t.objectives, order: i },
        });
        i++;
      }
    }
  }
  const termResult = await commitTerms(db, bundle.terms.map((record, i) => ({ row: i + 1, record })), { onDuplicate: "update" });
  log(`terms: ${termResult.created} created, ${termResult.updated} updated, ${termResult.skipped} skipped`);

  const subjects = await db.subject.findMany();
  const sid = new Map(subjects.map((s) => [s.slug, s.id]));
  const terms = await db.term.findMany({ select: { id: true, subjectId: true, term: true, subject: { select: { slug: true } } } });
  const findTerm = (subjectSlug: string, name: string) =>
    terms.find((t) => t.subject.slug === subjectSlug && t.term.toLowerCase() === name.toLowerCase()) ??
    terms.find((t) => t.subject.slug === "ap-exam-language" && t.term.toLowerCase() === name.toLowerCase());
  const units = await db.unit.findMany();

  let pairs = 0;
  for (const p of bundle.pairs) {
    const a = findTerm(p.subject, p.termA);
    const b = findTerm(p.subject, p.termB);
    if (!a || !b) continue;
    const data = { subjectId: sid.get(p.subject)!, termAId: a.id, termBId: b.id, keyDifference: p.keyDifference, keyDifferenceZh: p.keyDifferenceZh, dimensions: p.dimensions, scenarios: p.scenarios, visual: (p.visual ?? undefined) as Prisma.InputJsonValue | undefined };
    await db.confusionPair.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
    // make sure the two terms are linked as "confused" in both directions
    await db.termRelation.createMany({ data: [{ fromId: a.id, toId: b.id, kind: "confused" }, { fromId: b.id, toId: a.id, kind: "confused" }], skipDuplicates: true });
    pairs++;
  }

  let qs = 0;
  for (const q of bundle.questions) {
    const subjectId = sid.get(q.subject)!;
    const unit = units.find((u) => u.subjectId === subjectId && u.number === q.unit);
    const linked = q.terms.map((n) => findTerm(q.subject, n)).filter(Boolean) as { id: string; term: string }[];
    if (!linked.length) continue;
    // Tag options that name a term so wrong choices can be classified as confusion errors.
    const options = q.options.map((o) => {
      const named = findTerm(q.subject, o.text.replace(/[.,;:]+$/, "").replace(/^(an?|the)\s+/i, "").split(/,| because| which| \(/)[0].trim());
      return { ...o, termId: named?.id ?? null };
    });
    const data = {
      subjectId, unitId: unit?.id ?? null, type: q.type, stage: q.stage, skill: q.skill, difficulty: q.difficulty,
      prompt: q.prompt, promptZh: q.promptZh, passage: q.passage, visual: (q.visual ?? undefined) as Prisma.InputJsonValue | undefined,
      options, answer: q.answer, rubric: q.rubric, explanation: q.explanation, explanationZh: q.explanationZh, status: "PUBLISHED" as const,
    };
    const saved = await db.question.upsert({ where: { externalId: q.id }, update: data, create: { externalId: q.id, ...data } });
    await db.questionTerm.deleteMany({ where: { questionId: saved.id } });
    await db.questionTerm.createMany({ data: linked.map((t, i) => ({ questionId: saved.id, termId: t.id, primary: i === 0 })), skipDuplicates: true });
    qs++;
  }
  log(`questions: ${qs}, confusion pairs: ${pairs}`);
  return { terms: termResult, questions: qs, pairs };
}
