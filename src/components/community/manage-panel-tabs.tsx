"use client";
import { useState } from "react";
import { MemberRow } from "./member-row";
import { CommunitySettingsForm } from "./community-settings-form";
import { cn } from "@/lib/utils";
import type { Community, CommunityRole, Profile } from "@/lib/types";

interface ManageMember {
  userId: string;
  role: CommunityRole;
  profile: Profile;
}

interface ManagePanelTabsProps {
  community: Community;
  members: ManageMember[];
  viewerRole: CommunityRole;
  viewerUserId: string;
  canEditSettings: boolean;
}

export function ManagePanelTabs({ community, members, viewerRole, viewerUserId, canEditSettings }: ManagePanelTabsProps) {
  const [tab, setTab] = useState<"members" | "settings">("members");
  const showSettings = canEditSettings && tab === "settings";

  return (
    <>
      {canEditSettings && (
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-full p-1 w-fit">
          {(["members", "settings"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {showSettings ? (
        <CommunitySettingsForm community={community} />
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <MemberRow
              key={m.userId}
              communityId={community.id}
              userId={m.userId}
              role={m.role}
              profile={m.profile}
              viewerRole={viewerRole}
              viewerUserId={viewerUserId}
            />
          ))}
        </div>
      )}
    </>
  );
}
