// Jātaka tales the app shows: the built-in set (jataka-seed.ts), with each
// story's published CMS version in its place, plus stories added in the CMS.

import published from "@/lib/cms/published-content.json";
import { mergeStories, type JatakaStory } from "./jataka-seed";

export * from "./jataka-seed";

const publishedStories = ((published as { stories?: unknown[] }).stories ?? []) as JatakaStory[];
export const STORIES: JatakaStory[] = mergeStories(publishedStories);

export function getStory(slug: string): JatakaStory | undefined {
  return STORIES.find((s) => s.slug === slug);
}
