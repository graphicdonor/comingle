-- Comments now go through the same pre-publish moderation pipeline as every
-- other user-generated content type (posts, matrimonial profiles,
-- business/job listings). Previously "Comments are public" had no
-- moderation_status at all — the one remaining piece of user content
-- visible to everyone with zero gating. Mirrors posts' shape exactly:
-- pending_review until the AI check (or a human reviewer) marks it
-- published; authors always see their own regardless of status.
alter table comments add column if not exists moderation_status text not null default 'pending_review'
  check (moderation_status in ('pending_review', 'published', 'blocked'));

drop policy if exists "Comments are public" on comments;
create policy "Published comments are public, authors always see their own" on comments for select using (
  moderation_status = 'published' or auth.uid() = author_id
);

drop policy if exists "Users can comment" on comments;
create policy "Users can comment" on comments for insert with check (
  auth.uid() = author_id and moderation_status = 'pending_review'
);

create index if not exists idx_comments_post_id on comments (post_id, created_at);

-- Same escalation posts already have: a community moderator/admin can
-- remove any comment, not just the ones on their own posts.
create policy "Moderators can delete any comment" on comments for delete using (
  exists (
    select 1 from posts
    join community_members on community_members.community_id = posts.community_id
    where posts.id = comments.post_id
      and community_members.user_id = auth.uid()
      and community_members.role in ('moderator', 'admin')
  )
);

-- Comment counters, mirroring increment/decrement_like_count exactly.
create or replace function increment_comment_count(post_id uuid)
returns void language sql security definer as $$
  update posts set comment_count = comment_count + 1 where id = post_id;
$$;

create or replace function decrement_comment_count(post_id uuid)
returns void language sql security definer as $$
  update posts set comment_count = greatest(0, comment_count - 1) where id = post_id;
$$;

-- Let comments flow through the same moderation_logs/queue machinery. The
-- existing check constraint's name isn't known here (it was auto-generated
-- when the table was first created), so find and drop it dynamically rather
-- than guessing.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'moderation_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%content_type%'
  loop
    execute format('alter table moderation_logs drop constraint %I', con.conname);
  end loop;
end $$;

alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio', 'community_description',
  'community_rules', 'avatar', 'community_cover', 'business_listing',
  'job_listing', 'comment'
));
