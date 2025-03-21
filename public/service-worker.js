/**
 * VeeMatch Service Worker
 * Minimal version for production use
 */

// Simple no-op service worker that takes immediate control
self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Claim clients to take control immediately
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler that doesn't cache but provides offline support
self.addEventListener('fetch', event => {
  // Don't try to handle non-GET requests or those going to dynamic routes
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/sign-') ||
    event.request.url.includes('/dashboard')
  ) {
    return;
  }

  // For GET requests to static resources, try network first then fallback to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Return the offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Otherwise just try to match the request in the cache
        return caches.match(event.request);
      })
  );
});
