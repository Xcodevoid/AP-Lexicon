import { route } from "@/lib/api";
import { destroySession } from "@/lib/auth/session";

export const POST = route({ auth: "optional" }, async () => {
  await destroySession();
  return { ok: true };
});
