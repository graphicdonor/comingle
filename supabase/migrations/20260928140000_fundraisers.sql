-- Community fundraisers shown on the Donate tab. Members share a link to a
-- fundraiser hosted on a trusted donation platform (Ketto, Milaap, GoFundMe
-- ... see src/lib/donations.ts); WePray never handles the money itself.
-- Same moderation gating as the directory listings: inserted as
-- pending_review by the owner, flipped by the service-role client once the
-- moderation pipeline resolves.
create table if not exists fundraisers (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references profiles(id) on delete cascade,
  community_id      uuid not null references communities(id) on delete cascade,
  url               text not null check (url ~ '^https://' and char_length(url) <= 500),
  platform          text not null,
  title             text not null check (char_length(title) between 1 and 200),
  note              text check (char_length(note) <= 1000),
  image_url         text check (image_url is null or image_url ~ '^https://'),
  moderation_status text not null default 'pending_review' check (moderation_status in ('pending_review', 'published', 'blocked')),
  created_at        timestamptz not null default now(),
  unique (community_id, url)
);

create index if not exists idx_fundraisers_status_created on fundraisers(moderation_status, created_at desc);
create index if not exists idx_fundraisers_owner on fundraisers(owner_id);

alter table fundraisers enable row level security;

create policy "Published fundraisers are publicly visible" on fundraisers for select using (moderation_status = 'published');
create policy "Owners can view own fundraisers" on fundraisers for select using (auth.uid() = owner_id);
create policy "Owners can share fundraisers" on fundraisers for insert with check (auth.uid() = owner_id and moderation_status = 'pending_review');
create policy "Owners can delete own fundraisers" on fundraisers for delete using (auth.uid() = owner_id);

-- moderation_logs.content_type: add 'fundraiser', and also the
-- 'housing_listing' / 'education_listing' types, which the housing and
-- education migrations never added — without them, logging a moderation
-- decision for those listings violated this check and the submission failed.
alter table moderation_logs drop constraint if exists moderation_logs_content_type_check;
alter table moderation_logs add constraint moderation_logs_content_type_check check (content_type in (
  'post', 'matrimonial_profile', 'profile_bio', 'community_description', 'community_rules', 'avatar',
  'community_cover', 'business_listing', 'job_listing', 'comment', 'event_listing',
  'housing_listing', 'education_listing', 'fundraiser'
));
