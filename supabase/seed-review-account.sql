-- Seed script: Apple App Store review account
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Creates review@naglead.com with test leads in various states
-- so Apple reviewers can see the full app experience immediately.
--
-- Safe to re-run: deletes existing review account first.
-- Password: NagLead-Review-2026!

-- 1. Clean up any existing review account
DO $$
DECLARE
  review_uid uuid;
BEGIN
  SELECT id INTO review_uid FROM auth.users WHERE email = 'review@naglead.com';
  IF review_uid IS NOT NULL THEN
    DELETE FROM public.lead_events WHERE user_id = review_uid;
    DELETE FROM public.leads WHERE user_id = review_uid;
    DELETE FROM public.users WHERE id = review_uid;
    DELETE FROM auth.users WHERE id = review_uid;
  END IF;
END $$;

-- 2. Create auth user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'review@naglead.com',
  crypt('NagLead-Review-2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"App Review"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  ''
);

-- Grab the new user's ID
DO $$
DECLARE
  review_uid uuid;
  lead1_id uuid;
  lead2_id uuid;
  lead3_id uuid;
  lead4_id uuid;
  lead5_id uuid;
BEGIN
  SELECT id INTO review_uid FROM auth.users WHERE email = 'review@naglead.com';

  -- 3. Create public.users profile
  INSERT INTO public.users (id, email, name, trade, business_name, timezone, nag_enabled, country, subscription_status)
  VALUES (
    review_uid,
    'review@naglead.com',
    'App Review',
    'Plumbing',
    'Review Plumbing Co.',
    'America/Los_Angeles',
    true,
    'US',
    'pro'
  );

  -- 4. Create test leads in various states

  -- Lead 1: Reply Now (fresh, 1 hour old) — has phone and email
  lead1_id := gen_random_uuid();
  INSERT INTO public.leads (id, user_id, name, description, phone, email, state, source, created_at, updated_at)
  VALUES (
    lead1_id, review_uid,
    'Jordan Rivera',
    'Kitchen faucet leaking, needs repair this week',
    '+14155550101',
    'jordan.r@example.com',
    'reply_now', 'email',
    now() - interval '1 hour',
    now() - interval '1 hour'
  );
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead1_id, review_uid, 'created', now() - interval '1 hour');

  -- Lead 2: Reply Now (urgent, 8 hours old) — phone only
  lead2_id := gen_random_uuid();
  INSERT INTO public.leads (id, user_id, name, description, phone, state, source, nag_count, last_nagged_at, created_at, updated_at)
  VALUES (
    lead2_id, review_uid,
    'Sam Chen',
    'Water heater replacement, 40 gallon gas',
    '+14155550102',
    'reply_now', 'manual',
    2, now() - interval '2 hours',
    now() - interval '8 hours',
    now() - interval '8 hours'
  );
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead2_id, review_uid, 'created', now() - interval '8 hours');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead2_id, review_uid, 'nagged', now() - interval '6 hours');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead2_id, review_uid, 'nagged', now() - interval '2 hours');

  -- Lead 3: Waiting (replied 2 days ago) — phone and email
  lead3_id := gen_random_uuid();
  INSERT INTO public.leads (id, user_id, name, description, phone, email, state, source, replied_at, created_at, updated_at)
  VALUES (
    lead3_id, review_uid,
    'Alex Thompson',
    'Bathroom remodel, need new shower valve and tile work',
    '+14155550103',
    'alex.t@example.com',
    'waiting', 'webhook',
    now() - interval '2 days',
    now() - interval '3 days',
    now() - interval '2 days'
  );
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead3_id, review_uid, 'created', now() - interval '3 days');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead3_id, review_uid, 'replied', now() - interval '2 days');

  -- Lead 4: Won this month — with value
  lead4_id := gen_random_uuid();
  INSERT INTO public.leads (id, user_id, name, description, phone, state, source, value_cents, replied_at, closed_at, created_at, updated_at)
  VALUES (
    lead4_id, review_uid,
    'Pat Morgan',
    'Garbage disposal replacement',
    '+14155550104',
    'won', 'manual',
    35000,
    now() - interval '5 days',
    now() - interval '4 days',
    now() - interval '6 days',
    now() - interval '4 days'
  );
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead4_id, review_uid, 'created', now() - interval '6 days');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead4_id, review_uid, 'replied', now() - interval '5 days');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, metadata, created_at)
  VALUES (lead4_id, review_uid, 'won', '{"value_cents": 35000}', now() - interval '4 days');

  -- Lead 5: Lost this month — with reason
  lead5_id := gen_random_uuid();
  INSERT INTO public.leads (id, user_id, name, description, phone, state, source, lost_reason, replied_at, closed_at, created_at, updated_at)
  VALUES (
    lead5_id, review_uid,
    'Casey Williams',
    'Slab leak detection and repair',
    '+14155550105',
    'lost', 'email',
    'Competitor',
    now() - interval '8 days',
    now() - interval '7 days',
    now() - interval '9 days',
    now() - interval '7 days'
  );
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead5_id, review_uid, 'created', now() - interval '9 days');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, created_at)
  VALUES (lead5_id, review_uid, 'replied', now() - interval '8 days');
  INSERT INTO public.lead_events (lead_id, user_id, event_type, metadata, created_at)
  VALUES (lead5_id, review_uid, 'lost', '{"reason": "Competitor"}', now() - interval '7 days');

END $$;
