"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { motion } from "framer-motion";
import { PIPELINE_STAGES } from "@/lib/types";

export type PipelineMode = "idle" | "running" | "done" | "error";

interface PipelineStripProps {
  mode: PipelineMode;
  activeIndex?: number;
  size?: "default" | "compact";
  className?: string;
}

type StageStatus = "pending" | "active" | "done" | "error";

function statusFor(mode: PipelineMode, activeIndex: number, index: number): StageStatus {
  if (mode === "idle") return "pending";
  if (mode === "done") return "done";
  if (mode === "error") {
    if (index < activeIndex) return "done";
    if (index === activeIndex) return "error";
    return "pending";
  }
  // running
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

export function PipelineStrip({ mode, activeIndex = 0, size = "default", className }: PipelineStripProps) {
  const compact = size === "compact";

  return (
    <div className={className}>
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className={`flex items-start ${compact ? "gap-0 px-1" : "gap-0 px-1 sm:px-0"} min-w-max sm:min-w-0`}>
          {PIPELINE_STAGES.map((stage, index) => {
            const status = statusFor(mode, activeIndex, index);
            const isLast = index === PIPELINE_STAGES.length - 1;

            return (
              <div key={stage.id} className="flex items-start">
                <div className={`flex flex-col items-center ${compact ? "w-14" : "w-20 sm:w-auto sm:flex-1"}`}>
                  <div className="relative flex items-center justify-center" style={{ height: compact ? 28 : 36 }}>
                    {status === "active" && (
                      <motion.span
                        className="absolute rounded-full bg-brand"
                        style={{ width: compact ? 28 : 36, height: compact ? 28 : 36 }}
                        animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                        aria-hidden
                      />
                    )}
                    <div
                      className={[
                        "relative flex items-center justify-center rounded-full border-2 transition-colors duration-300",
                        compact ? "w-7 h-7" : "w-9 h-9",
                        status === "pending" ? "border-line bg-surface" : "border-transparent",
                        status === "active" ? "bg-brand" : "",
                        status === "done" ? "bg-brand" : "",
                        status === "error" ? "bg-bad" : "",
                      ].join(" ")}
                    >
                      {status === "done" && <Check className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} color="var(--color-brand-ink)" strokeWidth={2.75} />}
                      {status === "error" && <X className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} color="var(--color-brand-ink)" strokeWidth={2.75} />}
                      {status === "pending" && (
                        <span className="font-mono text-[10px] text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
                      )}
                      {status === "active" && <span className="w-2 h-2 rounded-full bg-brand-ink" />}
                    </div>
                  </div>

                  {!compact && (
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-ink leading-tight">{stage.label}</div>
                      {stage.id === "critic" && (
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-ink-faint">
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>can loop back</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isLast && (
                  <div
                    className="h-[2px] mt-[17px] sm:mt-[17px] rounded-full transition-colors duration-500"
                    style={{
                      width: compact ? 14 : 28,
                      marginTop: compact ? 13 : 17,
                      background: status === "done" ? "var(--color-brand)" : "var(--color-line)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
