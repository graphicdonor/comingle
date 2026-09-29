import { createAdminClient } from "@/lib/supabase/admin";
import { UserReports, type UserReportRow } from "@/components/admin/user-reports";

export const revalidate = 0;

export default async function AdminUserReportsPage() {
  const { data, error } = await createAdminClient()
    .from("user_reports")
    .select(
      "id, reason, details, status, created_at, reporter:profiles!user_reports_reporter_id_fkey(username), reported:profiles!user_reports_reported_user_id_fkey(username, full_name), comment:comments(content)"
    )
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as UserReportRow[];
  const open = rows.filter((r) => r.status === "open").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reports about people and comments · {open} open. Reported posts go to the Moderation queue.
        </p>
        {error && <p className="text-sm text-red-400 mt-2">Couldn&apos;t load reports: {error.message}</p>}
      </div>
      <UserReports rows={rows} />
    </div>
  );
}
