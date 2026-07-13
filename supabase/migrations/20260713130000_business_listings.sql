-- Business listings ("Register your Business", linked from the home page's
-- Businesses community-service tile). One owner can list more than one
-- business, unlike matrimonial_profiles' one-row-per-user shape, so this
-- gets its own generated id + owner_id foreign key instead of a user_id PK.
create table if not exists business_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  name              text not null,
  pin_code          text,
  address_line1     text,
  address_line2     text,
  street            text,
  landmark          text,
  area              text,
  city              text,
  state             text,
  poc_name          text,
  mobile_number     text,
  whatsapp_number   text,
  email             text,
  categories        text[] not null default '{}',
  open_days         text[] not null default '{}',
  open_time         time,
  close_time        time,
  photo_urls        text[] not null default '{}',
  moderation_status text not null default 'pending_review' check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_business_listings_owner on business_listings(owner_id);
create index if not exists idx_business_listings_status on business_listings(moderation_status);

create or replace function set_business_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_business_listings_updated_at on business_listings;
create trigger trg_business_listings_updated_at
  before update on business_listings
  for each row execute function set_business_listing_updated_at();

alter table business_listings enable row level security;

-- Same shape as matrimonial_profiles: insert/update are forced to
-- pending_review by the WITH CHECK, so only a service-role update (after
-- the moderation pipeline runs) can ever set published/blocked.
create policy "Published listings are publicly visible" on business_listings for select using (moderation_status = 'published');
create policy "Owners can view own listings" on business_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own listings" on business_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own listings" on business_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own listings" on business_listings for delete using (auth.uid() = owner_id);

-- Widen moderation_logs to accept business listing submissions through the
-- same AI moderation pipeline every other user-submitted content type uses.
alter table moderation_logs drop constraint if exists moderation_logs_content_type_check;
alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio',
  'community_description', 'community_rules',
  'avatar', 'community_cover', 'business_listing'
));
