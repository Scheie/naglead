export interface ResolvedRecipient {
  identifier: string;
  type: "uuid" | "alias";
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function resolveRecipient(recipient: string): ResolvedRecipient | null {
  const atIndex = recipient.indexOf("@");
  if (atIndex === -1) return null;

  const local = recipient.slice(0, atIndex).toLowerCase();
  const domain = recipient.slice(atIndex + 1).toLowerCase();

  let identifier: string | null = null;

  if (domain === "leads.naglead.com") {
    identifier = local || null;
  } else if (domain === "naglead.com" && local.startsWith("leads+")) {
    identifier = local.slice(6) || null;
  }

  if (!identifier) return null;

  const type = UUID_REGEX.test(identifier) ? "uuid" : "alias";
  return { identifier, type };
}

// Keep backward-compatible export
export function resolveUserId(recipient: string): string | null {
  const result = resolveRecipient(recipient);
  return result?.identifier ?? null;
}
