import { cmsRoute, json } from "@/lib/cms/api";
import { clipStatus, makeClip } from "@/lib/cms/audio";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  return cmsRoute(async (actor) => {
    if (!can(actor, "view")) throw new CmsError("No access.", 403);
    return { clips: await clipStatus(slug) };
  });
}

/** Makes one clip: { file } from the status list. */
export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  return cmsRoute(async (actor) => {
    const { file } = await json<{ file: string }>(req);
    await makeClip(actor, slug, String(file));
    return { ok: true };
  });
}
