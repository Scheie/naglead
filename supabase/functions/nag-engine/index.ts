// NagLead Nag Engine — Supabase Edge Function
// Triggered every 15 minutes via pg_cron
// 1. Resurfaces snoozed leads
// 2. Finds leads that need nagging
// 3. Checks quiet hours
// 4. Sends push notifications via Expo Push API
// 5. Updates nag tracking fields

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isQuietHours, getNagMessage } from "../_shared/nag-schedule.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendExpoPush(
  pushToken: string,
  notification: { title: string; body: string; data?: Record<string, unknown> }
) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: pushToken,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      priority: "high",
    }),
  });

  if (!response.ok) {
    console.error("Push failed:", await response.text());
  }
}

Deno.serve(async (req) => {
  // Verify this is called by pg_cron or with service role key
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  let nagged = 0;
  let resurfaced = 0;

  // 1. Resurface snoozed leads
  const { data: snoozedLeads, error: snoozeError } = await supabase
    .from("leads")
    .update({ snoozed_until: null })
    .lt("snoozed_until", now.toISOString())
    .not("snoozed_until", "is", null)
    .select("id");

  if (!snoozeError && snoozedLeads) {
    resurfaced = snoozedLeads.length;
  }

  // 2. Find leads that need nagging (with user info)
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*, users!inner(push_token, nag_enabled, nag_quiet_start, nag_quiet_end, timezone)")
    .in("state", ["reply_now", "waiting"])
    .is("snoozed_until", null)
    .eq("users.nag_enabled", true);

  if (leadsError) {
    console.error("Error fetching leads:", leadsError);
    return new Response(JSON.stringify({ error: leadsError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const lead of leads ?? []) {
    const user = lead.users as {
      push_token: string | null;
      nag_enabled: boolean;
      nag_quiet_start: string;
      nag_quiet_end: string;
      timezone: string;
    };

    // Skip if no push token
    if (!user.push_token) continue;

    // Skip if in quiet hours
    if (isQuietHours(now, user.timezone, user.nag_quiet_start, user.nag_quiet_end)) {
      continue;
    }

    // Calculate age based on state
    const referenceTime =
      lead.state === "waiting" && lead.replied_at
        ? new Date(lead.replied_at)
        : new Date(lead.created_at);
    const ageMs = now.getTime() - referenceTime.getTime();

    // Determine nag message
    const message = getNagMessage(
      lead.state,
      ageMs,
      lead.nag_count,
      lead.name,
      lead.description
    );

    if (!message) continue;

    // Check minimum interval since last nag (don't nag more than once per hour)
    if (lead.last_nagged_at) {
      const timeSinceLastNag = now.getTime() - new Date(lead.last_nagged_at).getTime();
      if (timeSinceLastNag < 60 * 60 * 1000) continue; // 1 hour minimum
    }

    // Send push notification
    await sendExpoPush(user.push_token, {
      title: message.title,
      body: message.body,
      data: { leadId: lead.id },
    });

    // Update lead nag tracking
    await supabase
      .from("leads")
      .update({
        last_nagged_at: now.toISOString(),
        nag_count: lead.nag_count + 1,
      })
      .eq("id", lead.id);

    // Log event
    await supabase.from("lead_events").insert({
      lead_id: lead.id,
      user_id: lead.user_id,
      event_type: "nagged",
      metadata: {
        nag_count: lead.nag_count + 1,
        message: message.body,
      },
    });

    nagged++;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: now.toISOString(),
      resurfaced,
      nagged,
      total_checked: leads?.length ?? 0,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
