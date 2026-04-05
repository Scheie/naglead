-- Add a memorable email alias for lead intake (e.g. "jumping-hippo")
alter table public.users add column if not exists intake_alias text;

-- Add unique constraint if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_intake_alias_key'
  ) then
    alter table public.users add constraint users_intake_alias_key unique (intake_alias);
  end if;
end $$;

-- Index for looking up users by alias
create index if not exists idx_users_intake_alias on users(intake_alias);
