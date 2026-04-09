// NagLead Cloudflare Email Worker
// Receives inbound email at leads+<alias>@naglead.com or *@leads.naglead.com,
// parses with postal-mime, and forwards as JSON to the Supabase email-intake edge function.

import PostalMime from "postal-mime";

interface Env {
  EMAIL_INTAKE_SECRET: string;
  SUPABASE_EDGE_FUNCTION_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const recipient = message.to;
    const sender = message.from;

    // Only process intake emails — ignore hello@, privacy@, etc.
    const local = recipient.split("@")[0]?.toLowerCase() ?? "";
    const domain = recipient.split("@")[1]?.toLowerCase() ?? "";
    const isIntake = domain === "leads.naglead.com" || (domain === "naglead.com" && local.startsWith("leads+"));
    if (!isIntake) return;

    const rawEmail = await new Response(message.raw).arrayBuffer();

    // Parse email with postal-mime
    const parser = new PostalMime();
    const parsed = await parser.parse(rawEmail);

    const subject = parsed.subject || "";
    const body = parsed.text || parsed.html || "";

    if (!body.trim()) {
      // Empty email — nothing to process
      message.setReject("Empty email body");
      return;
    }

    // Forward to Supabase edge function as JSON
    const response = await fetch(env.SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
        "X-Email-Intake-Secret": env.EMAIL_INTAKE_SECRET,
      },
      body: JSON.stringify({
        recipient,
        sender,
        from: parsed.from?.address || sender,
        from_name: parsed.from?.name || "",
        subject,
        body,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Edge function error (${response.status}):`, err);
    }
  },
};
