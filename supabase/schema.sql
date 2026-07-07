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

-- ============================================================
-- Storage bucket for avatars
-- Run in Supabase dashboard: Storage > New Bucket > "avatars" (Public)
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

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table comments enable row level security;

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

-- ============================================================
-- Enable Phone Auth in Supabase Dashboard:
-- Authentication > Providers > Phone > Enable
-- Configure Twilio or another SMS provider
-- ============================================================
