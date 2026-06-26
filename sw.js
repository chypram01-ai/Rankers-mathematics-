// Rankers Mathematics SW v3 — Update version on every deploy!
var CACHE = 'rankers-v3';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); }) // Delete old caches
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

self.addEventListener('fetch', function(e) {
  // Network first for HTML (always fresh), cache for others
  if(e.request.url.indexOf('.html') !== -1 || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(function(response){
        var clone = response.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return response;
      }).catch(function(){
        return caches.match(e.request);
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(r){
        return r || fetch(e.request).catch(function(){ 
          return caches.match('./index.html'); 
        });
      })
    );
  }
});
