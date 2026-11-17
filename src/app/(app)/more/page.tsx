import Link from "next/link";
import { FlaskConical, LineChart, ScanText, Settings, Shield, Trophy } from "lucide-react";
import { requireUserPage } from "@/lib/auth/session";

export const metadata = { title: "More" };
export default async function More() {
  const user = await requireUserPage();
  const links = [
    { href: "/lab", label: "Confusion Lab", zh: "易混辨析", icon: FlaskConical },
    { href: "/decoder", label: "Question Decoder", zh: "题目解码", icon: ScanText },
    { href: "/progress", label: "Progress analytics", zh: "学习进度", icon: LineChart },
    { href: "/achievements", label: "Achievements", zh: "成就", icon: Trophy },
    { href: "/settings", label: "Settings", zh: "设置", icon: Settings },
    ...(user.role === "ADMIN" && !user.isDemo ? [{ href: "/admin", label: "Content admin", zh: "内容管理", icon: Shield }] : []),
  ];
  return (
    <div className="space-y-3">
      <h1 className="display text-3xl font-semibold">More</h1>
      <ul className="grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="surface flex items-center gap-3 rounded-2xl px-4 py-4 font-medium">
              <l.icon size={20} className="text-brand-500" aria-hidden /> <span className="flex-1">{l.label}</span> <span className="zh text-sm text-subtle">{l.zh}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
