import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModerationStatus } from "./types";

type ListingPostType = "matrimonial_profile" | "business_listing" | "job_listing" | "event_listing";
type ListingRefColumn = "matrimonial_profile_id" | "business_listing_id" | "job_listing_id" | "event_listing_id";

export async function isCommunityMember(admin: SupabaseClient, communityId: string, userId: string): Promise<boolean> {
  const { data } = await admin
    .from("community_members")
    .select("user_id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Mirrors a matrimonial profile / business listing / job listing into the
 * community feed as a real `posts` row on first publish, so likes/comments/
 * moderation-status visibility all just work without any feed-side special
 * casing. Keyed by the unique index on `refColumn`, so calling this again
 * for the same source row (e.g. re-saving a matrimonial profile) updates its
 * existing card instead of creating a duplicate. */
export async function upsertCommunityFeedPost(
  admin: SupabaseClient,
  args: {
    postType: ListingPostType;
    refColumn: ListingRefColumn;
    refId: string;
    communityId: string;
    authorId: string;
    moderationStatus: ModerationStatus;
    title: string;
    content: string | null;
    imageUrl: string | null;
  }
) {
  await admin.from("posts").upsert(
    {
      post_type: args.postType,
      [args.refColumn]: args.refId,
      community_id: args.communityId,
      author_id: args.authorId,
      moderation_status: args.moderationStatus,
      title: args.title,
      content: args.content,
      image_url: args.imageUrl,
    },
    { onConflict: args.refColumn }
  );
}

/** Keeps an already-published companion post's title/content/image and
 * moderation status in sync when its source listing is edited. Deliberately
 * a no-op (not an upsert) when no companion post exists yet — editing a
 * business/job listing shouldn't retroactively publish it to a community
 * feed it was never shared to. */
export async function syncCommunityFeedPostIfExists(
  admin: SupabaseClient,
  args: {
    refColumn: "business_listing_id" | "job_listing_id" | "event_listing_id";
    refId: string;
    moderationStatus: ModerationStatus;
    title: string;
    content: string | null;
    imageUrl: string | null;
  }
) {
  await admin
    .from("posts")
    .update({ moderation_status: args.moderationStatus, title: args.title, content: args.content, image_url: args.imageUrl })
    .eq(args.refColumn, args.refId);
}

export function matrimonialFeedPostContent(input: { full_name: string; about_me?: string | null; city?: string | null; photo_urls: string[] }) {
  return {
    title: `New matrimonial profile: ${input.full_name}`,
    content: input.about_me?.trim() || (input.city ? `Based in ${input.city}.` : null),
    imageUrl: input.photo_urls[0] ?? null,
  };
}

export function businessFeedPostContent(input: { name: string; categories: string[]; area?: string | null; city?: string | null; photo_urls: string[] }) {
  const location = [input.area, input.city].filter(Boolean).join(", ");
  return {
    title: `New business: ${input.name}`,
    content: [input.categories?.join(", "), location].filter(Boolean).join(" • ") || null,
    imageUrl: input.photo_urls[0] ?? null,
  };
}

export function jobFeedPostContent(input: {
  title: string;
  company_name?: string | null;
  job_type?: string | null;
  city?: string | null;
  is_remote: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  photo_urls: string[];
}) {
  const where = input.is_remote ? "Remote" : input.city;
  const salary = input.salary_min || input.salary_max ? `₹${input.salary_min ?? "?"}–${input.salary_max ?? "?"}/mo` : null;
  return {
    title: `New job opening: ${input.title}${input.company_name ? ` at ${input.company_name}` : ""}`,
    content: [input.job_type, where, salary].filter(Boolean).join(" • ") || null,
    imageUrl: input.photo_urls[0] ?? null,
  };
}

export function eventFeedPostContent(input: {
  title: string;
  event_date: string;
  venue_name?: string | null;
  city?: string | null;
  is_online: boolean;
  photo_urls: string[];
}) {
  const when = new Date(input.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const where = input.is_online ? "Online" : [input.venue_name, input.city].filter(Boolean).join(", ");
  return {
    title: `New event: ${input.title}`,
    content: [when, where].filter(Boolean).join(" • ") || null,
    imageUrl: input.photo_urls[0] ?? null,
  };
}
