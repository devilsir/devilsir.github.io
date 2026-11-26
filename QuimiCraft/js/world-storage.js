"use strict";

globalThis.QuimiCraftWorldStorage = (() => {
  const dataKeys = Object.freeze([
    "qc_inventory", "qc_equipment_v70", "qc_equipment_v62", "qc_science_v70", "qc_chem", "qc_camp_v5",
    "qc_lab_v46", "qc_lab_v47", "qc_lab_v48", "qc_lab_v49", "qc_lab_v50", "qc_lab_v51", "qc_lab_validation_v60",
    "qc_world_state_v70", "qc_world_state_v60", "qc_village_state_v60", "qc_element_missions_v60",
    "qc_message_history_v60", "qc_carbon_intro_gift_v60", "qc_periodic_mission_v46", "qc_periodic_mission_v47",
    "qc_village_v44", "qc_rangerGift", "qc_v44_wallet", "qc_fieldwork_v73", "qc_landscape", "qc_homestead", "qc_alchemy_v1", "qc_vehicles_v1", "qc_extermination_v1"
  ]);
  const mapKeys = {mods: "qc_mods", doors: "qc_doors", fluids: "qc_fluid_levels"};
  const kinds = Object.keys(mapKeys);
  const pendingKey = slot => "qc_chunks_pending_" + slot;
  const migratedKey = slot => "qc_chunks_migrated_" + slot;
  const json = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };

  function openDatabase(idb) {
    return new Promise((resolve, reject) => {
      const request = idb.open("quimicraft-worlds", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("chunks", {keyPath: ["slot", "chunk"]}).createIndex("slot", "slot");
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Banco do mundo bloqueado por outra aba."));
    });
  }

  function readSlot(db, slot) {
    return new Promise((resolve, reject) => {
      const request = db.transaction("chunks").objectStore("chunks").index("slot").getAll(slot);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function writeSlot(db, slot, rows) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("chunks", "readwrite");
      const store = tx.objectStore("chunks");
      store.put({slot, chunk: "meta"});
      for (const [chunk, value] of rows) {
        if (value) store.put({slot, chunk, value});
        else store.delete([slot, chunk]);
      }
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error || new Error("Gravação interrompida."));
    });
  }

  function deleteSlot(db, slot) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("chunks", "readwrite");
      const request = tx.objectStore("chunks").index("slot").openKeyCursor(slot);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        tx.objectStore("chunks").delete(cursor.primaryKey);
        cursor.continue();
      };
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error);
    });
  }

  function create({storage, idb, seed, chunkSize, onError}) {
    const slot = storage.getItem("qc_world_slot") || String(seed);
    const groups = new Map();
    const dirty = new Set();
    const pending = new Map();
    let db = null;
    let opening = null;
    let loading = null;
    let saving = null;
    let ready = false;

    function chunkFor(key) {
      const [x, , z] = key.split("|").map(Number);
      return [Math.floor(x / chunkSize), Math.floor(z / chunkSize)].join(",");
    }

    class WorldMap extends Map {
      constructor(kind) {
        super();
        this.kind = kind;
      }

      set(key, value) {
        const previous = this.get(key);
        if (this.kind === "doors" && previous && Object.keys(value).length === Object.keys(previous).length &&
            Object.keys(value).every(field => value[field] === previous[field])) return this;
        if (previous === value) return this;
        super.set(key, value);
        const chunk = chunkFor(key);
        if (!groups.has(chunk)) groups.set(chunk, {mods: new Map(), doors: new Map(), fluids: new Map()});
        groups.get(chunk)[this.kind].set(key, value);
        dirty.add(chunk);
        return this;
      }

      delete(key) {
        if (!super.delete(key)) return false;
        const chunk = chunkFor(key);
        groups.get(chunk)[this.kind].delete(key);
        dirty.add(chunk);
        return true;
      }

      clear() {
        for (const key of this.keys()) this.delete(key);
      }
    }

    const maps = Object.fromEntries(kinds.map(kind => [kind, new WorldMap(kind)]));

    function restoreChunk(chunk, value) {
      if (groups.has(chunk)) {
        for (const kind of kinds) for (const key of groups.get(chunk)[kind].keys()) maps[kind].delete(key);
      }
      if (!value) return;
      for (const kind of kinds) {
        for (const [key, entry] of value[kind] || []) {
          if (chunkFor(key) === chunk) maps[kind].set(key, entry);
        }
      }
    }

    function usingDatabase() {
      if (db) return Promise.resolve(db);
      if (!idb) return Promise.reject(new Error("IndexedDB indisponível."));
      if (!opening) {
        opening = openDatabase(idb).then(result => db = result).finally(() => { opening = null; });
      }
      return opening;
    }

    function snapshot() {
      for (const chunk of dirty) {
        const group = groups.get(chunk);
        const value = Object.fromEntries(kinds.map(kind => [kind, [...group[kind]]]));
        pending.set(chunk, kinds.some(kind => value[kind].length) ? value : null);
        if (!pending.get(chunk)) groups.delete(chunk);
      }
      dirty.clear();
    }

    function journal() {
      if (pending.size) storage.setItem(pendingKey(slot), JSON.stringify([...pending]));
      else storage.removeItem(pendingKey(slot));
    }

    function flush() {
      if (!ready) return Promise.resolve(false);
      snapshot();
      if (!pending.size) return saving || Promise.resolve(true);
      let journalOk = true;
      try { journal(); } catch { journalOk = false; }
      if (saving) return saving;
      if (!db) {
        if (!journalOk) onError("O navegador ficou sem espaço para salvar as alterações do mundo.");
        return Promise.resolve(journalOk);
      }
      const batch = new Map(pending);
      saving = writeSlot(db, slot, batch).then(() => {
        for (const [chunk, value] of batch) if (pending.get(chunk) === value) pending.delete(chunk);
        try { journal(); } catch { onError("As alterações estão no banco local, mas a cópia de recuperação está indisponível."); }
        return true;
      }).catch(error => {
        onError(journalOk ? "Banco local indisponível. As alterações ficaram na cópia de recuperação." :
          "As alterações do mundo ainda não foram gravadas. Exporte uma cópia antes de sair.", error);
        return false;
      }).finally(() => { saving = null; });
      return saving;
    }

    async function loadSlot() {
      if (ready) return;
      let rows = [];
      try { rows = await readSlot(await usingDatabase(), slot); }
      catch (error) {
        db = null;
        if (storage.getItem(migratedKey(slot))) {
          onError("O banco deste mundo está indisponível. Tente abrir o mundo novamente.", error);
          throw error;
        }
        onError("Banco local indisponível. Usando o armazenamento de recuperação.", error);
      }
      const migrated = rows.some(row => row.chunk === "meta");
      if (migrated) {
        for (const {chunk, value} of rows) if (chunk !== "meta") restoreChunk(chunk, value);
      } else if (!storage.getItem("qc_world_slot")) {
        for (const kind of kinds) {
          const legacy = json(storage.getItem(mapKeys[kind]), []);
          if (!Array.isArray(legacy)) continue;
          for (const pair of legacy) {
            if (Array.isArray(pair) && typeof pair[0] === "string" && /^\-?\d+\|\d+\|\-?\d+$/.test(pair[0])) {
              maps[kind].set(...pair);
            }
          }
        }
      }
      if (migrated) {
        dirty.clear();
        try { storage.setItem(migratedKey(slot), "1"); } catch {}
      }
      const recovery = json(storage.getItem(pendingKey(slot)), []);
      for (const [chunk, value] of recovery) {
        restoreChunk(chunk, value);
        pending.set(chunk, value);
        if (migrated || !value) dirty.delete(chunk);
      }
      ready = true;
      if (!migrated && db) {
        snapshot();
        try { await writeSlot(db, slot, pending); storage.setItem(migratedKey(slot), "1"); pending.clear(); journal(); }
        catch (error) { onError("A migração do save será retomada na próxima gravação.", error); }
      }
      await flush();
    }

    function load() {
      if (ready) return Promise.resolve();
      if (!loading) loading = loadSlot().finally(() => { loading = null; });
      return loading;
    }

    function exportWorld() {
      const data = Object.fromEntries(dataKeys.map(key => [key, storage.getItem(key)]));
      const cells = Object.fromEntries(kinds.map(kind => [kind, [...maps[kind]]]));
      return {format: "QuimiCraft", version: 1, seed, data, cells};
    }

    function validateBackup(backup, validBlock, maxY) {
      if (backup?.format !== "QuimiCraft" || backup.version !== 1 || !Number.isSafeInteger(backup.seed) ||
          backup.seed < 1 || !backup.cells || !backup.data) throw new Error("Arquivo de mundo inválido ou incompatível.");
      for (const kind of kinds) {
        const rows = backup.cells[kind];
        if (!Array.isArray(rows)) throw new Error("O arquivo não contém todas as alterações do mundo.");
        const used = new Set();
        for (const pair of rows) {
          const [key, value] = Array.isArray(pair) ? pair : [];
          const coords = typeof key === "string" && /^\-?\d+\|\d+\|\-?\d+$/.test(key) ? key.split("|").map(Number) : [];
          const metadataOk = value && typeof value === "object" && !Array.isArray(value) &&
            [0, 1].includes(value.axis) && [0, 1, 2].includes(value.half) &&
            (!value.group || (typeof value.group === "string" && /^[a-z0-9-]+$/.test(value.group)));
          const valueOk = kind === "mods" ? validBlock(value) : kind === "doors" ? metadataOk :
            Number.isInteger(value) && value >= 0 && value <= 7;
          if (coords.length !== 3 || !coords.every(Number.isSafeInteger) || coords[1] > maxY ||
              Math.abs(coords[0]) > 1e7 || Math.abs(coords[2]) > 1e7 || used.has(key) || !valueOk) {
            throw new Error("O arquivo tem células inválidas.");
          }
          used.add(key);
        }
      }
      if (dataKeys.some(key => backup.data[key] !== undefined && backup.data[key] !== null && typeof backup.data[key] !== "string")) {
        throw new Error("O arquivo tem dados de progresso inválidos.");
      }
    }

    async function importWorld(backup, validBlock, maxY) {
      validateBackup(backup, validBlock, maxY);
      const newSlot = backup.seed + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      const rows = new Map();
      for (const kind of kinds) {
        for (const pair of backup.cells[kind]) {
          const chunk = chunkFor(pair[0]);
          if (!rows.has(chunk)) rows.set(chunk, {mods: [], doors: [], fluids: []});
          rows.get(chunk)[kind].push(pair);
        }
      }
      try {
        await writeSlot(await usingDatabase(), newSlot, rows);
        storage.setItem(migratedKey(newSlot), "1");
      } catch { storage.setItem(pendingKey(newSlot), JSON.stringify([...rows])); }

      const entries = [...dataKeys.map(key => [key, backup.data[key]]),
        ["qc_world_seed", String(backup.seed)], ["qc_world_slot", newSlot]];
      const prior = entries.map(([key]) => [key, storage.getItem(key)]);
      const apply = ([key, value]) => value == null ? storage.removeItem(key) : storage.setItem(key, value);
      try { entries.forEach(apply); }
      catch (error) {
        for (const [key] of entries) storage.removeItem(key);
        storage.removeItem(pendingKey(newSlot));
        storage.removeItem(migratedKey(newSlot));
        prior.forEach(apply);
        if (db) await deleteSlot(db, newSlot).catch(() => {});
        throw error;
      }
    }

    function discard() {
      storage.removeItem(pendingKey(slot));
      storage.removeItem(migratedKey(slot));
      storage.removeItem("qc_world_slot");
      for (const key of [...dataKeys, ...Object.values(mapKeys)]) storage.removeItem(key);
      if (db) {
        const finish = saving || Promise.resolve();
        finish.then(() => deleteSlot(db, slot)).catch(() => {});
      }
      ready = false;
    }

    function hasBlockEdits(bounds) {
      const {left,right,front,rear}=bounds;
      for(let cx=Math.floor(left/chunkSize);cx<=Math.floor(right/chunkSize);cx++){
        for(let cz=Math.floor(front/chunkSize);cz<=Math.floor(rear/chunkSize);cz++){
          const edits=groups.get(cx+","+cz)?.mods;
          if(!edits)continue;
          for(const key of edits.keys()){
            const [x,,z]=key.split("|").map(Number);
            if(x>=left&&x<=right&&z>=front&&z<=rear)return true;
          }
        }
      }
      return false;
    }

    return {maps, load, flush, exportWorld, importWorld, discard, hasBlockEdits};
  }

  return {create};
})();
