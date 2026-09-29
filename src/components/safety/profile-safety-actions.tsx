"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDialog } from "@/components/ui/dialog";
import { blockConfirmMessage, blockUser, unblockUser } from "@/lib/safety";
import { ReportUserModal } from "@/components/safety/report-user-modal";

/** Report / Block buttons on someone else's profile. */
export function ProfileSafetyActions({ me, userId, name, initiallyBlocked }: { me: string; userId: string; name: string; initiallyBlocked: boolean }) {
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [reporting, setReporting] = useState(false);
  const dialog = useDialog();
  const router = useRouter();

  const toggleBlock = () => {
    if (blocked) {
      unblockUser(createClient(), me, userId).then(() => {
        setBlocked(false);
        router.refresh();
      });
      return;
    }
    dialog.show({
      ...blockConfirmMessage(name),
      primary: {
        label: "Block",
        onClick: () =>
          blockUser(createClient(), me, userId)
            .then(() => {
              setBlocked(true);
              router.refresh();
            })
            .catch((e) => dialog.show({ variant: "error", title: "Couldn't block", message: e.message })),
      },
      secondary: { label: "Cancel" },
    });
  };

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => setReporting(true)} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
        <Flag className="h-3.5 w-3.5" /> Report
      </button>
      <button type="button" onClick={toggleBlock} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
        <Ban className="h-3.5 w-3.5" /> {blocked ? "Unblock" : "Block"}
      </button>
      {reporting && <ReportUserModal me={me} reportedUserId={userId} onClose={() => setReporting(false)} />}
    </div>
  );
}
