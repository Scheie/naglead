-- Track processed Stripe webhook events for idempotency
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  processed_at timestamptz default now()
);

-- Auto-cleanup events older than 7 days (Stripe retries for up to 72h)
-- Run via pg_cron daily if desired
