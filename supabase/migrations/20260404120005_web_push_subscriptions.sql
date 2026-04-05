-- Web Push subscriptions for browser push notifications
-- A user can subscribe from multiple browsers/devices
create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.web_push_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Users can manage own subscriptions' and tablename = 'web_push_subscriptions'
  ) then
    create policy "Users can manage own subscriptions"
      on public.web_push_subscriptions for all
      using (user_id = auth.uid());
  end if;
end $$;

create index if not exists idx_web_push_user on web_push_subscriptions(user_id);
