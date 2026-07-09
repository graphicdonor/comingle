import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCommunityStaff } from "@/lib/community";
import { ManagePanelTabs } from "@/components/community/manage-panel-tabs";
import type { Community, CommunityRole, Profile } from "@/lib/types";

interface MemberWithProfile {
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  profiles: Profile;
}

const ROLE_ORDER: Record<CommunityRole, number> = { admin: 0, moderator: 1, member: 2 };

export default async function ManageCommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: community } = await supabase.from("communities").select("*").eq("slug", slug).single();
  if (!community) notFound();
  const c = community as Community;

  const { data: viewerMembership } = await supabase
    .from("community_members").select("role").eq("community_id", c.id).eq("user_id", user.id).maybeSingle();
  const viewerRole = (viewerMembership?.role ?? null) as CommunityRole | null;

  // Manage is a moderation panel, not a public member directory — anyone
  // without staff access is bounced back to the regular community page.
  if (!isCommunityStaff(viewerRole)) redirect(`/communities/${slug}`);

  const { data: members } = await supabase
    .from("community_members")
    .select("user_id, role, joined_at, profiles(*)")
    .eq("community_id", c.id);

  const sortedMembers = ((members ?? []) as unknown as MemberWithProfile[])
    .filter((m) => m.profiles)
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.joined_at.localeCompare(b.joined_at));

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/communities/${slug}`} className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
          <ChevronLeft className="h-5 w-5 text-orange-500" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Manage {c.name}</h1>
          <p className="text-xs text-gray-400">{sortedMembers.length} members</p>
        </div>
      </div>

      <ManagePanelTabs
        community={c}
        members={sortedMembers.map((m) => ({ userId: m.user_id, role: m.role, profile: m.profiles }))}
        viewerRole={viewerRole as CommunityRole}
        viewerUserId={user.id}
        canEditSettings={viewerRole === "admin"}
      />
    </div>
  );
}
