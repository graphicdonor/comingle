import { after } from "next/server";
import { cmsRoute, cmsType, json } from "@/lib/cms/api";
import type { Status } from "@/lib/cms/model";
import { rebuildSite, transition } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string; slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  return cmsRoute(async (actor) => {
    const body = await json<{ to: Status; note?: string; scheduledAt?: string; overrideReviews?: boolean }>(req);
    const { item, rebuild } = await transition(actor, type, p.slug, body.to, {
      note: body.note?.slice(0, 500),
      scheduledAt: body.scheduledAt,
      overrideReviews: body.overrideReviews === true,
    });
    let rebuilding = false;
    if (rebuild) {
      rebuilding = Boolean(process.env.NETLIFY_BUILD_HOOK_URL);
      after(() => rebuildSite(`${body.to} ${type} ${p.slug}`));
    }
    return { item, rebuilding };
  });
}
