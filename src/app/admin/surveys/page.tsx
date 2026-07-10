import { createAdminClient } from "@/lib/supabase/admin";
import { SURVEYS } from "@/lib/surveys";
import { SurveyResponsesTable } from "@/components/admin/survey-responses-table";
import type { SurveyResponse } from "@/lib/types";

export const revalidate = 0;

export default async function AdminSurveysPage() {
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("survey_responses")
    .select("*, profiles(username, full_name)")
    .order("created_at", { ascending: false });

  const responsesBySurveyId: Record<number, SurveyResponse[]> = {};
  for (const survey of SURVEYS) responsesBySurveyId[survey.id] = [];
  for (const row of (rows ?? []) as SurveyResponse[]) {
    (responsesBySurveyId[row.survey_id] ??= []).push(row);
  }

  const total = (rows ?? []).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Surveys</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} response{total !== 1 ? "s" : ""} across {SURVEYS.length} surveys
        </p>
      </div>
      <SurveyResponsesTable responsesBySurveyId={responsesBySurveyId} />
    </div>
  );
}
