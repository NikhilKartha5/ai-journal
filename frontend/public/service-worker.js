const CACHE='aura-shell-v1';
const SHELL=['/','/index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method==='GET'&&url.pathname.startsWith('/api/')){e.respondWith(fetch(e.request).then(r=>{const clone=r.clone();caches.open('api-cache').then(c=>c.put(e.request,clone));return r;}).catch(()=>caches.match(e.request)));return;}if(e.request.method==='GET'){e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const clone=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,clone));return r;})));}});
