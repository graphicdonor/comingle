import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Personal/authenticated surfaces are kept out of search indexes — profile
// pages carry real names, DOB, and other personal fields, and matrimonial
// content is explicitly private-by-community; nothing here should be
// crawlable until that's a deliberate product decision.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/settings",
        "/notifications",
        "/profile/",
        "/services/matrimonial",
        "/pin",
        "/signup-details",
        "/select-communities",
        "/account-disabled",
        "/reels",
        "/dev/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
