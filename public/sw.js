self.addEventListener("push", function (event) {
  if (!event.data) return;
  let payload = { title: "Eva Coparenting", body: "" };
  try {
    payload = event.data.json();
  } catch (_) {
    payload.body = event.data.text();
  }
  const options = {
    body: payload.body || payload.title,
    icon: "/file.svg",
    badge: "/file.svg",
    tag: payload.tag || "evacoparenting",
    data: { url: payload.url || "/" },
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
