import { parseLex } from "./lex";
import {
  ContentBundle,
  duplicateKey,
  pairRecord,
  questionRecord,
  subjectRecord,
  termRecord,
  type PairRecord,
  type QuestionRecord,
  type SubjectRecord,
  type TermRecord,
} from "./schema";

export interface BuildIssue {
  level: "error" | "warning";
  where: string;
  message: string;
}

/** Compile .lex sources into a validated ContentBundle. Pure function: no I/O. */
export function compileLexSources(sources: { name: string; text: string }[]): { bundle: ContentBundle; issues: BuildIssue[] } {
  const issues: BuildIssue[] = [];
  const bundle: ContentBundle = { subjects: [], terms: [], questions: [], pairs: [] };
  const seenTermKeys = new Map<string, string>();
  const seenIds = new Set<string>();
  const seenQ = new Set<string>();

  for (const src of sources) {
    const parsed = parseLex(src.text, src.name);
    parsed.issues.forEach((i) => issues.push({ level: "error", where: src.name, message: i.message }));
    if (!parsed.subject) {
      issues.push({ level: "error", where: src.name, message: "missing @subject header" });
      continue;
    }
    const s = subjectRecord.safeParse(parsed.subject);
    if (!s.success) {
      issues.push({ level: "error", where: src.name, message: `subject: ${s.error.issues.map((i) => i.message).join("; ")}` });
      continue;
    }
    bundle.subjects.push(s.data as SubjectRecord);

    parsed.terms.forEach((raw, idx) => {
      const r = termRecord.safeParse(raw);
      const label = `${src.name} term #${idx + 1} (${(raw as { term?: string }).term ?? "?"})`;
      if (!r.success) {
        issues.push({ level: "error", where: label, message: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
        return;
      }
      const t = r.data as TermRecord;
      const key = duplicateKey(t.subject, t.term);
      if (seenTermKeys.has(key)) {
        issues.push({ level: "error", where: label, message: `duplicate term in subject (also ${seenTermKeys.get(key)})` });
        return;
      }
      seenTermKeys.set(key, label);
      if (t.id && seenIds.has(t.id)) issues.push({ level: "error", where: label, message: `duplicate id ${t.id}` });
      if (t.id) seenIds.add(t.id);
      if (!t.zhExplanation) issues.push({ level: "warning", where: label, message: "missing Chinese conceptual explanation" });
      if (!t.apExample) issues.push({ level: "warning", where: label, message: "missing AP example" });
      bundle.terms.push(t);
    });

    parsed.questions.forEach((raw) => {
      const r = questionRecord.safeParse(raw);
      const label = `${src.name} question ${(raw as { id?: string }).id}`;
      if (!r.success) {
        issues.push({ level: "error", where: label, message: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
        return;
      }
      if (seenQ.has(r.data.id)) issues.push({ level: "error", where: label, message: "duplicate question id" });
      seenQ.add(r.data.id);
      bundle.questions.push(r.data as QuestionRecord);
    });

    parsed.pairs.forEach((raw) => {
      const r = pairRecord.safeParse(raw);
      const label = `${src.name} pair ${(raw as { slug?: string }).slug}`;
      if (!r.success) {
        issues.push({ level: "error", where: label, message: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
        return;
      }
      bundle.pairs.push(r.data as PairRecord);
    });
  }

  // Reference checks: question terms, pair terms, related/confused terms.
  const bySubject = new Map<string, Set<string>>();
  for (const t of bundle.terms) {
    const set = bySubject.get(t.subject) ?? new Set<string>();
    set.add(t.term.toLowerCase());
    bySubject.set(t.subject, set);
  }
  const has = (subject: string, term: string) =>
    bySubject.get(subject)?.has(term.toLowerCase()) || bySubject.get("ap-exam-language")?.has(term.toLowerCase());
  for (const q of bundle.questions) {
    for (const term of q.terms) if (!has(q.subject, term)) issues.push({ level: "error", where: `question ${q.id}`, message: `references unknown term "${term}"` });
  }
  for (const p of bundle.pairs) {
    for (const term of [p.termA, p.termB]) if (!has(p.subject, term)) issues.push({ level: "error", where: `pair ${p.slug}`, message: `references unknown term "${term}"` });
  }
  for (const t of bundle.terms) {
    for (const rel of [...t.related, ...t.confusedWith]) {
      if (!has(t.subject, rel)) issues.push({ level: "warning", where: `${t.subject}:${t.term}`, message: `related term "${rel}" not found (link skipped)` });
    }
  }
  return { bundle, issues };
}
