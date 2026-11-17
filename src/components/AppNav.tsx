"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Compass, FlaskConical, LayoutDashboard, LineChart, RotateCcw, ScanText, Settings, Shield, Trophy } from "lucide-react";
import { cn } from "./ui/cn";

const items = [
  { href: "/dashboard", label: "Today", zh: "今日", icon: LayoutDashboard, mobile: true },
  { href: "/subjects", label: "Mastery Map", zh: "掌握地图", icon: Compass, mobile: true },
  { href: "/review", label: "Review", zh: "复习", icon: RotateCcw, mobile: true },
  { href: "/lab", label: "Confusion Lab", zh: "易混辨析", icon: FlaskConical, mobile: false },
  { href: "/decoder", label: "Question Decoder", zh: "题目解码", icon: ScanText, mobile: false },
  { href: "/notebook", label: "Notebook", zh: "词汇本", icon: BookMarked, mobile: true },
  { href: "/progress", label: "Progress", zh: "进度", icon: LineChart, mobile: false },
  { href: "/achievements", label: "Achievements", zh: "成就", icon: Trophy, mobile: false },
];

export function SideNav({ isAdmin, dueCount }: { isAdmin: boolean; dueCount: number }) {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/") || (href === "/subjects" && (path.startsWith("/learn") || path.startsWith("/challenge")));
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={active(it.href) ? "page" : undefined}
          className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors", active(it.href) ? "bg-ink-900 text-white dark:bg-brand-500/20 dark:text-white" : "text-muted hover:bg-[rgb(var(--bg-sunken))] hover:text-[rgb(var(--fg))]")}>
          <it.icon size={18} aria-hidden />
          <span className="flex-1">{it.label}</span>
          {it.href === "/review" && dueCount > 0 && <span className="rounded-full bg-coral-400 px-2 py-0.5 text-[11px] font-bold text-white">{dueCount}</span>}
          <span className="zh text-[11px] opacity-50 group-hover:opacity-80">{it.zh}</span>
        </Link>
      ))}
      <div className="my-2 border-t hairline" />
      <Link href="/settings" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium", active("/settings") ? "bg-ink-900 text-white" : "text-muted hover:bg-[rgb(var(--bg-sunken))]")}>
        <Settings size={18} aria-hidden /> Settings
      </Link>
      {isAdmin && (
        <Link href="/admin" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium", active("/admin") ? "bg-ink-900 text-white" : "text-muted hover:bg-[rgb(var(--bg-sunken))]")}>
          <Shield size={18} aria-hidden /> Content admin
        </Link>
      )}
    </nav>
  );
}

export function BottomNav({ dueCount }: { dueCount: number }) {
  const path = usePathname();
  const mob = items.filter((i) => i.mobile);
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-[rgb(var(--bg-elev))]/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5">
        {[...mob, { href: "/more", label: "More", zh: "更多", icon: Settings, mobile: true }].map((it) => {
          const on = it.href === "/more" ? ["/lab", "/decoder", "/progress", "/achievements", "/settings", "/admin"].some((p) => path.startsWith(p)) : path === it.href || path.startsWith(it.href + "/");
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={on ? "page" : undefined} className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", on ? "text-brand-500" : "text-subtle")}>
                <it.icon size={20} aria-hidden />
                {it.label === "Mastery Map" ? "Map" : it.label}
                {it.href === "/review" && dueCount > 0 && <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-coral-400" aria-label={`${dueCount} due`} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
