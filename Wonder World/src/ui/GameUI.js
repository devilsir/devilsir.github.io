export class GameUI {
    root;
    currentSettings;
    menuActionHandler = null;
    pauseHandler = null;
    tacticalHandler = null;
    toastTimer = 0;
    subtitleTimer = 0;
    captionTimer = 0;
    documentCloseHandler = null;
    loadingDepth = 0;
    loadingProgress = 0;
    loadingTimer = 0;
    constructor(root, settings) {
        this.root = root;
        this.currentSettings = settings;
        this.root.innerHTML = this.template();
        this.applySettings(settings);
    }
    showLoading(message, detail = "Aguarde enquanto o cenário é preparado.") {
        this.loadingDepth += 1;
        this.loadingProgress = this.loadingDepth === 1 ? 7 : Math.max(7, this.loadingProgress);
        this.updateLoading(message, detail);
        this.get("loading-progress-fill").style.width = `${this.loadingProgress}%`;
        this.get("loading-progress-value").textContent = `${Math.round(this.loadingProgress)}%`;
        this.showElement("loading-screen");
        this.startLoadingProgress();
    }
    updateLoading(message, detail = null, progress = null) {
        this.get("loading-message").textContent = message;
        if (detail !== null)
            this.get("loading-detail").textContent = detail;
        if (progress !== null) {
            this.loadingProgress = Math.max(this.loadingProgress, Math.min(96, progress));
            this.get("loading-progress-fill").style.width = `${this.loadingProgress}%`;
            this.get("loading-progress-value").textContent = `${Math.round(this.loadingProgress)}%`;
        }
    }
    hideLoading() {
        this.loadingDepth = Math.max(0, this.loadingDepth - 1);
        if (this.loadingDepth > 0)
            return;
        this.stopLoadingProgress();
        this.loadingProgress = 100;
        this.get("loading-progress-fill").style.width = "100%";
        this.get("loading-progress-value").textContent = "100%";
        window.setTimeout(() => {
            if (this.loadingDepth === 0)
                this.hideElement("loading-screen");
        }, 120);
    }
    forceHideLoading() {
        this.loadingDepth = 0;
        this.stopLoadingProgress();
        this.hideElement("loading-screen");
    }
    startLoadingProgress() {
        this.stopLoadingProgress();
        this.loadingTimer = window.setInterval(() => {
            if (this.loadingDepth <= 0 || this.loadingProgress >= 92)
                return;
            const remaining = 92 - this.loadingProgress;
            this.loadingProgress += Math.max(0.35, remaining * 0.035);
            this.get("loading-progress-fill").style.width = `${this.loadingProgress}%`;
            this.get("loading-progress-value").textContent = `${Math.round(this.loadingProgress)}%`;
        }, 110);
    }
    stopLoadingProgress() {
        if (this.loadingTimer)
            window.clearInterval(this.loadingTimer);
        this.loadingTimer = 0;
    }
    ensureGameplayVisible() {
        this.hideElement("main-menu");
        this.hideElement("cinematic");
        this.hideElement("fatal-error-screen");
        this.hideElement("inventory-screen");
        this.showHud();
    }
    showFatalError(error) {
        const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        this.get("fatal-error-message").textContent = message;
        this.forceHideLoading();
        this.showElement("fatal-error-screen");
        const details = this.get("fatal-error-details");
        details.textContent = error instanceof Error && error.stack ? error.stack : message;
        this.get("fatal-error-reload").onclick = () => location.reload();
        this.get("fatal-error-copy").onclick = () => {
            void navigator.clipboard?.writeText(details.textContent ?? message);
            this.toast("Erro copiado.");
        };
    }
    bindMenu(handler) {
        this.menuActionHandler = handler;
        this.root.querySelectorAll("[data-menu-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.menuAction;
                if (action)
                    this.menuActionHandler?.(action);
            });
        });
    }
    setContinueEnabled(enabled) {
        const continueButton = this.root.querySelector("[data-menu-action='continue']");
        const loadButton = this.root.querySelector("[data-menu-action='load']");
        if (continueButton)
            continueButton.disabled = !enabled;
        if (loadButton)
            loadButton.disabled = !enabled;
    }
    showMenu() {
        this.hideAllScreens();
        this.showElement("main-menu");
    }
    hideMenu() {
        this.hideElement("main-menu");
    }
    showPause(handler) {
        this.pauseHandler = handler;
        this.showElement("pause-menu");
    }
    hidePause() {
        this.hideElement("pause-menu");
    }
    showInventory(items, onClose) {
        this.get("inventory-count").textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;
        const list = this.get("inventory-list");
        list.innerHTML = items.length
            ? items.map((item) => `
          <article class="inventory-item">
            <div class="inventory-item-name">${this.escape(item.name)}</div>
            <p>${this.escape(item.description)}</p>
          </article>
        `).join("")
            : `<div class="inventory-empty">Seu inventário está vazio.</div>`;
        this.showElement("inventory-screen");
        this.get("inventory-close").onclick = onClose;
    }
    hideInventory() {
        this.hideElement("inventory-screen");
    }
    showSettings(settings, callbacks, accessibilityOnly = false) {
        this.currentSettings = settings;
        const panel = this.get("settings-screen");
        panel.classList.remove("hidden");
        panel.querySelector("[data-settings-title]").textContent = accessibilityOnly
            ? "ACESSIBILIDADE"
            : "CONFIGURAÇÕES";
        const fields = panel.querySelectorAll("[data-setting]");
        fields.forEach((field) => {
            const key = field.dataset.setting;
            if (!key)
                return;
            const value = settings[key];
            if (field instanceof HTMLInputElement && field.type === "checkbox") {
                field.checked = Boolean(value);
            }
            else {
                field.value = String(value);
            }
            const row = field.closest("[data-setting-row]");
            if (row) {
                const isAccessibility = row.dataset.accessibility === "true";
                row.classList.toggle("hidden", accessibilityOnly && !isAccessibility);
            }
        });
        const saveButton = panel.querySelector("[data-settings-save]");
        const resetButton = panel.querySelector("[data-settings-reset]");
        const closeButton = panel.querySelector("[data-settings-close]");
        saveButton.onclick = () => {
            const next = {};
            fields.forEach((field) => {
                const key = field.dataset.setting;
                if (!key)
                    return;
                let value = field.value;
                if (field instanceof HTMLInputElement && field.type === "checkbox")
                    value = field.checked;
                if (field instanceof HTMLInputElement && field.type === "range")
                    value = Number(field.value);
                next[key] = value;
            });
            callbacks.onSave(next);
            this.hideElement("settings-screen");
        };
        resetButton.onclick = callbacks.onReset;
        closeButton.onclick = () => {
            this.hideElement("settings-screen");
            callbacks.onClose();
        };
    }
    showFinalCredits(stats, onComplete) {
        this.root.querySelector("#final-credits-overlay")?.remove();
        const overlay = document.createElement("section");
        overlay.id = "final-credits-overlay";
        overlay.className = "final-credits-overlay";
        const minutes = Math.floor(stats.completionSeconds / 60);
        const seconds = stats.completionSeconds % 60;
        const behaviorLine = stats.postDefeatAttacks === 0
            ? "O silêncio depois da criatura foi preservado."
            : stats.postDefeatAttacks <= 3
                ? "Alguns golpes ecoaram depois do silêncio."
                : stats.postDefeatAttacks <= 12
                    ? "O gravador manteve um trecho longo de impactos sem resposta."
                    : "Uma parte da fita foi arquivada sem transcrição.";
        overlay.innerHTML = `
      <div class="credits-projector-beam"></div>
      <div class="credits-film-damage"></div>
      <div class="credits-scroll">
        <p class="credits-kicker">WONDER WORLD APRESENTA</p>
        <h1>${this.escape(stats.title)}</h1>
        <h2>${this.escape(stats.ending)}</h2>
        <div class="credits-gap"></div>
        <h3>UMA PRODUÇÃO PROCEDURAL</h3>
        <p>Direção criativa e conceito: Timbó</p>
        <p>Desenvolvimento, sistemas e integração: OpenAI · GPT-5.6 Thinking</p>
        <p>Motor: Babylon.js · TypeScript · Vite</p>
        <p>Materiais, cenários, personagens e áudio: gerados em tempo de execução</p>
        <div class="credits-gap"></div>
        <h3>ARQUIVOS WONDER WORLD</h3>
        <p>O Corpo · Movimento · Medo · Identidade</p>
        <p>Visitantes permanentes: classificação encerrada</p>
        <p>Instalação: estruturalmente perdida</p>
        <div class="credits-gap"></div>
        <h3>ESTATÍSTICAS DA CAMPANHA</h3>
        <p>Tempo: ${minutes}:${String(seconds).padStart(2, "0")}</p>
        <p>Documentos encontrados: ${stats.documents}</p>
        <p>Registros resgatados do incêndio: ${stats.rescuedRecords}</p>
        <p>Mortes e recuperações: ${stats.deaths}</p>
        <p>Finais registrados: ${stats.endings}</p>
        <p class="credits-subtle">${this.escape(behaviorLine)}</p>
        <div class="credits-gap"></div>
        <h2>ATRAÇÃO FINAL</h2>
        <p>Toda criança encontra uma parte de si mesma.</p>
        <div class="credits-gap large"></div>
      </div>
      <button class="credits-skip" type="button" disabled>PULAR CRÉDITOS</button>
    `;
        this.root.appendChild(overlay);
        const button = overlay.querySelector(".credits-skip");
        const finish = () => {
            overlay.classList.add("leaving");
            window.setTimeout(() => { overlay.remove(); onComplete(); }, 700);
        };
        window.setTimeout(() => { button.disabled = false; }, 4500);
        button.onclick = finish;
        window.setTimeout(() => { if (overlay.isConnected)
            finish(); }, 33000);
    }
    showPostCredits(onComplete) {
        this.root.querySelector("#post-credits-overlay")?.remove();
        const overlay = document.createElement("section");
        overlay.id = "post-credits-overlay";
        overlay.className = "post-credits-overlay";
        overlay.innerHTML = `
      <div class="government-room">
        <div class="official official-a"></div>
        <div class="official official-b"></div>
        <div class="official official-c"></div>
        <div class="crt-wall">
          <div class="crt-screen">RECUPERAÇÃO 04</div>
          <div class="crt-screen">SUJEITO 13-R</div>
          <div class="crt-screen">NÍVEL INFERIOR</div>
        </div>
        <div class="government-caption">
          <p>“O complexo superior colapsou.”</p>
          <p>“O elevador de contenção ainda responde.”</p>
        </div>
      </div>
      <div class="unknown-elevator">
        <div class="elevator-indicator">NÍVEL -8</div>
        <div class="elevator-doors"><span></span><span></span></div>
        <div class="unknown-eyes"></div>
      </div>
      <button class="post-credits-close" type="button" disabled>ENCERRAR</button>
    `;
        this.root.appendChild(overlay);
        const indicator = overlay.querySelector(".elevator-indicator");
        const levels = ["NÍVEL -8", "NÍVEL -9", "NÍVEL -10", "NÍVEL DESCONHECIDO"];
        levels.forEach((level, index) => window.setTimeout(() => { indicator.textContent = level; }, 3600 + index * 1500));
        window.setTimeout(() => overlay.classList.add("elevator-focus"), 3200);
        window.setTimeout(() => overlay.classList.add("doors-open"), 9000);
        window.setTimeout(() => overlay.classList.add("eyes-visible"), 10400);
        const button = overlay.querySelector(".post-credits-close");
        window.setTimeout(() => { button.disabled = false; }, 11600);
        const finish = () => { overlay.remove(); onComplete(); };
        button.onclick = finish;
        window.setTimeout(() => { if (overlay.isConnected)
            finish(); }, 16000);
    }
    setEndingGallery(endings) {
        const labels = {
            "dead-by-creature": "FINAL: MORTO PELA CRIATURA",
            "saved-by-authorities": "FINAL VERDADEIRO: SALVOS PELAS AUTORIDADES"
        };
        const gallery = this.get("credits-ending-gallery");
        gallery.innerHTML = endings.length
            ? endings.map((ending) => `<div class="ending-gallery-entry">${this.escape(labels[ending] ?? ending)}</div>`).join("")
            : '<div class="ending-gallery-entry locked">FINAL NÃO DESCOBERTO</div>';
    }
    showCredits() {
        this.showElement("credits-screen");
        this.get("credits-close").onclick = () => this.hideElement("credits-screen");
    }
    showTips(objective, hints, onClose) {
        this.get("tips-objective").textContent = objective || "CONTINUE EXPLORANDO O WONDER WORLD.";
        const list = this.get("tips-list");
        list.innerHTML = hints.length
            ? hints.map((hint) => `<li>${this.escape(hint)}</li>`).join("")
            : "<li>Observe o ambiente, aproxime-se de objetos destacados e use E para interagir.</li>";
        this.showElement("tips-screen");
        this.get("tips-close").onclick = () => {
            this.hideElement("tips-screen");
            onClose?.();
        };
    }
    showHud() {
        this.showElement("hud");
    }
    hideHud() {
        this.hideElement("hud");
    }
    setObjective(text) {
        this.get("objective").textContent = text;
    }
    setInteractionPrompt(text) {
        const prompt = this.get("interaction-prompt");
        prompt.textContent = text ?? "";
        prompt.classList.toggle("hidden", !text);
        prompt.toggleAttribute("hidden", !text);
    }
    updateStatus(health, fuel, inventory, lives = 3, armor = 0) {
        this.get("health-fill").style.width = `${Math.max(0, Math.min(100, health))}%`;
        this.get("fuel-fill").style.width = `${Math.max(0, Math.min(100, fuel))}%`;
        this.get("armor-fill").style.width = `${Math.max(0, Math.min(100, armor))}%`;
        this.get("lives-count").textContent = `VIDAS ${Math.max(0, lives)}`;
        this.get("inventory-mini").textContent = inventory.length
            ? inventory.map((item) => item.name).join(" · ")
            : "Inventário vazio";
    }
    setNoiseDanger(percent, visible) {
        const meter = this.get("noise-indicator");
        const clamped = Math.max(0, Math.min(100, percent));
        this.get("noise-fill").style.width = `${clamped}%`;
        meter.classList.toggle("hidden", !visible);
        meter.classList.toggle("danger", clamped >= 72);
    }
    setStamina(percent) {
        this.get("stamina-fill").style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
    showSubtitle(speaker, text, duration = 4200) {
        if (!this.currentSettings.subtitles)
            return;
        window.clearTimeout(this.subtitleTimer);
        const subtitle = this.get("subtitle");
        const label = this.currentSettings.speakerLabels && speaker
            ? `<span class="speaker">${this.escape(speaker)}:</span> `
            : "";
        subtitle.innerHTML = `${label}${this.escape(text)}`;
        subtitle.classList.remove("hidden");
        this.subtitleTimer = window.setTimeout(() => subtitle.classList.add("hidden"), duration);
    }
    showSoundCaption(text, duration = 2600) {
        if (!this.currentSettings.soundCaptions)
            return;
        window.clearTimeout(this.captionTimer);
        const caption = this.get("sound-caption");
        caption.textContent = `[${text}]`;
        caption.classList.remove("hidden");
        this.captionTimer = window.setTimeout(() => caption.classList.add("hidden"), duration);
    }
    toast(text, duration = 2600) {
        window.clearTimeout(this.toastTimer);
        const toast = this.get("toast");
        toast.textContent = text;
        toast.classList.remove("hidden");
        this.toastTimer = window.setTimeout(() => toast.classList.add("hidden"), duration);
    }
    showEnding(title, body, onRetry, onMenu) {
        this.get("ending-title").textContent = title;
        this.get("ending-body").textContent = body;
        this.showElement("ending-screen");
        this.get("ending-retry").onclick = () => {
            this.hideElement("ending-screen");
            onRetry();
        };
        this.get("ending-menu").onclick = () => {
            this.hideElement("ending-screen");
            onMenu();
        };
    }
    setCorruption(amount, duration = 1100) {
        const overlay = this.get("corruption-overlay");
        const clamped = Math.max(0, Math.min(1, amount));
        overlay.style.opacity = String(clamped);
        overlay.style.transform = `translate(${(Math.random() - 0.5) * clamped * 12}px, ${(Math.random() - 0.5) * clamped * 8}px)`;
        window.setTimeout(() => {
            overlay.style.opacity = "0";
            overlay.style.transform = "none";
        }, duration);
    }
    showDocument(title, body, onClose) {
        this.get("document-title").textContent = title;
        this.get("document-body").textContent = body;
        this.documentCloseHandler = onClose ?? null;
        this.showElement("document-viewer");
        this.get("document-close").onclick = () => this.closeDocument();
    }
    /**
     * Closes the top-most piece of readable gameplay text. Returning true lets
     * the input layer consume E/Escape instead of also triggering another
     * interaction or opening the pause menu on the same key press.
     */
    dismissGameplayText() {
        const documentViewer = this.get("document-viewer");
        if (!documentViewer.classList.contains("hidden")) {
            this.closeDocument();
            return true;
        }
        const subtitle = this.get("subtitle");
        if (!subtitle.classList.contains("hidden")) {
            window.clearTimeout(this.subtitleTimer);
            subtitle.classList.add("hidden");
            return true;
        }
        const toast = this.get("toast");
        if (!toast.classList.contains("hidden")) {
            window.clearTimeout(this.toastTimer);
            toast.classList.add("hidden");
            return true;
        }
        const caption = this.get("sound-caption");
        if (!caption.classList.contains("hidden")) {
            window.clearTimeout(this.captionTimer);
            caption.classList.add("hidden");
            return true;
        }
        return false;
    }
    async playOpeningFilm(onSkip) {
        const screen = this.get("cinematic");
        const canvas = this.get("film-canvas");
        const context = canvas.getContext("2d");
        if (!context)
            return;
        screen.classList.remove("hidden");
        let skipped = false;
        const narrationText = "Bem-vindos ao Wonder World, onde toda criança encontra uma parte de si mesma.";
        const narration = new SpeechSynthesisUtterance(narrationText);
        narration.lang = "pt-BR";
        narration.rate = 0.88;
        narration.pitch = 0.86;
        narration.volume = this.currentSettings.dialogueVolume * this.currentSettings.masterVolume;
        window.speechSynthesis.cancel();
        window.setTimeout(() => {
            if (!skipped)
                window.speechSynthesis.speak(narration);
        }, 650);
        this.get("skip-film").onclick = () => {
            skipped = true;
            window.speechSynthesis.cancel();
            screen.classList.add("hidden");
            onSkip();
        };
        const start = performance.now();
        const duration = 13000;
        await new Promise((resolve) => {
            const draw = (now) => {
                if (skipped) {
                    resolve();
                    return;
                }
                const elapsed = now - start;
                const t = elapsed / 1000;
                this.drawFilmFrame(context, canvas, t);
                if (elapsed >= duration) {
                    screen.classList.add("hidden");
                    resolve();
                    return;
                }
                requestAnimationFrame(draw);
            };
            requestAnimationFrame(draw);
        });
    }
    showChapterCard(title, subtitle = "", duration = 3600) {
        const screen = this.get("chapter-card");
        this.get("chapter-title").textContent = title;
        this.get("chapter-subtitle").textContent = subtitle;
        screen.classList.remove("hidden");
        return new Promise((resolve) => {
            window.setTimeout(() => {
                screen.classList.add("hidden");
                resolve();
            }, duration);
        });
    }
    showBossUI(name) {
        this.get("boss-name").textContent = name;
        this.showElement("boss-ui");
    }
    hideBossUI() {
        this.hideElement("boss-ui");
        this.hideTacticalActions();
    }
    setBossHealth(percent) {
        this.get("boss-health-fill").style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
    showTacticalActions(actions, handler) {
        this.tacticalHandler = handler;
        const container = this.get("tactical-actions");
        container.innerHTML = "";
        for (const action of actions) {
            const button = document.createElement("button");
            button.className = "ui-button";
            button.textContent = action.label;
            button.disabled = action.enabled === false;
            button.onclick = () => this.tacticalHandler?.(action.id);
            container.append(button);
        }
        container.classList.remove("hidden");
    }
    hideTacticalActions() {
        this.get("tactical-actions").classList.add("hidden");
    }
    flashDamage(strength = 1) {
        const vignette = this.get("damage-vignette");
        vignette.style.opacity = String(Math.min(1, strength));
        window.setTimeout(() => (vignette.style.opacity = "0"), 180);
    }
    flashLightning() {
        if (this.currentSettings.reducedFlashing)
            return;
        const flash = this.get("flash");
        flash.animate([{ opacity: 0 }, { opacity: 0.55 }, { opacity: 0 }], { duration: 190, easing: "ease-out" });
    }
    applySettings(settings) {
        this.currentSettings = settings;
        document.documentElement.style.setProperty("--subtitle-size", `${settings.subtitleSize}px`);
        const canvas = document.querySelector("#game-canvas");
        if (canvas) {
            canvas.style.filter = `brightness(${settings.brightness}) contrast(${settings.gamma})`;
        }
    }
    showDebug(callbacks) {
        const panel = this.get("debug-panel");
        panel.classList.toggle("hidden");
        if (panel.classList.contains("hidden"))
            return;
        panel.querySelectorAll("[data-debug-teleport]").forEach((button) => {
            button.onclick = () => callbacks.teleport(button.dataset.debugTeleport ?? "prologue");
        });
        panel.querySelector("[data-debug-give]").onclick = callbacks.giveItems;
        panel.querySelector("[data-debug-fuel]").onclick = callbacks.toggleInfiniteFuel;
        panel.querySelector("[data-debug-god]").onclick = callbacks.toggleInvulnerability;
        panel.querySelector("[data-debug-reset]").onclick = callbacks.resetPuzzle;
        panel.querySelector("[data-debug-boss]").onclick = callbacks.startBoss;
        panel.querySelector("[data-debug-collisions]").onclick = callbacks.toggleCollisions;
        panel.querySelector("[data-debug-mannequins]").onclick = callbacks.toggleMannequinMovement;
        panel.querySelector("[data-debug-observation]").onclick = callbacks.toggleObservationVisualization;
        panel.querySelector("[data-debug-rays]").onclick = callbacks.toggleOcclusionVisualization;
        panel.querySelector("[data-debug-blackout]").onclick = callbacks.forceBlackout;
        panel.querySelector("[data-debug-cells]").onclick = callbacks.grantEnergyCells;
        panel.querySelector("[data-debug-mirror]").onclick = callbacks.resetMirrorPuzzle;
        panel.querySelector("[data-debug-shelves]").onclick = callbacks.resetShelfPuzzle;
        panel.querySelectorAll("[data-debug-arena]").forEach((button) => {
            button.onclick = () => callbacks.startSphereArena(Number(button.dataset.debugArena));
        });
        panel.querySelectorAll("[data-debug-count]").forEach((button) => {
            button.onclick = () => callbacks.setMannequinCount(Number(button.dataset.debugCount));
        });
        panel.querySelector("[data-debug-jesse-intro]").onclick = callbacks.startJesseIntroduction;
        panel.querySelectorAll("[data-debug-chase]").forEach((button) => {
            button.onclick = () => callbacks.startChaseSegment(Number(button.dataset.debugChase));
        });
        panel.querySelectorAll("[data-debug-noise]").forEach((button) => {
            button.onclick = () => callbacks.setNoiseLevel(Number(button.dataset.debugNoise));
        });
        panel.querySelector("[data-debug-jesse-search]").onclick = callbacks.forceJesseSearch;
        panel.querySelector("[data-debug-noise-view]").onclick = callbacks.toggleNoiseVisualization;
        panel.querySelector("[data-debug-jesse-view]").onclick = callbacks.toggleJesseVisualization;
        panel.querySelector("[data-debug-generator-components]").onclick = callbacks.grantGeneratorComponents;
        panel.querySelector("[data-debug-melody-reset]").onclick = callbacks.resetMelodyPuzzle;
        panel.querySelector("[data-debug-miniboss]").onclick = callbacks.spawnMiniboss;
        panel.querySelector("[data-debug-maya]").onclick = callbacks.triggerMayaReveal;
        panel.querySelectorAll("[data-debug-mimic]").forEach((button) => {
            button.onclick = () => callbacks.previewMimicIdentity((button.dataset.debugMimic ?? "maya"));
        });
        panel.querySelector("[data-debug-floor-reset]").onclick = callbacks.resetFragileFloor;
        panel.querySelector("[data-debug-floor-solution]").onclick = callbacks.revealFloorSolution;
        panel.querySelector("[data-debug-bad-ending]").onclick = callbacks.triggerBadEnding;
        panel.querySelector("[data-debug-ch4-equipment]").onclick = callbacks.grantChapter4Equipment;
        panel.querySelectorAll("[data-debug-mimic-evidence]").forEach((button) => {
            button.onclick = () => callbacks.forceMimicEvidence((button.dataset.debugMimicEvidence ?? "wrong-memory"));
        });
        panel.querySelectorAll("[data-debug-mimic-boss-phase]").forEach((button) => {
            button.onclick = () => callbacks.startMimicBossPhase(Number(button.dataset.debugMimicBossPhase));
        });
        panel.querySelectorAll("[data-debug-post-attacks]").forEach((button) => {
            button.onclick = () => callbacks.setPostDefeatAttackCount(Number(button.dataset.debugPostAttacks));
        });
        panel.querySelector("[data-debug-ending-flags]").onclick = () => this.toast(callbacks.inspectEndingFlags(), 5200);
        panel.querySelectorAll("[data-debug-noah]").forEach((button) => {
            button.onclick = () => callbacks.setNoahCommand((button.dataset.debugNoah ?? "follow"));
        });
        panel.querySelector("[data-debug-true-ending]").onclick = callbacks.triggerTrueEnding;
        panel.querySelector("[data-debug-ch5-inspect]").onclick = () => this.toast(callbacks.inspectChapter5(), 7000);
        panel.querySelectorAll("[data-debug-phase]").forEach((button) => {
            button.onclick = () => callbacks.bossPhase(Number(button.dataset.debugPhase));
        });
        const refresh = () => {
            this.get("debug-state").textContent = callbacks.refreshState();
        };
        refresh();
        window.setInterval(() => {
            if (!panel.classList.contains("hidden"))
                refresh();
        }, 800);
    }
    hideAllScreens() {
        this.root.querySelectorAll(".screen").forEach((element) => element.classList.add("hidden"));
    }
    closeDocument() {
        const viewer = this.get("document-viewer");
        if (viewer.classList.contains("hidden"))
            return;
        this.hideElement("document-viewer");
        const handler = this.documentCloseHandler;
        this.documentCloseHandler = null;
        handler?.();
    }
    showElement(id) {
        this.get(id).classList.remove("hidden");
    }
    hideElement(id) {
        this.get(id).classList.add("hidden");
    }
    get(id) {
        const element = this.root.querySelector(`#${id}`);
        if (!element)
            throw new Error(`Missing UI element: ${id}`);
        return element;
    }
    escape(value) {
        return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);
    }
    drawFilmFrame(context, canvas, t) {
        const width = canvas.width;
        const height = canvas.height;
        const flicker = 0.78 + Math.random() * 0.16;
        context.fillStyle = `rgb(${220 * flicker},${220 * flicker},${214 * flicker})`;
        context.fillRect(0, 0, width, height);
        context.save();
        context.translate(Math.sin(t * 18) * 1.2, Math.cos(t * 13) * 0.8);
        context.fillStyle = "#1a1a1a";
        context.textAlign = "center";
        if (t < 2.1) {
            context.font = "bold 44px Georgia";
            context.fillText("WONDER WORLD", width / 2, 125);
            context.font = "22px Georgia";
            context.fillText("ONDE A DIVERSÃO GANHA VIDA!", width / 2, 172);
            this.drawMascot(context, width / 2, 350, 1.1, false);
        }
        else if (t < 5.3) {
            context.font = "bold 32px Georgia";
            context.fillText("UM DIA PERFEITO PARA TODA A FAMÍLIA", width / 2, 70);
            for (let i = 0; i < 5; i += 1) {
                const x = 120 + i * 140;
                const bounce = Math.sin(t * 5 + i) * 9;
                this.drawPerson(context, x, 310 + bounce, 0.72, i < 2);
            }
            context.strokeStyle = "#333";
            context.lineWidth = 10;
            context.beginPath();
            context.arc(width / 2, 320, 230, Math.PI, 0);
            context.stroke();
        }
        else if (t < 7.4) {
            context.font = "bold 31px Georgia";
            context.fillText("CONHEÇA BODY, O AMIGO DE QUATRO BRAÇOS!", width / 2, 72);
            this.drawMascot(context, width / 2, 345, 1.45, false);
        }
        else if (t < 7.65) {
            context.fillStyle = "#111";
            context.fillRect(0, 0, width, height);
            context.fillStyle = "#ddd";
            context.fillRect(width / 2 - 115, 170, 230, 260);
            context.fillStyle = "#111";
            for (let i = 0; i < 6; i += 1)
                this.drawPerson(context, 140 + i * 125, 420, 0.5, false);
            context.fillStyle = "#fff";
            context.font = "18px monospace";
            context.fillText("QUADRO 437-B", width / 2, 510);
        }
        else if (t < 10.4) {
            context.font = "bold 34px Georgia";
            context.fillText("BRINQUEDOS, MÚSICA E SORRISOS!", width / 2, 72);
            for (let i = 0; i < 4; i += 1) {
                this.drawToy(context, 170 + i * 155, 310 + Math.sin(t * 7 + i) * 8, 0.9);
            }
        }
        else {
            context.font = "bold 48px Georgia";
            context.fillText("WONDER WORLD", width / 2, 210);
            context.font = "24px Georgia";
            context.fillText("TODA CRIANÇA ENCONTRA UMA PARTE DE SI MESMA", width / 2, 265);
            context.font = "18px Georgia";
            context.fillText("VISITE-NOS NA ROTA 17", width / 2, 430);
        }
        for (let i = 0; i < 90; i += 1) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            context.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.18)";
            context.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
        }
        if (t > 0.55 && t < 6.8) {
            context.fillStyle = "rgba(8,8,8,.82)";
            context.fillRect(60, height - 76, width - 120, 46);
            context.fillStyle = "#f1eee4";
            context.font = "20px Georgia";
            context.fillText("Bem-vindos ao Wonder World, onde toda criança encontra uma parte de si mesma.", width / 2, height - 46);
        }
        if (Math.random() < 0.18) {
            context.strokeStyle = "rgba(25,25,25,.4)";
            context.lineWidth = Math.random() * 2 + 0.5;
            const x = Math.random() * width;
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x + Math.sin(t) * 20, height);
            context.stroke();
        }
        context.restore();
    }
    drawPerson(context, x, y, scale, child) {
        const height = child ? 130 : 180;
        context.save();
        context.translate(x, y);
        context.scale(scale, scale);
        context.fillStyle = "#2b2b2b";
        context.beginPath();
        context.arc(0, -height * 0.7, 25, 0, Math.PI * 2);
        context.fill();
        context.fillRect(-22, -height * 0.55, 44, height * 0.48);
        context.fillRect(-45, -height * 0.48, 25, 85);
        context.fillRect(20, -height * 0.48, 25, 85);
        context.fillRect(-21, -height * 0.08, 18, 85);
        context.fillRect(3, -height * 0.08, 18, 85);
        context.restore();
    }
    drawMascot(context, x, y, scale, burned) {
        context.save();
        context.translate(x, y);
        context.scale(scale, scale);
        context.fillStyle = burned ? "#111" : "#393939";
        context.beginPath();
        context.ellipse(0, 0, 95, 120, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(0, -116, 72, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#333";
        context.lineWidth = 24;
        for (const angle of [-2.6, -2.1, -1.05, -0.55]) {
            context.beginPath();
            context.moveTo(Math.cos(angle) * 55, Math.sin(angle) * 42 - 15);
            context.lineTo(Math.cos(angle) * 150, Math.sin(angle) * 110);
            context.stroke();
        }
        context.fillStyle = "#888";
        context.beginPath();
        context.arc(0, -112, 20, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#eee";
        context.beginPath();
        context.arc(-24, -130, 10, 0, Math.PI * 2);
        context.arc(24, -130, 10, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    drawToy(context, x, y, scale) {
        context.save();
        context.translate(x, y);
        context.scale(scale, scale);
        context.fillStyle = "#333";
        context.fillRect(-45, -65, 90, 100);
        context.beginPath();
        context.arc(0, -82, 48, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#aaa";
        context.beginPath();
        context.arc(-15, -88, 6, 0, Math.PI * 2);
        context.arc(15, -88, 6, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
    template() {
        return `
      <div id="loading-screen" class="screen boot-screen hidden" role="status" aria-live="polite" aria-busy="true">
        <div class="boot-panel">
          <div class="boot-kicker">WONDER WORLD · SISTEMA 1964</div>
          <h2>ATRAÇÃO FINAL</h2>
          <div class="loading-symbol" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p id="loading-message">Inicializando…</p>
          <p id="loading-detail" class="loading-detail">Aguarde enquanto o cenário é preparado.</p>
          <div class="loading-progress" aria-hidden="true">
            <div id="loading-progress-fill" class="loading-progress-fill"></div>
          </div>
          <div class="loading-progress-meta">
            <span>CARREGANDO</span>
            <span id="loading-progress-value">0%</span>
          </div>
        </div>
      </div>

      <div id="fatal-error-screen" class="screen fatal-error-screen hidden">
        <div class="panel fatal-error-panel">
          <div class="kicker">FALHA DE INICIALIZAÇÃO</div>
          <h2>O JOGO NÃO CONSEGUIU ABRIR</h2>
          <p id="fatal-error-message"></p>
          <details><summary>Detalhes técnicos</summary><pre id="fatal-error-details"></pre></details>
          <div class="ending-actions">
            <button id="fatal-error-copy" class="ui-button">COPIAR ERRO</button>
            <button id="fatal-error-reload" class="ui-button primary">RECARREGAR</button>
          </div>
        </div>
      </div>

      <div id="main-menu" class="screen hidden">
        <div class="panel">
          <div class="kicker">Uma produção procedural</div>
          <h1 class="brand">ATRAÇÃO FINAL</h1>
          <div class="kicker">Wonder World · 1964</div>
          <div class="menu-buttons">
            <button class="ui-button primary" data-menu-action="new">NOVO JOGO</button>
            <button class="ui-button" data-menu-action="continue">CONTINUAR</button>
            <button class="ui-button" data-menu-action="load">CARREGAR</button>
            <button class="ui-button" data-menu-action="tips">DICAS</button>
            <button class="ui-button" data-menu-action="settings">CONFIGURAÇÕES</button>
            <button class="ui-button" data-menu-action="accessibility">ACESSIBILIDADE</button>
            <button class="ui-button" data-menu-action="credits">CRÉDITOS</button>
          </div>
        </div>
      </div>

      <div id="pause-menu" class="screen hidden">
        <div class="panel">
          <div class="kicker">Jogo pausado</div>
          <h2>PAUSA</h2>
          <div class="menu-buttons">
            <button class="ui-button primary" id="pause-resume">CONTINUAR</button>
            <button class="ui-button" id="pause-tips">DICAS</button>
            <button class="ui-button" id="pause-settings">CONFIGURAÇÕES</button>
            <button class="ui-button" id="pause-main-menu">MENU PRINCIPAL</button>
          </div>
        </div>
      </div>

      <div id="inventory-screen" class="screen hidden">
        <div class="panel inventory-panel">
          <div class="inventory-heading">
            <div>
              <div class="kicker">Itens carregados</div>
              <h2>INVENTÁRIO</h2>
            </div>
            <div id="inventory-count" class="inventory-count">0 itens</div>
          </div>
          <div id="inventory-list" class="inventory-list"></div>
          <div class="tips-controls">TAB fecha o inventário · ESC também retorna ao jogo</div>
          <div class="settings-actions">
            <button class="ui-button primary" id="inventory-close">VOLTAR AO JOGO</button>
          </div>
        </div>
      </div>

      <div id="tips-screen" class="screen hidden">
        <div class="panel tips-panel">
          <div class="kicker">GUIA DE SOBREVIVÊNCIA</div>
          <h2>DICAS</h2>
          <div class="tips-objective-card">
            <div class="kicker">OBJETIVO ATUAL</div>
            <div id="tips-objective"></div>
          </div>
          <ol id="tips-list" class="tips-list"></ol>
          <div class="tips-controls">
            <strong>CONTROLES:</strong> WASD andar · Mouse olhar · E interagir · Clique esquerdo atacar/usar · Botão direito golpe pesado · F tocha · H guia luminoso · Tab inventário · Shift correr · C agachar · Esc pausar
          </div>
          <div class="settings-actions">
            <button class="ui-button primary" id="tips-close">VOLTAR</button>
          </div>
        </div>
      </div>

      <div id="settings-screen" class="screen hidden">
        <div class="panel">
          <div class="kicker">Wonder World</div>
          <h2 data-settings-title>CONFIGURAÇÕES</h2>
          <div class="settings-grid">
            ${this.rangeRow("Volume geral", "masterVolume", 0, 1, 0.01)}
            ${this.rangeRow("Efeitos", "effectsVolume", 0, 1, 0.01)}
            ${this.rangeRow("Música", "musicVolume", 0, 1, 0.01)}
            ${this.rangeRow("Diálogos", "dialogueVolume", 0, 1, 0.01)}
            ${this.rangeRow("Brilho", "brightness", 0.65, 1.65, 0.05, true)}
            ${this.rangeRow("Gama", "gamma", 0.65, 1.65, 0.05, true)}
            ${this.rangeRow("Sensibilidade do mouse", "mouseSensitivity", 0.1, 1.6, 0.05)}
            ${this.checkboxRow("Legendas", "subtitles", true)}
            ${this.rangeRow("Tamanho das legendas", "subtitleSize", 16, 34, 1, true)}
            ${this.checkboxRow("Nomes dos falantes", "speakerLabels", true)}
            ${this.checkboxRow("Legendas de sons importantes", "soundCaptions", true)}
            ${this.checkboxRow("Reduzir tremor de câmera", "reducedCameraShake", true)}
            ${this.checkboxRow("Reduzir flashes", "reducedFlashing", true)}
            ${this.checkboxRow("Reduzir balanço da cabeça", "reducedHeadBob", true)}
            ${this.selectRow("Corrida", "sprintMode", [["hold", "Segurar"], ["toggle", "Alternar"]], true)}
            ${this.selectRow("Agachamento", "crouchMode", [["hold", "Segurar"], ["toggle", "Alternar"]], true)}
            ${this.checkboxRow("Destaque de interações", "highContrastInteractions", true)}
            ${this.checkboxRow("Luz-guia luminosa", "guideLightEnabled", true)}
            ${this.checkboxRow("Janelas maiores no chefe", "extendedBossWindows", true)}
            ${this.checkboxRow("Mais tempo em apagões e puzzles", "extendedPuzzleWindows", true)}
            ${this.checkboxRow("Perseguições simplificadas", "simplifiedChase", true)}
            ${this.selectRow("Desempenho", "performancePreset", [["performance", "Desempenho"], ["balanced", "Equilibrado"], ["cinematic", "Cinemático"]])}
          </div>
          <div class="settings-actions">
            <button class="ui-button" data-settings-reset>RESTAURAR</button>
            <button class="ui-button" data-settings-close>VOLTAR</button>
            <button class="ui-button primary" data-settings-save>SALVAR</button>
          </div>
        </div>
      </div>

      <div id="credits-screen" class="screen hidden">
        <div class="panel">
          <div class="kicker">Créditos</div>
          <h2>ATRAÇÃO FINAL</h2>
          <p>Direção criativa e conceito: Timbó.</p>
          <p>Campanha procedural criada dentro do projeto, sem arte ou áudio externo em tempo de execução.</p>
          <div class="kicker">Galeria de finais</div>
          <div id="credits-ending-gallery" class="ending-gallery"></div>
          <button class="ui-button" id="credits-close">VOLTAR</button>
        </div>
      </div>

      <div id="hud" class="hidden">
        <div id="objective"></div>
        <div id="interaction-prompt" class="hidden" role="status" aria-live="polite"></div>
        <div id="crosshair"></div>
        <div id="status">
          <div class="meter"><div class="meter-label">VIDA</div><div class="meter-track"><div id="health-fill" class="meter-fill"></div></div></div>
          <div class="meter"><div class="meter-label">TOCHA</div><div class="meter-track"><div id="fuel-fill" class="meter-fill"></div></div></div>
          <div class="meter compact"><div class="meter-label">ARMADURA</div><div class="meter-track"><div id="armor-fill" class="meter-fill"></div></div></div>
          <div class="meter compact"><div class="meter-label">FÔLEGO</div><div class="meter-track"><div id="stamina-fill" class="meter-fill"></div></div></div>
          <div id="lives-count">VIDAS 3</div>
          <div id="inventory-mini"></div>
        </div>
        <div id="subtitle" class="hidden"></div>
        <div id="sound-caption" class="hidden"></div>
        <div id="noise-indicator" class="hidden"><span>RUÍDO</span><div class="noise-track"><div id="noise-fill"></div></div></div>
        <div id="toast" class="hidden"></div>
        <div id="damage-vignette" class="damage-vignette"></div>
        <div id="flash" class="flash"></div>
        <div id="corruption-overlay" class="corruption-overlay"></div>
      </div>

      <div id="ending-screen" class="screen hidden ending-screen">
        <div class="panel ending-panel">
          <div class="kicker">REGISTRO DE FINAL</div>
          <h2 id="ending-title"></h2>
          <p id="ending-body"></p>
          <div class="ending-actions">
            <button id="ending-menu" class="ui-button">MENU PRINCIPAL</button>
            <button id="ending-retry" class="ui-button primary">TENTAR NOVAMENTE</button>
          </div>
        </div>
      </div>

      <div id="document-viewer" class="screen hidden">
        <div class="panel">
          <h2 id="document-title" class="document-title"></h2>
          <div id="document-body" class="document-body"></div>
          <button id="document-close" class="ui-button document-close">GUARDAR</button>
        </div>
      </div>

      <div id="cinematic" class="screen hidden">
        <canvas id="film-canvas" width="900" height="540"></canvas>
        <div class="film-overlay"></div>
        <button id="skip-film" class="ui-button">PULAR</button>
      </div>

      <div id="chapter-card" class="screen hidden">
        <div>
          <h2 id="chapter-title"></h2>
          <div id="chapter-subtitle" class="kicker"></div>
        </div>
      </div>

      <div id="boss-ui" class="hidden">
        <div id="boss-bar"><div id="boss-name"></div><div id="boss-health"><div id="boss-health-fill"></div></div></div>
        <div id="tactical-actions" class="hidden"></div>
      </div>

      <div id="debug-panel" class="hidden">
        <strong>DEBUG · ?debug=1</strong>
        <div class="debug-grid">
          <button data-debug-teleport="prologue">Prólogo</button>
          <button data-debug-teleport="lobby">Lobby</button>
          <button data-debug-teleport="gift">Loja</button>
          <button data-debug-teleport="power">Elétrica</button>
          <button data-debug-teleport="hands">Mãos</button>
          <button data-debug-teleport="eyes">Olhos</button>
          <button data-debug-teleport="heart">Coração</button>
          <button data-debug-teleport="feet">Pés</button>
          <button data-debug-teleport="auditorium">Auditório</button>
          <button data-debug-give>Dar itens</button>
          <button data-debug-fuel>Combustível ∞</button>
          <button data-debug-god>Invulnerável</button>
          <button data-debug-reset>Resetar puzzle</button>
          <button data-debug-boss>Iniciar Body</button>
          <button data-debug-phase="1">Fase 1</button>
          <button data-debug-phase="2">Fase 2</button>
          <button data-debug-phase="3">Fase 3</button>
          <button data-debug-collisions>Ver colisões</button>
          <button data-debug-teleport="chapter2Elevator">Elevador C2</button>
          <button data-debug-teleport="mirrorRoom">Espelhos</button>
          <button data-debug-teleport="storage">Depósito</button>
          <button data-debug-teleport="controlRoom">Apagão</button>
          <button data-debug-teleport="machine">Máquina</button>
          <button data-debug-teleport="arena1">Arena 1</button>
          <button data-debug-teleport="arena2">Arena 2</button>
          <button data-debug-teleport="arena3">Arena 3</button>
          <button data-debug-mannequins>Movimento manequins</button>
          <button data-debug-observation>Ver observação</button>
          <button data-debug-rays>Ver raios</button>
          <button data-debug-blackout>Forçar apagão</button>
          <button data-debug-cells>Dar células</button>
          <button data-debug-mirror>Reset espelhos</button>
          <button data-debug-shelves>Reset prateleiras</button>
          <button data-debug-arena="1">Esfera 1</button>
          <button data-debug-arena="2">Esfera 2</button>
          <button data-debug-arena="3">Esfera 3</button>
          <button data-debug-count="40">40 manequins</button>
          <button data-debug-count="80">80 manequins</button>
          <button data-debug-teleport="chapter3Start">Entrada C3</button>
          <button data-debug-teleport="jackChamber">Caixa de sustos</button>
          <button data-debug-teleport="danielRoom">Daniel</button>
          <button data-debug-teleport="generator1">Gerador 1</button>
          <button data-debug-teleport="generator2">Gerador 2</button>
          <button data-debug-teleport="generator3">Gerador 3</button>
          <button data-debug-teleport="generator4">Gerador 4</button>
          <button data-debug-teleport="generator5">Gerador 5</button>
          <button data-debug-jesse-intro>Intro Jesse</button>
          <button data-debug-chase="1">Perseguição 1</button>
          <button data-debug-chase="3">Perseguição 3</button>
          <button data-debug-noise="25">Ruído 25</button>
          <button data-debug-noise="90">Ruído 90</button>
          <button data-debug-jesse-search>Forçar Jesse</button>
          <button data-debug-noise-view>Ver propagação</button>
          <button data-debug-jesse-view>Ver alvo Jesse</button>
          <button data-debug-generator-components>Dar componentes</button>
          <button data-debug-melody-reset>Reset melodia</button>
          <button data-debug-miniboss>Spawn miniboss</button>
          <button data-debug-maya>Maya reveal</button>
          <button data-debug-mimic="maya">Mimic Maya</button>
          <button data-debug-mimic="composite">Mimic composto</button>
          <button data-debug-teleport="prisonCell">Prisão C4</button>
          <button data-debug-teleport="fragileFloor">Piso frágil</button>
          <button data-debug-teleport="equipment">Equipamento C4</button>
          <button data-debug-teleport="identityTesting">Testes identidade</button>
          <button data-debug-teleport="mimicArena">Arena Mimic</button>
          <button data-debug-floor-reset>Reset piso frágil</button>
          <button data-debug-floor-solution>Revelar solução piso</button>
          <button data-debug-bad-ending>Final ruim</button>
          <button data-debug-ch4-equipment>Dar equipamento C4</button>
          <button data-debug-mimic-evidence="wrong-memory">Evidência memória</button>
          <button data-debug-mimic-evidence="mirrored-hand">Evidência mão</button>
          <button data-debug-mimic-evidence="shared-breath">Evidência respiração</button>
          <button data-debug-mimic-boss-phase="1">Mimic fase 1</button>
          <button data-debug-mimic-boss-phase="2">Mimic fase 2</button>
          <button data-debug-mimic-boss-phase="3">Mimic fase 3</button>
          <button data-debug-mimic-boss-phase="4">Mimic pós-derrota</button>
          <button data-debug-post-attacks="0">Pós-golpes 0</button>
          <button data-debug-post-attacks="12">Pós-golpes 12</button>
          <button data-debug-ending-flags>Flags finais</button>
          <button data-debug-teleport="entrance">Entrada C5</button>
          <button data-debug-teleport="proof">Prova de vida</button>
          <button data-debug-teleport="employeeArchives">Arquivos</button>
          <button data-debug-teleport="memoryLab">Lab. memória</button>
          <button data-debug-teleport="archiveCore">Núcleo arquivos</button>
          <button data-debug-teleport="burnedAuditorium">Auditório queimado</button>
          <button data-debug-teleport="mannequinTransit">Retorno manequins</button>
          <button data-debug-teleport="finalJesse">Jesse final</button>
          <button data-debug-teleport="burningArchives">Arquivos em chamas</button>
          <button data-debug-teleport="bridge">Ponte final</button>
          <button data-debug-teleport="finalExit">Saída final</button>
          <button data-debug-teleport="authorities">Autoridades</button>
          <button data-debug-noah="follow">Noah seguir</button>
          <button data-debug-noah="wait">Noah esperar</button>
          <button data-debug-noah="move">Noah ir ao ponto</button>
          <button data-debug-noah="distract">Noah distrair</button>
          <button data-debug-true-ending>Forçar final verdadeiro</button>
          <button data-debug-ch5-inspect>Inspecionar C5</button>
        </div>
        <pre id="debug-state"></pre>
      </div>
    `;
    }
    bindPauseButtons() {
        this.get("pause-resume").onclick = () => this.pauseHandler?.("resume");
        this.get("pause-tips").onclick = () => this.pauseHandler?.("tips");
        this.get("pause-settings").onclick = () => this.pauseHandler?.("settings");
        this.get("pause-main-menu").onclick = () => this.pauseHandler?.("menu");
    }
    rangeRow(label, key, min, max, step, accessibility = false) {
        const id = `setting-${key}`;
        return `<div data-setting-row data-accessibility="${accessibility}"><label for="${id}">${label}</label></div><div data-setting-row data-accessibility="${accessibility}"><input id="${id}" name="${key}" data-setting="${key}" type="range" min="${min}" max="${max}" step="${step}"></div>`;
    }
    checkboxRow(label, key, accessibility = false) {
        const id = `setting-${key}`;
        return `<div data-setting-row data-accessibility="${accessibility}"><label for="${id}">${label}</label></div><div data-setting-row data-accessibility="${accessibility}"><input id="${id}" name="${key}" data-setting="${key}" type="checkbox"></div>`;
    }
    selectRow(label, key, options, accessibility = false) {
        const id = `setting-${key}`;
        const optionsHtml = options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("");
        return `<div data-setting-row data-accessibility="${accessibility}"><label for="${id}">${label}</label></div><div data-setting-row data-accessibility="${accessibility}"><select id="${id}" name="${key}" data-setting="${key}">${optionsHtml}</select></div>`;
    }
}
