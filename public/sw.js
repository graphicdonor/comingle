const CACHE_VERSION = "v1";
const STATIC_CACHE  = `comingle-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `comingle-dynamic-${CACHE_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

// ── Install: pre-cache core assets ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ──────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Skip Supabase / auth API calls — always network
  if (url.hostname.includes("supabase.co") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Next.js static assets (_next/static) — cache-first
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Icons and images — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages — network-first with offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: "Comingle", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || "Comingle", {
      body: data.body || "You have a new notification",
      icon: data.icon || "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      image: data.image,
      data: data.url ? { url: data.url } : undefined,
      vibrate: [100, 50, 100],
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});

// ── Cache strategies ──────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Network error", { status: 408 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await networkFetch) || new Response("", { status: 408 });
}
