import { cmsRoute } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { listAudit } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export function GET() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "publish")) throw new CmsError("Only Content Admins can see the audit log.", 403);
    return { entries: await listAudit(300) };
  });
}
