import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { SURVEYS } from "@/lib/surveys";
import { COMMUNITY_SERVICES } from "@/lib/community-services";
import Link from "next/link";
import { HomeGreeting } from "@/components/layout/home-greeting";
import { CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let submittedSurveyIds: Set<number> = new Set();

  if (user) {
    const [{ data: p }, { data: surveyResponses }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("survey_responses").select("survey_id").eq("user_id", user.id),
    ]);
    profile = p as Profile;
    submittedSurveyIds = new Set((surveyResponses ?? []).map((r) => r.survey_id));
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* HomeGreeting is a client component — reads dev store for name/avatar */}
      <HomeGreeting serverProfile={profile} serverUserId={user?.id} />

      {/* Community Services */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Community services</h2>
        <div className="grid grid-cols-4 gap-3">
          {COMMUNITY_SERVICES.map((s) => (
            <Link key={s.label} href={s.href} className="flex flex-col items-center gap-1.5 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                <s.icon className="h-6 w-6 text-gray-700" strokeWidth={1.75} />
              </div>
              <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Surveys */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Surveys</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {SURVEYS.map((s) => {
            const done = submittedSurveyIds.has(s.id);
            return (
              <div key={s.id} className="flex-shrink-0 w-60 bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-sm text-gray-900 mb-1.5 leading-tight">{s.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.desc}</p>
                {done ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A5C27]">
                    <CheckCircle2 className="h-4 w-4" /> Submitted
                  </span>
                ) : (
                  <Link
                    href={`/surveys/${s.id}`}
                    className="inline-block bg-[#E8355A] text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#D02E50] transition-colors"
                  >
                    let&apos;s begin
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
