/** Small JSON fetch helper for client components. Throws Error(message) on non-2xx. */
export async function api<T = unknown>(url: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error ?? `Request failed (${res.status})`) as Error & { details?: unknown; status?: number };
    err.details = (data as { details?: unknown }).details;
    err.status = res.status;
    throw err;
  }
  return data as T;
}
