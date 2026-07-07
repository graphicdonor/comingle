import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { PostCard } from "@/components/post/post-card";
import { CommunityCard } from "@/components/community/community-card";
import type { Post, Community, Profile } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("username", username).single();
  if (!profile) notFound();

  const p = profile as Profile;
  const isOwn = currentUser?.id === p.id;

  const { data: memberships } = await supabase
    .from("community_members").select("communities(*), role, joined_at")
    .eq("user_id", p.id).order("joined_at", { ascending: false });

  const communities = (memberships ?? [])
    .map((m) => m.communities as unknown as Community)
    .filter(Boolean) as Community[];

  const { data: posts } = await supabase
    .from("posts").select("*, profiles(*), communities(*)")
    .eq("author_id", p.id).order("created_at", { ascending: false }).limit(20);

  let likedPostIds: Set<string> = new Set();
  if (currentUser) {
    const { data: likes } = await supabase
      .from("post_likes").select("post_id").eq("user_id", currentUser.id);
    likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
  }

  const userPosts = (posts ?? []) as Post[];

  let myCommIds: Set<string> = new Set();
  if (currentUser) {
    const { data: mm } = await supabase
      .from("community_members").select("community_id").eq("user_id", currentUser.id);
    myCommIds = new Set((mm ?? []).map((m) => m.community_id));
  }

  const name = p.full_name || p.username;

  return (
    <div className="max-w-xl mx-auto">
      {/* Profile header card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {/* Cover gradient */}
        <div className="h-20 bg-gradient-to-r from-[#8B1A6B]/20 via-purple-100 to-[#2A5C27]/20" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <Avatar src={p.avatar_url} name={name} size="xl" className="ring-4 ring-white" />
            {isOwn && (
              <Link
                href="/settings"
                className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Edit Profile
              </Link>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">@{p.username}</p>

          {p.bio && <p className="text-sm text-gray-700 mt-2">{p.bio}</p>}

          <div className="flex flex-wrap gap-3 mt-3">
            {(p.city || p.state) && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-[#8B1A6B]" />
                {[p.city, p.state].filter(Boolean).join(", ")}
              </span>
            )}
            {p.gender && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{p.gender}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {communities.length} {communities.length === 1 ? "community" : "communities"}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              Joined {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Communities */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Communities
          <span className="ml-2 text-sm font-normal text-gray-400">({communities.length})</span>
        </h2>
        {communities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} isMember={myCommIds.has(c.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            {isOwn ? "You haven't joined any communities yet." : `${p.username} hasn't joined any communities.`}
            {isOwn && (
              <Link href="/communities" className="text-[#8B1A6B] font-semibold block mt-2 hover:underline">
                Explore communities →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Posts */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Posts
          <span className="ml-2 text-sm font-normal text-gray-400">({userPosts.length})</span>
        </h2>
        <div className="space-y-3">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              No posts yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUser?.id} liked={likedPostIds.has(post.id)} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
