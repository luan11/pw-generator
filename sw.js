var CACHE_NAME = 'static-v1';

self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			return cache.addAll([
				'/pw-generator/',
				'/pw-generator/index.html',
				'/pw-generator/index_en-US.html',
				'/pw-generator/assets/css/style.css',
				'/pw-generator/assets/js/bundle.min.js'
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
	e.respondWith(
		caches.match(e.request).then(function(cachedResponse) {
			return cachedResponse || fetch(e.request);
		})
	);
});