import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const admin = getAdminClient();

  // Support both cookie auth (web) and Bearer token auth (mobile)
  let userId: string | null = null;
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const { data: { user } } = await admin.auth.getUser(authHeader.slice(7));
    userId = user?.id ?? null;
  } else {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  const allowedOrigins = [
    "https://naglead.com",
    "https://www.naglead.com",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ];
  const requestOrigin = request.headers.get("origin");
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : "https://naglead.com";

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/app/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: "Could not load subscription portal. Please try again." },
      { status: 502 }
    );
  }
}
