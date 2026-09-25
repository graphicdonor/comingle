-- Threaded replies on comments. Single-level: a reply's parent_id always
-- points at a top-level comment (the client only ever offers "Reply" on
-- top-level comments), but the column itself doesn't enforce that depth
-- limit — it's a plain self-reference, same shape as any adjacency list.
alter table comments add column if not exists parent_id uuid references comments(id) on delete cascade;
create index if not exists idx_comments_parent_id on comments (parent_id);

-- Replies get their own notification type so a reply reads as "X replied to
-- your comment" rather than being lumped in with "X commented on your post".
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check check (type in (
  'matrimonial_message', 'moderation_decision', 'appeal_outcome', 'post_comment', 'post_like', 'comment_reply'
));

-- Extends notify_new_comment (20260715140000_comment_notifications.sql):
-- a top-level comment still notifies the post's author exactly as before;
-- a reply instead notifies the parent comment's author (skipped if you're
-- replying to your own comment). Either way the link points at the same
-- post detail page, so it's always built from the *post* author's
-- username regardless of who the recipient is.
create or replace function notify_new_comment()
returns trigger language plpgsql security definer as $$
declare
  v_recipient_id uuid;
  v_post_author_username text;
  v_notification_type text;
  v_link text;
begin
  if new.moderation_status <> 'published' or old.moderation_status = 'published' then
    return new;
  end if;

  if new.parent_id is not null then
    v_notification_type := 'comment_reply';
    select c.author_id, pr.username into v_recipient_id, v_post_author_username
    from comments c
    join posts p on p.id = c.post_id
    join profiles pr on pr.id = p.author_id
    where c.id = new.parent_id;
  else
    v_notification_type := 'post_comment';
    select p.author_id, pr.username into v_recipient_id, v_post_author_username
    from posts p join profiles pr on pr.id = p.author_id
    where p.id = new.post_id;
  end if;

  if v_recipient_id is null or v_recipient_id = new.author_id then
    return new;
  end if;

  v_link := '/profile/' || v_post_author_username || '/posts/' || new.post_id;

  update notifications
    set count = count + 1, created_at = now()
    where user_id = v_recipient_id
      and type = v_notification_type
      and actor_id = new.author_id
      and link = v_link
      and read_at is null;

  if not found then
    insert into notifications (user_id, type, actor_id, link)
    values (v_recipient_id, v_notification_type, new.author_id, v_link);
  end if;

  return new;
end;
$$;
