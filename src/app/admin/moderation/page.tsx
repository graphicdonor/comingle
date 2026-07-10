import { createAdminClient } from "@/lib/supabase/admin";
import { ModerationQueueTable } from "@/components/admin/moderation-queue-table";

export const revalidate = 0;

export default async function AdminModerationPage() {
  const supabase = createAdminClient();

  const [{ data: queueRows }, { data: appealRows }] = await Promise.all([
    supabase
      .from("moderation_queue")
      .select("*, moderation_logs(*, profiles(username, full_name))")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("moderation_appeals")
      .select("*, moderation_logs(*, profiles(username, full_name))")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          {(queueRows?.length ?? 0)} item{(queueRows?.length ?? 0) !== 1 ? "s" : ""} awaiting review, {(appealRows?.length ?? 0)} pending appeal{(appealRows?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>
      <ModerationQueueTable queueRows={queueRows ?? []} appealRows={appealRows ?? []} />
    </div>
  );
}
