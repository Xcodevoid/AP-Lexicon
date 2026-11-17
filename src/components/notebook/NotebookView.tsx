"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, Download, FolderPlus, Search, Trash2, X } from "lucide-react";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/States";
import { StatusPill, type MasteryStatus } from "../ui/StatusPill";
import { api } from "../ui/fetcher";
import { cn } from "../ui/cn";
import { useToast } from "../ui/Toast";
import { inputCls } from "../AuthForm";

export type NoteRow = {
  id: string; term: string; zh: string; definition: string; zhExplanation: string; difficulty: number; topicId: string | null;
  subjectSlug: string; subject: string; unit: string; status: MasteryStatus; score: number; bookmarked: boolean; note: string; mistakes: number; lastMistake: string | null;
};
type Coll = { id: string; name: string; color: string; termIds: string[] };
type Tab = "all" | "bookmarked" | "mistakes" | "notes" | `c:${string}`;
const DIFF = ["", "Foundation", "Core", "Advanced"];

export function NotebookView({ rows: initialRows, collections: initialColls }: { rows: NoteRow[]; collections: Coll[] }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initialRows);
  const [colls, setColls] = useState(initialColls);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");
  const [diff, setDiff] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [global, setGlobal] = useState<{ id: string; term: string; zh: string; definition: string; subject: { shortName: string }; status: string; bookmarked: boolean }[] | null>(null);
  const [newColl, setNewColl] = useState("");

  useEffect(() => { setRows(initialRows); setColls(initialColls); }, [initialRows, initialColls]);

  const subjects = useMemo(() => [...new Set(rows.map((r) => r.subject))].sort(), [rows]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "bookmarked" && !r.bookmarked) return false;
      if (tab === "mistakes" && !r.mistakes) return false;
      if (tab === "notes" && !r.note) return false;
      if (tab.startsWith("c:") && !colls.find((c) => c.id === tab.slice(2))?.termIds.includes(r.id)) return false;
      if (subject && r.subject !== subject) return false;
      if (status && r.status !== status) return false;
      if (diff && String(r.difficulty) !== diff) return false;
      if (needle && !(`${r.term} ${r.zh} ${r.definition} ${r.note}`.toLowerCase().includes(needle))) return false;
      return true;
    }).sort((a, b) => (tab === "mistakes" ? b.mistakes - a.mistakes : 0));
  }, [rows, tab, q, subject, status, diff, colls]);

  const patchRow = (id: string, p: Partial<NoteRow>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const toggleBookmark = async (r: NoteRow) => {
    patchRow(r.id, { bookmarked: !r.bookmarked });
    try { await api(`/api/terms/${r.id}/state`, { bookmarked: !r.bookmarked }, "PATCH"); } catch (e) { patchRow(r.id, { bookmarked: r.bookmarked }); toast({ title: "Not saved", body: (e as Error).message, tone: "error" }); }
  };
  const searchAll = async () => {
    if (!q.trim()) return;
    try { setGlobal((await api<{ results: NonNullable<typeof global> }>(`/api/search?q=${encodeURIComponent(q.trim())}`)).results); } catch (e) { toast({ title: "Search failed", body: (e as Error).message, tone: "error" }); }
  };
  const createColl = async () => {
    if (!newColl.trim()) return;
    try {
      const c = await api<{ id: string; name: string; color: string }>("/api/collections", { name: newColl.trim() });
      setColls([...colls, { ...c, termIds: [] }]);
      setNewColl("");
      setTab(`c:${c.id}`);
    } catch (e) { toast({ title: "Could not create", body: (e as Error).message, tone: "error" }); }
  };
  const toggleInColl = async (c: Coll, termId: string) => {
    const has = c.termIds.includes(termId);
    setColls(colls.map((x) => (x.id === c.id ? { ...x, termIds: has ? x.termIds.filter((t) => t !== termId) : [...x.termIds, termId] } : x)));
    try { await api(`/api/collections/${c.id}`, has ? { remove: [termId] } : { add: [termId] }, "PATCH"); } catch (e) { toast({ title: "Not saved", body: (e as Error).message, tone: "error" }); router.refresh(); }
  };
  const deleteColl = async (c: Coll) => {
    if (!confirm(`Delete the collection “${c.name}”? Terms stay in your notebook.`)) return;
    await api(`/api/collections/${c.id}`, undefined, "DELETE");
    setColls(colls.filter((x) => x.id !== c.id));
    setTab("all");
  };

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "all", label: "All studied", n: rows.length },
    { id: "bookmarked", label: "Bookmarked", n: rows.filter((r) => r.bookmarked).length },
    { id: "mistakes", label: "Mistakes", n: rows.filter((r) => r.mistakes).length },
    { id: "notes", label: "With notes", n: rows.filter((r) => r.note).length },
    ...colls.map((c) => ({ id: `c:${c.id}` as Tab, label: c.name, n: c.termIds.length })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Personal vocabulary notebook · 个人词汇本</p>
          <h1 className="display mt-1 text-4xl font-semibold">Notebook</h1>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?format=csv" className="surface inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold"><Download size={16} /> CSV</a>
          <a href="/api/export?format=json" className="surface inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold"><Download size={16} /> JSON</a>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Notebook sections">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold", tab === t.id ? "bg-ink-900 text-white dark:bg-brand-500" : "sunken text-muted hover:text-[rgb(var(--fg))]")}>
            {t.label} <span className="ml-1 font-mono text-xs opacity-70">{t.n}</span>
          </button>
        ))}
        <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); void createColl(); }}>
          <label htmlFor="newcoll" className="sr-only">New collection name</label>
          <input id="newcoll" value={newColl} onChange={(e) => setNewColl(e.target.value)} placeholder="New collection…" className="h-9 w-36 rounded-xl border hairline bg-transparent px-3 text-sm" maxLength={40} />
          <button type="submit" className="grid h-9 w-9 place-items-center rounded-xl sunken" aria-label="Create collection"><FolderPlus size={16} /></button>
        </form>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" aria-hidden />
          <label htmlFor="nb-q" className="sr-only">Search notebook</label>
          <input id="nb-q" value={q} onChange={(e) => { setQ(e.target.value); setGlobal(null); }} onKeyDown={(e) => e.key === "Enter" && searchAll()} placeholder="Search English, 中文, definitions or notes…" className={cn(inputCls, "pl-9")} />
        </div>
        <select aria-label="Filter by subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}><option value="">All subjects</option>{subjects.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by mastery" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}><option value="">Any mastery</option><option value="LEARNING">Learning</option><option value="PRACTICING">Practicing</option><option value="MASTERED">Mastered</option><option value="NOT_STARTED">Not started</option></select>
        <select aria-label="Filter by difficulty" value={diff} onChange={(e) => setDiff(e.target.value)} className={inputCls}><option value="">Any difficulty</option><option value="1">Foundation</option><option value="2">Core</option><option value="3">Advanced</option></select>
      </div>
      {q.trim() && !global && <button onClick={searchAll} className="mt-2 text-sm font-semibold text-brand-500">Search all {q.trim().length > 0 ? `“${q.trim()}”` : ""} across every subject →</button>}

      {global && (
        <div className="mt-4 surface rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">All vocabulary · {global.length} result{global.length === 1 ? "" : "s"}</h2><button onClick={() => setGlobal(null)} aria-label="Close search results"><X size={16} /></button></div>
          <ul className="divide-y hairline">
            {global.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-2 text-sm">
                <div className="min-w-0 flex-1"><span className="font-semibold">{g.term}</span> <span className="zh text-subtle">{g.zh}</span><div className="truncate text-xs text-muted">{g.subject.shortName} · {g.definition}</div></div>
                <button className="rounded-lg px-2 py-1 text-xs font-semibold sunken" onClick={async () => { await api(`/api/terms/${g.id}/state`, { bookmarked: !g.bookmarked }, "PATCH"); setGlobal(global.map((x) => x.id === g.id ? { ...x, bookmarked: !x.bookmarked } : x)); router.refresh(); }}>{g.bookmarked ? "Bookmarked ✓" : "Bookmark"}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab.startsWith("c:") && (() => { const c = colls.find((x) => x.id === tab.slice(2)); return c ? <div className="mt-3 flex justify-end"><Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => deleteColl(c)}>Delete collection</Button></div> : null; })()}

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState title={rows.length ? "No terms match these filters" : "Your notebook is empty"} body={rows.length ? "Try clearing a filter." : "Terms you study, bookmark or practise appear here automatically."} action={!rows.length ? <Link href="/subjects" className="inline-flex h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white dark:bg-brand-500">Open a mission</Link> : undefined} />
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="surface rounded-2xl">
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleBookmark(r)} aria-pressed={r.bookmarked} aria-label={r.bookmarked ? `Remove bookmark from ${r.term}` : `Bookmark ${r.term}`} className={r.bookmarked ? "text-gold-500" : "text-subtle hover:text-brand-500"}>{r.bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                    <div className="flex flex-wrap items-baseline gap-x-2"><span className="font-semibold">{r.term}</span><span className="zh text-subtle">{r.zh}</span></div>
                    <div className="truncate text-xs text-muted">{r.subject} · {r.unit} · {DIFF[r.difficulty]}{r.mistakes ? ` · ${r.mistakes} mistake${r.mistakes > 1 ? "s" : ""}` : ""}{r.note ? " · 📝" : ""}</div>
                  </button>
                  <StatusPill status={r.status} className="hidden sm:inline-flex" />
                  <ChevronDown size={16} className={cn("text-subtle transition-transform", open === r.id && "rotate-180")} />
                </div>
                {open === r.id && <NoteEditor row={r} colls={colls} onSaved={(note) => patchRow(r.id, { note })} onToggleColl={(c) => toggleInColl(c, r.id)} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ row, colls, onSaved, onToggleColl }: { row: NoteRow; colls: Coll[]; onSaved: (n: string) => void; onToggleColl: (c: Coll) => void }) {
  const [note, setNote] = useState(row.note);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const dirty = note !== row.note;
  return (
    <div className="border-t hairline px-4 pb-4 pt-3">
      <div className="grid gap-3 md:grid-cols-2">
        <p className="text-sm">{row.definition}</p>
        <p className="zh text-sm text-muted" lang="zh-CN">{row.zhExplanation}</p>
      </div>
      <label htmlFor={`note-${row.id}`} className="mt-4 block text-xs font-semibold text-muted">My note</label>
      <textarea id={`note-${row.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={4000} placeholder="Your own example, a memory trick, or how it differs from a similar term…" className="mt-1 w-full rounded-xl border hairline bg-transparent p-3 text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!dirty} loading={busy} onClick={async () => {
          setBusy(true);
          try { await api(`/api/terms/${row.id}/state`, { note }, "PATCH"); onSaved(note); toast({ title: "Note saved" }); } catch (e) { toast({ title: "Not saved", body: (e as Error).message, tone: "error" }); } finally { setBusy(false); }
        }}>Save note</Button>
        {row.topicId && <Link href={`/learn/${row.topicId}`} className="text-sm font-semibold text-brand-500">Open mission →</Link>}
        <span className="ml-auto flex flex-wrap gap-1.5">
          {colls.map((c) => (
            <button key={c.id} onClick={() => onToggleColl(c)} aria-pressed={c.termIds.includes(row.id)} className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", c.termIds.includes(row.id) ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "hairline text-muted")}>{c.termIds.includes(row.id) ? "✓ " : "+ "}{c.name}</button>
          ))}
        </span>
      </div>
    </div>
  );
}
