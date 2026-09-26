import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post/post-card";
import type { Post, CommunityRole } from "@/lib/types";
import { isCommunityStaff } from "@/lib/community";
import Link from "next/link";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let posts: Post[] = [];
  let likedPostIds: Set<string> = new Set();
  let roleByCommunityId = new Map<string, CommunityRole>();

  if (user) {
    // get_home_feed does the "posts in my communities" join server-side in
    // one round trip — a plain .from("posts").in("community_id", ids) needs
    // the id list first, which would make this a second query sequenced
    // after community_members instead of running alongside it here.
    const [{ data: memberOf }, { data: likes }, { data: feedPosts }] = await Promise.all([
      supabase.from("community_members").select("community_id, role").eq("user_id", user.id),
      supabase.from("post_likes").select("post_id").eq("user_id", user.id),
      supabase.rpc("get_home_feed", { p_user_id: user.id, p_limit: 20 }).select("*, profiles!posts_author_id_fkey(*), communities(*)"),
    ]);
    likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
    roleByCommunityId = new Map((memberOf ?? []).map((m) => [m.community_id, m.role as CommunityRole]));
    posts = (feedPosts as Post[]) ?? [];
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Your Feed</h1>

      {posts.length > 0 ? (
        <div className="-mx-4 divide-y-8 divide-gray-100">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              liked={likedPostIds.has(post.id)}
              canModerate={isCommunityStaff(roleByCommunityId.get(post.community_id))}
              variant="feed"
            />
          ))}
        </div>
      ) : (
        <section className="bg-white rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {user ? "No posts yet from your communities" : "Join communities to see posts in your feed"}
          </p>
          <div className="flex gap-3 justify-center">
            {!user && (
              <Link href="/signup" className="px-5 py-2.5 bg-[#1E2952] text-white rounded-full font-semibold text-sm hover:bg-[#16203D] transition-colors">
                Get Started
              </Link>
            )}
            <Link href="/communities" className="px-5 py-2.5 border border-[#1E2952] text-[#1E2952] rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors">
              Browse
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
