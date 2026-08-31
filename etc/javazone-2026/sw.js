const CACHE_NAME = "javazone-2026-shell-v2";
const APP_SCOPE = "/etc/javazone-2026/";
const APP_SHELL = [
	"./",
	"./index.html",
	"./styles.css",
	"./app.js",
	"./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter(
							(cacheName) =>
								cacheName.startsWith("javazone-2026-shell-") &&
								cacheName !== CACHE_NAME,
						)
						.map((cacheName) => caches.delete(cacheName)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	const requestUrl = new URL(event.request.url);
	if (
		requestUrl.origin !== self.location.origin ||
		!requestUrl.pathname.startsWith(APP_SCOPE)
	) {
		return;
	}

	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(() =>
				caches
					.match("./")
					.then((response) => response || caches.match("./index.html")),
			),
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request).then((response) => {
				if (response?.status !== 200 || response.type !== "basic") {
					return response;
				}

				const responseClone = response.clone();
				event.waitUntil(
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseClone);
					}),
				);
				return response;
			});
		}),
	);
});
