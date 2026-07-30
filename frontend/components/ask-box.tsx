"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, FileText, Loader2, Paperclip, X } from "lucide-react";
import type { AttachedDocument } from "@/lib/types";

interface AskBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  attachedDocument: AttachedDocument | null;
  onFileSelected: (file: File) => void;
  onRemoveAttachment: () => void;
  isUploading: boolean;
  uploadError: string | null;
  autoFocus?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AskBox({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  attachedDocument,
  onFileSelected,
  onRemoveAttachment,
  isUploading,
  uploadError,
  autoFocus,
}: AskBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  const canSubmit = value.trim().length > 0 && !isSubmitting && !isUploading;

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const submitCombo = (event.key === "Enter" && !event.shiftKey) || (event.key === "Enter" && (event.metaKey || event.ctrlKey));
    if (submitCombo) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      className={[
        "rounded-lg border bg-surface transition-shadow duration-200",
        isDragging ? "border-brand" : "border-line",
        "shadow-ask",
      ].join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        rows={1}
        placeholder="Ask a research question — e.g. “What are the trade-offs of RAG vs. long-context LLMs?”"
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
        style={{ minHeight: 32 }}
      />

      {attachedDocument && (
        <div className="mx-5 mb-1 flex items-center gap-2 rounded-md border border-line-soft bg-surface-2 px-2.5 py-1.5 text-xs w-fit max-w-[calc(100%-2.5rem)]">
          <FileText className="w-3.5 h-3.5 text-brand shrink-0" />
          <span className="truncate text-ink-soft">{attachedDocument.filename}</span>
          <span className="text-ink-faint shrink-0">{formatBytes(attachedDocument.sizeBytes)}</span>
          <button
            type="button"
            onClick={onRemoveAttachment}
            aria-label="Remove attached document"
            className="ml-0.5 text-ink-faint hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isUploading && (
        <div className="mx-5 mb-1 flex items-center gap-2 text-xs text-ink-soft w-fit">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
          <span>Uploading document…</span>
        </div>
      )}

      {uploadError && !isUploading && (
        <div className="mx-5 mb-1 text-xs text-bad w-fit max-w-[calc(100%-2.5rem)]">{uploadError}</div>
      )}

      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || Boolean(attachedDocument)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Paperclip className="w-3.5 h-3.5" />
            Attach PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-ink transition-all hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:hover:bg-brand"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Researching…
            </>
          ) : (
            <>
              Research
              <ArrowUp className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
