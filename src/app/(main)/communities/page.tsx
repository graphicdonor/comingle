import { CommunityCard } from "@/components/community/community-card";
import type { Community } from "@/lib/types";
import { DEV_COMMUNITIES } from "@/lib/dev-data";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default async function CommunitiesPage() {
  let allCommunities: Community[] = [];
  let joined: Community[] = [];
  let discover: Community[] = [];
  let isLoggedIn = false;

  if (DEV_MODE) {
    allCommunities = DEV_COMMUNITIES;
    joined = DEV_COMMUNITIES.slice(0, 2);
    discover = DEV_COMMUNITIES.slice(2);
    isLoggedIn = true;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [{ data: { user } }, { data: communities }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("communities").select("*").order("member_count", { ascending: false }),
    ]);
    isLoggedIn = !!user;

    const { data: memberships } = user
      ? await supabase.from("community_members").select("community_id").eq("user_id", user.id)
      : { data: null as { community_id: string }[] | null };
    const memberCommunityIds = new Set((memberships ?? []).map((m) => m.community_id));

    allCommunities = (communities ?? []) as Community[];
    joined = allCommunities.filter((c) => memberCommunityIds.has(c.id));
    discover = allCommunities.filter((c) => !memberCommunityIds.has(c.id));
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Communities</h1>
          <p className="text-sm text-gray-500">Find your people</p>
        </div>
        {isLoggedIn && (
          <Link
            href="/communities/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E2952] text-white rounded-full text-sm font-semibold hover:bg-[#16203D] transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Create
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-200 mb-5 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities..."
          className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
          readOnly
        />
      </div>

      {joined.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Communities</h2>
          <div className="grid grid-cols-2 gap-3">
            {joined.map((c) => (
              <CommunityCard key={c.id} community={c} isMember />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          {joined.length > 0 ? "Discover More" : "All Communities"}
        </h2>
        {discover.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {discover.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-400 text-sm">No more communities to discover.</p>
            {isLoggedIn && (
              <Link href="/communities/create" className="text-[#8B1A6B] font-semibold text-sm mt-2 inline-block hover:underline">
                Create the first one!
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
