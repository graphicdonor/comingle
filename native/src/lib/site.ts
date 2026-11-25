/**
 * The WePray website: content updates, voice clips, policies and the usage
 * count. EXPO_PUBLIC_SITE_URL can point a development build at a local
 * server; release builds always use the live site.
 */
export const SITE = (__DEV__ && process.env.EXPO_PUBLIC_SITE_URL) || "https://www.wepray.in";

/** A site path (like "/audio/…") as a full URL. */
export const siteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE}${path}`);
