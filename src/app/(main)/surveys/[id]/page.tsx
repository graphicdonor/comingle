import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSurvey } from "@/lib/surveys";
import { SurveyForm } from "@/components/surveys/survey-form";

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = getSurvey(Number(id));
  if (!survey) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadySubmitted = false;
  if (user) {
    const { data } = await supabase
      .from("survey_responses")
      .select("id")
      .eq("survey_id", survey.id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadySubmitted = !!data;
  }

  return <SurveyForm survey={survey} alreadySubmitted={alreadySubmitted} />;
}
