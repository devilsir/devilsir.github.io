/* Registered module: field-guide */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("field-guide", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function fieldGuide() {
    "use strict";
    const V = window.V, esc = V.escape;
    const sources = [
      { id: "field-dog-smell", name: "American Kennel Club \xB7 Como os c\xE3es exploram cheiros", url: "https://www.akc.org/expert-advice/training/why-does-my-dog-sniff-everything/", note: "Olfato e explora\xE7\xE3o do ambiente por c\xE3es." },
      { id: "field-cat-whiskers", name: "VCA Animal Hospitals \xB7 Bigodes dos gatos", url: "https://vcahospitals.com/know-your-pet/why-do-cats-have-whiskers", note: "Fun\xE7\xE3o sensorial das vibrissas." },
      { id: "field-pigeon", name: "Cornell Lab of Ornithology \xB7 Pombo-dom\xE9stico", url: "https://www.allaboutbirds.org/guide/Rock_Pigeon/lifehistory", note: "Alimenta\xE7\xE3o no solo, sementes, frutos e uso de constru\xE7\xF5es." },
      { id: "field-birds", name: "Natural History Museum \xB7 A evolu\xE7\xE3o do voo das aves", url: "https://www.nhm.ac.uk/discover/how-did-birds-and-other-dinosaurs-learn-to-fly.html", note: "Penas, asas e aves que n\xE3o voam." },
      { id: "field-duck", name: "Cornell Lab of Ornithology \xB7 Pato-real", url: "https://www.allaboutbirds.org/guide/Mallard/lifehistory", note: "Lagos, alimenta\xE7\xE3o na superf\xEDcie e vegeta\xE7\xE3o aqu\xE1tica." },
      { id: "field-butterfly", name: "American Museum of Natural History \xB7 Borboletas", url: "https://www.amnh.org/exhibitions/butterflies/butterfly-behavior", note: "N\xE9ctar, prob\xF3scide e transporte de p\xF3len." },
      { id: "field-crab", name: "Smithsonian Ocean \xB7 Br\xE2nquias dos caranguejos", url: "https://ocean.si.edu/ocean-life/invertebrates/green-crabs-super-power-eating-through-its-gills", note: "Exoesqueleto e trocas de oxig\xEAnio pelas br\xE2nquias." },
      { id: "field-gull", name: "Cornell Lab of Ornithology \xB7 Gaivota-prateada americana", url: "https://www.allaboutbirds.org/guide/Herring_Gull/lifehistory", note: "Exemplo de gaivota: litoral, alimenta\xE7\xE3o variada e repouso em \xE1reas abertas." },
      { id: "field-turtle", name: "Smithsonian Ocean \xB7 Tartarugas marinhas", url: "https://ocean.si.edu/ocean-life/reptiles/sea-turtles", note: "R\xE9pteis marinhos que respiram ar e precisam alcan\xE7ar a superf\xEDcie." }
    ];
    const entries = [
      { id: "dog", name: "C\xE3o da pra\xE7a", species: 0, topic: "O faro tamb\xE9m \xE9 uma forma de explorar", fact: "Os c\xE3es recolhem muitas informa\xE7\xF5es pelo olfato. Farejar o ch\xE3o e objetos faz parte da explora\xE7\xE3o do ambiente: um caminho re\xFAne cheiros deixados por pessoas, outros animais e materiais.", look: "Compare os trechos em que o c\xE3o caminha com as pausas. Em uma observa\xE7\xE3o real, anote onde ele aproxima o focinho do ch\xE3o e por quanto tempo.", en: "The dog is sniffing the ground.", pt: "O cachorro est\xE1 farejando o ch\xE3o.", word: "sniff \xB7 farejar", sourceIds: ["field-dog-smell"] },
      { id: "cat", name: "Gato da biblioteca", species: 1, topic: "Os bigodes s\xE3o estruturas sensoriais", fact: "Os bigodes dos gatos, chamados vibrissas, ajudam a perceber objetos e movimentos pr\xF3ximos. O contato com esses pelos transmite informa\xE7\xF5es a estruturas sensoriais junto de suas ra\xEDzes.", look: "Repare nas orelhas, na cauda e na posi\xE7\xE3o do corpo. Registre a postura que consegue ver antes de tentar explicar o motivo da pausa.", en: "The cat is resting near the books.", pt: "O gato est\xE1 descansando perto dos livros.", word: "whiskers \xB7 bigodes", sourceIds: ["field-cat-whiskers"] },
      { id: "pigeon", name: "Pombo", species: 2, topic: "Uma ave adaptada \xE0 cidade", fact: "O pombo-dom\xE9stico, Columba livia, procura alimento no ch\xE3o. Sementes e frutos fazem parte de sua alimenta\xE7\xE3o. Beirais e outras estruturas de pr\xE9dios podem oferecer locais de abrigo e nidifica\xE7\xE3o.", look: "Observe os passos e as paradas perto dos bancos. Compare com o passarinho do parque: ele permanece no ch\xE3o ou muda entre o ch\xE3o e os galhos?", en: "The pigeon is walking on the ground.", pt: "O pombo est\xE1 caminhando no ch\xE3o.", word: "ground \xB7 ch\xE3o; seed \xB7 semente", sourceIds: ["field-pigeon"] },
      { id: "bird", name: "Passarinho", species: 3, topic: "Penas, asas e voo", fact: "As penas s\xE3o caracter\xEDsticas das aves. Nas aves que voam, as penas das asas participam da sustenta\xE7\xE3o e da propuls\xE3o. Ter penas n\xE3o significa necessariamente voar: pinguins e avestruzes tamb\xE9m s\xE3o aves.", look: "Compare o formato das asas com o da borboleta da horta. As duas voam, mas a borboleta \xE9 um inseto e n\xE3o possui penas.", en: "The bird is flying near the trees.", pt: "O passarinho est\xE1 voando perto das \xE1rvores.", word: "wing \xB7 asa; feather \xB7 pena", sourceIds: ["field-birds"] },
      { id: "duck", name: "Pato", species: 4, topic: "A vida entre a margem e a \xE1gua", fact: "O pato-real \xE9 um exemplo de pato encontrado em lagos e \xE1reas alagadas. Ele pode buscar sementes, plantas e pequenos animais na \xE1gua ou na margem; muitas vezes inclina o corpo para alcan\xE7ar alimento abaixo da superf\xEDcie.", look: "No lago, compare a posi\xE7\xE3o do pato com a das aves que ficam em terra. Para investigar alimenta\xE7\xE3o, seria preciso registrar tamb\xE9m o que ele apanha com o bico.", en: "The duck is swimming in the pond.", pt: "O pato est\xE1 nadando no lago.", word: "pond \xB7 lago; swim \xB7 nadar", sourceIds: ["field-duck"] },
      { id: "butterfly", name: "Borboleta", species: 5, topic: "Das flores ao n\xE9ctar e ao p\xF3len", fact: "Muitas borboletas adultas retiram n\xE9ctar das flores usando uma estrutura alongada chamada prob\xF3scide. Durante as visitas, gr\xE3os de p\xF3len podem aderir ao corpo e ser levados para outra flor, contribuindo para a poliniza\xE7\xE3o.", look: "Compare a rota da borboleta com os canteiros. A horta de Aisha ajuda a ligar esta observa\xE7\xE3o ao cuidado com plantas e flores.", en: "The butterfly is flying over the flowers.", pt: "A borboleta est\xE1 voando sobre as flores.", word: "flower \xB7 flor; nectar \xB7 n\xE9ctar", sourceIds: ["field-butterfly"] },
      { id: "crab", name: "Caranguejo da praia", species: null, topic: "Uma carapa\xE7a por fora do corpo", fact: "Caranguejos s\xE3o crust\xE1ceos com patas articuladas e um esqueleto externo. As br\xE2nquias realizam trocas de gases; em esp\xE9cies aqu\xE1ticas, captam oxig\xEAnio dissolvido na \xE1gua.", look: "Compare as patas e a carapa\xE7a com o corpo do peixe. Os dois podem viver junto da \xE1gua, mas possuem estruturas corporais diferentes.", en: "The crab is moving along the shore.", pt: "O caranguejo est\xE1 se movendo pela margem.", word: "shell \xB7 carapa\xE7a; shore \xB7 margem", sourceIds: ["field-crab"] },
      { id: "gull", name: "Gaivota", species: 3, topic: "Entre a praia e a \xE1gua", fact: "Gaivotas usam praias e outras \xE1reas abertas para procurar alimento e repousar. A gaivota-prateada americana, por exemplo, come peixes, invertebrados e outros alimentos; a dieta varia entre esp\xE9cies e lugares.", look: "Compare o bico e as asas desta ave com os do pombo da pra\xE7a. Registre a diferen\xE7a entre permanecer na areia e levantar voo.", en: "The gull is resting on the beach.", pt: "A gaivota est\xE1 descansando na praia.", word: "gull \xB7 gaivota; beach \xB7 praia", sourceIds: ["field-gull"] },
      { id: "turtle", name: "Tartaruga marinha", species: null, topic: "Nadar n\xE3o \xE9 o mesmo que respirar na \xE1gua", fact: "Tartarugas marinhas s\xE3o r\xE9pteis e respiram ar com pulm\xF5es. Mesmo passando muito tempo submersas, precisam alcan\xE7ar a superf\xEDcie para respirar. Isso as diferencia dos peixes que captam oxig\xEAnio da \xE1gua pelas br\xE2nquias.", look: "Compare as nadadeiras e o contorno da carapa\xE7a com o peixe pr\xF3ximo. A semelhan\xE7a no deslocamento n\xE3o significa que os dois respiram do mesmo modo.", en: "The sea turtle swims near the surface.", pt: "A tartaruga marinha nada perto da superf\xEDcie.", word: "surface \xB7 superf\xEDcie; breathe \xB7 respirar", sourceIds: ["field-turtle", "field-crab"] },
      { id: "fish", name: "Peixe de cardume", species: null, topic: "O oxig\xEAnio que est\xE1 dissolvido na \xE1gua", fact: "Os peixes captam oxig\xEAnio da \xE1gua por meio das br\xE2nquias. As nadadeiras ajudam no deslocamento e na orienta\xE7\xE3o do corpo. Compare essa respira\xE7\xE3o com a da tartaruga marinha, que precisa de ar.", look: "Observe o movimento da cauda e a dire\xE7\xE3o do corpo. Registre se um peixe se desloca sozinho ou perto de outros antes de descrever um grupo como cardume.", en: "The fish is swimming in the sea.", pt: "O peixe est\xE1 nadando no mar.", word: "fish \xB7 peixe; gills \xB7 br\xE2nquias", sourceIds: ["field-crab", "field-turtle"] }
    ];
    V.fieldGuideContent = { sources, entries };
    V.FieldGuide = {
      resolve(o) {
        const id = o.coastAnimal === void 0 ? ["dog", "cat", "pigeon", "bird", "duck", "butterfly"][o.species] : ["dog", "dog", "cat", "cat", "crab", "gull", "turtle", "fish"][o.coastAnimal];
        return entries.find((e) => e.id === id);
      },
      facing(o) {
        return o.animalFacing === 1 || o.animalFacing === 2 ? o.animalFacing : o.dir === 1 ? 1 : 2;
      },
      flip(o, sourceFacing = 2) {
        return this.facing(o) !== sourceFacing;
      },
      record(o) {
        const e = this.resolve(o);
        if (!e) return;
        V.Living.ensure();
        if (!Array.isArray(V.state.fieldGuideSeen)) V.state.fieldGuideSeen = [];
        if (!V.state.fieldGuideSeen.includes(e.id)) V.state.fieldGuideSeen.push(e.id);
        if (e.species !== null) {
          if (!V.state.observations.includes(e.species)) V.state.observations.push(e.species);
          V.Living.event("animal", e.species);
        }
        if (V.state.observations.length >= 4) V.Quests.achieve("naturalist");
        V.Save.save();
        V.Audio.sfx("observe");
      },
      panel(o, back = null) {
        const e = this.resolve(o);
        if (!e) return false;
        const coast = o.coastAnimal !== void 0, title = coast ? (o.label || e.name).replace(/^Observar:?\s*/, "") : e.name;
        const observed = o.walking ? e.id === "butterfly" ? "A borboleta est\xE1 em voo." : e.id === "bird" || e.id === "gull" ? "A ave est\xE1 se deslocando." : e.id === "duck" || e.id === "fish" || e.id === "turtle" ? "O animal est\xE1 nadando." : e.id === "crab" ? "O caranguejo est\xE1 se deslocando." : "O animal est\xE1 caminhando." : o.action === "sleeping" ? "O animal est\xE1 em uma pausa de descanso." : "O animal est\xE1 parado neste momento.";
        const example = e.id === "cat" && coast && V.World.current?.id !== "library" ? { en: "The cat is resting beside the path.", pt: "O gato est\xE1 descansando ao lado do caminho." } : e;
        V.UI.modal(title, "CADERNO DE CAMPO \xB7 " + V.Living.location(V.World.current?.id || ""), `<article class="field-guide"><div class="field-guide-heading"><canvas id="animal-portrait" width="128" height="96" aria-label="${esc(title)}"></canvas><div><h3>${esc(e.topic)}</h3><p>${esc(observed)}</p></div></div><p>${esc(e.fact)}</p><section class="field-guide-task"><h4>Para comparar</h4><p>${esc(e.look)}</p></section><aside class="field-guide-english"><strong>${esc(e.word)}</strong><p>Exemplo em ingl\xEAs</p><p lang="en">${esc(example.en)}</p><p>${esc(example.pt)}</p></aside><details class="field-guide-sources"><summary>Refer\xEAncias desta observa\xE7\xE3o</summary>${V.Cozy.sourceLinks(e.sourceIds)}</details></article>`, `<button id="animal-close" class="primary">Guardar no caderno \u2713</button>${back ? '<button id="animal-back" class="secondary">Voltar ao caderno</button>' : ""}`, true);
        V.$(".modal")?.classList.add("field-guide-modal");
        V.Living.drawTownAnimal(V.$("#animal-portrait").getContext("2d"), o, 64, 83, 96);
        V.$("#animal-close").onclick = () => {
          this.record(o);
          back ? back() : V.UI.close();
        };
        if (back) V.$("#animal-back").onclick = back;
        return true;
      },
      journal() {
        return `<h3>Animais e ambiente</h3><p>Compare as aves da pra\xE7a com as da praia, a respira\xE7\xE3o do peixe com a da tartaruga e as visitas da borboleta \xE0s flores da horta.</p>${entries.filter((e, i) => i < 6 || V.state.fieldGuideSeen?.includes(e.id)).map((e) => {
          const seen = V.state.fieldGuideSeen?.includes(e.id) || entries.indexOf(e) < 6 && V.state.observations.includes(e.species);
          return `<div class="field-entry ${seen ? "seen" : ""}"><span>${seen ? "\u2713" : "\u25CB"} ${esc(e.name)}</span><small>${seen ? esc(e.topic) : "Encontre este animal para abrir sua ficha."}</small>${seen ? `<button class="quiet" data-field-entry="${e.id}">Reabrir ficha</button>` : ""}</div>`;
        }).join("")}`;
      },
      bindJournal() {
        V.$$("[data-field-entry]").forEach((b) => b.onclick = () => {
          const e = entries.find((e2) => e2.id === b.dataset.fieldEntry), row = { crab: 4, gull: 5, turtle: 6, fish: 7 }[e.id], o = row === void 0 ? { species: e.species, action: "resting" } : { coastAnimal: row, label: e.name, action: "resting" };
          this.panel(o, () => V.Living.journal("field"));
        });
      }
    };
    for (const source of sources) if (!V.content.sources.some((s) => s.id === source.id)) V.content.sources.push(source);
  })();
});
