import { CheckCircle2, MessageSquareText, XCircle } from "lucide-react";
import { ScoreGauge } from "./score-gauge";
import type { ResearchResponse } from "@/lib/types";

interface ReviewCardProps {
  result: ResearchResponse;
}

export function ReviewCard({ result }: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        <span>Critic review</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <ScoreGauge score={result.score} />
        <div>
          <div
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              result.approved ? "bg-good-soft text-good" : "bg-warn-soft text-warn",
            ].join(" ")}
          >
            {result.approved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {result.approved ? "Approved" : "Needs revision"}
          </div>
          <p className="mt-2 text-xs text-ink-faint leading-relaxed max-w-[16rem]">
            {result.approved
              ? "The critic agent signed off on this report."
              : "The critic agent has not signed off on this draft."}
          </p>
        </div>
      </div>

      {result.feedback && (
        <div className="mt-5 rounded-md bg-surface-2 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <MessageSquareText className="w-3.5 h-3.5" />
            Feedback
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
