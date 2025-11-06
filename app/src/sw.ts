/// <reference lib="webworker" />

/**
 * Service Worker for PWA functionality and cross-origin proxy
 * 
 * This SW provides:
 * 1. Basic caching for offline support
 * 2. Proxy functionality for cross-origin requests
 * 
 * TODO: Wire real endpoint URLs from environment/config
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle Service Worker proxy requests
  // Format: /sw-proxy?targetKey=<endpointKey>&...otherParams
  if (url.pathname === '/sw-proxy') {
    event.respondWith(handleProxyRequest(event.request));
    return;
  }

  // Regular cache-first strategy for assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

/**
 * Proxy handler for cross-origin requests
 * 
 * This allows the app to make requests to external APIs without CORS issues.
 * The app calls /sw-proxy?targetKey=<key> and the SW fetches the actual endpoint.
 * 
 * TODO: Load actual endpoint URLs from /endpoints.json at runtime
 */
async function handleProxyRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const targetKey = url.searchParams.get('targetKey');

    if (!targetKey) {
      return new Response(JSON.stringify({ error: 'Missing targetKey parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Fetch endpoints.json and map targetKey to actual URL
    // For now, this is a lightweight example showing the proxy pattern
    
    // Example mapping (replace with real endpoint URLs from config):
    const endpointMap: Record<string, string> = {
      apiEndpoint: 'https://api.example.com/v1',
      authEndpoint: 'https://api.example.com/auth',
      // Add more endpoints as needed
    };

    const targetUrl = endpointMap[targetKey];

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Unknown targetKey' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Clone the request and modify the URL
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
    });

    // Fetch from the actual endpoint
    const response = await fetch(proxyRequest);

    // Return the response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('[SW Proxy] Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export {};