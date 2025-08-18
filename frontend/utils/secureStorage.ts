// Minimal symmetric encryption wrapper for localStorage using Web Crypto
// NOTE: This is light obfuscation, not equal to system secure storage.

const STORAGE_PREFIX = 'aura.sec.';
let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  let salt = localStorage.getItem(STORAGE_PREFIX + 'salt');
  if (!salt) {
    salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
    localStorage.setItem(STORAGE_PREFIX + 'salt', salt);
  }
  const enc = new TextEncoder();
  const base = salt + navigator.userAgent;
  const material = await crypto.subtle.importKey('raw', enc.encode(base), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('aura-fixed-salt'), iterations: 100000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
  cachedKey = key; return key;
}

export async function secureSet(key: string, value: any) {
  try {
    const json = JSON.stringify(value);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await getKey();
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(json));
    const payload = btoa(String.fromCharCode(...iv) + '|' + String.fromCharCode(...new Uint8Array(cipher)));
    localStorage.setItem(STORAGE_PREFIX + key, payload);
  } catch {}
}

export async function secureGet(key: string) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key); if (!raw) return null;
    const bin = atob(raw);
    const sep = bin.indexOf('|'); if (sep === -1) return null;
    const ivStr = bin.slice(0, sep); const dataStr = bin.slice(sep+1);
    const iv = Uint8Array.from(ivStr, c => c.charCodeAt(0));
    const data = Uint8Array.from(dataStr, c => c.charCodeAt(0));
    const k = await getKey();
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, data);
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch { return null; }
}

export function secureRemove(key: string) { try { localStorage.removeItem(STORAGE_PREFIX + key); } catch {} }
export function wipeAllSecure() { try { Object.keys(localStorage).forEach(k => { if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k); }); } catch {} }
