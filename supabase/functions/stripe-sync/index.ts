// NagLead Stripe Sync — Supabase Edge Function
// Fallback job that reconciles subscription status with Stripe.
// Runs every 6 hours via pg_cron. Stripe is the source of truth.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchWithRetry } from "../_shared/fetch-retry.ts";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeGet(path: string, apiKey: string): Promise<Response> {
  return fetchWithRetry(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  }, { timeoutMs: 10000 });
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const priceToplan: Record<string, "pro" | "pro_annual"> = {
    [Deno.env.get("STRIPE_PRICE_ID_PRO_MONTHLY") ?? ""]: "pro",
    [Deno.env.get("STRIPE_PRICE_ID_PRO_ANNUAL") ?? ""]: "pro_annual",
  };

  // Get all users with a Stripe subscription
  const { data: users, error } = await supabase
    .from("users")
    .select("id, subscription_status, stripe_subscription_id")
    .not("stripe_subscription_id", "is", null);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let synced = 0;
  let corrected = 0;

  for (const user of users ?? []) {
    let res;
    try {
      res = await stripeGet(
        `/subscriptions/${user.stripe_subscription_id}`,
        stripeKey
      );
    } catch (err) {
      console.error(`Stripe API error for user ${user.id}:`, err);
      continue; // Skip this user, try the rest
    }

    if (!res.ok) {
      // Subscription no longer exists in Stripe
      if (res.status === 404) {
        await supabase
          .from("users")
          .update({
            subscription_status: "free",
            stripe_subscription_id: null,
          })
          .eq("id", user.id);
        corrected++;
      }
      continue;
    }

    const sub = await res.json();
    synced++;

    // Determine what the plan should be
    let expectedStatus: "free" | "pro" | "pro_annual" = "free";
    if (sub.status === "active" || sub.status === "trialing") {
      const priceId = sub.items?.data?.[0]?.price?.id ?? "";
      expectedStatus = priceToplan[priceId] ?? "pro";
    } else if (sub.status === "past_due") {
      // Grace period — keep current plan
      continue;
    }
    // canceled, unpaid, incomplete_expired → free

    if (user.subscription_status !== expectedStatus) {
      const update: Record<string, unknown> = {
        subscription_status: expectedStatus,
      };
      if (expectedStatus === "free") {
        update.stripe_subscription_id = null;
      }
      await supabase.from("users").update(update).eq("id", user.id);
      corrected++;
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      users_checked: users?.length ?? 0,
      synced,
      corrected,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
