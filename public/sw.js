const STATIC_CACHE = "homesplit-static-v2";
const RUNTIME_CACHE = "homesplit-runtime-v2";
const API_CACHE = "homesplit-api-v2";

const APP_SHELL_URLS = [
  "/",
  "/chat",
  "/account",
  "/config",
  "/manifest.json",
  "/logo.png",
  "/offline.html",
];

const CACHED_API_PREFIXES = [
  "/api/events",
  "/api/blocked-days",
  "/api/child-activities",
  "/api/useful-links",
  "/api/proposals/current",
  "/api/chat",
  "/api/chat/unread",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== API_CACHE) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(req, copy).catch(function () {});
          });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            if (cached) return cached;
            return caches.match("/offline.html");
          });
        })
    );
    return;
  }

  if (CACHED_API_PREFIXES.some(function (prefix) { return url.pathname.startsWith(prefix); })) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(API_CACHE).then(function (cache) {
            cache.put(req, copy).catch(function () {});
          });
          return res;
        })
        .catch(function () {
          return caches.match(req);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(req, copy).catch(function () {});
          });
          return res;
        })
        .catch(function () {
          return cached;
        });
    })
  );
});

self.addEventListener("push", function (event) {
  let payload = { title: "HomeSplit", body: "" };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (_) {
      payload.body = event.data.text();
    }
  }
  var options = {
    body: payload.body || payload.title,
    icon: "/logo.png",
    badge: "/logo.png",
    tag: payload.tag || "homesplit",
    data: { url: payload.url || "/" },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(payload.title || "HomeSplit", options));
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
