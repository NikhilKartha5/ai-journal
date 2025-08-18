import { addQueue, getQueue, removeQueue, saveEntries, getEntries, OfflineDiaryEntry, deleteEntryLocal, removeCreateQueueForTempId, saveCache, loadCache } from './offline_db';

const API = 'http://localhost:5000/api';

export async function loadLocal() { return getEntries(); }

export async function queueCreate(entry: OfflineDiaryEntry) {
  await saveEntries([{ ...entry, pending: true, temp: true }]);
  await addQueue({ key: 'create-' + entry.id, method: 'POST', url: API + '/diary', body: { date: entry.timestamp, mood: '', content: entry.text, analysis: JSON.stringify(entry.analysis) }, createdAt: Date.now(), tempId: entry.id, type: 'create' });
}

export async function queueDelete(id: number | string) {
  await addQueue({ key: 'delete-' + id, method: 'DELETE', url: API + '/diary/' + id, body: null, createdAt: Date.now(), type: 'delete' });
}

export async function queueUpdate(id: string, changes: Partial<OfflineDiaryEntry>, baseVersion?: string) {
  await addQueue({ key: 'update-' + id + '-' + Date.now(), method: 'PUT', url: API + '/diary/' + id, body: { ...changes, baseVersion }, createdAt: Date.now(), type: 'update', tempId: id, baseVersion });
}

export async function offlineDelete(id: number | string) {
  // If it's a temp create not yet synced, just remove the queued create and local entry.
  if (typeof id === 'number') {
    await removeCreateQueueForTempId(id);
  }
  await deleteEntryLocal(id);
}

export async function flushQueue(token: string) {
  if (!navigator.onLine) return;
  const items = await getQueue();
  if (!items.length) return {} as Record<number,string>;
  const done: string[] = [];
  const idMap: Record<number, string> = {};
  for (const it of items) {
    try {
      const res = await fetch(it.url, { method: it.method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: it.body ? JSON.stringify(it.body) : undefined });
      if (res.ok) {
        if (it.type === 'create') {
          const data = await res.json();
          if (data && data._id && it.tempId) idMap[it.tempId] = data._id;
        } else if (it.type === 'update') {
          if (res.status === 409) {
            // Leave in queue for manual resolution or implement strategy: fetch latest & reapply
            continue; // skip removal so user can resolve
          }
        }
        done.push(it.key);
      }
    } catch {}
  }
  if (done.length) await removeQueue(done);
  return idMap;
}

export async function getQueueLength(): Promise<number> {
  const items = await getQueue();
  return items.length;
}

// Simple cache helpers for other data sets
export async function cacheCommunity(posts: any[]) { await saveCache('community:feed', posts); }
export async function loadCommunityCache() { return loadCache('community:feed'); }
