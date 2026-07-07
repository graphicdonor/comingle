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
