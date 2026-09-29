-- User-generated-content safety features required by Google Play's UGC
-- policy: recorded acceptance of the Terms, reporting users (and their
-- comments), and blocking users.

-- 1. When a member accepted the Terms & Conditions and Privacy Policy.
--    Set at profile completion; members without it are asked before they
--    can post (see the apps' terms gate).
alter table profiles add column if not exists terms_accepted_at timestamptz;

-- 2. Blocking. A block hides the blocked person's posts, comments,
--    notifications and matrimonial messages from the blocker, stops them
--    commenting on the blocker's posts, and stops matrimonial contact in
--    either direction. Enforced below with RESTRICTIVE policies, which are
--    ANDed onto the existing permissive ones — every query (including the
--    SECURITY INVOKER get_home_feed RPC) is filtered without app changes.
create table if not exists user_blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index if not exists idx_user_blocks_blocked on user_blocks(blocked_id);

alter table user_blocks enable row level security;
create policy "Users see their own blocks" on user_blocks for select using (auth.uid() = blocker_id);
create policy "Users can block others" on user_blocks for insert with check (auth.uid() = blocker_id);
create policy "Users can unblock" on user_blocks for delete using (auth.uid() = blocker_id);

-- Either-direction check. SECURITY DEFINER because user_blocks RLS only
-- shows a user their own blocks, and "has the other person blocked me?"
-- needs to see theirs (it returns only a boolean, never the rows).
create or replace function is_blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
revoke all on function is_blocked_between(uuid, uuid) from public;
grant execute on function is_blocked_between(uuid, uuid) to authenticated;

create policy "Hide posts from blocked users" on posts as restrictive for select
  using (not exists (select 1 from user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = posts.author_id));

create policy "Hide comments from blocked users" on comments as restrictive for select
  using (not exists (select 1 from user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = comments.author_id));

create policy "Blocked users can't comment on your posts" on comments as restrictive for insert
  with check (not exists (
    select 1 from posts p where p.id = comments.post_id and is_blocked_between(p.author_id, auth.uid())
  ));

create policy "Hide notifications from blocked users" on notifications as restrictive for select
  using (actor_id is null or not exists (select 1 from user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = notifications.actor_id));

create policy "Hide matrimonial profiles across blocks" on matrimonial_profiles as restrictive for select
  using (auth.uid() is null or user_id = auth.uid() or not is_blocked_between(auth.uid(), user_id));

create policy "Hide matrimonial messages from blocked users" on matrimonial_messages as restrictive for select
  using (not exists (select 1 from user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = matrimonial_messages.sender_id));

create policy "No matrimonial messages across blocks" on matrimonial_messages as restrictive for insert
  with check (not is_blocked_between(sender_id, receiver_id));

create policy "No matrimonial invites across blocks" on matrimonial_invites as restrictive for insert
  with check (not is_blocked_between(sender_id, receiver_id));

-- 3. Reporting users (optionally pointing at one of their comments). Post
--    reports keep using post_reports; this covers people and comments.
--    Reviewed by admins in /admin/reports via the service-role client.
create table if not exists user_reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid not null references profiles(id) on delete cascade,
  comment_id       uuid references comments(id) on delete set null,
  reason           text not null check (reason in ('spam', 'harassment', 'inappropriate', 'impersonation', 'other')),
  details          text check (char_length(details) <= 1000),
  status           text not null default 'open' check (status in ('open', 'resolved')),
  created_at       timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);
create index if not exists idx_user_reports_status on user_reports(status, created_at desc);

alter table user_reports enable row level security;
create policy "Users can report other users" on user_reports for insert
  with check (auth.uid() = reporter_id and status = 'open');
create policy "Reporters can see their own reports" on user_reports for select using (auth.uid() = reporter_id);
