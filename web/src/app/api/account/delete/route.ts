import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Support both cookie auth (web) and Bearer token auth (mobile)
  const authHeader = request.headers.get("authorization");
  let user;

  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.slice(7);
    const admin = getAdminClient();
    const { data, error } = await admin.auth.getUser(accessToken);
    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    user = data.user;
  } else {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    user = data.user;
  }

  const { allowed } = await checkRateLimit("delete", user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Please wait before trying again." },
      { status: 429 }
    );
  }

  const adminClient = getAdminClient();

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

  // Deleting the auth user cascades to public.users, leads, lead_events,
  // and web_push_subscriptions via FK ON DELETE CASCADE
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Failed to delete auth user:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
