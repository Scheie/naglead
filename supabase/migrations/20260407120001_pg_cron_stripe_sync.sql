-- Schedule Stripe subscription sync every 6 hours as a fallback
-- Reconciles subscription_status with Stripe API (source of truth)

-- NOTE: Replace YOUR_PROJECT_REF with your actual Supabase project ref

-- select cron.schedule(
--   'stripe-sync',
--   '0 */6 * * *',
--   $$
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-sync',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- Uncomment above after deploying the edge function and setting the project ref.
-- Requires: STRIPE_SECRET_KEY set as a Supabase Edge Function secret.
