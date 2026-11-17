import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { can, type Action } from "@/lib/auth/permissions";
import { rateLimit } from "@/lib/rate-limit";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);

function clientKey(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

/** Reject cross-site state-changing requests (defence in depth on top of SameSite=Lax cookies). */
function checkOrigin(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return;
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin fetches from some browsers / server-side tools
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked");
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, "Invalid origin");
  }
}

interface Opts<S extends ZodTypeAny | undefined> {
  auth?: "user" | "optional" | "none";
  permission?: Action;
  body?: S;
  rate?: { limit: number; windowMs: number; key?: string };
}

type Ctx<S> = { req: NextRequest; user: CurrentUser; body: S extends ZodTypeAny ? z.output<S> : undefined; params: Record<string, string> };

export function route<S extends ZodTypeAny | undefined = undefined>(opts: Opts<S>, handler: (ctx: Ctx<S>) => Promise<unknown>) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      checkOrigin(req);
      if (opts.rate) {
        const rl = rateLimit(`${opts.rate.key ?? req.nextUrl.pathname}:${clientKey(req)}`, opts.rate.limit, opts.rate.windowMs);
        if (!rl.ok) throw new HttpError(429, "Too many requests — please slow down.");
      }
      const user = opts.auth === "none" ? null : await getCurrentUser();
      if ((opts.auth ?? "user") === "user" && !user) throw new HttpError(401, "Please sign in.");
      if (opts.permission && !can(user, opts.permission)) throw new HttpError(403, "You do not have permission to do that.");
      let body: unknown = undefined;
      if (opts.body) {
        const raw = await req.json().catch(() => {
          throw new HttpError(400, "Request body must be JSON");
        });
        body = opts.body.parse(raw);
      }
      const params = (await context?.params) ?? {};
      const result = await handler({ req, user: user as CurrentUser, body: body as Ctx<S>["body"], params });
      if (result instanceof Response) return result;
      return json(result ?? { ok: true });
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, details: e.details }, { status: e.status });
      if (e instanceof ZodError) return json({ error: "Invalid input", details: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
      console.error("[api]", req.nextUrl.pathname, e);
      return json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
    }
  };
}
