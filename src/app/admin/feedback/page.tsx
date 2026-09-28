import { createAdminClient } from "@/lib/supabase/admin";
import { FeedbackResponses, type FeedbackRow } from "@/components/admin/feedback-responses";

export const revalidate = 0;

export default async function AdminFeedbackPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("public_feedback")
    .select("id, answers, name, contact, created_at, profiles(username)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as FeedbackRow[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">
          Responses to the public survey at <a href="/survey" target="_blank" className="text-[#E879C9] hover:underline">/survey</a>
          {" · "}
          {rows.length} response{rows.length !== 1 ? "s" : ""}
        </p>
        {error && <p className="text-sm text-red-400 mt-2">Couldn&apos;t load responses: {error.message}</p>}
      </div>
      <FeedbackResponses rows={rows} />
    </div>
  );
}
