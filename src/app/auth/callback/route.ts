import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

/** The practice app sets this cookie before Google sign-in (src/lib/practice/sync.ts). */
const AUTH_NEXT_COOKIE = "auth-next";

/** Only same-site paths, never "//evil.example" or full URLs. */
function safeNext(raw: string | undefined): string | null {
  if (!raw) return null;
  const path = decodeURIComponent(raw);
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const cookieStore = await cookies();

  // Practice app sign-in (sync across devices): return to where it started,
  // with no community profile set-up. Without the cookie (the native app and
  // older flows) the original behaviour below is unchanged.
  const next = safeNext(cookieStore.get(AUTH_NEXT_COOKIE)?.value);
  if (next) cookieStore.delete(AUTH_NEXT_COOKIE);
  const fail = (reason: string) =>
    NextResponse.redirect(next ? `${origin}${next}?auth=error` : `${origin}/login?error=${reason}`);

  if (!code) {
    return fail("missing_code");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return fail("oauth_failed");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return fail("no_user");
  }

  // The CMS activity log: a new account, or a returning one.
  const isNew = Date.now() - Date.parse(user.created_at) < 5 * 60_000;
  await logActivity({ event: isNew ? "signed_up" : "signed_in", email: user.email ?? null, userId: user.id, source: user.app_metadata?.provider ?? "google" });

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // New user or no profile yet → profile creation wizard
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile?.username) {
    return NextResponse.redirect(`${origin}/signup-details`);
  }

  return NextResponse.redirect(`${origin}/app`);
}
