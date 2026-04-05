import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { buildSummaryMessage } from "./weekly-message.ts";

const EMPTY_STATS = { newLeads: 0, won: 0, lost: 0, replyNow: 0, waiting: 0, revenueCents: 0 };

Deno.test("buildSummaryMessage: quiet week when all zeros", () => {
  const result = buildSummaryMessage(EMPTY_STATS);
  assertEquals(result.title, "Weekly summary");
  assertEquals(result.body.includes("Quiet week"), true);
});

Deno.test("buildSummaryMessage: shows new leads count", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, newLeads: 5 });
  assertEquals(result.body.includes("5 new leads"), true);
});

Deno.test("buildSummaryMessage: pluralizes 1 lead correctly", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, newLeads: 1 });
  assertEquals(result.body.includes("1 new lead"), true);
  assertEquals(result.body.includes("1 new leads"), false);
});

Deno.test("buildSummaryMessage: shows won with revenue", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, won: 2, revenueCents: 150000 });
  assertEquals(result.body.includes("2 won"), true);
  assertEquals(result.body.includes("$1,500"), true);
});

Deno.test("buildSummaryMessage: shows won without revenue when zero", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, won: 1 });
  assertEquals(result.body.includes("1 won"), true);
  assertEquals(result.body.includes("$"), false);
});

Deno.test("buildSummaryMessage: shows lost count", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, lost: 3 });
  assertEquals(result.body.includes("3 lost"), true);
});

Deno.test("buildSummaryMessage: shows active leads needing reply", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, replyNow: 2 });
  assertEquals(result.body.includes("2 need a reply"), true);
});

Deno.test("buildSummaryMessage: shows waiting leads", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, waiting: 4 });
  assertEquals(result.body.includes("4 waiting"), true);
});

Deno.test("buildSummaryMessage: perfect week nudge when won and no lost", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, won: 3 });
  assertEquals(result.body.includes("perfect week"), true);
});

Deno.test("buildSummaryMessage: no perfect week nudge when there are losses", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, won: 3, lost: 1 });
  assertEquals(result.body.includes("perfect week"), false);
});

Deno.test("buildSummaryMessage: waiting on you nudge when replyNow > 0", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, newLeads: 2, replyNow: 1 });
  assertEquals(result.body.includes("still waiting on you"), true);
});

Deno.test("buildSummaryMessage: title is 'Your week in leads' when there's activity", () => {
  const result = buildSummaryMessage({ ...EMPTY_STATS, newLeads: 1 });
  assertEquals(result.title, "Your week in leads");
});
