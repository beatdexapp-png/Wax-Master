const CACHE='trackdex-v11';
const SHELL=['/','/index.html','/style.css','/data.js','/catalog.js','/app.js','/cloud.js','/eco.js','/social.js','/vendor/supabase.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Réseau d'abord pour nos fichiers (les mises à jour arrivent tout de suite), cache seulement hors ligne
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r.mode==='navigate'?'/index.html':r,cp))}return res}).catch(()=>caches.match(r.mode==='navigate'?'/index.html':r)))});
