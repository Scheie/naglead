// Shared Expo Push API sender with dead token detection
// Returns whether the push token is invalid so callers can clean it up.

import { fetchWithRetry } from "./fetch-retry.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  categoryId?: string;
  priority?: "default" | "high";
}

interface ExpoPushResult {
  ok: boolean;
  deviceNotRegistered: boolean;
}

export async function sendExpoPush(
  pushToken: string,
  notification: ExpoPushNotification
): Promise<ExpoPushResult> {
  try {
    const response = await fetchWithRetry(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
        priority: notification.priority ?? "high",
        categoryId: notification.categoryId,
      }),
    }, { timeoutMs: 5000 });

    if (!response.ok) {
      console.error("Push failed:", await response.text());
      return { ok: false, deviceNotRegistered: false };
    }

    // Expo returns { data: [{ status, details? }] } for single pushes
    const result = await response.json();
    const ticket = result?.data?.[0];

    if (ticket?.status === "error" && ticket?.details?.error === "DeviceNotRegistered") {
      console.warn(`Push token expired (DeviceNotRegistered): ${pushToken.slice(0, 20)}...`);
      return { ok: false, deviceNotRegistered: true };
    }

    return { ok: ticket?.status === "ok", deviceNotRegistered: false };
  } catch (err) {
    console.error("Push send error:", err);
    return { ok: false, deviceNotRegistered: false };
  }
}
