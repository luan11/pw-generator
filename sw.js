var CACHE_NAME = 'static-v1';

self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				'/index_en-US.html',
				'/assets/css/style.css',
				'/assets/js/bundle.min.js'
			]);
		})
	);
});

self.addEventListener('activate', function activator(e) {
	e.waitUntil(
		caches.keys().then(function(keys) {
			return Promise.all(
				keys
				.filter(function(key) {
					return key.indexOf(CACHE_NAME) !== 0;
				})
				.map(function(key) {
					return caches.delete(key);
				})
			);
		})
	);
});

self.addEventListener('fetch', function(e) {
	event.respondWith(
		caches.match(event.request).then(function(cachedResponse) {
			return cachedResponse || fetch(event.request);
		})
	);
});