import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreatePostComposer } from "@/components/post/create-post-composer";
import type { Community } from "@/lib/types";

export default async function CreatePostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("community_members")
    .select("communities(*)")
    .eq("user_id", user.id);

  const communities = (memberships ?? [])
    .map((m) => m.communities)
    .filter(Boolean) as unknown as Community[];

  if (communities.length === 0) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <p className="text-lg font-medium text-gray-900 mb-1">Join a community first</p>
        <p className="text-sm text-gray-500 mb-4">You need to be a member of a community to post in it.</p>
        <Link
          href="/communities"
          className="inline-block text-sm font-semibold bg-[#1E2952] text-white px-5 py-2.5 rounded-full hover:bg-[#16203D] transition-colors"
        >
          Browse communities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <CreatePostComposer communities={communities} authorId={user.id} />
    </div>
  );
}
