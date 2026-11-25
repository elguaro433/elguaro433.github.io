// Japón 2027: funciona sin conexión. Primero intenta la red (para recibir cambios) y si no hay, usa la copia guardada.
const CACHE='japon-v9';
const BASE=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('japon-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname==='firestore.googleapis.com') return;
  const local=u.origin===location.origin;
  e.respondWith(fetch(local?e.request.url:e.request,local?{cache:'no-store'}:undefined).then(r=>{
    if(r.ok||r.type==='opaque'){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(local?caches.match('./'):undefined))));
});
