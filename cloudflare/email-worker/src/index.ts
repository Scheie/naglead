// NagLead Cloudflare Email Worker
// Receives inbound email at *@leads.naglead.com, parses with postal-mime,
// and forwards as JSON to the Supabase email-intake edge function.

import PostalMime from "postal-mime";

interface Env {
  EMAIL_INTAKE_SECRET: string;
  SUPABASE_EDGE_FUNCTION_URL: string;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const recipient = message.to;
    const sender = message.from;
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
