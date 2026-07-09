import { Avatar } from "@/components/ui/avatar";
import type { Post, Community, Profile, CommunityRole } from "@/lib/types";
import { isCommunityStaff } from "@/lib/community";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Users, Pencil } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { CommunityCard } from "@/components/community/community-card";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  let profile: Profile | null = null;
  let communities: Community[] = [];
  let userPosts: Post[] = [];
  let isOwn = false;
  let likedPostIds: Set<string> = new Set();

  if (DEV_MODE) {
    // Dev profile is read client-side; we render a shell that hydrates via client component
    const { DevProfilePageShell } = await import("@/components/profile/dev-profile-page");
    return <DevProfilePageShell username={username} />;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [{ data: { user: currentUser } }, { data: p }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").eq("username", username).single(),
  ]);
  if (!p) notFound();
  profile = p as Profile;

  isOwn = currentUser?.id === profile.id;

  const [{ data: memberships }, { data: posts }, { data: likes }, { data: viewerMemberships }] = await Promise.all([
    supabase.from("community_members").select("communities(*), role, joined_at")
      .eq("user_id", profile.id).order("joined_at", { ascending: false }),
    supabase.from("posts").select("*, profiles!posts_author_id_fkey(*), communities(*)")
      .eq("author_id", profile.id).order("created_at", { ascending: false }).limit(20),
    currentUser
      ? supabase.from("post_likes").select("post_id").eq("user_id", currentUser.id)
      : Promise.resolve({ data: null as { post_id: string }[] | null }),
    currentUser
      ? supabase.from("community_members").select("community_id, role").eq("user_id", currentUser.id)
      : Promise.resolve({ data: null as { community_id: string; role: CommunityRole }[] | null }),
  ]);
  communities = (memberships ?? []).map((m) => m.communities as unknown as Community).filter(Boolean);
  userPosts = (posts ?? []) as Post[];
  likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
  const roleByCommunityId = new Map((viewerMemberships ?? []).map((m) => [m.community_id, m.role]));

  return (
    <ProfileView
      profile={profile}
      communities={communities}
      posts={userPosts}
      likedPostIds={likedPostIds}
      isOwn={isOwn}
      currentUserId={currentUser?.id}
      roleByCommunityId={roleByCommunityId}
    />
  );
}

function ProfileView({
  profile: p,
  communities,
  posts,
  likedPostIds,
  isOwn,
  currentUserId,
  roleByCommunityId,
}: {
  profile: Profile;
  communities: Community[];
  posts: Post[];
  likedPostIds: Set<string>;
  isOwn: boolean;
  currentUserId?: string;
  roleByCommunityId: Map<string, CommunityRole>;
}) {
  const name = p.full_name || p.username;

  return (
    <div className="max-w-xl mx-auto">
      {/* Profile header card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-[#8B1A6B]/30 via-purple-100 to-[#2A5C27]/20 relative z-0">
          {isOwn && (
            <Link
              href="/profile/edit"
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-all"
            >
              <Pencil className="w-3 h-3" />
              Edit Profile
            </Link>
          )}
        </div>

        <div className="px-5 pb-5 relative z-10">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar src={p.avatar_url} name={name} size="xl" className="ring-4 ring-white shadow-md" />
            <div className="flex gap-4 text-center pt-2">
              <div>
                <p className="text-lg font-bold text-gray-900">{posts.length}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{communities.length}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Communities</p>
              </div>
            </div>
          </div>

          {/* Name + username */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{name}</h1>
          <p className="text-sm text-[#8B1A6B] font-medium mb-2">@{p.username}</p>

          {p.bio && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{p.bio}</p>}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            {(p.city || p.state) && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                <MapPin className="h-3 w-3 text-[#8B1A6B]" />
                {[p.city, p.state].filter(Boolean).join(", ")}
              </span>
            )}
            {p.gender && (
              <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full capitalize">
                {p.gender}
              </span>
            )}
            {p.date_of_birth && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                <Calendar className="h-3 w-3" />
                {new Date(p.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              <Calendar className="h-3 w-3 text-[#2A5C27]" />
              Joined {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Communities */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B1A6B]" />
            Communities
            <span className="text-sm font-normal text-gray-400">({communities.length})</span>
          </h2>
          {isOwn && (
            <Link href="/communities" className="text-xs text-[#8B1A6B] font-semibold hover:underline">
              Browse →
            </Link>
          )}
        </div>
        {communities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} isMember />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            {isOwn ? "You haven't joined any communities yet." : `@${p.username} hasn't joined any communities.`}
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
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          Posts
          <span className="text-sm font-normal text-gray-400">({posts.length})</span>
        </h2>
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                liked={likedPostIds.has(post.id)}
                canModerate={isCommunityStaff(roleByCommunityId.get(post.community_id))}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
