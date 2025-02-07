//Version number
const VERSION = "v1";
const CACHE_NAME = "cycletracker-" + VERSION;
//offline resources
const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
];

//save cache on install
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});

//Update PWA and delete old cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
            await clients.claim();
        })(),
    );
});

//fetch event. Respond with caches instead of network
self.addEventListener("fetch", (event) => {
    // when seeking an HTML page
    if (event.request.mode === "navigate") {
        // Return to the index.html page
        event.respondWith(caches.match("/"));
        return;
    }

    // For every other request type
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request.url);
            if (cachedResponse) {
                // Return the cached response if it's available.
                return cachedResponse;
            }
            // Respond with a HTTP 404 response status.
            return new Response(null, { status: 404 });
        })(),
    );
});
