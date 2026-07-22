const escapeHTML = (value="") => String(value).replace(/[&<>'"]/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);

export class DialogueSystem {
  constructor(layer, getState, audio) {
    this.layer = layer;
    this.getState = getState;
    this.audio = audio;
    this.history = [];
    this.lines = [];
    this.index = 0;
    this.typing = false;
    this.timer = null;
    this.currentText = "";
    this.resolve = null;
    this.choices = null;
    this.auto = false;
    this.historyOpen = false;
  }

  async play(lines, choices=null, id=null) {
    if (!Array.isArray(lines) || !lines.length) return null;
    this.lines = lines;
    this.index = 0;
    this.choices = choices;
    this.auto = Boolean(this.getState()?.settings?.autoDialogue);
    this.layer.hidden = false;
    this.layer.innerHTML = `
      <div class="dialogue-box" role="dialog" aria-modal="true" aria-label="Diálogo">
        <div class="dialogue-portrait"><img alt=""></div>
        <div class="dialogue-content">
          <div class="dialogue-speaker"><strong></strong><span></span></div>
          <p class="dialogue-text" aria-live="polite"></p>
          <span class="dialogue-next">CLIQUE / ENTER PARA CONTINUAR</span>
        </div>
        <div class="dialogue-tools">
          <button data-dialogue="history">Histórico</button>
          <button data-dialogue="auto">Auto: ${this.auto ? "ligado" : "desligado"}</button>
          <button data-dialogue="skip">Pular visto</button>
        </div>
      </div>
      <div class="dialogue-choices" hidden></div>`;
    this.layer.querySelector(".dialogue-box").addEventListener("click",(event) => {
      if (event.target.closest("button")) return;
      this.advance();
    });
    this.layer.querySelector('[data-dialogue="history"]').addEventListener("click",()=>this.toggleHistory());
    this.layer.querySelector('[data-dialogue="auto"]').addEventListener("click",(event)=>{
      this.auto = !this.auto;
      event.currentTarget.textContent = `Auto: ${this.auto ? "ligado" : "desligado"}`;
      this.audio.ui();
    });
    this.layer.querySelector('[data-dialogue="skip"]').addEventListener("click",()=>{
      const state = this.getState();
      if (id && state?.dialogueSeen?.includes(id)) {
        this.index = this.lines.length - 1;
        this.showLine();
      } else {
        this.audio.cancel();
      }
    });
    this.keyHandler = (event) => {
      if (["Enter","Space"].includes(event.code)) { event.preventDefault(); this.advance(); }
      if (event.code === "KeyH") this.toggleHistory();
    };
    window.addEventListener("keydown",this.keyHandler);
    this.showLine();
    return new Promise((resolve) => { this.resolve = resolve; this.dialogueId = id; });
  }

  showLine() {
    clearTimeout(this.timer);
    const line = this.lines[this.index];
    if (!line) return this.finish(null);
    const portrait = this.layer.querySelector(".dialogue-portrait img");
    portrait.src = line.portrait || "";
    portrait.alt = line.speaker || "Retrato";
    this.layer.querySelector(".dialogue-speaker strong").textContent = line.speaker || "Voz";
    this.layer.querySelector(".dialogue-speaker span").textContent = line.title || "";
    this.currentText = line.text || "";
    this.history.push({speaker:line.speaker || "Voz",text:this.currentText});
    if (this.history.length > 80) this.history.shift();
    this.typeText(this.currentText);
  }

  typeText(text) {
    const target = this.layer.querySelector(".dialogue-text");
    if (!target) return;
    clearInterval(this.timer);
    target.textContent = "";
    this.typing = true;
    let index = 0;
    const speed = Math.max(8,Number(this.getState()?.settings?.textSpeed || 28));
    this.timer = setInterval(() => {
      index += 1;
      target.textContent = text.slice(0,index);
      if (index % 4 === 0 && text[index] !== " ") this.audio.tone(360 + (index % 5) * 16,.016,"square",.012);
      if (index >= text.length) {
        clearInterval(this.timer);
        this.typing = false;
        if (this.auto) this.timer = setTimeout(()=>this.advance(),Math.max(950,text.length * 18));
      }
    },Math.max(7,56 - speed));
  }

  advance() {
    if (this.historyOpen) return this.toggleHistory();
    this.audio.ui();
    if (this.typing) {
      clearInterval(this.timer);
      this.typing = false;
      const target = this.layer.querySelector(".dialogue-text");
      if (target) target.textContent = this.currentText;
      return;
    }
    if (this.index < this.lines.length - 1) {
      this.index += 1;
      this.showLine();
      return;
    }
    if (this.choices?.length) this.showChoices();
    else this.finish(null);
  }

  showChoices() {
    const box = this.layer.querySelector(".dialogue-choices");
    box.hidden = false;
    box.innerHTML = this.choices.map((choice,index)=>`<button data-choice="${index}"><strong>${escapeHTML(choice.label)}</strong>${choice.description ? `<span>${escapeHTML(choice.description)}</span>` : ""}</button>`).join("");
    box.querySelectorAll("button").forEach((button) => button.addEventListener("click",()=>{
      const choice = this.choices[Number(button.dataset.choice)];
      this.audio.confirm();
      this.finish(choice?.value ?? null);
    }));
    this.layer.querySelector(".dialogue-next").textContent = "ESCOLHA UMA RESPOSTA";
  }

  toggleHistory() {
    this.audio.ui();
    const existing = this.layer.querySelector(".dialogue-history");
    if (existing) {
      existing.remove();
      this.historyOpen = false;
      return;
    }
    this.historyOpen = true;
    const panel = document.createElement("div");
    panel.className = "dialogue-history";
    panel.innerHTML = `<h3>Histórico da conversa</h3>${this.history.map((entry)=>`<p><strong>${escapeHTML(entry.speaker)}:</strong> ${escapeHTML(entry.text)}</p>`).join("")}<button class="primary-button" type="button">Fechar</button>`;
    panel.querySelector("button").addEventListener("click",()=>this.toggleHistory());
    this.layer.appendChild(panel);
  }

  finish(value) {
    clearInterval(this.timer); clearTimeout(this.timer);
    window.removeEventListener("keydown",this.keyHandler);
    const state = this.getState();
    if (this.dialogueId && state && !state.dialogueSeen.includes(this.dialogueId)) state.dialogueSeen.push(this.dialogueId);
    this.layer.hidden = true;
    this.layer.innerHTML = "";
    const resolve = this.resolve;
    this.resolve = null;
    if (resolve) resolve(value);
  }
}
