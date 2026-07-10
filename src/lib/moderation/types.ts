export type ContentType =
  | "post"
  | "matrimonial_profile"
  | "profile_bio"
  | "community_description"
  | "community_rules"
  | "avatar"
  | "community_cover";

export type ModerationDecision = "allow" | "hold_for_review" | "block";

export interface ModerationInput {
  contentType: ContentType;
  userId: string;
  text?: string;
  imageUrls?: string[];
  /** Where the app should send the user for follow-up (their community, their profile, etc). */
  contextLink: string;
}

export interface ModerationResult {
  decision: ModerationDecision;
  scores: Record<string, number>;
  flaggedCategories: string[];
  reason: string;
  apiError?: string;
}
