import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post/post-card";
import { JoinButton } from "@/components/community/join-button";
import { CreatePost } from "@/components/post/create-post";
import { Avatar } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import type { Post, Community } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!community) notFound();

  const c = community as Community;

  let isMember = false;
  if (user) {
    const { data: membership } = await supabase
      .from("community_members")
      .select("user_id")
      .eq("community_id", c.id)
      .eq("user_id", user.id)
      .single();
    isMember = !!membership;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(*), communities(*)")
    .eq("community_id", c.id)
    .order("created_at", { ascending: false })
    .limit(30);

  let likedPostIds: Set<string> = new Set();
  if (user) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
  }

  const communityPosts = (posts ?? []) as Post[];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Community header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar src={c.cover_url} name={c.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{c.name}</h1>
                {c.description && <p className="text-gray-600 text-sm mt-1">{c.description}</p>}
              </div>
              <JoinButton communityId={c.id} isMember={isMember} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {c.member_count.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(c.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create post (members only) */}
      {isMember && user && (
        <div className="mb-4">
          <CreatePost communityId={c.id} authorId={user.id} />
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {communityPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-sm">{isMember ? "Be the first to post!" : "Join to start posting."}</p>
          </div>
        ) : (
          communityPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              liked={likedPostIds.has(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
