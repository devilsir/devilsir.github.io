/* Registered module: neighborhood-navigation */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("neighborhood-navigation", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, L = V.Living, H = V.Heritage;
    const sections = [["quests", "Investiga\xE7\xE3o", "journal"], ["missions", "Comunidade", "community"], ["readings", "Livros e notas", "book"], ["chronicles", "Cr\xF4nicas dos lugares", "history"], ["field", "Campo", "leaf"], ["neighborhood", "Bairro vivo", "voice"], ["culture", "Culturas negras", "book"], ["heritage", "Vozes e objetos", "book"]];
    L.nav = function(tab) {
      return `<nav class="tabs living-tabs notebook-sections" aria-label="Todas as se\xE7\xF5es do caderno">${sections.map(([id, label, icon]) => `<button data-notebook-tab="${id}" class="${tab === id ? "active" : ""}" aria-current="${tab === id ? "page" : "false"}">${V.Interface.icon(icon)}<span>${label}</span></button>`).join("")}</nav>`;
    };
    V.Cozy.nav = (tab) => L.nav(tab);
    const bind = V.Game.bind.bind(V.Game);
    V.Game.bind = function() {
      bind();
      V.$("#heritage-button").onclick = () => L.journal("heritage");
    };
    V.Hooks.around(V.Game, "pause", "neighborhood-navigation:pause:1", (pause) => function(reason) {
      pause(reason);
      if (V.Game.mode !== "explore") return;
      const host = V.$("#pause-resume")?.parentElement;
      if (host) {
        const button = document.createElement("button");
        button.id = "pause-heritage";
        button.className = "secondary";
        button.textContent = "Vozes e objetos \xB7 retratos e contextos";
        button.onclick = () => H.journal();
        host.append(button);
      }
    });
    V.Hooks.around(V.Game, "onKey", "neighborhood-navigation:onKey:1", (keys) => function(k, e) {
      if (k === "v" && this.screen === "game" && this.mode === "explore" && !V.SceneEditor.active && !V.modal && !V.Dialogue.active) {
        e.preventDefault?.();
        L.journal("heritage");
        return;
      }
      return keys(k, e);
    });
  })();
});
