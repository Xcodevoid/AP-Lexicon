"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { api } from "./ui/fetcher";
import { useToast } from "./ui/Toast";
import { inputCls } from "./AuthForm";

export function GoalForm({ subjects }: { subjects: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  if (!open) return <Button variant="ghost" size="sm" className="mt-3" onClick={() => setOpen(true)} icon={<Plus size={15} />}>Add a goal</Button>;
  return (
    <form className="mt-4 space-y-2.5" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      setBusy(true);
      try {
        await api("/api/goals", { title: f.get("title"), subjectSlug: f.get("subject") || undefined, targetDate: f.get("date"), targetTerms: Number(f.get("terms")) });
        toast({ title: "Goal added" });
        setOpen(false);
        router.refresh();
      } catch (err) { toast({ title: "Could not add goal", body: (err as Error).message, tone: "error" }); } finally { setBusy(false); }
    }}>
      <label className="sr-only" htmlFor="g-title">Goal</label>
      <input id="g-title" name="title" required minLength={2} placeholder="e.g. Unit 3 quiz" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <label className="sr-only" htmlFor="g-sub">Subject</label>
        <select id="g-sub" name="subject" className={inputCls}><option value="">Any subject</option>{subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
        <label className="sr-only" htmlFor="g-date">Target date</label>
        <input id="g-date" name="date" type="date" required className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted" htmlFor="g-terms">Terms to reach Practicing <input id="g-terms" name="terms" type="number" min={1} max={500} defaultValue={20} className={`${inputCls} w-24`} /></label>
      <div className="flex gap-2"><Button size="sm" type="submit" loading={busy}>Save goal</Button><Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>
  );
}
