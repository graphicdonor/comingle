// Generates the narrated "Listen" audio for the Jātaka tales with OpenAI's
// speech model, once, ahead of time: the title, each paragraph and the
// lesson, in Hindi and English (see storyParts in src/lib/learn/jataka.ts).
// The clips ship with the site and the Android app (public/audio/stories), so
// no key reaches a reader and listening works offline. Re-running only makes
// clips for text that is new or changed, and removes clips no longer used.
//
//   npx tsx scripts/generate-story-audio.ts                # every story
//   npx tsx scripts/generate-story-audio.ts sasa-jataka    # one story
//
// Reads OPENAI_API_KEY from .env.local. Clips are re-encoded to 32 kbps mono
// AAC (.m4a) with macOS's afconvert, like the prayer clips.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { STORIES, storyParts } from "../src/lib/learn/jataka";
import { STORY_INSTRUCTIONS, storyClipHash, synthesize, TTS_MODEL, TTS_VOICE } from "../src/lib/practice/tts-config";

const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public/audio/stories");

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") || undefined;
}

async function main() {
  const key = env("OPENAI_API_KEY");
  if (!key) {
    console.error("OPENAI_API_KEY is empty. Add it to .env.local (that file is not committed).");
    process.exit(1);
  }
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const jobs: { label: string; text: string; lang: "hi" | "en"; path: string }[] = [];
  let kept = 0;

  for (const story of STORIES) {
    if (only.length && !only.includes(story.slug)) continue;
    const dir = join(OUT_DIR, story.slug);
    mkdirSync(dir, { recursive: true });
    const used = new Set<string>();
    for (const lang of ["hi", "en"] as const) {
      for (const part of storyParts(story, lang)) {
        const file = `${lang}-${storyClipHash(part.text, lang)}.m4a`;
        used.add(file);
        if (existsSync(join(dir, file))) kept++;
        else jobs.push({ label: `${story.slug} ${part.key} ${lang}`, text: part.text, lang, path: join(dir, file) });
      }
    }
    // Drop clips for text that has since changed.
    for (const f of readdirSync(dir)) if (!used.has(f)) rmSync(join(dir, f));
  }

  let made = 0;
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        const mp3 = job.path.replace(/\.m4a$/, ".mp3");
        writeFileSync(mp3, await synthesize(job.text, job.lang, key, "mp3", STORY_INSTRUCTIONS[job.lang]));
        execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "32000", mp3, job.path]);
        rmSync(mp3);
        console.log(`${++made}/${jobs.length}  ${job.label}`);
      }
    }),
  );

  // The build maps story parts to these files (scripts/fetch-cms-content.ts).
  execFileSync("npx", ["tsx", join(ROOT, "scripts/fetch-cms-content.ts")], { stdio: "inherit" });
  console.log(`\n${made} generated, ${kept} unchanged. Model ${TTS_MODEL}, voice ${TTS_VOICE}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
