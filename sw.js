// Offline: guarda o app na primeira visita; mudou o app, troque a versão para renovar o cache.
const V = 'tp-v17', FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
// Fundo virtual: biblioteca e modelo do MediaPipe (versao fixa) ficam em cache proprio para funcionar offline depois da 1a vez.
const VBG = 'tp-vbg', VBG_HOSTS = ['cdn.jsdelivr.net', 'storage.googleapis.com'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== VBG).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method === 'GET' && VBG_HOSTS.includes(u.hostname) && /mediapipe/.test(u.pathname)) {
    e.respondWith(caches.open(VBG).then(c => c.match(e.request).then(h => h || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // rede primeiro (pega versão nova), cache se estiver sem internet
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
