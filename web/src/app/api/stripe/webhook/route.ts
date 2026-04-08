import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getPriceToPlan(): Record<string, "pro" | "pro_annual"> {
  return {
    [process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? ""]: "pro",
    [process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? ""]: "pro_annual",
  };
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function resolveUserId(obj: Stripe.Checkout.Session | Stripe.Subscription): string | null {
  // Try metadata first, then client_reference_id
  const metadata = "metadata" in obj ? obj.metadata : null;
  if (metadata?.naglead_user_id) return metadata.naglead_user_id;
  if ("client_reference_id" in obj && obj.client_reference_id) {
    return obj.client_reference_id;
  }
  return null;
}

async function resolveUserIdByCustomer(customerId: string): Promise<string | null> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

function resolvePlan(subscription: Stripe.Subscription): "pro" | "pro_annual" {
  const priceId = subscription.items.data[0]?.price?.id ?? "";
  return getPriceToPlan()[priceId] ?? "pro";
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Idempotency: skip already-processed events
  const { data: existing } = await admin
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record this event before processing
  await admin
    .from("stripe_webhook_events")
    .insert({ event_id: event.id });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = resolveUserId(session)
        ?? await resolveUserIdByCustomer(session.customer as string);
      if (!userId) {
        console.error("No user ID found for checkout session:", session.id);
        break;
      }

      // Retrieve the subscription to get plan details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const plan = resolvePlan(subscription);

      await admin
        .from("users")
        .update({
          subscription_status: plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
        })
        .eq("id", userId);

      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = resolveUserId(subscription)
        ?? await resolveUserIdByCustomer(subscription.customer as string);
      if (!userId) break;

      if (subscription.status === "active") {
        const plan = resolvePlan(subscription);
        await admin
          .from("users")
          .update({ subscription_status: plan })
          .eq("id", userId);
      } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
        await admin
          .from("users")
          .update({
            subscription_status: "free",
            stripe_subscription_id: null,
          })
          .eq("id", userId);
      }
      // "past_due" — keep current plan (grace period)
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = resolveUserId(subscription)
        ?? await resolveUserIdByCustomer(subscription.customer as string);
      if (!userId) break;

      await admin
        .from("users")
        .update({
          subscription_status: "free",
          stripe_subscription_id: null,
        })
        .eq("id", userId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(
        "Payment failed for customer:",
        invoice.customer
      );
      break;
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
