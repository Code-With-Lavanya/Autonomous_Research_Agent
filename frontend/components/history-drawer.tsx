"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, FileText, Trash2, X, XCircle } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryDrawer({ open, onClose, entries, onSelect, onRemove, onClear }: HistoryDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Recent questions"
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-line bg-surface"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ink-soft" />
                <h2 className="text-sm font-semibold text-ink">Recent questions</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {entries.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <Clock className="w-6 h-6 text-ink-faint" />
                  <p className="text-sm text-ink-soft">No questions yet.</p>
                  <p className="text-xs text-ink-faint">Ask something to get started — it&apos;ll show up here.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {entries.map((entry) => (
                    <li key={entry.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(entry)}
                        className="w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface-2 cursor-pointer"
                      >
                        <p className="pr-6 text-[13px] leading-snug text-ink line-clamp-2">{entry.question}</p>
                        <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-ink-faint">
                          <span className="font-mono">{relativeTime(entry.createdAt)}</span>
                          <span
                            className={[
                              "inline-flex items-center gap-1",
                              entry.result.approved ? "text-good" : "text-warn",
                            ].join(" ")}
                          >
                            {entry.result.approved ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {entry.result.score}/100
                          </span>
                          {entry.attachedDocument && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(entry.id)}
                        aria-label="Remove from history"
                        className="absolute right-2 top-2.5 hidden h-6 w-6 items-center justify-center rounded-full text-ink-faint hover:bg-line-soft hover:text-bad transition-colors group-hover:flex cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {entries.length > 0 && (
              <div className="border-t border-line-soft px-5 py-3.5">
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-ink-faint hover:text-bad transition-colors cursor-pointer"
                >
                  Clear all history
                </button>
              </div>
            )}

            <div className="border-t border-line-soft px-5 py-3 text-[11px] leading-relaxed text-ink-faint">
              Stored only in this browser — the backend has no history endpoint of its own.
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
