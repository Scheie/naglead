import { describe, it, expect } from "vitest";
import { extractName, extractDescription, extractContact } from "../webhook-parser";

describe("extractName", () => {
  it("returns name when present", () => {
    expect(extractName({ name: "Joe Smith" })).toBe("Joe Smith");
  });

  it("trims whitespace", () => {
    expect(extractName({ name: "  Joe Smith  " })).toBe("Joe Smith");
  });

  it("tries full_name", () => {
    expect(extractName({ full_name: "Jane Doe" })).toBe("Jane Doe");
  });

  it("tries fullname", () => {
    expect(extractName({ fullname: "Jane Doe" })).toBe("Jane Doe");
  });

  it("tries first_name when name is absent", () => {
    expect(extractName({ first_name: "Bob" })).toBe("Bob");
  });

  it("tries contact_name", () => {
    expect(extractName({ contact_name: "Alice" })).toBe("Alice");
  });

  it("tries customer_name", () => {
    expect(extractName({ customer_name: "Charlie" })).toBe("Charlie");
  });

  it("prefers name over other fields", () => {
    expect(extractName({ name: "Primary", full_name: "Secondary" })).toBe("Primary");
  });

  it("returns Unknown Lead when nothing matches", () => {
    expect(extractName({})).toBe("Unknown Lead");
    expect(extractName({ unrelated: "data" })).toBe("Unknown Lead");
  });
});

describe("extractDescription", () => {
  it("returns description when present", () => {
    expect(extractDescription({ description: "Need plumbing" })).toBe("Need plumbing");
  });

  it("falls back to message", () => {
    expect(extractDescription({ message: "Fix my sink" })).toBe("Fix my sink");
  });

  it("tries subject", () => {
    expect(extractDescription({ subject: "Bathroom reno" })).toBe("Bathroom reno");
  });

  it("tries inquiry", () => {
    expect(extractDescription({ inquiry: "Kitchen remodel" })).toBe("Kitchen remodel");
  });

  it("tries service, needs, details, comments, body", () => {
    expect(extractDescription({ service: "Electrical" })).toBe("Electrical");
    expect(extractDescription({ needs: "Wiring" })).toBe("Wiring");
    expect(extractDescription({ details: "2 outlets" })).toBe("2 outlets");
    expect(extractDescription({ comments: "ASAP" })).toBe("ASAP");
    expect(extractDescription({ body: "Full reno" })).toBe("Full reno");
  });

  it("prefers description over message", () => {
    expect(extractDescription({ description: "Primary", message: "Secondary" })).toBe("Primary");
  });

  it("returns default when nothing matches", () => {
    expect(extractDescription({})).toBe("Web form submission");
  });
});

describe("extractContact", () => {
  it("extracts valid email", () => {
    const result = extractContact({ email: "joe@test.com" });
    expect(result.email).toBe("joe@test.com");
  });

  it("rejects invalid email", () => {
    const result = extractContact({ email: "not-an-email" });
    expect(result.email).toBeNull();
  });

  it("extracts phone", () => {
    const result = extractContact({ phone: "0412555123" });
    expect(result.phone).toBe("0412555123");
  });

  it("tries phone_number fallback", () => {
    const result = extractContact({ phone_number: "555-1234" });
    expect(result.phone).toBe("555-1234");
  });

  it("tries mobile fallback", () => {
    const result = extractContact({ mobile: "555-9999" });
    expect(result.phone).toBe("555-9999");
  });

  it("tries telephone fallback", () => {
    const result = extractContact({ telephone: "555-0000" });
    expect(result.phone).toBe("555-0000");
  });

  it("tries cell fallback", () => {
    const result = extractContact({ cell: "555-1111" });
    expect(result.phone).toBe("555-1111");
  });

  it("tries email_address fallback", () => {
    const result = extractContact({ email_address: "alt@test.com" });
    expect(result.email).toBe("alt@test.com");
  });

  it("tries contact_email fallback", () => {
    const result = extractContact({ contact_email: "c@test.com" });
    expect(result.email).toBe("c@test.com");
  });

  it("prefers primary fields over fallbacks", () => {
    const result = extractContact({ email: "primary@test.com", email_address: "fallback@test.com", phone: "111", mobile: "222" });
    expect(result.email).toBe("primary@test.com");
    expect(result.phone).toBe("111");
  });

  it("returns nulls when nothing provided", () => {
    const result = extractContact({});
    expect(result.phone).toBeNull();
    expect(result.email).toBeNull();
  });

  it("trims whitespace", () => {
    const result = extractContact({ email: " joe@test.com ", phone: " 555 " });
    expect(result.email).toBe("joe@test.com");
    expect(result.phone).toBe("555");
  });
});
