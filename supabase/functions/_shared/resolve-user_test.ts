import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { resolveUserId } from "./resolve-user.ts";

Deno.test("resolveUserId: extracts user from leads.naglead.com", () => {
  assertEquals(resolveUserId("abc123@leads.naglead.com"), "abc123");
});

Deno.test("resolveUserId: extracts UUID from leads.naglead.com", () => {
  assertEquals(
    resolveUserId("a1b2c3d4-5678-9abc-def0-123456789abc@leads.naglead.com"),
    "a1b2c3d4-5678-9abc-def0-123456789abc"
  );
});

Deno.test("resolveUserId: extracts user from leads+ format", () => {
  assertEquals(resolveUserId("leads+abc123@naglead.com"), "abc123");
});

Deno.test("resolveUserId: case insensitive domain", () => {
  assertEquals(resolveUserId("abc123@LEADS.NAGLEAD.COM"), "abc123");
});

Deno.test("resolveUserId: case insensitive local part", () => {
  assertEquals(resolveUserId("ABC123@leads.naglead.com"), "abc123");
});

Deno.test("resolveUserId: returns null for unknown domain", () => {
  assertEquals(resolveUserId("abc123@gmail.com"), null);
});

Deno.test("resolveUserId: returns null for empty string", () => {
  assertEquals(resolveUserId(""), null);
});

Deno.test("resolveUserId: returns null for no @ sign", () => {
  assertEquals(resolveUserId("no-at-sign"), null);
});

Deno.test("resolveUserId: returns null for empty local part", () => {
  assertEquals(resolveUserId("@leads.naglead.com"), null);
});

Deno.test("resolveUserId: returns null for empty leads+ value", () => {
  assertEquals(resolveUserId("leads+@naglead.com"), null);
});

Deno.test("resolveUserId: rejects naglead.com without leads+ prefix", () => {
  assertEquals(resolveUserId("abc123@naglead.com"), null);
});
