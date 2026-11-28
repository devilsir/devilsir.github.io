/* Registered module: credits */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("credits", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, esc = V.escape;
    const groups = [
      ["Hist\xF3ria e educa\xE7\xE3o", ["content", "learning", "cozyContent", "heritageContent", "protestContent", "protestLearning"]],
      ["Culturas africanas e afro-brasileiras", ["culturalContent", "wardrobeContent", "coastContent", "AdventureData", "AncestralData", "TerreirosCollectionData", "AfricanMuseumData", "WordsRespectData"]],
      ["Jogos e pr\xE1ticas culturais", ["CultureChallengeData", "AfricanPlayData"]],
      ["Arte e espa\xE7os de conviv\xEAncia", ["furnishingsContent", "CommunityFurnitureData", "neighborsContent", "fieldGuideContent"]],
      ["Geografia e navega\xE7\xE3o", ["MaritimeData", "CapeRegionData"]],
      ["Alimenta\xE7\xE3o e culin\xE1ria", ["MarketData", "CookingData", "FoodExpansion", "FoodMuseumData"]],
      ["Biomas, fauna e conserva\xE7\xE3o", ["NatureData", "NatureChallenge"]]
    ];
    const C = V.Credits = {
      authors: ["Lucas Xavier Nardelli", "Claudilene Alves Lopes"],
      year: 2026,
      license: "MIT",
      pageSize: 20,
      get licenseText() {
        return "MIT License\n\nCopyright (c) " + this.year + " " + this.authors.join(" and ") + '\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n';
      },
      normalize(value) {
        return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
      },
      link(value, local = false) {
        if (typeof value !== "string") return null;
        if (local) return !window.VoicesApp?.externalResearch && value === "data/sources/catalogo-brincadeiras.pdf" ? value : null;
        try {
          const url = new URL(value);
          if (!["https:", "http:"].includes(url.protocol)) return null;
          return url.href;
        } catch {
          return null;
        }
      },
      references() {
        const rows = new Map();
        for (const [category, owners] of groups) for (const owner of owners) {
          const sources = V[owner]?.sources;
          if (!sources || typeof sources !== "object") continue;
          for (const source of Array.isArray(sources) ? sources : Object.values(sources)) {
            if (!source || typeof source !== "object") continue;
            const title = source.name || source.title, url = this.link(source.url), local = this.link(source.local, true);
            if (!title || !url && !local) continue;
            const key = (url || local).split("#")[0], old = rows.get(key);
            if (old) {
              old.categories.add(category);
              if (!old.note) old.note = source.note || source.text || "";
              if (!old.local && local) old.local = local;
              continue;
            }
            const author = source.authors || source.author || "", record = { title: String(title), url, local, note: source.note || source.text || "", author: Array.isArray(author) ? author.join("; ") : String(author), publisher: source.institution || source.publisher || source.journal || "", year: source.year || "", categories: new Set([category]) };
            rows.set(key, record);
          }
        }
        return [...rows.values()].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
      },
      presentation() {
        return `<section class="credits-authorship" aria-labelledby="credits-authorship-title"><p class="credits-kicker">VOICES \u2014 REBOOT THE STORY</p><h3 id="credits-authorship-title">Autoria do projeto</h3><div class="credits-authors">${this.authors.map((name) => "<p>" + esc(name) + "</p>").join("")}</div><p class="credits-copyright">\xA9 ${this.year} ${esc(this.authors.join(" e "))}</p></section>
  <section class="credits-section"><h3>Apresenta\xE7\xE3o</h3><p>VOICES \u2014 Reboot the Story \xE9 um jogo educativo de explora\xE7\xE3o e investiga\xE7\xE3o ambientado na cidade ficcional de New Harmony. Sua proposta articula mem\xF3ria, autoria, culturas africanas e afro-brasileiras e aprendizagem da l\xEDngua inglesa.</p><p>A experi\xEAncia re\xFAne uma campanha narrativa, pesquisa de fontes, registro de descobertas, oficinas, desafios e explora\xE7\xE3o individual ou em dupla. Museus, biblioteca, universidade, espa\xE7os de trabalho e conviv\xEAncia, ambientes costeiros e biomas brasileiros e africanos integram o percurso.</p></section>
  <div class="credits-scope"><section class="credits-section"><h3>Narrativa e representa\xE7\xF5es</h3><p>Os personagens investigam altera\xE7\xF5es em documentos e mem\xF3rias com o aux\xEDlio do Histori\xF3grafo, uma m\xE1scara ancestral ficcional. A cidade, seus habitantes e os acontecimentos da campanha comp\xF5em o universo narrativo do jogo.</p><p>Os conte\xFAdos hist\xF3ricos, culturais, geogr\xE1ficos e ambientais s\xE3o apresentados por meio de s\xEDnteses did\xE1ticas e interpreta\xE7\xF5es art\xEDsticas, acompanhadas de refer\xEAncias e de seus respectivos contextos.</p></section><section class="credits-section"><h3>Proposta educativa</h3><p>O jogo favorece a leitura contextualizada, a compara\xE7\xE3o de registros, o reconhecimento de autoria, a amplia\xE7\xE3o do vocabul\xE1rio em ingl\xEAs e a reflex\xE3o sobre diversidade cultural, conviv\xEAncia e conserva\xE7\xE3o ambiental.</p><p>Seu uso pedag\xF3gico \xE9 complementar e admite media\xE7\xE3o docente, investiga\xE7\xE3o compartilhada e diferentes ritmos de aprendizagem. Os recursos visuais, as anima\xE7\xF5es e os ambientes sonoros integram essa experi\xEAncia.</p></section></div>`;
      },
      licensing() {
        return `<section class="credits-section"><p class="credits-kicker">LICENCIAMENTO DO PROJETO</p><h3>Licen\xE7a MIT</h3><p>O c\xF3digo e os materiais originais de VOICES \u2014 Reboot the Story s\xE3o disponibilizados sob a licen\xE7a MIT, incluindo textos autorais, ilustra\xE7\xF5es, interface, anima\xE7\xF5es e \xE1udio original.</p><p>A licen\xE7a permite utilizar, copiar, modificar e distribuir esses materiais, inclusive comercialmente, mediante a preserva\xE7\xE3o do aviso de direitos autorais e do texto da licen\xE7a. O texto integral em ingl\xEAs est\xE1 dispon\xEDvel abaixo.</p><div class="credits-document-links"><a href="LICENSE.txt" target="_blank" rel="noopener noreferrer">Abrir licen\xE7a MIT</a><a href="NOTICE.txt" target="_blank" rel="noopener noreferrer">Consultar avisos de terceiros</a></div><details class="credits-license-text"><summary>Texto integral da licen\xE7a MIT</summary><pre>${esc(this.licenseText)}</pre></details></section><section class="credits-section credits-third-party"><h3>Materiais de terceiros</h3><p>As fontes tipogr\xE1ficas DejaVu e Patrick Hand mant\xEAm suas licen\xE7as de origem, inclu\xEDdas na distribui\xE7\xE3o. Os dados geogr\xE1ficos Natural Earth s\xE3o identificados como de dom\xEDnio p\xFAblico. As refer\xEAncias bibliogr\xE1ficas e os conte\xFAdos externos mant\xEAm suas pr\xF3prias condi\xE7\xF5es de uso.</p><div class="credits-document-links"><a href="assets/fonts/LICENSE.txt" target="_blank" rel="noopener noreferrer">Licen\xE7a das fontes DejaVu</a><a href="assets/fonts/PATRICK-HAND-OFL.txt" target="_blank" rel="noopener noreferrer">Licen\xE7a da fonte Patrick Hand</a></div></section>`;
      },
      open() {
        const state = { tab: "presentation", query: "", category: "all", page: 0 }, references = this.references();
        let searchTimer;
        V.UI.modal("Cr\xE9ditos e fontes", "AUTORIA \xB7 APRESENTA\xC7\xC3O \xB7 REFER\xCANCIAS \xB7 LICENCIAMENTO", `<div class="credits-page"><nav class="credits-navigation" aria-label="Se\xE7\xF5es dos cr\xE9ditos"><button data-credits-tab="presentation" aria-pressed="true">Autoria e projeto</button><button data-credits-tab="references" aria-pressed="false">Refer\xEAncias</button><button data-credits-tab="license" aria-pressed="false">Licen\xE7a</button></nav><div id="credits-content"></div></div>`, '<button id="credits-close" class="primary">Voltar</button>', true);
        const root = V.$(".credits-page");
        root.closest(".modal").classList.add("formal-credits");
        const paintRows = () => {
          if (!root.isConnected || state.tab !== "references") return;
          const query = this.normalize(state.query), filtered = references.filter((s) => (state.category === "all" || s.categories.has(state.category)) && this.normalize([s.title, s.author, s.publisher, s.note, ...s.categories].join(" ")).includes(query)), pages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
          state.page = V.clamp(state.page, 0, pages - 1);
          const start = state.page * this.pageSize, rows = filtered.slice(start, start + this.pageSize);
          root.querySelector("#credits-reference-results").innerHTML = rows.length ? rows.map((s) => `<article class="credits-reference"><h3>${s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + "</a>" : esc(s.title)}</h3>${s.author || s.publisher || s.year ? '<p class="credits-reference-meta">' + esc([s.author, s.publisher, s.year].filter(Boolean).join(" \xB7 ")) + "</p>" : ""}${s.note ? "<p>" + esc(s.note) + "</p>" : ""}<p class="credits-reference-category">${esc([...s.categories].join(" \xB7 "))}</p>${s.local ? '<a href="' + esc(s.local) + '" target="_blank" rel="noopener noreferrer">Consultar documento inclu\xEDdo no jogo</a>' : ""}</article>`).join("") : '<p class="credits-empty">Nenhuma refer\xEAncia corresponde \xE0 busca.</p>';
          root.querySelector("#credits-reference-count").textContent = filtered.length ? start + 1 + "\u2013" + Math.min(start + this.pageSize, filtered.length) + " de " + filtered.length + " refer\xEAncias" : "0 refer\xEAncias";
          root.querySelector("#credits-reference-page").textContent = "P\xE1gina " + (state.page + 1) + " de " + pages;
          root.querySelector("#credits-reference-prev").disabled = state.page === 0;
          root.querySelector("#credits-reference-next").disabled = state.page >= pages - 1;
        };
        const paint = () => {
          clearTimeout(searchTimer);
          const content = root.querySelector("#credits-content");
          for (const button of root.querySelectorAll("[data-credits-tab]")) button.setAttribute("aria-pressed", String(button.dataset.creditsTab === state.tab));
          if (state.tab === "presentation") content.innerHTML = this.presentation();
          else if (state.tab === "license") content.innerHTML = this.licensing();
          else {
            const categories = [...new Set(references.flatMap((s) => [...s.categories]))].sort((a, b) => a.localeCompare(b, "pt-BR"));
            content.innerHTML = `<section class="credits-section"><h3>Refer\xEAncias de pesquisa</h3><p>Esta rela\xE7\xE3o re\xFAne as fontes utilizadas nos conte\xFAdos hist\xF3ricos, culturais, educativos e ambientais do jogo. Cada registro identifica a publica\xE7\xE3o ou institui\xE7\xE3o de origem e o contexto de sua utiliza\xE7\xE3o. A abertura de p\xE1ginas externas requer conex\xE3o \xE0 internet.</p></section><div class="credits-reference-filters"><label>Buscar refer\xEAncias<input id="credits-reference-search" type="search" value="${esc(state.query)}" placeholder="T\xEDtulo, tema, institui\xE7\xE3o ou autor"></label><label>\xC1rea de pesquisa<select id="credits-reference-category"><option value="all">Todas as \xE1reas</option>${categories.map((category2) => '<option value="' + esc(category2) + '">' + esc(category2) + "</option>").join("")}</select></label></div><p id="credits-reference-count" role="status" aria-live="polite"></p><div id="credits-reference-results"></div><nav class="credits-reference-pages" aria-label="P\xE1ginas das refer\xEAncias"><button id="credits-reference-prev" class="secondary">Anterior</button><span id="credits-reference-page"></span><button id="credits-reference-next" class="secondary">Pr\xF3xima</button></nav>`;
            const search = root.querySelector("#credits-reference-search"), category = root.querySelector("#credits-reference-category");
            category.value = state.category;
            search.oninput = () => {
              state.query = search.value;
              state.page = 0;
              clearTimeout(searchTimer);
              searchTimer = setTimeout(paintRows, 120);
            };
            category.onchange = () => {
              state.category = category.value;
              state.page = 0;
              paintRows();
            };
            root.querySelector("#credits-reference-prev").onclick = () => {
              state.page--;
              paintRows();
            };
            root.querySelector("#credits-reference-next").onclick = () => {
              state.page++;
              paintRows();
            };
            paintRows();
          }
          const panels = V.DuoPanels;
          if (panels?.enabled()) {
            const owner = panels.owner();
            if (owner >= 0) panels.bind(root, owner);
          }
        };
        for (const button of root.querySelectorAll("[data-credits-tab]")) button.onclick = () => {
          state.tab = button.dataset.creditsTab;
          paint();
        };
        V.$("#credits-close").onclick = () => V.UI.close();
        paint();
      }
    };
  })();
});
