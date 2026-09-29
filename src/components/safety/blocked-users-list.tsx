"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { unblockUser } from "@/lib/safety";

interface BlockedRow {
  blocked_id: string;
  profile: { username: string; full_name: string | null; avatar_url: string | null } | null;
}

/** Settings → Blocked users, with Unblock. */
export function BlockedUsersList({ me }: { me: string }) {
  const [rows, setRows] = useState<BlockedRow[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: blocks } = await supabase.from("user_blocks").select("blocked_id").eq("blocker_id", me).order("created_at", { ascending: false });
      const ids = (blocks ?? []).map((b) => b.blocked_id as string);
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", ids)
        : { data: [] as { id: string; username: string; full_name: string | null; avatar_url: string | null }[] };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      setRows(ids.map((id) => ({ blocked_id: id, profile: byId.get(id) ?? null })));
    })();
  }, [me]);

  if (rows === null) return <p className="text-sm text-gray-400 py-2">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-gray-400 py-2">You haven&apos;t blocked anyone.</p>;

  return (
    <div className="divide-y divide-gray-50">
      {rows.map((r) => (
        <div key={r.blocked_id} className="flex items-center gap-3 py-2.5">
          <Avatar src={r.profile?.avatar_url ?? null} name={r.profile?.full_name || r.profile?.username || "?"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{r.profile?.full_name || r.profile?.username || "Unknown user"}</p>
            {r.profile && <p className="text-xs text-gray-400 truncate">@{r.profile.username}</p>}
          </div>
          <button
            type="button"
            onClick={() => unblockUser(createClient(), me, r.blocked_id).then(() => setRows((prev) => (prev ?? []).filter((x) => x.blocked_id !== r.blocked_id)))}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}
