import { NextResponse, type NextRequest } from "next/server";
import { addSubscriber, allowAttempt, normaliseEmail } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Opt-in sign-up for occasional emails (landing page, app settings). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; lang?: unknown; source?: unknown; website?: unknown } | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  // Honeypot: a field people never see; bots fill it.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
  const email = normaliseEmail(body.email);
  if (!email) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  const lang = body.lang === "hi" ? "hi" : "en";
  const source = body.source === "android" ? "android" : body.source === "web" ? "web" : "landing";
  try {
    if (!(await allowAttempt(clientIp(req)))) return NextResponse.json({ error: "Too many tries. Please try again in a little while." }, { status: 429 });
    await addSubscriber({ email, lang, source });
  } catch (e) {
    console.error("subscribe failed", e);
    return NextResponse.json({ error: "Couldn't sign you up just now. Please try again." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
