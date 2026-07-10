-- Adds a moderation_status column to the two content types with genuine
-- "browse and discover other people's content" semantics (posts,
-- matrimonial profiles) and enforces it at the RLS layer so a client
-- literally cannot mark its own content published, no matter what it sends.
--
-- Deliberately NOT a "before insert" trigger that force-resets the column:
-- matrimonial_profiles is edited via upsert (single row per user, re-saved
-- often), and a trigger firing on every re-save would revert an
-- already-published profile back to pending_review on every unrelated edit
-- (e.g. changing city). A WITH CHECK clause instead: the user's own
-- insert/update may only ever set moderation_status = 'pending_review';
-- flipping it to 'published' (or 'blocked') happens via a separate,
-- subsequent update performed by the service-role client from a trusted
-- Route Handler after the AI check resolves — which bypasses RLS entirely,
-- so the WITH CHECK restriction doesn't apply to it.
alter table posts add column if not exists moderation_status text not null default 'pending_review'
  check (moderation_status in ('pending_review', 'published', 'blocked'));
alter table matrimonial_profiles add column if not exists moderation_status text not null default 'pending_review'
  check (moderation_status in ('pending_review', 'published', 'blocked'));

create index if not exists idx_posts_moderation_status on posts (moderation_status);
create index if not exists idx_matrimonial_profiles_moderation_status on matrimonial_profiles (moderation_status);

drop policy if exists "Posts are public" on posts;
create policy "Published posts are public, authors always see their own" on posts for select using (
  moderation_status = 'published' or auth.uid() = author_id
);

drop policy if exists "Members can post" on posts;
create policy "Members can post" on posts for insert with check (
  auth.uid() = author_id
  and moderation_status = 'pending_review'
  and exists (select 1 from community_members where community_id = posts.community_id and user_id = auth.uid())
);

drop policy if exists "Eligible opposite-gender community members are visible" on matrimonial_profiles;
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

drop policy if exists "Eligible users can create own matrimonial profile" on matrimonial_profiles;
create policy "Eligible users can create own matrimonial profile" on matrimonial_profiles for insert with check (
  auth.uid() = user_id
  and moderation_status = 'pending_review'
  and exists (select 1 from profiles where id = auth.uid() and gender in ('Male', 'Female'))
);

drop policy if exists "Users can update own matrimonial profile" on matrimonial_profiles;
create policy "Users can update own matrimonial profile" on matrimonial_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and moderation_status = 'pending_review');
