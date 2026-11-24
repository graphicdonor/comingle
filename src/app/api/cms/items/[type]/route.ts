import { cmsRoute, cmsType, json } from "@/lib/cms/api";
import { can, itemTitle, type CmsData } from "@/lib/cms/model";
import { createItem, CmsError } from "@/lib/cms/service";
import { listItems } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string }> };

export async function GET(_req: Request, { params }: Params) {
  const type = cmsType((await params).type);
  return cmsRoute(async (actor) => {
    if (!can(actor, "view")) throw new CmsError("No access.", 403);
    const items = await listItems(type);
    return {
      items: items
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((i) => ({
          slug: i.slug,
          title: itemTitle(i),
          status: i.status,
          version: i.version,
          liveVersion: i.live?.version ?? null,
          updatedAt: i.updatedAt,
          updatedBy: i.updatedBy,
          scheduledAt: i.scheduledAt ?? null,
        })),
    };
  });
}

export async function POST(req: Request, { params }: Params) {
  const type = cmsType((await params).type);
  return cmsRoute(async (actor) => {
    const { slug, data } = await json<{ slug: string; data: CmsData[typeof type] }>(req);
    return { item: await createItem(actor, type, String(slug ?? "").trim(), data) };
  });
}
