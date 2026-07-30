/**
 * Server-only helpers used by the app/api/* route handlers. These run on
 * the Next.js server, not in the browser, which is what lets them reach
 * the FastAPI backend without a CORS preflight ever happening — the
 * browser only ever talks to this Next.js app, same-origin.
 */

export const BACKEND_URL = (process.env.RESEARCH_BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

/**
 * FastAPI error bodies look like either:
 *   { "detail": "Only PDF files are allowed." }                (HTTPException)
 *   { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }  (422 validation)
 * This normalizes both into a single readable string.
 */
export function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("detail" in data)) return null;
  const detail = (data as { detail?: unknown }).detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String((item as { msg?: unknown }).msg) : null))
      .filter((msg): msg is string => Boolean(msg));
    if (messages.length) return messages.join(" ");
  }

  return null;
}

export async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export function unreachableMessage(hint?: string): string {
  const base = `Could not reach the research backend at ${BACKEND_URL}. Is it running?`;
  return hint ? `${base} ${hint}` : base;
}
