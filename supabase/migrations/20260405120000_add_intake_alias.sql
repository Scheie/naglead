-- Add a memorable email alias for lead intake (e.g. "jumping-hippo")
alter table public.users add column intake_alias text unique;

-- Index for looking up users by alias
create index idx_users_intake_alias on users(intake_alias);
