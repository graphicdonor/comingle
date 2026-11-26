import { cmsRoute, json } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { audit } from "@/lib/cms/store";
import { listSubscribers, removeSubscriber, unsubscribeUrl } from "@/lib/subscribers";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

// Email subscribers are personal data: only a Super Admin sees them.

export function GET() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "manage_roles")) throw new CmsError("Only a Super Admin can see subscribers.", 403);
    const list = await listSubscribers();
    return { subscribers: list.map((s) => ({ ...s, unsubscribe: unsubscribeUrl(SITE_URL, s.email) })) };
  });
}

export async function DELETE(req: Request) {
  return cmsRoute(async (actor) => {
    if (!can(actor, "manage_roles")) throw new CmsError("Only a Super Admin can remove subscribers.", 403);
    const { id } = await json<{ id: string }>(req);
    await removeSubscriber(String(id));
    await audit({ by: actor.id, role: actor.role, action: "subscriber_removed", detail: String(id) });
    return { ok: true };
  });
}
