import { NextResponse } from "next/server";
import { removeSubscriber, validUnsubscribe } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

/** From the link in an email: removes that person from the list. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown; t?: unknown } | null;
  const id = String(body?.id ?? "");
  const t = String(body?.t ?? "");
  if (!validUnsubscribe(id, t)) return NextResponse.json({ error: "This unsubscribe link isn't valid." }, { status: 400 });
  await removeSubscriber(id);
  return NextResponse.json({ ok: true });
}
