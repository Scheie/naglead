import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit("delete", user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Please wait before trying again." },
      { status: 429 }
    );
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Cancel Stripe subscription if active
  const { data: profile } = await adminClient
    .from("users")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch (err) {
      console.error("Failed to cancel Stripe subscription:", err);
    }
  }

  // Delete leads and events (cascade handles lead_events)
  await adminClient.from("leads").delete().eq("user_id", user.id);

  // Delete web push subscriptions
  await adminClient.from("web_push_subscriptions").delete().eq("user_id", user.id);

  // Delete user profile
  await adminClient.from("users").delete().eq("id", user.id);

  // Delete auth user
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
