import { cmsRoute } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError, rebuildSite } from "@/lib/cms/service";
import { audit } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

/** "Update the app now": rebuilds the site with what's published (e.g. after making audio). */
export function POST() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "publish") && !can(actor, "audio")) throw new CmsError("No access.", 403);
    const ok = await rebuildSite("manual update");
    if (!ok) throw new CmsError("Couldn't start the update: NETLIFY_BUILD_HOOK_URL isn't set on the server.", 500);
    await audit({ by: actor.id, role: actor.role, action: "rebuild" });
    return { ok };
  });
}
