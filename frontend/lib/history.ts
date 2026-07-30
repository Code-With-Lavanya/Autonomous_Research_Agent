import type { HistoryEntry } from "./types";

/**
 * The backend has no database in the provided code (sqlalchemy/aiosqlite
 * are listed in requirements.txt but never wired up), so there is no
 * server-side endpoint to persist or list past questions. This history is
 * purely a browser-local convenience stored in localStorage — it is not
 * synced anywhere and a different browser/device will not see it.
 */
const STORAGE_KEY = "ara:history";
const MAX_ENTRIES = 25;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const current = loadHistory();
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can fail silently (private browsing, quota, etc.) — history
    // is a convenience, not a feature the rest of the app depends on.
  }
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((entry) => entry.id !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
