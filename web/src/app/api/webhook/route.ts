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

export async function POST(request: Request) {
  // Extract user token from URL path or query parameter
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing user token. URL format: /api/webhook?token=YOUR_TOKEN" },
      { status: 400 }
    );
  }

  // Look up user by token (token = user ID for simplicity in v1)
  const supabase = getSupabase();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, subscription_status")
    .eq("id", token)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Invalid webhook token" },
      { status: 401 }
    );
  }

  // Pro feature check
  if (user.subscription_status === "free") {
    return NextResponse.json(
      { error: "Webhook intake requires a Pro subscription" },
      { status: 403 }
    );
  }

  // Parse body
  let payload: WebhookPayload;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as WebhookPayload;
    } else {
      // Try JSON anyway
      payload = await request.json();
    }
  } catch {
    return NextResponse.json(
      { error: "Could not parse request body. Send JSON or form data." },
      { status: 400 }
    );
  }

  // Extract and validate lead fields
  const name = extractName(payload).slice(0, 255);
  const description = extractDescription(payload).slice(0, 1000);
  const { phone, email } = extractContact(payload);

  // Create the lead
  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      name,
      description,
      phone,
      email,
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

  // Log the event
  await supabase.from("lead_events").insert({
    lead_id: lead.id,
    user_id: user.id,
    event_type: "created",
    metadata: { source: "webhook", parsed: { name, description, phone, email } },
  });

  return NextResponse.json(
    {
      ok: true,
      lead_id: lead.id,
      parsed: { name, description, phone, email },
    },
    { status: 201 }
  );
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/webhook?token=YOUR_USER_ID with JSON body: { name, phone, email, message }",
  });
}
