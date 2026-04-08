# NagLead — Going Live Checklist

Everything needed to go from "code works locally" to "real users paying money."

---

## 1. Domain

- [ ] Buy `naglead.com` (Cloudflare, Namecheap, or Porkbun — ~$9/yr)
- [ ] In Vercel project settings → Domains → add `naglead.com` and `www.naglead.com`
- [ ] Set DNS records at your registrar:
  - `A` record: `naglead.com` → `76.76.21.21`
  - `CNAME` record: `www.naglead.com` → `cname.vercel-dns.com`
- [ ] Verify SSL is active (Vercel handles this automatically)

---

## 2. Business Registration (Norway)

- [ ] Register business at altinn.no (Enkeltpersonforetak or AS)
- [ ] Get organization number from Bronnøysund Register
- [ ] Set up a Norwegian business bank account
- [ ] Update footer with business name + org number if required by law

---

## 3. Supabase — Run Migrations

Run these in the Supabase SQL Editor (all are idempotent, safe to re-run):

- [ ] `20260404120000_initial_schema.sql` — users, leads, lead_events, RLS
- [ ] `20260404120001_pg_cron_nag_engine.sql` — uncomment + set project ref
- [ ] `20260404120002_free_tier_limit.sql` — 5-lead DB trigger
- [ ] `20260404120003_add_user_country.sql` — country column
- [ ] `20260404120004_pg_cron_weekly_summary.sql` — uncomment + set project ref
- [ ] `20260404120005_web_push_subscriptions.sql` — web push table
- [ ] `20260405120000_add_intake_alias.sql` — intake email aliases
- [ ] `20260407120000_stripe_customer_fields.sql` — Stripe columns
- [ ] `20260407120001_pg_cron_stripe_sync.sql` — uncomment + set project ref
- [ ] `20260407120002_add_webhook_token.sql` — cryptographic webhook tokens
- [ ] `20260407120003_stripe_webhook_events.sql` — Stripe event idempotency
- [ ] `20260407120004_signup_timezone_country.sql` — Auto-detect timezone/country on signup

---

## 4. Supabase — Deploy Edge Functions

```bash
supabase functions deploy nag-engine
supabase functions deploy email-intake
supabase functions deploy weekly-summary
supabase functions deploy stripe-sync
```

---

## 5. Supabase — Set Edge Function Secrets

```bash
# Anthropic (for email parsing)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Web Push
supabase secrets set VAPID_PUBLIC_KEY=BJfi2Uzz...
supabase secrets set VAPID_PRIVATE_KEY=P7ArqEDZ...
supabase secrets set VAPID_SUBJECT=mailto:hello@naglead.com

# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_PRICE_ID_PRO_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_ID_PRO_ANNUAL=price_...

# Email intake (shared secret with Cloudflare Email Worker)
supabase secrets set EMAIL_INTAKE_SECRET=...
```

---

## 6. Supabase — Enable pg_cron

- [ ] Go to Supabase Dashboard → Database → Extensions
- [ ] Enable `pg_cron` and `pg_net` extensions
- [ ] Run the cron migration SQL (uncommented versions) to schedule:
  - `nag-engine` — every 15 minutes
  - `weekly-summary` — hourly on Mondays
  - `stripe-sync` — every 6 hours

---

## 7. Stripe

- [ ] Create Stripe account at stripe.com (use your Norwegian business details)
- [ ] Create two products + prices:
  - **Pro Monthly:** $10/month recurring
  - **Pro Annual:** $89/year recurring
- [ ] Note the price IDs (`price_...`) for each
- [ ] Set up webhook in Stripe Dashboard:
  - URL: `https://naglead.com/api/stripe/webhook`
  - Events to listen for:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_failed`
  - Note the webhook signing secret (`whsec_...`)
- [ ] Enable Stripe Customer Portal in Dashboard → Settings → Billing → Customer portal
- [ ] Configure portal to allow: cancellation, plan switching, payment method updates
- [ ] Test in test mode first (`sk_test_...`, `whsec_test_...`) before going live

---

## 8. Upstash Redis (Rate Limiting)

- [ ] Create free account at upstash.com
- [ ] Create a Redis database (choose closest region)
- [ ] Copy REST URL and REST Token
- [ ] Add to Vercel env vars (see step 9)

Rate limits in place:
- Webhook intake: 20 requests/hour per token
- Stripe checkout: 5 requests/minute per user
- Account deletion: 1 request/hour per user
- Gracefully allows all requests if Redis is not configured

---

## 9. Cloudflare Email Routing (Email Intake)

- [ ] In Cloudflare dashboard → `naglead.com` → Email → Email Routing → Enable
- [ ] Add `leads.naglead.com` subdomain for email routing (Cloudflare auto-creates MX/SPF records)
- [ ] Deploy the Cloudflare Email Worker:
  ```bash
  cd cloudflare/email-worker
  npm install
  wrangler secret put EMAIL_INTAKE_SECRET        # generate a random secret
  wrangler secret put SUPABASE_EDGE_FUNCTION_URL  # https://<project-ref>.supabase.co/functions/v1/email-intake
  wrangler deploy
  ```
- [ ] In Email Routing → Routes → Create rule:
  - Match: `*@leads.naglead.com` (catch-all)
  - Action: Send to Worker → `naglead-email-intake`
- [ ] Set the same `EMAIL_INTAKE_SECRET` as a Supabase edge function secret:
  ```bash
  supabase secrets set EMAIL_INTAKE_SECRET=<same-secret-as-above>
  ```
- [ ] Set `ANTHROPIC_API_KEY` as Supabase secret (for Claude email parsing)
- [ ] Test by sending an email to your intake alias

---

## 10. Vercel — Environment Variables

Set all of these in Vercel project settings → Environment Variables:

```
# Supabase (already set)
NEXT_PUBLIC_SUPABASE_URL=https://fzedsixotdapeiztdjrf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJfi2Uzz...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...

