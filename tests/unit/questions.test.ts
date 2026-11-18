import { describe, expect, it } from "vitest";
import { blankTerm, buildGenerated, parseRef, pickDistractors, type PoolTerm } from "@/lib/engine/questions";
import { decodeQuestion, type GlossaryEntry } from "@/lib/engine/decoder";

const T = (id: string, term: string, zh: string, extra: Partial<PoolTerm> = {}): PoolTerm => ({
  id, term, zh, definition: `${term} definition`, zhExplanation: "", apExample: "", writtenPrompt: "", unitId: "u1", topicId: "t1", difficulty: 2, confusedIds: [], relatedIds: [], ...extra,
});
const pool = [
  T("mc", "marginal cost", "边际成本", { confusedIds: ["atc"], apExample: "A firm compares marginal revenue and marginal cost before producing more." }),
  T("atc", "average total cost", "平均总成本", { topicId: "t2" }),
  T("mr", "marginal revenue", "边际收益", { topicId: "t2" }),
  T("fc", "fixed cost", "固定成本", { unitId: "u2", topicId: "t9" }),
  T("vc", "variable cost", "可变成本", { unitId: "u2", topicId: "t9" }),
];

describe("question generation", () => {
  it("prefers commonly-confused terms as distractors", () => {
    const d = pickDistractors(pool[0], pool, 3, "seed");
    expect(d[0].id).toBe("atc");
    expect(d.map((x) => x.id)).not.toContain("mc");
  });
  it("is deterministic for a seed and rebuildable from its ref (server-side grading)", () => {
    const a = buildGenerated("en2zh", pool[0], pool, "s1")!;
    const b = buildGenerated("en2zh", pool[0], pool, "s1")!;
    expect(a.ref).toBe(b.ref);
    const ref = parseRef(a.ref)!;
    expect(ref.type).toBe("generated");
    const rebuilt = buildGenerated("en2zh", pool[0], pool, "other", ref.type === "generated" ? ref.optionIds : undefined)!;
    expect(rebuilt.options!.map((o) => o.id)).toEqual(a.options!.map((o) => o.id));
    expect(a.options!.some((o) => o.id === "mc" && o.text === "边际成本")).toBe(true);
  });
  it("never asks Chinese → English when two words share the same Chinese", () => {
    const shared = [...pool, T("x1", "moreover", "此外"), T("x2", "furthermore", "此外")];
    expect(buildGenerated("zh2en", shared[5], shared, "s")).toBeNull();
    expect(buildGenerated("en2zh", shared[5], shared, "s")).not.toBeNull();
  });
  it("cloze blanks the term only when it appears in the AP example", () => {
    expect(blankTerm(pool[0].apExample, "marginal cost")).toContain("______");
    expect(blankTerm("No match here", "marginal cost")).toBeNull();
    expect(buildGenerated("cloze", pool[1], pool, "s")).toBeNull();
    const c = buildGenerated("cloze", pool[0], pool, "s")!;
    expect(c.stage).toBe("MASTER");
    expect(c.prompt).not.toMatch(/marginal cost/i);
  });
  it("generated items never put the answer text in Chinese hints for English-only stages", () => {
    const q = buildGenerated("cloze", pool[0], pool, "s")!;
    expect(q.hintZh).toBeUndefined();
  });
});

describe("question decoder (deterministic)", () => {
  const g: GlossaryEntry[] = [
    { id: "c1", term: "explain", zh: "解释", definition: "Show how or why", subjectSlug: "ap-exam-language", subjectShort: "Exam", category: "Exam command verb" },
    { id: "k1", term: "however", zh: "然而", definition: "Contrast", subjectSlug: "ap-exam-language", subjectShort: "Exam", category: "Logical connector" },
    { id: "t1", term: "price ceiling", zh: "价格上限", definition: "Legal maximum price", subjectSlug: "ap-microeconomics", subjectShort: "Micro", category: "Subject concept" },
    { id: "t2", term: "shortage", zh: "短缺", definition: "Qd > Qs", subjectSlug: "ap-microeconomics", subjectShort: "Micro", category: "Subject concept" },
    { id: "t3", term: "state", zh: "州", definition: "Political unit", subjectSlug: "ap-us-history", subjectShort: "APUSH", category: "Subject concept" },
  ];
  it("finds command verbs, terms, connectors, traps and guesses the subject", () => {
    const r = decodeQuestion("Explain why a binding price ceiling causes a shortage. However, which of the following is NOT a likely effect?", g);
    expect(r.commands.map((c) => c.verb)).toEqual(["explain"]);
    expect(r.terms.map((t) => t.term).sort()).toEqual(["price ceiling", "shortage"]);
    expect(r.connectors[0].text).toBe("however");
    expect(r.traps.some((t) => /NOT/.test(t.note))).toBe(true);
    expect(r.subjectGuess?.slug).toBe("ap-microeconomics");
    expect(r.skills.some((s) => s.skill === "Causal reasoning")).toBe(true);
  });
  it("recognises a plain 'What is …?' question and finds the term", () => {
    const withRadius: GlossaryEntry[] = [...g, { id: "r1", term: "radius", zh: "半径", definition: "Center to edge", subjectSlug: "foundations-math-science", subjectShort: "Foundations", category: "Subject concept" }];
    const r = decodeQuestion("What is a radius", withRadius);
    expect(r.terms.map((t) => t.term)).toEqual(["radius"]);
    expect(r.skills[0].skill).toMatch(/definition/);
  });
  it("does not treat ambiguous common words as terms without a chosen subject, and never outputs an answer", () => {
    const r = decodeQuestion("In which state did the event happen, and explain its causes?", g);
    expect(r.terms.find((t) => t.term === "state")).toBeUndefined();
    expect(JSON.stringify(r)).not.toMatch(/correct answer/i);
  });
});
