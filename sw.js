const CACHE_NAME = 'imsakiye-v1';
const ASSETS = [
  './',
  './index.html'
];

// Kurulum aşaması: Dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );
});

// Getirme aşaması: İnternet yoksa önbellekten yükle
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});