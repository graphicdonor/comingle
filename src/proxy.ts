import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminTokenValid } from "@/lib/admin-auth";

function isAdminAuthed(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const token = request.cookies.get("admin-token")?.value;
  if (!secret || !token) return false;
  return isAdminTokenValid(token, secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route guard ──────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAdminAuthed(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session on every request that could have one, not just
  // gated ones — otherwise a user who mostly browses public pages (home,
  // communities, profiles) never triggers a refresh, their access token
  // expires after its ~1hr lifetime, and they get silently logged out with
  // no refresh ever attempted. Skip entirely when there's no auth cookie at
  // all so anonymous visitors don't pay for a round-trip that can't do
  // anything anyway.
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes("auth-token"));

  let user = null;
  if (!devMode && hasAuthCookie) {
    // getUser() (Auth server) and the is_active RPC (PostgREST, resolving
    // auth.uid() from the same JWT locally in Postgres — no GoTrue round
    // trip of its own) hit different backends, so running them concurrently
    // instead of sequentially roughly halves this middleware's network time
    // on every authenticated request.
    const [{ data: userData }, { data: isActive, error: isActiveError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.rpc("current_user_is_active"),
    ]);
    user = userData.user;

    // A deactivated account (admin-set profiles.is_active = false) is signed
    // out on its next request rather than at the moment it's deactivated —
    // there's no live-session revocation here, just a block on continuing to
    // use the still-valid session token. Skipped for /api/* so route
    // handlers keep making their own auth decisions unchanged, and skipped
    // on an RPC error (e.g. the token was mid-refresh) rather than failing
    // closed — the next request tries again.
    if (user && !isActiveError && isActive === false && !pathname.startsWith("/api/") && pathname !== "/account-disabled") {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/account-disabled";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  // Protected routes
  const protectedPaths = ["/communities/create", "/posts/create", "/settings", "/notifications", "/signup-details", "/pin", "/select-communities", "/profile/edit", "/services/matrimonial", "/services/businesses/register", "/reels"];
  const isManageRoute = pathname.startsWith("/communities/") && pathname.endsWith("/manage");
  const isProtected = isManageRoute || protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (devMode) {
      // In dev mode, gate on the dev-session cookie set after OTP verify
      const devSession = request.cookies.get("dev-session");
      if (!devSession?.value) {
        const url = request.nextUrl.clone();
        url.pathname = "/signup";
        return NextResponse.redirect(url);
      }
    } else if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signup";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
