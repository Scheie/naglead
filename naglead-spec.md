# NagLead — Full Product Specification

**"The app that won't shut up until you call your leads back."**

A dead-simple mobile lead tracker for solo service businesses. No CRM, no pipeline, no setup. Just a list of who's waiting for a reply and a relentless reminder system that makes sure you never forget.

**Domain**: `naglead.com` (available as of April 4, 2026)
**Tagline options**:
- "Stop losing leads. Start getting nagged."
- "Your leads are waiting. We won't let you forget."
- "The follow-up tool for people who hate CRMs."

---

## Table of Contents

1. [Why This Exists](#1-why-this-exists)
2. [Target Customer](#2-target-customer)
3. [Product Design](#3-product-design)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Model](#5-data-model)
6. [The Nag Engine](#6-the-nag-engine)
7. [Lead Intake Methods](#7-lead-intake-methods)
8. [Onboarding Flow](#8-onboarding-flow)
9. [Monetization](#9-monetization)
10. [Infrastructure & Costs](#10-infrastructure--costs)
11. [Build Plan](#11-build-plan)
12. [Go-To-Market](#12-go-to-market)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Legal & Compliance](#14-legal--compliance)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Metrics & Success Criteria](#16-metrics--success-criteria)
17. [What Not To Build](#17-what-not-to-build)
18. [Future Expansion](#18-future-expansion)

---

## 1. Why This Exists

### The evidence

Analysis of r/smallbusiness (978 comments, 200 posts) revealed:

- **"Getting customers / lead gen" was the #1 pain point** (284 mentions across all threads)
- But the root cause isn't marketing — it's follow-up. Small business owners already GET leads. They just **forget to respond** or **respond too late**
- Post: "I realised I was losing jobs just because I replied too late" (15 upvotes, 13 comments)
- Comment: "was losing leads in the gap between 'form submitted' and 'actually followed up' because I'd get distracted by other fires"
- Comment: "One spreadsheet for contacts. A notes app for follow-ups. Trello for active deals. Email for task reminders. A sticky note on your monitor. That's not a system."
- The ADHD thread (117 comments, +97 score) showed massive overlap with admin chaos — "I start the day thinking I'll crush it. Then I spend 3 hours reorganizing my desk and somehow forgot the actual work"
- Multiple comments about leads being scattered across: phone, email, text, Facebook DMs, voicemail, paper notes, memory

### The gap

There's an empty space in the market:

```
                  More Features
                      ↑
                      |
   Jobber ($39)       |      ServiceTitan ($245)
   Housecall Pro ($59)|
                      |
   Less Annoying ($15)|      Pipedrive ($14)
   noCRM.io ($12)     |      Close ($9+)
                      |
   ───────────────────┼──────────────────────
                      |
   NagLead ($10)      |      HubSpot Free
   ← EMPTY SPACE →   |      Streak Free
                      |
   Phone notes        |
   Spreadsheets       |
                      |
                      ↓
                  Fewer Features

   Solo Operators ◄───┼───► Teams
```

Nobody serves the person between "phone notes" and "Less Annoying CRM." Every "simple CRM" is still a CRM. NagLead isn't a CRM — it's a reminder system that happens to track leads.

---

## 2. Target Customer

### Primary persona: "Solo Steve"

- **Who**: Solo service business operator. Plumber, electrician, cleaner, landscaper, painter, handyman, locksmith, pest control, mobile mechanic, personal trainer, photographer
- **Business size**: Just him (maybe 1-2 casual helpers)
- **Revenue**: $50K-250K/year
- **Leads per week**: 5-30 via phone calls, texts, emails, Facebook messages, website forms
- **Current lead tracking**: Phone notes app, memory, scraps of paper, maybe a Google Sheet he updates sometimes
- **Tech comfort**: Uses iPhone/Android daily. Can text, email, use Facebook. Does NOT want to learn "software" or "set up a system"
- **Daily routine**: On job sites 7am-4pm. Checks phone between jobs. Does admin at home in the evening (reluctantly)
- **Average job value**: $200-2,000
- **Key frustration**: "I know I'm losing jobs because I forget to call people back. Last week a $1,500 job went to a competitor because I didn't reply for 2 days"

### Secondary personas

- **Freelance consultant**: Gets inbound leads via email/LinkedIn, needs to track who's in what stage. Currently uses a spreadsheet
- **Solo real estate agent**: Lots of leads from Zillow/Realtor.com, needs fast response. Currently uses a notes app
- **Home-based business owner**: Etsy seller, baker, crafter getting custom order requests via Instagram DMs and email

### Who this is NOT for

- Businesses with a sales team (they need a real CRM)
- E-commerce businesses (they need a storefront, not lead tracking)
- Anyone who already uses and likes their CRM
- Businesses with complex multi-stage sales processes (enterprise, B2B SaaS)

---

## 3. Product Design

### Three unbreakable design rules

1. **5-second rule**: Every core action (add lead, update status, start a call) must take < 5 seconds
2. **One-screen rule**: The lead inbox IS the app. No navigation menus, no settings pages you need to visit regularly, no dashboard with charts
3. **Nag-first rule**: The app's primary job is to send push notifications. If the user opens the app 0 times per day but responds to every nag notification, the product is succeeding

### The Lead Inbox (single screen)

```
┌─────────────────────────────────────────────────┐
│  NAGLEAD                           + Add lead   │
│  ─────────────────────────────────────────────── │
│                                                 │
│  🔴 REPLY NOW (3)                                │
│  ┌─────────────────────────────────────────────┐│
│  │ Sarah M.        bathroom reno    2 days ⚠️   ││
│  │ 📞 0412 555 123                              ││
│  │ [Call] [Text] [Done ✓] [Snooze ⏰]          ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ Mike T.         office cleaning   1 day      ││
│  │ 📧 mike@company.com                         ││
│  │ [Call] [Email] [Done ✓] [Snooze ⏰]         ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ Lisa K.         website inquiry   4 hrs      ││
│  │ 📞 0421 333 789                              ││
│  │ [Call] [Text] [Done ✓] [Snooze ⏰]          ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  🟡 WAITING (5)                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ John D.    sent quote $2,400     3 days      ││
│  │ Amy R.     estimate scheduled    Tomorrow     ││
│  │ Pete L.    follow up sent        1 day        ││
│  │ Anna S.    waiting on photos     5 days ⚠️    ││
│  │ Greg M.    thinking it over      2 days       ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  🟢 WON this month (3)              $5,850      │
│  ⚫ LOST this month (1)                          │
│                                                 │
│  ─────────────────────────────────────────────── │
│  Avg reply time: 3.2 hrs | Follow-up rate: 88% │
└─────────────────────────────────────────────────┘
```

### Lead card interactions

Each lead card has exactly 4 actions:

| Action | Tap behavior | Result |
|--------|-------------|--------|
| **Call / Text / Email** | Opens phone dialer, SMS, or email client with contact pre-filled | Lead stays in current state. Timestamp logged |
| **Done ✓** | Lead moves from "Reply Now" → "Waiting" (you replied). Or from "Waiting" → "Won" (they said yes) | Prompts for optional $ value when marking Won |
| **Snooze ⏰** | Quick options: 1 hour, tomorrow, 3 days, 1 week | Lead disappears from view, reappears at snooze time with a push notification |
| **Swipe left** | Mark as Lost | Moves to Lost. Prompts for optional reason (went with competitor / no budget / no response / other) |

### Add Lead flow (< 5 seconds)

```
┌──────────────────────────────┐
│  + New Lead                  │
│                              │
│  Name: [Sarah M.          ] │
│  Needs: [bathroom reno     ] │
│  Phone: [0412 555 123     ]  │  ← optional
│  Email: [                  ]  │  ← optional
│                              │
│  [Save]                      │
└──────────────────────────────┘
```

Two required fields (name, what they need), two optional (phone, email). That's it.

Keyboard opens immediately on the Name field. Save button is always visible (no scrolling). After save, returns to inbox with new lead at top of "Reply Now."

### Monthly scorecard (accessible via small stats bar at bottom of inbox)

```
┌──────────────────────────────────────────┐
│  APRIL 2026                              │
│                                          │
│  New leads:        12                    │
│  Won:              4     ($7,200)        │
│  Lost:             3                     │
│  Still active:     5                     │
│                                          │
│  Win rate:         57%                   │
│  Avg reply time:   3.2 hours             │
│  Follow-up rate:   88%                   │
│                                          │
│  Best month so far: Feb ($9,400)         │
└──────────────────────────────────────────┘
```

Not a full analytics suite. Just enough to answer: "Am I getting better at following up?"

---

## 4. Technical Architecture

### Overview

```
┌──────────────┐     ┌──────────────────────────┐
│              │     │       SUPABASE            │
│  Expo App    │◄───►│  - Auth (email + Apple)   │
│  (React      │     │  - PostgreSQL database    │
│   Native)    │     │  - Edge Functions         │
│              │     │  - Realtime subscriptions  │
└──────┬───────┘     └────────────┬─────────────┘
       │                         │
       │ Push notifications      │ Cron triggers
       │ (Expo Push / FCM/APNs)  │
       ▼                         ▼
┌──────────────┐     ┌──────────────────────────┐
│  User's      │     │  NAG ENGINE              │
│  Phone       │     │  (Supabase Edge Function  │
│              │     │   on pg_cron schedule)    │
└──────────────┘     └────────────┬─────────────┘
                                  │
                     ┌────────────┴─────────────┐
                     │                          │
              ┌──────▼──────┐          ┌────────▼────────┐
              │  Mailgun    │          │  Twilio         │
              │  (inbound   │          │  (phone number  │
              │   email     │          │   + SMS)        │
              │   parsing)  │          │                 │
              └─────────────┘          └─────────────────┘
                     ▲                          ▲
                     │                          │
              Forwarded emails          Missed calls / SMS
              from lead sources         from customers
```

### Stack decisions

| Component | Choice | Why | Alternative considered |
|-----------|--------|-----|----------------------|
| **Mobile framework** | Expo (React Native) | Cross-platform from day 1. Built-in push notification service. OTA updates without App Store review. Fast iteration | Flutter (good but smaller hiring pool), Native (too slow for MVP) |
| **Backend / DB** | Supabase | Free tier covers MVP (50K monthly active users, 500MB DB, 5GB bandwidth). Auth, PostgreSQL, Edge Functions, Realtime, and cron — all in one. Row-Level Security for data isolation | Firebase (vendor lock-in, NoSQL is wrong for relational lead data), custom Node + Postgres (more work, no free tier benefit) |
| **Push notifications** | Expo Push Notifications → FCM (Android) / APNs (iOS) | Free, built into Expo, handles token management. Expo acts as a unified push service | OneSignal (adds dependency), raw FCM/APNs (more setup) |
| **Nag scheduling** | Supabase `pg_cron` + Edge Functions | pg_cron runs inside the database on a schedule (e.g., every 15 minutes). Edge function checks which leads need nagging and sends pushes. No external scheduler needed | External cron service, AWS Lambda (adds infrastructure), BullMQ (overkill) |
| **Email intake** | Mailgun Inbound Routing | Receives forwarded emails at `leads@naglead.com`, parses content, triggers webhook to Supabase Edge Function. $0.80/1000 emails on free tier | Postmark (good but pricier), self-hosted (unreliable), SendGrid (works but Mailgun is better for inbound) |
| **AI for email parsing** | Claude API (Haiku) | Extract name, contact info, and need from forwarded lead emails. Haiku is cheap (~$0.001 per email parse) and fast | GPT-4o-mini (similar), regex (too fragile for varied email formats) |
| **Phone / SMS** | Twilio | Industry standard. Phone number: $1.15/month. Incoming SMS: $0.0079 each. Incoming voice: $0.0085/min. Outgoing SMS: $0.0079 each | Vonage (fine but less ecosystem), Telnyx (cheaper but less reliable) |
| **Web dashboard** | Next.js on Vercel | Minimal web view for reference. Not the primary interface. Free tier covers it | Not needed for MVP — could skip entirely |
| **Analytics** | PostHog (free tier) | Product analytics to track feature usage, funnel completion, retention. Free up to 1M events/month | Mixpanel (expensive), Amplitude (expensive), none (flying blind) |
| **Error tracking** | Sentry (free tier) | Crash reporting for mobile app. Free up to 5K errors/month | Bugsnag, none |

### Why Supabase over Firebase

For this specific product, Supabase wins because:

1. **PostgreSQL** — Lead data is relational (leads have states, timestamps, belong to users). SQL is natural here. Firestore's document model would require denormalization
2. **Row-Level Security** — Multi-tenant data isolation built into the database layer. Each user only sees their own leads without application-level filtering
3. **pg_cron** — The nag engine runs as a scheduled database function. No external scheduler
4. **Edge Functions** — Serverless functions for email parsing, SMS webhooks, and push notification dispatch. Deployed alongside the database
5. **Free tier is generous** — 50K MAU, 500MB database, 5GB bandwidth, 500K edge function invocations. Easily covers 0-1,000 users
6. **Pricing at scale** — Pro plan at $25/month covers most growth needs. Predictable

---

## 5. Data Model

### Core tables

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  trade text,                          -- 'plumber', 'cleaner', etc.
  business_name text,
  timezone text default 'America/New_York',
  nag_enabled boolean default true,
  nag_quiet_start time default '21:00', -- no nags after 9pm
  nag_quiet_end time default '07:00',   -- no nags before 7am
  push_token text,                      -- Expo push token
  created_at timestamptz default now(),
  subscription_status text default 'free' -- 'free', 'pro', 'pro_annual'
);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text not null,           -- "bathroom reno", "office cleaning"
  phone text,
  email text,
  state text not null default 'reply_now',  -- 'reply_now', 'waiting', 'won', 'lost'
  value_cents integer,                  -- job value in cents (nullable)
  lost_reason text,                     -- nullable, set when state = 'lost'
  source text default 'manual',         -- 'manual', 'email', 'sms', 'missed_call', 'webhook'
  snoozed_until timestamptz,            -- if snoozed, when to resurface
  last_nagged_at timestamptz,           -- prevent duplicate nags
  nag_count integer default 0,          -- escalation tracking
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  replied_at timestamptz,               -- when moved from reply_now → waiting
  closed_at timestamptz                 -- when moved to won or lost
);

-- Activity log (lightweight audit trail)
create table lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  event_type text not null,             -- 'created', 'called', 'texted', 'emailed',
                                        -- 'replied', 'snoozed', 'won', 'lost', 'nagged'
  metadata jsonb,                       -- flexible: { snooze_until, value, lost_reason, etc }
  created_at timestamptz default now()
);

-- Indexes
create index idx_leads_user_state on leads(user_id, state);
create index idx_leads_snoozed on leads(snoozed_until) where snoozed_until is not null;
create index idx_leads_nag on leads(user_id, state, last_nagged_at) where state in ('reply_now', 'waiting');
create index idx_events_lead on lead_events(lead_id, created_at);

-- Row-Level Security
alter table leads enable row level security;
create policy "Users can only see own leads"
  on leads for all
  using (user_id = auth.uid());

alter table lead_events enable row level security;
create policy "Users can only see own events"
  on lead_events for all
  using (user_id = auth.uid());
```

### Why this is simple enough

- **3 tables total**. Users, leads, events. That's it
- **No "contacts" table** — a lead IS a contact. No separation between "person" and "deal"
- **No "pipeline" table** — states are an enum on the lead, not a separate entity
- **No "tags" or "custom fields"** — description is a free-text field. That's your custom field
- **Events are append-only** — simple audit trail, useful for response time calculation and monthly scorecard

### Calculated metrics (derived, not stored)

```sql
-- Average reply time this month
select avg(replied_at - created_at) as avg_reply_time
from leads
where user_id = :uid
  and replied_at is not null
  and created_at >= date_trunc('month', now());

-- Win rate this month
select
  count(*) filter (where state = 'won') as won,
  count(*) filter (where state = 'lost') as lost,
  count(*) filter (where state = 'won')::float /
    nullif(count(*) filter (where state in ('won', 'lost')), 0) as win_rate
from leads
where user_id = :uid
  and closed_at >= date_trunc('month', now());

-- Monthly revenue
select coalesce(sum(value_cents), 0) / 100.0 as revenue
from leads
where user_id = :uid
  and state = 'won'
  and closed_at >= date_trunc('month', now());
```

---

## 6. The Nag Engine

This is the core of the product. Everything else is a container for the nag engine.

### How it works

A Supabase `pg_cron` job runs every 15 minutes. It calls an Edge Function that:

1. Queries all leads that need nagging (based on state, age, and last nag time)
2. Checks the user's quiet hours (no nags between 9pm-7am by default)
3. Checks snooze status (snoozed leads are skipped until their snooze expires)
4. Sends push notifications via Expo Push API
5. Updates `last_nagged_at` and `nag_count` on the lead

### Nag schedule

**For leads in "Reply Now" state:**

| Time since lead created | Nag message | Urgency |
|------------------------|-------------|---------|
| 2 hours | "📱 New lead waiting: [name] needs [description]" | Gentle |
| 6 hours | "⏰ [name] has been waiting 6 hours for a reply about [description]" | Medium |
| 24 hours | "⚠️ [name] — 1 day with no reply. This lead is going cold" | Firm |
| 48 hours | "🔴 [name] has waited 2 days. Call now or you'll lose this job" | Urgent |
| 72+ hours | "❌ [name] — 3 days, no reply. Mark as lost or call right now" | Final |

**For leads in "Waiting" state:**

| Time since last action | Nag message | Urgency |
|-----------------------|-------------|---------|
| 3 days | "🔄 Time to follow up with [name] about [description]" | Gentle |
| 7 days | "⏰ [name] hasn't replied in a week. Send a check-in?" | Medium |
| 14 days | "⚠️ [name] — 2 weeks silent. Follow up or mark as lost?" | Firm |

**Snoozed leads:**

| Snooze option | Behavior |
|--------------|----------|
| 1 hour | Reappears with push after 1 hour |
| Tomorrow morning | Reappears at 8am user's local time |
| 3 days | Reappears in 3 days at 9am |
| 1 week | Reappears in 7 days at 9am |

### Nag engine pseudo-code

```typescript
// Runs every 15 minutes via pg_cron → Edge Function

async function runNagEngine() {
  const now = new Date();

  // 1. Resurface snoozed leads
  await supabase
    .from('leads')
    .update({ snoozed_until: null, state: 'reply_now' })
    .lt('snoozed_until', now.toISOString())
    .not('snoozed_until', 'is', null);

  // 2. Find leads that need nagging
  const { data: leads } = await supabase
    .from('leads')
    .select('*, users!inner(push_token, nag_enabled, nag_quiet_start, nag_quiet_end, timezone)')
    .in('state', ['reply_now', 'waiting'])
    .is('snoozed_until', null)
    .eq('users.nag_enabled', true);

  for (const lead of leads) {
    const user = lead.users;

    // Skip if in quiet hours
    if (isQuietHours(now, user.timezone, user.nag_quiet_start, user.nag_quiet_end)) continue;

    // Determine if nag is due
    const nagInterval = getNagInterval(lead.state, lead.nag_count);
    const lastNag = lead.last_nagged_at ? new Date(lead.last_nagged_at) : new Date(lead.created_at);
    const timeSinceLastNag = now.getTime() - lastNag.getTime();

    if (timeSinceLastNag >= nagInterval) {
      const message = buildNagMessage(lead);

      // Send push
      await sendExpoPush(user.push_token, {
        title: message.title,
        body: message.body,
        data: { leadId: lead.id }
      });

      // Update lead
      await supabase
        .from('leads')
        .update({
          last_nagged_at: now.toISOString(),
          nag_count: lead.nag_count + 1
        })
        .eq('id', lead.id);

      // Log event
      await supabase
        .from('lead_events')
        .insert({
          lead_id: lead.id,
          user_id: lead.user_id,
          event_type: 'nagged',
          metadata: { nag_count: lead.nag_count + 1, message: message.body }
        });
    }
  }
}
```

### Push notification behavior

- Tapping the push notification opens the app directly to that lead's card
- "Call" action is available directly from the notification (iOS actionable notifications / Android notification actions) — user can call without even opening the app
- Badge count on app icon = number of leads in "Reply Now" state

---

## 7. Lead Intake Methods

### Method 1: Manual entry (always available)

Tap "+" → type name + need + optional contact. Done in 5 seconds.

### Method 2: Email forwarding (Pro tier)

Each user gets a unique intake email: `{username}@leads.naglead.com` or `leads+{userId}@naglead.com`

**How it works:**
1. User forwards any lead email to their intake address
2. Mailgun receives it, triggers webhook to Supabase Edge Function
3. Edge Function sends email body to Claude API (Haiku model) with prompt:

```
Extract from this email:
- Contact name (first + last if available)
- Phone number (if present)
- Email address (if present, not the sender's forwarding address)
- What they need (1 short sentence)

Return JSON: { name, phone, email, description }
If any field is unclear, return null for that field.
```

4. Edge Function creates lead in "Reply Now" with source = 'email'
5. User gets push notification: "New lead from email: [name] — [description]"

**Cost per email parsed**: ~$0.001 (Haiku) + $0.0008 (Mailgun) ≈ $0.002 per email

### Method 3: Web form webhook (Pro tier)

A webhook URL: `https://api.naglead.com/webhook/{user_token}`

User pastes this into any form builder (WordPress Contact Form 7, Typeform, Google Forms via Zapier, Wix, Squarespace). The webhook accepts:

```json
POST /webhook/{user_token}
{
  "name": "Sarah M.",
  "email": "sarah@example.com",
  "phone": "0412555123",
  "message": "I need a bathroom renovation, 2-bedroom house in Carlton"
}
```

If the form doesn't send structured fields, accept raw text and use Claude to parse it (same as email).

### Method 4: Missed call capture (add-on, post-MVP)

User gets a Twilio phone number. They can either:
- Use it as their business number (forward their existing number to it)
- Or use it as a tracking number on specific ads/flyers

When a call comes in:
- If answered: no action
- If missed: caller ID → create lead in "Reply Now" with phone number, source = 'missed_call'
- User gets push: "Missed call from 0412 555 123 — tap to call back"

**Cost**: $1.15/month for number + $0.0085/min incoming voice + $0.0079/SMS

### Method 5: SMS intake (add-on, post-MVP)

Same Twilio number. Incoming SMS auto-creates a lead with the message body as description. Claude parses name/need from the message text.

---

## 8. Onboarding Flow

Must complete in under 60 seconds. No tutorials, no feature tours, no "Getting Started" checklists.

```
Screen 1: "What's your name?"
  [Name field]
  [Next]

Screen 2: "What's your trade?"
  [Grid of trade icons: Plumber / Electrician / Cleaner /
   Landscaper / Painter / Handyman / Photographer /
   Consultant / Other]

Screen 3: "Enable notifications — this is how NagLead works"
  [System push notification permission dialog]
  (If denied: "NagLead can't nag you without notifications.
   That's literally our entire job. Please enable them.")

Screen 4: "Add your first lead"
  [Name field]
  [What do they need?]
  [Phone or email]
  [Save — you're done!]

→ Opens directly to inbox with that lead in "Reply Now"
```

No email verification wall. No credit card on signup. No feature tour. Sign up → add lead → get nagged. Under 60 seconds.

---

## 9. Monetization

### Pricing tiers

| | Free | Pro ($10/mo) | Pro Annual ($89/yr) |
|---|------|-------------|-------------------|
| Active leads | 5 max | Unlimited | Unlimited |
| Manual lead entry | ✅ | ✅ | ✅ |
| Nag notifications | ✅ | ✅ | ✅ |
| Call/text from app | ✅ | ✅ | ✅ |
| Email forwarding intake | ❌ | ✅ | ✅ |
| Web form webhook | ❌ | ✅ | ✅ |
| Monthly scorecard | Basic | Full (revenue, win rate, response time) | Full |
| Snooze options | Tomorrow only | 1hr / tomorrow / 3d / 1wk | All |
| Lead history | Current month | 12 months | 12 months |

### Why $10/month

- Target customer's average job: $200-2,000. One saved lead per month = 20-200x ROI
- Below psychological threshold — an impulse purchase, less than a lunch
- Below Less Annoying CRM ($15) and noCRM ($12) — both have far more features. We're not competing on features, we're competing on simplicity
- Low enough that churn from "this is too expensive" is minimal
- High enough to be a real business: 1,000 users = $10K MRR = $120K ARR

### Free tier strategy

The 5-lead limit is carefully chosen:
- Enough to experience the nag system working (you'll get nagged about 5 leads for sure)
- Not enough to run a business on (most solos have 10-30 active leads)
- The moment NagLead saves you one lead, you'll pay $10 not to lose the next one
- Free users are marketing: they tell other tradespeople about "this annoying app that won't stop reminding me to call people back"

### Payment processing

Stripe via Expo in-app purchases or direct Stripe Checkout:
- In-app purchase: Apple/Google take 30% (effectively making $10 → $7). Painful but may be required for iOS
- Stripe Checkout (web): user taps "Upgrade" → opens Stripe web checkout → no platform fee beyond Stripe's 2.9% + $0.30
- **Strategy**: Use Stripe Checkout linked from the app (not in-app purchase) to avoid the 30% tax. Apple may enforce in-app purchase for digital goods — monitor their policies. Many apps navigate this by having the "upgrade" link go to a web page

### Revenue per add-on (post-MVP)

| Add-on | Price | Margin |
|--------|-------|--------|
| Dedicated phone number (missed call capture) | +$5/month | ~$3.50 after Twilio costs |
| SMS auto-reply ("I'll call you back within an hour") | +$5/month | ~$4 after SMS costs |
| Team inbox (2-3 users) | $25/month total | High margin |

---

## 10. Infrastructure & Costs

### Cost at various scales

| Scale | Supabase | Mailgun | Twilio | Claude API | Expo | Vercel | PostHog | Total |
|-------|---------|---------|--------|-----------|------|--------|---------|-------|
| 0-500 users | Free | Free tier | $20 | $5-10 | Free | Free | Free | **~$25-30/mo** |
| 500-2,000 users | $25/mo | $15/mo | $30 | $20-40 | Free | Free | Free | **~$90-110/mo** |
| 2,000-5,000 users | $25/mo | $35/mo | $50 | $50-100 | Free | $20 | Free | **~$180-230/mo** |
| 5,000-10,000 users | $100/mo (Team) | $75/mo | $100 | $100-200 | Free | $20 | $0-350 | **~$395-845/mo** |

**The unit economics are excellent.** At 1,000 paying users ($10K MRR), infrastructure costs ~$100/month. That's 99% gross margin.

### Cost per user

| Scale | Infra cost/user/month | Revenue/user/month | Margin |
|-------|----------------------|-------------------|--------|
| 500 users | $0.05 | $10.00 | 99.5% |
| 2,000 users | $0.05-0.06 | $10.00 | 99.4% |
| 10,000 users | $0.04-0.08 | $10.00 | 99.2% |

The only costs that scale linearly with users are Claude API (email parsing) and Twilio (if using phone features). Both are pennies per user per month.

---

## 11. Build Plan

### Week 1: Core app + lead management

| Day | Deliverable |
|-----|-------------|
| 1 | Expo project scaffold. Supabase project. Auth setup (email + Apple Sign In). Database schema |
| 2 | Lead data layer: CRUD operations via Supabase client. Row-Level Security policies |
| 3 | Lead inbox UI: the single screen. Lead cards with state indicators and time-since |
| 4 | Add Lead flow (< 5 second target). Name + description + optional contact |
| 5 | Lead actions: tap to call/text/email (open native dialer/SMS/email). Done button (state transition). Swipe to mark lost |
| 6 | Snooze flow: bottom sheet with time options. Snoozed_until field. Snooze indicator on card |
| 7 | Polish, edge cases, basic error handling. Test on real device (both iOS and Android) |

### Week 2: Nag engine + email intake

| Day | Deliverable |
|-----|-------------|
| 8 | Push notification setup: Expo push tokens, registration flow, permissions |
| 9 | Nag engine v1: Supabase Edge Function triggered by pg_cron every 15 min. Query leads, check intervals, send pushes |
| 10 | Nag escalation logic: gentle → medium → firm → urgent. Quiet hours. Snooze awareness |
| 11 | Tappable notifications: open app to specific lead. "Call" action from notification |
| 12 | Mailgun inbound routing setup. Edge function for email webhook. Claude API integration for email parsing |
| 13 | Email intake end-to-end: forward email → lead appears in inbox → push notification sent |
| 14 | Weekly summary notification (Monday morning). Monthly scorecard screen |

### Week 3: Payment + polish + launch

| Day | Deliverable |
|-----|-------------|
| 15 | Stripe integration: checkout flow, webhook for subscription status, paywall enforcement (5 lead limit on free) |
| 16 | Onboarding flow (4 screens, < 60 seconds). First-lead creation during onboarding |
| 17 | Webhook endpoint for web form intake. Basic documentation page |
| 18 | Landing page (Next.js on Vercel): hero, demo GIF, pricing, signup CTA |
| 19 | App Store / Play Store: screenshots, description, submission. TestFlight for beta testers |
| 20 | PostHog analytics setup: track lead creation, state transitions, nag interactions, conversion |
| 21 | Bug fixes, final testing, soft launch to 10-20 beta users from Reddit |

### Post-launch priorities (weeks 4-8)

1. Beta feedback integration and bug fixes
2. Twilio phone number add-on (missed call capture)
3. SMS auto-reply feature
4. App Store Optimization (screenshots, keywords)
5. First trade-specific marketing campaign
6. Referral system ("Give a month, get a month")

---

## 12. Go-To-Market

### The customer is NOT on Product Hunt

Tradespeople and solo service operators are on:
- **Trade-specific Facebook groups** ("Plumbers of [City]", "Cleaning Business Owners", "Electricians United") — hundreds of groups with 1K-50K members each
- **Trade subreddits** (r/plumbing 130K members, r/electricians 200K+, r/HVAC 100K+, r/lawncare 300K+, r/CleaningTips 900K+)
- **YouTube** (watching trade tutorials, business advice)
- **Google** (searching "how to get more plumbing customers", "best app for contractor leads")
- **Local business networks** (BNI, Chamber of Commerce, trade association meetings)

### Phase 1: Reddit seeding (weeks 1-2 post-launch)

Post genuinely in r/smallbusiness and 2-3 trade subreddits:

> "I'm a developer who kept hearing from tradespeople that they lose jobs because they forget to call leads back. So I built a $10/month app that just nags you. No CRM, no pipeline stages, no setup. Just a list of who's waiting and notifications that won't leave you alone until you respond. Looking for 10-20 plumbers/cleaners/electricians to try it free for a month and tell me if it's useful or if I'm an idiot."

This works because:
- It's honest and specific (not "check out my amazing AI-powered platform")
- It offers free access (low risk for them)
- It asks for their input (people love giving feedback)
- The "nag" framing is memorable and funny

**Goal**: 20-50 beta users, 5-10 detailed feedback conversations

### Phase 2: One trade, deep (months 1-3)

Pick the trade with best beta engagement. Likely **residential cleaning** because:
- Highest lead volume (people request quotes constantly)
- Simplest job scoping (less complex than plumbing/electrical)
- Large number of solo operators
- Very active Facebook groups

Join 5-10 cleaning business Facebook groups. Spend 2 weeks providing genuine value (answering questions about business operations, sharing relevant tips). Then share NagLead when it's naturally relevant to a conversation about lead management.

**Goal**: 100 users, 50 paying ($500 MRR)

### Phase 3: Content marketing / SEO (months 2-6)

Write blog posts targeting long-tail, low-competition keywords:

| Target keyword | Blog post title | Search volume (est.) |
|---------------|-----------------|---------------------|
| "how to follow up with cleaning leads" | "The 48-Hour Rule: Why Your Cleaning Leads Are Choosing Your Competitor" | Low but uncontested |
| "plumber lead management" | "How Solo Plumbers Track Leads Without a CRM (And Why Spreadsheets Fail)" | Low but uncontested |
| "best app for contractor follow up" | "I Tested 7 Lead Tracking Methods as a Solo Contractor. Here's What Worked" | Medium, some competition |
| "losing customers not calling back" | "The Hidden Cost of Slow Follow-Up for Service Businesses" | Low |
| "simple lead tracking app" | "Why Every 'Simple' CRM Is Still Too Complicated for Solo Operators" | Medium |

These keywords have almost zero competition from CRM companies — HubSpot writes about "sales pipeline optimization," not "how to remember to call the lady about the bathroom reno."

**Goal**: 500-1,000 organic visitors/month by month 6

### Phase 4: Referral loop (month 3+)

In-app referral: "Know another tradie? Give them a free month, get a free month."

Tradespeople talk to each other constantly — at supply houses, job sites, trade events. Word of mouth in trade communities is powerful.

**Goal**: 20-30% of new users from referrals by month 6

### Phase 5: YouTube (month 4+)

Short videos (60-90 seconds), testimonial format:
- "I was losing 3 leads a week. Here's what I changed."
- "This $10 app saved me a $3,000 job."
- Authentic, phone-recorded, real users talking

Target: people watching "how to grow my cleaning business" or "plumber business tips" videos.

### What NOT to do

- Don't buy Google Ads for "CRM" — HubSpot/Salesforce will outbid you 100:1
- Don't launch on Product Hunt — wrong audience
- Don't try to be on every social platform — pick one trade, one channel
- Don't hire a marketing agency — the authentic indie-dev-talking-to-tradespeople angle is more effective
- Don't offer lifetime deals (LTDs) on AppSumo — attracts deal hunters, not real users

---

## 13. Competitive Landscape

### Direct competitors

| Tool | Price | Positioning | Why NagLead wins | Why they win |
|------|-------|-------------|-----------------|-------------|
| **Less Annoying CRM** | $15/mo | "A simple CRM for small businesses" | We're simpler. No pipeline, no contacts, no calendar. $5 cheaper | They have 15 years of trust, features, and SEO |
| **noCRM.io** | $12-32/mo | "Lead management, not CRM" | Same philosophy but we go further in simplicity. Mobile-first vs web-first. Cheaper | They have team features, more integrations |
| **OnePageCRM** | $9.95/mo | "Action-focused CRM" | Similar price, but we have fewer concepts to learn. Their "Next Action" is close to our nag system | They have a mature product with years of development |
| **Bigin (Zoho)** | $7/mo | "Pipeline-centric CRM for small business" | We don't require pipeline thinking at all | Cheapest in category, Zoho ecosystem |

### Indirect competitors (what people actually use)

| Tool | Price | Why people use it | Why they switch to NagLead |
|------|-------|-------------------|--------------------------|
| **Phone notes / memory** | Free | Zero friction | Loses leads. NagLead adds nag without much friction |
| **Google Sheets** | Free | Familiar, customizable | No push notifications, no auto-nag |
| **HubSpot Free** | Free | Powerful, free | Too complex, requires training |
| **Notion** | Free-$8/mo | Flexible, trendy | No push notifications, requires setup |

### Indirect competitors (field service tools)

| Tool | Price | What they do | Why NagLead is different |
|------|-------|-------------|------------------------|
| **Jobber** | $39/mo | Full platform: CRM + scheduling + invoicing + quoting | NagLead is 1/10th the features at 1/4th the price. For people who aren't ready for Jobber yet |
| **Housecall Pro** | $59/mo | Same as Jobber | Same positioning difference |
| **ServiceTitan** | $245/mo | Enterprise field service | Completely different market |

### NagLead's positioning statement

"NagLead is not a CRM. It's the thing you use BEFORE you're ready for a CRM. It's for the solo operator who tracks leads in their head and loses money every week because they forget to follow up. When you outgrow NagLead, we'll congratulate you and recommend Jobber."

This positioning is powerful because:
- It disarms the "why not use a real CRM?" objection
- It's honest about scope
- It creates goodwill (we'll help you graduate)
- It defines the category clearly (pre-CRM)

---

## 14. Legal & Compliance

### App Store requirements

**Apple App Store:**
- Requires Apple Developer Program membership: $99/year
- Review process: 1-7 days typically
- In-app purchase policy: Apple may require in-app purchase for digital subscriptions (30% cut in year 1, 15% in year 2+). Can apply for Small Business Program (15% if <$1M revenue)
- Alternative: Link to web-based Stripe checkout. Apple's rules are evolving — the EU Digital Markets Act and recent court rulings may allow external payment links. Monitor carefully
- Privacy nutrition labels: Must declare data collection (email, phone number, usage analytics)

**Google Play Store:**
- Requires Google Play Developer account: $25 one-time
- Review process: typically 1-3 days
- Google also takes 15-30% of in-app purchases. Same web checkout strategy can apply
- Data safety section required

### Privacy / GDPR / data handling

**What data we collect:**
- User: email, name, trade, business name
- Leads: name, phone, email, description, state, value
- Events: timestamps, action types
- Analytics: anonymized usage data (PostHog)

**GDPR considerations (relevant if any EU users):**
- NagLead is a data processor for the user's lead data
- Privacy policy must explain: what data, why, how long, user rights
- Users must be able to export their data (simple CSV export of leads)
- Users must be able to delete their account and all data
- Lead data belongs to the user, not to NagLead — we never sell or share individual lead data

**CAN-SPAM / communications:**
- NagLead sends push notifications, not emails/SMS (to the user's own device). CAN-SPAM doesn't apply to push notifications
- If we add SMS auto-reply to leads: the user is sending the SMS via their business number, not NagLead. We're the tool, they're the sender. But should add terms clarifying this

**Minimal legal requirements for launch:**
- Privacy Policy (host on naglead.com/privacy)
- Terms of Service (host on naglead.com/terms)
- Both required by App Store and Play Store

**Recommended**: Use a template from Termly, iubenda, or similar for privacy policy generation. Budget ~$20-50/month or generate once and host statically.

### Financial compliance

NagLead is NOT a financial service. We don't:
- Process payments on behalf of users (Stripe handles our own billing)
- Move money between users and their clients
- Provide financial advice
- Store credit card information (Stripe does)

No financial licenses required.

---

## 15. Risks & Mitigations

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|-----------|--------|------------|
| **"I can use a spreadsheet for this"** | High | High | Users don't convert from free | Marketing must focus on "you CAN, but you DON'T" — emphasize the nag value, not data storage. Testimonials from people who lost jobs using spreadsheets |
| **Feature creep (adding CRM features)** | High | Very High | Lose the simplicity advantage, become a bad Less Annoying CRM | Write down the "What Not To Build" list (Section 17) and refer to it monthly. Every feature request gets evaluated against the 3 design rules |
| **Apple forces 30% IAP cut** | Medium | Medium | Effective revenue per user drops from $10 to $7 | Use web-based Stripe checkout where possible. Apply for Small Business Program (15%). Monitor DMA/court ruling changes. Price at $10 anyway — margin is still excellent |
| **User nag fatigue** | Medium | Medium | Users disable notifications = product stops working | Configurable nag intensity (gentle/normal/aggressive). Smart nag timing (not during likely job hours). Snooze as escape valve. Quiet hours. Never nag about snoozed leads |
| **Slow growth (trade communities are slow)** | Medium | High | Takes 12-18 months to hit $10K MRR instead of 3-6 | Plan for slow growth. Keep costs near-zero. Don't hire until $5K MRR. This is a marathon, not a sprint |
| **Less Annoying CRM adds a "lite mode"** | Medium | Low | Closest competitor gets even simpler | They've been 1 product for 15 years. Simplifying risks alienating their power users. Our focus is narrower |
| **Another indie dev copies it** | Low | Medium | Competition in same niche | Speed matters. Community matters more — the first tool that trade Facebook groups recommend becomes the default. Brand > code |
| **Twilio costs at scale (phone features)** | Low | Low | Phone number add-on becomes unprofitable | Keep phone features as paid add-on. Negotiate volume pricing. Consider alternatives (Telnyx) at scale |
| **Supabase has outage** | Low | Low | App is down, nags don't send | Supabase has 99.9% SLA on Pro. Add basic error alerting. Missed nags are recoverable (just delayed). Not life-critical |

---

## 16. Metrics & Success Criteria

### Core metrics to track from day 1

| Metric | What it measures | Target |
|--------|-----------------|--------|
| **Leads created / user / week** | Are people actually using it? | >3 leads/week for active users |
| **Nag → action rate** | Do nag notifications lead to calls/texts? | >40% of nags result in a lead action within 1 hour |
| **Time to first lead** | Onboarding effectiveness | <2 minutes from signup |
| **Free → Pro conversion** | Monetization | >10% within 30 days |
| **Monthly churn (Pro)** | Retention | <5% monthly |
| **Weekly active users / total users** | Engagement health | >60% |
| **Average response time** | Product impact — are users actually following up faster? | Trending down over first month of use |

### Milestones

| Milestone | When | Criteria |
|-----------|------|---------|
| **MVP launch** | Week 3 | 10-20 beta users from Reddit |
| **Product-market signal** | Month 1 | 5+ users who would be "very disappointed" without NagLead (Sean Ellis test) |
| **First paying user** | Month 1 | Someone pays $10 willingly |
| **50 paying users** | Month 3 | $500 MRR. Validates the model |
| **Ramen profitable** | Month 6-9 | Revenue covers infrastructure + $2K/month personal draw |
| **200 paying users** | Month 6 | $2K MRR. Time to double down on marketing |
| **1,000 paying users** | Month 12-18 | $10K MRR. Consider hiring part-time marketer |
| **Default tool in one trade** | Month 12-18 | NagLead is the standard recommendation in 3+ cleaning/plumbing Facebook groups |

---

## 17. What Not To Build

This list is as important as the feature spec. Refer to it every time a user requests a feature.

**NEVER build:**
- ❌ Custom fields on leads
- ❌ Multiple pipeline stages (beyond the 4 fixed states)
- ❌ Deal probability / forecasting
- ❌ Contact management (separate from leads)
- ❌ Email marketing / newsletter / drip campaigns
- ❌ Invoicing / payment collection
- ❌ Scheduling / calendar integration
- ❌ Quoting / estimating tools
- ❌ Team management beyond basic sharing
- ❌ Reporting dashboards with charts and graphs
- ❌ Custom workflow automation
- ❌ AI "insights" or "recommendations"
- ❌ Integrations marketplace
- ❌ Desktop app
- ❌ White-label / agency mode
- ❌ API for third-party developers

**Why**: Every one of these features exists in a dozen competing tools. The moment you add custom fields, you're a worse Pipedrive. The moment you add invoicing, you're a worse Jobber. The moment you add email campaigns, you're a worse Mailchimp.

NagLead wins by being less. Every feature you don't build is a feature you don't have to support, document, debug, or explain.

**The correct response to "Can you add invoicing?":**
"NagLead is a lead tracker, not an invoicing tool. We recommend Wave (free) or Stripe Invoicing for that. We'll never add invoicing because it would make NagLead worse at the one thing it does well."

---

## 18. Future Expansion

Things that are OK to build eventually, because they serve the core mission (helping solo operators follow up on leads):

### Phase 2 (months 3-6)
- **Phone number add-on**: Twilio number for missed call → lead capture (+$5/month)
- **SMS auto-reply**: Automatic "I'll call you back within the hour — [Name]" when a call is missed or SMS received (+$5/month)
- **Snooze improvements**: "Snooze until I leave this location" (GPS-based, for when you're on a job site)

### Phase 3 (months 6-12)
- **Team inbox**: 2-3 users sharing leads. Simple assignment: "This one's yours." $25/month total
- **Lead source tracking**: "Where did this lead come from?" (Google, Facebook, referral, flyer, repeat customer). Monthly scorecard shows which sources produce the most wins
- **Quick quote**: Not a full quoting tool. Just: attach a $ range to a lead when replying. "Bathroom reno for Sarah: $2,000-3,500." Helps with the monthly revenue scorecard

### Phase 4 (months 12+)
- **Trade-specific templates**: Pre-filled qualification questions by trade. Plumber lead → auto-prompts: "What's the issue? House or apartment? Urgency?"
- **Referral program infrastructure**: "Sarah referred Mike → tag the lead source automatically"
- **Widget for website**: "Request a quote" form that feeds directly into NagLead. Free for Pro users. Replaces Contact Form 7 for simple service businesses
- **Nordic expansion**: Rebrand/localize for Norwegian market (overlap with the r/Norge research). "NagLead for Håndverkere"

### What triggers the decision to expand
- Only build Phase 2 features when Pro churn stabilizes below 5%
- Only build Phase 3 features when there are 500+ paying users requesting team features
- Only build Phase 4 features when there's clear evidence from data (source tracking) that specific expansions would increase win rate
- NEVER build expansion features to acquire new users — only to retain and delight existing ones
