import { useSyncExternalStore } from "react";
import { File, Paths } from "expo-file-system";
import { PRAYERS as BUNDLED_PRAYERS, type Prayer } from "@/lib/practice/prayers";
import { MEDITATIONS as BUNDLED_MEDITATIONS, type MeditationPractice } from "@/lib/practice/meditations";
import { DAILY_VERSES as BUNDLED_VERSES, type DailyVerse } from "@/lib/practice/verses";
import { SESSIONS, type PracticeSession } from "@/lib/practice/sessions";
import { STORIES as BUNDLED_STORIES, mergeStories, type JatakaStory } from "@/lib/learn/jataka";
import bundledClips from "@/lib/cms/clip-manifest.json";
import bundledStoryClips from "@/lib/cms/story-clips.json";
import { SITE } from "./site";

// Content: what was published when this app was built, replaced by the latest
// published content (from the website's /api/content) once the app has
// fetched it. The latest copy is kept on the device, so it works offline.

type ClipLang = "pi" | "hi" | "en";
export type Clips = Record<string, Record<string, Partial<Record<ClipLang, { src: string }>>>>;
/** Narrated story parts: slug → part ("title", "p0" …, "lesson") → language → clip. */
export type StoryClips = Record<string, Record<string, Partial<Record<"hi" | "en", { src: string }>>>>;

export interface Content {
  version: string;
  prayers: Prayer[];
  meditations: MeditationPractice[];
  verses: DailyVerse[];
  stories: JatakaStory[];
  clips: Clips;
  storyClips: StoryClips;
}

const BUNDLED: Content = {
  version: "bundled",
  prayers: BUNDLED_PRAYERS,
  meditations: BUNDLED_MEDITATIONS,
  verses: BUNDLED_VERSES,
  stories: BUNDLED_STORIES,
  clips: bundledClips as Clips,
  storyClips: bundledStoryClips as StoryClips,
};

const cacheFile = () => new File(Paths.document, "content.json");

function valid(c: Partial<Content> | null): c is Content {
  return Boolean(c && Array.isArray(c.prayers) && c.prayers.length && Array.isArray(c.meditations) && Array.isArray(c.verses) && c.clips && typeof c.version === "string");
}

/** Downloaded stories replace the bundled ones of the same name; bundled ones never go missing. */
function withStories(c: Content): Content {
  return { ...c, stories: mergeStories(c.stories ?? [], BUNDLED_STORIES), storyClips: c.storyClips ?? BUNDLED.storyClips };
}

let current: Content = BUNDLED;
const listeners = new Set<() => void>();

// The copy saved last time, if any.
try {
  const f = cacheFile();
  if (f.exists) {
    const saved = JSON.parse(f.textSync()) as Content;
    // A copy saved before stories existed keeps the bundled ones.
    if (valid(saved)) current = withStories(saved);
  }
} catch {
  // Fall back to the bundled content.
}

/** Checks for newer published content. Never throws. */
export async function refreshContent(): Promise<void> {
  try {
    const res = await fetch(`${SITE}/api/content`, { headers: { Accept: "application/json" } });
    if (!res.ok) return;
    const next = (await res.json()) as Content;
    if (!valid(next) || next.version === current.version) return;
    current = withStories(next);
    cacheFile().write(JSON.stringify(next));
    listeners.forEach((l) => l());
  } catch {
    // Offline: keep what we have.
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const get = () => current;

export function useContent(): Content {
  return useSyncExternalStore(subscribe, get, get);
}
export const contentNow = get;

export function findPrayer(c: Content, slug: string): Prayer | undefined {
  return c.prayers.find((p) => p.slug === slug);
}

export function sessionPrayers(c: Content, s: PracticeSession): Prayer[] {
  return s.prayerSlugs.map((slug) => findPrayer(c, slug)).filter((p): p is Prayer => Boolean(p));
}

export function sessionMinutes(c: Content, s: PracticeSession): number {
  return sessionPrayers(c, s).reduce((n, p) => n + p.durationMinutes, 0);
}

export function verseFor(c: Content, date: Date): DailyVerse {
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const scheduled = c.verses.find((v) => v.date === today);
  if (scheduled) return scheduled;
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return c.verses[day % c.verses.length];
}

export { SESSIONS };
export type { Prayer, MeditationPractice, DailyVerse, PracticeSession, JatakaStory };
