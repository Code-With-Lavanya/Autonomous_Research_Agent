"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { Logomark } from "./logomark";
import { StatusPill } from "./status-pill";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onOpenHistory?: () => void;
  historyCount?: number;
}

export function Header({ onOpenHistory, historyCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logomark size={26} />
          <span className="flex items-baseline gap-2">
            <span className="font-semibold tracking-[-0.01em] text-[15px] text-ink">Autonomous Research Agent</span>
            <span className="hidden md:inline font-mono text-[10px] text-ink-faint">v1.0.0</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/how-it-works"
            className="hidden sm:inline-block text-sm text-ink-soft hover:text-ink transition-colors px-2"
          >
            How it works
          </Link>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink cursor-pointer"
              aria-label="Recent questions"
            >
              <History className="w-[17px] h-[17px]" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[9px] text-brand-ink">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          <ThemeToggle />
          <StatusPill />
        </div>
      </div>
    </header>
  );
}
