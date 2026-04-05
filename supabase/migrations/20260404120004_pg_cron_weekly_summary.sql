-- Schedule weekly summary to run every Monday at 00:00 UTC
-- The Edge Function itself checks each user's local timezone
-- and only sends if it's 7-10 AM Monday in their zone.
-- This means the cron runs hourly on Mondays to catch all timezones.

-- NOTE: Replace YOUR_PROJECT_REF with your actual Supabase project ref

-- select cron.schedule(
--   'weekly-summary',
--   '0 * * * 1',
--   $$
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-summary',
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
