-- Seed script: Test leads for nag engine schedule verification
-- Run in Supabase SQL Editor
--
-- Creates 5 leads at specific ages so each nag tier fires on the
-- next cron run (within 15 minutes). All have nag_count = 0 so
-- they'll trigger immediately.
--
-- Safe to re-run: deletes previous test leads first.

DO $$
DECLARE
  uid uuid;
BEGIN
  -- Use your account (the one with a push token)
  SELECT id INTO uid FROM public.users WHERE push_token IS NOT NULL LIMIT 1;

  IF uid IS NULL THEN
    RAISE EXCEPTION 'No user with a push token found. Open the app first to register.';
  END IF;

  -- Clean up any previous test leads
  DELETE FROM public.leads WHERE user_id = uid AND name LIKE 'NAG TEST%';

  -- Lead 1: Just hit 2 hours (should trigger "New lead waiting" nag)
  INSERT INTO public.leads (user_id, name, description, phone, state, nag_count, created_at, updated_at)
  VALUES (uid, 'NAG TEST: 2hr', 'Should get GENTLE nag', '+15550000001', 'reply_now', 0,
    now() - interval '2 hours 5 minutes', now() - interval '2 hours 5 minutes');

  -- Lead 2: Just hit 6 hours (should trigger "Lead going cold" nag)
  INSERT INTO public.leads (user_id, name, description, phone, state, nag_count, created_at, updated_at)
  VALUES (uid, 'NAG TEST: 6hr', 'Should get MEDIUM nag', '+15550000002', 'reply_now', 1,
    now() - interval '6 hours 5 minutes', now() - interval '6 hours 5 minutes');

  -- Lead 3: Just hit 24 hours (should trigger "1 day with no reply" nag)
  INSERT INTO public.leads (user_id, name, description, phone, state, nag_count, created_at, updated_at)
  VALUES (uid, 'NAG TEST: 24hr', 'Should get FIRM nag', '+15550000003', 'reply_now', 2,
    now() - interval '24 hours 5 minutes', now() - interval '24 hours 5 minutes');

  -- Lead 4: Just hit 48 hours (should trigger "You're losing this job" nag)
  INSERT INTO public.leads (user_id, name, description, phone, state, nag_count, created_at, updated_at)
  VALUES (uid, 'NAG TEST: 48hr', 'Should get URGENT nag', '+15550000004', 'reply_now', 3,
    now() - interval '48 hours 5 minutes', now() - interval '48 hours 5 minutes');

  -- Lead 5: Just hit 72 hours (should trigger "Last chance" nag)
  INSERT INTO public.leads (user_id, name, description, phone, state, nag_count, created_at, updated_at)
  VALUES (uid, 'NAG TEST: 72hr', 'Should get LAST CHANCE nag', '+15550000005', 'reply_now', 4,
    now() - interval '72 hours 5 minutes', now() - interval '72 hours 5 minutes');

  RAISE NOTICE 'Created 5 test leads for user %', uid;
END $$;
