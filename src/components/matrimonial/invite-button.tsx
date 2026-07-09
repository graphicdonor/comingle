"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type InviteRelationship =
  | { kind: "none" }
  | { kind: "sent"; status: "pending" | "declined" | "cancelled" }
  | { kind: "received"; status: "pending" | "declined" | "cancelled" }
  | { kind: "accepted" };

interface InviteButtonProps {
  targetUserId: string;
  hasOwnProfile: boolean;
  relationship: InviteRelationship;
  fullWidth?: boolean;
}

// The one warm gradient accent in the app, reserved for the primary
// "Send Interest" call to action — matches the reference design's soulmate
// banner and interest buttons. Every other action uses the app's normal
// Button component so this stays a deliberate, single accent, not a new
// competing visual language.
const gradientButtonClass =
  "bg-gradient-to-r from-orange-500 to-[#E8355A] text-white font-semibold rounded-full transition-transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-center";

export function InviteButton({ targetUserId, hasOwnProfile, relationship, fullWidth }: InviteButtonProps) {
  const [state, setState] = useState(relationship);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const withGuard = async (fn: (userId: string) => Promise<void>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fn(user.id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = () =>
    withGuard(async (userId) => {
      // Re-inviting after a decline/cancel updates the existing row (composite
      // PK on sender_id+receiver_id) rather than inserting a new one.
      const hadPriorAttempt = state.kind === "sent";
      const { error: mutationError } = hadPriorAttempt
        ? await supabase.from("matrimonial_invites")
            .update({ status: "pending", responded_at: null })
            .eq("sender_id", userId).eq("receiver_id", targetUserId)
        : await supabase.from("matrimonial_invites")
            .insert({ sender_id: userId, receiver_id: targetUserId });
      if (mutationError) { setError(mutationError.message); return; }
      setState({ kind: "sent", status: "pending" });
    });

  const cancelInvite = () =>
    withGuard(async (userId) => {
      const { error: updateError } = await supabase.from("matrimonial_invites")
        .update({ status: "cancelled", responded_at: new Date().toISOString() })
        .eq("sender_id", userId).eq("receiver_id", targetUserId);
      if (updateError) { setError(updateError.message); return; }
      setState({ kind: "sent", status: "cancelled" });
    });

  const respondToInvite = (accept: boolean) =>
    withGuard(async (userId) => {
      const { error: updateError } = await supabase.from("matrimonial_invites")
        .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
        .eq("sender_id", targetUserId).eq("receiver_id", userId);
      if (updateError) { setError(updateError.message); return; }
      setState(accept ? { kind: "accepted" } : { kind: "received", status: "declined" });
    });

  const wrapClass = cn("flex flex-col gap-1", fullWidth ? "w-full items-stretch" : "items-end");

  if (state.kind === "accepted") {
    return (
      <Button variant="dark" size="sm" fullWidth={fullWidth} onClick={() => router.push(`/services/matrimonial/chat/${targetUserId}`)}>
        Chat
      </Button>
    );
  }

  if (state.kind === "received" && state.status === "pending") {
    return (
      <div className={wrapClass}>
        <div className={cn("flex gap-2", fullWidth && "w-full")}>
          <button onClick={() => respondToInvite(true)} disabled={loading} className={cn(gradientButtonClass, "px-5 py-2.5 text-sm", fullWidth && "flex-1")}>
            Accept
          </button>
          <Button variant="ghost" size="sm" loading={loading} fullWidth={fullWidth} onClick={() => respondToInvite(false)}>Decline</Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (state.kind === "sent" && state.status === "pending") {
    return (
      <div className={wrapClass}>
        <div className={cn("flex items-center gap-2", fullWidth && "w-full")}>
          <Button variant="ghost" size="sm" fullWidth={fullWidth} disabled>Interest Sent</Button>
          <button onClick={cancelInvite} disabled={loading} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // "none", or a previously sent/received invite that was declined/cancelled —
  // in every case the viewer can (re-)send their own invite.
  if (!hasOwnProfile) {
    return (
      <Link href="/services/matrimonial/profile/edit" className="text-xs text-[#8B1A6B] font-semibold hover:underline">
        Create your profile to send interest →
      </Link>
    );
  }

  return (
    <div className={wrapClass}>
      <button onClick={sendInvite} disabled={loading} className={cn(gradientButtonClass, "px-6 py-3 text-sm", fullWidth && "w-full")}>
        {loading ? "Sending…" : "Send Interest"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
