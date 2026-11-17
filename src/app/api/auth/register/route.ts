import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const body = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const POST = route({ auth: "none", body, rate: { limit: 10, windowMs: 10 * 60_000, key: "register" } }, async ({ body }) => {
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) throw new HttpError(409, "An account with this email already exists. Try signing in.");
  const user = await prisma.user.create({ data: { name: body.name, email: body.email, passwordHash: await hashPassword(body.password) } });
  await createSession(user.id);
  return { ok: true, next: "/onboarding" };
});
