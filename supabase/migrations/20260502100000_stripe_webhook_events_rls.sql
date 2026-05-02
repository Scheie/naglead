-- Enable RLS on stripe_webhook_events (service role only, no client access)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = all client access blocked, only service role can read/write
