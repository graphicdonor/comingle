// Canonical production origin, used anywhere an absolute URL is required
// (robots.txt, sitemap.xml, canonical links, OG/Twitter image URLs, the blog
// RSS feed). Override via NEXT_PUBLIC_SITE_URL. The Netlify subdomain still
// serves the site, so this must stay the custom domain or search engines
// index the duplicate.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.wepray.in";
