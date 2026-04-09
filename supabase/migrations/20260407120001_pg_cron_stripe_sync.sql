-- Schedule Stripe subscription sync every 6 hours as a fallback
-- Reconciles subscription_status with Stripe API (source of truth)
-- Requires pg_cron and pg_net extensions enabled in Supabase Dashboard
-- Requires STRIPE_SECRET_KEY set as a Supabase Edge Function secret

select cron.schedule(
  'stripe-sync',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://fzedsixotdapeiztdjrf.supabase.co/functions/v1/stripe-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
