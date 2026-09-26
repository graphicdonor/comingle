import { createHash } from "crypto";
import { MEDIA_KINDS, type MediaKind, type SignedUpload } from "@/lib/media";

const ALLOWED_FORMATS = {
  image: "jpg,jpeg,png,webp",
  video: "mp4,mov,webm",
} as const;

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/**
 * Cloudinary's upload signature: SHA-1 of the alphabetically sorted params
 * (`k=v` joined by `&`) with the API secret appended. Files land under
 * `<kind>/<userId>`, mirroring the old per-user bucket paths so ownership
 * stays traceable from the URL alone.
 */
export function createSignedUpload(kind: MediaKind, userId: string): SignedUpload {
  const resourceType = MEDIA_KINDS[kind];
  const params = {
    allowed_formats: ALLOWED_FORMATS[resourceType],
    folder: `${kind}/${userId}`,
    timestamp: Math.floor(Date.now() / 1000),
  };
  const toSign = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + process.env.CLOUDINARY_API_SECRET!).digest("hex");

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    resourceType,
    params,
    signature,
  };
}
