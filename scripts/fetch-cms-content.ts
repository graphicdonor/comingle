// Runs before every build (npm "prebuild"/"predev"). It:
//
// 1. Fetches the content published in the CMS (Supabase Storage, bucket
//    "cms") and writes it to src/lib/cms/published-content.json, which the
//    app reads. Without CMS access (no keys, or the CMS is still empty) it
//    writes an empty file and the app uses its built-in content.
// 2. Maps every prayer line to its AI voice clip, by content hash, in
//    src/lib/cms/clip-manifest.json: clips in public/audio/prayers (made by
//    scripts/generate-prayer-audio.ts) or made in the CMS (bucket
//    "cms-audio", served at /audio/cms/…). Lines without a clip use the
//    device voice.
// 3. Maps every part of every Jātaka tale (title, paragraphs, lesson) to its
//    narrated clip in public/audio/stories (made by
//    scripts/generate-story-audio.ts), in src/lib/cms/story-clips.json.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Prayer } from "../src/lib/practice/prayers";
import { SEED_PRAYERS } from "../src/lib/practice/prayers-seed";
import { paliToDevanagari } from "../src/lib/practice/pali-devanagari";
import { clipHash, storyClipHash, type ClipLang } from "../src/lib/practice/tts-config";
import { SEED_STORIES, storyParts, type JatakaStory, type NarratedStory } from "../src/lib/learn/jataka-seed";
import { COMMENTARY_STORIES } from "../src/lib/learn/dhammapada-stories";
import type { CmsItem } from "../src/lib/cms/model";

const ROOT = join(__dirname, "..");
const CONTENT = join(ROOT, "src/lib/cms/published-content.json");
const MANIFEST = join(ROOT, "src/lib/cms/clip-manifest.json");
const LOCAL_AUDIO = join(ROOT, "public/audio/prayers");
const STORY_AUDIO = join(ROOT, "public/audio/stories");
const STORY_MANIFEST = join(ROOT, "src/lib/cms/story-clips.json");

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") || undefined;
}

type Published = { prayers: unknown[]; meditations: unknown[]; verses: unknown[]; stories: unknown[] };
const EMPTY: Published = { prayers: [], meditations: [], verses: [], stories: [] };

async function fetchPublished(): Promise<{ content: Published; cmsClips: Map<string, Set<string>> }> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const cmsClips = new Map<string, Set<string>>();
  if (!url || !key) {
    console.log("CMS: no Supabase keys; using the built-in content.");
    return { content: EMPTY, cmsClips };
  }
  const storage = createClient(url, key, { auth: { persistSession: false } }).storage;

  async function items(type: string): Promise<CmsItem[]> {
    const { data, error } = await storage.from("cms").list(`items/${type}`, { limit: 1000 });
    if (error) throw new Error(error.message);
    const docs = await Promise.all(
      (data ?? [])
        .filter((f) => f.name.endsWith(".json"))
        .map(async (f) => {
          const { data: blob, error: e } = await storage.from("cms").download(`items/${type}/${f.name}`);
          if (e || !blob) throw new Error(e?.message ?? `Couldn't read ${f.name}`);
          return JSON.parse(await blob.text()) as CmsItem;
        }),
    );
    // Live items only, in the order they were created.
    return docs.filter((d) => d.live).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  try {
    const [prayers, meditations, verses, stories] = await Promise.all([items("prayer"), items("meditation"), items("verse"), items("story")]);
    for (const p of prayers) {
      const { data } = await storage.from("cms-audio").list(p.slug, { limit: 1000 });
      cmsClips.set(p.slug, new Set((data ?? []).map((f) => f.name)));
    }
    const content = {
      prayers: prayers.map((i) => i.live!.data),
      meditations: meditations.map((i) => i.live!.data),
      verses: verses.map((i) => i.live!.data),
      stories: stories.map((i) => i.live!.data),
    };
    console.log(`CMS: ${content.prayers.length} prayers, ${content.meditations.length} meditations, ${content.verses.length} verses, ${content.stories.length} stories published.`);
    return { content, cmsClips };
  } catch (e) {
    // A build must never ship half the content: fail loudly when the CMS has
    // content but can't be read, rather than silently falling back.
    if (process.env.NETLIFY) throw e;
    console.warn(`CMS: couldn't read content (${e instanceof Error ? e.message : e}); using the built-in content.`);
    return { content: EMPTY, cmsClips };
  }
}

function clipManifest(prayers: Prayer[], cmsClips: Map<string, Set<string>>) {
  // Clips in the repository, by file name, wherever they are.
  const local = new Map<string, string>();
  if (existsSync(LOCAL_AUDIO))
    for (const dir of readdirSync(LOCAL_AUDIO)) for (const f of readdirSync(join(LOCAL_AUDIO, dir))) local.set(f.replace(/\.m4a$/, ""), `/audio/prayers/${dir}/${f}`);

  const manifest: Record<string, Record<string, Partial<Record<ClipLang, { src: string }>>>> = {};
  let found = 0;
  let missing = 0;
  for (const prayer of prayers) {
    const made = cmsClips.get(prayer.slug) ?? new Set();
    const lines: (typeof manifest)[string] = {};
    prayer.sections.forEach((section, si) =>
      section.lines.forEach((line, li) => {
        const clips: Partial<Record<ClipLang, { src: string }>> = {};
        for (const lang of ["pi", "hi", "en"] as const) {
          const name = `${lang}-${clipHash(lang === "pi" ? paliToDevanagari(line.pi) : line[lang], lang)}`;
          const src = local.get(name) ?? (made.has(`${name}.aac`) ? `/audio/cms/${prayer.slug}/${name}.aac` : null);
          if (src) {
            clips[lang] = { src };
            found++;
          } else missing++;
        }
        if (Object.keys(clips).length) lines[`${si}-${li}`] = clips;
      }),
    );
    if (Object.keys(lines).length) manifest[prayer.slug] = lines;
  }
  console.log(`Voice clips: ${found} lines ready${missing ? `, ${missing} without a clip (device voice)` : ""}.`);
  return manifest;
}

function storyManifest(stories: NarratedStory[]) {
  const manifest: Record<string, Record<string, Partial<Record<"hi" | "en", { src: string }>>>> = {};
  let found = 0;
  let missing = 0;
  for (const story of stories) {
    const parts: (typeof manifest)[string] = {};
    for (const lang of ["hi", "en"] as const)
      for (const part of storyParts(story, lang)) {
        const file = `${lang}-${storyClipHash(part.text, lang)}.m4a`;
        if (existsSync(join(STORY_AUDIO, story.slug, file))) {
          (parts[part.key] ??= {})[lang] = { src: `/audio/stories/${story.slug}/${file}` };
          found++;
        } else missing++;
      }
    if (Object.keys(parts).length) manifest[story.slug] = parts;
  }
  console.log(`Story narration: ${found} parts ready${missing ? `, ${missing} without a clip (device voice)` : ""}.`);
  return manifest;
}

async function main() {
  const { content, cmsClips } = await fetchPublished();
  writeFileSync(CONTENT, JSON.stringify(content) + "\n");
  const prayers = content.prayers.length ? (content.prayers as Prayer[]) : SEED_PRAYERS;
  writeFileSync(MANIFEST, JSON.stringify(clipManifest(prayers, cmsClips)) + "\n");
  const stories = content.stories.length ? (content.stories as JatakaStory[]) : SEED_STORIES;
  writeFileSync(STORY_MANIFEST, JSON.stringify(storyManifest([...stories, ...COMMENTARY_STORIES])) + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
