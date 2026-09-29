-- Legal Aid listings ("List a Legal Service", linked from the home page's
-- Legal Aid community-service tile). Same shape as legal_listings, with
-- practice_area in place of specialty: advocates, law firms, legal aid
-- clinics, notaries etc. The app doesn't verify credentials, and listings
-- aren't legal advice — the UI says so on every listing.
create table if not exists legal_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  provider_name     text,
  provider_type     text,
  practice_area     text,
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

create index if not exists idx_legal_listings_owner on legal_listings(owner_id);
create index if not exists idx_legal_listings_status on legal_listings(moderation_status);

-- Same feed-companion-post mechanism as the other listing types.
alter table posts drop constraint if exists posts_post_type_check;
alter table posts add constraint posts_post_type_check
  check (post_type in ('standard', 'matrimonial_profile', 'business_listing', 'job_listing', 'event_listing', 'housing_listing', 'education_listing', 'health_listing', 'legal_listing'));
alter table posts add column if not exists legal_listing_id uuid references legal_listings(id) on delete cascade;
create unique index if not exists posts_legal_listing_id_key on posts(legal_listing_id);

create or replace function set_legal_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_legal_listings_updated_at on legal_listings;
create trigger trg_legal_listings_updated_at
  before update on legal_listings
  for each row execute function set_legal_listing_updated_at();

alter table legal_listings enable row level security;

create policy "Published legal listings are publicly visible" on legal_listings for select using (moderation_status = 'published');
create policy "Owners can view own legal listings" on legal_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own legal listings" on legal_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own legal listings" on legal_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own legal listings" on legal_listings for delete using (auth.uid() = owner_id);

-- Moderation logs need the new content type (see the fundraisers migration
-- for why this list must be kept complete).
alter table moderation_logs drop constraint if exists moderation_logs_content_type_check;
alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio', 'community_description', 'community_rules', 'avatar',
  'community_cover', 'business_listing', 'job_listing', 'comment', 'event_listing',
  'housing_listing', 'education_listing', 'fundraiser', 'health_listing', 'legal_listing'
));
