(function (App) {
  "use strict";

  const { CACHE_NAME, getRequiredOfflineAssets, isFileProtocol } = App.config;

  async function verifyCachedAssets(report) {
    const required = getRequiredOfflineAssets();
    const base = new URL("./", window.location.href);
    const missing = [];
    let present = 0;

    for (let i = 0; i < required.length; i++) {
      const absUrl = new URL(required[i], base).href;
      const match = await caches.match(absUrl, { ignoreSearch: true });
      if (match) present++;
      else missing.push(absUrl);
    }

    if (missing.length > 0 && present > 0) {
      report?.(
        "loading",
        "Verificando cache offline…",
        `${present} de ${required.length} arquivos já armazenados.`,
        Math.round((present / required.length) * 100)
      );
    }

    return {
      ready: missing.length === 0,
      total: required.length,
      present,
      missing
    };
  }

  async function cacheMissingAssets(missingUrls, total, alreadyPresent, report) {
    const cache = await caches.open(CACHE_NAME);
    let done = alreadyPresent;

    for (const url of missingUrls) {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) {
        throw new Error(`Falha ao salvar recurso local ${url} (${response.status})`);
      }
      await cache.put(url, response.clone());
      done++;
      report?.(
        "loading",
        "Salvando arquivos offline…",
        `${done} de ${total} componentes armazenados no aparelho.`,
        Math.round((done / total) * 100)
      );
    }
  }

  async function setupOfflineSupport({ onStatus, onUpdateAvailable } = {}) {
    const report = (state, title, detail, progress = null) => {
      onStatus?.({ state, title, detail, progress });
    };

    // Opened directly from local folder (file://) — already 100% local & ready to use!
    if (isFileProtocol()) {
      report(
        "ready",
        "Pronto para uso 100% offline (pasta local).",
        "Rodando direto dos arquivos baixados — OCR WebAssembly, idiomas e voz funcionam sem internet e sem servidor.",
        100
      );
      return { swSupported: false, offlineReady: true, mode: "file" };
    }

    if (!("serviceWorker" in navigator)) {
      report(
        "ready",
        "Modo local pronto.",
        "Todos os arquivos OCR estão hospedados localmente neste endereço.",
        100
      );
      return { swSupported: false, offlineReady: true, mode: "local" };
    }

    try {
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data || {};
        if (data.type === "OFFLINE_PROGRESS") {
          report(
            "loading",
            "Salvando cópia offline no navegador…",
            data.label || "Guardando componentes para uso sem internet.",
            data.progress ?? 10
          );
        } else if (data.type === "OFFLINE_READY") {
          report(
            "ready",
            "100% offline pronto.",
            "Interface, motor OCR WASM e idiomas Português/Inglês já estão salvos neste aparelho.",
            100
          );
        }
      });

      const hadController = Boolean(navigator.serviceWorker.controller);
      const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });

      const notifyWaiting = (worker) => {
        if (!worker) return;
        onUpdateAvailable?.(() => {
          worker.postMessage({ type: "SKIP_WAITING" });
        });
      };

      if (registration.waiting) notifyWaiting(registration.waiting);

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            notifyWaiting(installing);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      await navigator.serviceWorker.ready;

      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, 1500);
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true }
          );
        });
      }

      const verification = await verifyCachedAssets(report);
      if (verification.ready) {
        report(
          "ready",
          "100% offline pronto.",
          `Todos os ${verification.total} arquivos locais (app, motor OCR e idiomas) estão salvos no aparelho.`,
          100
        );
        return { swSupported: true, offlineReady: true, mode: "pwa" };
      }

      await cacheMissingAssets(
        verification.missing,
        verification.total,
        verification.present,
        report
      );

      report(
        "ready",
        "100% offline pronto.",
        `Todos os ${verification.total} arquivos locais estão prontos para uso sem internet.`,
        100
      );
      return { swSupported: true, offlineReady: true, mode: "pwa" };
    } catch (err) {
      console.error("Erro ao configurar cache PWA:", err);
      report(
        "error",
        "Não foi possível concluir o cache PWA.",
        "Os arquivos locais ainda funcionam enquanto houver acesso à pasta/servidor.",
        null
      );
      return { swSupported: true, offlineReady: false, mode: "fallback" };
    }
  }

  App.offline = {
    setupOfflineSupport
  };
})((window.LeitorApp = window.LeitorApp || {}));
