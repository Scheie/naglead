-- Enable pg_cron extension (must be done by Supabase dashboard or support)
-- create extension if not exists pg_cron;

-- Schedule the nag engine to run every 15 minutes
-- NOTE: Replace YOUR_PROJECT_REF with your actual Supabase project ref
-- This calls the Edge Function via HTTP

-- select cron.schedule(
--   'nag-engine',
--   '*/15 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nag-engine',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- Uncomment above after deploying the edge function and setting the project ref.
-- pg_cron and pg_net must be enabled in your Supabase project settings.
