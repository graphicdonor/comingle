import { NextResponse } from "next/server";
import { getSubscriber, removeSubscriber, validUnsubscribe } from "@/lib/subscribers";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

/** From the link in an email: removes that person from the list. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; t?: unknown } | null;
  const id = String(body?.id ?? "");
  const t = String(body?.t ?? "");
  if (!validUnsubscribe(id, t)) return NextResponse.json({ error: "This unsubscribe link isn't valid." }, { status: 400 });
  const who = await getSubscriber(id);
  await removeSubscriber(id);
  if (who) await logActivity({ event: "unsubscribed", email: who.email, source: "link" });
  return NextResponse.json({ ok: true });
}
