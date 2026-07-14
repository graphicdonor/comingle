-- Job listings ("Post a Job", linked from the home page's Jobs
-- community-service tile). Same shape as business_listings: one owner can
-- post more than one job, so this gets its own generated id + owner_id
-- foreign key instead of a user_id PK, and is a public directory (no
-- shared-community restriction), not a matching pool.
create table if not exists job_listings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  title             text not null,
  company_name      text,
  job_type          text,
  categories        text[] not null default '{}',
  city              text,
  state             text,
  is_remote         boolean not null default false,
  salary_min        integer,
  salary_max        integer,
  description       text,
  poc_name          text,
  email             text,
  mobile_number     text,
  whatsapp_number   text,
  application_link  text,
  photo_urls        text[] not null default '{}',
  moderation_status text not null default 'pending_review' check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_job_listings_owner on job_listings(owner_id);
create index if not exists idx_job_listings_status on job_listings(moderation_status);

create or replace function set_job_listing_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_job_listings_updated_at on job_listings;
create trigger trg_job_listings_updated_at
  before update on job_listings
  for each row execute function set_job_listing_updated_at();

alter table job_listings enable row level security;

-- Same shape as business_listings: insert/update are forced to
-- pending_review by the WITH CHECK, so only a service-role update (after
-- the moderation pipeline runs) can ever set published/blocked.
create policy "Published jobs are publicly visible" on job_listings for select using (moderation_status = 'published');
create policy "Owners can view own job listings" on job_listings for select using (auth.uid() = owner_id);
create policy "Owners can create own job listings" on job_listings for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can update own job listings" on job_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own job listings" on job_listings for delete using (auth.uid() = owner_id);

-- Widen moderation_logs to accept job listing submissions through the same
-- AI moderation pipeline every other user-submitted content type uses.
alter table moderation_logs drop constraint if exists moderation_logs_content_type_check;
alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio',
  'community_description', 'community_rules',
  'avatar', 'community_cover', 'business_listing', 'job_listing'
));
