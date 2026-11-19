'use strict';
/* Service Worker מינימלי: מאפשר התקנה כאפליקציה. לא שומר שירים במטמון. */
const OFFLINE = '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TIAMO</title>' +
  '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0b;color:#f6dc95;font-family:system-ui;text-align:center">' +
  '<div><h1>TIAMO MUSIC</h1><p>אין חיבור לאינטרנט.<br>נסו שוב בעוד רגע.</p><button onclick="location.reload()" style="padding:10px 22px;border-radius:99px;border:1px solid #f6dc95;background:none;color:#fff;font-size:1rem">נסו שוב</button></div></body></html>';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
