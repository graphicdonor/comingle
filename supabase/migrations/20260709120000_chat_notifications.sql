-- Notifications: in-app notification center. Rows are seeded by DB triggers
-- so every code path that creates the underlying event reliably produces a
-- notification without app code having to remember to write one — the same
-- reasoning as the existing matrimonial_profiles updated_at trigger.
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  type        text not null check (type in ('matrimonial_message')),
  actor_id    uuid references profiles(id) on delete cascade,
  link        text not null,
  count       integer default 1 not null,
  read_at     timestamptz,
  created_at  timestamptz default now() not null
);

create index if not exists idx_notifications_user on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read" on notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No insert policy for regular users: rows are only ever created by the
-- security definer trigger below, the same bypass-RLS pattern already used
-- by increment_member_count/decrement_member_count.

-- New chat message -> notify the receiver. If they already have an unread
-- notification for a message from the same sender, bump its count and
-- timestamp instead of piling up one row per message.
create or replace function notify_new_matrimonial_message()
returns trigger language plpgsql security definer as $$
begin
  update notifications
    set count = count + 1, created_at = now()
    where user_id = new.receiver_id
      and type = 'matrimonial_message'
      and actor_id = new.sender_id
      and read_at is null;

  if not found then
    insert into notifications (user_id, type, actor_id, link)
    values (new.receiver_id, 'matrimonial_message', new.sender_id, '/services/matrimonial/chat/' || new.sender_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_new_matrimonial_message on matrimonial_messages;
create trigger trg_notify_new_matrimonial_message
  after insert on matrimonial_messages
  for each row execute function notify_new_matrimonial_message();
