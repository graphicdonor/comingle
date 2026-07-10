import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Users can also insert directly via RLS (moderation_appeals has its own
 * "Users can file own appeals" policy) — this route exists for the same
 * reason posts/matrimonial-profile go through routes: server-side
 * validation (does this log actually belong to them, is it even eligible)
 * beyond what a single WITH CHECK clause can express.
 */
export async function POST(req: NextRequest) {
  let body: { logId?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.logId || !body.reason?.trim()) {
    return NextResponse.json({ error: "logId and reason are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: log } = await supabase
    .from("moderation_logs")
    .select("id, user_id, decision")
    .eq("id", body.logId)
    .maybeSingle();
  if (!log || log.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (log.decision === "allow") return NextResponse.json({ error: "This content wasn't held or blocked" }, { status: 400 });

  const { data: existing } = await supabase
    .from("moderation_appeals")
    .select("id")
    .eq("log_id", body.logId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "You've already appealed this" }, { status: 409 });

  const { error: insertError } = await supabase
    .from("moderation_appeals")
    .insert({ log_id: body.logId, user_id: user.id, reason: body.reason.trim() });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
