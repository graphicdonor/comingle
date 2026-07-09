-- Community guidelines text, settable by the creator alongside name/description.
alter table communities add column if not exists rules text;

-- Moderators and admins can delete any post in their own community, not just
-- their own — a second permissive policy alongside the existing
-- "Authors can delete posts", which is unaffected (permissive policies OR).
create policy "Moderators can delete any post" on posts for delete using (
  exists (
    select 1 from community_members
    where community_id = posts.community_id
      and user_id = auth.uid()
      and role in ('moderator', 'admin')
  )
);

-- Only admins can change another member's role (promote/demote). Members
-- cannot self-promote — the row must already belong to a different user's
-- membership for this to be reachable at all, since admins are never the
-- ones editing their own role through this policy.
create policy "Admins can update member roles" on community_members for update
  using (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid()
        and cm.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid()
        and cm.role = 'admin'
    )
  );

-- Admins can remove members and moderators (but not other admins — there's
-- normally only one, the creator, and this avoids an admin-vs-admin removal
-- race in case that ever changes). Moderators can remove plain members only,
-- not other moderators or admins. Self-leave is unaffected — it's a separate
-- existing policy ("Users can leave") that keeps working regardless of role.
create policy "Admins can remove non-admin members" on community_members for delete using (
  role in ('member', 'moderator')
  and exists (
    select 1 from community_members cm
    where cm.community_id = community_members.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

create policy "Moderators can remove members" on community_members for delete using (
  role = 'member'
  and exists (
    select 1 from community_members cm
    where cm.community_id = community_members.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'moderator'
  )
);
