-- Push notification device tokens (Expo push tokens) for the native app.
-- A user can have multiple tokens (multiple devices), so this is keyed by
-- the token itself rather than one-row-per-user.
create table if not exists push_tokens (
  token       text primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  platform    text not null check (platform in ('ios', 'android')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists idx_push_tokens_user on push_tokens (user_id);

alter table push_tokens enable row level security;

-- Users manage only their own tokens; there's no need for anyone to read
-- another user's token client-side (delivery reads happen server-side via
-- the service-role client in the send-push edge function).
create policy "Users can view own push tokens" on push_tokens for select using (auth.uid() = user_id);
create policy "Users can register own push tokens" on push_tokens for insert with check (auth.uid() = user_id);
create policy "Users can update own push tokens" on push_tokens for update using (auth.uid() = user_id);
create policy "Users can delete own push tokens" on push_tokens for delete using (auth.uid() = user_id);

-- Fires the send-push edge function whenever a new notification is
-- inserted, so a device with the app closed still gets a system push, not
-- just the in-app notification-center row. Uses pg_net for a fire-and-forget
-- async HTTP call — a failed or slow push delivery must never block or fail
-- the notification insert itself.
--
-- The edge function is deployed with --no-verify-jwt (this is a
-- server-to-server call from inside the same project, not a
-- user-authenticated request), so this shared secret is the only thing
-- distinguishing a legitimate trigger call from an arbitrary POST to the
-- function's public URL — not a service-role key, just a webhook-style
-- shared secret checked against the same value set via
-- `supabase secrets set PUSH_TRIGGER_SECRET=...` on the function.
create extension if not exists pg_net with schema extensions;

create or replace function notify_push_on_new_notification()
returns trigger language plpgsql security definer as $$
begin
  perform extensions.net.http_post(
    url := 'https://nyelzjrtopwpdhpvkqdb.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'bf187fab68fccecd80b9c38b71fccf53c5ca22e7c1d0da3df7fda6ee606868ce'
    ),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_push_on_new_notification on notifications;
create trigger trg_notify_push_on_new_notification
  after insert on notifications
  for each row execute function notify_push_on_new_notification();
