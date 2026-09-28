import { platformForUrl } from "@/lib/donations";

export interface LinkPreview {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}

const MAX_BYTES = 600_000;
const TIMEOUT_MS = 7000;
const MAX_REDIRECTS = 3;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function meta(html: string, key: string): string | null {
  // <meta property="og:title" content="..."> in either attribute order.
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i").exec(html);
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i").exec(html);
  const value = a?.[1] ?? b?.[1];
  return value ? decodeEntities(value) : null;
}

/**
 * Fetches a fundraiser page's Open Graph title/description/image. Only ever
 * requests trusted donation-platform hosts — including across redirects,
 * which are followed by hand so a platform URL can't bounce the server to an
 * arbitrary (e.g. internal) address. Returns nulls rather than throwing when
 * a site blocks or times out; the member can still type a title.
 */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview> {
  const empty: LinkPreview = { title: null, description: null, imageUrl: null };
  let url = rawUrl.trim();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!platformForUrl(url)) return empty;
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WePrayLinkPreview/1.0; +https://www.wepray.in)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      return empty;
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return empty;
      url = new URL(location, url).toString();
      continue;
    }
    if (!res.ok || !res.body || !(res.headers.get("content-type") ?? "").includes("html")) return empty;

    // Read at most MAX_BYTES — OG tags live in <head>.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    await reader.cancel().catch(() => {});
    const html = new TextDecoder().decode(Buffer.concat(chunks));

    const title = meta(html, "og:title") ?? (/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ? decodeEntities(/<title[^>]*>([^<]*)<\/title>/i.exec(html)![1]) : null);
    const description = meta(html, "og:description") ?? meta(html, "description");
    let imageUrl = meta(html, "og:image");
    if (imageUrl) {
      try {
        const abs = new URL(imageUrl, url);
        imageUrl = abs.protocol === "https:" ? abs.toString() : null;
      } catch {
        imageUrl = null;
      }
    }
    return {
      title: title?.slice(0, 200) || null,
      description: description?.slice(0, 500) || null,
      imageUrl,
    };
  }
  return empty;
}

/** Cloudinary's fetch limit on the free plan — larger source images fail. */
const MAX_REMOTE_IMAGE_BYTES = 10_000_000;

/**
 * Turns a platform's og:image into a small, optimised Cloudinary "fetch" URL
 * (≤800px wide, auto format/quality) so a fundraiser card never makes
 * someone download a multi-megabyte original (GoFundMe's can be 17MB+).
 * Returns null for anything that isn't a reachable image under Cloudinary's
 * size limit — the card then shows its placeholder instead.
 */
export async function optimiseRemoteImage(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  try {
    const head = await fetch(imageUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (!head.ok || !(head.headers.get("content-type") ?? "").startsWith("image/")) return null;
    const size = Number(head.headers.get("content-length") ?? 0);
    if (size > MAX_REMOTE_IMAGE_BYTES) return null;
  } catch {
    return null;
  }
  if (!cloud) return imageUrl;
  return `https://res.cloudinary.com/${cloud}/image/fetch/f_auto,q_auto,c_limit,w_800/${encodeURIComponent(imageUrl)}`;
}
