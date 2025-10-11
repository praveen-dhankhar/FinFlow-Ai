const CACHE_NAME = 'finance-forecast-v1'
const STATIC_CACHE = 'finance-forecast-static-v1'
const DYNAMIC_CACHE = 'finance-forecast-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/transactions',
  '/categories',
  '/goals',
  '/budgets',
  '/analytics',
  '/forecasts',
  '/settings',
  '/profile',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard',
  '/api/transactions',
  '/api/categories',
  '/api/goals',
  '/api/budgets',
  '/api/analytics',
  '/api/forecasts',
  '/api/user/profile',
  '/api/user/stats'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request)
    )
    return
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(
      cacheFirstStrategy(request)
    )
    return
  }

  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(request)
    )
    return
  }

  // Default to network-first for other requests
  event.respondWith(
    networkFirstStrategy(request)
  )
})

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Service Worker: Fetch failed', error)
    throw error
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf')
  )
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await syncAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action, error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Finance Forecast',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'finance-notification',
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Finance Forecast', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    )
  }
})

// Helper functions for IndexedDB operations
async function getPendingActions() {
  // Implementation would depend on your IndexedDB setup
  return []
}

async function syncAction(action) {
  // Implementation would depend on your API structure
  console.log('Service Worker: Syncing action', action)
}

async function removePendingAction(actionId) {
  // Implementation would depend on your IndexedDB setup
  console.log('Service Worker: Removing pending action', actionId)
}
