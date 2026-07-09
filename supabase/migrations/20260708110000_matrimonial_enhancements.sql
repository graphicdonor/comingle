-- Height field on matrimonial profiles (shown on profile view alongside age)
alter table matrimonial_profiles add column if not exists height text;

-- Last-seen presence, updated when a user visits the matrimonial service
alter table profiles add column if not exists last_active_at timestamptz;

-- Shortlist: a personal bookmark of another profile, independent of invites.
-- Owner-only — no gender/community eligibility check needed since it's a
-- private list, not a contact mechanism (unlike invites/messages).
create table if not exists matrimonial_shortlist (
  user_id             uuid references profiles(id) on delete cascade,
  shortlisted_user_id uuid references profiles(id) on delete cascade,
  created_at          timestamptz default now() not null,
  primary key (user_id, shortlisted_user_id),
  check (user_id <> shortlisted_user_id)
);

alter table matrimonial_shortlist enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_shortlist' and policyname = 'Users can view own shortlist') then
    execute 'create policy "Users can view own shortlist" on matrimonial_shortlist for select using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_shortlist' and policyname = 'Users can add to own shortlist') then
    execute 'create policy "Users can add to own shortlist" on matrimonial_shortlist for insert with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where tablename = 'matrimonial_shortlist' and policyname = 'Users can remove from own shortlist') then
    execute 'create policy "Users can remove from own shortlist" on matrimonial_shortlist for delete using (auth.uid() = user_id)';
  end if;
end $$;
