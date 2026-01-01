const CACHE_NAME = 'life-planner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/storage.js',
  '/js/timer.js',
  '/js/router.js',
  '/js/components.js',
  '/js/onboarding.js',
  '/js/steps.js',
  '/js/dashboard.js',
  '/js/settings.js',
  '/js/pdf-export.js',
  '/js/app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache install error:', err);
      })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();

        // Open cache and store the new response
        caches.open(CACHE_NAME)
          .then(cache => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseClone);
            }
          });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Handle push notifications for reminders
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Time to review your annual plan and update your progress!',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Life Planner Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
