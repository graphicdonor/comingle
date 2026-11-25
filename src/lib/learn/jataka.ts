// Jātaka tales the app shows: those published in the CMS, or the built-in
// set (jataka-seed.ts) before the CMS has any.

import published from "@/lib/cms/published-content.json";
import { SEED_STORIES, type JatakaStory } from "./jataka-seed";

export * from "./jataka-seed";

/** Stories published in the CMS, or the built-in set before the CMS has any. */
const publishedStories = ((published as { stories?: unknown[] }).stories ?? []) as JatakaStory[];
export const STORIES: JatakaStory[] = publishedStories.length ? publishedStories : SEED_STORIES;

export function getStory(slug: string): JatakaStory | undefined {
  return STORIES.find((s) => s.slug === slug);
}
