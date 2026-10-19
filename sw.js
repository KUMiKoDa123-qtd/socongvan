const CACHE = "socongvan-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const font = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => {
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return res;
    }).catch(() => hit || (req.mode === "navigate" ? caches.match("index.html") : undefined));
    return hit || net;
  }));
});
