import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const body = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export const POST = route({ auth: "none", body, rate: { limit: 12, windowMs: 10 * 60_000, key: "login" } }, async ({ body }) => {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  const ok = await verifyPassword(body.password, user?.passwordHash);
  if (!user || !ok) throw new HttpError(401, "Email or password is incorrect.");
  await createSession(user.id);
  return { ok: true, next: user.onboardedAt ? "/dashboard" : "/onboarding" };
});
