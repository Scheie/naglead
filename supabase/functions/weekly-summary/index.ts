// NagLead Weekly Summary — Supabase Edge Function
// Triggered Monday mornings via pg_cron
// Sends each user a push notification summarizing their week:
// - New leads received
// - Leads won / lost
// - Leads still waiting for reply
// - Revenue closed (if tracked)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildSummaryMessage } from "../_shared/weekly-message.ts";
import type { WeeklyStats } from "../_shared/weekly-message.ts";

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
      priority: "default",
    }),
  });

  if (!response.ok) {
    console.error("Push failed:", await response.text());
  }
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoISO = weekAgo.toISOString();

  // Get all users with push tokens and nags enabled
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, push_token, timezone")
    .not("push_token", "is", null)
    .eq("nag_enabled", true);

  if (usersError) {
    console.error("Error fetching users:", usersError);
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;

  for (const user of users ?? []) {
    if (!user.push_token) continue;

    // Check if it's Monday morning in the user's timezone (7-10 AM window)
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: user.timezone,
        weekday: "long",
        hour: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const weekday = parts.find((p) => p.type === "weekday")?.value;
      const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);

      // Only send on Monday between 7-10 AM local time
      if (weekday !== "Monday" || hour < 7 || hour >= 10) continue;
    } catch {
      // Invalid timezone, skip
      continue;
    }

    // Check if we already sent a summary this week
    const mondayStart = new Date(now);
    mondayStart.setHours(0, 0, 0, 0);
    const { count: alreadySent } = await supabase
      .from("lead_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "weekly_summary")
      .gte("created_at", mondayStart.toISOString());

    if (alreadySent && alreadySent > 0) continue;

    // New leads this week
    const { count: newLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", weekAgoISO);

    // Leads won this week
    const { data: wonLeads } = await supabase
      .from("leads")
      .select("value_cents")
      .eq("user_id", user.id)
      .eq("state", "won")
      .gte("closed_at", weekAgoISO);

    // Leads lost this week
    const { count: lost } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("state", "lost")
      .gte("closed_at", weekAgoISO);

    // Current active leads
    const { count: replyNow } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("state", "reply_now");

    const { count: waiting } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("state", "waiting");

    const won = wonLeads?.length ?? 0;
    const revenueCents = wonLeads?.reduce((sum, l) => sum + (l.value_cents ?? 0), 0) ?? 0;

    const stats: WeeklyStats = {
      newLeads: newLeads ?? 0,
      won,
      lost: lost ?? 0,
      replyNow: replyNow ?? 0,
      waiting: waiting ?? 0,
      revenueCents,
    };

    const message = buildSummaryMessage(stats);

    await sendExpoPush(user.push_token, {
      title: message.title,
      body: message.body,
      data: { type: "weekly_summary" },
    });

    // Mark as sent so we don't send again this Monday
    await supabase.from("lead_events").insert({
      user_id: user.id,
      event_type: "weekly_summary",
      metadata: { stats },
    });

    sent++;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: now.toISOString(),
      users_checked: users?.length ?? 0,
      summaries_sent: sent,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
