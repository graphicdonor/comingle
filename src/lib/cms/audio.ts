import type { Prayer } from "@/lib/practice/prayers";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import { clipHash, synthesize, type ClipLang } from "@/lib/practice/tts-config";
import clipManifest from "./clip-manifest.json";
import { can, type Actor } from "./model";
import { audit, getItem, listCmsClips, putCmsClip } from "./store";
import { CmsError } from "./service";

// AI voice clips for prayer lines, from the CMS. Clips the app already has
// (in the repository, or made earlier here) are found by their content
// hash; only new or edited lines need one.

export interface ClipStatus {
  line: string;
  lang: ClipLang;
  text: string;
  file: string;
  ready: boolean;
}

/** Content hashes of every clip the app shipped with at the last build. */
function shippedHashes(): Set<string> {
  const out = new Set<string>();
  for (const lines of Object.values(clipManifest as Record<string, Record<string, Record<string, { src: string }>>>))
    for (const clips of Object.values(lines)) for (const c of Object.values(clips)) out.add(c.src.split("/").pop()!.replace(/\.(m4a|aac)$/, ""));
  return out;
}

export function clipJobs(prayer: Prayer): Omit<ClipStatus, "ready">[] {
  const seen = new Set<string>();
  return prayer.sections.flatMap((section, si) =>
    section.lines.flatMap((line, li) =>
      (["pi", "hi", "en"] as const).flatMap((lang) => {
        const text = lang === "pi" ? paliToDevanagari(line.pi) : line[lang];
        const file = `${lang}-${clipHash(text, lang)}`;
        if (seen.has(file)) return [];
        seen.add(file);
        return [{ line: `${si}-${li}`, lang, text, file }];
      }),
    ),
  );
}

export async function clipStatus(slug: string): Promise<ClipStatus[]> {
  const item = await getItem("prayer", slug);
  if (!item) throw new CmsError("Not found.", 404);
  const shipped = shippedHashes();
  const made = await listCmsClips(slug);
  return clipJobs(item.data).map((j) => ({ ...j, ready: shipped.has(j.file) || made.has(`${j.file}.aac`) }));
}

/** Makes one clip (one request per clip keeps each call well within time limits). */
export async function makeClip(actor: Actor, slug: string, file: string): Promise<void> {
  if (!can(actor, "audio")) throw new CmsError("You don't have permission to do that.", 403);
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new CmsError("Audio isn't set up: OPENAI_API_KEY is missing on the server.", 500);
  const item = await getItem("prayer", slug);
  if (!item) throw new CmsError("Not found.", 404);
  const job = clipJobs(item.data).find((j) => j.file === file);
  if (!job) throw new CmsError("That line has changed; refresh and try again.", 409);
  const audio = await synthesize(job.text, job.lang, key, "aac");
  await putCmsClip(slug, `${file}.aac`, audio, "audio/aac");
  await audit({ by: actor.id, role: actor.role, action: "audio", type: "prayer", slug, detail: `${job.line} ${job.lang}` });
}
