# NagLead — Going Live Checklist

Everything needed to go from "code works locally" to "real users paying money."

---

## 1. Domain

- [x] Buy `naglead.com` (Cloudflare)
- [x] In Vercel project settings → Domains → add `naglead.com` and `www.naglead.com`
- [x] Set DNS records at Cloudflare (DNS only, no proxy):
  - `A` record: `naglead.com` → Vercel IP
  - `CNAME` record: `www.naglead.com` → `cname.vercel-dns.com`
- [x] Verify SSL is active (Vercel handles this automatically)
- [x] Set up email forwarding: `hello@naglead.com`, `privacy@naglead.com`

---

## 2. Business Registration (Norway)

- [ ] Register business at altinn.no (Enkeltpersonforetak or AS)
- [ ] Get organization number from Bronnøysund Register
- [ ] Set up a Norwegian business bank account
- [ ] Update footer with business name + org number if required by law

---

## 3. Supabase — Run Migrations

Run these in the Supabase SQL Editor (all are idempotent, safe to re-run):

- [x] `20260404120000_initial_schema.sql` — users, leads, lead_events, RLS
- [ ] `20260404120001_pg_cron_nag_engine.sql` — uncomment + set project ref
- [x] `20260404120002_free_tier_limit.sql` — 5-lead DB trigger
- [x] `20260404120003_add_user_country.sql` — country column
- [ ] `20260404120004_pg_cron_weekly_summary.sql` — uncomment + set project ref
- [x] `20260404120005_web_push_subscriptions.sql` — web push table
- [x] `20260405120000_add_intake_alias.sql` — intake email aliases
- [x] `20260407120000_stripe_customer_fields.sql` — Stripe columns
- [ ] `20260407120001_pg_cron_stripe_sync.sql` — uncomment + set project ref
- [x] `20260407120002_add_webhook_token.sql` — cryptographic webhook tokens
- [x] `20260407120003_stripe_webhook_events.sql` — Stripe event idempotency
- [x] `20260407120004_signup_timezone_country.sql` — Auto-detect timezone/country on signup

---

## 4. Supabase — Deploy Edge Functions

```bash
supabase functions deploy nag-engine --no-verify-jwt
supabase functions deploy email-intake --no-verify-jwt
supabase functions deploy weekly-summary --no-verify-jwt
supabase functions deploy stripe-sync --no-verify-jwt
```

- [x] `email-intake` deployed and tested

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

- [x] `ANTHROPIC_API_KEY` set
- [x] `EMAIL_INTAKE_SECRET` set

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

- [x] Create Stripe account at stripe.com
- [x] Create two products + prices:
  - **Pro Monthly:** $10/month recurring
  - **Pro Annual:** $89/year recurring
- [x] Note the price IDs (`price_...`) for each
- [x] Set up webhook in Stripe Dashboard:
  - URL: `https://www.naglead.com/api/stripe/webhook`
  - Events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_failed`
  - Webhook signing secret (`whsec_...`) set in Vercel
- [ ] Enable Stripe Customer Portal in Dashboard → Settings → Billing → Customer portal
- [ ] Configure portal to allow: cancellation (at end of period), plan switching, payment method updates
- [x] Tested checkout flow in sandbox mode
- [ ] Switch to Stripe live keys when ready

---

## 8. Upstash Redis (Rate Limiting)

- [ ] Create free account at upstash.com
- [ ] Create a Redis database (choose closest region)
- [ ] Copy REST URL and REST Token
- [ ] Add to Vercel env vars (see step 10)

Rate limits in place:
- Webhook intake: 20 requests/hour per token
- Email intake: 30 leads/hour per user
- Stripe checkout: 5 requests/minute per user
- Account deletion: 1 request/hour per user
- Gracefully allows all requests if Redis is not configured

---

## 9. Cloudflare Email Routing (Email Intake)

- [x] In Cloudflare dashboard → `naglead.com` → Email → Email Routing → Enable
- [x] Set up business email forwarding (`hello@`, `privacy@`)
- [x] Deploy the Cloudflare Email Worker:
  ```bash
  cd cloudflare/email-worker
  npm install
  wrangler secret put EMAIL_INTAKE_SECRET
  wrangler secret put SUPABASE_EDGE_FUNCTION_URL
  wrangler secret put SUPABASE_ANON_KEY
  wrangler deploy
  ```
- [x] Enable catch-all on `naglead.com` → Send to Worker → `naglead-email-intake`
- [x] Set `EMAIL_INTAKE_SECRET` as Supabase edge function secret
- [x] Set `ANTHROPIC_API_KEY` as Supabase secret (for Claude email parsing)
- [x] Tested email intake end-to-end (email → Claude parsing → lead created)

---

## 10. Vercel — Environment Variables

Set all of these in Vercel project settings → Environment Variables:

```
# Supabase
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

