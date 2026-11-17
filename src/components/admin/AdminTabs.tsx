"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../ui/cn";

const TABS = [["/admin", "Overview"], ["/admin/terms", "Vocabulary"], ["/admin/questions", "Questions"], ["/admin/subjects", "Subjects & units"], ["/admin/import", "Import"]] as const;
export function AdminTabs() {
  const p = usePathname();
  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto border-b hairline" aria-label="Admin sections">
      {TABS.map(([href, l]) => {
        const on = href === "/admin" ? p === "/admin" : p.startsWith(href);
        return <Link key={href} href={href} aria-current={on ? "page" : undefined} className={cn("whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold", on ? "border-brand-500 text-[rgb(var(--fg))]" : "border-transparent text-muted hover:text-[rgb(var(--fg))]")}>{l}</Link>;
      })}
    </nav>
  );
}
