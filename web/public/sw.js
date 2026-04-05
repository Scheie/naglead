// NagLead Service Worker — handles push-like notifications from the app
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

// Handle Web Push events (works even when tab is closed)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "NagLead", body: event.data.text() };
  }

  const { title, body, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title ?? "NagLead", {
      body: body ?? "",
      icon: "/nag-icon.svg",
      badge: "/nag-icon.svg",
      tag: data?.leadId ?? "nag",
      renotify: true,
      requireInteraction: true,
      data,
    })
  );
});

// Listen for messages from the app to show notifications
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, data } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/nag-icon.svg",
      badge: "/nag-icon.svg",
      tag: data?.leadId ?? "nag",
      renotify: true,
      requireInteraction: true,
      data,
    });
  }
});

// When user clicks the notification, focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const leadId = event.notification.data?.leadId;
  const url = leadId ? `/app?highlight=${leadId}` : "/app";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/app") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
