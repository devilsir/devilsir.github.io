(function (App) {
  "use strict";

  const {
    DEFAULT_SETTINGS,
    HISTORY_DB,
    HISTORY_DB_VERSION,
    HISTORY_STORE,
    SETTINGS_KEY
  } = App.config;
  const { compressImageForHistory } = App.imageProcessing;

  let dbPromise = null;

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return { ...DEFAULT_SETTINGS, ...raw };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn("Não foi possível salvar preferências:", err);
    }
  }

  function dbRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function openHistoryDb() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB indisponível"));
        return;
      }
      const request = indexedDB.open(HISTORY_DB, HISTORY_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const store = db.createObjectStore(HISTORY_STORE, {
            keyPath: "id",
            autoIncrement: true
          });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });

    return dbPromise;
  }

  async function getStorageEstimate() {
    try {
      if (!navigator.storage?.estimate) {
        return { usageMB: null, quotaMB: null };
      }
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return {
        usageMB: usage / 1024 / 1024,
        quotaMB: quota / 1024 / 1024
      };
    } catch {
      return { usageMB: null, quotaMB: null };
    }
  }

  async function requestPersistentStorage() {
    let persisted = false;
    try {
      if (navigator.storage?.persist) {
        persisted = await navigator.storage.persist();
      }
    } catch {}

    const estimate = await getStorageEstimate();
    return { persisted, ...estimate };
  }

  async function saveHistoryPage({ imageFile, text, language, confidence = null, rotation = 0 }) {
    if (!imageFile || !text?.trim()) return null;

    const db = await openHistoryDb();
    const imageBlob = await compressImageForHistory(imageFile, rotation);

    const record = {
      createdAt: Date.now(),
      language,
      confidence,
      text: text.trim(),
      imageBlob
    };

    const tx = db.transaction(HISTORY_STORE, "readwrite");
    return dbRequest(tx.objectStore(HISTORY_STORE).add(record));
  }

  async function getHistoryPages() {
    const db = await openHistoryDb();
    const tx = db.transaction(HISTORY_STORE, "readonly");
    const records = await dbRequest(tx.objectStore(HISTORY_STORE).getAll());
    return records.sort((a, b) => b.createdAt - a.createdAt);
  }

  async function getHistoryPage(id) {
    const db = await openHistoryDb();
    const tx = db.transaction(HISTORY_STORE, "readonly");
    return dbRequest(tx.objectStore(HISTORY_STORE).get(Number(id)));
  }

  async function deleteHistoryPage(id) {
    const db = await openHistoryDb();
    const tx = db.transaction(HISTORY_STORE, "readwrite");
    return dbRequest(tx.objectStore(HISTORY_STORE).delete(Number(id)));
  }

  async function clearAllHistory() {
    const db = await openHistoryDb();
    const tx = db.transaction(HISTORY_STORE, "readwrite");
    return dbRequest(tx.objectStore(HISTORY_STORE).clear());
  }

  App.storage = {
    loadSettings,
    saveSettings,
    openHistoryDb,
    requestPersistentStorage,
    getStorageEstimate,
    saveHistoryPage,
    getHistoryPages,
    getHistoryPage,
    deleteHistoryPage,
    clearAllHistory
  };
})((window.LeitorApp = window.LeitorApp || {}));
