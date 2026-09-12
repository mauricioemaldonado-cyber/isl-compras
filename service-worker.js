// Service worker mínimo: necesario para que el navegador ofrezca "Instalar app",
// pero no cachea nada — siempre pide los datos frescos al servidor (Apps Script).
// Esto es intencional: los pedidos/OC/PM cambian todo el tiempo, no queremos
// que alguien vea datos viejos guardados en caché.

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
