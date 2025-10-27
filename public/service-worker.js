const CACHE_NAME = "uninest-shell-v2";
const SKIP_WAITING_MESSAGE_TYPE = "SKIP_WAITING";
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];
const PRECACHE_URLS = new Set(
  PRECACHE_ASSETS.map((asset) => new URL(asset, self.location.origin).href),
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === SKIP_WAITING_MESSAGE_TYPE) {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html")),
    );
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (PRECACHE_URLS.has(requestUrl.href)) {
    event.respondWith(
      caches.match(request).then(match => match ?? fetch(request)),
    );
  }
});
