export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  state: string | null;
  city: string | null;
  pin_hash: string | null;
  last_active_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  rules: string | null;
  creator_id: string;
  member_count: number;
  created_at: string;
}

export type CommunityRole = "member" | "moderator" | "admin";

export interface CommunityMember {
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  profiles?: Profile;
}

export type ModerationStatus = "pending_review" | "published" | "blocked";

export interface Post {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  author_id: string;
  community_id: string;
  like_count: number;
  comment_count: number;
  moderation_status: ModerationStatus;
  created_at: string;
  profiles?: Profile;
  communities?: Community;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface MatrimonialProfile {
  user_id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
  city: string | null;
  height: string | null;
  mangalik_dosh: boolean;
  income_range: string | null;
  marital_status: "Never Married" | "Divorced" | "Widowed" | "Separated" | null;
  education: string | null;
  employment_status: string | null;
  created_by: "Self" | "Parents" | "Sibling" | "Relative" | "Friend" | null;
  about_me: string | null;
  photo_urls: string[];
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface MatrimonialInvite {
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  responded_at: string | null;
  sender?: Profile;
  receiver?: Profile;
}

export interface MatrimonialMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export interface MatrimonialShortlistEntry {
  user_id: string;
  shortlisted_user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "matrimonial_message";
  actor_id: string | null;
  link: string;
  count: number;
  read_at: string | null;
  created_at: string;
  actor?: Profile | null;
}

export interface BusinessListing {
  id: string;
  owner_id: string;
  name: string;
  pin_code: string | null;
  address_line1: string | null;
  address_line2: string | null;
  street: string | null;
  landmark: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  poc_name: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  categories: string[];
  open_days: string[];
  open_time: string | null;
  close_time: string | null;
  photo_urls: string[];
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
}

export interface JobListing {
  id: string;
  owner_id: string;
  title: string;
  company_name: string | null;
  job_type: string | null;
  categories: string[];
  city: string | null;
  state: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  poc_name: string | null;
  email: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  application_link: string | null;
  photo_urls: string[];
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: number;
  user_id: string;
  answers: Record<string, string | string[] | number>;
  created_at: string;
  profiles?: Profile;
}
