-- Housing listings ("Post a Property", linked from the home page's Housing
-- community-service tile). Same shape as business_listings/job_listings:
-- one owner can list more than one property, and it's a public directory,
-- not a matching pool.
create table if not exists housing_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  listing_type      text not null check (listing_type in ('For Sale', 'For Rent')),
  property_type     text,
  price             numeric,
  rent_frequency    text,
  bedrooms          integer,
  bathrooms         integer,
  area_sqft         numeric,
  address_line1     text,
  city              text,
  state             text,
  pin_code          text,
  amenities         text[] not null default '{}',
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

create index if not exists idx_housing_listings_owner on housing_listings(owner_id);
create index if not exists idx_housing_listings_status on housing_listings(moderation_status);

-- Same feed-companion-post mechanism as matrimonial/business/job/event listings.
alter table posts drop constraint if exists posts_post_type_check;
alter table posts add constraint posts_post_type_check
  check (post_type in ('standard', 'matrimonial_profile', 'business_listing', 'job_listing', 'event_listing', 'housing_listing'));
alter table posts add column if not exists housing_listing_id uuid references housing_listings(id) on delete cascade;
create unique index if not exists posts_housing_listing_id_key on posts(housing_listing_id);

-- updated_at on housing_listings is DB-owned so app code never sets it
create or replace function set_housing_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_housing_listings_updated_at on housing_listings;
create trigger trg_housing_listings_updated_at
  before update on housing_listings
  for each row execute function set_housing_listing_updated_at();

alter table housing_listings enable row level security;

-- Same shape as business_listings/job_listings' moderation gating and
-- public directory visibility.
create policy "Published housing listings are publicly visible" on housing_listings for select using (moderation_status = 'published');
create policy "Owners can view own housing listings" on housing_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own housing listings" on housing_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own housing listings" on housing_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own housing listings" on housing_listings for delete using (auth.uid() = owner_id);
