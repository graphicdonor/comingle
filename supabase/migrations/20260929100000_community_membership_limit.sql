-- Members can belong to at most 5 communities. Enforced here rather than in
-- app code so every path — the Join buttons on web and native, onboarding's
-- community picker, and creating a community (which adds the creator as its
-- admin) — hits the same limit. The limit is mirrored as MAX_COMMUNITIES in
-- src/lib/community.ts (both apps) for the UI.
create or replace function enforce_community_membership_limit()
returns trigger language plpgsql as $$
begin
  -- Serialize concurrent joins by the same user so two simultaneous inserts
  -- can't both pass the count check.
  perform pg_advisory_xact_lock(hashtext('community_membership:' || new.user_id::text));

  -- Excludes the row's own community so re-upserting an existing membership
  -- (onboarding uses upsert) isn't counted against the user.
  if (
    select count(*) from community_members
    where user_id = new.user_id and community_id <> new.community_id
  ) >= 5 then
    raise exception 'You can join up to 5 communities. Leave one to join another.'
      using errcode = 'P0001', hint = 'community_membership_limit';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_community_membership_limit on community_members;
create trigger trg_community_membership_limit
  before insert on community_members
  for each row execute function enforce_community_membership_limit();
