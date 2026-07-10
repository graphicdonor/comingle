-- Survey responses. Survey questions/definitions live in application code
-- (src/lib/surveys.ts), same as the existing static SURVEYS/COMMUNITY_SERVICES
-- home-page content — only submitted answers need a database row.
create table survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id int not null check (survey_id in (1, 2)),
  user_id uuid not null references profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

create index survey_responses_survey_id_idx on survey_responses(survey_id);

alter table survey_responses enable row level security;

-- Same shape as moderation_logs/moderation_appeals: users see and insert only
-- their own rows. Admin visibility goes through the service-role client
-- (src/lib/supabase/admin.ts), which bypasses RLS entirely — no admin-facing
-- policy needed here.
create policy "Users can view own survey responses" on survey_responses for select using (auth.uid() = user_id);
create policy "Users can submit own survey response" on survey_responses for insert with check (auth.uid() = user_id);
