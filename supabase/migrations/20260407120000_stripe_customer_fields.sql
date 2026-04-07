-- Add Stripe customer and subscription tracking to users
alter table public.users add column if not exists stripe_customer_id text;
alter table public.users add column if not exists stripe_subscription_id text;

create unique index if not exists idx_users_stripe_customer on users(stripe_customer_id)
  where stripe_customer_id is not null;
