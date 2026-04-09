-- Schedule the nag engine to run every 15 minutes
-- Requires pg_cron and pg_net extensions enabled in Supabase Dashboard

select cron.schedule(
  'nag-engine',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://fzedsixotdapeiztdjrf.supabase.co/functions/v1/nag-engine',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
