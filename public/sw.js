/**
 * DEAL Service Worker
 * Sprint 7 - Epic 11: PWA Service Worker
 */

const CACHE_VERSION = "deal-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Resources to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/offline",
  "/manifest.json",
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      return cached || caches.match("/offline");
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return caches.match("/offline");
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });

    return cached || fetchPromise;
  },

  // Network only (for API calls that shouldn't be cached)
  networkOnly: async (request) => {
    return fetch(request);
  },
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API calls - network first
  if (url.pathname.startsWith("/api/")) {
    // Don't cache POST/PUT/DELETE
    if (request.method !== "GET") {
      return;
    }
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Static assets (JS, CSS) - stale while revalidate
  if (
    url.pathname.match(/\.(js|css|woff2?)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
    return;
  }

  // Images - cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Return placeholder for failed images
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f3f4f6" width="100" height="100"/></svg>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        }
      })()
    );
    return;
  }

  // HTML pages - network first
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-quotes") {
    event.waitUntil(syncQuotes());
  }
});

async function syncQuotes() {
  const db = await openDB();
  const pendingQuotes = await db.getAll("pending-quotes");

  for (const quote of pendingQuotes) {
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      await db.delete("pending-quotes", quote.id);
    } catch {
      // Will retry on next sync
    }
  }
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("deal-offline", 1);
    request.onerror = reject;
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (store) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = rej;
          }),
        delete: (store, key) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readwrite");
            const req = tx.objectStore(store).delete(key);
            req.onsuccess = () => res();
            req.onerror = rej;
          }),
      });
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-quotes")) {
        db.createObjectStore("pending-quotes", { keyPath: "id" });
      }
    };
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || "Nouvelle notification DEAL",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      { action: "view", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "DEAL", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
