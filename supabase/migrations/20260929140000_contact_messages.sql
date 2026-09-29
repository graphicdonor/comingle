-- Messages sent through the Contact us form (/contact, linked from Settings
-- and named as the contact route in the Terms and Privacy Policy). Anyone
-- can write, signed in or not — a parent, or someone locked out of their
-- account — so user_id is optional. Writes go through /api/contact with the
-- service-role client (validation + rate limiting there) and admins read it
-- in /admin/contact, so RLS is on with no policies: clients can't touch it.
create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  topic      text not null check (topic in ('privacy', 'terms', 'safety', 'account', 'guardian', 'other')),
  message    text not null check (char_length(message) between 10 and 4000),
  name       text check (char_length(name) <= 100),
  reply_to   text not null check (char_length(reply_to) between 5 and 200),
  user_id    uuid references profiles(id) on delete set null,
  -- SHA-256 of the sender's IP, for rate limiting only; the raw IP is never stored.
  ip_hash    text,
  status     text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index contact_messages_status_created_idx on contact_messages(status, created_at desc);
create index contact_messages_ip_hash_created_idx on contact_messages(ip_hash, created_at);

alter table contact_messages enable row level security;
