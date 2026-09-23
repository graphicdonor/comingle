-- Education listings ("Post a Class/Course", linked from the home page's
-- Education community-service tile). Same shape as housing_listings/
-- job_listings: one teacher/institute can list more than one offering, and
-- it's a public directory, not a matching pool.
create table if not exists education_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  provider_name     text,
  service_type      text,
  subject           text,
  level             text,
  mode              text not null default 'Offline' check (mode in ('Online', 'Offline', 'Hybrid')),
  fee               numeric,
  fee_period        text,
  address_line1     text,
  city              text,
  state             text,
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

create index if not exists idx_education_listings_owner on education_listings(owner_id);
create index if not exists idx_education_listings_status on education_listings(moderation_status);

-- Same feed-companion-post mechanism as the other listing types.
alter table posts drop constraint if exists posts_post_type_check;
alter table posts add constraint posts_post_type_check
  check (post_type in ('standard', 'matrimonial_profile', 'business_listing', 'job_listing', 'event_listing', 'housing_listing', 'education_listing'));
alter table posts add column if not exists education_listing_id uuid references education_listings(id) on delete cascade;
create unique index if not exists posts_education_listing_id_key on posts(education_listing_id);

-- updated_at on education_listings is DB-owned so app code never sets it
create or replace function set_education_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_education_listings_updated_at on education_listings;
create trigger trg_education_listings_updated_at
  before update on education_listings
  for each row execute function set_education_listing_updated_at();

alter table education_listings enable row level security;

-- Same shape as housing_listings/job_listings' moderation gating and
-- public directory visibility.
create policy "Published education listings are publicly visible" on education_listings for select using (moderation_status = 'published');
create policy "Owners can view own education listings" on education_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own education listings" on education_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own education listings" on education_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own education listings" on education_listings for delete using (auth.uid() = owner_id);
