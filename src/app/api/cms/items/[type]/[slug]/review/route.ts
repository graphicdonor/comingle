import { cmsRoute, cmsType, json } from "@/lib/cms/api";
import type { ReviewLang } from "@/lib/cms/model";
import { CmsError, setReview } from "@/lib/cms/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string; slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const p = await params;
  const type = cmsType(p.type);
  return cmsRoute(async (actor) => {
    const b = await json<{ kind: "language" | "subject"; lang?: ReviewLang; reviewed: boolean }>(req);
    if (b.kind === "subject") return { item: await setReview(actor, type, p.slug, { kind: "subject", reviewed: Boolean(b.reviewed) }) };
    if (b.lang !== "pali" && b.lang !== "hi" && b.lang !== "en") throw new CmsError("Unknown language.");
    return { item: await setReview(actor, type, p.slug, { kind: "language", lang: b.lang, reviewed: Boolean(b.reviewed) }) };
  });
}
