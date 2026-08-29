// Bump APP_VERSION on every deploy (keep in sync with package.json).
// This changes CACHE_NAME, which makes `activate` below wipe out every
// old cache — the #1 reason people get stuck seeing an old build.
const APP_VERSION = "1.2.0";
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

// Network-first for the app shell only. A stale cache should never win
// over a reachable network — that's what caused old builds to stick
// around. Cache is only a fallback for when the network request
// actually fails (i.e. genuinely offline).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Only handle requests for THIS app's own origin (the static shell:
  // HTML/JS/CSS/manifest/icons). Cross-origin requests — most
  // importantly every API call to the AzarCloud Worker, which lives on
  // a different domain — are left completely alone and go straight to
  // the network via normal browser fetch. The API's own data should
  // never be intercepted, cloned, or cached by this layer; doing so
  // added a second, unnecessary place where a fetch could misbehave.
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache genuinely successful responses — caching an error
        // page would mean a transient 404/500 could keep getting served
        // back on the next load even after the real problem is gone.
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
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
