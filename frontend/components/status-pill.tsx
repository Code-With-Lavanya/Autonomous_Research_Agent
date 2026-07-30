"use client";

import { useEffect, useRef, useState } from "react";
import { checkHealth } from "@/lib/api-client";

type Status = "checking" | "online" | "offline";

export function StatusPill() {
  const [status, setStatus] = useState<Status>("checking");
  const [backendUrl, setBackendUrl] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const result = await checkHealth();
      if (cancelled) return;
      setStatus(result.ok ? "online" : "offline");
      setBackendUrl(result.backendUrl);
    }

    poll();
    const interval = setInterval(poll, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dotColor = status === "online" ? "bg-good" : status === "offline" ? "bg-bad" : "bg-ink-faint";
  const label = status === "online" ? "Backend connected" : status === "offline" ? "Backend offline" : "Checking backend…";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${status === "checking" ? "animate-pulse" : ""}`} />
        <span className="hidden sm:inline font-mono text-[11px] tracking-tight">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-line bg-surface p-3 shadow-raised text-xs">
          <div className="flex items-center gap-1.5 font-medium text-ink">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {label}
          </div>
          <div className="mt-2 text-ink-soft leading-relaxed">
            {status === "offline" ? (
              <>
                Couldn&apos;t reach <code className="font-mono text-[11px]">{backendUrl ?? "the backend"}</code>. Start
                it with <code className="font-mono text-[11px]">uvicorn app.main:app --reload</code> from your{" "}
                <code className="font-mono text-[11px]">backend/</code> folder, or check{" "}
                <code className="font-mono text-[11px]">RESEARCH_BACKEND_URL</code> in{" "}
                <code className="font-mono text-[11px]">.env.local</code>.
              </>
            ) : (
              <>
                Proxying to <code className="font-mono text-[11px]">{backendUrl}</code>.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
