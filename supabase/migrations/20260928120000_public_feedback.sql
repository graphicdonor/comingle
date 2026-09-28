-- Responses to the public feedback survey at /survey (questions live in
-- src/lib/feedback-survey.ts). Anyone can respond, signed in or not, so
-- user_id is optional. Writes go through /api/feedback with the
-- service-role client (validation + rate limiting happen there), and admins
-- read via the service-role client too — so RLS is on with no policies at
-- all: neither anon nor authenticated clients can touch this table directly.
create table public_feedback (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null default '{}'::jsonb,
  name text check (char_length(name) <= 100),
  contact text check (char_length(contact) <= 200),
  user_id uuid references profiles(id) on delete set null,
  -- SHA-256 of the submitter's IP, for rate limiting only; the raw IP is never stored.
  ip_hash text,
  created_at timestamptz not null default now()
);

create index public_feedback_created_at_idx on public_feedback(created_at desc);
create index public_feedback_ip_hash_created_at_idx on public_feedback(ip_hash, created_at);

alter table public_feedback enable row level security;
