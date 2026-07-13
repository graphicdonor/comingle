-- Lets proxy.ts check the deactivated-account gate without first waiting on
-- auth.getUser()'s round trip to the Auth server: this RPC resolves
-- auth.uid() from the request's own JWT locally in Postgres (no network hop
-- to GoTrue), so it can run in parallel with getUser() instead of after it.
-- security invoker (the default) is correct here, not security definer —
-- profiles.select is already public via RLS, so no elevated privilege is
-- needed to read is_active for the caller's own row.
create or replace function current_user_is_active()
returns boolean language sql stable as $$
  select coalesce((select is_active from profiles where id = auth.uid()), true);
$$;
