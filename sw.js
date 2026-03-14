const STATIC_CACHE = 'imsakiye-static-v3';
const DYNAMIC_CACHE = 'imsakiye-dynamic-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Kurulum aşaması: Statik dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
          return caches.delete(key);
        }
      })
    ))
  );
});

// Getirme aşaması: API istekleri için Network-First (yoksa Cache'den), diğerleri için Cache-First
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Eğer Diyanet veya Aladhan API isteği ise:
  if (url.includes('api.aladhan.com') || url.includes('ezanvakti.emushaf.net')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone()); // Yeni veriyi önbelleğe kaydet
          return response;
        }).catch(() => {
          return cache.match(event.request); // İnternet yoksa eski veriyi göster
        });
      })
    );
  } else {
    // Statik dosyalar (HTML, icon vb.)
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});