import { NextResponse } from "next/server";
import { computeAdminToken } from "@/lib/admin-auth";
import { CMS_TYPES } from "@/lib/cms/model";
import { publishDue, rebuildSite } from "@/lib/cms/service";
import { listItems } from "@/lib/cms/store";
import { rollUpUsage } from "@/lib/cms/stats";
import { pruneRateRecords } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

/** Called hourly by netlify/functions/cms-scheduler.mts: publishes scheduled items that are due, rolls up usage counts, and clears old sign-up rate records. */
export async function POST(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-cms-cron") !== computeAdminToken(secret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let published = 0;
  for (const type of CMS_TYPES) published += await publishDue(await listItems(type));
  if (published) await rebuildSite(`${published} scheduled item(s)`);
  await rollUpUsage().catch((e) => console.error("usage roll-up failed", e));
  await pruneRateRecords().catch((e) => console.error("subscribe rate prune failed", e));
  return NextResponse.json({ published });
}
