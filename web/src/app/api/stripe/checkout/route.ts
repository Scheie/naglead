import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getPriceIds(): Record<string, string> {
  return {
    pro: process.env.STRIPE_PRICE_ID_PRO_MONTHLY!,
    pro_annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL!,
  };
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Authenticate user
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse plan selection
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

  const admin = getAdminClient();

  // Get or create Stripe customer
  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id, email, name")
    .eq("id", user.id)
    .single();

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

  // Create checkout session — validate origin to prevent redirect attacks
  const allowedOrigins = [
    "https://naglead.com",
    "https://www.naglead.com",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ];
  const requestOrigin = request.headers.get("origin");
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : "https://naglead.com";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${origin}/app?upgraded=true`,
    cancel_url: `${origin}/app`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { naglead_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
