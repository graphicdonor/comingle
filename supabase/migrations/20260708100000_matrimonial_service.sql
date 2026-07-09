-- Matrimonial service: profiles, invites, messages
create table if not exists matrimonial_profiles (
  user_id           uuid primary key references profiles(id) on delete cascade,
  full_name         text not null,
  date_of_birth     date not null,
  time_of_birth     time,
  place_of_birth    text,
  city              text,
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

-- Directional connection requests between two users
create table if not exists matrimonial_invites (
  sender_id     uuid references profiles(id) on delete cascade,
  receiver_id   uuid references profiles(id) on delete cascade,
  status        text default 'pending' not null check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at    timestamptz default now() not null,
  responded_at  timestamptz,
  primary key (sender_id, receiver_id),
  check (sender_id <> receiver_id)
);

-- 1:1 chat, unlocked once an invite between the pair is accepted
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

-- updated_at is DB-owned so app code never has to (and can't drift from the schema)
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

-- ============================================================
-- Row Level Security
-- ============================================================
alter table matrimonial_profiles enable row level security;
alter table matrimonial_invites enable row level security;
alter table matrimonial_messages enable row level security;

do $$
begin
  -- ── matrimonial_profiles ──────────────────────────────────
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_profiles' and policyname = 'Users can view own matrimonial profile') then
    execute 'create policy "Users can view own matrimonial profile" on matrimonial_profiles for select using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_profiles' and policyname = 'Eligible opposite-gender community members are visible') then
    execute $p$create policy "Eligible opposite-gender community members are visible" on matrimonial_profiles for select using (
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
    )$p$;
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_profiles' and policyname = 'Eligible users can create own matrimonial profile') then
    execute $p$create policy "Eligible users can create own matrimonial profile" on matrimonial_profiles for insert with check (
      auth.uid() = user_id
      and exists (select 1 from profiles where id = auth.uid() and gender in ('Male', 'Female'))
    )$p$;
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_profiles' and policyname = 'Users can update own matrimonial profile') then
    execute 'create policy "Users can update own matrimonial profile" on matrimonial_profiles for update using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_profiles' and policyname = 'Users can delete own matrimonial profile') then
    execute 'create policy "Users can delete own matrimonial profile" on matrimonial_profiles for delete using (auth.uid() = user_id)';
  end if;

  -- ── matrimonial_invites ───────────────────────────────────
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_invites' and policyname = 'Participants can view their invites') then
    execute 'create policy "Participants can view their invites" on matrimonial_invites for select using (auth.uid() = sender_id or auth.uid() = receiver_id)';
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_invites' and policyname = 'Eligible users can send invites') then
    execute $p$create policy "Eligible users can send invites" on matrimonial_invites for insert with check (
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
    )$p$;
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_invites' and policyname = 'Senders can cancel or resend invites') then
    execute $p$create policy "Senders can cancel or resend invites" on matrimonial_invites for update
      using (auth.uid() = sender_id and status <> 'accepted')
      with check (auth.uid() = sender_id and status in ('pending', 'cancelled'))$p$;
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_invites' and policyname = 'Receivers can respond to invites') then
    execute $p$create policy "Receivers can respond to invites" on matrimonial_invites for update
      using (auth.uid() = receiver_id and status = 'pending')
      with check (auth.uid() = receiver_id and status in ('accepted', 'declined'))$p$;
  end if;

  -- ── matrimonial_messages ──────────────────────────────────
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_messages' and policyname = 'Participants can view their messages') then
    execute 'create policy "Participants can view their messages" on matrimonial_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id)';
  end if;

  if not exists (select 1 from pg_policies where tablename = 'matrimonial_messages' and policyname = 'Accepted matches can message') then
    execute $p$create policy "Accepted matches can message" on matrimonial_messages for insert with check (
      auth.uid() = sender_id
      and exists (
        select 1 from matrimonial_invites mi
        where mi.status = 'accepted'
          and ((mi.sender_id = matrimonial_messages.sender_id and mi.receiver_id = matrimonial_messages.receiver_id)
            or (mi.sender_id = matrimonial_messages.receiver_id and mi.receiver_id = matrimonial_messages.sender_id))
      )
    )$p$;
  end if;
end $$;
