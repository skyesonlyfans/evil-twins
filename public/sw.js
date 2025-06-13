/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'eviltwins-audio-cache-v1';

// This is the core logic for a cache-first caching strategy.
const cacheFirst = async (request) => {
  // First, try to get the resource from the cache.
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  // If it's not in the cache, try to fetch it from the network.
  try {
    const networkResponse = await fetch(request);
    // If we get a valid response, cache it for later.
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If the network fails and it's not in the cache, we can't do anything.
    console.error('Network request failed and resource not in cache:', error);
    return;
  }
};

// Listen for fetch events
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // We only want to cache MP3 files using our cache-first strategy.
  if (request.url.endsWith('.mp3')) {
    event.respondWith(cacheFirst(request));
  }
});

// This event listener is how our main application will send messages to the service worker.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_SONGS') {
    const urlsToCache = event.data.payload.urls;
    if (urlsToCache && urlsToCache.length > 0) {
      console.log('Service Worker: Caching song URLs:', urlsToCache);
      caches.open(CACHE_NAME).then((cache) => {
        cache.addAll(urlsToCache).catch(err => {
            console.error('Service Worker: Failed to cache songs.', err);
        });
      });
    }
  }
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
