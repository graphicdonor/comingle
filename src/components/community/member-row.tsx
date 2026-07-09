"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { CommunityRole, Profile } from "@/lib/types";

interface MemberRowProps {
  communityId: string;
  userId: string;
  role: CommunityRole;
  profile: Profile;
  viewerRole: CommunityRole;
  viewerUserId: string;
}

const ROLE_BADGE: Record<CommunityRole, string> = {
  admin: "bg-[#8B1A6B]/10 text-[#8B1A6B]",
  moderator: "bg-indigo-50 text-indigo-600",
  member: "bg-gray-100 text-gray-500",
};

export function MemberRow({ communityId, userId, role: initialRole, profile, viewerRole, viewerUserId }: MemberRowProps) {
  const [role, setRole] = useState(initialRole);
  const [removed, setRemoved] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const isSelf = userId === viewerUserId;
  const viewerIsAdmin = viewerRole === "admin";
  const viewerIsModerator = viewerRole === "moderator";
  const canRemove = !isSelf && ((viewerIsAdmin && role !== "admin") || (viewerIsModerator && role === "member"));
  const canChangeRole = !isSelf && viewerIsAdmin && role !== "admin";

  const setRoleTo = async (next: CommunityRole) => {
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase
      .from("community_members")
      .update({ role: next })
      .eq("community_id", communityId)
      .eq("user_id", userId);
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setRole(next);
    router.refresh();
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    const { error: deleteError } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);
    if (deleteError) { setLoading(false); setError(deleteError.message); return; }
    await supabase.rpc("decrement_member_count", { community_id: communityId });
    setLoading(false);
    setRemoved(true);
    router.refresh();
  };

  if (removed) return null;

  const name = profile.full_name || profile.username;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
      <div className="flex items-center gap-3">
        <Avatar src={profile.avatar_url} name={name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
        </div>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0", ROLE_BADGE[role])}>
          {role}
        </span>
      </div>

      {(canChangeRole || canRemove) && !confirmingRemove && (
        <div className="flex gap-2 justify-end mt-2.5">
          {canChangeRole && (
            role === "member" ? (
              <Button type="button" variant="ghost" size="sm" loading={loading} onClick={() => setRoleTo("moderator")}>
                Promote to Moderator
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" loading={loading} onClick={() => setRoleTo("member")}>
                Demote to Member
              </Button>
            )
          )}
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingRemove(true)} className="!text-red-500">
              Remove
            </Button>
          )}
        </div>
      )}

      {confirmingRemove && (
        <div className="flex items-center gap-2 justify-end mt-2.5">
          <span className="text-xs text-gray-500">Remove {name} from the community?</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingRemove(false)}>Cancel</Button>
          <Button type="button" size="sm" loading={loading} onClick={handleRemove} className="!bg-red-500 hover:!bg-red-600">
            Confirm
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5 text-right">{error}</p>}
    </div>
  );
}
