/**
 * Simple in-memory sliding-window rate limiter. Suitable for a single Node process.
 * For multi-instance deployments, replace with a shared store (e.g. Redis/Upstash) — see docs/DEPLOYMENT.md.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return { ok: false, retryAfterMs: windowMs - (now - arr[0]) };
  }
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 50_000) buckets.clear(); // memory guard
  return { ok: true, retryAfterMs: 0 };
}
