import { cmsRoute, cmsType } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { getVersion } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string; slug: string }> };

/** One saved version: ?v=3 */
export async function GET(req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  const v = Number(new URL(req.url).searchParams.get("v"));
  return cmsRoute(async (actor) => {
    if (!can(actor, "view")) throw new CmsError("No access.", 403);
    const version = await getVersion(type, p.slug, v);
    if (!version) throw new CmsError("Not found.", 404);
    return { version };
  });
}
