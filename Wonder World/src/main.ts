import "./style.css";

const bootFallback = document.querySelector<HTMLElement>("#boot-fallback");
const bootStatus = document.querySelector<HTMLElement>("#boot-status");
const BOOT_MARKER = "atracao-final-boot-pending-v2";
const LAST_ERROR = "atracao-final-last-error-v2";
const query = new URLSearchParams(location.search);
const safeMode = query.get("safe") === "1";

function updateBootStatus(message: string): void {
  if (bootStatus) bootStatus.textContent = message;
}

function browserDiagnostic(): string {
  const canvas = document.createElement("canvas");
  const webgl2 = Boolean(canvas.getContext("webgl2"));
  const webgl1 = Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  return [
    `URL: ${location.href}`,
    `Modo seguro: ${safeMode ? "sim" : "não"}`,
    `WebGL 2: ${webgl2 ? "disponível" : "indisponível"}`,
    `WebGL 1: ${webgl1 ? "disponível" : "indisponível"}`,
    `Navegador: ${navigator.userAgent}`
  ].join("\n");
}

function safeModeUrl(): string {
  const next = new URL(location.href);
  next.searchParams.set("safe", "1");
  return next.toString();
}

function showBootstrapError(error: unknown): void {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error && error.stack ? error.stack : message;
  const report = `${stack}\n\n${browserDiagnostic()}`;
  console.error("ATRAÇÃO FINAL bootstrap failure", error);
  try {
    localStorage.setItem(LAST_ERROR, report);
    localStorage.removeItem(BOOT_MARKER);
  } catch {
    // Storage can be unavailable in strict privacy modes; the visible report still works.
  }

  if (!bootFallback) return;
  bootFallback.classList.add("boot-fallback-error");
  bootFallback.innerHTML = `
    <div class="boot-fallback-panel">
      <div class="boot-fallback-kicker">FALHA DE INICIALIZAÇÃO</div>
      <h1>ATRAÇÃO FINAL</h1>
      <p>O jogo encontrou um erro antes de abrir o menu.</p>
      <pre>${escapeHtml(report)}</pre>
      <div class="boot-fallback-actions">
        <button id="boot-copy-error" type="button">COPIAR ERRO</button>
        <button id="boot-safe-mode" type="button">ABRIR MODO SEGURO</button>
        <button id="boot-reload" type="button">RECARREGAR</button>
      </div>
    </div>
  `;
  document.querySelector<HTMLButtonElement>("#boot-reload")?.addEventListener("click", () => location.reload());
  document.querySelector<HTMLButtonElement>("#boot-safe-mode")?.addEventListener("click", () => location.assign(safeModeUrl()));
  document.querySelector<HTMLButtonElement>("#boot-copy-error")?.addEventListener("click", () => {
    void navigator.clipboard?.writeText(report);
  });
}

function showPreviousCrashRecovery(): void {
  if (!bootFallback) return;
  const lastError = localStorage.getItem(LAST_ERROR);
  const report = lastError ? escapeHtml(lastError) : escapeHtml(browserDiagnostic());
  bootFallback.innerHTML = `
    <div class="boot-fallback-panel">
      <div class="boot-fallback-kicker">RECUPERAÇÃO DE INICIALIZAÇÃO</div>
      <h1>ATRAÇÃO FINAL</h1>
      <p>A inicialização anterior foi interrompida antes do menu aparecer. Isso costuma indicar falha do WebGL ou do processo gráfico do navegador.</p>
      <pre>${report}</pre>
      <div class="boot-fallback-actions">
        <button id="boot-safe-mode" type="button">INICIAR MODO SEGURO</button>
        <button id="boot-normal-retry" type="button">TENTAR NORMALMENTE</button>
        <button id="boot-copy-error" type="button">COPIAR DIAGNÓSTICO</button>
      </div>
    </div>
  `;
  document.querySelector<HTMLButtonElement>("#boot-safe-mode")?.addEventListener("click", () => location.assign(safeModeUrl()));
  document.querySelector<HTMLButtonElement>("#boot-normal-retry")?.addEventListener("click", () => {
    localStorage.removeItem(BOOT_MARKER);
    const next = new URL(location.href);
    next.searchParams.set("retry", Date.now().toString());
    location.assign(next.toString());
  });
  document.querySelector<HTMLButtonElement>("#boot-copy-error")?.addEventListener("click", () => {
    void navigator.clipboard?.writeText(lastError ?? browserDiagnostic());
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character] ?? character);
}

window.addEventListener("error", (event) => showBootstrapError(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => showBootstrapError(event.reason));

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

canvas?.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  showBootstrapError(new Error("O contexto WebGL foi perdido. Tente o modo seguro."));
});

let interruptedBoot = false;
try {
  const previous = Number(localStorage.getItem(BOOT_MARKER));
  interruptedBoot = Number.isFinite(previous) && Date.now() - previous < 10 * 60 * 1000 && !safeMode && !query.has("retry");
} catch {
  interruptedBoot = false;
}

if (interruptedBoot) {
  showPreviousCrashRecovery();
} else if (!canvas || !uiRoot) {
  showBootstrapError(new Error("Os elementos principais do jogo não foram encontrados no HTML."));
} else {
  try {
    localStorage.setItem(BOOT_MARKER, String(Date.now()));
  } catch {
    // Continue even if storage is unavailable.
  }
  updateBootStatus(safeMode ? "Iniciando em modo seguro…" : "Carregando o motor 3D…");
  void import("./core/Game")
    .then(async ({ Game }) => {
      updateBootStatus("Inicializando o Wonder World…");
      const game = new Game(canvas, uiRoot);
      await game.initialize();
      try {
        localStorage.removeItem(BOOT_MARKER);
        localStorage.removeItem(LAST_ERROR);
      } catch {
        // No-op.
      }
      bootFallback?.remove();
    })
    .catch(showBootstrapError);
}
