// Canonical production origin, used anywhere an absolute URL is required
// (robots.txt, sitemap.xml, OG/Twitter image URLs). Override via
// NEXT_PUBLIC_SITE_URL once a custom domain is attached — until then this
// falls back to the current Netlify URL so those routes work out of the box.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://comingle-app-523.netlify.app";
