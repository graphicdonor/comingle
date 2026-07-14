/**
 * Fetches a (Supabase Storage) image URL server-side and re-encodes it as a
 * base64 data URL, rather than handing OpenAI's moderation API the raw
 * public URL to fetch itself. Handing over the URL directly was failing
 * intermittently ("Failed to download image from file_url") — almost
 * certainly the object not yet being consistently readable from OpenAI's
 * network moments after upload — which fails the whole check closed
 * (hold_for_review) even for entirely benign content. Fetching it ourselves,
 * from the same server that just uploaded it, sidesteps that dependency
 * instead of working around the symptom.
 */
export async function fetchImageAsDataUrl(url: string): Promise<string> {
  const attempts = 2;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetching image returned ${res.status}`);
      const buffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") || "image/jpeg";
      return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}
