// Simplified network-first service worker to avoid serving stale bundles.
// Bump CACHE_VERSION to invalidate old caches.
const CACHE_VERSION = 'v3';
const APP_CACHE = `aura-shell-${CACHE_VERSION}`;
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(APP_CACHE).then(cache => cache.addAll(SHELL))
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(keys => Promise.all(
			keys.filter(k => k !== APP_CACHE).map(k => caches.delete(k))
		)).then(() => self.clients.claim())
	);
});

// Helper: cache static hashed assets (stale-while-revalidate)
function isStaticAsset(url) {
	return /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|gif|webp|svg)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return; // let non-GET pass through
	const url = new URL(req.url);

	// API: network-first, fallback to cache if offline
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			fetch(req).then(res => {
				const copy = res.clone();
				caches.open('api-cache').then(c => c.put(req, copy));
				return res;
			}).catch(() => caches.match(req) || new Response('Offline', { status: 503 }))
		);
		return;
	}

	// Navigation requests: always try network first to get fresh index.html
	if (req.mode === 'navigate') {
		event.respondWith(
			fetch(req).then(res => {
				const copy = res.clone();
				caches.open(APP_CACHE).then(c => c.put('/', copy));
				return res;
			}).catch(() => caches.match('/') || caches.match('/index.html'))
		);
		return;
	}

	// Static asset: stale-while-revalidate
	if (url.origin === location.origin && isStaticAsset(url)) {
		event.respondWith(
			caches.match(req).then(cached => {
				const fetchPromise = fetch(req).then(res => {
					const copy = res.clone();
						caches.open(APP_CACHE).then(c => c.put(req, copy));
						return res;
				}).catch(() => cached);
				return cached || fetchPromise;
			})
		);
		return;
	}
	// Fallback: default network
});
