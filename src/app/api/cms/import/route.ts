import { cmsRoute } from "@/lib/cms/api";
import type { CmsItem, CmsType } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { audit, getItem, putItem, putVersion } from "@/lib/cms/store";
import { SEED_PRAYERS } from "@/lib/practice/prayers";
import { SEED_MEDITATIONS } from "@/lib/practice/meditations";
import { SEED_VERSES } from "@/lib/practice/verses";
import { SEED_STORIES } from "@/lib/learn/jataka";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

const verseSlug = (reference: string) => reference.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Brings the content built into the app into the CMS, as published items,
 * so the CMS starts from exactly what readers see today. Items already in
 * the CMS are left alone, so it's safe to run more than once.
 */
export function POST() {
  return cmsRoute(async (actor) => {
    if (actor.role !== "super_admin") throw new CmsError("Only a Super Admin can import.", 403);
    const all: { type: CmsType; slug: string; data: unknown }[] = [
      ...SEED_PRAYERS.map((p) => ({ type: "prayer" as const, slug: p.slug, data: p })),
      ...SEED_MEDITATIONS.map((m) => ({ type: "meditation" as const, slug: m.id, data: m })),
      ...SEED_VERSES.map((v) => ({ type: "verse" as const, slug: verseSlug(v.reference), data: v })),
      ...SEED_STORIES.map((s) => ({ type: "story" as const, slug: s.slug, data: s })),
    ];
    let added = 0;
    const base = Date.now();
    for (const [i, { type, slug, data }] of all.entries()) {
      if (await getItem(type, slug)) continue;
      // Spaced a millisecond apart so the app keeps the built-in order.
      const at = new Date(base + i).toISOString();
      const item = {
        type,
        slug,
        status: "published",
        data,
        version: 1,
        createdAt: at,
        createdBy: actor.id,
        updatedAt: at,
        updatedBy: actor.id,
        subjectReview: { status: "pending" },
        live: { data, version: 1, publishedAt: at, publishedBy: actor.id },
        history: [{ at, by: actor.id, from: "draft", to: "published", note: "Imported from the app" }],
      } as CmsItem;
      await putItem(item);
      await putVersion(type, slug, { version: 1, at, by: actor.id, note: "Imported from the app", data: item.data });
      added++;
    }
    await audit({ by: actor.id, role: actor.role, action: "import", detail: `${added} items` });
    return { added, total: all.length };
  });
}
