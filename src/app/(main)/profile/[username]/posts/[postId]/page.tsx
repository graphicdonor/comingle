import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post, CommunityRole } from "@/lib/types";
import { PostViewer } from "@/components/profile/post-viewer";

export default async function ProfilePostViewPage({ params }: { params: Promise<{ username: string; postId: string }> }) {
  const { username, postId } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("id").eq("username", username).maybeSingle(),
  ]);
  if (!profile) notFound();

  const { data: postsData } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(*), communities(*)")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const posts = (postsData as Post[]) ?? [];
  const startIndex = posts.findIndex((p) => p.id === postId);
  if (startIndex === -1) notFound();

  let likedPostIds: string[] = [];
  let roleByCommunityId = new Map<string, CommunityRole>();
  if (user) {
    const [{ data: likes }, { data: memberships }] = await Promise.all([
      supabase.from("post_likes").select("post_id").eq("user_id", user.id),
      supabase.from("community_members").select("community_id, role").eq("user_id", user.id),
    ]);
    likedPostIds = (likes ?? []).map((l) => l.post_id);
    roleByCommunityId = new Map((memberships ?? []).map((m) => [m.community_id, m.role as CommunityRole]));
  }

  return (
    <PostViewer posts={posts} startIndex={startIndex} currentUserId={user?.id} likedPostIds={likedPostIds} roleByCommunityId={roleByCommunityId} />
  );
}
