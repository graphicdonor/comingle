import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatListItem } from "@/components/matrimonial/chat-list-item";
import { ActivitiesSubTabs } from "@/components/matrimonial/activities-sub-tabs";
import type { Profile } from "@/lib/types";

export default async function MatrimonialChatListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: acceptedInvites } = await supabase
    .from("matrimonial_invites")
    .select("sender_id, receiver_id")
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  const partnerIds = [...new Set(
    (acceptedInvites ?? []).map((i) => (i.sender_id === user.id ? i.receiver_id : i.sender_id))
  )];

  if (partnerIds.length === 0) {
    return (
      <div>
        <ActivitiesSubTabs active="chat" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          No conversations yet — accept an interest to start chatting.
        </div>
      </div>
    );
  }

  const [{ data: partners }, { data: recentMessages }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", partnerIds),
    supabase.from("matrimonial_messages").select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
  ]);

  const lastMessageByPartner = new Map<string, { content: string; created_at: string; isMine: boolean }>();
  for (const m of recentMessages ?? []) {
    const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
    if (!lastMessageByPartner.has(partnerId)) {
      lastMessageByPartner.set(partnerId, { content: m.content, created_at: m.created_at, isMine: m.sender_id === user.id });
    }
  }

  const partnerById = new Map(((partners ?? []) as Profile[]).map((p) => [p.id, p]));
  const sortedPartnerIds = [...partnerIds].sort((a, b) => {
    const aTime = lastMessageByPartner.get(a)?.created_at ?? "";
    const bTime = lastMessageByPartner.get(b)?.created_at ?? "";
    return bTime.localeCompare(aTime);
  });

  return (
    <div>
      <ActivitiesSubTabs active="chat" />
      <div className="space-y-2">
        {sortedPartnerIds.map((id) => {
          const partner = partnerById.get(id);
          if (!partner) return null;
          return <ChatListItem key={id} partner={partner} lastMessage={lastMessageByPartner.get(id) ?? null} />;
        })}
      </div>
    </div>
  );
}
