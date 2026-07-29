-- Events service ("Register an Event", linked from the home page's Events
-- community-service tile) — the last of the five previously-"Coming Soon"
-- service tiles to get built out, following the exact shape business_listings
-- and job_listings already established: one organizer can list more than one
-- event, it's a public directory (not a matching pool), and it can publish a
-- companion card into a community feed the same way those two do.
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  organizer_id      uuid not null references profiles(id) on delete cascade,
  title             text not null,
  description       text,
  categories        text[] not null default '{}',
  event_date        date not null,
  start_time        time,
  end_time          time,
  is_online         boolean not null default false,
  online_link       text,
  venue_name        text,
  address           text,
  city              text,
  state             text,
  poc_name          text,
  mobile_number     text,
  whatsapp_number   text,
  email             text,
  registration_link text,
  photo_urls        text[] not null default '{}',
  moderation_status text not null default 'pending_review' check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_events_organizer on events(organizer_id);
create index if not exists idx_events_status on events(moderation_status);
create index if not exists idx_events_date on events(event_date);

create or replace function set_event_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at
  before update on events
  for each row execute function set_event_updated_at();

alter table events enable row level security;

create policy "Published events are publicly visible" on events for select using (moderation_status = 'published');
create policy "Organizers can view own events" on events for select using (auth.uid() = organizer_id);
create policy "Organizers can create own events" on events for insert with check (auth.uid() = organizer_id and moderation_status = 'pending_review');
create policy "Organizers can update own events" on events for update
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id and moderation_status = 'pending_review');
create policy "Organizers can delete own events" on events for delete using (auth.uid() = organizer_id);

-- Companion community-feed post support (see src/lib/community-feed-post.ts),
-- same pattern as matrimonial_profile_id/business_listing_id/job_listing_id.
alter table posts add column if not exists event_listing_id uuid references events(id) on delete cascade;
create unique index if not exists posts_event_listing_id_key on posts(event_listing_id);

alter table posts drop constraint if exists posts_post_type_check;
alter table posts add constraint posts_post_type_check check (post_type in (
  'standard', 'matrimonial_profile', 'business_listing', 'job_listing', 'event_listing'
));

do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'moderation_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%content_type%'
  loop
    execute format('alter table moderation_logs drop constraint %I', con.conname);
  end loop;
end $$;

alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio', 'community_description',
  'community_rules', 'avatar', 'community_cover', 'business_listing',
  'job_listing', 'comment', 'event_listing'
));
