import { requireAdminPage } from "@/lib/auth/session";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div>
      <p className="eyebrow">Content management · 内容管理</p>
      <h1 className="display mt-1 text-3xl font-semibold">Admin</h1>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
