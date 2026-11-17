"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";
import { ErrorNote } from "./ui/States";
import { api } from "./ui/fetcher";

export const inputCls = "h-11 w-full rounded-xl border hairline bg-[rgb(var(--bg-elev))] px-3.5 text-[15px] outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const f = new FormData(e.currentTarget);
    try {
      const r = await api<{ next: string }>(`/api/auth/${mode}`, Object.fromEntries(f.entries()));
      router.push(r.next);
      router.refresh();
    } catch (err) {
      const details = (err as { details?: { path: string; message: string }[] }).details;
      if (Array.isArray(details)) setFieldErrors(Object.fromEntries(details.map((d) => [d.path, d.message])));
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && <ErrorNote>{error}</ErrorNote>}
      {mode === "register" && (
        <Field label="Your name" name="name" autoComplete="name" error={fieldErrors.name} />
      )}
      <Field label="Email" name="email" type="email" autoComplete="email" error={fieldErrors.email} />
      <Field label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} hint={mode === "register" ? "At least 8 characters." : undefined} error={fieldErrors.password} />
      <Button type="submit" variant="accent" size="lg" loading={busy} className="w-full">{mode === "login" ? "Sign in" : "Create account"}</Button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? <>New here? <Link className="font-semibold text-brand-500" href="/register">Create an account</Link></> : <>Already have an account? <Link className="font-semibold text-brand-500" href="/login">Sign in</Link></>}
      </p>
    </form>
  );
}

function Field({ label, name, type = "text", autoComplete, hint, error }: { label: string; name: string; type?: string; autoComplete?: string; hint?: string; error?: string }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input id={id} name={name} type={type} autoComplete={autoComplete} required className={inputCls} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-d` : undefined} />
      {(error || hint) && <p id={`${id}-d`} className={`mt-1 text-xs ${error ? "text-coral-500" : "text-subtle"}`}>{error ?? hint}</p>}
    </div>
  );
}
