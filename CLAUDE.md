# Project: NagLead

"The app that won't shut up until you call your leads back." A dead-simple lead tracker and reminder system for solo service businesses. Not a CRM — a nag engine.

**Domain:** naglead.com

## Tech Stack

### Web App (`web/`)
- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS v4
- **Fonts:** Teko (headings) + Work Sans (body)
- **Design:** Orange/amber tokens, brutal shadows, dark mode
- **Testing:** Vitest
- **Deployment:** Vercel (root directory: `web/`)

### Backend & Database (`supabase/`)
- **Platform:** Supabase (PostgreSQL, Auth, Edge Functions, pg_cron)
- **Edge Functions:** Deno runtime (TypeScript, imports from `https://esm.sh/`)
- **Migrations:** SQL files in `supabase/migrations/`
- **Push notifications:** Expo Push API (mobile) + Web Push API (desktop)
- **Email parsing:** Claude API (Haiku) via Edge Function
- **Testing:** `deno test` for shared modules

### Infrastructure
- **Hosting:** Vercel (web), Supabase (backend)
- **Email intake:** Cloudflare Email Workers → Supabase Edge Function
- **Phone/SMS:** Twilio (post-MVP)
- **Analytics:** PostHog (planned)
- **Error tracking:** Sentry (@sentry/nextjs + @sentry/react-native)
- **Payments:** Stripe (planned, gated by `NEXT_PUBLIC_PAYMENTS_LIVE` env var)

## Data Model

**3 core tables:** `users`, `leads`, `lead_events`

- **Lead states:** `reply_now`, `waiting`, `won`, `lost`
- **Lead sources:** `manual`, `email`, `sms`, `missed_call`, `webhook`
- **Event types:** `created`, `called`, `texted`, `emailed`, `replied`, `snoozed`, `won`, `lost`, `nagged`
- **Free tier:** 5 active leads max (enforced by DB trigger)
- **Intake aliases:** Memorable adjective-noun combos (e.g. `brave-falcon@leads.naglead.com`)

## Project Structure

```
naglead/
  CLAUDE.md                         — This file
  TODO.md                           — Build tracker
  GOING-LIVE.md                     — Production deployment checklist
  cloudflare/
    email-worker/                   — Cloudflare Email Worker (routes *@leads.naglead.com)
  naglead-spec.md                   — Full product specification
  supabase/
    config.toml
    migrations/                     — Idempotent SQL migrations
    functions/
      _shared/                      — Shared modules + tests
        nag-schedule.ts             — Quiet hours, nag escalation logic
        weekly-message.ts           — Weekly summary message builder
        resolve-user.ts             — Email recipient → user resolution
        web-push.ts                 — RFC 8291 Web Push encryption
        *_test.ts                   — Deno tests for each module
      nag-engine/index.ts           — pg_cron: nag reminders (Expo + Web Push)
      email-intake/index.ts         — Mailgun webhook: parse emails → leads
      weekly-summary/index.ts       — pg_cron: Monday morning summary push
  web/
    AGENTS.md                       — Next.js version-specific rules
    src/
      app/                          — Next.js App Router pages
        app/                        — Protected app pages (inbox, settings)
        api/                        — API routes (webhook, account deletion)
        (legal)/                    — Privacy, terms, refunds pages
      components/
        app/                        — App UI (LeadInbox, LeadCard, modals, etc.)
        landing/                    — Landing page sections
      lib/
        supabase/                   — Supabase client (browser, server, middleware)
        database.types.ts           — TypeScript types for all tables
        webhook-parser.ts           — Extract name/phone/email from webhook payloads
        export-csv.ts               — CSV export for leads
        notifications.ts            — Browser notifications + Web Push subscription
        intake-alias.ts             — Adjective-noun email alias generator
        country-codes.ts            — Phone codes, currency, formatting
```

## Code Conventions

These rules apply to ALL code written or modified in this project. Follow them without being asked.

### Documentation

- **Always update `TODO.md` when completing a feature** — check off the item.
- Do NOT create README files or documentation unless explicitly asked.

### Code Comments

- Add comments only where the logic isn't self-evident — explain the "why", not the "what".
- Focus on: domain-specific logic (nag schedules, escalation, quiet hours), non-obvious patterns, architectural decisions.
- Don't over-comment. Skip obvious React patterns, standard Supabase calls, etc.

### Mandatory Testing

- **Always write tests for new pure business logic.** Webhook parsing, nag scheduling, CSV generation, email resolution — these must have test coverage.
- Run `npm test` (Vitest) for web app tests before committing.
- Deno tests exist for Edge Function shared modules — update them when changing shared logic.
- Don't test UI components, configuration, or Supabase client setup.

### TypeScript / React

