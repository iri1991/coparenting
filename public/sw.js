const STATIC_CACHE = "homesplit-static-v5";
const RUNTIME_CACHE = "homesplit-runtime-v5";
const API_CACHE = "homesplit-api-v5";
/** Snapshot chat doar pentru offline — nu se folosește când există rețea. */
const CHAT_OFFLINE_CACHE = "homesplit-chat-offline-v1";

const APP_SHELL_URLS = [
  "/",
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
];

function isChatApiPath(pathname) {
  return pathname === "/api/chat" || pathname.startsWith("/api/chat/");
}

function isChatPagePath(pathname) {
  return pathname === "/chat" || pathname.startsWith("/chat/");
}

var lastChatOfflineWrite = 0;
var CHAT_OFFLINE_MIN_MS = 60 * 1000;

function putChatOffline(cacheName, request, response) {
  if (!response || !response.ok) return Promise.resolve();
  var now = Date.now();
  if (now - lastChatOfflineWrite < CHAT_OFFLINE_MIN_MS) return Promise.resolve();
  lastChatOfflineWrite = now;
  var copy = response.clone();
  return caches.open(cacheName).then(function (cache) {
    return cache.put(request, copy);
  });
}

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
          if (
            key !== STATIC_CACHE &&
            key !== RUNTIME_CACHE &&
            key !== API_CACHE &&
            key !== CHAT_OFFLINE_CACHE
          ) {
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

  // Chat API: mereu rețea când e online; cache doar ca backup offline.
  if (isChatApiPath(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          putChatOffline(CHAT_OFFLINE_CACHE, req, res).catch(function () {});
          return res;
        })
        .catch(function () {
          return caches.open(CHAT_OFFLINE_CACHE).then(function (cache) {
            return cache.match(req).then(function (cached) {
              if (cached) return cached;
              if (url.pathname.includes("unread")) {
                return new Response(JSON.stringify({ unreadCount: 0 }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }
              return new Response(JSON.stringify({ messages: [] }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            });
          });
        })
    );
    return;
  }

  // Pagina /chat: fără cache în RUNTIME; doar snapshot offline separat.
  if (req.mode === "navigate" && isChatPagePath(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          putChatOffline(CHAT_OFFLINE_CACHE, req, res).catch(function () {});
          return res;
        })
        .catch(function () {
          return caches.open(CHAT_OFFLINE_CACHE).then(function (cache) {
            return cache.match(req).then(function (cached) {
              if (cached) return cached;
              return caches.match("/offline.html");
            });
          });
        })
    );
    return;
  }

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

  if (CACHED_API_PREFIXES.some(function (prefix) {
    return url.pathname.startsWith(prefix);
  })) {
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

  // Alte API-uri: fără interceptare cache (doar rețea).
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
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
  const raw = event.notification.data?.url || "/";
  var targetUrl;
  try {
    targetUrl = new URL(raw, self.location.origin).href;
  } catch (_) {
    targetUrl = self.location.origin + (raw.startsWith("/") ? raw : "/" + raw);
  }
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== 0 || !("focus" in client)) continue;
        return client
          .focus()
          .then(function () {
            client.postMessage({ type: "homesplit:navigate", url: targetUrl });
            if (typeof client.navigate === "function") {
              return client.navigate(targetUrl).catch(function () {
                if (clients.openWindow) return clients.openWindow(targetUrl);
              });
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
          })
          .catch(function () {
            if (clients.openWindow) return clients.openWindow(targetUrl);
          });
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
