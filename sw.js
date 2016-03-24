var cacheName = 'cache_<buildno></buildno>';

self.addEventListener('install', function(e) {
  var result = caches.open(cacheName).then(function(cache) {
    return cache.addAll([
      '/',
      '/index.html',
      '/js/app.js',
      '/css/app.css'
    ]);
  }).then(function() {
    return self.registration.pushManager.subscribe({
      userVisibleOnly: true
    })
  }).then(function() {
    console.log('installed.')
    return self.skipWaiting();
  });

  e.waitUntil(result);
});

self.addEventListener('activate', function(e) {
  var result = caches.keys().then(function(keys) {
    return keys.map(function(name) {
      if(name != cacheName)
        return caches.delete(name);
    });
  }).then(function(promises) {
    return Promise.all(promises);
  }).then(function() {
    return self.clients.claim();
  });

  e.waitUntil(result);
});

self.addEventListener('fetch', function(e) {
  var result = caches.open(cacheName).then(function(cache) {
    return cache.match(e.request);
  }).then(function(response) {
    if(response)
      return response;

    return fetch(e.request);
  });

  e.respondWith(result);
});

self.addEventListener('push', function(e) {
  console.log('push message received');

  var result = self.registration.showNotification("Title", {
    body: 'Body'
  });

  e.waitUntil(result);
});