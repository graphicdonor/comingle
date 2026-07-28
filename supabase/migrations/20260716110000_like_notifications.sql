-- Notifies a post's author when someone likes it. Unlike
-- notify_new_comment (which batches repeated action from the *same*
-- commenter), a like can only ever happen once per (post, user) — the
-- useful aggregation here is across *different* likers, so this batches by
-- (user_id, type, link) alone, updating actor_id to the most recent liker
-- each time and bumping count, so the UI can render "X and N others liked
-- your post" the way most feeds do. No corresponding decrement on unlike —
-- retracting an already-sent "liked your post" notification when someone
-- quickly unlikes isn't worth the extra bookkeeping.
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check check (type in (
  'matrimonial_message', 'moderation_decision', 'appeal_outcome', 'post_comment', 'post_like'
));

create or replace function notify_new_like()
returns trigger language plpgsql security definer as $$
declare
  v_post_author_id uuid;
  v_post_author_username text;
  v_link text;
begin
  select p.author_id, pr.username into v_post_author_id, v_post_author_username
  from posts p join profiles pr on pr.id = p.author_id
  where p.id = new.post_id;

  if v_post_author_id is null or v_post_author_id = new.user_id then
    return new;
  end if;

  v_link := '/profile/' || v_post_author_username || '/posts/' || new.post_id;

  update notifications
    set count = count + 1, actor_id = new.user_id, created_at = now()
    where user_id = v_post_author_id
      and type = 'post_like'
      and link = v_link
      and read_at is null;

  if not found then
    insert into notifications (user_id, type, actor_id, link)
    values (v_post_author_id, 'post_like', new.user_id, v_link);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_like on post_likes;
create trigger trg_notify_new_like
  after insert on post_likes
  for each row execute function notify_new_like();
