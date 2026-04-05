import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { isQuietHours, getNagMessage } from "./nag-schedule.ts";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// --- isQuietHours ---

Deno.test("isQuietHours: returns true during overnight quiet window", () => {
  // 22:00 UTC, timezone UTC, quiet 21:00-07:00
  const now = new Date("2026-04-04T22:00:00Z");
  assertEquals(isQuietHours(now, "UTC", "21:00", "07:00"), true);
});

Deno.test("isQuietHours: returns true early morning in overnight window", () => {
  const now = new Date("2026-04-04T05:00:00Z");
  assertEquals(isQuietHours(now, "UTC", "21:00", "07:00"), true);
});

Deno.test("isQuietHours: returns false at noon", () => {
  const now = new Date("2026-04-04T12:00:00Z");
  assertEquals(isQuietHours(now, "UTC", "21:00", "07:00"), false);
});

Deno.test("isQuietHours: handles non-overnight range", () => {
  // Quiet during business hours 09:00-17:00
  const morning = new Date("2026-04-04T10:00:00Z");
  assertEquals(isQuietHours(morning, "UTC", "09:00", "17:00"), true);

  const evening = new Date("2026-04-04T20:00:00Z");
  assertEquals(isQuietHours(evening, "UTC", "09:00", "17:00"), false);
});

Deno.test("isQuietHours: respects timezone", () => {
  // 10:00 UTC = 20:00 Australia/Sydney (AEST +10)
  // With quiet 21:00-07:00 Sydney time, 20:00 is NOT quiet
  const now = new Date("2026-04-04T10:00:00Z");
  assertEquals(isQuietHours(now, "Australia/Sydney", "21:00", "07:00"), false);
});

Deno.test("isQuietHours: returns false for invalid timezone", () => {
  const now = new Date("2026-04-04T22:00:00Z");
  assertEquals(isQuietHours(now, "Invalid/Zone", "21:00", "07:00"), false);
});

// --- getNagMessage ---

Deno.test("getNagMessage: returns null for lead younger than 2 hours", () => {
  const result = getNagMessage("reply_now", 1 * HOUR, 0, "Joe", "plumbing");
  assertEquals(result, null);
});

Deno.test("getNagMessage: returns first nag at 2 hours", () => {
  const result = getNagMessage("reply_now", 2 * HOUR, 0, "Joe", "plumbing");
  assertEquals(result !== null, true);
  assertEquals(result!.title, "New lead waiting");
});

Deno.test("getNagMessage: escalates to 6 hour message", () => {
  const result = getNagMessage("reply_now", 6 * HOUR, 1, "Joe", "plumbing");
  assertEquals(result!.title, "Lead going cold");
});

Deno.test("getNagMessage: escalates to 24 hour message", () => {
  const result = getNagMessage("reply_now", 24 * HOUR, 2, "Joe", "plumbing");
  assertEquals(result!.title, "1 day with no reply");
});

Deno.test("getNagMessage: escalates to 48 hour message", () => {
  const result = getNagMessage("reply_now", 48 * HOUR, 3, "Joe", "plumbing");
  assertEquals(result!.title, "You're losing this job");
});

Deno.test("getNagMessage: escalates to 72 hour last chance", () => {
  const result = getNagMessage("reply_now", 72 * HOUR, 4, "Joe", "plumbing");
  assertEquals(result!.title, "Last chance");
});

Deno.test("getNagMessage: returns null when already nagged at current level", () => {
  // 2 hours old, but already nagged once (level 0 complete)
  const result = getNagMessage("reply_now", 2 * HOUR, 1, "Joe", "plumbing");
  assertEquals(result, null);
});

Deno.test("getNagMessage: returns null when nagCount exceeds all levels", () => {
  const result = getNagMessage("reply_now", 72 * HOUR, 6, "Joe", "plumbing");
  assertEquals(result, null);
});

Deno.test("getNagMessage: uses waiting schedule for waiting state", () => {
  const result = getNagMessage("waiting", 3 * DAY, 0, "Joe", "plumbing");
  assertEquals(result!.title, "Time to follow up");
});

Deno.test("getNagMessage: waiting schedule escalates to 1 week", () => {
  const result = getNagMessage("waiting", 7 * DAY, 1, "Joe", "plumbing");
  assertEquals(result!.title, "1 week silent");
});

Deno.test("getNagMessage: waiting schedule escalates to 2 weeks", () => {
  const result = getNagMessage("waiting", 14 * DAY, 2, "Joe", "plumbing");
  assertEquals(result!.title, "2 weeks silent");
});

Deno.test("getNagMessage: includes lead name in body", () => {
  const result = getNagMessage("reply_now", 2 * HOUR, 0, "Joe Smith", "plumbing");
  assertEquals(result!.body.includes("Joe Smith"), true);
});
