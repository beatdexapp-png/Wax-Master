const CACHE='waxdrop-v36';
const SHELL=['/','/index.html','/style.css','/data.js','/catalog.js','/app.js','/cloud.js','/eco.js','/social.js','/vendor/motion.js','/fx.js','/share.js','/vendor/supabase.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Réseau d'abord, en revalidant toujours auprès du serveur (pas de copie vieille de 10 min), cache seulement hors ligne
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith((r.mode==='navigate'?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r,{cache:'no-cache'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r.mode==='navigate'?'/index.html':r,cp))}return res}).catch(()=>caches.match(r.mode==='navigate'?'/index.html':r)))});
