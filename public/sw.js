const CACHE_VERSION = "v5";
const STATIC_CACHE  = `wepray-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `wepray-dynamic-${CACHE_VERSION}`;
// The reader's "use without internet" download. Not versioned: it holds a
// complete, self-consistent snapshot (pages plus the exact JS/CSS/fonts they
// reference) and is only replaced when the reader updates or removes it.
const OFFLINE_CACHE = "wepray-offline-pack";

// Assets to pre-cache on install. ("/" redirects to /app, and a redirected
// response can't be served for navigations, so it isn't pre-cached.)
const PRECACHE_ASSETS = [
  "/app",
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
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== OFFLINE_CACHE)
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

  // Skip Supabase / auth API calls and Cloudinary media — always network.
  // Cloudinary is its own CDN, and routing video through respondWith breaks
  // the range requests playback relies on.
  if (url.hostname.includes("supabase.co") || url.hostname.endsWith("cloudinary.com") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Client-side navigation payloads (RSC). Never serve these from a cache or
  // fall back to HTML: when offline, failing the request makes Next.js fall
  // back to a full page load, which the cached HTML below can then serve.
  if (request.headers.get("RSC") === "1") {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // Next.js static assets (_next/static) — cache-first
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Prayer voice clips — cache-first (file names change with their content)
  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(audioResponse(request));
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

  // Everything else — HTML documents, RSC/client-navigation payloads, and any
  // other app data — network-first. This must never be stale-while-revalidate:
  // Next.js client-side navigations fetch RSC payloads without an
  // `Accept: text/html` header, and serving those from a stale cache means an
  // already-open tab keeps running yesterday's app logic after a deploy.
  event.respondWith(networkFirstWithOfflineFallback(request));
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: "WePray", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || "WePray", {
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

// Audio is fetched and cached whole, then answered with the byte range the
// player asked for (Safari only plays media from 206 responses).
async function audioResponse(request) {
  let response = await caches.match(request.url, { ignoreVary: true });
  if (!response) {
    try {
      response = await fetch(request.url);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request.url, response.clone());
      }
    } catch {
      return Response.error();
    }
  }
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.get("range") || "");
  if (!range || !response.ok) return response;
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
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
    const cached =
      (await caches.match(request, { ignoreVary: true })) ||
      // e.g. /meditate?practice=metta when only /meditate was saved
      (request.mode === "navigate" ? await caches.match(request, { ignoreVary: true, ignoreSearch: true }) : undefined);
    if (cached) return cached;
    return caches.match("/offline");
  }
}

// ── Offline pack ("Use without internet" in Settings) ────────────────────────
// The page sends the list of URLs to save over a MessageChannel; progress and
// the result are reported back on the same port.
self.addEventListener("message", (event) => {
  const port = event.ports && event.ports[0];
  if (!port || !event.data) return;
  if (event.data.type === "OFFLINE_DOWNLOAD") {
    event.waitUntil(downloadOfflinePack(event.data.urls || [], port));
  } else if (event.data.type === "OFFLINE_REMOVE") {
    event.waitUntil(caches.delete(OFFLINE_CACHE).then(() => port.postMessage({ type: "removed" })));
  }
});

// Build-asset references in HTML, the RSC payload inlined in it, and CSS.
const ASSET_PATTERN = /(?:\/_next\/)?static\/(?:chunks|css|media)\/[^"'\s)\\]+/g;

function assetUrls(text) {
  const found = new Set();
  for (const match of text.matchAll(ASSET_PATTERN)) {
    const path = match[0].startsWith("/_next/") ? match[0] : `/_next/${match[0]}`;
    found.add(path);
  }
  return found;
}

async function downloadOfflinePack(urls, port) {
  // Build into a fresh cache and swap it in only when complete, so a failed
  // or interrupted update never leaves a half-saved pack behind.
  const temp = `${OFFLINE_CACHE}-next`;
  await caches.delete(temp);
  const cache = await caches.open(temp);
  const queue = [...urls];
  const seen = new Set(queue);
  const failed = [];
  let done = 0;
  let bytes = 0;

  while (queue.length > 0) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok || response.redirected) throw new Error(String(response.status));
      const body = await response.clone().arrayBuffer();
      bytes += body.byteLength;
      await cache.put(url, response);
      const type = response.headers.get("content-type") || "";
      if (type.includes("text/html") || type.includes("text/css")) {
        for (const asset of assetUrls(new TextDecoder().decode(body))) {
          if (!seen.has(asset)) {
            seen.add(asset);
            queue.push(asset);
          }
        }
      }
    } catch {
      failed.push(url);
    }
    done += 1;
    port.postMessage({ type: "progress", done, total: seen.size });
  }

  if (failed.length === 0) {
    await caches.delete(OFFLINE_CACHE);
    const final = await caches.open(OFFLINE_CACHE);
    const requests = await cache.keys();
    await Promise.all(requests.map(async (req) => final.put(req, await cache.match(req))));
  }
  await caches.delete(temp);
  port.postMessage({ type: "done", bytes, files: seen.size, failed });
}
