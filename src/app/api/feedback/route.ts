import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthedSupabase } from "@/lib/supabase/api-auth";
import { sanitizeFeedback } from "@/lib/feedback-survey";

const MAX_PER_HOUR = 5;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Public feedback survey submission (/survey). No sign-in required; if the
 * caller happens to be signed in, the response is linked to their profile. */
export async function POST(req: NextRequest) {
  let body: { answers?: unknown; name?: unknown; contact?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot: a field hidden from people but filled in by bots. Pretend it
  // worked so bots don't learn to skip it.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const result = sanitizeFeedback(body.answers);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 200) : "";

  const admin = createAdminClient();
  const ipHash = createHash("sha256").update(`feedback:${clientIp(req)}`).digest("hex");

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("public_feedback")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return NextResponse.json({ error: "Thanks! You've sent a lot of feedback already. Please try again later." }, { status: 429 });
  }

  const { user } = await getAuthedSupabase(req);

  const { error } = await admin.from("public_feedback").insert({
    answers: result.answers,
    name: name || null,
    contact: contact || null,
    user_id: user?.id ?? null,
    ip_hash: ipHash,
  });
  if (error) return NextResponse.json({ error: "Couldn't save your feedback. Please try again." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
