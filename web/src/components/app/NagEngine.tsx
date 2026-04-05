"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Lead } from "@/lib/database.types";
import { initNotifications, sendNotification, getPermissionState, subscribeToWebPush } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";

const CHECK_INTERVAL = 60_000; // Check every 60 seconds

interface NagScheduleEntry {
  minAgeMs: number;
  title: string;
  body: (name: string, desc: string) => string;
}

const REPLY_NOW_SCHEDULE: NagScheduleEntry[] = [
  {
    minAgeMs: 2 * 60 * 60 * 1000,
    title: "New lead waiting",
    body: (name, desc) => `📱 ${name} needs ${desc} — send a quick reply`,
  },
  {
    minAgeMs: 6 * 60 * 60 * 1000,
    title: "Lead going cold",
    body: (name, desc) => `⏰ ${name} has been waiting 6 hours for ${desc}`,
  },
  {
    minAgeMs: 24 * 60 * 60 * 1000,
    title: "1 day with no reply",
    body: (name) => `⚠️ ${name} — 1 day no reply. Going cold!`,
  },
  {
    minAgeMs: 48 * 60 * 60 * 1000,
    title: "You're losing this job",
    body: (name) => `🔴 ${name} waited 2 DAYS. Call now or lose it!`,
  },
];

const WAITING_SCHEDULE: NagScheduleEntry[] = [
  {
    minAgeMs: 3 * 24 * 60 * 60 * 1000,
    title: "Time to follow up",
    body: (name, desc) => `🔄 Follow up with ${name} about ${desc}`,
  },
  {
    minAgeMs: 7 * 24 * 60 * 60 * 1000,
    title: "1 week silent",
    body: (name) => `⏰ ${name} hasn't replied in a week`,
  },
];

// Track what we've already nagged about so we don't repeat
const naggedMap = new Map<string, number>(); // leadId -> last nag level

function getNagLevel(schedule: NagScheduleEntry[], ageMs: number): number {
  let level = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (ageMs >= schedule[i].minAgeMs) level = i;
  }
  return level;
}

interface NagEngineProps {
  leads: Lead[];
  userId: string;
  onLeadsUpdated?: () => void;
}

export function NagEngine({ leads, userId, onLeadsUpdated }: NagEngineProps) {
  const supabase = createClient();
  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  const checkAndNag = useCallback(async () => {
    if (getPermissionState() !== "granted") return;

    const now = Date.now();

    // 1. Check for snoozed leads that should resurface
    const snoozedToResurface = leadsRef.current.filter(
      (l) => l.snoozed_until && new Date(l.snoozed_until).getTime() <= now
    );

    for (const lead of snoozedToResurface) {
      await supabase
        .from("leads")
        .update({ snoozed_until: null })
        .eq("id", lead.id);

      await sendNotification(
        "Snoozed lead is back!",
        `⏰ Time to follow up with ${lead.name} about ${lead.description}`,
        { leadId: lead.id }
      );

      onLeadsUpdated?.();
    }

    // 2. Check active leads for nag schedule
    const activeLeads = leadsRef.current.filter(
      (l) =>
        (l.state === "reply_now" || l.state === "waiting") &&
        !l.snoozed_until
    );

    for (const lead of activeLeads) {
      const schedule =
        lead.state === "reply_now" ? REPLY_NOW_SCHEDULE : WAITING_SCHEDULE;
      const refTime =
        lead.state === "waiting" && lead.replied_at
          ? new Date(lead.replied_at).getTime()
          : new Date(lead.created_at).getTime();
      const ageMs = now - refTime;

      const level = getNagLevel(schedule, ageMs);
      if (level < 0) continue;

      const lastNaggedLevel = naggedMap.get(lead.id) ?? -1;
      if (level <= lastNaggedLevel) continue;

      // New nag level reached
      const entry = schedule[level];
      await sendNotification(entry.title, entry.body(lead.name, lead.description), {
        leadId: lead.id,
      });

      naggedMap.set(lead.id, level);

      // Update the lead's nag tracking in DB
      await supabase
        .from("leads")
        .update({
          last_nagged_at: new Date().toISOString(),
          nag_count: (lead.nag_count ?? 0) + 1,
        })
        .eq("id", lead.id);
    }
  }, [supabase, onLeadsUpdated]);

  useEffect(() => {
    async function init() {
      await initNotifications();
      // Subscribe to Web Push if permission granted
      if (getPermissionState() === "granted") {
        subscribeToWebPush(userId);
      }
      checkAndNag();
    }
    init();
    const interval = setInterval(checkAndNag, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkAndNag, userId]);

  return null; // Invisible component
}
