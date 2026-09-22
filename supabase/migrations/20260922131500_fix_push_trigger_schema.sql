-- Fixes 20260922130000_push_tokens.sql: pg_net is pre-installed on Supabase
-- projects in the `net` schema (not `extensions`), and its function is
-- `net.http_post`, not a nested `extensions.net.http_post` — the previous
-- migration's `create extension ... with schema extensions` silently
-- no-opped against the existing install, and the qualified call was invalid
-- ("cross-database references are not implemented"), so every notification
-- insert failed until this fix.
create or replace function notify_push_on_new_notification()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
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
