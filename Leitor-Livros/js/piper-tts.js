(function (App) {
  "use strict";

  const MODEL_DB = "LeitorLivrosVozes";
  const MODEL_DB_VERSION = 1;
  const MODEL_STORE = "models";

  const RHASSPY_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main";
  const DII_BASE = "https://huggingface.co/Phoonnx/pipertts_pt-BR_dii/resolve/main";

  const PIPER_VOICES = [
    {
      voiceURI: "piper:pt_BR-dii",
      id: "pt_BR-dii",
      name: "Dii (Neural · Feminina)",
      lang: "pt-BR",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "dii_pt-BR.onnx",
      onnxUrl: `${DII_BASE}/dii_pt-BR.onnx`,
      configUrl: `${DII_BASE}/dii_pt-BR.onnx.json`
    },
    {
      voiceURI: "piper:pt_BR-faber-medium",
      id: "pt_BR-faber-medium",
      name: "Faber (Neural · Masculina)",
      lang: "pt-BR",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "pt_BR-faber-medium.onnx",
      onnxUrl: `${RHASSPY_BASE}/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx`,
      configUrl: `${RHASSPY_BASE}/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json`
    },
    {
      voiceURI: "piper:pt_BR-cadu-medium",
      id: "pt_BR-cadu-medium",
      name: "Cadu (Neural · Masculina)",
      lang: "pt-BR",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "pt_BR-cadu-medium.onnx",
      onnxUrl: `${RHASSPY_BASE}/pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx`,
      configUrl: `${RHASSPY_BASE}/pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx.json`
    },
    {
      voiceURI: "piper:pt_BR-jeff-medium",
      id: "pt_BR-jeff-medium",
      name: "Jeff (Neural · Masculina)",
      lang: "pt-BR",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "pt_BR-jeff-medium.onnx",
      onnxUrl: `${RHASSPY_BASE}/pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx`,
      configUrl: `${RHASSPY_BASE}/pt/pt_BR/jeff/medium/pt_BR-jeff-medium.onnx.json`
    },
    {
      voiceURI: "piper:en_US-amy-medium",
      id: "en_US-amy-medium",
      name: "Amy (Neural · Female)",
      lang: "en-US",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "en_US-amy-medium.onnx",
      onnxUrl: `${RHASSPY_BASE}/en/en_US/amy/medium/en_US-amy-medium.onnx`,
      configUrl: `${RHASSPY_BASE}/en/en_US/amy/medium/en_US-amy-medium.onnx.json`
    },
    {
      voiceURI: "piper:en_US-ryan-medium",
      id: "en_US-ryan-medium",
      name: "Ryan (Neural · Male)",
      lang: "en-US",
      localService: true,
      neural: true,
      sizeLabel: "~60 MB",
      localFile: "en_US-ryan-medium.onnx",
      onnxUrl: `${RHASSPY_BASE}/en/en_US/ryan/medium/en_US-ryan-medium.onnx`,
      configUrl: `${RHASSPY_BASE}/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json`
    }
  ];

  let modelDbPromise = null;
  let runtimePromise = null;
  let activeVoiceId = "";
  let activeSession = null;
  let activeConfig = null;
  const loadedScripts = new Map();

  function getVoiceSpec(voiceIdOrUri) {
    return (
      PIPER_VOICES.find((v) => v.id === voiceIdOrUri || v.voiceURI === voiceIdOrUri) ||
      null
    );
  }

  function loadScriptOnce(src) {
    if (loadedScripts.has(src)) return loadedScripts.get(src);
    const p = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loadedScripts.delete(src);
        reject(new Error(`Falha ao carregar ${src}`));
      };
      document.head.appendChild(script);
    });
    loadedScripts.set(src, p);
    return p;
  }

  function openModelDb() {
    if (modelDbPromise) return modelDbPromise;
    modelDbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB indisponível"));
        return;
      }
      const req = indexedDB.open(MODEL_DB, MODEL_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MODEL_STORE)) {
          db.createObjectStore(MODEL_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        modelDbPromise = null;
        reject(req.error);
      };
    });
    return modelDbPromise;
  }

  function idbReq(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function listStoredVoiceIds() {
    try {
      const db = await openModelDb();
      const tx = db.transaction(MODEL_STORE, "readonly");
      const keys = await idbReq(tx.objectStore(MODEL_STORE).getAllKeys());
      return new Set(keys.map(String));
    } catch {
      return new Set();
    }
  }

  async function readStoredModel(voiceId) {
    try {
      const db = await openModelDb();
      const tx = db.transaction(MODEL_STORE, "readonly");
      return await idbReq(tx.objectStore(MODEL_STORE).get(voiceId));
    } catch {
      return null;
    }
  }

  async function writeStoredModel(record) {
    const db = await openModelDb();
    const tx = db.transaction(MODEL_STORE, "readwrite");
    await idbReq(tx.objectStore(MODEL_STORE).put(record));
  }

  async function removeVoice(voiceIdOrUri) {
    const spec = getVoiceSpec(voiceIdOrUri);
    if (!spec) return;
    if (activeVoiceId === spec.id) {
      activeVoiceId = "";
      activeSession = null;
      activeConfig = null;
    }
    try {
      const db = await openModelDb();
      const tx = db.transaction(MODEL_STORE, "readwrite");
      await idbReq(tx.objectStore(MODEL_STORE).delete(spec.id));
    } catch {}
  }

  async function fetchArrayBufferWithProgress(url, onProgress) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status} ao baixar modelo neural.`);
    }

    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !total) {
      const buf = await res.arrayBuffer();
      onProgress?.({ loaded: buf.byteLength, total: buf.byteLength, percent: 100 });
      return buf;
    }

    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.({
        loaded,
        total,
        percent: Math.min(99, Math.round((loaded / total) * 100))
      });
    }

    const out = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.byteLength;
    }
    onProgress?.({ loaded, total: loaded, percent: 100 });
    return out.buffer;
  }

  async function tryLoadFromLocalVendorFolder(spec) {
    if (App.config.isFileProtocol()) return null;
    try {
      const base = new URL("./vendor/piper/voices/", window.location.href);
      const [cfgRes, onnxRes] = await Promise.all([
        fetch(new URL(`${spec.localFile}.json`, base)),
        fetch(new URL(spec.localFile, base))
      ]);
      if (!cfgRes.ok || !onnxRes.ok) return null;
      const config = await cfgRes.json();
      const onnxBuffer = await onnxRes.arrayBuffer();
      return { id: spec.id, config, onnxBuffer, savedAt: Date.now() };
    } catch {
      return null;
    }
  }

  async function downloadVoice(voiceIdOrUri, onProgress) {
    const spec = getVoiceSpec(voiceIdOrUri);
    if (!spec) throw new Error("Voz neural desconhecida.");

    const existing = await readStoredModel(spec.id);
    if (existing?.onnxBuffer && existing?.config) {
      onProgress?.({ phase: "ready", percent: 100, label: `${spec.name} já está salva offline.` });
      return existing;
    }

    // Check if the user placed the .onnx file locally in vendor/piper/voices/
    const localRecord = await tryLoadFromLocalVendorFolder(spec);
    if (localRecord) {
      try { await writeStoredModel(localRecord); } catch {}
      onProgress?.({ phase: "ready", percent: 100, label: `${spec.name} carregada da pasta local.` });
      return localRecord;
    }

    if (!navigator.onLine) {
      throw new Error(`A voz ${spec.name} ainda não foi baixada. Conecte-se uma vez para salvá-la offline.`);
    }

    onProgress?.({ phase: "downloading", percent: 1, label: `Baixando ${spec.name}…` });

    const cfgRes = await fetch(spec.configUrl, { mode: "cors" });
    if (!cfgRes.ok) throw new Error(`Falha ao baixar configuração da voz (${cfgRes.status}).`);
    const config = await cfgRes.json();

    const onnxBuffer = await fetchArrayBufferWithProgress(spec.onnxUrl, ({ loaded, total, percent }) => {
      const mbDone = (loaded / 1024 / 1024).toFixed(1);
      const mbTotal = total ? (total / 1024 / 1024).toFixed(1) : "60";
      onProgress?.({
        phase: "downloading",
        percent,
        label: `Baixando ${spec.name}: ${mbDone} / ${mbTotal} MB (${percent}%)`
      });
    });

    const record = {
      id: spec.id,
      config,
      onnxBuffer,
      savedAt: Date.now()
    };

    try {
      await writeStoredModel(record);
    } catch (err) {
      console.warn("Não foi possível gravar a voz neural no IndexedDB:", err);
    }

    onProgress?.({ phase: "ready", percent: 100, label: `${spec.name} salva offline no aparelho.` });
    return record;
  }

  async function ensureRuntime() {
    if (runtimePromise) return runtimePromise;

    runtimePromise = (async () => {
      if (App.config.isFileProtocol()) {
        throw new Error(
          "Vozes neurais ONNX precisam de servidor local ou HTTPS (ex.: GitHub Pages ou python -m http.server) devido à política WASM do navegador."
        );
      }

      await Promise.all([
        loadScriptOnce("./vendor/piper/ort.min.js"),
        loadScriptOnce("./vendor/piper/piper_phonemize.js")
      ]);

      if (!window.ort || typeof window.createPiperPhonemize !== "function") {
        throw new Error("Runtime local do Piper Neural não pôde ser inicializado.");
      }

      const piperBase = new URL("./vendor/piper/", window.location.href).href;
      window.ort.env.wasm.wasmPaths = piperBase;
      window.ort.env.wasm.numThreads = 1;
      window.ort.env.wasm.simd = App.config.supportsWasmSimd();

      return {
        ort: window.ort,
        createPiperPhonemize: window.createPiperPhonemize,
        piperBase
      };
    })().catch((err) => {
      runtimePromise = null;
      throw err;
    });

    return runtimePromise;
  }

  async function ensureSession(voiceIdOrUri, onProgress) {
    const spec = getVoiceSpec(voiceIdOrUri);
    if (!spec) throw new Error("Voz neural inválida.");

    if (activeVoiceId === spec.id && activeSession && activeConfig) {
      return { session: activeSession, config: activeConfig, spec };
    }

    const { ort } = await ensureRuntime();
    const record = await downloadVoice(spec.id, onProgress);

    onProgress?.({
      phase: "loading",
      percent: 100,
      label: `Carregando rede neural ${spec.name}…`
    });

    const session = await ort.InferenceSession.create(new Uint8Array(record.onnxBuffer), {
      executionProviders: ["wasm"]
    });

    activeVoiceId = spec.id;
    activeSession = session;
    activeConfig = record.config;
    return { session, config: record.config, spec };
  }

  function mapPhonemesToIds(phonemes, phonemeIdMap) {
    const bos = phonemeIdMap["^"] || [1];
    const pad = phonemeIdMap["_"] || [0];
    const eos = phonemeIdMap["$"] || [2];

    const ids = [...bos, ...pad];
    for (const ph of phonemes) {
      const mapped = phonemeIdMap[ph];
      if (!mapped) continue;
      for (const id of mapped) ids.push(id);
      for (const p of pad) ids.push(p);
    }
    for (const id of eos) ids.push(id);
    return ids;
  }

  async function phonemizeText(text, config) {
    const { createPiperPhonemize, piperBase } = await ensureRuntime();
    const espeakVoice = config?.espeak?.voice || "pt-br";
    const input = JSON.stringify([{ text: String(text || "").trim() }]);

    const parsed = await new Promise((resolve, reject) => {
      let resolved = false;
      createPiperPhonemize({
        print: (line) => {
          if (resolved) return;
          try {
            resolved = true;
            resolve(JSON.parse(line));
          } catch (err) {
            reject(err);
          }
        },
        printErr: (msg) => {
          if (msg && /error|fail/i.test(String(msg))) {
            console.warn("piper_phonemize:", msg);
          }
        },
        locateFile: (file) => new URL(file, piperBase).href
      })
        .then((mod) => {
          mod.callMain([
            "-l",
            espeakVoice,
            "--input",
            input,
            "--espeak_data",
            "/espeak-ng-data"
          ]);
          if (!resolved) {
            resolved = true;
            resolve({ phonemes: [], phoneme_ids: [] });
          }
        })
        .catch(reject);
    });

    if (Array.isArray(parsed.phonemes) && parsed.phonemes.length && config?.phoneme_id_map) {
      return mapPhonemesToIds(parsed.phonemes, config.phoneme_id_map);
    }
    return parsed.phoneme_ids || [];
  }

  function encodeWav16(floatSamples, sampleRate) {
    const numSamples = floatSamples.length;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, floatSamples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  async function synthesize(text, voiceIdOrUri, { rate = 1, onProgress } = {}) {
    const cleaned = String(text || "").trim();
    if (!cleaned) return null;

    const { ort } = await ensureRuntime();
    const { session, config } = await ensureSession(voiceIdOrUri, onProgress);
    const phonemeIds = await phonemizeText(cleaned, config);

    if (!phonemeIds.length) return null;

    const noiseScale = config?.inference?.noise_scale ?? 0.667;
    const baseLengthScale = config?.inference?.length_scale ?? 1.0;
    const noiseW = config?.inference?.noise_w ?? 0.8;
    const effectiveRate = Math.max(0.5, Math.min(2.2, Number(rate) || 1));
    const lengthScale = baseLengthScale / effectiveRate;

    const feeds = {
      input: new ort.Tensor("int64", BigInt64Array.from(phonemeIds.map((id) => BigInt(id))), [
        1,
        phonemeIds.length
      ]),
      input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(phonemeIds.length)]), [1]),
      scales: new ort.Tensor("float32", Float32Array.from([noiseScale, lengthScale, noiseW]), [3])
    };

    if (config?.num_speakers > 1 || (config?.speaker_id_map && Object.keys(config.speaker_id_map).length > 0)) {
      feeds.sid = new ort.Tensor("int64", BigInt64Array.from([0n]), [1]);
    }

    const result = await session.run(feeds);
    const pcm = result.output.data;
    const sampleRate = config?.audio?.sample_rate || 22050;
    return encodeWav16(pcm, sampleRate);
  }

  App.piperTts = {
    PIPER_VOICES,
    getVoiceSpec,
    listStoredVoiceIds,
    downloadVoice,
    removeVoice,
    synthesize
  };
})((window.LeitorApp = window.LeitorApp || {}));
