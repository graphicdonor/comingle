// The app currently ships as a Buddhist practice companion only. The earlier
// community features (feed, posts, communities, services, donations, blog,
// phone sign-up, …) are suppressed, not deleted: their pages redirect to the
// home screen (see src/proxy.ts) while their code, data and API routes stay
// intact, so the separate native app's API calls keep working.
//
// To bring a feature back, remove its prefix from this list and restore its
// entry points in the navigation.

export const SUPPRESSED_ROUTE_PREFIXES = [
  // Community and social
  "/feed",
  "/posts",
  "/communities",
  "/profile",
  "/notifications",
  "/search",
  "/reels",
  "/surveys",
  // Directory services and giving
  "/services",
  "/donate",
  // Account sign-up and phone login (practice needs no account)
  "/onboarding",
  "/signup",
  "/signup-details",
  "/login",
  "/otp",
  "/pin",
  "/select-communities",
  "/settings",
  // Marketing pages written for the community product (the landing page at
  // "/" has been rewritten for the practice companion and stays live)
  "/blog",
  "/survey",
  "/dev",
];

/** True when a page path belongs to a suppressed feature. */
export function isSuppressedPath(pathname: string): boolean {
  return SUPPRESSED_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
