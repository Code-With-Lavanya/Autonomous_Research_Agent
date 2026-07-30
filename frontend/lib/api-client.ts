import type { ResearchRequest, ResearchResponse, UploadResponse } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function messageFrom(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error?: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}

/**
 * Runs the full research pipeline for a question, via our own
 * `/api/research` route (which proxies server-side to
 * `POST {BACKEND}/api/v1/research`). Mirrors ResearchRequest -> ResearchResponse
 * exactly; no fields are added on either side.
 */
export async function runResearch(
  payload: ResearchRequest,
  options?: { signal?: AbortSignal }
): Promise<ResearchResponse> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  const data = await readJsonSafely(response);

  if (!response.ok) {
    throw new ApiError(
      messageFrom(data, `The research agent returned an error (${response.status}).`),
      response.status
    );
  }

  return data as ResearchResponse;
}

/**
 * Uploads a PDF via our own `/api/upload` route (which proxies to
 * `POST {BACKEND}/api/v1/upload`). The backend only accepts .pdf files —
 * this is enforced here too so the failure is immediate and clear rather
 * than a round trip to find out.
 */
export async function uploadDocument(
  file: File,
  options?: { signal?: AbortSignal }
): Promise<UploadResponse> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new ApiError("Only PDF files are accepted by the /upload endpoint.", 400);
  }

  const form = new FormData();
  form.append("file", file, file.name);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    signal: options?.signal,
  });

  const data = await readJsonSafely(response);

  if (!response.ok) {
    throw new ApiError(
      messageFrom(data, `The upload failed (${response.status}).`),
      response.status
    );
  }

  return data as UploadResponse;
}

export interface HealthState {
  ok: boolean;
  backendUrl?: string;
  message?: string;
}

/** Polls our `/api/health` route, which forwards to the backend's `GET /`. */
export async function checkHealth(options?: { signal?: AbortSignal }): Promise<HealthState> {
  try {
    const response = await fetch("/api/health", { signal: options?.signal, cache: "no-store" });
    const data = (await readJsonSafely(response)) as HealthState;
    return { ok: Boolean(data.ok), backendUrl: data.backendUrl, message: data.message };
  } catch {
    return { ok: false };
  }
}
