import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { createSession } from "@/lib/auth/session";

/**
 * Demo mode: creates an isolated demo student (User.isDemo = true) with no password.
 * Demo users start with zero progress, cannot use admin features, are hidden from leaderboards,
 * and can be purged with `npm run demo:purge`.
 */
export const POST = route({ auth: "none", rate: { limit: 5, windowMs: 60 * 60_000, key: "demo" } }, async () => {
  if (process.env.DEMO_MODE !== "true") throw new HttpError(403, "Demo mode is disabled on this server.");
  const id = randomBytes(5).toString("hex");
  const user = await prisma.user.create({ data: { email: `demo-${id}@demo.aplexicon.local`, name: "Demo Student", isDemo: true } });
  await createSession(user.id);
  return { ok: true, next: "/onboarding" };
});
