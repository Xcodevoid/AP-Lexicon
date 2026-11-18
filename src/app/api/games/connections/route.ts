import { route } from "@/lib/api";
import { HttpError } from "@/lib/api";
import { buildConnections } from "@/lib/services/learning";

export const GET = route({ rate: { limit: 60, windowMs: 60_000, key: "connections" } }, async ({ req }) => {
  const slug = req.nextUrl.searchParams.get("subject") ?? "";
  if (!/^[a-z0-9-]+$/.test(slug)) throw new HttpError(400, "Choose a subject");
  return buildConnections(slug);
});
