// NagLead Nag Engine — Supabase Edge Function
// Triggered every 15 minutes via pg_cron
// 1. Resurfaces snoozed leads
// 2. Finds leads that need nagging
// 3. Checks quiet hours
// 4. Sends push notifications via Expo Push API + Web Push
// 5. Updates nag tracking fields

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isQuietHours, getNagMessage } from "../_shared/nag-schedule.ts";
import { sendWebPush } from "../_shared/web-push.ts";
import { sendExpoPush } from "../_shared/expo-push.ts";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Load VAPID config for Web Push
  const vapidConfig = {
    subject: Deno.env.get("VAPID_SUBJECT") ?? "",
    publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    privateKey: Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
  };
  const webPushEnabled = !!(vapidConfig.subject && vapidConfig.publicKey && vapidConfig.privateKey);

  const now = new Date();
  let nagged = 0;
  let resurfaced = 0;
  let webPushSent = 0;

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
    .select("*, users!inner(id, push_token, nag_enabled, nag_quiet_start, nag_quiet_end, timezone)")
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

  // 3. Pre-fetch Web Push subscriptions for all users who have leads to nag
  const userIds = [...new Set((leads ?? []).map((l) => l.user_id))];
  let webPushSubsByUser = new Map<string, Array<{ id: string; endpoint: string; p256dh: string; auth: string }>>();

  if (webPushEnabled && userIds.length > 0) {
    const { data: subs } = await supabase
      .from("web_push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (subs) {
      for (const sub of subs) {
        const existing = webPushSubsByUser.get(sub.user_id) ?? [];
        existing.push(sub);
        webPushSubsByUser.set(sub.user_id, existing);
      }
    }
  }

  const nagUpdates: Array<{ id: string; nag_count: number }> = [];
  const nagEvents: Array<{ lead_id: string; user_id: string; event_type: string; metadata: Record<string, unknown> }> = [];

  for (const lead of leads ?? []) {
    const user = lead.users as {
      id: string;
      push_token: string | null;
      nag_enabled: boolean;
      nag_quiet_start: string;
      nag_quiet_end: string;
      timezone: string;
    };

    const hasExpoPush = !!user.push_token;
    const hasWebPush = (webPushSubsByUser.get(lead.user_id)?.length ?? 0) > 0;

    // Skip if no push channels at all
    if (!hasExpoPush && !hasWebPush) continue;

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
      if (timeSinceLastNag < 60 * 60 * 1000) continue;
    }

    const notification = {
      title: message.title,
      body: message.body,
      data: { leadId: lead.id, phone: lead.phone ?? undefined },
      categoryId: lead.phone ? "nag_reminder" : "nag_reminder_no_phone",
    };

    // Send Expo push notification (mobile)
    if (hasExpoPush) {
      const result = await sendExpoPush(user.push_token!, notification);
      if (result.deviceNotRegistered) {
        await supabase.from("users").update({ push_token: null }).eq("id", user.id);
      }
    }

    // Send Web Push notifications (all browser subscriptions)
    if (hasWebPush) {
      const subs = webPushSubsByUser.get(lead.user_id) ?? [];
      for (const sub of subs) {
        const result = await sendWebPush(sub, notification, vapidConfig);
        if (result.expired) {
          await supabase.from("web_push_subscriptions").delete().eq("id", sub.id);
        } else if (result.ok) {
          webPushSent++;
        }
      }
    }

    // Collect for batch update
    nagUpdates.push({ id: lead.id, nag_count: lead.nag_count + 1 });
    nagEvents.push({
      lead_id: lead.id,
      user_id: lead.user_id,
      event_type: "nagged",
      metadata: { nag_count: lead.nag_count + 1, message: message.body },
    });

    nagged++;
  }

  // Batch update nag tracking
  for (const update of nagUpdates) {
    await supabase
      .from("leads")
      .update({ last_nagged_at: now.toISOString(), nag_count: update.nag_count })
      .eq("id", update.id);
  }

  // Batch insert nag events
  if (nagEvents.length > 0) {
    await supabase.from("lead_events").insert(nagEvents);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: now.toISOString(),
      resurfaced,
      nagged,
      web_push_sent: webPushSent,
      total_checked: leads?.length ?? 0,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
