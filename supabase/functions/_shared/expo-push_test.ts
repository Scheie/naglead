import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { sendExpoPush } from "./expo-push.ts";

// Mock fetch to simulate Expo Push API responses
const originalFetch = globalThis.fetch;

function mockFetch(response: unknown, status = 200) {
  globalThis.fetch = () =>
    Promise.resolve(new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    }));
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

Deno.test("sendExpoPush: returns ok on successful push", async () => {
  mockFetch({ data: [{ status: "ok", id: "fake-ticket-id" }] });
  try {
    const result = await sendExpoPush("ExponentPushToken[abc123]", {
      title: "Test", body: "Hello",
    });
    assertEquals(result.ok, true);
    assertEquals(result.deviceNotRegistered, false);
  } finally {
    restoreFetch();
  }
});

Deno.test("sendExpoPush: detects DeviceNotRegistered", async () => {
  mockFetch({
    data: [{
      status: "error",
      message: '"ExponentPushToken[abc123]" is not a registered push notification recipient',
      details: { error: "DeviceNotRegistered" },
    }],
  });
  try {
    const result = await sendExpoPush("ExponentPushToken[abc123]", {
      title: "Test", body: "Hello",
    });
    assertEquals(result.ok, false);
    assertEquals(result.deviceNotRegistered, true);
  } finally {
    restoreFetch();
  }
});

Deno.test("sendExpoPush: handles non-200 response", async () => {
  globalThis.fetch = () =>
    Promise.resolve(new Response("Internal Server Error", { status: 500 }));
  try {
    const result = await sendExpoPush("ExponentPushToken[abc123]", {
      title: "Test", body: "Hello",
    });
    assertEquals(result.ok, false);
    assertEquals(result.deviceNotRegistered, false);
  } finally {
    restoreFetch();
  }
});

Deno.test("sendExpoPush: handles network error", async () => {
  globalThis.fetch = () => Promise.reject(new Error("Network error"));
  try {
    const result = await sendExpoPush("ExponentPushToken[abc123]", {
      title: "Test", body: "Hello",
    });
    assertEquals(result.ok, false);
    assertEquals(result.deviceNotRegistered, false);
  } finally {
    restoreFetch();
  }
});
