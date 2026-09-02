import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Deliberately static and small: only the genuinely public marketing/entry
// and directory-browse surfaces. Per-user content (profiles, individual
// posts, matrimonial) is excluded here the same way it's excluded from
// robots.txt — see that file for why.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/communities`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/services/businesses`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/services/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/services/events`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];
}
