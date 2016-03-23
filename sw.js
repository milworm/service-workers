self.addEventListener('install', function(e) {
  var version = '<buildno></buildno>',
    cacheName = 'cache_' + version,
    urls = [
      '/',
      '/index.html',
      '/js/app.js?build=' + version,
      '/css/app.css?build=' + version
    ],
    result;

  result = caches.open(cacheName).then(function(cache) {
    return cache.addAll(urls);
  }).then(function() {
    console.log('installed.')
  });

  e.waitUntil(result);
});

self.addEventListener('activate', function(e) {
  var cacheName = 'cache_<buildno></buildno>',
    result;

  result = caches.keys().then(function(keys) {
    return keys.map(function(name) {
      if(name != cacheName)
        return caches.delete(name);
    });
  }).then(function(promises) {
    return Promise.all(promises);
  });

  e.waitUntil(result);
});

self.addEventListener('fetch', function(e) {
  var cacheName = 'cache_<buildno></buildno>',
    result;

  result = caches.open(cacheName).then(function(cache) {
    return cache.match(e.request);
  }).then(function(response) {
    if(response)
      return response;

    return fetch(e.request);
  });

  e.respondWith(result);
});