import type { Prayer } from "@/lib/practice/prayers";
import type { DailyVerse } from "@/lib/practice/verses";
import {
  allowedTransitions,
  can,
  canReviewLanguage,
  SLUG,
  type Actor,
  type CmsData,
  type CmsItem,
  type CmsType,
  type Permission,
  type ReviewLang,
  type Status,
} from "./model";
import { validate } from "./validate";
import { audit, getItem, getVersion, putItem, putVersion } from "./store";

export class CmsError extends Error {
  constructor(
    message: string,
    public status = 400,
    public problems: string[] = [],
  ) {
    super(message);
  }
}

function need(actor: Actor, permission: Permission) {
  if (!can(actor, permission)) throw new CmsError("You don't have permission to do that.", 403);
}

const now = () => new Date().toISOString();

/** Keeps the item's own identifier in step with its slug. */
function withSlug<T extends CmsType>(type: T, slug: string, data: CmsData[T]): CmsData[T] {
  if (type === "prayer") return { ...(data as Prayer), slug } as CmsData[T];
  if (type === "meditation") return { ...data, id: slug } as CmsData[T];
  return data;
}

// What each language reviewer signs off: if any of it changes, their sign-off
// no longer applies and goes back to draft.
function languageView(type: CmsType, data: unknown, lang: ReviewLang): string {
  const pick = (v: unknown, key: string): unknown => {
    if (Array.isArray(v)) return v.map((x) => pick(x, key));
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (key in o && typeof o[key] === "string") return o[key];
      return Object.fromEntries(Object.entries(o).filter(([k]) => k !== "review").map(([k, x]) => [k, pick(x, key)]));
    }
    return null;
  };
  if (type === "verse") {
    const v = data as DailyVerse;
    return JSON.stringify(lang === "pali" ? v.pi : v[lang]);
  }
  return JSON.stringify(pick(data, lang === "pali" ? "pi" : lang));
}

/** Applies the reviews an actor may set, and clears sign-offs whose text changed. */
function reconcileReviews<T extends CmsType>(actor: Actor, type: T, before: CmsItem<T> | null, data: CmsData[T]): CmsData[T] {
  if (type === "verse") {
    const next = data as DailyVerse;
    const prev = before?.data as DailyVerse | undefined;
    const old = prev?.review ?? "draft";
    const changed = Boolean(prev) && (["pali", "hi", "en"] as const).some((l) => languageView(type, prev, l) !== languageView(type, next, l));
    const mayReview = (["pali", "hi", "en"] as const).every((l) => canReviewLanguage(actor, l));
    let review = mayReview ? next.review : old;
    // Edited text loses its sign-off, unless the reviewer is signing it off in this very save.
    if (changed && review === "reviewed" && !(mayReview && old !== "reviewed")) review = "draft";
    return { ...next, review } as CmsData[T];
  }
  if (type !== "prayer") return data;
  const next = data as Prayer;
  const prev = before?.data as Prayer | undefined;
  const review = { ...next.review };
  for (const lang of ["pali", "hi", "en"] as const) {
    const old = prev?.review[lang] ?? { status: "draft" as const };
    const textChanged = prev ? languageView(type, prev, lang) !== languageView(type, next, lang) : false;
    if (!canReviewLanguage(actor, lang)) review[lang] = old;
    if (textChanged && review[lang].status === "reviewed" && !(canReviewLanguage(actor, lang) && old.status !== "reviewed")) review[lang] = { status: "draft" };
    if (review[lang].status === "reviewed" && !review[lang].reviewedBy) review[lang] = { ...review[lang], reviewedBy: actor.name };
  }
  return { ...next, review } as CmsData[T];
}

function reviewsComplete(item: CmsItem): string[] {
  const missing: string[] = [];
  if (item.subjectReview.status !== "reviewed") missing.push("subject review");
  if (item.type === "prayer") {
    const r = (item.data as Prayer).review;
    for (const [k, label] of [["pali", "Pali"], ["hi", "Hindi"], ["en", "English"]] as const) if (r[k].status !== "reviewed") missing.push(`${label} review`);
  } else if (item.type === "verse" && (item.data as DailyVerse).review !== "reviewed") missing.push("language review");
  return missing;
}

