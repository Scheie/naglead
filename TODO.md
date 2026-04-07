# NagLead — Build Tracker

## Done

- [x] Landing page (AIDesigner → Next.js components)
- [x] Next.js project scaffold (TypeScript, Tailwind v4, App Router)
- [x] Design system (Teko + Work Sans fonts, orange/amber tokens, brutal shadows)
- [x] Supabase client setup (browser + server + proxy auth)
- [x] Database types + migration SQL (users, leads, lead_events, RLS, triggers)
- [x] Auth pages (login + 3-step signup onboarding)
- [x] Lead inbox dashboard (Reply Now / Waiting / Won / Lost sections)
- [x] Lead card with urgency indicators + contact actions (Call/Text/Email)
- [x] Add Lead modal (name + description + phone + email)
- [x] Snooze modal (1hr / tomorrow / 3 days / 1 week)
- [x] Monthly scorecard (win rate, avg reply time, follow-up rate, revenue)
- [x] Auth callback route
- [x] Proxy (auth redirects: /app protected, /login+/signup redirect if authed)

## To Do — Infrastructure

- [x] Create Supabase project + run migration SQL
- [x] Add real Supabase credentials to `.env.local`
- [x] Set up Supabase Auth (enable email + Apple Sign In providers)
- [x] Deploy to Vercel (connect repo, set env vars)
- [ ] Set up custom domain (naglead.com → Vercel)

## To Do — Nag Engine (Core Product)

- [x] Supabase Edge Function: nag engine (query leads, check intervals, send pushes)
- [x] pg_cron job: trigger nag engine every 15 minutes (migration ready, needs project ref)
- [x] Nag escalation logic (2hr gentle → 6hr medium → 24hr firm → 48hr urgent)
- [x] Quiet hours check (no nags between user's configured 9pm–7am)
- [x] Snooze resurfacing (snoozed leads reappear at snooze time)
- [x] Weekly summary notification (Monday morning)

## To Do — Lead Intake

- [x] Email intake Edge Function (Mailgun webhook + Claude API parsing)
- [ ] Mailgun inbound routing config (leads.naglead.com subdomain)
- [ ] Unique intake email per user (user@leads.naglead.com)
- [x] Web form webhook endpoint (POST /api/webhook?token=USER_ID)
- [ ] Raw text fallback parsing via Claude API

## To Do — Payments

- [x] Stripe integration: checkout flow + webhook for subscription status
- [x] Paywall enforcement (5-lead limit on free tier)
- [x] Upgrade prompt in-app when hitting free limit
- [x] Pro/Annual plan management (cancel, switch via Stripe Customer Portal)
- [x] Stripe sync fallback Edge Function (every 6h)

## To Do — Web App Polish

- [x] Wire landing page CTAs to /signup
- [x] Settings page (quiet hours, nag toggle, timezone, business name)
- [x] Lead history / activity log view
- [x] CSV export of leads (GDPR compliance)
- [x] Account deletion flow
- [x] Error/empty states polish
- [x] Loading skeletons
- [x] Toast notifications for actions (lead added, marked won, etc.)
- [x] Responsive polish for mobile web

## To Do — Legal

- [x] Privacy policy page (/privacy)
- [x] Terms of service page (/terms)

## To Do — Analytics & Monitoring

- [ ] PostHog setup (track lead creation, state transitions, nag interactions)
- [ ] Sentry error tracking

## To Do — Mobile App (Expo)

- [x] Expo project scaffold (TypeScript, React Navigation, Supabase)
- [x] Push notification setup (Expo Push → FCM/APNs)
- [x] Lead inbox screen (Reply Now / Waiting + pull to refresh)
- [x] Add lead flow (name + need + optional phone/email)
- [x] Done/Won/Lost actions on lead cards
- [x] Auth screens (login + signup)
- [x] Deep linking (naglead:// scheme for payment redirect)
- [x] Fonts via @expo-google-fonts packages
- [ ] Set EAS project ID in app.json
- [ ] Snooze action on leads
- [ ] Actionable notifications (Call directly from notification)
- [ ] App Store / Play Store submission

## To Do — Post-MVP

- [ ] Twilio phone number add-on (missed call capture)
- [ ] SMS auto-reply ("I'll call you back within an hour")
- [ ] Team inbox (2-3 users, $25/month)
- [ ] Referral system ("Give a month, get a month")
- [ ] SEO blog content
