import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCommunitiesTable } from "@/components/admin/admin-communities-table";
import type { Community } from "@/lib/types";

export const revalidate = 0;

interface CommunityRow extends Community {
  creator_username?: string;
}

export default async function AdminCommunitiesPage() {
  const supabase = createAdminClient();

  const { data: communitiesData } = await supabase
    .from("communities")
    .select("*")
    .order("member_count", { ascending: false });
  const communities = (communitiesData ?? []) as Community[];

  const creatorIds = Array.from(new Set(communities.map((c) => c.creator_id).filter(Boolean)));
  const { data: creatorsData } = creatorIds.length
    ? await supabase.from("profiles").select("id, username").in("id", creatorIds)
    : { data: [] };
  const usernameById: Record<string, string> = {};
  (creatorsData ?? []).forEach((p: { id: string; username: string }) => {
    usernameById[p.id] = p.username;
  });

  const enriched: CommunityRow[] = communities.map((c) => ({
    ...c,
    creator_username: c.creator_id ? usernameById[c.creator_id] : undefined,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Communities</h1>
        <p className="text-sm text-gray-500 mt-1">
          {communities.length} communit{communities.length === 1 ? "y" : "ies"} total
        </p>
      </div>
      <AdminCommunitiesTable communities={enriched} />
    </div>
  );
}
