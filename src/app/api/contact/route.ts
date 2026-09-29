import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { CONTACT_MESSAGE_MAX, CONTACT_MESSAGE_MIN, isContactTopic } from "@/lib/contact";

const MAX_PER_HOUR = 5;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Contact us form (/contact). No sign-in required; if the sender is signed
 * in, the message is linked to their profile so replies have context. */
export async function POST(req: NextRequest) {
  let body: { topic?: unknown; message?: unknown; name?: unknown; replyTo?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot — see /api/feedback.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  if (!isContactTopic(body.topic)) return NextResponse.json({ error: "Please choose what your message is about." }, { status: 400 });
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < CONTACT_MESSAGE_MIN) return NextResponse.json({ error: "Please write a little more so we can help." }, { status: 400 });
  if (message.length > CONTACT_MESSAGE_MAX) return NextResponse.json({ error: "Your message is too long." }, { status: 400 });
  const replyTo = typeof body.replyTo === "string" ? body.replyTo.trim().slice(0, 200) : "";
  if (replyTo.length < 5) return NextResponse.json({ error: "Please add an email or phone number so we can reply." }, { status: 400 });
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";

  const admin = createAdminClient();
  const ipHash = createHash("sha256").update(`contact:${clientIp(req)}`).digest("hex");
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return NextResponse.json({ error: "You've sent several messages already. Please try again in a little while." }, { status: 429 });
  }

  const { user } = await getAuthedSupabase(req);
  const { error } = await admin.from("contact_messages").insert({
    topic: body.topic,
    message,
    name: name || null,
    reply_to: replyTo,
    user_id: user?.id ?? null,
    ip_hash: ipHash,
  });
  if (error) return NextResponse.json({ error: "Couldn't send your message. Please try again." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
