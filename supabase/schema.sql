-- ============================================================
-- Comingle — Supabase Schema v2
-- Run this in your Supabase SQL editor
-- ============================================================

-- Profiles
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  bio             text,
  date_of_birth   date,
  gender          text,
  state           text,
  city            text,
  pin_hash        text,
  phone           text,
  last_active_at  timestamptz,
  is_active       boolean default true not null,
  created_at      timestamptz default now() not null
);

-- Communities
create table if not exists communities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  description  text,
  cover_url    text,
  rules        text,
  creator_id   uuid references profiles(id) on delete set null,
  member_count integer default 0 not null,
  created_at   timestamptz default now() not null
);

-- Community membership. Role model: the creator is the sole 'admin' (no UI
-- path grants a second admin today); admins can promote members to
-- 'moderator' and demote back. Admins can remove members/moderators but not
-- other admins; moderators can remove plain members but not other
-- moderators/admins. Anyone can always remove their own row (leave).
create table if not exists community_members (
  community_id uuid references communities(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  role         text default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at    timestamptz default now() not null,
  primary key (community_id, user_id)
);

-- Posts
create table if not exists posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  content           text,
  image_url         text,
  video_url         text,
  video_thumbnail_url text,
  author_id         uuid references profiles(id) on delete cascade,
  community_id      uuid references communities(id) on delete cascade,
  like_count        integer default 0 not null,
  comment_count     integer default 0 not null,
  -- 'pending_review' until the AI moderation check (or a human reviewer)
  -- marks it 'published'; RLS only shows non-published rows to their author.
  moderation_status text default 'pending_review' not null check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz default now() not null
);

