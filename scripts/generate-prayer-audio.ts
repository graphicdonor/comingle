// Generates the "Listen" audio for every prayer line with OpenAI's speech
// model, once, ahead of time. The MP3s ship with the app (public/audio), so
// no key reaches the browser, nothing runs on a server, and listening works
// offline. Re-running only regenerates lines whose text or voice changed.
//
//   npx tsx scripts/generate-prayer-audio.ts            # all prayers
//   npx tsx scripts/generate-prayer-audio.ts tisarana   # one prayer
//   npx tsx scripts/generate-prayer-audio.ts --sample   # first line only, to try voices
//
// Reads OPENAI_API_KEY from .env.local. Optional: TTS_MODEL, TTS_VOICE.
// Clips are re-encoded to 32 kbps mono AAC (.m4a) with macOS's afconvert:
// clear for speech, and about a third of the size of the MP3 the API returns.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PRAYERS } from "../src/lib/practice/prayers";
import { paliToDevanagari } from "../src/lib/practice/pali-devanagari";
import { clipHash, synthesize, TTS_MODEL, TTS_VOICE, type ClipLang } from "../src/lib/practice/tts-config";

const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public/audio/prayers");

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") || undefined;
}

const KEY = env("OPENAI_API_KEY");
const MODEL = TTS_MODEL;
const VOICE = TTS_VOICE;

type Lang = ClipLang;

export interface Clip {
  src: string;
  hash: string;
}
export type AudioManifest = Record<string, Record<string, Partial<Record<Lang, Clip>>>>;

const hashOf = (text: string, lang: Lang) => clipHash(text, lang);
const speak = (text: string, lang: Lang) => synthesize(text, lang, KEY!);

async function main() {
  if (!KEY) {
    console.error("OPENAI_API_KEY is empty. Add it to .env.local (that file is not committed).");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const sample = args.includes("--sample");
  const only = args.filter((a) => !a.startsWith("--"));
  const manifest: AudioManifest = {};
  let made = 0;
  let kept = 0;
  const jobs: { label: string; text: string; lang: Lang; path: string }[] = [];

  for (const prayer of PRAYERS) {
    if (only.length && !only.includes(prayer.slug)) continue;
    const dir = join(OUT_DIR, prayer.slug);
    mkdirSync(dir, { recursive: true });
    const lines: AudioManifest[string] = {};
    const used = new Set<string>();

    for (const [si, section] of prayer.sections.entries()) {
      for (const [li, line] of section.lines.entries()) {
        const key = `${si}-${li}`;
        lines[key] = {};
        for (const lang of ["pi", "hi", "en"] as const) {
          const text = lang === "pi" ? paliToDevanagari(line.pi) : line[lang];
          const hash = hashOf(text, lang);
          // Named by content, so a line repeated word for word shares one clip.
          const file = `${lang}-${hash}.m4a`;
          const src = `/audio/prayers/${prayer.slug}/${file}`;
          used.add(file);
          if (existsSync(join(dir, file))) kept++;
          else if (!jobs.some((j) => j.path === join(dir, file))) jobs.push({ label: `${prayer.slug} ${key} ${lang}`, text, lang, path: join(dir, file) });
          lines[key][lang] = { src, hash };
        }
        if (sample) break;
      }
      if (sample) break;
    }
    // Drop clips for text that has since changed.
    if (!sample) for (const f of readdirSync(dir)) if (!used.has(f)) rmSync(join(dir, f));
    manifest[prayer.slug] = sample ? { ...manifest[prayer.slug], ...lines } : lines;
    if (sample) break;
  }

  // A few requests at a time.
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        const mp3 = job.path.replace(/\.m4a$/, ".mp3");
        writeFileSync(mp3, await speak(job.text, job.lang));
        execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "32000", mp3, job.path]);
        rmSync(mp3);
        made++;
        console.log(`${made}/${jobs.length}  ${job.label}`);
      }
    }),
  );

  // The build maps lines to these files (scripts/fetch-cms-content.ts).
  void manifest;
  execFileSync("npx", ["tsx", join(ROOT, "scripts/fetch-cms-content.ts")], { stdio: "inherit" });
  console.log(`\n${made} generated, ${kept} unchanged. Model ${MODEL}, voice ${VOICE}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
