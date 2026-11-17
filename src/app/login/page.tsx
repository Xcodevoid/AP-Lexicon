import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { DemoButton } from "@/components/DemoButton";

export const metadata = { title: "Sign in" };
export default async function Login() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your mastery map. 欢迎回来。">
      <AuthForm mode="login" />
      {process.env.DEMO_MODE === "true" && (
        <div className="mt-8 border-t hairline pt-6 text-center">
          <p className="mb-3 text-sm text-muted">Just exploring? Use an isolated demo account.</p>
          <DemoButton />
        </div>
      )}
    </AuthShell>
  );
}
