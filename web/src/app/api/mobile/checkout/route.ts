import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";

// Mobile checkout flow:
// 1. Mobile app calls POST /api/mobile/checkout with { token, plan }
//    (token = short-lived JWT from Supabase auth, sent as Bearer header)
// 2. Server verifies token, creates Stripe Checkout session
// 3. Returns { url } — mobile app opens this in system browser
// 4. After payment, Stripe redirects to naglead.com/app/upgrade-success
//    which shows a "Return to app" deep link (naglead://upgrade-success)
// 5. Stripe webhook updates subscription_status as usual

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const allowedOrigins = [
  "https://naglead.com",
  "https://www.naglead.com",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
];

function getPriceIds(): Record<string, string> {
  return {
    pro: process.env.STRIPE_PRICE_ID_PRO_MONTHLY!,
    pro_annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL!,
  };
}

export async function POST(request: Request) {
  // Authenticate via Bearer token (Supabase JWT from mobile app)
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);
  const admin = getAdminClient();

  // Verify the token by getting the user
  const { data: { user }, error: authError } = await admin.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Rate limit
  const { allowed } = await checkRateLimit("checkout", user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  // Parse plan
  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = body.plan;
  const PRICE_IDS = getPriceIds();
  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json(
      { error: "Invalid plan. Use 'pro' or 'pro_annual'" },
      { status: 400 }
    );
  }

  // Check if user already has an active subscription
  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id, email, name, subscription_status")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_status === "pro" || profile?.subscription_status === "pro_annual") {
    return NextResponse.json(
      { error: "You already have an active subscription." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.name ?? undefined,
      metadata: { naglead_user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Use fixed origin for mobile (not request origin — mobile has no origin)
  const origin = "https://naglead.com";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${origin}/app/upgrade-success`,
    cancel_url: `${origin}/app/upgrade-cancelled`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { naglead_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
