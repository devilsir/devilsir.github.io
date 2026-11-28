/* Registered module: furnishings-world */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("furnishings-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, C = V.Cozy, D = V.SceneDesign, T = 48, copy = (x) => JSON.parse(JSON.stringify(x)), previous = { load: V.Assets.load.bind(V.Assets), prop: C.prop.bind(C) };
    for (const a of V.furnishingsAssets) if (Array.isArray(a.solidFootprint) && typeof a.solidFootprint[0] === "number") {
      const [x, y, width, height] = a.solidFootprint;
      a.solidFootprint = [{ x, y, width, height }];
    }
    const plans = {
      hub: { replace: [[12, 1], [10, 2], [8, 7], [9, 7]], add: [[3, 8.8, 5.5, 1.15], [4, 23.5, 17.5, 1.45]], text: "O bebedouro fica junto \xE0 passagem da biblioteca. Use a torneira baixa; deixe livre a aproxima\xE7\xE3o. A \xE1gua e os bancos fazem parte de um espa\xE7o compartilhado." },
      library: { replace: [[0, 8], [8, 13], [9, 13], [13, 10]], add: [[11, 2.2, 14.2, 1.25], [14, 16, 6.5, 1.05]], text: "A prensa pertence ao canto de encaderna\xE7\xE3o. A equipe protege as p\xE1ginas, identifica o registro e s\xF3 depois prepara o reparo. Os livros ficam nas mesas de consulta, ao alcance de quem l\xEA." },
      park: { replace: [[6, 16], [16, 18], ["neighbors-park-24", 22], ["heritage-furniture-park-38", 17]], add: [[20, 14.5, 18.8, 1.35], [23, 3, 6.5, 1.15]], text: "O mapa das trilhas ajuda a escolher entre o lago, a \xE1rea de piquenique e a sombra. Observe aves a dist\xE2ncia e registre onde estavam; ouvir um canto n\xE3o basta para identificar uma esp\xE9cie." },
      market: { replace: [[4, 24], [5, 30], [9, 26], [10, 29]], add: [[25, 10, 11.5, 1.2], [31, 18.7, 3.9, 1.2]], text: "O carrinho t\xE9rmico pertence \xE0 \xE1rea de preparo de alimentos. Cada banca guarda seus utens\xEDlios e mant\xE9m uma faixa de circula\xE7\xE3o. Pergunte \xE0 pessoa da banca sobre os produtos, ingredientes e modos de preparo." },
      garden: { replace: [[4, 33], [5, 34], [6, 38], [7, 35]], add: [[37, 22.5, 8, 1.1], [32, 14, 16.5, 1.25]], text: "A mangueira fica perto do acesso \xE0 \xE1gua. Verifique o solo antes de regar, cuide de um canteiro por vez e guarde o equipamento sem atravessar o caminho. O cuidado dos canteiros aparece no cen\xE1rio e fica salvo." },
      beach: { replace: [["coast-prop-9-8-4", 40], ["coast-prop-6-8-9", 43], ["coast-prop-7-18-15", 47], ["coast-prop-14-4.5-14", 44]], add: [[46, 6.4, 9.8, 1.15], [41, 20.7, 10, 1.15]], text: "Os ganchos ficam pr\xF3ximos ao chuveiro e \xE0 cabine, para cangas e toalhas. Os animais permanecem livres: observe conchas e vest\xEDgios sem recolher animais vivos nem interferir na fauna." },
      "chapter-1": { replace: [[2, 50], [5, 54], [6, 48], [3, 52]], add: [[51, 21, 8.5, 1.3], [49, 3, 17.2, 1.4]], text: "O painel separa ensaio, apresenta\xE7\xE3o e pausa. Os instrumentos ficam ao lado de seus m\xFAsicos, e o p\xFAblico tem passagem livre. Os sons desta atividade s\xE3o exerc\xEDcios originais de VOICES." },
      "room-1": { replace: [[4, 56], [8, 58], [10, 59], [11, 60]], add: [[63, 20.5, 9.2, 1.15], [62, 12, 2.2, 1.3]], text: "Os cabos ficam enrolados no carrinho depois do ensaio. Um caminho livre facilita o acesso \xE0 mesa de grava\xE7\xE3o. Gravar uma frase inclui escutar, combinar o arranjo e registrar quem participou." },
      "chapter-2": { replace: [[12, 69], [11, 67], [7, 70], ["atelier-chapter-2-23", 71]], add: [[68, 19.3, 16.8, 1.4], [65, 8, 8, 1.2]], text: "O mapa hist\xF3rico acompanha as legendas da exposi\xE7\xE3o. Mali, Songhai e Kongo t\xEAm contextos pr\xF3prios; n\xE3o s\xE3o nomes intercambi\xE1veis. Confira a origem do registro antes de ligar uma pe\xE7a a uma hist\xF3ria." },
      "room-2": { replace: [[0, 72], [3, 78], [5, 74], [1, 75]], add: [[73, 16.2, 11.7, 1.1], [79, 9.4, 2.3, 1.2]], text: "O apoio inclinado evita deixar um documento solto na mesa. A ficha de pesquisa distingue descri\xE7\xE3o, contexto e hip\xF3tese. Registrar uma d\xFAvida tamb\xE9m faz parte da curadoria." },
      "chapter-3": { replace: [[0, 81], [2, 86], [3, 83], [5, 87]], add: [[82, 3, 16.4, 1.15], [80, 18.5, 8.2, 1.2]], text: "Observe a chuva no mesmo recipiente e compare registros feitos do mesmo modo. Uma medida isolada n\xE3o explica toda a mudan\xE7a. A ci\xEAncia do bairro permite perguntar, observar e trabalhar em equipe." },
      "room-3": { replace: [[0, 90], [1, 92], [2, 88], [3, 89]], add: [[91, 13.5, 6.6, 1.15], [94, 3.2, 14.2, 1.1]], text: "A lumin\xE1ria ilumina o caderno de resultados. Anote o que foi mantido igual e o que mudou. Consulte as leituras sobre S\xF4nia Guimar\xE3es e sobre o trabalho em equipe de Jaqueline G\xF3es de Jesus." },
      "chapter-4": { replace: [[1, 102], [2, 96], [3, 100], [5, 99]], add: [[97, 24.7, 16.7, 1.25], [101, 11.5, 13.5, 1.05]], text: "O jornal exposto traz autoria, data e contexto. Uma corre\xE7\xE3o explica qual informa\xE7\xE3o mudou e por qu\xEA. O bairro pode voltar \xE0s fontes antes de compartilhar uma manchete." },
      "room-4": { replace: [[0, 104], [1, 105], [4, 106], [6, 110]], add: [[108, 16, 2.3, 1.3], [109, 3, 13.5, 1.1]], text: "As folhas de revis\xE3o ficam perto da mesa editorial. Compare texto, imagem e legenda: uma fotografia n\xE3o explica sozinha quem aparece ou quando o registro foi feito." },
      "chapter-5": { replace: [[1, 119], [4, 116], ["heritage-furniture-chapter-5-27", 113], [8, 115]], add: [[117, 28.5, 10.5, 1.15], [118, 18.4, 16.8, 1.3]], text: "O totem aponta as rotas da escola, do centro comunit\xE1rio e da pra\xE7a. A manifesta\xE7\xE3o deixa essas passagens livres. Participar tamb\xE9m pode significar ouvir, cuidar de algu\xE9m ou consultar um registro." },
      "room-5": { replace: [[4, 120], [6, 122], [7, 124], [10, 125]], add: [[123, 12.8, 4, 1.05], [126, 3, 5, 1.15]], text: "Os cart\xF5es organizam a vez de falar. Uma pessoa pode contribuir por escrito na mesa com biombo. A assembleia re\xFAne propostas, d\xFAvidas e revis\xF5es; o acordo aparece no registro da comunidade." },
      "chapter-6": { replace: [[1, 128], [2, 135], [4, 129], [5, 134]], add: [[132, 7.5, 17.3, 1.2], [130, 25.5, 15.9, 1.05]], text: "O painel conecta os registros restaurados e mant\xE9m suas atribui\xE7\xF5es. O cat\xE1logo mostra o que foi descoberto sem substituir a revis\xE3o humana. Cada contribui\xE7\xE3o precisa de contexto e autoriza\xE7\xE3o." },
      "room-6": { replace: [[0, 138], [1, 136], [6, 143], [7, 139]], add: [[142, 14, 13.3, 1.1], [140, 10, 8.5, 1.3]], text: "A maleta guarda c\xF3pias de seguran\xE7a identificadas. Ao lado, a equipe acompanha a restaura\xE7\xE3o e revisa as fontes. Uma c\xF3pia ajuda a proteger o arquivo; ela n\xE3o corrige por si s\xF3 uma informa\xE7\xE3o." }
    };
    const records = [];
    for (const [map, plan] of Object.entries(plans)) {
      const d = C.layouts[map];
      for (const [key, index2] of plan.replace) {
        const id2 = typeof key === "number" ? "prop-" + map + "-" + key : key, row2 = d.decor.find((r) => r[6]?.id === id2);
        if (!row2) throw Error("M\xF3vel de origem n\xE3o encontrado: " + id2);
        const a2 = V.furnishingsAssets[index2];
        row2[0] = "furnishings";
        row2[1] = index2;
        row2[5] = a2.solid;
        row2[6] = { ...row2[6], layer: a2.layer, materials: {} };
        for (const scene of d.scenes.filter((s) => s.hostDecor === id2)) {
          scene.family = "furnishings";
          scene.prop = index2;
        }
        records.push({ map, index: index2, id: id2, kind: "replacement" });
      }
      for (const [index2, x2, y2, size2] of plan.add) {
        const a2 = V.furnishingsAssets[index2], id2 = "furnishings-" + map + "-" + index2, row2 = ["furnishings", index2, x2, y2, size2, a2.solid, { id: id2, layer: a2.layer, materials: index2 % 3 === 0 ? { wood: "walnut" } : index2 % 3 === 1 ? { metal: "teal" } : { wood: "honey" } }];
        d.decor.push(row2);
        records.push({ map, index: index2, id: id2, kind: "addition" });
      }
      const [index, x, y, size] = plan.add[0], id = "furnishings-discovery-" + map, row = d.decor.find((r) => r[6]?.id === "furnishings-" + map + "-" + index), a = V.furnishingsAssets[index];
      d.scenes.push({ id, kind: a.interaction === "music" ? "instrument" : "notice", family: "furnishings", prop: index, x: x + size / 2 - 0.5, y: y + size * 0.79 - 0.5, size, title: a.name, text: plan.text, hostDecor: row[6].id, materials: row[6].materials });
      row[6].sceneIds = [id];
    }
    const corrections = C.layouts["chapter-4"].scenes.find((s) => s.id === "news-corrections"), correctionHost = C.layouts["chapter-4"].decor.find((r) => r[6]?.id === "prop-chapter-4-3");
    Object.assign(corrections, { hostDecor: correctionHost[6].id, family: "furnishings", prop: 100, x: 9.25, y: 10.685, size: 1.5 });
    correctionHost[6].sceneIds = [...correctionHost[6].sceneIds || [], corrections.id];
    V.Furnishings = { plans, placements: records };
    D.defaults = copy(C.layouts);
    C.prop = function(ctx, family, index, x, y, size = T, materials = null) {
      if (family !== "furnishings") return previous.prop(ctx, family, index, x, y, size, materials);
      const colored = V.EditorMaterials.tinted(family, index, materials), img = V.Assets.images["furnishings-props"];
      if (colored) ctx.drawImage(colored, Math.round(x), Math.round(y), size, size);
      else if (img) ctx.drawImage(img, index % 8 * 32, Math.floor(index / 8) * 32, 32, 32, Math.round(x), Math.round(y), size, size);
    };
    V.Hooks.around(V.Assets, "load", "furnishings-world:load:1", () => async function() {
      await Promise.all([previous.load(), this.loadEntries([["furnishings-props", "assets/tilesets/furnishings-props.png"]]), new Promise((resolve) => {
        const img = V.Assets.image();
        img.onload = () => {
          V.EditorMaterials.images.furnishings = img;
          resolve();
        };
        img.onerror = () => {
          this.errors.push("Cores dos m\xF3veis do bairro");
          resolve();
        };
        img.src = V.furnishingsMaterialSources.furnishings;
      })]);
      return this.errors;
    });
  })();
});
