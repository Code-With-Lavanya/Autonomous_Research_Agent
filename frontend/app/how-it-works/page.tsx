import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GitBranch, ShieldCheck } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PipelineStrip } from "@/components/pipeline-strip";
import { PIPELINE_STAGES } from "@/lib/types";

export const metadata: Metadata = {
  title: "How it works",
};

const STAGE_DETAILS: Record<string, string> = {
  planner:
    "Model: Mistral (mistral-small-latest) via LangChain. Returns structured JSON — need_web_search, need_retriever, and a research_plan of 3–8 steps — and nothing else. It never answers the question itself.",
  information:
    "Tool calls, no LLM. Conditionally runs a Tavily web search (search_depth: advanced, top 5 results) and/or queries a Chroma vector store through an MMR retriever (k=5, fetch_k=20), depending on what the planner decided.",
  research:
    "Model: Mistral (mistral-small-latest). Merges the web results and retrieved passages into a single research summary, instructed to flag conflicting information and never invent facts.",
  citation:
    "Model: Mistral (mistral-small-latest). Compiles a references list — APA preferred — from the source URLs and document metadata gathered earlier, with duplicates removed.",
  writer:
    "Model: Mistral (mistral-small-latest). Drafts the report itself: Title, Executive Summary, Background, Key Findings, Analysis, and Conclusion, in a professional tone.",
  critic:
    "Model: Mistral (mistral-small-latest). Returns structured JSON — approved, feedback, score (0–100) — after checking factual completeness, logical consistency, unsupported claims, and missing sections.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to the agent
          </Link>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-brand">Architecture</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.12] text-ink text-balance">
            One question, six agents, one graph.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft text-balance">
            Every request runs through a single LangGraph <code className="font-mono text-[13px] bg-surface-2 px-1.5 py-0.5 rounded">StateGraph</code>,
            compiled once and invoked per question. Nothing here is asynchronous or streamed — the API sends one
            request and waits for one response, however many passes it takes internally.
          </p>

          <div className="mt-12 rounded-lg border border-line-soft bg-surface-2/60 px-4 py-6 sm:px-8">
            <PipelineStrip mode="idle" />
          </div>

          <div className="mt-14 flex flex-col gap-10">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.id} className="flex gap-5 sm:gap-7">
                <div className="flex flex-col items-center pt-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-medium text-brand-soft-ink">
                    {String(stage.index + 1).padStart(2, "0")}
                  </span>
                  {stage.index < PIPELINE_STAGES.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-line" aria-hidden />
                  )}
                </div>
                <div className="pb-2">
                  <h2 className="text-base font-semibold text-ink">{stage.label}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{stage.description}</p>
                  <p className="mt-2.5 font-mono text-[12px] leading-relaxed text-ink-faint bg-surface-2 rounded-md px-3 py-2.5 border border-line-soft">
                    {STAGE_DETAILS[stage.id]}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-lg border border-line bg-surface p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <GitBranch className="w-3.5 h-3.5" />
              The review loop
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft max-w-2xl">
              After Writer drafts a report, Critic scores it and decides: approve it, or send it back to Research
              for another pass. That routing decision is a real conditional edge in the graph —{" "}
              <code className="font-mono text-[13px] bg-surface-2 px-1.5 py-0.5 rounded">critic → research</code> —
              not a fixed number of steps. The loop continues until the critic is satisfied.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft max-w-2xl">
              The graph state also tracks a <code className="font-mono text-[13px] bg-surface-2 px-1.5 py-0.5 rounded">retry_count</code>{" "}
              intended to cap this at a fixed number of passes — worth knowing if you&apos;re relying on that cap in
              your own deployment; check your backend for the current behavior.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-line bg-surface p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <ShieldCheck className="w-3.5 h-3.5" />
              The contract
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft max-w-2xl">
              Whatever happens internally, the API surface stays small. This interface only ever sends and
              receives exactly this:
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                  POST /api/v1/research
                </p>
                <pre className="rounded-md border border-line-soft bg-surface-2 px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft overflow-x-auto">
{`{
  "question": string,
  "document_path": string | null
}`}
                </pre>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">Response</p>
                <pre className="rounded-md border border-line-soft bg-surface-2 px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft overflow-x-auto">
{`{
  "approved": boolean,
  "score": number,
  "feedback": string,
  "report": string
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-hover transition-colors"
            >
              Ask a question
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
