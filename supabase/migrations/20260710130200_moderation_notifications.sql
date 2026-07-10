-- Widen the notifications type check to cover moderation outcomes, and add
-- the two triggers that fire them — matching the existing
-- notify_new_matrimonial_message pattern exactly: notifications are never
-- inserted by app code, only by security-definer triggers.
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check
  check (type in ('matrimonial_message', 'moderation_decision', 'appeal_outcome'));

-- A held item leaving 'pending' (approved or rejected by a human reviewer)
-- notifies the author of the outcome.
create or replace function notify_moderation_decision()
returns trigger language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_link text;
begin
  if new.status = old.status or new.status = 'pending' then
    return new;
  end if;

  select user_id, context_link into v_user_id, v_link
    from moderation_logs where id = new.log_id;

  insert into notifications (user_id, type, link)
  values (v_user_id, 'moderation_decision', v_link);

  return new;
end;
$$;

drop trigger if exists trg_notify_moderation_decision on moderation_queue;
create trigger trg_notify_moderation_decision
  after update on moderation_queue
  for each row execute function notify_moderation_decision();

-- An appeal being resolved (approved or denied) notifies the appellant.
create or replace function notify_appeal_outcome()
returns trigger language plpgsql security definer as $$
begin
  if new.status = old.status or new.status = 'pending' then
    return new;
  end if;

  insert into notifications (user_id, type, link)
  select new.user_id, 'appeal_outcome', context_link
    from moderation_logs where id = new.log_id;

  return new;
end;
$$;

drop trigger if exists trg_notify_appeal_outcome on moderation_appeals;
create trigger trg_notify_appeal_outcome
  after update on moderation_appeals
  for each row execute function notify_appeal_outcome();