-- Post likes
create table if not exists post_likes (
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

-- Comments
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  author_id  uuid references profiles(id) on delete cascade,
  post_id    uuid references posts(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Matrimonial service
create table if not exists matrimonial_profiles (
  user_id           uuid primary key references profiles(id) on delete cascade,
  full_name         text not null,
  date_of_birth     date not null,
  time_of_birth     time,
  place_of_birth    text,
  city              text,
  height            text,
  mangalik_dosh     boolean default false not null,
  income_range      text,
  marital_status    text check (marital_status in ('Never Married', 'Divorced', 'Widowed', 'Separated')),
  education         text,
  employment_status text,
  created_by        text check (created_by in ('Self', 'Parents', 'Sibling', 'Relative', 'Friend')),
  about_me          text,
  photo_urls        text[] default '{}' not null,
  moderation_status text default 'pending_review' not null check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create table if not exists matrimonial_invites (
  sender_id     uuid references profiles(id) on delete cascade,
  receiver_id   uuid references profiles(id) on delete cascade,
  status        text default 'pending' not null check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at    timestamptz default now() not null,
  responded_at  timestamptz,
  primary key (sender_id, receiver_id),
  check (sender_id <> receiver_id)
);

create table if not exists matrimonial_messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references profiles(id) on delete cascade,
  receiver_id  uuid references profiles(id) on delete cascade,
  content      text not null,
  created_at   timestamptz default now() not null,
  check (sender_id <> receiver_id)
);

create index if not exists idx_matrimonial_messages_pair_a on matrimonial_messages (sender_id, receiver_id, created_at);
create index if not exists idx_matrimonial_messages_pair_b on matrimonial_messages (receiver_id, sender_id, created_at);
create index if not exists idx_matrimonial_invites_receiver on matrimonial_invites (receiver_id, status);

-- Shortlist: a personal bookmark of another profile, independent of invites.
create table if not exists matrimonial_shortlist (
  user_id             uuid references profiles(id) on delete cascade,
  shortlisted_user_id uuid references profiles(id) on delete cascade,
  created_at          timestamptz default now() not null,
  primary key (user_id, shortlisted_user_id),
  check (user_id <> shortlisted_user_id)
);

-- Notifications: in-app notification center, seeded by DB triggers (see
-- notify_new_matrimonial_message below) rather than app code.
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  type        text not null check (type in ('matrimonial_message', 'moderation_decision', 'appeal_outcome')),
  actor_id    uuid references profiles(id) on delete cascade,
  link        text not null,
  count       integer default 1 not null,
  read_at     timestamptz,
  created_at  timestamptz default now() not null
);

create index if not exists idx_notifications_user on notifications (user_id, created_at desc);

-- AI content moderation. Naming avoids overlap with community_members.role
-- = 'moderator' (an unrelated, pre-existing per-community staff concept) —
-- these tables are about platform-wide AI review of user-submitted content.
-- Nothing here is ever written by client code — only trusted server-side
-- Route Handlers using the service-role client (src/lib/supabase/admin.ts),
-- the same bypass-RLS pattern already used elsewhere in this schema.
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
  context_link       text not null default '/',
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

-- Rolling violation tracking for the auto-suspend rule — the rolling-window
-- check itself (N blocks in the last 30 days) is computed from
-- moderation_logs timestamps by the app at decision-time; this table
-- records the outcome, it doesn't decide it.
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

-- Survey responses. Survey questions/definitions live in application code
-- (src/lib/surveys.ts) — only submitted answers need a database row.
create table if not exists survey_responses (
  id          uuid primary key default gen_random_uuid(),
  survey_id   int not null check (survey_id in (1, 2)),
  user_id     uuid references profiles(id) on delete cascade not null,
  answers     jsonb not null default '{}'::jsonb,
  created_at  timestamptz default now() not null,
  unique (survey_id, user_id)
);
create index if not exists survey_responses_survey_id_idx on survey_responses (survey_id);

-- ============================================================
-- Storage buckets
-- Run in Supabase dashboard: Storage > New Bucket > "avatars" (Public)
-- "matrimonial-photos" (Public, 5MB file limit, jpg/jpeg/png only) —
-- bucket policies are in supabase/migrations/20260708100100_*.sql; the
-- bucket itself was created via the Storage API (public, 5MB limit).
-- "community-covers" (Public, 5MB file limit, jpg/jpeg/png only) — same
-- shape as avatars: path is {uploader_uid}/{file}, policies in
-- supabase/migrations/20260709130000_*.sql, bucket created via Storage API.
-- "post-images" (Public, 5MB file limit, jpg/jpeg/png only) — same shape
-- as avatars: path is {author_uid}/{file}, policies in
-- supabase/migrations/20260709140000_*.sql, bucket created via Storage API.
-- "post-videos" (Public, 25MB file limit, mp4/mov/webm only) — same shape
-- as avatars: path is {author_uid}/{file}, policies in
-- supabase/migrations/20260711100000_*.sql, bucket created via Storage API.
-- Video posts also store an extracted preview frame in "post-images" at
-- {author_uid}/{file}-thumb.jpg, used both as the feed thumbnail and as
-- the moderation input (see MODERATION.md).
-- ============================================================

-- ============================================================
-- Utility RPC functions
-- ============================================================
create or replace function increment_member_count(community_id uuid)
returns void language sql security definer as $$
  update communities set member_count = member_count + 1 where id = community_id;
$$;

create or replace function decrement_member_count(community_id uuid)
returns void language sql security definer as $$
  update communities set member_count = greatest(0, member_count - 1) where id = community_id;
$$;

create or replace function increment_like_count(post_id uuid)
returns void language sql security definer as $$
  update posts set like_count = like_count + 1 where id = post_id;
$$;

create or replace function decrement_like_count(post_id uuid)
returns void language sql security definer as $$
  update posts set like_count = greatest(0, like_count - 1) where id = post_id;
$$;

-- updated_at on matrimonial_profiles is DB-owned so app code never sets it
create or replace function set_matrimonial_profile_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_matrimonial_profiles_updated_at on matrimonial_profiles;
create trigger trg_matrimonial_profiles_updated_at
  before update on matrimonial_profiles
  for each row execute function set_matrimonial_profile_updated_at();

-- New chat message -> notify the receiver. If they already have an unread
-- notification for a message from the same sender, bump its count and
-- timestamp instead of piling up one row per message.
create or replace function notify_new_matrimonial_message()
returns trigger language plpgsql security definer as $$
begin
  update notifications
    set count = count + 1, created_at = now()
    where user_id = new.receiver_id
      and type = 'matrimonial_message'
      and actor_id = new.sender_id
      and read_at is null;

  if not found then
    insert into notifications (user_id, type, actor_id, link)
    values (new.receiver_id, 'matrimonial_message', new.sender_id, '/services/matrimonial/chat/' || new.sender_id);
  end if;

  return new;
end;
$$;

-- A held item leaving 'pending' (approved or rejected by a human reviewer)
-- notifies the author of the outcome.
create or replace function notify_moderation_decision()
returns trigger language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_link text;
begin
  if new.status = old.status or new.status = 'pending' then
    return new;
  end if;

  select user_id, context_link into v_user_id, v_link
    from moderation_logs where id = new.log_id;

  insert into notifications (user_id, type, link)
  values (v_user_id, 'moderation_decision', v_link);

  return new;
end;
$$;

drop trigger if exists trg_notify_moderation_decision on moderation_queue;
create trigger trg_notify_moderation_decision
  after update on moderation_queue
  for each row execute function notify_moderation_decision();

-- An appeal being resolved (approved or denied) notifies the appellant.
create or replace function notify_appeal_outcome()
returns trigger language plpgsql security definer as $$
begin
  if new.status = old.status or new.status = 'pending' then
    return new;
  end if;

  insert into notifications (user_id, type, link)
  select new.user_id, 'appeal_outcome', context_link
    from moderation_logs where id = new.log_id;

  return new;
end;
$$;

drop trigger if exists trg_notify_appeal_outcome on moderation_appeals;
create trigger trg_notify_appeal_outcome
  after update on moderation_appeals
  for each row execute function notify_appeal_outcome();

drop trigger if exists trg_notify_new_matrimonial_message on matrimonial_messages;
create trigger trg_notify_new_matrimonial_message
  after insert on matrimonial_messages
  for each row execute function notify_new_matrimonial_message();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table comments enable row level security;
alter table matrimonial_profiles enable row level security;
alter table matrimonial_invites enable row level security;
alter table matrimonial_messages enable row level security;
alter table matrimonial_shortlist enable row level security;
alter table notifications enable row level security;
alter table moderation_logs enable row level security;
alter table moderation_queue enable row level security;
alter table user_trust_scores enable row level security;
alter table moderation_appeals enable row level security;
alter table survey_responses enable row level security;

-- Profiles
create policy "Profiles are public"            on profiles for select  using (true);
create policy "Users can insert own profile"   on profiles for insert  with check (auth.uid() = id);
create policy "Users can update own profile"   on profiles for update  using (auth.uid() = id);

-- Communities
create policy "Communities are public"                     on communities for select  using (true);
create policy "Authenticated users can create communities" on communities for insert  with check (auth.uid() is not null);
create policy "Admins can update their community" on communities for update using (
  exists (
    select 1 from community_members
    where community_id = communities.id
      and user_id = auth.uid()
      and role = 'admin'
  )
);
create policy "Admins can delete their community" on communities for delete using (
  exists (
    select 1 from community_members
    where community_id = communities.id
      and user_id = auth.uid()
      and role = 'admin'
  )
);

-- Community members
create policy "Memberships are public"     on community_members for select  using (true);
create policy "Users can join communities" on community_members for insert  with check (auth.uid() = user_id);
create policy "Users can leave"            on community_members for delete  using (auth.uid() = user_id);

create policy "Admins can update member roles" on community_members for update
  using (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid() and cm.role = 'admin'
    )
  );
