import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post/post-card";
import type { Post, Profile, CommunityRole } from "@/lib/types";
import { isCommunityStaff } from "@/lib/community";
import Link from "next/link";
import { HomeGreeting } from "@/components/layout/home-greeting";

const COMMUNITY_SERVICES = [
  { icon: "💍", label: "Matrimonial", href: "/services/matrimonial", color: "from-pink-100 to-rose-100" },
  { icon: "🏥", label: "Health Care", href: "/services/health", color: "from-green-100 to-teal-100" },
  { icon: "🎓", label: "Education", href: "/services/education", color: "from-yellow-100 to-amber-100" },
  { icon: "🏠", label: "Housing", href: "/services/housing", color: "from-orange-100 to-red-100" },
  { icon: "🏪", label: "Businesses", href: "/services/businesses", color: "from-blue-100 to-indigo-100" },
  { icon: "⚖️", label: "Legal Aid", href: "/services/legal", color: "from-purple-100 to-violet-100" },
  { icon: "💼", label: "Jobs", href: "/services/jobs", color: "from-cyan-100 to-sky-100" },
  { icon: "🎭", label: "Events", href: "/services/events", color: "from-lime-100 to-green-100" },
];

const SURVEYS = [
  { id: 1, title: "Help us improve community services", desc: "Share your feedback on our current offerings and help us serve you better." },
  { id: 2, title: "Community needs assessment 2025", desc: "Tell us what resources and support your community needs most right now." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let posts: Post[] = [];
  let likedPostIds: Set<string> = new Set();
  let roleByCommunityId = new Map<string, CommunityRole>();

  if (user) {
    const [{ data: p }, { data: memberOf }, { data: likes }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("community_members").select("community_id, role").eq("user_id", user.id),
      supabase.from("post_likes").select("post_id").eq("user_id", user.id),
    ]);
    profile = p as Profile;
    likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
    roleByCommunityId = new Map((memberOf ?? []).map((m) => [m.community_id, m.role as CommunityRole]));

    const communityIds = [...roleByCommunityId.keys()];
    if (communityIds.length > 0) {
      const { data } = await supabase.from("posts").select("*, profiles!posts_author_id_fkey(*), communities(*)")
        .in("community_id", communityIds).order("created_at", { ascending: false }).limit(20);
      posts = (data as Post[]) ?? [];
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* HomeGreeting is a client component — reads dev store for name/avatar */}
      <HomeGreeting serverProfile={profile} serverUserId={user?.id} />

      {/* Community Services */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Community services</h2>
        <div className="grid grid-cols-4 gap-3">
          {COMMUNITY_SERVICES.map((s) => (
            <Link key={s.label} href={s.href} className="flex flex-col items-center gap-1.5 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform`}>
                {s.icon}
              </div>
              <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Surveys */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Surveys</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {SURVEYS.map((s) => (
            <div key={s.id} className="flex-shrink-0 w-60 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-gray-900 mb-1.5 leading-tight">{s.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.desc}</p>
              <button className="bg-[#E8355A] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#D02E50] transition-colors">
                let&apos;s begin
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      {posts.length > 0 ? (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">Your Feed</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                liked={likedPostIds.has(post.id)}
                canModerate={isCommunityStaff(roleByCommunityId.get(post.community_id))}
              />
            ))}
          </div>
        </section>
      ) : (
        !user && (
          <section className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-gray-500 text-sm mb-4">Join communities to see posts in your feed</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup" className="px-5 py-2.5 bg-[#1E2952] text-white rounded-full font-semibold text-sm hover:bg-[#16203D] transition-colors">
                Get Started
              </Link>
              <Link href="/communities" className="px-5 py-2.5 border border-[#1E2952] text-[#1E2952] rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors">
                Browse
              </Link>
            </div>
          </section>
        )
      )}
    </div>
  );
}
