"use client";

const EXAMPLES = [
  "Compare retrieval-augmented generation with long-context LLMs for enterprise search.",
  "What does the current research say about carbon capture at scale?",
  "Summarize the state of small on-device language models in 2026.",
  "What are the strongest arguments for and against a four-day work week?",
];

interface PromptChipsProps {
  onSelect: (prompt: string) => void;
}

export function PromptChips({ onSelect }: PromptChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          className="rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft hover:border-brand hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
        >
          {example.length > 54 ? `${example.slice(0, 54)}…` : example}
        </button>
      ))}
    </div>
  );
}
