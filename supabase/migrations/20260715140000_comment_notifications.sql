-- Notifies a post's author when a comment on it is published — not at
-- insert time (comments always insert as 'pending_review', per the
-- moderation migration) but on the transition to 'published', whether that
-- happens immediately (an "allow" decision flips it in the same request)
-- or later via the admin queue. Mirrors notify_new_matrimonial_message's
-- batching: repeated comments from the same commenter on the same post
-- bump an existing unread notification's count instead of piling up
-- duplicates, but — unlike matrimonial messages, which are inherently
-- 1:1 — the batching key also includes the post (via `link`), since the
-- same commenter leaving comments on two different posts by this author
-- are unrelated notifications.
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check check (type in (
  'matrimonial_message', 'moderation_decision', 'appeal_outcome', 'post_comment'
));

create or replace function notify_new_comment()
returns trigger language plpgsql security definer as $$
declare
  v_post_author_id uuid;
  v_post_author_username text;
  v_link text;
begin
  if new.moderation_status <> 'published' or old.moderation_status = 'published' then
    return new;
  end if;

  select p.author_id, pr.username into v_post_author_id, v_post_author_username
  from posts p join profiles pr on pr.id = p.author_id
  where p.id = new.post_id;

  -- No post (deleted mid-flight) or commenting on your own post — no notification.
  if v_post_author_id is null or v_post_author_id = new.author_id then
    return new;
  end if;

  v_link := '/profile/' || v_post_author_username || '/posts/' || new.post_id;

  update notifications
    set count = count + 1, created_at = now()
    where user_id = v_post_author_id
      and type = 'post_comment'
      and actor_id = new.author_id
      and link = v_link
      and read_at is null;

  if not found then
    insert into notifications (user_id, type, actor_id, link)
    values (v_post_author_id, 'post_comment', new.author_id, v_link);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_comment on comments;
create trigger trg_notify_new_comment
  after update on comments
  for each row execute function notify_new_comment();