- [x] `NEXT_PUBLIC_SUPABASE_URL` set
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [x] `SUPABASE_SERVICE_ROLE_KEY` set
- [x] `STRIPE_SECRET_KEY` set
- [x] `STRIPE_WEBHOOK_SECRET` set
- [x] `STRIPE_PRICE_ID_PRO_MONTHLY` set
- [x] `STRIPE_PRICE_ID_PRO_ANNUAL` set
- [x] `NEXT_PUBLIC_PAYMENTS_LIVE` set to `true`

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

- [x] Verify root directory is set to `web/` in Vercel project settings
- [x] Verify build command is `next build`
- [x] Verify output directory is `.next`
- [x] Trigger a fresh deploy after setting all env vars

---

## 13. Supabase — Auth Configuration

- [x] Set Site URL to `https://naglead.com`
- [x] Add redirect URLs: `https://naglead.com/**`, `https://www.naglead.com/**`
- [x] Customize email templates (confirm signup, reset password, magic link, change email, invite)

---

## 14. Go Live Sequence

Do these in order:

1. [x] Buy domain and configure DNS
2. [x] Wait for DNS propagation + SSL
3. [x] Verify the site loads at `naglead.com`
4. [x] Test signup flow end-to-end (create account, add lead)
5. [ ] Test Web Push notifications (allow notifications, wait for nag)
6. [x] Test email intake (forward an email to your intake address)
7. [x] Test Stripe in test mode (checkout, webhook, subscription update)
8. [ ] Switch to Stripe live keys
9. [x] Set `NEXT_PUBLIC_PAYMENTS_LIVE=true` in Vercel
10. [ ] Test a real $10 payment (refund yourself after)
11. [ ] Verify webhook receives the event and updates subscription status
12. [ ] Start posting on Reddit

---

## 15. Sentry (Error Tracking)

- [ ] Create free account at sentry.io
- [ ] Create a Next.js project, note the DSN
- [ ] Add to Vercel env vars:
  - `NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...`
  - `SENTRY_ORG=your-org`
  - `SENTRY_PROJECT=naglead`
  - `SENTRY_AUTH_TOKEN=sntrys_...` (for source map uploads)
- [x] SDK is already installed and configured (`@sentry/nextjs` + `@sentry/react-native`)
- [ ] Verify errors appear in Sentry dashboard after deploy

---

## 16. Post-Launch Monitoring

- [ ] Set up PostHog for product analytics (track signups, lead creation, upgrades)
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Monitor Upstash Dashboard for rate limit hits
- [ ] Check Supabase logs for Edge Function errors
- [ ] Watch Vercel function logs for webhook/API issues

---

## 17. Future Integrations (Post-MVP)

These are built but not wired, or planned but not built:

| Integration | Status | What's needed |
|---|---|---|
| **Cloudflare email intake** | Deployed and tested | **done** |
| **Twilio phone/SMS** | Planned, UI teaser in settings | Twilio account, phone number, Edge Function |
| **PostHog analytics** | Planned | PostHog account, add tracking script |
| **Sentry error tracking** | SDK installed in web + mobile | See step 15 |
| **Expo mobile app** | Built, needs dev builds | Apple Developer ($99/yr), Google Play ($25), EAS projectId |

---

## Quick Reference — All Accounts Needed

| Service | Cost | Status |
|---|---|---|
| Cloudflare (domain + email) | ~$9/yr | **done** |
| Stripe | Free (2.9% + $0.30 per txn) | **done** (sandbox) |
| Supabase | Free tier | **done** |
| Vercel | Free tier (upgrade to Pro $20/mo when taking payments) | **done** |
| Anthropic API | Pay-per-use (~$0.001/email) | **done** |
| Upstash Redis | Free tier (10k commands/day) | Not yet |
| Sentry | Free tier (5k errors/mo) | Not yet |
| Norwegian business (ENK or AS) | 0–2,000+ NOK | Not yet |
| Apple Developer | $99/yr | Not yet |
| Google Play Developer | $25 one-time | Not yet |

---

## Security Checklist

Verify before launch:

- [x] Webhook uses cryptographic token (not user ID)
- [x] Stripe webhook signature verification is active
- [x] Email intake shared secret set (`EMAIL_INTAKE_SECRET` in both Cloudflare Worker and Supabase)
- [x] Email intake rate limited (30 leads/hour per user)
- [x] Origin validation on Stripe checkout/portal redirects
- [ ] Rate limiting enabled (Upstash Redis configured)
- [x] Stripe webhook idempotency enabled (`stripe_webhook_events` table exists)
- [x] Duplicate subscription prevention in checkout endpoints
- [x] Service role key is server-only (not in any `NEXT_PUBLIC_` var)
- [x] `.env.local` is in `.gitignore` and never committed
- [x] RLS enabled on all tables (users, leads, lead_events, web_push_subscriptions)
- [x] Account deletion cancels Stripe subscription
- [x] Input sanitization on webhook payloads (HTML chars stripped, lengths capped)
- [x] Security headers configured in `next.config.ts` (X-Frame-Options, HSTS, etc.)
- [x] Input `maxLength` on all text fields (255 names, 1000 descriptions)
- [x] Mobile env vars throw on missing (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] EAS `projectId` set in `mobile/app.json` for push token registration
