// Synapse service worker.
//
// Caching policy (deliberately conservative so the app NEVER gets stuck on a
// stale version — the previous version cached the manifest + all assets
// cache-first, which pinned old code and an old start_url even after reinstall):
//
//   - /api/*                  -> network only (live medical data, never cached)
//   - manifest + sw           -> network only (so start_url / SW updates apply)
//   - navigations (HTML)      -> network-first, fall back to cached "/" offline
//   - /_next/static/*         -> cache-first (content-hashed, immutable)
//   - icons                   -> cache-first
//   - everything else         -> network only
//
// Bump CACHE on any change here so the new SW activates, purges old caches,
// and takes over clients.

const CACHE = "synapse-shell-v2";
const PRECACHE = ["/", "/icon-192x192.png", "/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function isImmutableAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname === "/icon-192x192.png" ||
    pathname === "/icon-512x512.png" ||
    pathname === "/icon-maskable-512x512.png" ||
    pathname === "/apple-touch-icon.png"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Live data and PWA control files must always come from the network so the
  // app can update itself (manifest start_url, new SW, fresh API responses).
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/sw.js"
  ) {
    return; // let the browser fetch normally, no caching
  }

  // HTML navigations: network-first, cached "/" only as an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((r) => r || Response.error()),
      ),
    );
    return;
  }

  // Immutable, content-hashed assets: cache-first (safe — URL changes on rebuild).
  if (isImmutableAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((resp) => {
            if (resp.ok && resp.type === "basic") {
              const copy = resp.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return resp;
          }),
      ),
    );
    return;
  }

  // Everything else: straight to network (no stale-cache trap).
});
