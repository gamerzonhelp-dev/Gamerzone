/* GAMERZONE service worker: makes the site installable and keeps the app shell for offline.
   It always tries the network first, so a new upload shows up straight away.
   Bump VERSION when you want every phone to drop its old copy. */
const VERSION = "gz-2";
self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; /* Firebase, Audius, fonts: never touched */
  if (/admin/i.test(u.pathname)) return; /* admin panel is never cached */
  e.respondWith(
    fetch(r)
      .then((res) => {
        if (res && res.ok) {
          const c = res.clone();
          caches.open(VERSION).then((ch) => ch.put(r, c));
        }
        return res;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match("index.html"))),
  );
});
