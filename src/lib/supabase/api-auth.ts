import type { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * The web app authenticates route handlers via the session cookie (see
 * lib/supabase/server.ts). The native (React Native) app has no cookies —
 * it sends its Supabase access token as `Authorization: Bearer <token>`
 * instead. Route handlers that need to work from both call this instead of
 * `createClient()` directly, so RLS-scoped inserts/reads still run as the
 * calling user either way, without ever needing the service-role key here.
 */
export async function getAuthedSupabase(
  req: NextRequest
): Promise<{ supabase: SupabaseClient; user: User | null }> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data } = await supabase.auth.getUser(token);
    return { supabase, user: data.user };
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}
