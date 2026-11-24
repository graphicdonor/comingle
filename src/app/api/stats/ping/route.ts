import { NextResponse } from "next/server";
import { parsePing, recordPing } from "@/lib/cms/stats";

export const dynamic = "force-dynamic";

/** The app's once-a-day anonymous count (src/lib/practice/usage.ts). Stores no IP or personal data. */
export async function POST(req: Request) {
  const ping = parsePing(await req.json().catch(() => null));
  if (!ping) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  try {
    await recordPing(ping);
  } catch (e) {
    console.error("usage ping failed", e);
    return NextResponse.json({ error: "Not recorded" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
