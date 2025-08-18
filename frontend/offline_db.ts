// Simple IndexedDB wrapper for offline diary entries & queue
export interface OfflineDiaryEntry { id: number | string; text: string; title?: string; tags?: string[]; timestamp: string; analysis: any; pending?: boolean; temp?: boolean; updatedAt?: string; localUpdatedAt?: string; }
export interface QueueItem { key: string; method: string; url: string; body: any; createdAt: number; tempId?: number | string; type?: 'create' | 'delete' | 'update'; baseVersion?: string; }

const DB_NAME = 'auraOffline';
const VERSION = 1;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('entries')) db.createObjectStore('entries', { keyPath: 'id' });
  if (!db.objectStoreNames.contains('queue')) db.createObjectStore('queue', { keyPath: 'key' });
  if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
  if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => void) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    try { fn(s); } catch (e) { reject(e); }
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export async function saveEntries(entries: OfflineDiaryEntry[]) {
  if (!entries.length) return;
  await tx('entries', 'readwrite', s => entries.forEach(e => s.put(e)));
}

export async function getEntries(): Promise<OfflineDiaryEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction('entries', 'readonly');
    const r = t.objectStore('entries').getAll();
    r.onsuccess = () => resolve(r.result as OfflineDiaryEntry[]);
    r.onerror = () => reject(r.error);
  });
}

export async function addQueue(item: QueueItem) {
  await tx('queue', 'readwrite', s => s.put(item));
}

export async function getQueue(): Promise<QueueItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction('queue', 'readonly');
    const r = t.objectStore('queue').getAll();
    r.onsuccess = () => resolve(r.result as QueueItem[]);
    r.onerror = () => reject(r.error);
  });
}

export async function removeQueue(keys: string[]) {
  if (!keys.length) return;
  await tx('queue', 'readwrite', s => keys.forEach(k => s.delete(k)));
}

export async function deleteEntryLocal(id: number | string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction('entries','readwrite');
    t.objectStore('entries').delete(id);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function removeCreateQueueForTempId(tempId: number | string) {
  const db = await openDb();
  const items: QueueItem[] = await new Promise((resolve,reject)=>{
    const t = db.transaction('queue','readonly');
    const r = t.objectStore('queue').getAll();
    r.onsuccess = () => resolve(r.result as QueueItem[]);
    r.onerror = () => reject(r.error);
  });
  const toRemove = items.filter(i => i.type==='create' && i.tempId===tempId).map(i=>i.key);
  if (toRemove.length) await removeQueue(toRemove);
}

// Settings & user persistence
export async function saveSetting(key: string, value: any) {
  await tx('settings','readwrite', s => s.put({ key, value }));
}
export async function loadSetting(key: string) {
  const db = await openDb();
  return new Promise<any>((resolve,reject)=>{
    const t = db.transaction('settings','readonly');
    const r = t.objectStore('settings').get(key); r.onsuccess=()=>resolve(r.result?.value); r.onerror=()=>reject(r.error);
  });
}

// Generic cache (e.g., community feed, recommendations)
export async function saveCache(key: string, value: any) { await tx('cache','readwrite', s => s.put({ key, value, ts: Date.now() })); }
export async function loadCache(key: string) { const db = await openDb(); return new Promise<any>((resolve,reject)=>{ const t=db.transaction('cache','readonly'); const r=t.objectStore('cache').get(key); r.onsuccess=()=>resolve(r.result?.value); r.onerror=()=>reject(r.error); }); }

// Simple migration/version meta
export const OFFLINE_SCHEMA_VERSION = 1;
export async function ensureSchemaVersion() { await saveSetting('__schemaVersion', OFFLINE_SCHEMA_VERSION); }
