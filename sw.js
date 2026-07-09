self.addEventListener('fetch', function(event) {
  // Keeps the app happy and installable by intercepting network requests
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});