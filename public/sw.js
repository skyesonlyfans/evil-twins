/* eslint-disable no-restricted-globals */

// A name for our cache
const CACHE_NAME = 'eviltwins-audio-cache-v1';

// This is the core logic for a network-first caching strategy.
const networkFirst = async (request) => {
  try {
    // Always try to fetch from the network first.
    const networkResponse = await fetch(request);
    // If we get a valid response, open the cache and put a copy of it there for later.
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If the network fails (e.g., offline), try to get the response from the cache.
    console.log('Network failed, trying cache...');
    const cachedResponse = await caches.match(request);
    return cachedResponse;
  }
};

// Listen for fetch events
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // We only want to cache MP3 files using our network-first strategy.
  if (request.url.endsWith('.mp3')) {
    event.respondWith(networkFirst(request));
  }
});

// This event listener is how our main application will send messages to the service worker.
// We'll use this to tell it which songs to download.
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
