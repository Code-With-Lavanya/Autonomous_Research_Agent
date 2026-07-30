import Link from "next/link";
import { Logomark } from "./logomark";

export function Footer() {
  return (
    <footer className="border-t border-line-soft mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logomark size={20} />
            <div>
              <p className="text-sm font-medium text-ink">Autonomous Research Agent</p>
              <p className="text-xs text-ink-faint">Planner · Information Gathering · Research · Citation · Writer · Critic</p>
            </div>
          </div>

          <nav className="flex items-center gap-5 text-sm text-ink-soft">
            <Link href="/" className="hover:text-ink transition-colors">
              Ask
            </Link>
            <Link href="/how-it-works" className="hover:text-ink transition-colors">
              How it works
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-line-soft pt-6 text-xs text-ink-faint">
          <p>A self-hosted interface for your own research-agent backend. Nothing here is sent anywhere but your configured API.</p>
          <p className="font-mono">Designed &amp; built by Lavanya Singh</p>
        </div>
      </div>
    </footer>
  );
}
