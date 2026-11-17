import Papa from "papaparse";
import { prisma } from "@/lib/db";
import { route } from "@/lib/api";

/** Export the learner's own vocabulary data (studied/bookmarked/noted terms) as CSV or JSON. */
export const GET = route({ rate: { limit: 10, windowMs: 60_000, key: "export" } }, async ({ user, req }) => {
  const format = req.nextUrl.searchParams.get("format") === "json" ? "json" : "csv";
  const states = await prisma.userTermState.findMany({
    where: { userId: user.id, OR: [{ discoveredAt: { not: null } }, { bookmarked: true }, { note: { not: "" } }, { reps: { gt: 0 } }] },
    include: { term: { include: { subject: true, unit: true, collections: { where: { collection: { userId: user.id } }, include: { collection: true } } } } },
    orderBy: { updatedAt: "desc" },
  });
  const rows = states.map((s) => ({
    subject: s.term.subject.name, unit: s.term.unit?.title ?? "", term: s.term.term, zh: s.term.zh, definition: s.term.definition,
    status: s.status, masteryScore: s.score, recognition: Math.round(s.recognition * 100), concept: Math.round(s.concept * 100), application: Math.round(s.application * 100),
    reviews: s.reps, lapses: s.lapses, nextReview: s.due?.toISOString() ?? "", bookmarked: s.bookmarked, note: s.note,
    collections: s.term.collections.map((c) => c.collection.name).join("; "),
  }));
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") {
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), terms: rows }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="ap-lexicon-notebook-${stamp}.json"` } });
  }
  return new Response("﻿" + Papa.unparse(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ap-lexicon-notebook-${stamp}.csv"` } });
});
