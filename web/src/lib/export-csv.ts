import type { Lead } from "./database.types";

export function leadsToCSV(leads: Lead[]): string {
  const headers = [
    "Name",
    "Description",
    "Phone",
    "Email",
    "Status",
    "Value ($)",
    "Lost Reason",
    "Source",
    "Created",
    "Replied",
    "Closed",
  ];

  const rows = leads.map((lead) => [
    escapeCsvField(lead.name),
    escapeCsvField(lead.description),
    escapeCsvField(lead.phone ?? ""),
    escapeCsvField(lead.email ?? ""),
    lead.state,
    lead.value_cents ? (lead.value_cents / 100).toFixed(2) : "",
    escapeCsvField(lead.lost_reason ?? ""),
    lead.source,
    formatDate(lead.created_at),
    lead.replied_at ? formatDate(lead.replied_at) : "",
    lead.closed_at ? formatDate(lead.closed_at) : "",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
