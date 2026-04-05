export interface WebhookPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  description?: string;
  [key: string]: unknown;
}

export function extractName(payload: WebhookPayload): string {
  if (payload.name) return String(payload.name).trim();

  for (const key of ["full_name", "fullname", "first_name", "contact_name", "customer_name"]) {
    if (payload[key]) return String(payload[key]).trim();
  }

  if (payload.first_name && payload.last_name) {
    return `${payload.first_name} ${payload.last_name}`.trim();
  }

  return "Unknown Lead";
}

export function extractDescription(payload: WebhookPayload): string {
  if (payload.description) return String(payload.description).trim();
  if (payload.message) return String(payload.message).trim();

  for (const key of ["subject", "inquiry", "service", "needs", "details", "comments", "body"]) {
    if (payload[key]) return String(payload[key]).trim();
  }

  return "Web form submission";
}

export function extractContact(payload: WebhookPayload): { phone: string | null; email: string | null } {
  let phone: string | null = null;
  let email: string | null = null;

  if (payload.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email).trim())) {
    email = String(payload.email).trim();
  }
  if (payload.phone) {
    phone = String(payload.phone).trim();
  }

  for (const key of ["phone_number", "telephone", "mobile", "cell"]) {
    if (!phone && payload[key]) phone = String(payload[key]).trim();
  }
  for (const key of ["email_address", "contact_email"]) {
    if (!email && payload[key]) email = String(payload[key]).trim();
  }

  return { phone, email };
}
