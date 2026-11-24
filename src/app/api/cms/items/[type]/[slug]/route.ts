import { cmsRoute, cmsType, json } from "@/lib/cms/api";
import { allowedTransitions, can, canReviewLanguage, type CmsData } from "@/lib/cms/model";
import { CmsError, saveDraft } from "@/lib/cms/service";
import { getItem, listVersions } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string; slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  return cmsRoute(async (actor) => {
    if (!can(actor, "view")) throw new CmsError("No access.", 403);
    const item = await getItem(type, p.slug);
    if (!item) throw new CmsError("Not found.", 404);
    const versions = (await listVersions(type, p.slug)).map(({ version, at, by, note }) => ({ version, at, by, note }));
    return {
      item,
      versions,
      transitions: allowedTransitions(actor, item.status),
      may: {
        edit: can(actor, "edit"),
        audio: can(actor, "audio"),
        subject: can(actor, "review_subject"),
        languages: (["pali", "hi", "en"] as const).filter((l) => canReviewLanguage(actor, l)),
        override: actor.role === "super_admin",
      },
    };
  });
}

export async function PUT(req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  return cmsRoute(async (actor) => {
    const { data, note } = await json<{ data: CmsData[typeof type]; note?: string }>(req);
    return { item: await saveDraft(actor, type, p.slug, data, note?.slice(0, 200)) };
  });
}
