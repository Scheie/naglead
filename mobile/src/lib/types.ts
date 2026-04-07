// Shared types — mirrors web/src/lib/database.types.ts
// Keep in sync with the web app types

export type LeadState = "reply_now" | "waiting" | "won" | "lost";
export type LeadSource = "manual" | "email" | "sms" | "missed_call" | "webhook";
export type EventType =
  | "created"
  | "called"
  | "texted"
  | "emailed"
  | "replied"
  | "snoozed"
  | "won"
  | "lost"
  | "nagged";

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  state: LeadState;
  value_cents: number | null;
  lost_reason: string | null;
  source: LeadSource;
  snoozed_until: string | null;
  last_nagged_at: string | null;
  nag_count: number;
  created_at: string;
  updated_at: string;
  replied_at: string | null;
  closed_at: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  trade: string | null;
  business_name: string | null;
  timezone: string;
  nag_enabled: boolean;
  nag_quiet_start: string;
  nag_quiet_end: string;
  push_token: string | null;
  intake_alias: string | null;
  country: string;
  subscription_status: "free" | "pro" | "pro_annual";
}
