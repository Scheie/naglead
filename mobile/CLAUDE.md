@../CLAUDE.md

# Mobile App (Expo)

## Stack
- Expo (React Native) with TypeScript
- React Navigation (native stack)
- Supabase JS client with SecureStore for token persistence
- Expo Notifications for push
- Expo Linking for deep links (naglead:// scheme)

## Project Structure
```
mobile/
  App.tsx                    — Root: auth check, navigation, push setup, font loading
  app.json                   — Expo config: bundle IDs, deep link scheme, plugins
  src/
    screens/
      LoginScreen.tsx        — Email + password login
      SignupScreen.tsx        — Name, trade, email, password signup
      InboxScreen.tsx         — Main screen: Reply Now + Waiting + FAB
      AddLeadScreen.tsx       — Modal: name + need + optional phone/email
    components/
      LeadCard.tsx            — Lead card with actions (call, text, done, lost)
    hooks/
      useAuth.ts              — Session state + auth listener
    lib/
      supabase.ts             — Supabase client with SecureStore adapter
      types.ts                — Shared types (mirrors web/src/lib/database.types.ts)
      theme.ts                — Colors + font names (matches web design tokens)
      notifications.ts        — Push registration, token saving, tap handling
    navigation.ts             — Type definitions for navigation stacks
  assets/
    fonts/                    — Teko-Bold, WorkSans-* (download and place here)
```

## Fonts
Loaded via `@expo-google-fonts/teko` and `@expo-google-fonts/work-sans` packages.
No manual font downloads needed — they're bundled at build time.

## Running
```bash
cd mobile
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
```

## Payment Flow
Mobile app does NOT handle payments directly. Instead:
1. App calls `POST /api/mobile/checkout` with Bearer token + plan
2. Opens Stripe Checkout URL in system browser
3. After payment, Stripe redirects to naglead.com/app/upgrade-success
4. That page shows "OPEN APP" button with naglead:// deep link
5. App receives deep link and refreshes subscription status

## Deep Link Scheme
- `naglead://` — registered in app.json via `scheme: "naglead"`
- `naglead://upgrade-success` — payment complete, refresh sub status
- `naglead://home` — return to inbox

## Environment
- Use `EXPO_PUBLIC_` prefix for client-side env vars (Expo convention)
- Supabase URL and anon key only — never include service role key
- Create `.env` from `.env.example`

## Key Differences from Web
- Auth tokens stored in SecureStore (not cookies)
- Push notifications via Expo Push API (not Web Push)
- No client-side nag engine — server handles all nagging via push
- Navigation via React Navigation (not Next.js routes)
- Styles via StyleSheet (not Tailwind)
