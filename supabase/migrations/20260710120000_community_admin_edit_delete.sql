-- Admins can edit their community's name/description/cover (previously only
-- "rules" had a working edit path) and can delete the community outright.
--
-- Replaces the creator_id-based update check with the same
-- community_members role-based pattern already used for posts and
-- community_members moderation policies. Behaviorally identical today (the
-- creator is always the sole admin — there's no UI path to a second admin
-- yet), but consistent with the rest of the model and ready if multi-admin
-- support is ever added, without needing another migration just for that.
drop policy if exists "Creators can update their community" on communities;

create policy "Admins can update their community" on communities for update using (
  exists (
    select 1 from community_members
    where community_id = communities.id
      and user_id = auth.uid()
      and role = 'admin'
  )
);

-- No delete policy existed on communities at all before this — deleting a
-- community was rejected at the DB layer regardless of what the UI did.
-- Cascades already handle cleanup: posts/community_members reference
-- communities(id) on delete cascade, and post_likes/comments reference
-- posts(id) on delete cascade, so one delete here removes the whole tree.
create policy "Admins can delete their community" on communities for delete using (
  exists (
    select 1 from community_members
    where community_id = communities.id
      and user_id = auth.uid()
      and role = 'admin'
  )
);
