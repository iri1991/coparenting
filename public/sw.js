self.addEventListener("push", function (event) {
  let payload = { title: "Eva Coparenting", body: "" };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (_) {
      payload.body = event.data.text();
    }
  }
  var options = {
    body: payload.body || payload.title,
    icon: "/file.svg",
    badge: "/file.svg",
    tag: payload.tag || "evacoparenting",
    data: { url: payload.url || "/" },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(payload.title || "Eva", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
