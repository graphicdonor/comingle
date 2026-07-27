import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  // proxy.ts's middleware already calls auth.getUser() — a real network
  // round trip to Supabase Auth — on every request carrying an auth cookie,
  // and refreshes the very cookies this client reads. Every Server
  // Component and Route Handler calling auth.getUser() again was paying
  // for a second ~300-400ms round trip to re-verify a token middleware
  // already verified moments earlier in the same request. getSession()
  // just decodes that already-verified, already-refreshed JWT from cookies
  // — no network call — so route auth.getUser() through it here instead of
  // editing every call site. (No behavior change for calls that pass an
  // explicit token, e.g. verifying a token from something other than this
  // request's own cookies.)
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = (async (jwt?: string) => {
    if (jwt) return originalGetUser(jwt);
    const {
      data: { session },
      error,
    } = await client.auth.getSession();
    return { data: { user: session?.user ?? null }, error };
  }) as typeof client.auth.getUser;

  return client;
}