#### Naming
- Components: `PascalCase` (e.g., `LeadCard`, `AddLeadModal`)
- Functions and variables: `camelCase`
- Types/interfaces: `PascalCase` (e.g., `Lead`, `WebhookPayload`)
- Files: `kebab-case` for lib modules, `PascalCase` for components
- Boolean variables: prefix with `is`, `has`, `show` (e.g., `isQuietHours`, `showAddLead`)

#### Style
- Use TypeScript strict mode. Explicit types for function parameters and return values.
- Prefer `const` over `let`. Never use `var`.
- Early returns to reduce nesting.
- Extract pure business logic into `lib/` modules — keep components thin.
- Use `"use client"` only on components that need browser APIs or state.

#### React Patterns
- Server Components by default (Next.js App Router). Client Components only when needed.
- Data fetching in Server Components (`page.tsx`), passed as props to Client Components.
- Use `useState` + `useCallback` + `useMemo` appropriately — don't over-optimize.
- Modals: bottom-sheet on mobile (`items-end sm:items-center`), centered on desktop.

### Supabase Edge Functions (Deno)

- Import Supabase client from `https://esm.sh/@supabase/supabase-js@2`.
- Import shared modules with `.ts` extension: `import { foo } from "../_shared/bar.ts"`.
- Use `Deno.env.get()` for secrets. Check they exist before using.
- Handle errors gracefully — Edge Functions should return JSON responses with appropriate status codes.
- Extract testable pure logic into `_shared/` modules. Keep handler files focused on I/O.

### 3rd Party API Calls — Timeouts, Errors & Retries

All `fetch()` calls to external APIs **must** have timeout and error handling. Use `fetchWithRetry` from `supabase/functions/_shared/fetch-retry.ts` for Edge Functions.

**Required for every external API call:**
- **Timeout:** Always set a timeout (5-15s depending on the API). Never let a fetch hang indefinitely.
- **Error handling:** Always wrap in try-catch. Log errors with context (which API, what failed).
- **Retry:** Retry on 5xx and network errors (2 retries with exponential backoff). Never retry on 4xx (permanent errors).
- **Graceful degradation:** If a non-critical call fails (e.g. push notification), log and continue. If a critical call fails (e.g. lead creation), return an error to the user.

**Pattern for Edge Functions:**
```typescript
import { fetchWithRetry } from "../_shared/fetch-retry.ts";

// 10s timeout, 2 retries with backoff
const response = await fetchWithRetry(url, { method: "POST", ... }, { timeoutMs: 10000 });
```

**Pattern for Next.js API routes (Stripe SDK):**
```typescript
try {
  const session = await stripe.checkout.sessions.create({ ... });
} catch (err) {
  console.error("Stripe error:", err);
  return NextResponse.json({ error: "Payment service temporarily unavailable" }, { status: 502 });
}
```

**Pattern for client-side (mobile/web):**
```typescript
try {
  const res = await fetch(url, { ... });
  if (!res.ok) { /* show error to user */ return; }
} catch {
  Alert.alert("Error", "Could not connect to server");
}
```

**Current timeouts by API:**
| API | Timeout | Retries | Location |
|-----|---------|---------|----------|
| Claude API (email parsing) | 10s | 2 | `email-intake` |
| Expo Push API | 5s | 2 | `nag-engine`, `weekly-summary`, `email-intake` |
| Stripe API | 10s | 2 | `stripe-sync` |
| Supabase Edge Function | 15s | 3 | `cloudflare/email-worker` |
| Stripe SDK (checkout/portal) | SDK default | 0 (try-catch) | Next.js API routes |
| Upstash Redis | SDK default | 0 (try-catch, fail-open) | `rate-limit.ts` |

### Migrations

- All migrations must be **idempotent** — use `IF NOT EXISTS`, `CREATE OR REPLACE`, `DO $$ ... $$` blocks.
- File naming: `YYYYMMDDHHMMSS_description.sql`
- Always add indexes for foreign keys and commonly queried columns.

### Feature Flags

- `NEXT_PUBLIC_PAYMENTS_LIVE` — controls paid tier visibility across landing page, pricing, upgrade prompts, and settings. Set to `"true"` to enable Stripe checkout.
- Web Push requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in Vercel + VAPID secrets in Supabase.

### Git

- One logical change per commit. Don't mix refactors with features.
- Write clear commit messages explaining the "what" and "why".
- Always run `npm run build` and `npm test` before pushing.
- The git repo is at the project root (`naglead/`), not `web/`.

### Inclusivity

- Use gender-neutral language in all user-facing copy.
- Use they/them for generic customers. Use gender-neutral names (Jordan, Alex, Sam, Pat) in examples.
- Avoid trade-specific stereotypes — the product is for all service businesses.

### Security

- Never log secrets, API keys, or service role keys.
- Validate all external input (webhooks, email intake, form data).
- Use Supabase RLS for data isolation between users.
- Service role key is server-side only — never expose to the client.
- Sanitize and cap input lengths (names: 255 chars, descriptions: 1000 chars).