create policy "Admins can remove non-admin members" on community_members for delete using (
  role in ('member', 'moderator')
  and exists (
    select 1 from community_members cm
    where cm.community_id = community_members.community_id
      and cm.user_id = auth.uid() and cm.role = 'admin'
  )
);
create policy "Moderators can remove members" on community_members for delete using (
  role = 'member'
  and exists (
    select 1 from community_members cm
    where cm.community_id = community_members.community_id
      and cm.user_id = auth.uid() and cm.role = 'moderator'
  )
);

-- Posts. moderation_status gates visibility: authors always see their own
-- regardless of status (so a pending/blocked post is visible to the person
-- who wrote it, e.g. to appeal), everyone else only sees published ones.
-- The insert WITH CHECK means a client literally cannot set its own post to
-- 'published' — only a subsequent service-role update (post-moderation) can.
create policy "Published posts are public, authors always see their own" on posts for select using (
  moderation_status = 'published' or auth.uid() = author_id
);
create policy "Members can post" on posts for insert with check (
  auth.uid() = author_id
  and moderation_status = 'pending_review'
  and exists (select 1 from community_members where community_id = posts.community_id and user_id = auth.uid())
);
create policy "Authors can delete posts" on posts for delete using (auth.uid() = author_id);
create policy "Moderators can delete any post" on posts for delete using (
  exists (
    select 1 from community_members
    where community_id = posts.community_id
      and user_id = auth.uid() and role in ('moderator', 'admin')
  )
);

-- Post likes
create policy "Likes are public"        on post_likes for select using (true);
create policy "Users can like"          on post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike"        on post_likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments are public"     on comments for select using (true);
create policy "Users can comment"       on comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete"      on comments for delete using (auth.uid() = author_id);

