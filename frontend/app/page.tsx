"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Ban, Clock3, FileText } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AskBox } from "@/components/ask-box";
import { PromptChips } from "@/components/prompt-chips";
import { PipelineStrip, type PipelineMode } from "@/components/pipeline-strip";
import { ReportMarkdown } from "@/components/report-markdown";
import { ReviewCard } from "@/components/review-card";
import { HistoryDrawer } from "@/components/history-drawer";
import { ErrorBanner } from "@/components/error-banner";
import { Logomark } from "@/components/logomark";

import { ApiError, runResearch, uploadDocument } from "@/lib/api-client";
import { clearHistory, loadHistory, removeHistoryEntry, saveHistoryEntry } from "@/lib/history";
import { PIPELINE_STAGES } from "@/lib/types";
import type { AttachedDocument, HistoryEntry, ResearchResponse } from "@/lib/types";

// Illustrative pacing for the five transitions between the six pipeline
// stages while a request is in flight. The backend is a single synchronous
// call with no progress-streaming endpoint, so this is a best-guess cadence,
// not a real signal — it never reaches "done" on its own, it just holds at
// Critic until the actual response (or an error) arrives. The elapsed timer
// next to it is real wall-clock time, so the UI never overclaims precision.
const STAGE_ADVANCE_MS = [1300, 2100, 3200, 1700, 3400];

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [attachedDocument, setAttachedDocument] = useState<AttachedDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [activeQuestion, setActiveQuestion] = useState("");
  const [activeDocument, setActiveDocument] = useState<AttachedDocument | null>(null);

  // loadHistory() already guards for `typeof window === "undefined"`, so a
  // lazy initializer is safe here and avoids an empty-then-populated flash.
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);

  const submitAbortRef = useRef<AbortController | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  // Drives the pipeline animation + elapsed clock for the duration of a
  // request. This synchronizes React state with a real external system
  // (setInterval/setTimeout), which is what effects are for — the reset
  // calls below are part of standing that timer system up each time
  // `isSubmitting` flips true, not derived state that belongs in render.
  useEffect(() => {
    if (!isSubmitting) return;

    let cancelled = false;
    const startedAt = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveStageIndex(0);
    setElapsedMs(0);

    const tick = setInterval(() => {
      if (!cancelled) setElapsedMs(Date.now() - startedAt);
    }, 250);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cursor = 0;
    STAGE_ADVANCE_MS.forEach((duration, i) => {
      cursor += duration;
      const t = setTimeout(() => {
        if (!cancelled) setActiveStageIndex(i + 1);
      }, cursor);
      timeouts.push(t);
    });

    return () => {
      cancelled = true;
      clearInterval(tick);
      timeouts.forEach(clearTimeout);
    };
  }, [isSubmitting]);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadError(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are accepted — that's the one restriction the /upload route enforces.");
      return;
    }

    setIsUploading(true);
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      const res = await uploadDocument(file, { signal: controller.signal });
      setAttachedDocument({ filename: res.filename, path: res.path, sizeBytes: file.size });
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else if (!(err instanceof DOMException && err.name === "AbortError")) {
        setUploadError("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveAttachment = useCallback(() => {
    uploadAbortRef.current?.abort();
    setAttachedDocument(null);
    setUploadError(null);
  }, []);

  const submit = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setSubmitError(null);
    setIsSubmitting(true);
    setResult(null);
    setActiveQuestion(trimmed);
    setActiveDocument(attachedDocument);

    const controller = new AbortController();
    submitAbortRef.current = controller;

    try {
      const res = await runResearch(
        { question: trimmed, document_path: attachedDocument?.path ?? null },
        { signal: controller.signal }
      );
      setResult(res);
      setHistory(
        saveHistoryEntry({
          id: makeId(),
          question: trimmed,
          createdAt: new Date().toISOString(),
          attachedDocument,
          result: res,
        })
      );
      setQuestion("");
      setAttachedDocument(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Cancelled by the user — no error banner needed, just fall back to idle.
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong talking to the research agent.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [question, attachedDocument]);

  function handleCancel() {
    submitAbortRef.current?.abort();
  }

  function handleReset() {
    setResult(null);
    setSubmitError(null);
    setQuestion("");
    setAttachedDocument(null);
  }

  function handleSelectHistory(entry: HistoryEntry) {
    setResult(entry.result);
    setActiveQuestion(entry.question);
    setActiveDocument(entry.attachedDocument);
    setSubmitError(null);
    setHistoryOpen(false);
  }

  const pipelineMode: PipelineMode = isSubmitting ? "running" : submitError ? "error" : "idle";
  const showResults = Boolean(result) && !isSubmitting;
  const currentStage = PIPELINE_STAGES[Math.min(activeStageIndex, PIPELINE_STAGES.length - 1)];

  return (
    <>
      <Header onOpenHistory={() => setHistoryOpen(true)} historyCount={history.length} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
          <AnimatePresence mode="wait">
            {showResults && result ? (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  New question
                </button>

                {activeDocument && (
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
                    <FileText className="w-3 h-3" />
                    {activeDocument.filename}
                  </div>
                )}
                <h1 className="text-xl sm:text-[1.7rem] font-semibold leading-snug tracking-[-0.01em] text-ink text-balance mb-8 max-w-3xl">
                  {activeQuestion}
                </h1>

                <div className="mb-10 rounded-lg border border-line-soft bg-surface-2/60 px-4 py-4 sm:px-6">
                  <PipelineStrip mode="done" size="compact" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                  <div className="order-2 lg:order-1">
                    <ReportMarkdown report={result.report} question={activeQuestion} />
                  </div>
                  <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                    <ReviewCard result={result} />
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="ask"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {isSubmitting ? (
                  <div className="flex flex-col items-center py-16 sm:py-24 text-center">
                    <Logomark size={38} animated />
                    <p className="mt-7 text-xs font-mono uppercase tracking-[0.14em] text-ink-faint">Researching</p>
                    <p className="mt-2 max-w-xl text-lg sm:text-xl font-medium text-ink text-balance">
                      &ldquo;{activeQuestion}&rdquo;
                    </p>

                    <div className="mt-10 w-full max-w-2xl">
                      <PipelineStrip mode="running" activeIndex={activeStageIndex} />
                    </div>

                    <p className="mt-7 max-w-sm text-sm text-ink-soft leading-relaxed" aria-live="polite">
                      {currentStage.description}
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft px-2.5 py-1 font-mono text-xs text-ink-faint">
                        <Clock3 className="w-3.5 h-3.5" />
                        {formatElapsed(elapsedMs)}
                      </span>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>

                    <p className="mt-10 max-w-xs text-xs text-ink-faint leading-relaxed">
                      This can take a minute or two — longer if the critic sends the draft back for another pass.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pt-6 sm:pt-10 pb-14 sm:pb-20 text-center">
                    <Logomark size={40} animated />
                    <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
                      Six-agent research pipeline
                    </p>
                    <h1 className="mt-4 max-w-2xl text-[2.1rem] sm:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.08] text-ink text-balance">
                      Ask a question. Get a cited report.
                    </h1>
                    <p className="mt-4 max-w-lg text-[15px] sm:text-base leading-relaxed text-ink-soft text-balance">
                      A planner, web search, a document retriever, a writer, and a critic work through it in
                      sequence — looping back for revision until the critic approves the report.
                    </p>

                    <div className="mt-9 w-full max-w-2xl">
                      <AskBox
                        value={question}
                        onChange={setQuestion}
                        onSubmit={submit}
                        isSubmitting={isSubmitting}
                        attachedDocument={attachedDocument}
                        onFileSelected={handleFileSelected}
                        onRemoveAttachment={handleRemoveAttachment}
                        isUploading={isUploading}
                        uploadError={uploadError}
                        autoFocus
                      />

                      {submitError && (
                        <div className="mt-3">
                          <ErrorBanner
                            message={submitError}
                            onDismiss={() => setSubmitError(null)}
                            onRetry={submit}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <PromptChips onSelect={setQuestion} />
                    </div>

                    <div className="mt-16 sm:mt-20 w-full border-t border-line-soft pt-10 sm:pt-14">
                      <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-9">
                        How your question gets answered
                      </p>
                      <PipelineStrip mode={pipelineMode} className="max-w-3xl mx-auto" />
                      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 text-left max-w-4xl mx-auto">
                        {PIPELINE_STAGES.map((stage) => (
                          <div key={stage.id}>
                            <p className="font-mono text-[10px] text-brand mb-1.5">
                              {String(stage.index + 1).padStart(2, "0")}
                            </p>
                            <p className="text-sm font-medium text-ink mb-1">{stage.label}</p>
                            <p className="text-xs leading-relaxed text-ink-faint">{stage.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={history}
        onSelect={handleSelectHistory}
        onRemove={(id) => setHistory(removeHistoryEntry(id))}
        onClear={() => {
          clearHistory();
          setHistory([]);
        }}
      />
    </>
  );
}
