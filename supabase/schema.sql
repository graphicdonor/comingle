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
  created_at      timestamptz default now() not null
);

-- Communities
create table if not exists communities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  description  text,
  cover_url    text,
  creator_id   uuid references profiles(id) on delete set null,
  member_count integer default 0 not null,
  created_at   timestamptz default now() not null
);

-- Community membership
create table if not exists community_members (
  community_id uuid references communities(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  role         text default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at    timestamptz default now() not null,
  primary key (community_id, user_id)
);

-- Posts
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text,
  image_url     text,
  author_id     uuid references profiles(id) on delete cascade,
  community_id  uuid references communities(id) on delete cascade,
  like_count    integer default 0 not null,
  comment_count integer default 0 not null,
  created_at    timestamptz default now() not null
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
  type        text not null check (type in ('matrimonial_message')),
  actor_id    uuid references profiles(id) on delete cascade,
  link        text not null,
  count       integer default 1 not null,
  read_at     timestamptz,
  created_at  timestamptz default now() not null
);

create index if not exists idx_notifications_user on notifications (user_id, created_at desc);

-- ============================================================
-- Storage buckets
-- Run in Supabase dashboard: Storage > New Bucket > "avatars" (Public)
-- "matrimonial-photos" (Public, 5MB file limit, jpg/jpeg/png only) —
-- bucket policies are in supabase/migrations/20260708100100_*.sql; the
-- bucket itself was created via the Storage API (public, 5MB limit).
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

-- Profiles
create policy "Profiles are public"            on profiles for select  using (true);
create policy "Users can insert own profile"   on profiles for insert  with check (auth.uid() = id);
create policy "Users can update own profile"   on profiles for update  using (auth.uid() = id);

-- Communities
create policy "Communities are public"                     on communities for select  using (true);
create policy "Authenticated users can create communities" on communities for insert  with check (auth.uid() is not null);
create policy "Creators can update their community"        on communities for update  using (auth.uid() = creator_id);

-- Community members
create policy "Memberships are public"     on community_members for select  using (true);
create policy "Users can join communities" on community_members for insert  with check (auth.uid() = user_id);
create policy "Users can leave"            on community_members for delete  using (auth.uid() = user_id);

-- Posts
create policy "Posts are public" on posts for select using (true);
create policy "Members can post" on posts for insert with check (
  auth.uid() = author_id and
  exists (select 1 from community_members where community_id = posts.community_id and user_id = auth.uid())
);
create policy "Authors can delete posts" on posts for delete using (auth.uid() = author_id);

-- Post likes
create policy "Likes are public"        on post_likes for select using (true);
create policy "Users can like"          on post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike"        on post_likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments are public"     on comments for select using (true);
create policy "Users can comment"       on comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete"      on comments for delete using (auth.uid() = author_id);

-- Matrimonial profiles: visible to self, or to opposite-gender members of a
-- shared community; only Male/Female profiles.gender may create one.
create policy "Users can view own matrimonial profile" on matrimonial_profiles for select using (auth.uid() = user_id);
create policy "Eligible opposite-gender community members are visible" on matrimonial_profiles for select using (
  exists (
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
  and exists (select 1 from profiles where id = auth.uid() and gender in ('Male', 'Female'))
);
create policy "Users can update own matrimonial profile" on matrimonial_profiles for update using (auth.uid() = user_id);
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

-- ============================================================
-- Enable Phone Auth in Supabase Dashboard:
-- Authentication > Providers > Phone > Enable
-- Configure Twilio or another SMS provider
-- ============================================================
