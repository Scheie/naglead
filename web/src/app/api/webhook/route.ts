import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractName, extractDescription, extractContact } from "@/lib/webhook-parser";
import type { WebhookPayload } from "@/lib/webhook-parser";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function sanitize(input: string, maxLen: number): string {
  return input.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || token.length < 16) {
    return NextResponse.json(
      { error: "Missing or invalid webhook token" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Look up user by cryptographic webhook token (not user ID)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, subscription_status")
    .eq("webhook_token", token)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Invalid webhook token" },
      { status: 401 }
    );
  }

  if (user.subscription_status === "free") {
    return NextResponse.json(
      { error: "Webhook intake requires a Pro subscription" },
      { status: 403 }
    );
  }

  let payload: WebhookPayload;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as WebhookPayload;
    } else {
      payload = await request.json();
    }
  } catch {
    return NextResponse.json(
      { error: "Could not parse request body. Send JSON or form data." },
      { status: 400 }
    );
  }

  const name = sanitize(extractName(payload), 255) || "Unknown Lead";
  const description = sanitize(extractDescription(payload), 1000) || "Web form submission";
  const { phone, email } = extractContact(payload);

  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      name,
      description,
      phone: phone?.slice(0, 30) ?? null,
      email: email?.slice(0, 255) ?? null,
      state: "reply_now",
      source: "webhook",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to create lead:", insertError);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }

  await supabase.from("lead_events").insert({
    lead_id: lead.id,
    user_id: user.id,
    event_type: "created",
    metadata: { source: "webhook" },
  });

  return NextResponse.json(
    { ok: true, lead_id: lead.id },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/webhook?token=YOUR_WEBHOOK_TOKEN with JSON body: { name, phone, email, message }",
    note: "Find your webhook token in Settings",
  });
}
