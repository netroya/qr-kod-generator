// Enhanced Service Worker for QR Generator Pro
const CACHE_NAME = 'qr-generator-pro-v2.0.0';
const STATIC_CACHE_NAME = 'qr-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'qr-dynamic-v2.0.0';

// Enhanced caching strategy
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/favicon.ico',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

const DYNAMIC_ASSETS = [
    'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

// Network strategies
const CACHE_FIRST_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:js|css)$/,
    /fonts\.googleapis\.com/,
    /cdnjs\.cloudflare\.com/
];

const NETWORK_FIRST_PATTERNS = [
    /api\./,
    /analytics\./,
    /gtag/
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('SW: Installing enhanced service worker v2.0.0');
    
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('SW: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                console.log('SW: Pre-caching dynamic assets');
                return Promise.allSettled(
                    DYNAMIC_ASSETS.map(url => 
                        cache.add(url).catch(err => console.warn(`SW: Failed to cache ${url}:`, err))
                    )
                );
            })
        ]).then(() => {
            console.log('SW: Installation completed successfully');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('SW: Activating enhanced service worker');
    
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ]).then(() => {
            console.log('SW: Activation completed successfully');
            
            // Notify all clients about the update
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        message: 'Service Worker güncellendi!'
                    });
                });
            });
        })
    );
});

// Enhanced fetch handler with multiple strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const { url, method } = request;
    
    // Skip non-GET requests
    if (method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.startsWith('http')) {
        return;
    }
    
    // Skip analytics and tracking requests when offline
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Use cache-first strategy for assets
    if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // Default: stale-while-revalidate for HTML pages
    event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Cache-first failed for:', request.url, error);
        
        // Return offline fallback if available
        if (request.destination === 'document') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        throw error;
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Network-first failed for:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Update cache in background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('SW: Background fetch failed for:', request.url, error);
    });
    
    // Return cached version immediately, or wait for network
    return cachedResponse || fetchPromise;
}

// Background sync for offline QR generation queue
self.addEventListener('sync', event => {
    if (event.tag === 'qr-generation-queue') {
        console.log('SW: Processing QR generation queue');
        event.waitUntil(processQRQueue());
    }
});

// Process offline QR generation queue
async function processQRQueue() {
    try {
        const queueData = await getQRQueue();
        
        for (const qrData of queueData) {
            try {
                // Process QR generation offline
                await generateQROffline(qrData);
                
                // Notify client
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'QR_GENERATED_OFFLINE',
                        data: qrData
                    });
                });
                
                // Remove from queue
                await removeFromQRQueue(qrData.id);
                
            } catch (error) {
                console.error('SW: Failed to process QR from queue:', error);
            }
        }
    } catch (error) {
        console.error('SW: Failed to process QR queue:', error);
    }
}

// IndexedDB helpers for offline queue
async function getQRQueue() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('QRGeneratorDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['qr_queue'], 'readonly');
            const store = transaction.objectStore('qr_queue');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('qr_queue')) {
                const store = db.createObjectStore('qr_queue', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

async function removeFromQRQueue(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('QRGeneratorDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['qr_queue'], 'readwrite');
            const store = transaction.objectStore('qr_queue');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Enhanced push notification handling
self.addEventListener('push', event => {
    console.log('SW: Push notification received');
    
    const options = {
        body: 'QR kodunuz hazır!',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'qr-notification',
        data: event.data ? event.data.json() : {},
        actions: [
            {
                action: 'view',
                title: 'Görüntüle',
                icon: '/favicon.svg'
            },
            {
                action: 'dismiss',
                title: 'Kapat'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('QR Generator Pro', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                // Focus existing window or open new one
                if (clients.length > 0) {
                    return clients[0].focus();
                }
                return self.clients.openWindow('/');
            })
        );
    }
});

// Enhanced message handling
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                event.ports[0].postMessage({ size });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'ADD_TO_QR_QUEUE':
            addToQRQueue(data).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(name => caches.delete(name))
    );
}

async function addToQRQueue(qrData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('QRGeneratorDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['qr_queue'], 'readwrite');
            const store = transaction.objectStore('qr_queue');
            
            const queueItem = {
                id: Date.now(),
                ...qrData,
                timestamp: new Date().toISOString()
            };
            
            const addRequest = store.add(queueItem);
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

console.log('SW: Enhanced service worker v2.0.0 loaded successfully');