-- Matrimonial profiles: visible to self regardless of moderation_status
-- (own pending/blocked profile is still visible to its owner), or to
-- published profiles of opposite-gender members of a shared community;
-- only Male/Female profiles.gender may create one. Insert/update WITH
-- CHECK mirrors the posts pattern: a client can only ever write its own
-- profile as 'pending_review' — the flip to 'published' is a separate
-- service-role update after the AI check resolves.
create policy "Users can view own matrimonial profile" on matrimonial_profiles for select using (auth.uid() = user_id);
create policy "Eligible opposite-gender community members are visible" on matrimonial_profiles for select using (
  moderation_status = 'published'
  and exists (
    select 1 from profiles me, profiles them
    where me.id = auth.uid() and them.id = matrimonial_profiles.user_id
      and me.gender in ('Male', 'Female') and them.gender in ('Male', 'Female')
      and me.gender <> them.gender
  )
  and exists (
    select 1 from community_members cm1
    join community_members cm2 on cm1.community_id = cm2.community_id
    where cm1.user_id = auth.uid() and cm2.user_id = matrimonial_profiles.user_id
  )
);
create policy "Eligible users can create own matrimonial profile" on matrimonial_profiles for insert with check (
  auth.uid() = user_id
  and moderation_status = 'pending_review'
  and exists (select 1 from profiles where id = auth.uid() and gender in ('Male', 'Female'))
);
create policy "Users can update own matrimonial profile" on matrimonial_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and moderation_status = 'pending_review');
create policy "Users can delete own matrimonial profile" on matrimonial_profiles for delete using (auth.uid() = user_id);

-- Matrimonial invites: directional connection requests, gated by the same
-- gender + shared-community eligibility rule as profile visibility.
create policy "Participants can view their invites" on matrimonial_invites for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Eligible users can send invites" on matrimonial_invites for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from matrimonial_profiles where user_id = sender_id)
  and exists (
    select 1 from profiles p1, profiles p2
    where p1.id = sender_id and p2.id = receiver_id
      and p1.gender in ('Male', 'Female') and p2.gender in ('Male', 'Female')
      and p1.gender <> p2.gender
  )
  and exists (
    select 1 from community_members cm1
    join community_members cm2 on cm1.community_id = cm2.community_id
    where cm1.user_id = sender_id and cm2.user_id = receiver_id
  )
);
create policy "Senders can cancel or resend invites" on matrimonial_invites for update
  using (auth.uid() = sender_id and status <> 'accepted')
  with check (auth.uid() = sender_id and status in ('pending', 'cancelled'));
create policy "Receivers can respond to invites" on matrimonial_invites for update
  using (auth.uid() = receiver_id and status = 'pending')
  with check (auth.uid() = receiver_id and status in ('accepted', 'declined'));

-- Matrimonial messages: only between two users with an accepted invite.
create policy "Participants can view their messages" on matrimonial_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Accepted matches can message" on matrimonial_messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from matrimonial_invites mi
    where mi.status = 'accepted'
      and ((mi.sender_id = matrimonial_messages.sender_id and mi.receiver_id = matrimonial_messages.receiver_id)
        or (mi.sender_id = matrimonial_messages.receiver_id and mi.receiver_id = matrimonial_messages.sender_id))
  )
);

-- Matrimonial shortlist: owner-only, no eligibility check (private bookmark).
create policy "Users can view own shortlist" on matrimonial_shortlist for select using (auth.uid() = user_id);
create policy "Users can add to own shortlist" on matrimonial_shortlist for insert with check (auth.uid() = user_id);
create policy "Users can remove from own shortlist" on matrimonial_shortlist for delete using (auth.uid() = user_id);

-- Notifications: owner-only read/mark-as-read. No insert policy for regular
-- users — rows are only ever created by the security definer trigger above.
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read" on notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Moderation: users can see their own AI-review history and file/view their
-- own appeals. moderation_queue and user_trust_scores have no end-user
-- policies at all — deliberately internal, only ever touched by the
-- service-role admin client.
create policy "Users can view own moderation logs" on moderation_logs for select using (auth.uid() = user_id);
create policy "Users can view own appeals" on moderation_appeals for select using (auth.uid() = user_id);
create policy "Users can file own appeals" on moderation_appeals for insert with check (auth.uid() = user_id);

-- Surveys: users see and submit only their own response. Admin visibility
-- goes through the service-role client (bypasses RLS) — no admin policy needed.
create policy "Users can view own survey responses" on survey_responses for select using (auth.uid() = user_id);
create policy "Users can submit own survey response" on survey_responses for insert with check (auth.uid() = user_id);

-- ============================================================
-- Enable Phone Auth in Supabase Dashboard:
-- Authentication > Providers > Phone > Enable
-- Configure Twilio or another SMS provider
-- ============================================================
