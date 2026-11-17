import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseTermUpload } from "@/lib/content/import";
import { compileLexSources } from "@/lib/content/bundle";
import { parseLex } from "@/lib/content/lex";

const resolve = (s: string) => ({ "ap-biology": "ap-biology", "ap biology": "ap-biology", "all ap courses": "ap-exam-language" } as Record<string, string>)[s.toLowerCase()] ?? null;

describe("CSV / JSON import validation", () => {
  it("accepts a valid template row and normalises fields", () => {
    const csv = `subject,unit,term,zh,definition,difficulty,tags,misconceptions,visual,status\nap-biology,2,osmosis,渗透作用,Diffusion of water across a membrane,Advanced,cells; water,Water moves toward less solute || Only in plants,membrane,published`;
    const r = parseTermUpload("csv", csv, resolve);
    expect(r.errors).toEqual([]);
    expect(r.rows).toHaveLength(1);
    const t = r.rows[0].record;
    expect(t.difficulty).toBe(3);
    expect(t.tags).toEqual(["cells", "water"]);
    expect(t.misconceptions).toHaveLength(2);
    expect(t.visual).toEqual({ kind: "membrane" });
    expect(t.status).toBe("PUBLISHED");
  });
  it("reports row-level errors with field names and keeps valid rows", () => {
    const csv = `subject,unit,term,zh,definition,difficulty\nap-biology,1,,水,x,1\nAP Chemistry,1,mole,摩尔,Amount of substance,2\nap-biology,1,enzyme,酶,A biological catalyst,9\nap-biology,1,ATP,三磷酸腺苷,Energy carrier,1`;
    const r = parseTermUpload("csv", csv, resolve);
    expect(r.rows.map((x) => x.record.term)).toEqual(["ATP"]);
    expect(r.errors.find((e) => e.row === 2 && e.field === "term")).toBeTruthy();
    expect(r.errors.find((e) => e.row === 3 && e.field === "subject")?.message).toMatch(/Unknown subject/);
    expect(r.errors.find((e) => e.row === 4 && e.field === "difficulty")).toBeTruthy();
  });
  it("detects duplicates inside one file (case/punctuation-insensitive)", () => {
    const csv = `subject,unit,term,zh,definition\nap-biology,1,Cell Cycle,细胞周期,Ordered events of division\nap-biology,1,cell-cycle,细胞周期,Duplicate`;
    const r = parseTermUpload("csv", csv, resolve);
    expect(r.rows).toHaveLength(1);
    expect(r.duplicatesInFile).toEqual([{ row: 3, firstRow: 2, term: "cell-cycle" }]);
  });
  it("understands the master spreadsheet's bilingual column headers", () => {
    const csv = `ID,Course,English Term,中文翻译,English Definition,中文概念解释,Difficulty\nCORE-001,ALL AP COURSES,identify,识别；指出,Name or select the requested feature,只需指出,Intermediate`;
    const r = parseTermUpload("csv", csv, resolve);
    expect(r.errors).toEqual([]);
    expect(r.rows[0].record).toMatchObject({ id: "CORE-001", subject: "ap-exam-language", term: "identify", zh: "识别；指出", difficulty: 2 });
  });
  it("accepts JSON arrays and { terms: [] }, rejects malformed JSON", () => {
    const one = { subject: "ap-biology", unit: 1, term: "enzyme", zh: "酶", definition: "Biological catalyst" };
    expect(parseTermUpload("json", JSON.stringify([one]), resolve).rows).toHaveLength(1);
    expect(parseTermUpload("json", JSON.stringify({ terms: [one] }), resolve).rows).toHaveLength(1);
    expect(parseTermUpload("json", "{oops", resolve).errors[0].message).toMatch(/Invalid JSON/);
  });
  it("rejects non-http audio/image URLs", () => {
    const r = parseTermUpload("json", JSON.stringify([{ subject: "ap-biology", unit: 1, term: "x", zh: "x", definition: "xyz", imageUrl: "javascript:alert(1)" }]), resolve);
    expect(r.rows).toHaveLength(0);
    expect(r.errors[0].field).toBe("imageUrl");
  });
});

describe("seed content", () => {
  it("compiles all .lex files with zero errors and maps every master-spreadsheet ID", () => {
    const dir = path.resolve(__dirname, "../../content/subjects");
    const sources = readdirSync(dir).filter((f) => f.endsWith(".lex")).map((f) => ({ name: f, text: readFileSync(path.join(dir, f), "utf8") }));
    const { bundle, issues } = compileLexSources(sources);
    expect(issues.filter((i) => i.level === "error")).toEqual([]);
    const master = JSON.parse(readFileSync(path.resolve(__dirname, "../../content/sources/master-spreadsheet.json"), "utf8")) as { ID: string }[];
    const ids = new Set(bundle.terms.map((t) => t.id));
    expect(master.filter((m) => !ids.has(m.ID))).toEqual([]);
    expect(bundle.subjects.length).toBeGreaterThanOrEqual(16);
  });
  it("lex parser reports unknown lines with line numbers", () => {
    const r = parseLex("@subject s | S | 中 | S | blue | 1\n@unit 1 | U | 单元\n- a | 甲 | def a | 解释 | ex | 1\n  bogus: field", "t.lex");
    expect(r.issues[0].message).toMatch(/t\.lex:4/);
  });
});
