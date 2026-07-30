import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, extractDetail, parseJsonBody, unreachableMessage } from "@/lib/backend";
import type { ResearchRequest } from "@/lib/types";

// The graph can loop research -> citation -> writer -> critic repeatedly
// until the critic approves (see backend graph.py: route_after_critic).
// Note for whoever owns the backend: route_after_critic checks
// state["retry_count"] >= 3, but nothing in the codebase ever increments
// retry_count, so that cap doesn't currently trigger — the loop is only
// bounded by LangGraph's own default recursion limit. Each pass is several
// sequential LLM calls, so give this real headroom either way.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const question = typeof (body as Partial<ResearchRequest> | null)?.question === "string" ? (body as ResearchRequest).question : "";
  if (!question.trim()) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const documentPathRaw = (body as Partial<ResearchRequest> | null)?.document_path;
  const document_path = typeof documentPathRaw === "string" && documentPathRaw.trim() ? documentPathRaw : null;

  const payload: ResearchRequest = { question, document_path };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 290_000);

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/v1/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await parseJsonBody(upstream);

    if (!upstream.ok) {
      const detail = extractDetail(data) ?? `The backend responded with status ${upstream.status}.`;
      return NextResponse.json({ error: detail }, { status: upstream.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "The research agent didn't finish in time (5 min). It may still be working — try again shortly." },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: unreachableMessage() }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
