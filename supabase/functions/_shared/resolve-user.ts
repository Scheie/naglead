export function resolveUserId(recipient: string): string | null {
  const atIndex = recipient.indexOf("@");
  if (atIndex === -1) return null;

  const local = recipient.slice(0, atIndex).toLowerCase();
  const domain = recipient.slice(atIndex + 1).toLowerCase();

  if (domain === "leads.naglead.com") {
    return local || null;
  }

  if (domain === "naglead.com" && local.startsWith("leads+")) {
    return local.slice(6) || null;
  }

  return null;
}
