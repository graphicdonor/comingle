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
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  creator_id: string;
  member_count: number;
  created_at: string;
}

export interface CommunityMember {
  community_id: string;
  user_id: string;
  role: "member" | "moderator" | "admin";
  joined_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  author_id: string;
  community_id: string;
  like_count: number;
  comment_count: number;
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
