import { cmsRoute } from "@/lib/cms/api";
import { can } from "@/lib/cms/model";
import { CmsError } from "@/lib/cms/service";
import { listAccounts, listActivity } from "@/lib/activity";
import { listSubscribers } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

/** Accounts and the account-event log. Personal data: Super Admin only. */
export function GET() {
  return cmsRoute(async (actor) => {
    if (!can(actor, "manage_roles")) throw new CmsError("Only a Super Admin can see users.", 403);
    const [accounts, activity, subscribers] = await Promise.all([listAccounts(), listActivity(), listSubscribers()]);
    const subscribed = new Set(subscribers.map((s) => s.email));
    return {
      accounts: accounts.map((a) => ({ ...a, subscribed: Boolean(a.email && subscribed.has(a.email.toLowerCase())) })),
      activity,
    };
  });
}
