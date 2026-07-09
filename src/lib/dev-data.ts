// Shared fixture data for DEV_MODE — used wherever the UI needs communities
// to render without a live Supabase backend.
import type { Community } from "@/lib/types";

export const DEV_COMMUNITIES: Community[] = [
  { id: "1", slug: "gurujisangat", name: "Gurujisangat", description: "Spiritual community", member_count: 842, creator_id: "dev", created_at: "", cover_url: null, rules: null },
  { id: "2", slug: "jai-mata-di", name: "Jai Mata Di", description: "Devotional group", member_count: 631, creator_id: "dev", created_at: "", cover_url: null, rules: null },
  { id: "3", slug: "radha-swami-ji", name: "Radha Swami Ji", description: "Satsang community", member_count: 523, creator_id: "dev", created_at: "", cover_url: null, rules: null },
  { id: "4", slug: "sai-sangat", name: "Sai Sangat", description: "Sai devotees", member_count: 417, creator_id: "dev", created_at: "", cover_url: null, rules: null },
  { id: "5", slug: "sikh-community", name: "Sikh Community", description: "Sikh traditions", member_count: 389, creator_id: "dev", created_at: "", cover_url: null, rules: null },
  { id: "6", slug: "hindu-samaj", name: "Hindu Samaj", description: "Hindu culture", member_count: 294, creator_id: "dev", created_at: "", cover_url: null, rules: null },
];
