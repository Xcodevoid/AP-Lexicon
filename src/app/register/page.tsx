import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Create account" };
export default async function Register() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell title="Create your account" subtitle="Your progress, reviews and notebook are saved to your account. 创建账户，保存你的学习进度。">
      <AuthForm mode="register" />
    </AuthShell>
  );
}
