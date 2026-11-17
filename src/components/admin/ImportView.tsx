"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Download, FileUp, TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { ErrorNote } from "../ui/States";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";

type Report = {
  dryRun: boolean; valid: number; errorCount: number; errors: { row: number; field?: string; message: string }[];
  duplicatesInFile: { row: number; firstRow: number; term: string }[]; dbDuplicates: { row: number; term: string; existingId: string }[]; updatesById: number;
  preview: { row: number; subject: string; unit: number; term: string; zh: string; definition: string; status: string }[];
  result?: { created: number; updated: number; skipped: number };
};

export function ImportView() {
  const router = useRouter();
  const [file, setFile] = useState<{ name: string; text: string; format: "csv" | "json" } | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [onDuplicate, setOnDuplicate] = useState<"skip" | "update">("skip");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (f: File) => {
    setReport(null); setError(null);
    if (f.size > 5_000_000) { setError("File is larger than 5 MB. Split it into smaller files."); return; }
    const format = f.name.toLowerCase().endsWith(".json") ? "json" : "csv";
    const text = await f.text();
    setFile({ name: f.name, text, format });
    await run({ name: f.name, text, format }, false);
  };
  const run = async (fl = file, commit = false) => {
    if (!fl) return;
    setBusy(true); setError(null);
    try {
      const r = await api<Report>("/api/admin/import", { filename: fl.name, format: fl.format, text: fl.text, commit, onDuplicate });
      setReport(r);
      if (commit) router.refresh();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="surface rounded-2xl p-5">
        <h2 className="font-semibold">Import vocabulary from CSV or JSON</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">Every file is validated first (dry run). Nothing is written until you confirm. Subjects can be given by slug or name (“AP Biology”). Units and missions are created automatically from <code>unit</code>/<code>unitTitle</code> and <code>topic</code>/<code>topicTitle</code>. Columns from the AP Lexicon master spreadsheet (English Term, 中文翻译, English Definition, 中文概念解释…) are also recognised.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className={cn("inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-ink-900 px-4 font-semibold text-white dark:bg-brand-500", busy && "opacity-60")}>
            <FileUp size={18} /> Choose file
            <input type="file" accept=".csv,.json,text/csv,application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          </label>
          <a href="/api/template" className="surface inline-flex h-11 items-center gap-2 rounded-xl px-4 font-semibold"><Download size={18} /> CSV template</a>
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-brand-500">Field reference</summary>
          <ul className="mt-2 grid gap-1 text-muted md:grid-cols-2">
            <li><b>Required:</b> subject, term, zh, definition</li>
            <li><b>unit</b> number (0 = no unit) · <b>unitTitle</b> · <b>topic</b> code like 2.1 · <b>topicTitle</b></li>
            <li><b>difficulty</b>: 1–3 or Foundation / Intermediate / Advanced</li>
            <li><b>tags, related, confusedWith</b>: separated by ;</li>
            <li><b>misconceptions</b>: separated by ; or ||</li>
            <li><b>visual</b>: diagram kind (e.g. supply-demand) or JSON</li>
            <li><b>audioUrl, imageUrl</b>: http(s) URLs</li>
            <li><b>status</b>: draft (default) or published · <b>reviewStatus</b>: draft / teacher review / approved / needs fix</li>
            <li><b>id</b>: optional stable ID; rows with an existing id update that term</li>
          </ul>
        </details>
        {file && <p className="mt-3 text-sm text-muted">Selected: <b>{file.name}</b> ({file.format.toUpperCase()}, {(file.text.length / 1024).toFixed(1)} KB)</p>}
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {report && (
        <div className="surface space-y-5 rounded-2xl p-5" aria-live="polite">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Valid rows", report.valid, "text-teal-600"], ["Errors", report.errorCount, report.errorCount ? "text-coral-500" : ""], ["Duplicates in file", report.duplicatesInFile.length, ""], ["Already in database", report.dbDuplicates.length + report.updatesById, ""]].map(([l, v, c]) => (
              <div key={l as string} className="rounded-xl sunken p-3"><div className="text-xs text-muted">{l}</div><div className={cn("text-2xl font-bold", c as string)}>{v}</div></div>
            ))}
          </div>
          {report.result && <p className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-200"><CheckCircle2 size={18} /> Imported: {report.result.created} created, {report.result.updated} updated, {report.result.skipped} skipped.</p>}
          {report.errors.length > 0 && (
            <details open>
              <summary className="cursor-pointer text-sm font-semibold text-coral-600"><TriangleAlert size={15} className="mr-1 inline" />Row errors ({report.errorCount}) — these rows will be skipped</summary>
              <ul className="mt-2 max-h-56 overflow-y-auto font-mono text-xs">{report.errors.map((e, i) => <li key={i}>Row {e.row}{e.field ? ` · ${e.field}` : ""}: {e.message}</li>)}</ul>
            </details>
          )}
          {(report.duplicatesInFile.length > 0 || report.dbDuplicates.length > 0) && (
            <details>
              <summary className="cursor-pointer text-sm font-semibold">Duplicates</summary>
              <ul className="mt-2 max-h-56 overflow-y-auto text-xs">
                {report.duplicatesInFile.map((d) => <li key={`f${d.row}`}>Row {d.row}: “{d.term}” repeats row {d.firstRow} (ignored)</li>)}
                {report.dbDuplicates.map((d) => <li key={`d${d.row}`}>Row {d.row}: “{d.term}” already exists as {d.existingId}</li>)}
              </ul>
            </details>
          )}
          {report.preview.length > 0 && (
            <div className="overflow-x-auto"><table className="w-full text-xs"><caption className="mb-1 text-left text-sm font-semibold">Preview</caption><thead><tr className="text-left text-muted"><th className="p-1.5">Row</th><th className="p-1.5">Subject</th><th className="p-1.5">Unit</th><th className="p-1.5">Term</th><th className="p-1.5">中文</th><th className="p-1.5">Definition</th><th className="p-1.5">Status</th></tr></thead>
              <tbody>{report.preview.map((p) => <tr key={p.row} className="border-t hairline"><td className="p-1.5">{p.row}</td><td className="p-1.5">{p.subject}</td><td className="p-1.5">{p.unit}</td><td className="p-1.5 font-semibold">{p.term}</td><td className="zh p-1.5">{p.zh}</td><td className="p-1.5">{p.definition}</td><td className="p-1.5">{p.status}</td></tr>)}</tbody></table></div>
          )}
          {report.dryRun && report.valid > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t hairline pt-4">
              <label className="text-sm">When a term already exists:&nbsp;
                <select value={onDuplicate} onChange={(e) => setOnDuplicate(e.target.value as "skip" | "update")} className="h-9 rounded-lg border hairline bg-transparent px-2"><option value="skip">Skip it</option><option value="update">Update it with the file's values</option></select>
              </label>
              <Button variant="accent" loading={busy} onClick={() => run(file, true)}>Import {report.valid} valid row{report.valid === 1 ? "" : "s"}</Button>
              <span className="text-xs text-subtle">Rows marked status “published” go live immediately; others stay as drafts.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