async function saveVersion<T extends CmsType>(item: CmsItem<T>, by: string, note?: string) {
  await putVersion(item.type, item.slug, { version: item.version, at: item.updatedAt, by, note, data: item.data });
}

// ── Create and edit ─────────────────────────────────────────────────────
export async function createItem<T extends CmsType>(actor: Actor, type: T, slug: string, data: CmsData[T]): Promise<CmsItem<T>> {
  need(actor, "create");
  if (!SLUG.test(slug)) throw new CmsError("Use lowercase letters, numbers and hyphens for the address (e.g. karaniya-metta).");
  if (await getItem(type, slug)) throw new CmsError("Something with this address already exists.", 409);
  const clean = reconcileReviews(actor, type, null, withSlug(type, slug, data));
  const problems = validate(type, clean);
  if (problems.length) throw new CmsError("Please fix the highlighted problems.", 422, problems);
  const at = now();
  const item: CmsItem<T> = {
    type,
    slug,
    status: "draft",
    data: clean,
    version: 1,
    createdAt: at,
    createdBy: actor.id,
    updatedAt: at,
    updatedBy: actor.id,
    subjectReview: { status: "pending" },
    history: [],
  };
  await putItem(item);
  await saveVersion(item, actor.id, "Created");
  await audit({ by: actor.id, role: actor.role, action: "create", type, slug });
  return item;
}

export async function saveDraft<T extends CmsType>(actor: Actor, type: T, slug: string, data: CmsData[T], note?: string): Promise<CmsItem<T>> {
  need(actor, "edit");
  const item = await getItem(type, slug);
  if (!item) throw new CmsError("Not found.", 404);
  const clean = reconcileReviews(actor, type, item, withSlug(type, slug, data));
  const problems = validate(type, clean);
  if (problems.length) throw new CmsError("Please fix the highlighted problems.", 422, problems);
  if (JSON.stringify(clean) === JSON.stringify(item.data)) return item;

  const at = now();
  // Approved or live content that changes goes back through review; what's
  // live stays as it is until the new version is published.
  const back: Status[] = ["approved", "scheduled", "published", "archived"];
  const status: Status = back.includes(item.status) ? "draft" : item.status;
  const next: CmsItem<T> = {
    ...item,
    data: clean,
    version: item.version + 1,
    updatedAt: at,
    updatedBy: actor.id,
    status,
    scheduledAt: status === "draft" ? undefined : item.scheduledAt,
    subjectReview: { status: "pending" },
    history: status !== item.status ? [...item.history, { at, by: actor.id, from: item.status, to: status, note: "Edited" }] : item.history,
  };
  await putItem(next);
  await saveVersion(next, actor.id, note);
  await audit({ by: actor.id, role: actor.role, action: "edit", type, slug, detail: `v${next.version}${note ? `: ${note}` : ""}` });
  return next;
}

export async function restoreVersion<T extends CmsType>(actor: Actor, type: T, slug: string, version: number): Promise<CmsItem<T>> {
  const v = await getVersion(type, slug, version);
  if (!v) throw new CmsError("That version doesn't exist.", 404);
  return saveDraft(actor, type, slug, v.data as CmsData[T], `Restored from v${version}`);
}

// ── Reviews ─────────────────────────────────────────────────────────────
export async function setReview(
  actor: Actor,
  type: CmsType,
  slug: string,
  review: { kind: "language"; lang: ReviewLang; reviewed: boolean } | { kind: "subject"; reviewed: boolean },
): Promise<CmsItem> {
  const item = await getItem(type, slug);
  if (!item) throw new CmsError("Not found.", 404);
  const at = now();
  let detail: string;
  if (review.kind === "subject") {
    need(actor, "review_subject");
    item.subjectReview = review.reviewed ? { status: "reviewed", by: actor.name, at } : { status: "pending" };
    detail = `subject: ${item.subjectReview.status}`;
  } else {
    if (!canReviewLanguage(actor, review.lang)) throw new CmsError("You can't review this language.", 403);
    if (type === "prayer") {
      const d = item.data as Prayer;
      d.review = { ...d.review, [review.lang]: review.reviewed ? { status: "reviewed", reviewedBy: actor.name } : { status: "draft" } };
    } else if (type === "verse") {
      (item.data as DailyVerse).review = review.reviewed ? "reviewed" : "draft";
    } else throw new CmsError("Meditations have no language sign-off; use the subject review.");
    detail = `${review.lang}: ${review.reviewed ? "reviewed" : "draft"}`;
  }
  item.updatedAt = at;
  item.updatedBy = actor.id;
  await putItem(item);
  await audit({ by: actor.id, role: actor.role, action: "review", type, slug, detail });
  return item;
}

