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
