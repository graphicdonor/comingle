"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { MatrimonialInvite, Profile } from "@/lib/types";

interface InviteRowProps {
  invite: MatrimonialInvite;
  role: "sender" | "receiver";
  otherProfile: Profile | undefined;
  otherMatrimonialAge: number | null;
}

export function InviteRow({ invite, role, otherProfile, otherMatrimonialAge }: InviteRowProps) {
  const [status, setStatus] = useState(invite.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const otherUserId = role === "sender" ? invite.receiver_id : invite.sender_id;

  const mutate = async (nextStatus: "accepted" | "declined" | "cancelled" | "pending") => {
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase
      .from("matrimonial_invites")
      .update({ status: nextStatus, responded_at: nextStatus === "pending" ? null : new Date().toISOString() })
      .eq("sender_id", invite.sender_id).eq("receiver_id", invite.receiver_id);
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setStatus(nextStatus);
    router.refresh();
  };

  const name = otherProfile?.full_name || otherProfile?.username || "Member";

  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
      <Link href={`/services/matrimonial/${otherUserId}`}>
        <Avatar src={otherProfile?.avatar_url ?? null} name={name} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/services/matrimonial/${otherUserId}`} className="font-semibold text-gray-900 text-sm hover:underline">
          {name}{otherMatrimonialAge !== null && <span className="font-normal text-gray-400">, {otherMatrimonialAge}</span>}
        </Link>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {status === "accepted" && (
        <Button variant="dark" size="sm" onClick={() => router.push(`/services/matrimonial/chat/${otherUserId}`)}>Chat</Button>
      )}
      {status === "pending" && role === "receiver" && (
        <div className="flex gap-2">
          <Button variant="dark" size="sm" loading={loading} onClick={() => mutate("accepted")}>Accept</Button>
          <Button variant="ghost" size="sm" loading={loading} onClick={() => mutate("declined")}>Decline</Button>
        </div>
      )}
      {status === "pending" && role === "sender" && (
        <Button variant="ghost" size="sm" loading={loading} onClick={() => mutate("cancelled")}>Cancel</Button>
      )}
      {(status === "declined" || status === "cancelled") && role === "sender" && (
        <Button variant="ghost" size="sm" loading={loading} onClick={() => mutate("pending")}>Re-send</Button>
      )}
      {(status === "declined" || status === "cancelled") && role === "receiver" && (
        <span className="text-xs text-gray-400 capitalize">{status}</span>
      )}
    </div>
  );
}
