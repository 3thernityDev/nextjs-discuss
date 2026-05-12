const CACHE_VERSION = "v4-mobile-auth-flow";
const STATIC_CACHE = `discusslike-static-${CACHE_VERSION}`;
const PAGE_CACHE = `discusslike-pages-${CACHE_VERSION}`;

const APP_SHELL = [
    "/",
    "/login",
    "/register",
    "/manifest.webmanifest",
    "/icon.svg",
    "/icon-maskable.svg",
    "/icon-192.png",
    "/icon-512.png",
];

const OFFLINE_PAGE = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DiscussLike hors ligne</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,Helvetica,sans-serif;background:#fafafa;color:#27272a}
    main{max-width:28rem;padding:2rem;text-align:center}
    h1{font-size:1.5rem;margin:0 0 .5rem}
    p{color:#71717a;line-height:1.5}
  </style>
</head>
<body>
  <main>
    <h1>Vous etes hors ligne</h1>
    <p>Les derniers ecrans ouverts peuvent rester disponibles, mais l'envoi de messages et d'images necessite une connexion.</p>
  </main>
</body>
</html>`;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith("discusslike-") &&
                                key !== STATIC_CACHE &&
                                key !== PAGE_CACHE,
                        )
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(fetch(request));
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirstPage(request));
        return;
    }

    if (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname === "/manifest.webmanifest" ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".ico")
    ) {
        event.respondWith(cacheFirst(request));
        return;
    }

    event.respondWith(networkFirstPage(request));
});

async function networkFirstPage(request) {
    const cache = await caches.open(PAGE_CACHE);

    try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        const shell = await caches.match("/");
        if (shell) return shell;

        return new Response(OFFLINE_PAGE, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
    }

    return response;
}
