import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { generateMemberCode, formatLastSeen } from "@/lib/matrimonial";
import { PhotoCarousel } from "@/components/matrimonial/photo-carousel";
import { MatrimonialProfileFields } from "@/components/matrimonial/matrimonial-profile-fields";
import { InviteButton, type InviteRelationship } from "@/components/matrimonial/invite-button";
import { ShortlistButton } from "@/components/matrimonial/shortlist-button";
import { createClient } from "@/lib/supabase/server";
import type { MatrimonialProfile } from "@/lib/types";

export default async function MatrimonialUserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (userId === user.id) redirect("/services/matrimonial/profile");

  const [{ data: targetProfile }, { data: myMatrimonialProfile }, { data: invites }, { data: shortlistEntry }, { data: myMemberships }] = await Promise.all([
    supabase.from("matrimonial_profiles").select("*, profiles(*)").eq("user_id", userId).maybeSingle(),
    supabase.from("matrimonial_profiles").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("matrimonial_invites").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`),
    supabase.from("matrimonial_shortlist").select("user_id").eq("user_id", user.id).eq("shortlisted_user_id", userId).maybeSingle(),
    supabase.from("community_members").select("community_id").eq("user_id", user.id),
  ]);

  // RLS already enforces the gender + shared-community visibility rule, so a
  // missing row here means either it doesn't exist or the viewer isn't
  // eligible to see it — both cases render identically as "not found."
  if (!targetProfile) notFound();

  const profile = targetProfile as MatrimonialProfile;

  let communityName: string | null = null;
  const myCommunityIds = (myMemberships ?? []).map((m) => m.community_id);
  if (myCommunityIds.length > 0) {
    const { data: sharedMembership } = await supabase
      .from("community_members")
      .select("communities(name)")
      .eq("user_id", userId)
      .in("community_id", myCommunityIds)
      .limit(1)
      .maybeSingle();
    communityName = (sharedMembership?.communities as unknown as { name: string } | null)?.name ?? null;
  }

  const asSender = (invites ?? []).find((i) => i.sender_id === user.id && i.receiver_id === userId);
  const asReceiver = (invites ?? []).find((i) => i.sender_id === userId && i.receiver_id === user.id);
  let relationship: InviteRelationship = { kind: "none" };
  if (asSender?.status === "accepted" || asReceiver?.status === "accepted") relationship = { kind: "accepted" };
  else if (asReceiver?.status === "pending") relationship = { kind: "received", status: "pending" };
  else if (asSender) relationship = { kind: "sent", status: asSender.status as "pending" | "declined" | "cancelled" };
  else if (asReceiver) relationship = { kind: "received", status: asReceiver.status as "declined" | "cancelled" };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4">
      <div className="relative">
        <PhotoCarousel photos={profile.photo_urls} name={profile.full_name} />
        <div className="absolute top-3 right-3">
          <ShortlistButton targetUserId={userId} initialShortlisted={!!shortlistEntry} />
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-bold text-gray-900">{profile.full_name}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {generateMemberCode(profile.full_name, profile.user_id)} · {formatLastSeen(profile.profiles?.last_active_at)}
        </p>
        {profile.profiles?.username && (
          <Link href={`/profile/${profile.profiles.username}`} className="text-xs text-[#8B1A6B] hover:underline">
            View main profile →
          </Link>
        )}
        <div className="mt-3">
          <InviteButton targetUserId={userId} hasOwnProfile={!!myMatrimonialProfile} relationship={relationship} />
        </div>
      </div>

      <div className="mt-4">
        <MatrimonialProfileFields profile={profile} communityName={communityName} />
      </div>
    </div>
  );
}
