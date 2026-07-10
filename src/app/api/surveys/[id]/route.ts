import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSurvey, validateAnswers, type SurveyAnswers } from "@/lib/surveys";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = getSurvey(Number(id));
  if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  let body: { answers?: SurveyAnswers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const answers = body.answers ?? {};

  const validationError = validateAnswers(survey, answers);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: existing } = await supabase
    .from("survey_responses")
    .select("id")
    .eq("survey_id", survey.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "You've already submitted this survey" }, { status: 409 });

  const { error: insertError } = await supabase
    .from("survey_responses")
    .insert({ survey_id: survey.id, user_id: user.id, answers });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
