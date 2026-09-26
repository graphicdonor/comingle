// One-off: copies every media file still referenced from Supabase Storage
// over to Cloudinary and rewrites the stored URLs to match.
//
//   node --env-file=.env.local scripts/migrate-media-to-cloudinary.mjs          # dry run
//   node --env-file=.env.local scripts/migrate-media-to-cloudinary.mjs --apply  # do it
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (plus the
// three CLOUDINARY_* vars for --apply). Safe to re-run: each file gets a deterministic
// public_id, so a second run overwrites the same Cloudinary asset instead
// of creating duplicates. Supabase Storage files are left in place —
// delete the buckets by hand once the new URLs have been checked.
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const STORAGE_MARKER = "/storage/v1/object/public/";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
const required = { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ...(APPLY && { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET }) };
for (const [name, value] of Object.entries(required)) {
  if (!value) throw new Error(`${name} is not set`);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Old bucket → media kind (src/lib/media.ts).
const BUCKET_KINDS = {
  "post-images": "post-image",
  "post-videos": "post-video",
  avatars: "avatar",
  "community-covers": "community-cover",
  "business-photos": "business-photo",
  "job-photos": "job-photo",
  "event-photos": "event-photo",
  "housing-photos": "housing-photo",
  "education-photos": "education-photo",
  "matrimonial-photos": "matrimonial-photo",
};

const SCALAR_COLUMNS = [
  ["profiles", "avatar_url"],
  ["communities", "cover_url"],
  ["posts", "image_url"],
  ["posts", "video_url"],
  ["posts", "video_thumbnail_url"],
];
const ARRAY_COLUMNS = [
  ["business_listings", "photo_urls"],
  ["job_listings", "photo_urls"],
  ["events", "photo_urls"],
  ["housing_listings", "photo_urls"],
  ["education_listings", "photo_urls"],
  ["matrimonial_profiles", "photo_urls"],
  ["moderation_logs", "input_image_urls"],
];

// Every table here is keyed by `id` except this one.
const PRIMARY_KEYS = { matrimonial_profiles: "user_id" };
const keyOf = (table) => PRIMARY_KEYS[table] ?? "id";

const isStorageUrl = (v) => typeof v === "string" && v.includes(STORAGE_MARKER);

// Same rules as toDeliveryUrl in src/lib/media.ts.
function toDeliveryUrl(secureUrl, resourceType) {
  if (resourceType === "video") {
    return secureUrl.replace("/video/upload/", "/video/upload/q_auto/").replace(/\.[a-z0-9]+$/i, ".mp4");
  }
  return secureUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1600/");
}

function planUpload(url) {
  const [bucket, ...rest] = decodeURIComponent(url.split(STORAGE_MARKER)[1].split("?")[0]).split("/");
  const kind = BUCKET_KINDS[bucket];
  if (!kind) throw new Error(`Unknown bucket "${bucket}" in ${url}`);
  const file = rest.pop();
  // Paths were `<userId>/<file>` everywhere except signup avatars (`<userId>.<ext>`).
  const owner = rest.length ? rest.join("/") : file.replace(/\.[^.]+$/, "");
  return {
    kind,
    resourceType: kind === "post-video" ? "video" : "image",
    folder: `${kind}/${owner}`,
    // Keep the extension in the id so e.g. avatar.png and avatar.jpg don't collide.
    publicId: rest.length ? file.replace(/\.([^.]+)$/, "_$1") : `avatar_${file.split(".").pop()}`,
  };
}

async function uploadToCloudinary(url, { resourceType, folder, publicId }) {
  const params = { folder, public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = createHash("sha1").update(toSign + CLOUDINARY_API_SECRET).digest("hex");

  const form = new FormData();
  form.append("file", url); // Cloudinary fetches the public Supabase URL itself
  form.append("api_key", CLOUDINARY_API_KEY);
  form.append("signature", signature);
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || `Upload failed (${res.status})`);
  return toDeliveryUrl(body.secure_url, resourceType);
}

async function fetchAll(table, column) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(`${keyOf(table)}, ${column}`).range(from, from + 999);
    if (error) throw new Error(`${table}.${column}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

// 1. Find every row still pointing at Supabase Storage.
const work = [];
for (const [table, column] of SCALAR_COLUMNS) {
  for (const row of await fetchAll(table, column)) {
    if (isStorageUrl(row[column])) work.push({ table, column, id: row[keyOf(table)], value: row[column], isArray: false });
  }
}
for (const [table, column] of ARRAY_COLUMNS) {
  for (const row of await fetchAll(table, column)) {
    if ((row[column] ?? []).some(isStorageUrl)) work.push({ table, column, id: row[keyOf(table)], value: row[column], isArray: true });
  }
}
const urls = [...new Set(work.flatMap((w) => (w.isArray ? w.value.filter(isStorageUrl) : [w.value])))];

console.log(`${work.length} row fields reference ${urls.length} Supabase Storage files.`);
for (const [table, column] of [...SCALAR_COLUMNS, ...ARRAY_COLUMNS]) {
  const n = work.filter((w) => w.table === table && w.column === column).length;
  if (n) console.log(`  ${table}.${column}: ${n}`);
}
if (!APPLY) {
  for (const url of urls.slice(0, 5)) console.log(`  e.g. ${url}\n    → ${JSON.stringify(planUpload(url))}`);
  console.log("\nDry run only. Re-run with --apply to upload and rewrite URLs.");
  process.exit(0);
}

// 2. Upload each file once.
const newUrlFor = new Map();
const failed = [];
for (const [i, url] of urls.entries()) {
  try {
    newUrlFor.set(url, await uploadToCloudinary(url, planUpload(url)));
    console.log(`[${i + 1}/${urls.length}] ok  ${url.split(STORAGE_MARKER)[1]}`);
  } catch (err) {
    failed.push(url);
    console.log(`[${i + 1}/${urls.length}] FAIL ${url.split(STORAGE_MARKER)[1]} — ${err.message}`);
  }
}

// 3. Rewrite the rows. A URL that failed to upload is left as-is.
let updated = 0;
for (const w of work) {
  const next = w.isArray ? w.value.map((v) => newUrlFor.get(v) ?? v) : newUrlFor.get(w.value) ?? w.value;
  if (JSON.stringify(next) === JSON.stringify(w.value)) continue;
  const { error } = await supabase.from(w.table).update({ [w.column]: next }).eq(keyOf(w.table), w.id);
  if (error) console.log(`UPDATE FAIL ${w.table}.${w.column} id=${w.id} — ${error.message}`);
  else updated++;
}

console.log(`\nUploaded ${newUrlFor.size}/${urls.length} files, updated ${updated}/${work.length} row fields.`);
if (failed.length) {
  console.log(`${failed.length} files failed and still point at Supabase — re-run to retry.`);
  process.exitCode = 1;
}
