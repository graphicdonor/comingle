-- Lets admin staff deactivate an account (e.g. abuse, a support request)
-- without deleting it outright. Enforcement lives in src/proxy.ts, which
-- signs out and blocks any request from a user whose profile has gone
-- inactive. Defaults true so every existing row keeps working unchanged.
alter table profiles add column if not exists is_active boolean not null default true;
