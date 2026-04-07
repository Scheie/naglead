-- Add cryptographically random webhook token (replaces user ID as auth)
alter table public.users add column if not exists webhook_token text;

-- Generate tokens for existing users
update public.users
set webhook_token = encode(gen_random_bytes(24), 'base64')
where webhook_token is null;

-- Make it unique and not null going forward
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_webhook_token_key'
  ) then
    alter table public.users add constraint users_webhook_token_key unique (webhook_token);
  end if;
end $$;

create index if not exists idx_users_webhook_token on users(webhook_token)
  where webhook_token is not null;
