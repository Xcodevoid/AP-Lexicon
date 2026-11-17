/**
 * Parser for the `.lex` authoring format (see docs/CONTENT_GUIDE.md).
 * Produces raw (unvalidated) records; callers validate with the zod schemas in ./schema.
 */
export interface LexIssue {
  line: number;
  message: string;
}

export interface LexResult {
  subject: Record<string, unknown> | null;
  terms: Record<string, unknown>[];
  questions: Record<string, unknown>[];
  pairs: Record<string, unknown>[];
  issues: LexIssue[];
}

const split = (s: string) => s.split(/ \| /).map((p) => p.trim());

export function parseLex(text: string, fileLabel = "file"): LexResult {
  const res: LexResult = { subject: null, terms: [], questions: [], pairs: [], issues: [] };
  type LexUnit = { number: number; title: string; titleZh: string; topics: { code: string; title: string; titleZh: string; objectives: string[] }[] };
  let unit: LexUnit | null = null;
  let topic: { code: string; title: string } | null = null;
  let current: { kind: "term" | "q" | "pair"; rec: Record<string, any> } | null = null;
  const units: LexUnit[] = [];

  const lines = text.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const ln = idx + 1;
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) return;
    const issue = (message: string) => res.issues.push({ line: ln, message: `${fileLabel}:${ln} ${message}` });

    if (line.startsWith("@subject ")) {
      const [slug, name, nameZh, shortName, theme, order] = split(line.slice(9));
      res.subject = { slug, name, nameZh, shortName, theme: theme || "blue", order: Number(order || 0), units, status: "published", description: "", frameworkNote: "" };
      return;
    }
    if (!res.subject) return issue("content before @subject header");
    const subjectSlug = res.subject.slug as string;

    if (line.startsWith("@desc ")) { res.subject.description = line.slice(6).trim(); return; }
    if (line.startsWith("@framework ")) { res.subject.frameworkNote = line.slice(11).trim(); return; }
    if (line.startsWith("@unit ")) {
      const [n, title, titleZh] = split(line.slice(6));
      unit = { number: Number(n), title, titleZh: titleZh ?? "", topics: [] };
      if (Number.isNaN(unit.number)) issue("unit number is not numeric");
      units.push(unit);
      topic = null;
      current = null;
      return;
    }
    if (line.startsWith("@topic ")) {
      if (!unit) return issue("@topic before @unit");
      const [code, title, titleZh, objectives] = split(line.slice(7));
      const t = { code, title, titleZh: titleZh ?? "", objectives: (objectives ?? "").split(";").map((s) => s.trim()).filter(Boolean) };
      unit.topics.push(t);
      topic = t;
      current = null;
      return;
    }
    if (line.startsWith("- ")) {
      if (!unit) return issue("term before @unit");
      if (!topic) {
        topic = { code: `${unit.number}.1`, title: unit.title };
        unit.topics.push({ ...topic, titleZh: unit.titleZh, objectives: [] });
      }
      const [term, zh, definition, zhExplanation, apExample, difficulty, id] = split(line.slice(2));
      const rec: Record<string, any> = {
        id: id ? id.replace(/^#/, "") : "", subject: subjectSlug, unit: unit.number, unitTitle: unit.title, topic: topic.code, topicTitle: topic.title,
        term, zh, definition, zhExplanation, apExample, difficulty: difficulty || 2,
        misconceptions: [], related: [], confusedWith: [], tags: [], status: "published", source: "",
      };
      res.terms.push(rec);
      current = { kind: "term", rec };
      return;
    }
    if (line.startsWith("@q ")) {
      const [id, stage, skill, type, unitN, difficulty, terms] = split(line.slice(3));
      const rec: Record<string, any> = { id, subject: subjectSlug, stage, skill, type, unit: Number(unitN), difficulty, terms, options: [], rubric: [], prompt: "", passage: "", explanation: "", explanationZh: "", answer: "", status: "published" };
      res.questions.push(rec);
      current = { kind: "q", rec };
      return;
    }
    if (line.startsWith("@pair ")) {
      const [slug, termA, termB] = split(line.slice(6));
      const rec: Record<string, any> = { slug, subject: subjectSlug, termA, termB, keyDifference: "", keyDifferenceZh: "", dimensions: [], scenarios: [] };
      res.pairs.push(rec);
      current = { kind: "pair", rec };
      return;
    }

    // continuation lines
    const body = line.trim();
    if (!current) return issue(`unexpected line: ${body.slice(0, 40)}`);
    const { kind, rec } = current;
    const m = body.match(/^([a-zA-Z*!?>=]+):?\s?(.*)$/);
    const keyMatch = body.match(/^(mis|real|rel|vs|vis|ipa|tags|wp|cat|img|src|pri|d|s|r|a|zh|pzh):\s*(.*)$/);
    if (kind === "term") {
      if (!keyMatch) return issue(`unknown term field: ${body.slice(0, 40)}`);
      const [, k, v] = keyMatch;
      if (k === "mis") rec.misconceptions.push(v);
      else if (k === "real") rec.realWorld = v;
      else if (k === "rel") rec.related.push(...v.split(";").map((s) => s.trim()).filter(Boolean));
      else if (k === "vs") rec.confusedWith.push(...v.split(";").map((s) => s.trim()).filter(Boolean));
      else if (k === "vis") rec.visual = v.trim().startsWith("{") ? v.trim() : { kind: v.split(/\s+/)[0], ...(v.includes(" ") ? { variant: v.split(/\s+/).slice(1).join(" ") } : {}) };
      else if (k === "ipa") rec.pronunciation = v;
      else if (k === "tags") rec.tags.push(...v.split(";").map((s) => s.trim()));
      else if (k === "wp") rec.writtenPrompt = v;
      else if (k === "cat") rec.category = v;
      else if (k === "img") rec.imageUrl = v;
      else if (k === "src") rec.source = v;
      else if (k === "pri") rec.priority = v;
      else issue(`field ${k} not valid for terms`);
      return;
    }
    if (kind === "q") {
      if (body.startsWith("?zh ")) rec.promptZh = body.slice(4);
      else if (body.startsWith("? ")) rec.prompt = rec.prompt ? `${rec.prompt}\n${body.slice(2)}` : body.slice(2);
      else if (body.startsWith("> ")) rec.passage = rec.passage ? `${rec.passage}\n${body.slice(2)}` : body.slice(2);
      else if (body.startsWith("=")) {
        const correct = body.startsWith("=*");
        const [text, rationale] = body.slice(correct ? 2 : 1).split("::").map((s) => s.trim());
        const id = String.fromCharCode(97 + rec.options.length);
        rec.options.push({ id, text, rationale: rationale ?? "" });
        if (correct) rec.answer = id;
      } else if (body.startsWith("!zh ")) rec.explanationZh = body.slice(4);
      else if (body.startsWith("! ")) rec.explanation = rec.explanation ? `${rec.explanation} ${body.slice(2)}` : body.slice(2);
      else if (keyMatch && keyMatch[1] === "r") rec.rubric.push(keyMatch[2]);
      else if (keyMatch && keyMatch[1] === "a") rec.answer = keyMatch[2];
      else if (keyMatch && keyMatch[1] === "vis") rec.visual = keyMatch[2].trim().startsWith("{") ? keyMatch[2].trim() : { kind: keyMatch[2].split(/\s+/)[0], ...(keyMatch[2].includes(" ") ? { variant: keyMatch[2].split(/\s+/).slice(1).join(" ") } : {}) };
      else issue(`unknown question line: ${body.slice(0, 40)}`);
      return;
    }
    if (kind === "pair") {
      if (body.startsWith("!zh ")) rec.keyDifferenceZh = body.slice(4);
      else if (body.startsWith("! ")) rec.keyDifference = body.slice(2);
      else if (keyMatch && keyMatch[1] === "d") {
        const [label, a, b] = keyMatch[2].split("::").map((s) => s.trim());
        rec.dimensions.push({ label, a, b });
      } else if (keyMatch && keyMatch[1] === "s") {
        const [answer, text, why] = keyMatch[2].split("::").map((s) => s.trim());
        rec.scenarios.push({ answer, text, why: why ?? "" });
      } else if (keyMatch && keyMatch[1] === "vis") rec.visual = { kind: keyMatch[2].split(/\s+/)[0] };
      else issue(`unknown pair line: ${body.slice(0, 40)}`);
      return;
    }
    void m;
  });
  return res;
}
