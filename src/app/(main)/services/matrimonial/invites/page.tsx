import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateAge } from "@/lib/matrimonial";
import { InviteRow } from "@/components/matrimonial/invite-row";
import { ActivitiesSubTabs } from "@/components/matrimonial/activities-sub-tabs";
import type { MatrimonialInvite, Profile } from "@/lib/types";

interface InviteWithSender extends MatrimonialInvite { sender: Profile }
interface InviteWithReceiver extends MatrimonialInvite { receiver: Profile }

export default async function MatrimonialInvitesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: received }, { data: sent }] = await Promise.all([
    supabase.from("matrimonial_invites").select("*, sender:profiles!sender_id(*)")
      .eq("receiver_id", user.id).order("created_at", { ascending: false }),
    supabase.from("matrimonial_invites").select("*, receiver:profiles!receiver_id(*)")
      .eq("sender_id", user.id).order("created_at", { ascending: false }),
  ]);

  const receivedInvites = (received ?? []) as InviteWithSender[];
  const sentInvites = (sent ?? []) as InviteWithReceiver[];

  const otherUserIds = [...new Set([
    ...receivedInvites.map((i) => i.sender_id),
    ...sentInvites.map((i) => i.receiver_id),
  ])];

  const { data: matrimonialAges } = otherUserIds.length > 0
    ? await supabase.from("matrimonial_profiles").select("user_id, date_of_birth").in("user_id", otherUserIds)
    : { data: [] as { user_id: string; date_of_birth: string }[] };

  const ageByUserId = new Map((matrimonialAges ?? []).map((m) => [m.user_id, calculateAge(m.date_of_birth)]));

  return (
    <div>
      <ActivitiesSubTabs active="invites" />
      <div className="space-y-6">
      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Received</h2>
        {receivedInvites.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
            No invites received yet.
          </div>
        ) : (
          <div className="space-y-2">
            {receivedInvites.map((invite) => (
              <InviteRow
                key={`${invite.sender_id}-${invite.receiver_id}`}
                invite={invite}
                role="receiver"
                otherProfile={invite.sender}
                otherMatrimonialAge={ageByUserId.get(invite.sender_id) ?? null}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sent</h2>
        {sentInvites.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400">
            You haven&apos;t sent any invites yet.
          </div>
        ) : (
          <div className="space-y-2">
            {sentInvites.map((invite) => (
              <InviteRow
                key={`${invite.sender_id}-${invite.receiver_id}`}
                invite={invite}
                role="sender"
                otherProfile={invite.receiver}
                otherMatrimonialAge={ageByUserId.get(invite.receiver_id) ?? null}
              />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
