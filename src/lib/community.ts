import type { CommunityRole } from "@/lib/types";

/** A member can belong to at most this many communities — enforced by a
 * database trigger (community_membership_limit migration); this constant is
 * only for the UI. Keep in sync with the native app's src/lib/community.ts. */
export const MAX_COMMUNITIES = 5;
export const COMMUNITY_LIMIT_MESSAGE = `You can join up to ${MAX_COMMUNITIES} communities. Leave one to join another.`;

export function isCommunityStaff(role: CommunityRole | null | undefined): boolean {
  return role === "moderator" || role === "admin";
}
