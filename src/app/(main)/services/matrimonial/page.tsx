import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEV_MODE } from "@/lib/dev-auth";
import { isMatrimonialEligible, oppositeGender, calculateAge } from "@/lib/matrimonial";
import { IneligibleNotice } from "@/components/matrimonial/ineligible-notice";
import { MatrimonialProfileCard } from "@/components/matrimonial/matrimonial-profile-card";
import { cn } from "@/lib/utils";
import type { InviteRelationship } from "@/components/matrimonial/invite-button";
import type { MatrimonialProfile, MatrimonialInvite } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newly Joined" },
  { value: "age", label: "Age" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default async function MatrimonialBrowsePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  if (DEV_MODE) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Browsing requires two real accounts to be meaningful, so it&apos;s only available against the live backend.
        </p>
        <Link href="/services/matrimonial/profile" className="text-sm font-semibold text-[#8B1A6B] hover:underline">
          Go to My Profile →
        </Link>
      </div>
    );
  }

  const { sort: sortParam } = await searchParams;
  const sort: SortValue = sortParam === "age" ? "age" : "newest";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: myProfile }, { data: myMatrimonialProfile }, { data: myMemberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("matrimonial_profiles").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("community_members").select("community_id").eq("user_id", user.id),
  ]);

  if (!myProfile) redirect("/signup-details");

  const myGender = myProfile.gender;
  if (!isMatrimonialEligible(myGender)) {
    return <IneligibleNotice />;
  }

  const hasOwnProfile = !!myMatrimonialProfile;
  const communityIds = (myMemberships ?? []).map((m) => m.community_id);

  let candidates: MatrimonialProfile[] = [];
  let invites: MatrimonialInvite[] = [];
  const communityNameByCandidate = new Map<string, string>();
  let lastActiveByCandidate = new Map<string, string | null>();
  let shortlistedIds = new Set<string>();

  if (communityIds.length > 0) {
    const { data: memberRows } = await supabase
      .from("community_members")
      .select("user_id, community_id")
      .in("community_id", communityIds)
      .neq("user_id", user.id);
    const candidateIds = [...new Set((memberRows ?? []).map((r) => r.user_id))];

    if (candidateIds.length > 0) {
      const [{ data: profilesData }, { data: invitesData }, { data: shortlistData }] = await Promise.all([
        supabase
          .from("matrimonial_profiles")
          .select("*, profiles!inner(*)")
          .in("user_id", candidateIds)
          .eq("profiles.gender", oppositeGender(myGender)),
        supabase
          .from("matrimonial_invites")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from("matrimonial_shortlist").select("shortlisted_user_id").eq("user_id", user.id),
      ]);
      candidates = (profilesData ?? []) as MatrimonialProfile[];
      invites = (invitesData ?? []) as MatrimonialInvite[];
      shortlistedIds = new Set((shortlistData ?? []).map((s) => s.shortlisted_user_id));
      lastActiveByCandidate = new Map(candidates.map((c) => [c.user_id, c.profiles?.last_active_at ?? null]));

      const candidateCommunityIds = [...new Set((memberRows ?? []).map((r) => r.community_id))];
      const { data: communitiesData } = await supabase.from("communities").select("id, name").in("id", candidateCommunityIds);
      const communityNameById = new Map((communitiesData ?? []).map((c) => [c.id, c.name]));
      for (const row of memberRows ?? []) {
        if (!communityNameByCandidate.has(row.user_id)) {
          const name = communityNameById.get(row.community_id);
          if (name) communityNameByCandidate.set(row.user_id, name);
        }
      }
    }
  }

  const sorted = [...candidates].sort((a, b) => {
    if (sort === "age") {
      const ageA = calculateAge(a.date_of_birth) ?? 0;
      const ageB = calculateAge(b.date_of_birth) ?? 0;
      return ageA - ageB;
    }
    return b.created_at.localeCompare(a.created_at);
  });

  const relationshipFor = (targetUserId: string): InviteRelationship => {
    const asSender = invites.find((i) => i.sender_id === user.id && i.receiver_id === targetUserId);
    const asReceiver = invites.find((i) => i.sender_id === targetUserId && i.receiver_id === user.id);
    if (asSender?.status === "accepted" || asReceiver?.status === "accepted") return { kind: "accepted" };
    if (asReceiver?.status === "pending") return { kind: "received", status: "pending" };
    if (asSender) return { kind: "sent", status: asSender.status as "pending" | "declined" | "cancelled" };
    if (asReceiver) return { kind: "received", status: asReceiver.status as "declined" | "cancelled" };
    return { kind: "none" };
  };

  return (
    <div>
      {!hasOwnProfile && (
        <div className="relative rounded-3xl overflow-hidden mb-5 p-6 text-center bg-gradient-to-br from-[#8B1A6B] via-[#c23e8a] to-orange-400">
          <Heart className="w-6 h-6 text-white/90 mx-auto mb-2 fill-white/30" />
          <h2 className="text-white font-bold text-lg">Looking for your soulmate?</h2>
          <p className="text-white/85 text-xs mt-1 mb-4">Create your matrimonial profile</p>
          <Link
            href="/services/matrimonial/profile/edit"
            className="inline-block bg-white text-[#8B1A6B] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
          >
            let&apos;s begin
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{sorted.length} profile{sorted.length === 1 ? "" : "s"} found</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={opt.value === "newest" ? "/services/matrimonial" : `/services/matrimonial?sort=${opt.value}`}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                sort === opt.value ? "bg-[#8B1A6B] text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              {opt.label}
            </a>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-sm text-gray-400">
          No matching profiles yet in your communities. Only members of communities you&apos;ve joined who have created a matrimonial profile appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((c) => (
            <MatrimonialProfileCard
              key={c.user_id}
              profile={c}
              communityName={communityNameByCandidate.get(c.user_id) ?? null}
              lastActiveAt={lastActiveByCandidate.get(c.user_id) ?? null}
              hasOwnProfile={hasOwnProfile}
              relationship={relationshipFor(c.user_id)}
              isShortlisted={shortlistedIds.has(c.user_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
