import type { CommunityRole } from "@/lib/types";

/** A member can belong to at most this many communities — enforced by a
 * database trigger (community_membership_limit migration); this constant is
 * only for the UI. Keep in sync with the native app's src/lib/community.ts. */
export const MAX_COMMUNITIES = 5;
export const COMMUNITY_LIMIT_MESSAGE = `You can join up to ${MAX_COMMUNITIES} communities. Leave one to join another.`;

/** The trigger raises with hint 'community_membership_limit' — match on that (message as a fallback). */
export function isCommunityLimitError(err: { message?: string; hint?: string | null } | null | undefined): boolean {
  return !!err && (err.hint === "community_membership_limit" || err.message === COMMUNITY_LIMIT_MESSAGE);
}

/** Options for the standard popup (components/ui/dialog.tsx) when the limit is hit. */
export const COMMUNITY_LIMIT_DIALOG = {
  variant: "warning" as const,
  title: "Community limit reached",
  message: COMMUNITY_LIMIT_MESSAGE,
  primary: { label: "Manage communities", href: "/communities" },
  secondary: { label: "OK" },
};

export function isCommunityStaff(role: CommunityRole | null | undefined): boolean {
  return role === "moderator" || role === "admin";
}
