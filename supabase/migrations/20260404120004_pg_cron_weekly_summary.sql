-- Schedule weekly summary to run hourly on Mondays
-- The Edge Function checks each user's local timezone
-- and only sends if it's 7-10 AM Monday in their zone.
-- Requires pg_cron and pg_net extensions enabled in Supabase Dashboard

select cron.schedule(
  'weekly-summary',
  '0 * * * 1',
  $$
  select net.http_post(
    url := 'https://fzedsixotdapeiztdjrf.supabase.co/functions/v1/weekly-summary',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
