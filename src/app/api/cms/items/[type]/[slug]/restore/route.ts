import { cmsRoute, cmsType, json } from "@/lib/cms/api";
import { restoreVersion } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string; slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  return cmsRoute(async (actor) => {
    const { version } = await json<{ version: number }>(req);
    return { item: await restoreVersion(actor, type, p.slug, Number(version)) };
  });
}
