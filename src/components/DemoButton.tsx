"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";
import { api } from "./ui/fetcher";
import { useToast } from "./ui/Toast";

export function DemoButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <Button variant="secondary" size="lg" loading={busy} onClick={async () => {
      setBusy(true);
      try {
        const r = await api<{ next: string }>("/api/auth/demo", {});
        router.push(r.next);
      } catch (e) {
        toast({ title: "Could not start demo", body: (e as Error).message, tone: "error" });
        setBusy(false);
      }
    }}>Try the demo</Button>
  );
}
