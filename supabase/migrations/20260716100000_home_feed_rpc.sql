-- The home feed previously needed two sequential round trips: fetch the
-- viewer's community_ids, then fetch posts filtered `.in(community_ids)` —
-- PostgREST has no way to express "posts whose community_id is in a
-- subquery" as a single .from("posts") filter. Returning `setof posts` (the
-- actual table shape, not a custom type) lets PostgREST embed profiles/
-- communities via .select() on the RPC call exactly like a normal table
-- query, so the join moves into one query planned by Postgres itself
-- instead of two round trips from the app. security invoker (the
-- default) — RLS on `posts` still applies as the calling user, so this
-- doesn't bypass the moderation-status visibility policy.
create or replace function get_home_feed(p_user_id uuid, p_limit int default 20)
returns setof posts
language sql stable as $$
  select posts.* from posts
  where community_id in (select community_id from community_members where user_id = p_user_id)
  order by created_at desc
  limit p_limit;
$$;