// ── Workflow ────────────────────────────────────────────────────────────
export async function transition(
  actor: Actor,
  type: CmsType,
  slug: string,
  to: Status,
  opts: { note?: string; scheduledAt?: string; overrideReviews?: boolean } = {},
): Promise<{ item: CmsItem; rebuild: boolean }> {
  const item = await getItem(type, slug);
  if (!item) throw new CmsError("Not found.", 404);
  const t = allowedTransitions(actor, item.status).find((x) => x.to === to);
  if (!t) throw new CmsError("That step isn't available to you right now.", 403);
  if (t.noteRequired && !opts.note?.trim()) throw new CmsError("Please say what needs to change.");

  if (to === "approved" || to === "published" || to === "scheduled") {
    const problems = validate(type, item.data);
    if (problems.length) throw new CmsError("Please fix these problems first.", 422, problems);
  }
  if (to === "approved") {
    const missing = reviewsComplete(item);
    if (missing.length && !(opts.overrideReviews && actor.role === "super_admin")) {
      throw new CmsError(`Still waiting for: ${missing.join(", ")}.`, 422, missing.map((m) => `Missing ${m}`));
    }
  }
  const at = now();
  if (to === "scheduled") {
    const when = opts.scheduledAt ? new Date(opts.scheduledAt) : null;
    if (!when || Number.isNaN(when.getTime()) || when.getTime() < Date.now() + 60_000) throw new CmsError("Choose a time in the future.");
    item.scheduledAt = when.toISOString();
  } else if (to !== "published") item.scheduledAt = undefined;

  let rebuild = false;
  if (to === "published") {
    item.live = { data: item.data, version: item.version, publishedAt: at, publishedBy: actor.id };
    item.scheduledAt = undefined;
    rebuild = true;
  }
  if (to === "archived") {
    item.live = undefined;
    rebuild = true;
  }
  const note = [opts.note?.trim(), to === "approved" && opts.overrideReviews ? "approved without full review" : ""].filter(Boolean).join(" · ") || undefined;
  item.history = [...item.history, { at, by: actor.id, from: item.status, to, note }];
  item.status = to;
  item.updatedAt = at;
  item.updatedBy = actor.id;
  await putItem(item);
  await audit({ by: actor.id, role: actor.role, action: `status → ${to}`, type, slug, detail: note });
  return { item, rebuild };
}

/** Publishes scheduled items that are due. Returns how many went live. */
export async function publishDue(items: CmsItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    if (item.status !== "scheduled" || !item.scheduledAt || new Date(item.scheduledAt).getTime() > Date.now()) continue;
    const at = now();
    item.live = { data: item.data, version: item.version, publishedAt: at, publishedBy: "scheduler" };
    item.history = [...item.history, { at, by: "scheduler", from: "scheduled", to: "published" }];
    item.status = "published";
    item.scheduledAt = undefined;
    item.updatedAt = at;
    await putItem(item);
    await audit({ by: "scheduler", role: "super_admin", action: "status → published", type: item.type, slug: item.slug, detail: "scheduled" });
    count++;
  }
  return count;
}

// ── Site rebuild ────────────────────────────────────────────────────────
/** Starts a new build of the site, which takes the published content live. */
export async function rebuildSite(reason: string): Promise<boolean> {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hook) return false;
  const res = await fetch(`${hook}?trigger_title=${encodeURIComponent(`CMS: ${reason}`)}`, { method: "POST" });
  return res.ok;
}
