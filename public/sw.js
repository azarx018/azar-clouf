// Bump APP_VERSION on every deploy (keep in sync with package.json).
// This changes CACHE_NAME, which makes `activate` below wipe out every
// old cache — the #1 reason people get stuck seeing an old build.
const APP_VERSION = "1.0.2";
const CACHE_NAME = `azarcloud-shell-v${APP_VERSION}`;
const SHELL_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for EVERYTHING. A stale cache should never win over a
// reachable network — that's what caused old builds to stick around.
// Cache is only a fallback for when the network request actually fails
// (i.e. genuinely offline), and only successful GET responses get cached.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("/index.html");
          return Response.error();
        })
      )
  );
});

// Let the page ask this SW to take over immediately (used by the
// "Force update" button in Settings, and for future update prompts).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
