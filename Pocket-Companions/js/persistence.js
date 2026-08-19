const DATABASE_NAME = 'pocket-companions-memory';
const DATABASE_VERSION = 1;
const STORE_NAME = 'snapshots';

const cloneValue = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export class PersistentRepository {
  constructor() {
    this.dbPromise = this.open();
  }

  open() {
    if (!('indexedDB' in globalThis)) return Promise.resolve(null);
    return new Promise((resolve) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[Pocket Companions] IndexedDB unavailable; using localStorage mirror.', request.error);
        resolve(null);
      };
      request.onblocked = () => resolve(null);
    });
  }

  async get(key) {
    const db = await this.dbPromise;
    if (!db) return null;
    try {
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => resolve(null);
        transaction.onabort = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async put(key, value) {
    const db = await this.dbPromise;
    if (!db) return false;
    try {
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(cloneValue(value), key);
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async clear() {
    const db = await this.dbPromise;
    if (!db) return false;
    try {
      return await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).clear();
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async requestDurableStorage() {
    try {
      if (!navigator.storage?.persist) return false;
      if (await navigator.storage.persisted?.()) return true;
      return Boolean(await navigator.storage.persist());
    } catch {
      return false;
    }
  }
}
