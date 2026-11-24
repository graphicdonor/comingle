import { NextResponse } from "next/server";
import { computeAdminToken } from "@/lib/admin-auth";
import { CMS_TYPES } from "@/lib/cms/model";
import { publishDue, rebuildSite } from "@/lib/cms/service";
import { listItems } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

/** Called hourly by netlify/functions/cms-scheduler.mts: publishes scheduled items that are due. */
export async function POST(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-cms-cron") !== computeAdminToken(secret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let published = 0;
  for (const type of CMS_TYPES) published += await publishDue(await listItems(type));
  if (published) await rebuildSite(`${published} scheduled item(s)`);
  return NextResponse.json({ published });
}
