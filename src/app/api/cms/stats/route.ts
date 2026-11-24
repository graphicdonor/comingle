import { cmsRoute } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { usageSummary } from "@/lib/cms/stats";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export function GET() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "view")) throw new CmsError("No access.", 403);
    return { usage: await usageSummary() };
  });
}
