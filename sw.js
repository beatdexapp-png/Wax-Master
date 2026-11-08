const CACHE='waxdrop-v75';
const SHELL=['/','/index.html','/style.css','/data.js','/catalog.js','/app.js','/cloud.js','/eco.js','/social.js','/vendor/motion.js','/fx.js','/share.js','/stats.js','/preview.js','/polish.js','/events.js','/labels.js','/joueur.js','/accueil.js','/classeur.js','/revenir.js','/vitrine.js','/hub.js','/lot4.js','/lot5.js','/sobre.js','/lot6.js','/retouches.js','/retouches2.js','/vendor/supabase.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// catalog.json (7 Mo) passe directement par le réseau : catalog.js le garde déjà dans IndexedDB pour le hors ligne
// Réseau d'abord, en revalidant toujours auprès du serveur (pas de copie vieille de 10 min), cache seulement hors ligne
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;if(u.pathname.startsWith('/artistes')||u.pathname.startsWith('/a-propos')||u.pathname.startsWith('/regles')||u.pathname.startsWith('/retrait')||u.pathname.endsWith('.xml')||u.pathname.endsWith('.txt')||u.pathname==='/catalog.json')return;
  /* images du jeu (/img/) : cache d'abord. Elles changent avec le numéro de cache, qui vide l'ancien à l'activation.
     Les pochettes Deezer/Spotify (autres domaines) ne passent pas ici : réponses opaques, comptées très cher dans le quota du navigateur. */
  if(u.pathname.startsWith('/img/')){e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(h=>h||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));return}
  e.respondWith((r.mode==='navigate'?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r,{cache:'no-cache'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r.mode==='navigate'?'/index.html':r,cp))}return res}).catch(()=>caches.match(r.mode==='navigate'?'/index.html':r)))});
// lot 3 : notifications web push (réserve pleine, échange proposé, série en danger), envoyées par la fonction Edge « push »
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'WaxDrop',{body:d.body||'',tag:d.tag||'wd',icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',data:{url:d.url||'/'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{for(const c of L){if('focus' in c)return c.focus()}return self.clients.openWindow(u)}))});
