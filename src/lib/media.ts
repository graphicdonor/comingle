/**
 * Media (images/videos) lives on Cloudinary. Uploads go straight from the
 * client to Cloudinary using a short-lived signature from /api/media/sign —
 * the API secret stays on the server, and the signature pins the folder and
 * allowed formats so a client can't upload arbitrary files elsewhere in the
 * account. Only the resulting delivery URL is stored in the database.
 *
 * Each kind replaces one of the old Supabase Storage buckets.
 */
export const MEDIA_KINDS = {
  "post-image": "image",
  "post-video": "video",
  avatar: "image",
  "community-cover": "image",
  "business-photo": "image",
  "job-photo": "image",
  "event-photo": "image",
  "housing-photo": "image",
  "education-photo": "image",
  "matrimonial-photo": "image",
} as const;

export type MediaKind = keyof typeof MEDIA_KINDS;
export type MediaResourceType = (typeof MEDIA_KINDS)[MediaKind];

export function isMediaKind(value: unknown): value is MediaKind {
  return typeof value === "string" && Object.hasOwn(MEDIA_KINDS, value);
}

export interface SignedUpload {
  cloudName: string;
  apiKey: string;
  resourceType: MediaResourceType;
  /** Every param below is covered by `signature` and must be sent as-is. */
  params: { folder: string; timestamp: number; allowed_formats: string };
  signature: string;
}

/**
 * Turns Cloudinary's raw `secure_url` into the URL we store and render:
 * images get automatic format/quality and a sane max width; videos are
 * delivered as H.264 MP4 so .mov/.webm uploads play everywhere.
 */
export function toDeliveryUrl(secureUrl: string, resourceType: MediaResourceType): string {
  if (resourceType === "video") {
    return secureUrl.replace("/video/upload/", "/video/upload/q_auto/").replace(/\.[a-z0-9]+$/i, ".mp4");
  }
  return secureUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1600/");
}

/** Browser-side upload: signs via the session cookie, then posts the file to Cloudinary. */
export async function uploadMedia(file: Blob, kind: MediaKind): Promise<string> {
  const signRes = await fetch("/api/media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const signed = (await signRes.json().catch(() => ({}))) as SignedUpload & { error?: string };
  if (!signRes.ok) throw new Error(signed.error || "Couldn't prepare the upload.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("signature", signed.signature);
  for (const [key, value] of Object.entries(signed.params)) form.append(key, String(value));

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`, {
    method: "POST",
    body: form,
  });
  const uploaded = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message || "Upload failed. Please try again.");
  }
  return toDeliveryUrl(uploaded.secure_url, signed.resourceType);
}
