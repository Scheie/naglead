// NagLead Email Intake — Supabase Edge Function
// Receives inbound email from Cloudflare Email Worker as JSON,
// parses with Claude API (Haiku), creates a lead in "reply_now" state.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveRecipient } from "../_shared/resolve-user.ts";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

const PARSE_PROMPT = `Extract from this email:
- Contact name (first + last if available)
- Phone number (if present)
- Email address (if present, not the sender's forwarding address)
- What they need (1 short sentence)

Return ONLY valid JSON: { "name": string | null, "phone": string | null, "email": string | null, "description": string | null }
If any field is unclear, return null for that field.`;

interface ParsedLead {
  name: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
}

interface EmailPayload {
  recipient: string;
  sender: string;
  from: string;
  from_name: string;
  subject: string;
  body: string;
}

async function parseEmailWithClaude(
  emailBody: string,
  subject: string,
  fromAddress: string,
  apiKey: string
): Promise<ParsedLead> {
  const content = [
    subject ? `Subject: ${subject}` : "",
    `From: ${fromAddress}`,
    "---",
    emailBody.slice(0, 4000), // Cap to avoid token blowout
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      messages: [
        { role: "user", content: `${PARSE_PROMPT}\n\n---\n\n${content}` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Claude API error:", err);
    throw new Error(`Claude API returned ${response.status}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? "{}";

  // Extract JSON from response (Claude sometimes wraps in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON found in Claude response:", text);
    return { name: null, phone: null, email: null, description: null };
  }

  return JSON.parse(jsonMatch[0]) as ParsedLead;
}


Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const claudeApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!claudeApiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify shared secret from Cloudflare Email Worker
  const intakeSecret = Deno.env.get("EMAIL_INTAKE_SECRET");
  if (intakeSecret) {
    const provided = req.headers.get("X-Email-Intake-Secret");
    if (provided !== intakeSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Parse JSON payload from Cloudflare Email Worker
  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Expected JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { recipient, sender, from: fromAddress, from_name, subject, body: emailBody } = payload;

  if (!recipient || !sender) {
    return new Response(JSON.stringify({ error: "Missing recipient or sender" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Resolve which user this email is for
  const resolved = resolveRecipient(recipient);
  if (!resolved) {
    console.error("Could not resolve user from recipient:", recipient);
    return new Response(JSON.stringify({ error: "Unknown recipient" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Look up user by UUID or alias
  const userQuery = supabase
    .from("users")
    .select("id, subscription_status");

  if (resolved.type === "uuid") {
    userQuery.eq("id", resolved.identifier);
  } else {
    userQuery.eq("intake_alias", resolved.identifier);
  }

  const { data: user, error: userError } = await userQuery.single();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.subscription_status === "free") {
    return new Response(
      JSON.stringify({ error: "Email intake requires Pro subscription" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse email with Claude
  if (!emailBody.trim()) {
    return new Response(JSON.stringify({ error: "Empty email body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fromDisplay = from_name ? `${from_name} <${fromAddress}>` : fromAddress;

  let parsed: ParsedLead;
  try {
    parsed = await parseEmailWithClaude(emailBody, subject, fromDisplay, claudeApiKey);
  } catch (err) {
    console.error("Failed to parse email:", err);
    parsed = {
      name: from_name || fromAddress.replace(/<.*>/, "").trim() || null,
      phone: null,
      email: sender,
      description: subject || "Forwarded email (parsing failed)",
    };
  }

  // Create the lead
  const leadName = (parsed.name || from_name || fromAddress.replace(/<.*>/, "").trim() || "Unknown Lead").slice(0, 255);
  const leadDescription = (parsed.description || subject || "Forwarded email").slice(0, 1000);

  // Check for possible duplicate (active lead with same email or name in last 24h)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const dedupQuery = supabase
    .from("leads")
    .select("id, name")
    .eq("user_id", user.id)
    .in("state", ["reply_now", "waiting"])
    .gte("created_at", dayAgo);

  if (parsed.email) {
    dedupQuery.eq("email", parsed.email);
  } else {
    dedupQuery.eq("name", leadName);
  }

  const { data: existing } = await dedupQuery.limit(1);
  const possibleDuplicate = existing && existing.length > 0;

  const { data: lead, error: insertError } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      name: leadName,
      description: leadDescription,
      phone: parsed.phone,
      email: parsed.email || sender,
      state: "reply_now",
      source: "email",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to create lead:", insertError);
    return new Response(JSON.stringify({ error: "Failed to create lead" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Log event
  await supabase.from("lead_events").insert({
    lead_id: lead.id,
    user_id: user.id,
    event_type: "created",
    metadata: {
      source: "email",
      sender,
      subject,
      parsed,
      possible_duplicate: possibleDuplicate ? existing[0].id : null,
    },
  });

  // Send push notification if user has a token
  const { data: userFull } = await supabase
    .from("users")
    .select("push_token")
    .eq("id", user.id)
    .single();

  if (userFull?.push_token) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: userFull.push_token,
        sound: "default",
        title: possibleDuplicate ? "Possible duplicate lead" : "New lead from email",
        body: possibleDuplicate
          ? `📧 ${leadName} — may be a duplicate of "${existing[0].name}"`
          : `📧 ${leadName} — ${leadDescription}`,
        data: { leadId: lead.id },
        priority: "high",
      }),
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      lead_id: lead.id,
      parsed: { name: leadName, description: leadDescription, phone: parsed.phone, email: parsed.email },
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
});
