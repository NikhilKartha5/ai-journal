import React, { useEffect, useState } from 'react';
import { getQueueLength, flushQueue } from '../offline_sync';

interface OfflineBannerProps {
  token?: string | null;
  onSynced?: (idMap: Record<number | string, string>) => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ token, onSynced }) => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refreshQueue = async () => {
    const len = await getQueueLength();
    setQueueCount(len);
  };

  useEffect(() => {
    function handleOnline() { setOnline(true); refreshQueue(); attemptSync(); }
    function handleOffline() { setOnline(false); refreshQueue(); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshQueue();
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  async function attemptSync() {
    if (!token || !online || queueCount === 0) return;
    setSyncing(true);
    try {
      const map = await flushQueue(token);
      if (map && Object.keys(map).length) onSynced?.(map as any);
      await refreshQueue();
      if (await getQueueLength() === 0) setLastSync(new Date());
    } finally { setSyncing(false); }
  }

  const show = !online || queueCount > 0 || syncing;
  if (!show) return null;

  return (
  <div className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-between shadow ${online ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'}`}>
      <div className="flex items-center gap-2">
        {!online && <span className="font-semibold">Offline</span>}
        {online && syncing && <span className="font-semibold">Syncing…</span>}
        {!online && queueCount > 0 && <span>{queueCount} pending change{queueCount!==1?'s':''}</span>}
        {online && !syncing && queueCount > 0 && <span>{queueCount} queued</span>}
        {lastSync && online && queueCount === 0 && <span>Synced {lastSync.toLocaleTimeString()}</span>}
      </div>
      <div className="flex items-center gap-2">
        {online && queueCount > 0 && !syncing && (
          <button onClick={attemptSync} className="px-2 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 text-xs">Sync Now</button>
        )}
      </div>
    </div>
  );
};
