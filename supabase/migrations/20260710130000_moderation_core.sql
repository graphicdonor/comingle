-- Core AI content-moderation tables. Naming avoids "moderator"/"moderation"
-- overlap with the existing community_members.role = 'moderator' concept —
-- these are unrelated systems (per-community staff roles vs. platform-wide
-- AI content review) that happen to share an English word.
--
-- Nothing here is ever written by client code. moderation_logs/queue/
-- user_trust_scores/moderation_appeals are only ever written by trusted
-- server-side Route Handlers using the service-role client (src/lib/
-- supabase/admin.ts), the same bypass-RLS pattern already used by
-- increment_member_count/decrement_member_count and the notifications
-- trigger. Regular users only ever get read access to their own rows.
create table if not exists moderation_logs (
  id                 uuid primary key default gen_random_uuid(),
  content_type       text not null check (content_type in (
                       'post', 'matrimonial_profile', 'profile_bio',
                       'community_description', 'community_rules',
                       'avatar', 'community_cover'
                     )),
  content_id         text,
  user_id            uuid references profiles(id) on delete cascade not null,
  input_text         text,
  input_image_urls   text[] not null default '{}',
  scores             jsonb not null default '{}',
  flagged_categories text[] not null default '{}',
  decision           text not null check (decision in ('allow', 'hold_for_review', 'block')),
  -- Where the app should send the user if they follow up on this decision
  -- (their community, their matrimonial profile, etc) — populated by the
  -- app at log-insert time since only it knows the right destination for a
  -- given content_type; a SQL trigger would otherwise need per-type joins.
  context_link       text not null default '/',
  -- Set when the moderation API call itself failed/timed out (see
  -- MODERATION_REVIEW_THRESHOLD fallback below) — kept separate from
  -- scores/flagged_categories so a real "flagged" decision is never
  -- confused with an outage.
  api_error          text,
  created_at         timestamptz default now() not null
);
create index if not exists idx_moderation_logs_user on moderation_logs (user_id, created_at desc);
create index if not exists idx_moderation_logs_decision on moderation_logs (decision, created_at desc);

create table if not exists moderation_queue (
  id          uuid primary key default gen_random_uuid(),
  log_id      uuid references moderation_logs(id) on delete cascade not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at  timestamptz default now() not null
);
create index if not exists idx_moderation_queue_status on moderation_queue (status, created_at);

-- Rolling violation tracking for the auto-suspend rule. The rolling-window
-- *check* (N blocks in the last 30 days) is computed from moderation_logs
-- timestamps at decision-time by the app, not by decaying this counter —
-- a simple incrementing counter can't "forget" old violations on its own,
-- so this table just records the outcome of that check, it doesn't decide it.
create table if not exists user_trust_scores (
  user_id            uuid primary key references profiles(id) on delete cascade,
  violation_count    integer not null default 0,
  window_started_at  timestamptz not null default now(),
  suspended          boolean not null default false,
  suspended_at       timestamptz,
  updated_at         timestamptz not null default now()
);

create table if not exists moderation_appeals (
  id             uuid primary key default gen_random_uuid(),
  log_id         uuid references moderation_logs(id) on delete cascade not null,
  user_id        uuid references profiles(id) on delete cascade not null,
  reason         text not null,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  reviewer_notes text,
  created_at     timestamptz default now() not null,
  resolved_at    timestamptz
);
create index if not exists idx_moderation_appeals_status on moderation_appeals (status, created_at);

alter table moderation_logs enable row level security;
alter table moderation_queue enable row level security;
alter table user_trust_scores enable row level security;
alter table moderation_appeals enable row level security;

-- Users can see their own moderation history (so a "why was this held/
-- blocked" UI is possible) but never write to it directly.
create policy "Users can view own moderation logs" on moderation_logs for select using (auth.uid() = user_id);

-- moderation_queue and user_trust_scores are purely internal/operational —
-- deliberately no end-user policies at all; only the admin service-role
-- client (which bypasses RLS) ever reads or writes these.

create policy "Users can view own appeals" on moderation_appeals for select using (auth.uid() = user_id);
create policy "Users can file own appeals" on moderation_appeals for insert with check (auth.uid() = user_id);
