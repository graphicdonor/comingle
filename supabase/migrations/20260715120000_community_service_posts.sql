-- Lets a published matrimonial profile, business listing, or job listing
-- also appear as a card in the community feed the author chooses to share
-- it to. Reuses the posts table wholesale (feed queries, likes, comments,
-- moderation-status visibility, and delete all keep working unchanged) —
-- post_type is a discriminator for PostCard to render a listing-style card
-- instead of a plain text/media post, and the (at most one) non-null FK
-- column points back to whichever source row the post represents
-- ('standard' posts leave all three null). Plain (non-partial) unique
-- indexes so a listing's companion post can be looked up/upserted by its
-- ref column via ON CONFLICT — Postgres unique indexes don't count NULLs
-- against each other, so 'standard' posts (all three null) are unaffected.
alter table posts add column if not exists post_type text not null default 'standard'
  check (post_type in ('standard', 'matrimonial_profile', 'business_listing', 'job_listing'));
alter table posts add column if not exists matrimonial_profile_id uuid references matrimonial_profiles(user_id) on delete cascade;
alter table posts add column if not exists business_listing_id uuid references business_listings(id) on delete cascade;
alter table posts add column if not exists job_listing_id uuid references job_listings(id) on delete cascade;

create unique index if not exists posts_matrimonial_profile_id_key on posts(matrimonial_profile_id);
create unique index if not exists posts_business_listing_id_key on posts(business_listing_id);
create unique index if not exists posts_job_listing_id_key on posts(job_listing_id);
