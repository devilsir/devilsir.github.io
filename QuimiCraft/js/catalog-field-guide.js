"use strict";

globalThis.QuimiCraftCatalogFieldGuide=(()=>{
  const geneticsStudy={label:"Estudo sobre os padrões de pelagem dos gatos",url:"https://www.nature.com/articles/s41467-021-25348-2"};
  const landTraits={
    cat:"Os desenhos da pelagem começam a se estabelecer na pele embrionária. Em gatos domésticos, variantes do gene DKK4 alteram o padrão tigrado antes que os pelos cresçam.",
    jaguar:"O melanismo escurece a pelagem de algumas onças-pintadas. As rosetas continuam presentes e podem aparecer sob luz oblíqua.",
    tiger:"O desenho das listras se estabelece durante o desenvolvimento e permite distinguir indivíduos. A espessura do pelo também responde às condições do ambiente.",
    lion:"O desenvolvimento da juba depende de idade e hormônios. A aparência também varia com o ambiente, o que dificulta deduzir parentesco só pela cor da juba.",
    dog:"Cães da mesma espécie podem ter pelagens muito diferentes. Seleção artificial ao longo de gerações favoreceu combinações de cor, comprimento e textura do pelo.",
    wolf:"O tipo de cobertura do pelo tem componente hereditário. A muda sazonal altera a densidade da pelagem ao longo do ano e responde ao ciclo de luz e temperatura.",
    pig:"Seleção humana favoreceu diferentes pelagens e portes de porco. Alimentação e condições de criação também influenciam o tamanho atingido.",
    wild_boar:"As listras claras do leitão desaparecem durante o crescimento. Esse contraste entre jovem e adulto é uma mudança de desenvolvimento.",
    sheep:"Comprimento e curvatura da fibra de lã variam entre linhagens. Nutrição, saúde e época do ano também afetam a lã produzida.",
    cow:"Padrões de manchas e cor da pelagem têm componentes hereditários. Distinguir visualmente duas vacas exige olhar o desenho inteiro das manchas.",
    chicken:"Os pigmentos das penas dependem de variantes hereditárias. Idade e muda também influenciam quais penas estão visíveis em cada fase.",
    rabbit:"A cor da pelagem depende da produção e da distribuição de pigmentos durante o crescimento dos pelos. Coelhos e lebres também se distinguem pelo desenvolvimento dos recém-nascidos.",
    snow_hare:"A mudança de pelagem entre estações, nas lebres que fazem muda de cor, resulta do crescimento de uma nova pelagem. A cor visível pode variar com a duração do dia.",
    deer:"Galhadas crescem novamente em muitos cervídeos. A forma da galhada tem componente hereditário, e idade, nutrição e hormônios também afetam o seu desenvolvimento.",
    bear:"Pelos externos e subpelo crescem com propriedades diferentes. A espessura ao longo do ano combina características do animal e resposta ao ambiente.",
    polar_bear:"O pelo de um urso-polar parece branco por espalhar a luz. Os pelos são translúcidos e o conjunto da pelagem reflete a luz de volta em várias direções.",
    bird:"Bico e penas adquirem formas diferentes durante o desenvolvimento embrionário. A plumagem que aparece depois pode mudar com idade, muda e dieta.",
    iguana:"As escamas crescem a partir da pele e são substituídas na muda. A coloração também pode mudar conforme a idade e o estado fisiológico.",
    serpent:"O padrão das escamas se estabelece durante o desenvolvimento. À medida que cresce, a serpente troca a camada superficial da pele.",
    spider:"Cada muda permite que o exoesqueleto se ajuste ao crescimento. O número de patas é parte do plano corporal herdado, mesmo quando um indivíduo perde alguma.",
    scorpion:"A carapaça e os segmentos da cauda são partes do exoesqueleto. A muda permite que essa cobertura seja renovada conforme o animal cresce.",
    crab:"A carapaça endurece após a muda. A cor e a dureza observadas também dependem de há quanto tempo o animal realizou a troca.",
    armadillo:"As placas da carapaça de um tatu incluem elementos ósseos na pele. A mineralização se desenvolve depois do nascimento.",
    primate:"A cor e a textura dos pelos dependem do desenvolvimento dos folículos. Alimentação, luz e idade podem mudar a aparência observada.",
    mammal:"Pelos, dentes e outros tecidos se formam em etapas durante o desenvolvimento. Nutrição e idade ajudam a explicar por que indivíduos da mesma espécie diferem em porte e aparência."
  };
  const waterTraits={
    fish:"Nadadeiras e escamas crescem seguindo o plano corporal da espécie. Alimentação e temperatura da água também influenciam o ritmo de crescimento.",
    whale:"Embriões de cetáceos desenvolvem brotos de membros posteriores que regridem durante a gestação. As nadadeiras anteriores conservam ossos correspondentes aos do braço e da mão de outros mamíferos.",
    squid:"Lulas e polvos produzem cromatóforos durante o desenvolvimento. Depois, músculos controlados pelo sistema nervoso expandem ou retraem essas estruturas para mudar a aparência.",
    jelly:"Muitas águas-vivas alternam fases de pólipo e medusa. A mudança de forma vem de diferentes etapas de desenvolvimento ao longo de um mesmo ciclo de vida.",
    coral:"Muitos corais vivem associados a algas microscópicas. O branqueamento está ligado à perda dessas algas ou de seus pigmentos, que são distintos dos genes do próprio coral.",
    aquaticPlant:"As plantas aquáticas crescem de acordo com o próprio desenvolvimento e as condições de luz. Fragmentos que se propagam vegetativamente tendem a manter o genótipo da planta de origem.",
    crustacean:"O corpo segmentado e os apêndices se formam durante o desenvolvimento. Para crescer, o crustáceo precisa trocar seu exoesqueleto.",
    plankton:"O plâncton reúne muitos organismos, com histórias evolutivas distintas. O termo os agrupa pelo modo como vivem suspensos na água.",
    ray:"As nadadeiras peitorais alargadas das raias fazem parte do plano corporal do grupo. A dieta e a temperatura do habitat influenciam quanto cada indivíduo cresce.",
    mammal:"A constituição do corpo tem base hereditária. Espessura da gordura, ritmos de crescimento e condição corporal também variam com a idade e a disponibilidade de alimento.",
    bird:"As penas crescem a partir de folículos durante o desenvolvimento. A forma adulta das asas e o padrão de muda resultam desse processo ao longo da vida.",
    reptile:"Escamas e outras coberturas protetoras crescem a partir da pele. Idade e temperatura influenciam o desenvolvimento dos tecidos.",
    star:"A disposição dos braços aparece durante o desenvolvimento. Em muitas estrelas-do-mar, braços perdidos podem crescer novamente.",
    mussel:"O manto secreta o material da concha ao longo da vida. As camadas guardam efeitos das condições em que o mexilhão cresceu.",
    shark:"Os dentes se renovam em fileiras ao longo da vida. A forma da dentição varia entre espécies e se relaciona com o modo de capturar alimento."
  };
  const elemental={
    fire:["Uma brasa central mantém a forma enquanto várias placas de escória se movem ao redor dela.","A descarga ígnea viaja antes do impacto. Rochas e pilares ajudam a interromper sua trajetória."],
    water:["O núcleo se recompõe com água em movimento e sustenta os braços como colunas de corrente.","As rajadas frias desaceleram o alvo. Na Fissura das Marés, os aquedutos acompanham a forma dos seus jatos."],
    earth:["A hebra de energia entre as pedras permite remontar membros de rocha sem tecido vivo.","O impacto sísmico concentra a força junto ao solo. Fragmentos minerais aparecem entre seus despojos."],
    wind:["O núcleo se mantém suspenso por correntes que circulam em sentidos diferentes.","As rajadas afastam o alvo. As torres suspensas do Pináculo reproduzem no mundo o movimento que sustenta o espírito."],
    arcane:["O cristal central mantém outras facetas em órbita e muda de brilho antes de disparar.","Uma centelha arcana tem corpo quase todo orbital. Já a sentinela concentra o fluxo em braços e ombros prismáticos."],
    ice:["Lâminas cristalinas crescem ao redor da matriz congelada. O cristal se recompõe pela própria magia do núcleo.","Seus estilhaços retardam o movimento. Nas formas mais antigas, as lâminas crescem até formar uma coroa."],
    lightning:["Descargas ligam as partes do corpo ao núcleo e reaparecem antes de cada ataque.","As bobinas de bronze da Fissura de Raio oferecem uma versão construída dos arcos que cercam o espírito."],
    nature:["Raízes e folhas se juntam por ação do núcleo elemental. A germinação das plantas e a formação do espírito são processos diferentes.","Xamãs reconhecem seus sinais nos santuários e podem assumir a forma de um elemental durante a metamorfose."]
  };
  const factionBlocks={
    FROST_CITADEL:["Os arquitetos do Flagelo assentaram estes tijolos nos muros da Cidadela para manter a neve afastada dos corredores.","O relevo da argamassa distingue o tijolo dos cristais que revestem o Trono Gelado."],
    FROST_RUNE:["Necromantes gravaram monólitos de morte para sinalizar as câmaras interiores da Cidadela.","A luz ciano marca o caminho. Um monólito rende três Runas de Morte na fabricação."],
    FROST_SPIRE:["O gelo das agulhas foi talhado em blocos para os arcos e pináculos do Flagelo.","As estrias claras lembram as faixas de crescimento observáveis em estruturas de gelo."],
    DAWN_MARBLE:["O mármore da Alvorada reveste os salões mais antigos do Palácio da Luz.","O contraste entre o tom claro e as juntas de pedra destaca os mosaicos dourados do pátio."],
    DAWN_GOLD:["Armeiros do Exército Dourado reservam esta liga para molduras, troféus e equipamentos ligados à Luz.","A liga entra na receita da Égide da Primeira Luz. Em barras de metal reais, a composição da liga afeta cor, dureza e resistência à corrosão."],
    HOLY_LIGHT:["O Exército Dourado instalou seus faróis em pontos altos do palácio para guiar patrulhas ao anoitecer.","O bloco continua luminoso quando usado em outras construções e é um dos componentes da Égide."],
    FEL_BRICK:["A Legião dos templos moldou basalto em peças padronizadas para erguer muralhas e galerias.","Basalto real se forma quando lava esfria e solidifica. A energia de Fel das versões do jogo faz parte da sua mitologia."],
    FEL_GROUND:["A Crosta de Fel aparece nas vias da Legião e pode se espalhar perto da queda de meteoros infernais hostis.","As rachaduras verdes sinalizam um piso alterado por magia. Meteoros aliados conjurados pelo jogador preservam o terreno."],
    FEL_LANTERN:["Os templos da Legião usam blocos de rocha enegrecida, com brasas verdes nas fissuras, para marcar ritos e entradas.","Ao trabalhar uma peça na fabricação, você obtém três Fragmentos de Brasa Vil."],
    CORRUPTED_ORE:["Veios de minério mudaram de cor perto das câmaras dos Deuses Antigos. Os primeiros mineiros levaram exemplares à forja para separar o metal.","Esse material pode se tornar um Lingote Corrompido. A presença da corrupção é uma propriedade ficcional do minério."],
    CORRUPTED_GEM:["Cristais da região abissal absorveram as cores da corrupção ao crescer nos veios sob as galerias.","O brilho violeta aparece tanto no veio como nas peças que incorporam o cristal."],
    SCULK_CORRUPTION:["O Sculk se estabelece nas superfícies próximas a algumas criaturas abatidas em áreas corrompidas.","A expansão segue a corrupção do jogo. A aparência orgânica imita uma colônia, enquanto a mudança ocorre nos blocos em volta."],
    SCULK_VEIN:["Veias de Sculk acompanham o avanço da corrupção pelas paredes das fendas.","As marcas ficam sobre a superfície e ajudam a reconhecer onde a contaminação chegou."],
    SCULK_SENSOR:["Os exploradores registraram este nódulo onde o Sculk começa a marcar o terreno ao redor da câmara.","Sua luz violeta ajuda a distinguir o sensor do revestimento escuro das veias."],
    SCULK_CATALYST:["O Catalisador aparece entre os focos mais densos de Sculk e marca os pontos onde a corrupção se espalha.","O núcleo luminescente destaca a parte central mesmo quando o resto da colônia fica na sombra."],
    FROST_PILLAR:["Os pedreiros do Flagelo ergueram colunas de saronita nas novas alas da Cidadela de Gelo.","As estrias verticais deixam os corredores mais fáceis de distinguir dos muros de tijolo."],
    FROST_MOSAIC:["O mosaico do Trono Gelado marca os caminhos para depósitos e pátios da Cidadela.","O motivo se repete nas juntas. Dá para alternar o mosaico com tijolos escuros para destacar um caminho."],
    FROST_BRAZIER:["O Flagelo instalou estes braseiros nas ameias para marcar as passagens durante a nevasca.","Chamas cristalinas azuis emergem da cuba retangular de pedra."],
    DAWN_PILLAR:["Os artífices do Palácio da Luz fizeram a coluna de mármore solar para sustentar a aparência das galerias externas.","O acabamento dourado continua visível no encontro entre uma coluna e um piso claro."],
    DAWN_MOSAIC:["O brasão do Exército Dourado foi reduzido a um padrão de piso para os pátios do palácio.","A pedra mais escura nas bordas deixa o motivo central legível quando repetido numa passagem."],
    DAWN_LANTERN:["As lanternas da Primeira Luz sinalizam as entradas dos depósitos e o alto das galerias.","Uma gaiola curva de latão protege o corpo facetado de luz âmbar."],
    FEL_PILLAR:["Os mestres da Legião recortaram a obsidiana dos templos em pilares verticais.","As estrias e as bordas escuras evidenciam as juntas quando várias peças são empilhadas."],
    FEL_MOSAIC:["A Legião começou a marcar os corredores dos templos com mosaicos em torno das fornalhas.","O verde da Crosta de Fel aparece no desenho mesmo em salas onde não há uma fissura ativa."],
    FEL_BRAZIER:["Os guardas do Templo da Fenda acendem estes braseiros para marcar as alas periféricas.","Um tripé de ferro ergue a cuba aberta onde arde a chama verde."],
    DRUID_PILLAR:["O Círculo reaproveita o tronco de árvores caídas para as vigas dos santuários.","Os anéis da madeira vêm do crescimento da árvore de origem. Entalhar o tronco preserva parte dessa textura."],
    DRUID_MOSAIC:["Os druidas pavimentaram o caminho entre as casas e os pátios com desenhos de raízes.","A geometria do piso faz referência à forma das raízes vivas que sustentam o bosque."],
    DRUID_LANTERN:["Totemistas marcam os caminhos mais afastados com lanternas alimentadas por energia elemental.","Um casulo de folhas luminosas pende de uma armação de galhos."],
    ALCHEMIST_PILLAR:["A Academia adotou colunas de latão para distinguir as galerias anexas do corpo de alvenaria.","Latão é uma liga à base de cobre e zinco. No jogo, a peça resulta do acabamento do tijolo alquímico."],
    ALCHEMIST_MOSAIC:["Os alquimistas desenharam o mosaico para ligar as bancadas aos depósitos de reagentes.","O padrão turquesa funciona como sinalização de piso no pátio da Academia."],
    ALCHEMIST_LANTERN:["Os oficineiros passaram a lacrar as luminárias catalíticas para iluminar bancadas e depósitos.","Um tubo turquesa com aros de vidro fica entre dois condutores de cobre."],
    LEAGUE_PILLAR:["Os carpinteiros do posto da Liga padronizaram vigas para ampliar os depósitos e abrigar patrulhas.","As faixas transversais ajudam a reconhecer os encaixes quando as vigas são vistas de baixo."],
    LEAGUE_MOSAIC:["A Liga assentou seu brasão nos caminhos que chegam aos novos depósitos.","Alternar as peças com tijolos lisos deixa o desenho do brasão destacado na travessia."],
    LEAGUE_LANTERN:["Os aldeões instalaram lampiões nas entradas dos postos para orientar as patrulhas ao anoitecer.","Caixilhos de ferro e um chapéu de madeira protegem os painéis âmbar."]
  };
  const special={
    light_naaru:["Quando os primeiros guardas chegaram ao Palácio da Luz, A’dalion já flutuava entre os pilares. O Exército Dourado passou a usar o intervalo entre seus cânticos para organizar as vigílias.","Ao se aproximar de um Naaru amistoso ou invocado, seu canto ajuda a recompor a sanidade e a dissipar visões abissais.","Os Naaru são corpos de cristal animados pela Luz nesta mitologia. Os fragmentos em órbita compõem a mesma entidade."],
    light_naaru_warden:["X’erael assumiu a guarda da Aurora quando as sentinelas do palácio precisaram de proteção contra os sussurros vindos das cavernas.","Sua coroa de lâminas revela a diferença entre o guardião da Aurora e um Naaru Primevo. O canto ajuda exploradores próximos.","As lâminas orbitam um núcleo luminoso comum e fazem parte da anatomia fantástica do guardião."],
    light_aurin:["Aprendizes do Palácio da Luz seguiram os Aurinos ao longo das galerias e descobriram que eles se agrupavam perto dos focos luminosos.","A forma de coração central e os pequenos estilhaços dourados identificam os Aurinos no meio dos guardiões maiores.","São pequenos seres cristalinos da Luz e têm o brilho concentrado no núcleo."],
    alchemist_master:["O Conselho escolheu a Academia para guardar os cadernos de transmutação. Seu representante passou a comandar os constructos que defendem as bancadas.","O Mestre da Transmutação dispara cápsulas catalíticas que desaceleram o alvo. Em batalha de evento, sua derrota leva à retirada."],
    shield_light:["Na primeira vigília do Palácio da Luz, os armeiros gravaram uma manopla cerrada ao redor de um martelo. As asas de prata foram acrescentadas quando a peça passou a representar os guardiões do palácio.","As volutas douradas emolduram uma chapa de aço azul. O medalhão acende quando o portador ergue a Égide, que protege contra golpes físicos e amortece os sussurros abissais."]
  };

  const geneticsLabel="Genética e desenvolvimento";
  const fictionLabel="Biologia fantástica";
  const lower=text=>text[0]?.toLocaleLowerCase("pt-BR")+text.slice(1);
  function notesFor(entry,base){
    const data=entry.loreData||{},actor=data.actor;
    const key=entry.key;
    if(key.startsWith("summon:")){
      if(!actor)return {};
      const original=base?notesFor(base,null):{};
      const duration=Math.round(actor.duration/60);
      return {story:`O selo de ${entry.name} chama uma forma aliada de ${base?.name||entry.name}.${original.story?" "+original.story:""}`,
        curiosity:`${actor.desc} A conjuração custa ${actor.mana} de mana e o vínculo dura até ${duration} minutos de jogo.`,
        insight:original.insight?.title===geneticsLabel?original.insight:{title:"Vínculo de invocação",text:original.insight?.text||"O selo mantém o aliado junto ao conjurador até que o vínculo termine."},
        links:original.links};
    }
    if(key.endsWith(":ghost"))return {insight:{title:"Forma espectral",text:"A aparição mantém os traços visíveis da criatura em vida. Sua forma e sua resistência a armas comuns vêm da ligação com o ectoplasma."}};
    const specific=special[key];
    if(specific)return {revision:true,story:specific[0],curiosity:specific[1],
      insight:specific[2]?{title:fictionLabel,text:specific[2]}:null};
    const block=factionBlocks[key.slice(6)];
    if(key.startsWith("block:")&&block)return {story:block[0],curiosity:block[1]};
    if(data.factionBuilding){
      const {story,curiosity}=data.factionBuilding;
      return {story,curiosity};
    }
    if(data.block){
      const b=data.block;
      const organic=data.phase||b.organic;
      const story=b.recipe?`Na Vila dos Elementos, artesãos preparam ${lower(entry.name)} combinando ${b.recipe}.`:
        b.placement?`${entry.name} pode ser encontrado em ${b.placement}.`:
        b.faction?`Os construtores de ${b.faction} usam ${lower(entry.name)} nas estruturas da facção.`:
        b.blockType==="plant"?`${entry.name} cresce onde o terreno oferece as condições adequadas de luz e umidade.`:
        `${entry.name} compõe as camadas de terreno e os recursos coletáveis do mundo.`;
      const curiosity=b.corruption?b.corruption:b.description|| (b.light?`Quando colocado no terreno, ilumina os arredores. Sua luz tem alcance de ${b.light} blocos.`:
        b.hardness?`O valor de dureza ${b.hardness} determina quanto tempo a extração leva no jogo.`:
        b.fluid?"Fluidos ocupam espaços livres e mudam de forma conforme o terreno e os blocos vizinhos.":
        "Sua forma depende da posição no terreno e do tipo de superfície em que foi colocado.");
      return {story,curiosity,insight:organic?{title:geneticsLabel,
        text:data.phase?"Sementes carregam informação herdada. Luz, água e nutrientes influenciam o crescimento de cada planta ao longo do ciclo.":
          "A estrutura observada depende da espécie e de como ela se desenvolveu. Luz, água e temperatura também podem modificar o aspecto final."}:null};
    }
    if(!actor)return {};
    if(actor?.kind==="animal"||actor?.kind==="aquatic"){
      const habitat=actor.regions?.length?actor.regions.join(", "):actor.habitat;
      const story=habitat?`Os exploradores de campo observaram ${lower(entry.name)} em ${habitat}.`:
        `O caderno de campo registra ${lower(entry.name)} pelos seus traços e pela forma de se mover.`;
      const biology=entry.biology;
      const curiosity=actor.kind==="aquatic"&&actor.anchored?"Vive junto ao substrato e ocupa uma faixa ambiental própria no fundo.":
        actor.food?`No QuimiCraft, ${lower(entry.name)} reage à oferta de ${actor.food.toLocaleLowerCase("pt-BR")} durante a reprodução ou o crescimento.`:
        [biology?.social,biology?.defense].filter(Boolean).join(" · ");
      const text=actor.kind==="aquatic"?waterTraits[actor.family]||waterTraits.fish:
        landTraits[key]||landTraits[actor.family]||landTraits.mammal;
      return {story,curiosity,insight:{title:geneticsLabel,text},links:key==="cat"?[geneticsStudy]:[]};
    }
    if(actor?.element){
      const [text,curiosity]=elemental[actor.element]||elemental.arcane;
      return {story:`${entry.name} se manifesta onde a energia elemental se concentra${actor.habitat?", em "+actor.habitat:""}.`,
        curiosity,insight:{title:"Formação elemental",text}};
    }
    if(actor){
      const text=actor.biologicalNote|| (actor.construct?"O corpo é montado em torno de um núcleo. As diferenças entre modelos vêm dos materiais e das técnicas usadas na construção.":
        actor.shapeshift?"A transformação druídica é um pacto com os elementos ou com animais neste mundo. O mesmo druida pode voltar à forma original quando a magia se desfaz.":
        actor.faction?"Insígnias, armas e postos identificam a facção. Esses traços dependem do treinamento e da história do grupo.":
        "A forma desta criatura vem da mitologia do QuimiCraft. O registro descreve seus traços visíveis e seus poderes dentro do jogo.");
      const curiosity=[actor.ability?("Sua técnica característica é "+actor.ability+"."):null,
        actor.home?("Pode ser encontrado em "+actor.home+"."):null,
        actor.leader&&actor.home?("A derrota permanente só acontece em "+actor.home+", fora de eventos."):null,
        actor.drop?("Pode deixar "+actor.drop+"."):null].filter(Boolean).join(" ");
      return {story:actor.history||`${entry.name} habita ${actor.habitat||"as regiões de sua linhagem no QuimiCraft"}.`,
        curiosity,insight:{title:actor.construct?"Construção e núcleo":fictionLabel,text}};
    }
    return {};
  }
  return {describe:notesFor};
})();
