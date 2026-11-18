// Guarda a "casca" do app no aparelho (abre mais rápido e mostra um aviso quando estiver sem internet).
// O sistema em si (Apps Script) sempre vem da internet.
const VERSAO = 'colonia-app-v1';
const ARQUIVOS = ['./', './index.html', './config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== 'GET' || url.origin !== self.location.origin) return; // o sistema (Google) não passa por aqui
  // primeiro a internet (para pegar atualizações); sem internet, a cópia guardada
  ev.respondWith(fetch(ev.request).then(r => {
    const copia = r.clone(); caches.open(VERSAO).then(c => c.put(ev.request, copia)); return r;
  }).catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html'))));
});
