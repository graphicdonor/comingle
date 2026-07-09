import type { CommunityRole } from "@/lib/types";

export function isCommunityStaff(role: CommunityRole | null | undefined): boolean {
  return role === "moderator" || role === "admin";
}
