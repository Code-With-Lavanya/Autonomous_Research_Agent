"use client";

import { AlertTriangle, RotateCw, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-bad/25 bg-bad-soft px-4 py-3.5 text-bad"
    >
      <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
      <p className="flex-1 text-sm leading-relaxed">{message}</p>
      <div className="flex shrink-0 items-center gap-1">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium hover:bg-bad/10 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-bad/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
