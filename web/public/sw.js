// NagLead Service Worker — handles push-like notifications from the app
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
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
