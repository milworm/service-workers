var VERSION = '<buildno></buildno>', 
  CACHE_NAME = 'cache_' + VERSION,
  CACHED_URLS = [
    '/',
    '/index.html',
    '/js/app.js?build=' + VERSION,
    '/css/app.css?build=' + VERSION
  ];

self.addEventListener('install', function(e) {
  var result = caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(CACHED_URLS);
  }).then(function() {
    console.log('installed.')
  });

  e.waitUntil(result);
});

self.addEventListener('fetch', function(e) {
  var result = caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(e.request);
  }).then(function(response) {
    if(response)
      return response;

    return fetch(e.request);
  });

  e.respondWith(result);
});