# Upstash Redis (rate limiting — optional but recommended)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (error tracking — SDK installed, just add credentials)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=naglead
SENTRY_AUTH_TOKEN=sntrys_...

# Feature flag — flip to "true" when ready to accept payments
NEXT_PUBLIC_PAYMENTS_LIVE=false
```

---

## 11. Mobile App — Environment Variables

Set in `mobile/.env`:

```
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://fzedsixotdapeiztdjrf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Sentry (error tracking — optional but recommended)
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

Also set in `mobile/app.json` → `extra.eas.projectId` for push notifications.

---

## 12. Vercel — Deployment Settings

- [ ] Verify root directory is set to `web/` in Vercel project settings
- [ ] Verify build command is `next build`
- [ ] Verify output directory is `.next`
- [ ] Trigger a fresh deploy after setting all env vars

---

## 13. Go Live Sequence

Do these in order:

1. [ ] Buy domain and configure DNS
2. [ ] Wait for DNS propagation + SSL (up to 24h, usually minutes)
3. [ ] Verify the site loads at `naglead.com`
4. [ ] Test signup flow end-to-end (create account, add lead, get nagged)
5. [ ] Test Web Push notifications (allow notifications, wait for nag)
6. [ ] Test email intake (forward an email to your intake address)
7. [ ] Test Stripe in test mode first (`sk_test_...`, `whsec_test_...`)
8. [ ] Switch to Stripe live keys
9. [ ] Set `NEXT_PUBLIC_PAYMENTS_LIVE=true` in Vercel
10. [ ] Redeploy
11. [ ] Test a real $10 payment (refund yourself after)
12. [ ] Verify webhook receives the event and updates subscription status
13. [ ] Start posting on Reddit

---

## 14. Sentry (Error Tracking)

- [ ] Create free account at sentry.io
- [ ] Create a Next.js project, note the DSN
- [ ] Add to Vercel env vars:
  - `NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...`
  - `SENTRY_ORG=your-org`
  - `SENTRY_PROJECT=naglead`
  - `SENTRY_AUTH_TOKEN=sntrys_...` (for source map uploads)
- [ ] SDK is already installed and configured (`@sentry/nextjs`)
- [ ] Verify errors appear in Sentry dashboard after deploy

---

## 15. Post-Launch Monitoring

- [ ] Set up PostHog for product analytics (track signups, lead creation, upgrades)
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Monitor Upstash Dashboard for rate limit hits
- [ ] Check Supabase logs for Edge Function errors
- [ ] Watch Vercel function logs for webhook/API issues

---

## 16. Future Integrations (Post-MVP)

These are built but not wired, or planned but not built:

| Integration | Status | What's needed |
|---|---|---|
| **Cloudflare email intake** | Worker + Edge Function built, needs deployment | See step 9 |
| **Twilio phone/SMS** | Planned, UI teaser in settings | Twilio account, phone number, Edge Function |
| **PostHog analytics** | Planned | PostHog account, add tracking script |
| **Sentry error tracking** | SDK installed in web, needs credentials | See step 13 |
| **Expo mobile app** | Built, needs dev builds | Apple Developer ($99/yr), Google Play ($25), EAS projectId |

---

## Quick Reference — All Accounts Needed

| Service | Cost | Purpose |
|---|---|---|
| Domain registrar | ~$9/yr | naglead.com |
| Norwegian business (ENK or AS) | 0–2,000+ NOK | Legal entity for Stripe |
| Stripe | Free (2.9% + $0.30 per txn) | Payments |
| Supabase | Free tier | Database, auth, edge functions |
| Vercel | Free tier (upgrade to Pro $20/mo when taking payments) | Web hosting |
| Upstash Redis | Free tier (10k commands/day) | Rate limiting |
| Cloudflare Email Routing | Free (included with domain) | Email intake |
| Anthropic API | Pay-per-use (~$0.001/email) | Email parsing |
| Sentry | Free tier (5k errors/mo) | Error tracking |
| Apple Developer | $99/yr | iOS app (when ready) |
| Google Play Developer | $25 one-time | Android app (when ready) |

---

## Security Checklist

Verify before launch:

- [ ] Webhook uses cryptographic token (not user ID)
- [ ] Stripe webhook signature verification is active
- [ ] Email intake shared secret set (`EMAIL_INTAKE_SECRET` in both Cloudflare Worker and Supabase)
- [ ] Origin validation on Stripe checkout/portal redirects
- [ ] Rate limiting enabled (Upstash Redis configured)
- [ ] Stripe webhook idempotency enabled (`stripe_webhook_events` table exists)
- [ ] Service role key is server-only (not in any `NEXT_PUBLIC_` var)
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] RLS enabled on all tables (users, leads, lead_events, web_push_subscriptions)
- [ ] Account deletion cancels Stripe subscription
- [ ] Input sanitization on webhook payloads (HTML chars stripped, lengths capped)
- [ ] Security headers configured in `next.config.ts` (X-Frame-Options, HSTS, etc.) — **done**
- [ ] Input `maxLength` on all text fields (255 names, 1000 descriptions) — **done**
- [ ] Mobile env vars throw on missing (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) — **done**
- [ ] EAS `projectId` set in `mobile/app.json` for push token registration
