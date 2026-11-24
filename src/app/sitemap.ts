import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { GUIDES } from "@/lib/learn/guides";
import { PRAYERS } from "@/lib/practice/prayers";

// Only the practice companion's public pages; suppressed features
// (src/lib/features.ts) redirect and are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/app`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/practice`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...PRAYERS.map((p) => ({
      url: `${SITE_URL}/practice/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/meditate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/learn`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/learn/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
