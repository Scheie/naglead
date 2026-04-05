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

export interface User {
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
  country: string;
  created_at: string;
  subscription_status: "free" | "pro" | "pro_annual";
}

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

export interface LeadEvent {
  id: string;
  lead_id: string;
  user_id: string;
  event_type: EventType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface WebPushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<User, "id">>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "created_at" | "updated_at" | "nag_count"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          nag_count?: number;
        };
        Update: Partial<Omit<Lead, "id" | "user_id">>;
      };
      lead_events: {
        Row: LeadEvent;
        Insert: Omit<LeadEvent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<LeadEvent, "id">>;
      };
    };
  };
}
