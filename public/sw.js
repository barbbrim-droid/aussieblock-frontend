// Minimal service worker. Its only job is to exist with a fetch handler so the
// browser offers "Install app" — installing the dispatch board is what lets the
// new-order alarm play sound WITHOUT a click after launch (installed PWAs are
// granted autoplay). We don't cache anything: the board must always show live
// data, so every request passes straight through to the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => { /* pass-through (no respondWith) = normal network */ });
