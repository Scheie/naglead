import { describe, it, expect } from "vitest";
import { escapeCsvField, leadsToCSV } from "../export-csv";
import type { Lead } from "../database.types";

describe("escapeCsvField", () => {
  it("returns plain string unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("wraps field with comma in quotes", () => {
    expect(escapeCsvField("hello, world")).toBe('"hello, world"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps field with newline in quotes", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("handles empty string", () => {
    expect(escapeCsvField("")).toBe("");
  });
});

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "test-id",
    user_id: "user-id",
    name: "Test Lead",
    description: "Needs help",
    phone: "555-1234",
    email: "test@test.com",
    state: "reply_now",
    value_cents: null,
    lost_reason: null,
    source: "manual",
    snoozed_until: null,
    last_nagged_at: null,
    nag_count: 0,
    created_at: "2026-04-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
    replied_at: null,
    closed_at: null,
    ...overrides,
  };
}

describe("leadsToCSV", () => {
  it("returns header row for empty array", () => {
    const csv = leadsToCSV([]);
    expect(csv).toBe("Name,Description,Phone,Email,Status,Value ($),Lost Reason,Source,Created,Replied,Closed");
  });

  it("includes lead data in row", () => {
    const csv = leadsToCSV([makeLead()]);
    const rows = csv.split("\n");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain("Test Lead");
    expect(rows[1]).toContain("555-1234");
    expect(rows[1]).toContain("test@test.com");
    expect(rows[1]).toContain("reply_now");
  });

  it("converts value_cents to dollars", () => {
    const csv = leadsToCSV([makeLead({ value_cents: 15000 })]);
    expect(csv).toContain("150.00");
  });

  it("leaves value empty when null", () => {
    const csv = leadsToCSV([makeLead({ value_cents: null })]);
    const rows = csv.split("\n");
    // Value column should be empty between two commas
    const cols = rows[1].split(",");
    expect(cols[5]).toBe("");
  });

  it("handles null optional fields", () => {
    const csv = leadsToCSV([makeLead({ phone: null, email: null, lost_reason: null })]);
    const rows = csv.split("\n");
    expect(rows).toHaveLength(2);
  });

  it("escapes fields with commas", () => {
    const csv = leadsToCSV([makeLead({ name: "Smith, John" })]);
    expect(csv).toContain('"Smith, John"');
  });
});
