import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { ReelsViewer } from "@/components/reels/reels-viewer";

export default async function ReelsPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: memberOf } = await supabase.from("community_members").select("community_id").eq("user_id", user.id);
  const communityIds = (memberOf ?? []).map((m) => m.community_id);
  if (communityIds.length === 0) notFound();

  const { data: postsData } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(*), communities(*)")
    .in("community_id", communityIds)
    .not("video_url", "is", null)
    .order("created_at", { ascending: false });

  const posts = (postsData as Post[]) ?? [];
  const startIndex = posts.findIndex((p) => p.id === postId);
  if (startIndex === -1) notFound();

  const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
  const likedPostIds = (likes ?? []).map((l) => l.post_id);

  return <ReelsViewer posts={posts} startIndex={startIndex} currentUserId={user.id} likedPostIds={likedPostIds} />;
}
