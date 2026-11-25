import { Directory, File, Paths } from "expo-file-system";
import type { Clips, StoryClips } from "./content";
import { siteUrl } from "./site";

// Voice clips are kept on the phone after they're first played (or all at
// once with "Download for offline"), so listening works without internet.

const dir = () => new Directory(Paths.document, "clips");

function ensureDir() {
  const d = dir();
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

/** "/audio/prayers/tisarana/pi-6d11.m4a" → "tisarana__pi-6d11.m4a" */
const nameFor = (src: string) => src.replace(/^.*\/audio\//, "").replace(/\//g, "__");

export function cachedClip(src: string): File | null {
  const f = new File(dir(), nameFor(src));
  return f.exists ? f : null;
}

/** A playable URI: the saved file, or the clip on the website. */
export function clipUri(src: string): string {
  return cachedClip(src)?.uri ?? siteUrl(src);
}

const pending = new Map<string, Promise<boolean>>();

/** Saves one clip on the phone. Resolves true when it's there. */
export function saveClip(src: string): Promise<boolean> {
  if (cachedClip(src)) return Promise.resolve(true);
  const running = pending.get(src);
  if (running) return running;
  const job = (async () => {
    try {
      const tmp = new File(Paths.cache, `${nameFor(src)}.part`);
      if (tmp.exists) tmp.delete();
      const out = await File.downloadFileAsync(siteUrl(src), tmp);
      out.move(new File(ensureDir(), nameFor(src)));
      return true;
    } catch {
      return false;
    } finally {
      pending.delete(src);
    }
  })();
  pending.set(src, job);
  return job;
}

/** Every voice clip: prayer lines and, if given, narrated stories. */
export function allClipSources(clips: Clips, storyClips: StoryClips = {}): string[] {
  const out = new Set<string>();
  for (const group of [clips, storyClips] as Record<string, Record<string, Record<string, { src: string } | undefined>>>[])
    for (const parts of Object.values(group)) for (const langs of Object.values(parts)) for (const c of Object.values(langs)) if (c?.src) out.add(c.src);
  return [...out];
}

export interface OfflineState {
  saved: number;
  total: number;
  bytes: number;
}

export function offlineState(clips: Clips, storyClips?: StoryClips): OfflineState {
  const all = allClipSources(clips, storyClips);
  let saved = 0;
  let bytes = 0;
  for (const src of all) {
    const f = cachedClip(src);
    if (f) {
      saved++;
      bytes += f.size ?? 0;
    }
  }
  return { saved, total: all.length, bytes };
}

/** Saves every voice clip, a few at a time. Returns how many failed. */
export async function saveAllClips(clips: Clips, onProgress: (done: number, total: number) => void, storyClips?: StoryClips): Promise<number> {
  const todo = allClipSources(clips, storyClips);
  let done = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let src = queue.shift(); src; src = queue.shift()) {
      if (!(await saveClip(src))) failed++;
      onProgress(++done, todo.length);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return failed;
}

export function removeAllClips() {
  const d = dir();
  if (d.exists) d.delete();
}
