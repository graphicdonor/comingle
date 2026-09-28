-- Health Care listings ("List a Health Service", linked from the home page's
-- Health Care community-service tile). Same shape as education_listings:
-- a public directory of doctors, clinics, pharmacies, labs etc., one owner
-- can list more than one service. The app doesn't verify credentials — the
-- UI says so on every listing.
create table if not exists health_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  provider_name     text,
  provider_type     text,
  specialty         text,
  consultation_mode text not null default 'In-person' check (consultation_mode in ('In-person', 'Online', 'Both')),
  fee               numeric check (fee is null or fee >= 0),
  fee_period        text,
  timings           text,
  address_line1     text,
  city              text,
  state             text,
  pin_code          text,
  description       text,
  poc_name          text,
  email             text,
  mobile_number     text,
  whatsapp_number   text,
  photo_urls        text[] not null default '{}',
  moderation_status text not null default 'pending_review' check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_health_listings_owner on health_listings(owner_id);
create index if not exists idx_health_listings_status on health_listings(moderation_status);

-- Same feed-companion-post mechanism as the other listing types.
alter table posts drop constraint if exists posts_post_type_check;
alter table posts add constraint posts_post_type_check
  check (post_type in ('standard', 'matrimonial_profile', 'business_listing', 'job_listing', 'event_listing', 'housing_listing', 'education_listing', 'health_listing'));
alter table posts add column if not exists health_listing_id uuid references health_listings(id) on delete cascade;
create unique index if not exists posts_health_listing_id_key on posts(health_listing_id);

create or replace function set_health_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_health_listings_updated_at on health_listings;
create trigger trg_health_listings_updated_at
  before update on health_listings
  for each row execute function set_health_listing_updated_at();

alter table health_listings enable row level security;

create policy "Published health listings are publicly visible" on health_listings for select using (moderation_status = 'published');
create policy "Owners can view own health listings" on health_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own health listings" on health_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own health listings" on health_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own health listings" on health_listings for delete using (auth.uid() = owner_id);

-- Moderation logs need the new content type (see the fundraisers migration
-- for why this list must be kept complete).
alter table moderation_logs drop constraint if exists moderation_logs_content_type_check;
alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio', 'community_description', 'community_rules', 'avatar',
  'community_cover', 'business_listing', 'job_listing', 'comment', 'event_listing',
  'housing_listing', 'education_listing', 'fundraiser', 'health_listing'
));
