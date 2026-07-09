import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/matrimonial/chat-thread";
import type { MatrimonialMessage, Profile } from "@/lib/types";

export default async function MatrimonialChatThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: acceptedInvite }, { data: partner }, { data: messages }, { data: myProfile }] = await Promise.all([
    supabase.from("matrimonial_invites").select("sender_id, receiver_id")
      .eq("status", "accepted")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .maybeSingle(),
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("matrimonial_messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("avatar_url").eq("id", user.id).single(),
  ]);

  // No accepted invite between this pair means no chat — matches the RLS
  // insert policy on matrimonial_messages, enforced again here so the page
  // itself never renders a compose box for an invalid pairing.
  if (!acceptedInvite || !partner) notFound();

  // Opening the thread directly (not via the notification bell) should
  // still clear any pending "new message" notification from this sender —
  // otherwise the unread badge stays stuck until they separately visit
  // /notifications.
  await supabase.from("notifications").update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id).eq("type", "matrimonial_message").eq("actor_id", userId).is("read_at", null);

  return (
    <ChatThread
      currentUserId={user.id}
      currentUserAvatar={myProfile?.avatar_url ?? null}
      partner={partner as Profile}
      initialMessages={(messages ?? []) as MatrimonialMessage[]}
    />
  );
}
