let swRegistration: ServiceWorkerRegistration | null = null;

export async function initNotifications(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  try {
    swRegistration = await navigator.serviceWorker.register("/sw.js");
    return true;
  } catch {
    return false;
  }
}

export async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getPermissionState(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function sendNotification(title: string, body: string, data?: Record<string, unknown>) {
  if (Notification.permission !== "granted") return;

  // Try service worker notification (works even when tab is in background)
  if (swRegistration) {
    swRegistration.active?.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      body,
      data,
    });
    return;
  }

  // Fallback to basic Notification API
  new Notification(title, { body, icon: "/nag-icon.svg" });
}

// --- Web Push subscription ---

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush(userId: string): Promise<boolean> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey || !swRegistration) return false;

  try {
    // Check for existing subscription
    let subscription = await swRegistration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return false;
    }

    // Store in Supabase
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase
      .from("web_push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        { onConflict: "user_id,endpoint" }
      );

    if (error) {
      console.error("Failed to save Web Push subscription:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Web Push subscribe error:", err);
    return false;
  }
}
