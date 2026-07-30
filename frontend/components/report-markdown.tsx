"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, FileText } from "lucide-react";

interface ReportMarkdownProps {
  report: string;
  question: string;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "report"
  );
}

export function ReportMarkdown({ report, question }: ReportMarkdownProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — fail quietly.
    }
  }

  function handleDownload() {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(question)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          <FileText className="w-3 h-3" />
          Report
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-good" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download .md
          </button>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <div className="report-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
