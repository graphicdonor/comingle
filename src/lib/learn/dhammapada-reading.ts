"use client";
import { createLocalStore } from "@/lib/practice/local-store";

// Saved verses and stories, and where the reader left off, kept on this
// device only (literature PRD §7.8, §14): nothing is sent anywhere, there are
// no streaks or scores, and history can be cleared.

/** "v:183" for a verse, "s:kisa-gotami" for a commentary story. */
export type ReadingItem = `v:${number}` | `s:${string}`;

const isItem = (x: unknown): x is ReadingItem => typeof x === "string" && /^(v:\d{1,3}|s:[a-z0-9-]+)$/.test(x);
const items = (raw: unknown): ReadingItem[] => (Array.isArray(raw) ? raw.filter(isItem) : []);

export const dhpBookmarks = createLocalStore<ReadingItem[]>("learn:dhp-bookmarks", [], items);

/** Most recent first; the first one is "Continue reading". */
export const dhpHistory = createLocalStore<ReadingItem[]>("learn:dhp-history", [], items);

const HISTORY_SIZE = 30;

export function markRead(item: ReadingItem) {
  const list = dhpHistory.get();
  if (list[0] === item) return;
  dhpHistory.set([item, ...list.filter((i) => i !== item)].slice(0, HISTORY_SIZE));
}

export function toggleBookmark(item: ReadingItem) {
  const list = dhpBookmarks.get();
  dhpBookmarks.set(list.includes(item) ? list.filter((i) => i !== item) : [item, ...list]);
}

export const verseItem = (n: number): ReadingItem => `v:${n}`;
export const storyItem = (slug: string): ReadingItem => `s:${slug}`;

export function parseItem(item: ReadingItem): { kind: "verse"; n: number } | { kind: "story"; slug: string } {
  return item.startsWith("v:") ? { kind: "verse", n: Number(item.slice(2)) } : { kind: "story", slug: item.slice(2) };
}
