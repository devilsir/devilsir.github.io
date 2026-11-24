const item = (name, color, structure, role, metabolism, application, steps = []) =>
  ({ name, color, structure, role, metabolism, application, steps });

const step = (title, badge, text, anchor, cam, anim) =>
  ({ title, badge, text, anchor, cam, anim });

export const organelles = {
  membrane: item(
    'Membrana plasmática', '#4bc7d8',
    'Bicamada fluida anfipática (~7–10 nm) formada por fosfolipídios (cabeça polar de fosfato/glicerol + caudas apolares com dobras de insaturação), colesterol, proteínas canais/carreadoras/bombas e glicocálix.',
    'Atua como o “porteiro da célula”: delimita, protege física e quimicamente, reconhece moléculas e controla trocas por permeabilidade seletiva.',
    'Transporte passivo (difusão simples, osmose e difusão facilitada sem gasto de ATP) e transporte ativo (bomba de Na⁺/K⁺, endocitose e exocitose com gasto de ATP).',
    'A bomba Na⁺/K⁺ mantém o Na⁺ mais concentrado fora e o K⁺ mais concentrado dentro da célula, base da homeostase osmótica e dos impulsos nervosos.',
    [
      step(
        'Mosaico fluido e glicocálix (“porteiro da célula”)',
        'VISÃO DE SUPERFÍCIE',
        'A membrana delimita e protege a célula sem ser rígida: lipídios e proteínas movem-se lateralmente como um mosaico fluido. Na face externa, antenas de glicoproteínas formam o glicocálix para reconhecimento molecular.',
        'membrane_overview', [-2.2, 2.1, 9.4], 'membrane_fluid'
      ),
      step(
        'Bicamada fosfolipídica anfipática',
        'POLAR × APOLAR · ~8 nm',
        'Cada fosfolipídio é anfipático: a cabeça hidrofílica (polar, com grupo fosfato e glicerol) volta-se à água intra e extracelular; as caudas hidrofóbicas de hidrocarbonetos apontam ao centro. Repare nas dobras de insaturação nas caudas e no colesterol (dourado) que mantêm a fluidez.',
        'membrane_bilayer', [-0.62, 0.42, 1.48], 'membrane_bilayer'
      ),
      step(
        'Transporte passivo: difusão simples e osmose',
        'SEM GASTO DE ATP',
        'Na difusão simples, pequenas moléculas apolares (douradas) cruzam direto entre os lipídios do meio mais concentrado para o menos concentrado. Na osmose, a água (azul brilhante) move-se do meio menos concentrado em soluto para o mais concentrado para equilibrar concentrações.',
        'membrane_passive', [-0.68, 0.42, 1.38], 'membrane_passive'
      ),
      step(
        'Difusão facilitada: canal seletivo e carreadora',
        'RECUSA DE MOLÉCULAS INCOMPATÍVEIS',
        'Sem gastar ATP, proteínas transmembrana filtram o que passa: observe o canal proteico aceitando íons ciano compatíveis e recusando ativamente macromoléculas vermelhas e âmbar incompatíveis na entrada do poro (pulso de rejeição). Ao lado, a proteína carreadora muda fisicamente de forma para levar a molécula de glicose.',
        'membrane_channel', [-0.42, 0.54, 1.62], 'membrane_transport'
      ),
      step(
        'Transporte ativo: bomba de Na⁺/K⁺',
        'COM GASTO DE ATP · CONTRA GRADIENTE',
        'Para manter Na⁺ mais concentrado fora e K⁺ mais concentrado dentro, a proteína bomba hidrolisa ATP (pulso luminoso verde) e trabalha contra o gradiente: expulsa 3 íons Na⁺ (dourados) para o meio extracelular e traz 2 íons K⁺ (violeta) para dentro da célula.',
        'membrane_pump', [-0.38, 0.44, 1.44], 'membrane_pump'
      ),
      step(
        'Endocitose: transporte em massa para dentro',
        'MOLDAGEM DA MEMBRANA · COM ATP',
        'A membrana plasmática é elástica e se molda ativamente com gasto de ATP para englobar cargas grandes em películas vesiculares, rompendo-se no colo e cicatrizando em seguida por três vias: pinocitose (esquerda), fagocitose (centro) e mediada por receptores (direita).',
        'membrane_endocytosis', [0.92, 0.98, 2.24], 'membrane_endocytosis'
      ),
      step(
        'Fagocitose: pseudópodes moldam e englobam a impureza',
        'PSEUDÓPODES · PELÍCULA · RUPTURA',
        'Ao tocar a impureza sólida, a membrana projeta braços gelatinosos (pseudópodes) impulsionados por actina que se moldam ao redor do alvo, fundem-se no topo, estrangulam e rompem o colo — cicatrizando a membrana externa e liberando o fagossomo envolvido por película para fusão com o lisossomo.',
        'membrane_phago', [0.76, 0.78, 1.98], 'membrane_phagocytosis'
      ),
      step(
        'Pinocitose: abertura do canal e formação do pinossomo',
        'INVAGINAÇÃO Ω · RUPTURA · PINOSSOMO',
        'Um orifício se abre na membrana e se aprofunda em um frasco em ômega (Ω) que suga gotículas líquidas e micro-impurezas dissolvidas; o colo então se estreita, se rompe com pulso de cisão e sela a superfície, liberando o pinossomo envolto em película gelatinosa.',
        'membrane_pino', [0.72, 0.72, 1.88], 'membrane_pinocytosis'
      ),
      step(
        'Endocitose mediada por receptores (clatrina e dinamina)',
        'SELETIVIDADE · CLATRINA · DINAMINA',
        'Receptores em cálice capturam apenas ligantes compatíveis (LDL), ignorando moléculas erradas. A membrana afunda levando os receptores inclinados para dentro enquanto a gaiola de clatrina se monta por baixo e o anel de dinamina estrangula e rompe o colo da vesícula.',
        'membrane_rec', [0.72, 0.72, 1.88], 'membrane_receptor'
      ),
      step(
        'Exocitose: ancoragem SNARE e secreção',
        'PORO DE FUSÃO · SECREÇÃO ATIVA',
        'No processo inverso à endocitose, a vesícula secretória (v-SNARE) ancora nas proteínas t-SNARE da membrana, abre um poro de fusão na bicamada e libera um jato de proteínas/hormônios para o meio extracelular.',
        'membrane_exocytosis', [1.1, 0.45, 2.08], 'membrane_exocytosis'
      )
    ]
  ),

  cytoplasm: item(
    'Citoplasma e citosol', '#52b8c9',
    'Região compreendida entre a membrana plasmática e o núcleo, composta pelo citosol (gel aquoso coloidal com íons, enzimas e metabólitos), citoesqueleto e organelas suspensas.',
    'Sustenta as organelas, distribui nutrientes por correntes internas e abriga reações bioquímicas vitais.',
    'Glicólise, síntese proteica em ribossomos livres, armazenamento de glicogênio e sinalização por segundos mensageiros.',
    'Em células vegetais, a corrente citoplasmática (ciclose) acelera visivelmente a distribuição de metabólitos e organelas ao redor do vacúolo.',
    [
      step(
        'Matriz coloidal e citosol aquoso',
        'VOLUME INTRACELULAR',
        'O citosol é um gel aquoso denso de proteínas, íons e água que preenche todo o interior celular, mantendo o pH e a concentração iônica ideais para a atividade enzimática.',
        'cytoplasm_gel', [1.8, 2.2, 10.6], 'cyto_gel'
      ),
      step(
        'Ciclose e correntes citoplasmáticas',
        'TRANSPORTE EM SUSPENSÃO',
        'Observe as partículas em suspensão circulando continuamente pelo interior celular: esse fluxo dinâmico transporta substratos, ATP e macromoléculas entre compartimentos distantes.',
        'cytoplasm_stream', [1.2, 1.2, 5.4], 'cyto_stream'
      ),
      step(
        'Ribossomos livres e metabolismo citosólico',
        'MICROAMBIENTE ENZIMÁTICO',
        'Aglomerados de ribossomos livres (polirribossomos) e complexos enzimáticos flutuam diretamente no citosol, sintetizando proteínas solúveis e conduzindo etapas como a glicólise.',
        'cytoplasm_enzymes', [1.1, 0.65, 2.1], 'cyto_enzymes'
      )
    ]
  ),

  nucleus: item(
    'Núcleo', '#9682f0',
    'Centro de comando genético delimitado pela carioteca (dupla bicamada lipídica com espaço perinuclear e membrana externa cravada de ribossomos contínua ao RER), sustentado internamente pela lâmina nuclear (laminas A/B/C), perfurado por complexos de poro nuclear (NPC) e preenchido por nucleoplasma, cromatina (DNA + histonas) e nucléolo esponjoso.',
    'Armazena, protege e regula o genoma eucariótico — decidindo quais genes são ativados ou silenciados para comandar o metabolismo, a síntese proteica, a diferenciação e a divisão de toda a célula.',
    'Compactação epigenética em histonas (2 nm → 1.400 nm), replicação do DNA, transcrição de mRNA/tRNA/rRNA, splicing alternativo e montagem das subunidades ribossomais 40S e 60S.',
    'Embora todas as células somáticas carreguem o mesmo DNA (~2 metros dobrados em um núcleo de ~6 μm!), o núcleo rege a identidade de cada tecido controlando quais trechos permanecem abertos em eucromatina ou compactados em heterocromatina.',
    [
      step(
        'Carioteca dupla, lâmina nuclear e continuidade com o RER',
        'ARQUITETURA E PROTEÇÃO GENÔMICA',
        'A carioteca possui membrana externa (recoberta por ribossomos e fisicamente contínua ao retículo endoplasmático rugoso) e membrana interna revestida pela malha fibrosa da lâmina nuclear (verde), que dá forma ao núcleo e ancora a heterocromatina periférica.',
        'nucleus_main', [1.15, 0.92, 3.85], 'nucleus_envelope'
      ),
      step(
        'Compactação do DNA: histonas (H2A, H2B, H3, H4 + H1) e nucleossomos',
        'COMPACTAÇÃO · 2 nm → 10 nm → 30 nm → 1.400 nm',
        'Para caber ~2 metros de DNA em ~6 μm, a dupla-hélice (2 nm) enrola 1,65 volta (~147 pb) em octâmeros de histonas (2 cópias de H2A, H2B, H3 e H4) formando nucleossomos ("colar de contas", 10 nm). A histona H1 trava a saída do DNA compactando-o na fibra de 30 nm (solenoide) até o cromossomo metafásico (1.400 nm) com centrômero e telômeros.',
        'nucleus_histones', [0.54, 0.30, 1.52], 'nucleus_histones'
      ),
      step(
        'Eucromatina × Heterocromatina e regulação epigenética',
        'ACETILAÇÃO · LEITURA DE GENES',
        'Modificações químicas nas caudas das histonas (como acetilação, marcadores verdes Ac) afastam os nucleossomos abrindo a eucromatina, permitindo que a RNA Polimerase II transcreva genes ativos em mRNA. Já regiões metiladas ficam densamente compactadas na heterocromatina periférica (silenciadas).',
        'nucleus_chromatin', [0.58, 0.32, 1.62], 'nucleus_chromatin'
      ),
      step(
        'Nucléolo: fábrica de rRNA e subunidades ribossomais (40S e 60S)',
        'ESTRUTURA ESPONJOSA SEM MEMBRANA',
        'O nucléolo é um subcompartimento fibroso-granular condensado ao redor das regiões organizadoras nucleolares (NORs). Nele, o DNA ribossomal origina rRNA que se acopla a proteínas importadas do citosol formando as pré-subunidades 40S e 60S dos ribossomos.',
        'nucleus_nucleolus', [0.52, 0.28, 1.68], 'nucleus_nucleolus'
      ),
      step(
        'Complexo de poro nuclear (NPC): alfândega seletiva bidirecional',
        'CANAL OCTAMÉRICO OCO · RAN-GTP',
        'Cada poro nuclear é um canal octamérico oco com filamentos citoplasmáticos externos e cesto nuclear interno. Ele importa seletivamente histonas, polimerases e fatores de transcrição (via importinas) enquanto exporta mRNAs maduros, tRNAs e subunidades ribossomais 40S/60S.',
        'nucleus_pore', [0.46, 0.32, 1.46], 'nucleus_pore'
      ),
      step(
        'Centro de comando: como o núcleo rege toda a célula',
        'INTEGRAÇÃO E CONTROLE CELULAR',
        'Sinais externos chegam pelos poros na forma de fatores de transcrição → ativam genes específicos na eucromatina → o núcleo despacha mRNAs e ribossomos pelos poros para o citosol e o RER → as proteínas e enzimas produzidas executam metabolismo, secreção, defesa, movimento e divisão celular.',
        'nucleus_command', [1.22, 0.88, 3.65], 'nucleus_command'
      )
    ]
  ),

  rer: item(
    'Retículo endoplasmático rugoso', '#58b4eb',
    'Pilha contínua de cisternas membranosas achatadas interligadas por rampas helicoidais (Terasaki), recobertas por ribossomos 80S ancorados em canais translocons Sec61 na face citosólica.',
    'Sintetiza, dobra com chaperonas (BiP/Calnexina) e inicia a N-glicosilação de proteínas de secreção, de membrana e de lisossomos.',
    'Reconhecimento do peptídeo sinal (SRP), translocação cotraducional via Sec61, pontes dissulfeto (PDI), N-glicosilação (OST) e exportação em vesículas COPII (ERES).',
    'Células secretoras especializadas, como células acinares pancreáticas e plasmócitos (anticorpos), exibem um RER extremamente desenvolvido.',
    [
      step(
        'Cisternas fenestradas e rampas helicoidais contínuas',
        'SISTEMA ENDOMEMBRANAR · RAMPAS TERASAKI',
        'As cisternas achatadas do RER conectam-se por rampas helicoidais mantendo um único lúmen oxidante contínuo (ambiente ideal para pontes dissulfeto e dobramento proteico).',
        'rer_main', [1.1, 0.85, 3.6], 'rer_overview'
      ),
      step(
        'Ribossomos 80S, SRP e canal translocon Sec61',
        'TRANSLOCAÇÃO COTRADUCIONAL',
        'No zoom sobre a face citosólica, a partícula SRP direciona o ribossomo 80S ao poro proteico Sec61. Enquanto traduz o mRNA, o polipeptídeo nascente penetra diretamente no lúmen do RER.',
        'rer_ribosomes', [0.58, 0.44, 1.58], 'rer_translocate'
      ),
      step(
        'Dobramento no lúmen (BiP/Calnexina) e N-glicosilação',
        'CONTROLE DE QUALIDADE · OST',
        'Dentro do lúmen, a enzima OST transfere um oligossacarídeo em "Y" (N-glicano) à proteína nascente, enquanto chaperonas BiP e Calnexina guiam seu enovelamento tridimensional correto.',
        'rer_folding', [0.52, 0.36, 1.44], 'rer_folding'
      ),
      step(
        'Sítios de saída (ERES) e brotamento de vesículas COPII',
        'EXPORTAÇÃO PARA O GOLGI',
        'Proteínas corretamente dobradas concentram-se em sítios de saída (ERES) onde a gaiola proteica poliédrica COPII (ciano) molda e destaca vesículas rumo à face cis do Complexo de Golgi.',
        'rer_budding', [1.15, 0.48, 2.35], 'rer_bud'
      )
    ]
  ),

  ser: item(
    'Retículo endoplasmático liso', '#3ec2ab',
    'Rede tridimensional anastomosada de túbulos membranosos interligados por junções triplas (estabilizadas por reticulonas e atlastinas), desprovidos de ribossomos aderidos.',
    'Sintetiza fosfolipídios, colesterol e hormônios esteroides, destoxifica xenobióticos (citocromo P450) e regula reservas intracelulares de íons Ca²⁺.',
    'Biossíntese lipídica na monocamada citosólica, hidroxilação de toxinas via citocromo P450, bombeamento ativo SERCA e liberação rápida de Ca²⁺ (IP₃R/Rianodina).',
    'É abundante em hepatócitos (destoxificação de fármacos e álcool), células produtoras de esteroides (córtex adrenal/gônadas) e fibras musculares (retículo sarcoplasmático).',
    [
      step(
        'Rede tubular anastomosada com junções triplas',
        'MEMBRANA SEM RIBOSSOMOS · ATLASTINA',
        'Diferente do RER achatado, o retículo liso forma uma malha de túbulos altamente curvados ligados em junções triplas, maximizando a razão superfície/volume para enzimas de membrana.',
        'ser_main', [0.95, 0.75, 3.3], 'ser_overview'
      ),
      step(
        'Síntese de fosfolipídios, colesterol e esteroides',
        'BIOSSÍNTESE LIPÍDICA',
        'Enzimas inseridas na face citosólica dos túbulos sintetizam novos fosfolipídios, colesterol e hormônios esteroides, brotando gotículas lipídicas douradas que renovam as membranas celulares.',
        'ser_lipids', [0.62, 0.42, 1.65], 'ser_lipids'
      ),
      step(
        'Destoxificação enzimática via Citocromo P450',
        'OXIDAÇÃO DE XENOBIÓTICOS · FÍGADO',
        'No zoom sobre os complexos de Citocromo P450 (violeta com grupo heme), substâncias lipossolúveis tóxicas (vermelhas) recebem grupos hidroxila (–OH) tornando-se hidrossolúveis (ciano) para excreção renal.',
        'ser_detox', [-0.55, 0.36, 1.56], 'ser_detox'
      ),
      step(
        'Estoque luminal (SERCA) e pulso de sinalização de Ca²⁺',
        'SINALIZAÇÃO POR CÁLCIO',
        'Bombas Ca²⁺-ATPase (SERCA) concentram cálcio no lúmen tubular; ao receber sinais como IP₃, canais IP₃R abrem-se rapidamente liberando ondas luminosas de Ca²⁺ no citosol.',
        'ser_calcium', [0.68, 0.44, 1.75], 'ser_calcium'
      )
    ]
  ),

  golgi: item(
    'Complexo de Golgi', '#f0ae54',
    'Pilha polarizada de cisternas curvas fenestradas (dictiossomos): rede cis-Golgi (entrada), cisternas mediais e rede trans-Golgi (TGN) de triagem e expedição.',
    'Modifica quimicamente (glicosilação/sulfatação), recicla enzimas residentes (COPI), endereça com precisão molecular e empacota cargas secretórias e lisossomais.',
    'Maturação de N- e O-glicanos, fosforilação de manose-6-fosfato (M6P), retorno retrógrado KDEL (COPI) e brotamento revestido por clatrina.',
    'Enzimas destinadas aos lisossomos recebem no Golgi a etiqueta química manose-6-fosfato (M6P); falhas nessa marcação causam a Doença das Células-I (mucolipidose II).',
    [
      step(
        'Rede cis-Golgi · Recepção e fusão de vesículas COPII',
        'ENTRADA DA VIA SECRETÓRIA',
        'A face cis (voltada ao núcleo/RER) usa proteínas de captura (golginas) para ancorar e fundir vesículas revestidas por COPII vindas do RER, iniciando o processamento sequencial.',
        'golgi_cis', [0.92, 0.72, 2.8], 'golgi_cis'
      ),
      step(
        'Cisternas mediais · Glicosilação e maturação de glicanos',
        'MODIFICAÇÃO QUÍMICA SEQUENCIAL',
        'Conforme as proteínas avançam pelas cisternas mediais, glicosiltransferases residentes remodelam e alongam cadeias de açúcares (N- e O-glicosilação), adicionando sulfatos e ativando precursores.',
        'golgi_medial', [0.76, 0.42, 1.85], 'golgi_process'
      ),
      step(
        'Transporte retrógrado COPI (resgate KDEL → RER)',
        'RECICLAGEM DE ENZIMAS RESIDENTES',
        'O tráfego no Golgi é bidirecional: vesículas revestidas por COPI (violeta) brotam de volta no sentido trans → cis → RER, devolvendo enzimas residentes que carregam a sequência-sinal KDEL.',
        'golgi_retrograde', [-0.72, 0.42, 1.82], 'golgi_retrograde'
      ),
      step(
        'Rede trans-Golgi (TGN) · Manose-6-Fosfato e clatrina',
        'TRIAGEM E ENDEREÇAMENTO MOLECULAR',
        'Na rede trans, receptores reconhecem a etiqueta verde Manose-6-Fosfato (M6P) e montam gaiolas geodésicas de clatrina (rosadas) para enviar hidrolases aos lisossomos, separando-as dos grânulos secretórios dourados.',
        'golgi_trans', [0.78, 0.28, 1.82], 'golgi_trans'
      ),
      step(
        'Rota secretória até a membrana plasmática (exocitose)',
        'EXPEDIÇÃO EXTRACELULAR',
        'Observe o trajeto contínuo das vesículas secretórias partindo da rede trans pelo citoesqueleto até se fundirem com a membrana plasmática, liberando hormônios, muco ou matriz extracelular.',
        'golgi_route', [1.85, 0.65, 3.8], 'golgi_exocytosis'
      )
    ]
  ),

  mitochondria: item(
    'Mitocôndria', '#e68470',
    'Organela semiautônoma de membrana dupla: externa lisa e interna intensamente dobrada em cristas que circundam a matriz com mtDNA circular e mitorribossomos.',
    'Gera a maior parte do ATP celular em condições aeróbicas por fosforilação oxidativa.',
    'Oxidação do piruvato, β-oxidação, ciclo de Krebs, cadeia transportadora de elétrons e síntese quimiosmótica de ATP.',
    'Células musculares cardíacas têm altíssima densidade mitocondrial com cristas extremamente compactadas para sustentar o batimento contínuo.',
    [
      step(
        'Dupla membrana e corte anatômico',
        'ARQUITETURA BIOENERGÉTICA',
        'A membrana externa lisa envolve o espaço intermembranas e protege a membrana interna altamente dobrada em cristas que circundam a matriz mitocondrial.',
        'mito_main', [0.85, 0.58, 2.85], 'mito_overview'
      ),
      step(
        'Porinas (VDAC) e canal de piruvato (MPC)',
        'CANAIS DE MEMBRANA · TRANSPORTE',
        'No zoom sobre o envelope duplo, observe as porinas β-barril (VDAC, azul) na membrana externa permitindo a passagem de íons e piruvato, seguido pelo carreador seletivo MPC (verde) na membrana interna rumo à matriz.',
        'mito_channels', [0.18, 0.18, 1.36], 'mito_channels'
      ),
      step(
        'Cristas: Complexos I–IV, Q, Cit. c e bombeamento de H⁺',
        'CADEIA TRANSPORTADORA DE ELÉTRONS',
        'Aproximação molecular da membrana da crista: elétrons (dourados) percorrem Complexos I/II → Ubiquinona (Q) → III → Citocromo c → IV reduzindo O₂ em H₂O, enquanto prótons H⁺ (ciano) são bombeados para o espaço intermembranas.',
        'mito_cristae', [0.14, 0.12, 1.18], 'mito_cristae'
      ),
      step(
        'Turbina ATP sintase · Canal F₀ e cabeça F₁',
        'QUIMIOSMOSE · FOSFORILAÇÃO OXIDATIVA',
        'Zoom máximo na ATP sintase: prótons H⁺ retornam em alta velocidade pelo canal transmembrana F₀ girando o anel c e a haste γ (estabilizada pelo estator), deformando a cabeça catalítica F₁ para sintetizar ATP na matriz.',
        'mito_atp', [0.14, 0.1, 1.06], 'mito_atp'
      ),
      step(
        'Matriz: Ciclo de Krebs, mtDNA e mitorribossomos',
        'METABOLISMO E ORIGEM ENDOSSIMBIÓTICA',
        'No interior da matriz atuam as enzimas do Ciclo de Krebs (liberando CO₂ e NADH para a cadeia), além do anel de DNA mitocondrial circular próprio e mitorribossomos 55S.',
        'mito_matrix', [0.22, 0.18, 1.48], 'mito_matrix'
      )
    ]
  ),

  lysosome: item(
    'Lisossomo', '#d678b6',
    'Vesícula de membrana única revestida internamente por denso glicocálix protetor (glicoproteínas LAMP-1/LAMP-2), bombas rotatórias V-ATPase, permeases de exportação e mais de 50 hidrolases ácidas.',
    'Executa digestão intracelular de partículas endocitadas (heterofagia) e reciclagem de organelas envelhecidas ou danificadas (autofagia).',
    'Acidificação luminal (pH ~4,8 vs pH ~7,2 citosólico), hidrólise ácida de proteínas/lipídios/ácidos nucleicos e exportação de monômeros reutilizáveis.',
    'Deficiências genéticas em hidrolases lisossomais causam doenças de depósito lisossomal, como Gaucher, Pompe e Tay-Sachs.',
    [
      step(
        'Glicocálix protetor LAMP-1/2 e bombas V-ATPase',
        'ACIDIFICAÇÃO · pH ~4,8',
        'Cinco bombas rotatórias V-ATPase (V₀/V₁) consomem ATP no citosol para bombear prótons H⁺ ao lúmen, mantendo o pH em ~4,8. A camada interna altamente glicosilada (LAMP-1/2, rosa) impede a autodigestão da própria membrana.',
        'lyso_main', [0.62, 0.42, 1.72], 'lyso_pumps'
      ),
      step(
        'Hidrolases ácidas (proteases, lipases e nucleases)',
        'SEGURANÇA DEPENDENTE DE pH',
        'No interior ácido, proteases (catepsinas), lipases, nucleases e glicosidases atingem atividade máxima. Em caso de ruptura isolada, o pH neutro do citosol (~7,2) inativa essas enzimas, protegendo a célula.',
        'lyso_enzymes', [0.42, 0.24, 1.18], 'lyso_enzymes'
      ),
      step(
        'Autofagia e fusão fagolisossomal',
        'RECICLAGEM DE ORGANELAS (AUTOFAGOSSOMO)',
        'Organelas desgastadas (como uma mitocôndria senescente) são envolvidas por dupla membrana formando um autofagossomo, que ancora e se funde ao lisossomo para originar o autolisossomo.',
        'lyso_fusion', [0.55, 0.34, 1.52], 'lyso_fusion'
      ),
      step(
        'Hidrólise ácida e reciclagem de monômeros',
        'PERMEASES DE EXPORTAÇÃO',
        'As hidrolases desmontam a carga em aminoácidos, açúcares simples e nucleotídeos (dourados), que atravessam proteínas permeases verdes na membrana de volta ao citosol para construir novas moléculas.',
        'lyso_digest', [0.52, 0.3, 1.38], 'lyso_digest'
      )
    ]
  ),

  peroxisome: item(
    'Peroxissomo', '#e3bd5b',
    'Organela oxidativa de membrana única com importômeros proteicos PEX, transportadores ABCD1, enzimas de β-oxidação e núcleo paracristalino denso de oxidases e catalase.',
    'Encurta ácidos graxos de cadeia muito longa (VLCFA), sintetiza plasmalógenos essenciais à mielina e decompõe instantaneamente o H₂O₂ tóxico.',
    'β-oxidação peroxissomal (gera Acetil-CoA + H₂O₂), síntese de éter-fosfolipídios e reação 2 H₂O₂ → 2 H₂O + O₂ pela catalase tetramérica.',
    'Falhas na biogênese peroxissomal (genes PEX) causam a síndrome de Zellweger; defeitos no transportador ABCD1 causam adrenoleucodistrofia (acúmulo de VLCFA).',
    [
      step(
        'Compartimento oxidativo, importômero PEX e ABCD1',
        'BIOGÊNESE E TRANSPORTE DE MEMBRANA',
        'Abundante em hepatócitos e células renais, o peroxissomo importa enzimas prontas do citosol pelo complexo PEX (violeta) e capta ácidos graxos pelo transportador ABCD1 (ciano).',
        'perox_main', [0.58, 0.38, 1.65], 'perox_overview'
      ),
      step(
        'β-oxidação de VLCFAs e síntese de plasmalógenos',
        'ENCURTAMENTO DE ÁCIDOS GRAXOS',
        'Ácidos graxos de cadeia muito longa (>22 carbonos, dourados) entram via ABCD1 e são encurtados em blocos de 2 carbonos (Acetil-CoA, verde) — gerando H₂O₂ com segurança dentro da organela.',
        'perox_betaox', [-0.46, 0.28, 1.32], 'perox_betaox'
      ),
      step(
        'Núcleo paracristalino de oxidases e catalase',
        'ULTRAESTRUTURA DE MET',
        'No centro do peroxissomo observa-se o icônico retículo paracristalino facetado visto na microscopia eletrônica (rico em urato-oxidase e catalase em altíssima concentração).',
        'perox_crystal', [0.38, 0.22, 1.08], 'perox_crystal'
      ),
      step(
        'Catalase tetramérica: 2 H₂O₂ → 2 H₂O + O₂',
        'DETOXIFICAÇÃO ULTRARRÁPIDA',
        'A catalase (tetrâmero com 4 grupos heme) neutraliza milhões de moléculas de peróxido de hidrogênio (rosa) por segundo em água e microbolhas de oxigênio (ciano), evitando dano oxidativo.',
        'perox_catalase', [0.46, 0.26, 1.24], 'perox_bubbles'
      )
    ]
  ),

  centrosome: item(
    'Centrossomo e centríolos', '#eda761',
    'Par ortogonal de centríolos (centríolo-mãe com apêndices distais/subdistais e centríolo-filho) montados em 9 triplas de microtúbulos (A–B–C) com roda de carroça SAS-6, envoltos por material pericentriolar (PCM) e anéis γ-TuRC.',
    'Principal centro organizador de microtúbulos (MTOC) das células animais; organiza o citoesqueleto interfásico, os polos do fuso mitótico e os corpos basais de cílios/flagelos.',
    'Nucleação de microtúbulos ancorados pela extremidade menos (−) nos complexos γ-TuRC e duplicação semiconservativa na fase S do ciclo celular.',
    'Centríolos-mãe migram até a membrana plasmática, ancoram-se pelos 9 apêndices distais e atuam como corpos basais que originam o axonema (9+2) de cílios respiratórios e flagelos.',
    [
      step(
        'Par ortogonal: Centríolo-mãe (apêndices) ⊥ Centríolo-filho',
        'CENTRO ORGANIZADOR (MTOC)',
        'Os dois centríolos permanecem a 90° dentro do halo pericentriolar (PCM). Note os 9 apêndices distais ciano e subdistais exclusivos do centríolo-mãe maduro.',
        'centro_main', [0.72, 0.52, 2.05], 'centro_overview'
      ),
      step(
        'Corte 9×3 em catavento (túbulos A–B–C ocos) e roda SAS-6',
        'CORTE LONGITUDINAL E AXIAL · 27 MICROTÚBULOS',
        'O corte longitudinal e transversal no barril centriolar expõe o interior oco dos 27 microtúbulos (túbulos A completos e B/C fundidos), os elos internos A–C e o cubo central oco da roda de carroça SAS-6 com seus 9 raios.',
        'centro_triplets', [0.16, 0.22, 1.24], 'centro_triplets'
      ),
      step(
        'Anéis γ-TuRC nucleando microtúbulos (− → +)',
        'POLIMERIZAÇÃO DINÂMICA',
        'Complexos em anel de γ-tubulina (γ-TuRC, dourados) incrustados no PCM servem de molde para o crescimento dos microtúbulos: a extremidade (−) fica ancorada e a extremidade (+) cresce com capa GTP.',
        'centro_nucleation', [0.92, 0.62, 2.55], 'centro_rays'
      ),
      step(
        'Corpo basal e formação de cílios/flagelos (9+2)',
        'ANCORAGEM NA MEMBRANA · AXONEMA',
        'Em células ciliadas ou espermatozoides, o centríolo-mãe ancora seus 9 apêndices distais na membrana plasmática e estende as duplas A–B para montar o axonema móvel (9 duplas periféricas + par central).',
        'centro_basal', [0.85, 0.45, 2.05], 'centro_basal'
      )
    ]
  ),

  cytoskeleton: item(
    'Citoesqueleto', '#61b5c9',
    'Rede proteica integrada composta por três famílias em escalas distintas: microtúbulos (~25 nm, 13 protofilamentos α/β-tubulina), filamentos intermediários (~10 nm, cabos de queratina/vimentina) e microfilamentos de F-actina (~7 nm, dupla hélice).',
    'Confere forma e resistência mecânica, ancora organelas, impulsiona migração celular/citocinese e forma rodovias polarizadas para motores moleculares.',
    'Instabilidade dinâmica com hidrólise de GTP (microtúbulos), ramificação Arp2/3 com ATP (F-actina) e transporte bidirecional por cinesinas (→ +) e dineínas (← −).',
    'Quimioterápicos como paclitaxel (estabiliza microtúbulos) e vincristina (impede polimerização) bloqueiam o fuso mitótico em tumores; mutações em queratinas causam fragilidade cutânea (epidermólise bolhosa).',
    [
      step(
        'Três famílias integradas (25 nm · 10 nm · 7 nm)',
        'ARQUITETURA MECÂNICA DINÂMICA',
        'A célula integra microtúbulos radiais (ciano, ~25 nm), malha cortical de F-actina sob a membrana (rosa, ~7 nm) e cabos de filamentos intermediários ao redor do núcleo (violeta, ~10 nm).',
        'cyto_skel_main', [2.1, 2.2, 10.2], 'skel_overview'
      ),
      step(
        'Microtúbulos (~25 nm): 13 protofilamentos α/β-tubulina',
        'POLARIDADE (− → +) · INSTABILIDADE DINÂMICA',
        'No super zoom molecular, o microtúbulo revela um cilindro oco de 13 protofilamentos alternando dímeros de α- e β-tubulina. Na extremidade (+), a capa de GTP-tubulina alterna crescimento e curvatura em catástrofe.',
        'cyto_skel_track', [0.68, 0.36, 1.56], 'skel_track'
      ),
      step(
        'Motores moleculares: Cinesina (→ +) e Dineína (← −)',
        'CAMINHADA PASSO A PASSO COM ATP',
        'Observe proteínas motoras diméricas caminhando com duas "cabeças" alternadas ao longo do microtúbulo: a cinesina (verde-ciano) leva cargas para a periferia (+), enquanto a dineína (rosa-violeta) retorna ao centro (−), consumindo ATP a cada passo de 8 nm.',
        'cyto_skel_motors', [0.62, 0.38, 1.48], 'skel_motors'
      ),
      step(
        'Microfilamentos de F-actina (~7 nm) e ramo Arp2/3',
        'DUPLA HÉLICE · CÓRTEX E MIGRAÇÃO',
        'Com diâmetro 3,5× menor que o microtúbulo, a F-actina forma uma dupla hélice de monômeros de G-actina. O complexo Arp2/3 (dourado) nucleia novos ramos no ângulo característico de 70°, impulsionando pseudópodes e citocinese.',
        'cyto_skel_actin', [0.58, 0.34, 1.38], 'skel_actin'
      ),
      step(
        'Filamentos intermediários (~10 nm): cabos de tração',
        'CORDA APOLAR · QUERATINA / VIMENTINA',
        'Montados como uma corda trançada de 8 protofibrilas sem polaridade (+/−), os filamentos intermediários não servem de trilho para motores, mas absorvem enorme tensão mecânica ligando desmossomos e núcleo.',
        'cyto_skel_inter', [0.58, 0.32, 1.38], 'skel_intermediate'
      )
    ]
  ),

  wall: (() => {
    const base = item(
      'Parede celular', '#6ec982',
      'Nos vegetais: lamela média (pectina-Ca²⁺) e parede primária com microfibrilas de celulose entrelaçadas por hemiceluloses em hidrogel de pectina e perfuradas por plasmodesmos. Nas bactérias: malha reticulada de peptidoglicano (NAM–NAG + pontes peptídicas).',
      'Confere forma geométrica definida, resistência à tração e proteção indispensável contra ruptura osmótica (lise em meios hipotônicos).',
      'Deposição orientada de celulose por rosetas CesA (vegetais) ou transpeptidação por enzimas PBP no peptidoglicano (bactérias).',
      'Antibióticos β-lactâmicos (como a penicilina) bloqueiam as transpeptidases (PBPs) que fecham as pontes peptídicas bacterianas — sem afetar células animais (que não possuem parede).',
      [
        step(
          'Parede celulósica e pressão de turgor',
          'PROTEÇÃO OSMÓTICA VEGETAL',
          'Externa à membrana plasmática, a parede vegetal resiste à pressão hidrostática interna do vacúolo (turgor), sustentando folhas e caules sem romper a célula.',
          'wall_overview', [4.1, 2.3, 9.6], 'wall_overview'
        ),
        step(
          'Lamela média, celulose, hemicelulose e pectina',
          'ARQUITETURA FIBROSA EM CAMADAS',
          'No close-up em corte, observe a lamela média dourada (cola de pectina-Ca²⁺ entre células vizinhas) sobre camadas cruzadas de microfibrilas de celulose (verde) amarradas por hemiceluloses (âmbar) em matriz gelatinosa de pectina.',
          'wall_fibrils', [-0.62, 0.38, 1.44], 'wall_fibrils'
        ),
        step(
          'Roseta de Celulose Sintase (CesA) sobre microtúbulo',
          'BIOSSÍNTESE ORIENTADA NA MEMBRANA',
          'Complexos hexaméricos de Celulose Sintase (rosetas CesA, ciano) deslizam na membrana plasmática guiados por microtúbulos corticais, fiando novas microfibrilas de celulose diretamente para a parede.',
          'wall_synth', [-0.56, 0.34, 1.36], 'wall_synth'
        ),
        step(
          'Plasmodesmos e desmotúbulo (via simplástica)',
          'COMUNICAÇÃO INTERCELULAR VEGETAL',
          'Canais em ampulheta revestidos de membrana atravessam a parede com um eixo central de retículo endoplasmático (desmotúbulo dourado) e anel regulador de calose, permitindo passagem controlada de RNAs e solutos.',
          'wall_channels', [-0.54, 0.32, 1.32], 'wall_channels'
        )
      ]
    );
    base.plantSteps = base.steps;
    base.bacteriaSteps = [
      step(
        'Envoltório rígido de peptidoglicano (mureína)',
        'PROTEÇÃO OSMÓTICA BACTERIANA',
        'Sob a cápsula mucosa e externamente à membrana plasmática, a parede de peptidoglicano suporta pressões osmóticas internas de até 20 atm, definindo a forma da bactéria (coco, bacilo ou espirilo).',
        'wall_overview', [4.1, 2.3, 9.6], 'wall_overview'
      ),
      step(
        'Malha molecular NAM–NAG e pontes peptídicas',
        'PEPTIDOGLICANO · RETICULAÇÃO',
        'Cadeias paralelas alternando açúcares NAM (dourado) e NAG (âmbar) são amarradas transversalmente por curtas pontes de tetrapeptídeos (rosa), formando uma única macromolécula em malha ao redor da célula.',
        'wall_fibrils', [-0.62, 0.38, 1.44], 'wall_fibrils'
      ),
      step(
        'Transpeptidase (PBP) e alvo da Penicilina (β-lactâmicos)',
        'FARMACOLOGIA ANTIMICROBIANA',
        'Enzimas transpeptidases (PBPs, violeta) fecham as pontes peptídicas durante o crescimento bacteriano. Antibióticos β-lactâmicos (bloco vermelho) bloqueiam o sítio ativo da PBP, enfraquecendo a parede até a lise osmótica.',
        'wall_synth', [-0.56, 0.34, 1.36], 'wall_synth'
      ),
      step(
        'Porinas β-barril, ácidos teicoicos e Gram+ × Gram−',
        'PERMEABILIDADE E CLASSIFICAÇÃO DE GRAM',
        'Ácidos teicoicos (azul) ancoram a parede espessa das Gram-positivas (retêm cristal violeta); já nas Gram-negativas, uma fina camada de peptidoglicano fica sob uma membrana externa rica em LPS perfurada por porinas triméricas (ciano).',
        'wall_channels', [-0.54, 0.32, 1.32], 'wall_channels'
      )
    ];
    return base;
  })(),

  vacuole: item(
    'Vacúolo central', '#5ebce8',
    'Grande compartimento aquoso vegetal delimitado por uma membrana seletiva chamada tonoplasto, contendo suco celular rico em água, íons e pigmentos.',
    'Armazena substâncias e regula a pressão osmótica (força contrária à osmose excessiva), mantendo o turgor e a sustentação dos tecidos vegetais.',
    'Transporte de água por aquaporinas, bombeamento de prótons para o lúmen e estoque de antocianinas e metabólitos de defesa.',
    'Quando a planta perde água, o vacúolo murcha, a pressão de turgor cai e a membrana plasmática se retrai da parede (plasmólise).',
    [
      step(
        'Tonoplasto e ocupação volumétrica',
        'ATÉ 80% DO VOLUME VEGETAL',
        'O vacúolo central comprime o citoplasma e as demais organelas junto à periferia, otimizando as trocas com o ambiente e a captação de luz pelos cloroplastos.',
        'vacuole_main', [1.4, 1.1, 6.2], 'vacuole_overview'
      ),
      step(
        'Entrada de água e pressão de turgor',
        'EQUILÍBRIO OSMÓTICO',
        'No zoom sobre o tonoplasto, moléculas de água ingressam por osmose gerando pressão hidrostática suave (turgor) que mantém a célula firme contra a parede.',
        'vacuole_turgor', [0.9, 0.55, 2.8], 'vacuole_turgor'
      ),
      step(
        'Reserva de solutos e cristais',
        'ARMAZENAMENTO CELULAR',
        'No interior translúcido do suco vacuolar ficam armazenados íons minerais, cristais de reserva e pigmentos hidrossolúveis como as antocianinas.',
        'vacuole_solutes', [0.75, 0.4, 2.45], 'vacuole_solutes'
      )
    ]
  ),

  chloroplast: item(
    'Cloroplasto', '#6ed67e',
    'Plastídio fotossintético de envelope duplo envolvendo o estroma e um extenso sistema interno de membranas tilacoides empilhadas em grana.',
    'Converte energia luminosa em energia química (ATP e NADPH) e fixa CO₂ em carboidratos pela fotossíntese.',
    'Fase fotoquímica nas membranas dos tilacoides (fotossistemas e liberação de O₂) e ciclo de Calvin no estroma.',
    'Assim como as mitocôndrias, cloroplastos guardam DNA circular próprio e ribossomos 70S, descendentes de cianobactérias ancestrais.',
    [
      step(
        'Envelope duplo, estroma e grana',
        'PLASTÍDIO FOTOSSINTÉTICO',
        'Duas membranas externas envolvem o estroma enzimático e as pilhas de discos tilacoides (grana) interligadas por lamelas onde a luz é convertida em energia química.',
        'chloro_main', [0.85, 0.58, 2.85], 'chloro_overview'
      ),
      step(
        'Porinas OEP e translocon TOC/TIC',
        'CANAIS DO ENVELOPE DUPLO',
        'No zoom sobre o envelope duplo, porinas OEP facilitam a difusão de CO₂ e H₂O, enquanto o canal acoplado TOC/TIC (roxo) importa proteínas codificadas no núcleo diretamente para o estroma.',
        'chloro_envelope', [0.18, 0.18, 1.15], 'chloro_envelope'
      ),
      step(
        'Membrana do tilacoide: PSII, Citocromo b₆f e PSI',
        'FASE FOTOQUÍMICA · CADEIA Z',
        'Aproximação molecular do tilacoide: fótons excitam o Fotossistema II (quebrando H₂O em O₂ e H⁺ no lúmen); elétrons passam por Plastoquinona (PQ) → Citocromo b₆f (bombeando mais H⁺ ao lúmen) → Plastocianina → PSI e FNR formando NADPH no estroma.',
        'chloro_grana', [0.14, 0.14, 1.42], 'chloro_photons'
      ),
      step(
        'Turbina CF₀–CF₁ ATP sintase do tilacoide',
        'FOTOFOSFORILAÇÃO · CANAL CF₀',
        'Zoom máximo na ATP sintase plastidial: o gradiente elevado de H⁺ no lúmen escapa pelo canal CF₀ em direção ao estroma, girando o rotor γ (estabilizado pelo estator) e acionando a cabeça CF₁ para liberar ATP no estroma.',
        'chloro_atp', [0.14, 0.12, 1.24], 'chloro_atp'
      ),
      step(
        'Estroma: Ciclo de Calvin, cpDNA, ribossomos 70S e amido',
        'FIXAÇÃO DE CARBONO E GENOMA',
        'No estroma, o Ciclo de Calvin (RuBisCO) usa ATP e NADPH para fixar CO₂ em glicose e grânulos de amido, ao lado do DNA circular próprio (cpDNA) e ribossomos 70S.',
        'chloro_calvin', [0.24, 0.18, 1.25], 'chloro_calvin'
      )
    ]
  ),

  capsule: item(
    'Cápsula bacteriana', '#65cbd8',
    'Camada mucosa bem organizada de exopolissacarídeos (EPS) altamente hidratados (~98% água) depositada externamente à parede celular, frequentemente atravessada por fímbrias adesivas.',
    'Impede a dessecação ambiental, camufla antígenos contra fagocitose imune e promove adesão estável em biofilmes sobre mucosas e cateteres.',
    'Secreção contínua de polissacarídeos aniônicos hidrofílicos formando escovas poliméricas escorregadias na superfície externa.',
    'Em Streptococcus pneumoniae, Klebsiella pneumoniae e Neisseria meningitidis, cepas encapsuladas são altamente virulentas; vacinas conjugadas treinam anticorpos justamente contra os polissacarídeos da cápsula.',
    [
      step(
        'Envoltório polissacarídico hidratado (EPS)',
        'CAMADA EXTERNA · GLICOCÁLIX',
        'Esta matriz gelatinosa translúcida envolve completamente a parede bacteriana, criando uma barreira física e química externa.',
        'capsule_overview', [4.2, 2.4, 10.6], 'capsule_overview'
      ),
      step(
        'Escovas poliméricas hidrofílicas e proteção hídrica',
        'RETENÇÃO DE ÁGUA (~98%)',
        'No zoom sobre a matriz capsular, cadeias longas de exopolissacarídeos retêm dezenas de moléculas de água, protegendo a bactéria contra ressecamento, detergentes e bacteriófagos.',
        'capsule_matrix', [-0.78, 0.42, 1.72], 'capsule_matrix'
      ),
      step(
        'Barreira antifagocítica (evasão imune)',
        'DEFESA CONTRA MACRÓFAGOS E ANTICORPOS',
        'A carga elétrica negativa e a textura escorregadia da cápsula dificultam a opsonização por anticorpos em "Y" e fazem os pseudópodes do macrófago escorregarem sem conseguir englobar a bactéria.',
        'capsule_shield', [-0.82, 0.46, 1.85], 'capsule_shield'
      ),
      step(
        'Fímbrias, adesinas e formação de biofilmes',
        'COLONIZAÇÃO DE SUPERFÍCIES',
        'Fímbrias proteicas com pontas de adesina atravessam a cápsula para ancorar firmemente a bactéria em tecidos hospedeiros ou iniciar biofilmes comunitários resistentes.',
        'capsule_adhesion', [-0.76, 0.4, 1.76], 'capsule_adhesion'
      )
    ]
  ),

  nucleoid: item(
    'Nucleoide', '#a785f7',
    'Região citoplasmática sem envelope nuclear onde se concentra o cromossomo bacteriano circular compactado em super-hélices.',
    'Organiza, replica e transcreve o material genético procariótico em contato direto com o citosol.',
    'Replicação bidirecional do DNA circular e transcrição acoplada diretamente à tradução ribossomal.',
    'Como não há membrana nuclear separando DNA e ribossomos, a tradução começa antes mesmo do término da transcrição.',
    [
      step(
        'DNA cromossômico sem envelope',
        'REGIÃO GENÔMICA',
        'Nas bactérias, o DNA não é isolado por um núcleo: ocupa uma região central condensada diretamente imersa no citosol.',
        'nucleoid_main', [1.1, 0.85, 4.1], 'nucleoid_overview'
      ),
      step(
        'Superenovelamento em alças',
        'COMPACTAÇÃO POR TOPOISOMERASES',
        'No zoom sobre o filamento circular, alças superenoveladas permitem acomodar uma molécula centenas de vezes maior que a própria bactéria.',
        'nucleoid_loops', [0.65, 0.42, 2.05], 'nucleoid_loops'
      ),
      step(
        'Transcrição e tradução acopladas',
        'RESPOSTA METABÓLICA ÁGIL',
        'Pulsos de mRNA emergem diretamente das alças de DNA e são imediatamente capturados pelos ribossomos 70S vizinhos.',
        'nucleoid_coupled', [0.75, 0.45, 2.2], 'nucleoid_coupled'
      )
    ]
  ),

  plasmid: item(
    'Plasmídeos', '#ebb65e',
    'Moléculas circulares de dupla-hélice de DNA extracromossômico covalentemente fechadas e superenroladas (cccDNA), SEM histonas, contendo origem própria (oriC), promotor e genes acessórios.',
    'Carregam genes adaptativos como resistência a antibióticos (ampR/bla), fatores de virulência, toxinas ou vias metabólicas especiais.',
    'Replicação autônoma em anel θ (theta) ou círculo rolante e transferência horizontal para outras bactérias através do pilus conjugativo oco.',
    'Na engenharia genética, plasmídeos recombinantes são os principais vetores para clonar genes e produzir insulina humana, anticorpos e vacinas.',
    [
      step(
        'Dupla-hélice circular superenrolada (cccDNA)',
        'DNA ACESSÓRIO · SEM HISTONAS',
        'Observe a dupla-hélice fechada com superenrolamento 3D e blocos funcionais destacados: origem de replicação (oriC em ciano), gene de resistência a antibióticos (ampR em rosa) e região promotora (violeta).',
        'plasmid_main', [0.76, 0.52, 2.15], 'plasmid_overview'
      ),
      step(
        'Replicação autônoma em anel θ (theta)',
        'ORIGEM PRÓPRIA (oriC)',
        'A partir da origem oriC, forquilhas com DNA Polimerase III sintetizam bidirecionalmente um anel-filho completo sem depender da divisão do cromossomo bacteriano principal.',
        'plasmid_rep', [0.48, 0.34, 1.38], 'plasmid_replicate'
      ),
      step(
        'Conjugação bacteriana por pilus sexual oco',
        'TRANSFERÊNCIA HORIZONTAL',
        'Plasmídeos conjugativos (fator F/R) transferem uma fita simples de DNA por dentro de um pilus tubular oco até uma bactéria receptora, disseminando resistência a antibióticos rapidamente.',
        'plasmid_conj', [0.68, 0.38, 1.85], 'plasmid_transfer'
      )
    ]
  ),

  ribosome: item(
    'Ribossomos 70S', '#76cbed',
    'Organelas NÃO membranosas (complexos de RNAr e proteínas) abundantes no citosol, montadas por uma subunidade maior (50S) e uma menor (30S).',
    'Sintetizam proteínas essenciais para a regeneração celular e o controle metabólico.',
    'Pareamento códon–anticódon na subunidade 30S e catálise de ligações peptídicas na subunidade 50S.',
    'Diferenças estruturais entre ribossomos 70S (bacterianos) e 80S (eucarióticos) permitem a ação seletiva de antibióticos como tetraciclinas e macrolídeos.',
    [
      step(
        'Dispersão densa no citoplasma',
        'ALTA TAXA DE SÍNTESE',
        'Centenas de ribossomos 70S distribuídos pelo citosol garantem crescimento e divisão bacteriana extremamente rápidos.',
        'ribo_overview', [2.2, 2.0, 9.4], 'ribo_overview'
      ),
      step(
        'Subunidades 50S e 30S',
        'DETALHE MOLECULAR · ~20 nm',
        'No super zoom sobre um ribossomo 70S ativo, distinguem-se claramente a cúpula maior (50S) e a base menor (30S) abraçando a fita de mRNA.',
        'ribo_hero', [0.44, 0.25, 1.15], 'ribo_subunits'
      ),
      step(
        'Alongamento da cadeia polipeptídica',
        'TRADUÇÃO ATIVA',
        'Conforme o mRNA desliza pela fenda entre as subunidades, uma cadeia nascente de aminoácidos emerge e se enovela do túnel da subunidade 50S.',
        'ribo_hero', [0.48, 0.28, 1.24], 'ribo_translate'
      )
    ]
  ),

  flagellum: item(
    'Flagelo bacteriano', '#eda064',
    'Filamento helicoidal proteico (flagelina) conectado por um gancho flexível a um motor rotatório basal ancorado nas membranas.',
    'Impulsiona a natação bacteriana e orienta deslocamentos por quimiotaxia.',
    'Motor rotatório movido diretamente pelo fluxo de prótons (H⁺) através do estator proteico na membrana plasmática.',
    'Ao inverter o sentido de rotação do motor basal, a bactéria alterna entre corrida direcionada e mudança aleatória de direção.',
    [
      step(
        'Filamento propulsor helicoidal',
        'MOTILIDADE BACTERIANA',
        'O flagelo bacteriano funciona como uma hélice rotatória verdadeira — diferente do batimento em chicote dos flagelos eucarióticos.',
        'flag_overview', [1.4, 1.2, 5.2], 'flag_overview'
      ),
      step(
        'Motor basal e fluxo de prótons (H⁺)',
        'NANOMOTOR ROTATÓRIO',
        'No super zoom na ancoragem sobre o envelope, os anéis MS, P e L giram impulsionados pela passagem contínua de prótons H⁺ através do estator.',
        'flag_motor', [0.92, 0.5, 1.38], 'flag_motor'
      ),
      step(
        'Propulsão em onda helicoidal contínua',
        'QUIMIOTAXIA ATIVA',
        'A rotação transmitida pelo gancho gera uma onda helicoidal fluida ao longo de todo o filamento de flagelina, impulsionando a célula no meio líquido.',
        'flag_wave', [1.85, 0.8, 3.8], 'flag_wave'
      )
    ]
  ),

  // =========================================================================
  // VÍRUS (ACELULAR · PARASITA INTRACELULAR OBRIGATÓRIO)
  // =========================================================================
  viral_envelope: item(
    'Envelope lipídico viral', '#e06b88',
    'Bicamada lipídica externa presente em vírus envelopados (como influenza, HIV e coronavírus), obtida por brotamento a partir da membrana da célula hospedeira e revestida internamente por proteínas de matriz (M).',
    'Protege o capsídeo contra anticorpos e facilita a fusão direta com a membrana da célula-alvo.',
    'Vírus são ACELULARES: não possuem metabolismo próprio, citoplasma nem ribossomos — dependem integralmente da célula hospedeira para se multiplicar.',
    'Por ser composto por lipídios, o envelope viral é facilmente dissolvido por sabão e álcool 70%, inativando o vírus.',
    [
      step(
        'Vírus são acelulares (envelope e matriz M)',
        'ESTRUTURA ACELULAR',
        'Ao contrário das células animal, vegetal e bacteriana, o vírus não tem metabolismo próprio. Nos vírus envelopados, esta camada lipídica roubada da célula hospedeira envolve e protege o capsídeo interno.',
        'viral_env_main', [1.6, 1.3, 6.4], 'viral_envelope'
      )
    ]
  ),

  viral_spikes: item(
    'Espículas glicoproteicas (Spikes)', '#ff9c6e',
    'Glicoproteínas triméricas projetadas para fora do envelope viral que atuam como chaves moleculares altamente específicas.',
    'Reconhecem receptores na membrana da célula hospedeira (especificidade viral) e desencadeiam a entrada do vírus.',
    'Ligação chave-fechadura seguida de fusão de membranas ou endocitose mediada por receptor.',
    'Vacinas modernas treinam o sistema imune a produzir anticorpos neutralizantes justamente contra as espículas, bloqueando a infecção.',
    [
      step(
        'Reconhecimento chave-fechadura (domínio S1)',
        'ESPECIFICIDADE CELULAR',
        'A espícula trimérica encaixa seu domínio de ligação (S1) exatamente no receptor complementar (como ACE2 ou CD4) da bicamada da célula hospedeira — definindo quais tecidos o vírus consegue infectar.',
        'viral_spikes_main', [1.15, 0.85, 3.6], 'viral_docking'
      ),
      step(
        'Fusão de membranas (subunidade S2) e entrada',
        'INVASÃO DO HOSPEDEIRO',
        'Após o encaixe e clivagem proteolítica, a haste S2 puxa o envelope lipídico viral contra a bicamada celular, abrindo um poro de fusão que libera o capsídeo e o genoma viral no citoplasma.',
        'viral_spikes_main', [0.92, 0.72, 2.95], 'viral_fusion'
      )
    ]
  ),

  viral_capsid: item(
    'Capsídeo icosaédrico', '#9d88f5',
    'Invólucro proteico simétrico (frequentemente icosaédrico ou helicoidal) montado por subunidades repetitivas chamadas capsômeros.',
    'Protege fisicamente o material genético viral contra enzimas nucleases e radiação até a chegada ao interior da célula.',
    'Automontagem proteica a partir de proteínas sintetizadas pelos ribossomos da célula infectada.',
    'Vírus não envelopados (nus), como adenovírus e rotavírus, dependem apenas do capsídeo resistente para sobreviver no ambiente.',
    [
      step(
        'Arquitetura geométrica de capsômeros',
        'ESCUDO PROTEICO',
        'No corte do envelope, revela-se o capsídeo icosaédrico composto por capsômeros proteicos interligados em alta simetria, formando uma cápsula rígida ao redor do genoma.',
        'viral_capsid_main', [1.1, 0.8, 4.2], 'viral_capsid'
      )
    ]
  ),

  viral_genome: item(
    'Genoma viral (RNA / DNA) e enzimas', '#ffd266',
    'Molécula única ou segmentada de RNA ou DNA (fita simples ou dupla) espiralada no núcleo do capsídeo, acompanhada de proteínas do nucleocapsídeo e enzimas como RNA polimerase ou transcriptase reversa.',
    'Contém as instruções genéticas mínimas para sequestrar a maquinaria de transcrição e tradução da célula hospedeira.',
    'Replicação do genoma viral e síntese massiva de proteínas virais pelos ribossomos do hospedeiro.',
    'Retrovírus (como o HIV) carregam a enzima transcriptase reversa, capaz de produzir DNA a partir de seu molde de RNA.',
    [
      step(
        'Ácido nucleico espiralado e polimerase viral',
        'SEQUESTRO GENÉTICO',
        'No interior do capsídeo, o RNA/DNA viral associado às enzimas virais (verde) comanda a célula invadida a fabricar centenas de novas cópias virais.',
        'viral_genome_main', [0.85, 0.6, 3.2], 'viral_genome'
      )
    ]
  ),

  viral_phage: item(
    'Bacteriófago T4 (vírus de bactéria)', '#48db9b',
    'Vírus complexo não envelopado (Myoviridae): cabeça icosaédrica prolata com dsDNA linear NU (~169 kb, SEM histonas — compactado por Mg²⁺ e poliaminas sob ~60 atm), colar com fibrilas, bainha helicoidal contrátil (gp18), tubo interno rígido OCO (gp19), placa basal com lisozima (gp5) e 6 fibras caudais.',
    'Infecta bactérias (E. coli) injetando um fio contínuo de DNA dupla-fita nu diretamente através do tubo interno oco como uma nanosseringa mecânica.',
    'Ciclo lítico (sequestro da maquinaria bacteriana, montagem e lise) ou ciclo lisogênico em fagos temperados (integração como profago).',
    'Diferente de eucariotos, o T4 NÃO usa histonas: seu DNA é injetado nu sob altíssima pressão osmótica interna (~60 atm), sendo estudado em fagoterapia contra superbactérias.',
    [
      step(
        'Adsorção das 6 fibras caudais e pinos da placa basal',
        'RECONHECIMENTO BACTERIANO',
        'O bacteriófago T4 pousa nos receptores da membrana externa com suas 6 fibras articuladas e trava os 6 pinos curtos da placa basal hexagonal. Dentro do capsídeo prolato, o dsDNA linear nu (~169 kb, sem histonas) aguarda comprimido a ~60 atm.',
        'viral_phage_main', [1.45, 0.55, 7.1], 'phage_adsorb'
      ),
      step(
        'Pistão contrátil e injeção de fio contínuo de dsDNA nu (tubo oco gp19)',
        'NANOSSERINGA VIRAL · SEM HISTONAS',
        'A cabeça, o colar e o tubo azul interno OCO (gp19) descem juntos como um pistão enquanto a bainha helicoidal (gp18) encurta e alarga sem desconectar do topo. A ponta com lisozima perfura o peptidoglicano e o fio contínuo de dsDNA nu escoa pelo lúmen oco para o citoplasma bacteriano!',
        'viral_phage_main', [1.28, 0.25, 5.8], 'phage_inject'
      )
    ]
  ),

  // =========================================================================
  // FIBRA MUSCULAR ESQUELÉTICA (MIÓCITO ESTRIADO)
  // =========================================================================
  muscle_sarcolemma: item(
    'Sarcolema e túbulos T', '#e07b82',
    'Membrana plasmática excitável da fibra muscular estriada que emite invaginações transversais profundas chamadas túbulos T.',
    'Conduz rapidamente o potencial de ação da placa motora até o interior de toda a fibra muscular.',
    'Despolarização elétrica acoplada diretamente à abertura dos canais de cálcio do retículo sarcoplasmático.',
    'A sincronia proporcionada pelos túbulos T garante que todos os sarcômeros da fibra se contraiam simultaneamente.',
    [
      step(
        'Excitação pelo sarcolema e túbulos T',
        'ACOPLAMENTO EXCITAÇÃO–CONTRAÇÃO',
        'Observe os pulsos elétricos ciano mergulhando pelos túbulos T ao longo da fibra cilíndrica, levando o comando nervoso até as miofibrilas mais profundas.',
        'muscle_sarco_main', [1.4, 1.4, 7.6], 'muscle_sarco'
      )
    ]
  ),

  muscle_nuclei: item(
    'Núcleos periféricos (multinucleada)', '#9682f0',
    'Dezenas a centenas de núcleos achatados empurrados para a periferia, logo abaixo do sarcolema.',
    'Mantêm alta produção de mRNA para sustentar o enorme volume proteico de uma fibra muscular que pode ter centímetros de comprimento.',
    'Formada na embriogênese pela fusão de muitos mioblastos (sincício multinucleado).',
    'A posição periférica dos núcleos é um marco clássico para diferenciar músculo esquelético do cardíaco (núcleo central) na histologia.',
    [
      step(
        'Arquitetura multinucleada periférica',
        'SINCÍCIO MUSCULAR',
        'Como quase todo o citoplasma é preenchido por miofibrilas contráteis, os múltiplos núcleos achatados ficam comprimidos junto à membrana externa.',
        'muscle_nuclei_main', [0.85, 0.9, 4.6], 'muscle_nuclei'
      )
    ]
  ),

  muscle_sarcomere: item(
    'Sarcômeros (actina e miosina)', '#ffd266',
    'Unidades contráteis repetitivas delimitada por duas linhas Z douradas, contendo filamentos finos de actina (ciano) intercalados com filamentos grossos de miosina (vermelho).',
    'Gera força mecânica e movimento encurtando a fibra muscular pelo deslizamento dos filamentos.',
    'Hidrólise de ATP nas cabeças da miosina puxa os filamentos de actina em direção à linha M central.',
    'O alinhamento regular de milhares de sarcômeros cria as faixas claras e escuras (estriações transversais) vistas ao microscópio.',
    [
      step(
        'Arquitetura do sarcômero: Bandas A, I, Zona H e Titina',
        'UNIDADE CONTRÁTIL · ~2,4 μm',
        'Delimitado por duas linhas Z douradas, o sarcômero organiza a Banda A (filamentos grossos de miosina II + sobreposição), a Banda I clara (apenas actina) e a mola elástica de titina que centraliza a miosina.',
        'muscle_sarcomere_main', [0.55, 0.62, 4.4], 'muscle_bands'
      ),
      step(
        'Ciclo das pontes cruzadas de miosina II com ATP',
        'DESLIZAMENTO DOS FILAMENTOS',
        'Quando Ca²⁺ liga-se à troponina (verde), as cabeças globulares da miosina II remam ativamente sobre a actina consumindo ATP, puxando as linhas Z e encurtando a Banda I e a Zona H sem encurtar os filamentos.',
        'muscle_sarcomere_main', [0.42, 0.5, 3.8], 'muscle_contract'
      )
    ]
  ),

  muscle_sr: item(
    'Retículo sarcoplasmático e tríades (Ca²⁺)', '#3ec9a7',
    'Versão altamente especializada do retículo endoplasmático liso formando cisternas terminais dilatadas pareadas a cada Túbulo T (Tríade muscular) e túbulos fenestrados ao redor das miofibrilas.',
    'Armazena altíssimas concentrações de Ca²⁺ e os libera sincronizadamente no sarcoplasma para disparar a contração muscular.',
    'Acoplamento excitação–contração via receptores de diidropiridina/rianodina seguido de recaptação ativa por bombas Ca²⁺-ATPase (SERCA) no relaxamento.',
    'Sem a remoção ativa de Ca²⁺ pela bomba SERCA (dependente de ATP), o músculo permanece contraído (mecanismo envolvido na fadiga severa e no rigor mortis).',
    [
      step(
        'Tríade muscular (1 Túbulo T + 2 Cisternas terminais)',
        'ACOPLAMENTO ELÉTRICO–QUÍMICO',
        'Na junção A–I de mamíferos, cada Túbulo T (ciano) é flanqueado por duas cisternas terminais verdes do retículo sarcoplasmático, formando a tríade que transmite o potencial de ação em milissegundos.',
        'muscle_sr_main', [0.85, 0.65, 4.6], 'muscle_triad'
      ),
      step(
        'Liberação de Ca²⁺ (Rianodina) e recaptação SERCA',
        'GATILHO QUÍMICO DA CONTRAÇÃO',
        'Canais de rianodina liberam uma nuvem imediata de íons Ca²⁺ sobre a troponina das miofibrilas; cessado o estímulo, bombas SERCA bombeiam o Ca²⁺ de volta com gasto de ATP para relaxar a fibra.',
        'muscle_sr_main', [0.78, 0.55, 4.1], 'muscle_sr'
      )
    ]
  ),

  muscle_mito: item(
    'Mitocôndrias alinhadas', '#e87c66',
    'Fileiras densas de mitocôndrias dispostas paralelamente entre as miofibrilas contráteis.',
    'Fornecem fluxo contínuo de ATP indispensável para o ciclo das cabeças de miosina e para a recaptação de cálcio.',
    'Respiração aeróbica intensa (ou fermentação lática complementar durante esforço explosivo).',
    'Fibras musculares vermelhas (resistência, ex.: maratonistas) têm altíssima densidade de mitocôndrias e mioglobina.',
    [
      step(
        'Abastecimento contínuo de ATP',
        'ENERGIA PARA O MOVIMENTO',
        'Posicionadas coladas aos sarcômeros, as mitocôndrias liberam pulsos de ATP diretamente onde a miosina consome energia mecânica.',
        'muscle_mito_main', [0.95, 0.65, 4.6], 'muscle_mito'
      )
    ]
  ),

  // =========================================================================
  // CÉLULA-TRONCO (PLURIPOTENTE INDIFERENCIADA)
  // =========================================================================
  stem_membrane: item(
    'Membrana e receptores de nicho', '#66e0f2',
    'Membrana esférica lisa enriquecida em receptores de fatores de crescimento e sinais do microambiente (nicho celular).',
    'Interpreta sinais externos que decidem entre autorrenovação (dividir-se mantendo-se célula-tronco) ou diferenciação.',
    'Vias de sinalização celular (Wnt, BMP, Notch) que reprogramam a expressão gênica nuclear.',
    'Em medicina regenerativa, fatores químicos específicos no meio de cultivo direcionam células-tronco para formar tecidos desejados.',
    [
      step(
        'Sensores moleculares do nicho',
        'SINALIZAÇÃO DE DESTINO',
        'Os receptores projetados na membrana captam sinais químicos do tecido vizinho, comandando se a célula permanecerá indiferenciada ou iniciará a especialização.',
        'stem_mem_main', [1.4, 1.4, 7.2], 'stem_receptors'
      )
    ]
  ),

  stem_nucleus: item(
    'Núcleo amplo com eucromatina aberta', '#9882f5',
    'Núcleo proporcionalmente gigantesco (~65% do volume celular) repleto de eucromatina frouxa e nucléolo proeminente.',
    'Mantém praticamente todos os genes acessíveis para leitura, conferindo plasticidade fenotípica máxima.',
    'Ativação de fatores de transcrição de pluripotência (Oct4, Sox2, Nanog) e intensa capacidade mitótica.',
    'A altíssima relação núcleo/citoplasma é uma assinatura visual marcante de células indiferenciadas e progenitoras.',
    [
      step(
        'Cromatina aberta e plasticidade gênica',
        'GENOMA PRONTO PARA ATIVAÇÃO',
        'No corte central, note como o núcleo ocupa a maior parte da célula: a eucromatina descompactada permite ligar diferentes conjuntos de genes conforme o tecido a ser formado.',
        'stem_nuc_main', [0.95, 0.85, 5.2], 'stem_nucleus'
      )
    ]
  ),

  stem_cytoplasm: item(
    'Citoplasma indiferenciado reduzido', '#7ce8f5',
    'Faixa citoplasmática delgada contendo apenas organelas básicas (ribossomos livres e poucas mitocôndrias jovens).',
    'Mantém baixo custo metabólico basal até que a célula se especialize em uma função específica.',
    'Metabolismo voltado à síntese de precursores para divisões celulares sucessivas.',
    'Ao se diferenciar em neurônio, miócito ou enterócito, o citoplasma expande-se drasticamente e ganha organelas especializadas.',
    [
      step(
        'Mínima especialização citoplasmática',
        'ESTADO PROGENITOR',
        'Diferente de um neurônio ou fibra muscular, a célula-tronco ainda não desenvolveu prolongamentos, sarcômeros nem grandes estoques secretores.',
        'stem_cyto_main', [1.2, 0.85, 5.2], 'stem_cyto'
      )
    ]
  ),

  stem_potency: item(
    'Potência de diferenciação celular', '#8effd8',
    'Representação didática do potencial pluripotente: a partir do mesmo DNA, a expressão diferencial de genes origina formatos radicalmente distintos.',
    'Permite o desenvolvimento embrionário completo e a regeneração de tecidos adultos (como medula óssea e pele).',
    'Regulação epigenética: silenciamento seletivo de genes não usados e ativação de programas específicos de tecido.',
    'Células-tronco hematopoiéticas da medula óssea renovam continuamente todas as hemácias, leucócitos e plaquetas do sangue.',
    [
      step(
        'Diferenciação em múltiplos tecidos (mesmo genoma)',
        'PLURIPOTÊNCIA · EXPRESSÃO GÊNICA',
        'Com exatamente o mesmo DNA, a ativação seletiva de conjuntos de genes remodela a célula-tronco em morfologias especializadas radicalmente distintas: neurônio, fibra muscular, hemácia bicôncava ou osteócito estrelado.',
        'stem_pot_main', [1.5, 1.5, 10.6], 'stem_differentiate'
      ),
      step(
        'Divisão assimétrica (autorrenovação × diferenciação)',
        'MANUTENÇÃO DO NICHO',
        'Na divisão assimétrica, uma célula-filha preserva o estado indiferenciado de célula-tronco no nicho (garantindo estoque vitalício), enquanto a outra torna-se progenitora comprometida com a renovação tecidual.',
        'stem_pot_main', [1.35, 1.35, 9.6], 'stem_asymmetric'
      )
    ]
  ),

  // =========================================================================
  // NEURÔNIO MULTIPOLAR (TECIDO NERVOSO)
  // =========================================================================
  neuron_soma: item(
    'Corpo celular (soma) e Nissl', '#9d86f2',
    'Região estrelada central contendo núcleo eucromático grande, nucléolo evidente e densos aglomerados de RER chamados corpúsculos de Nissl.',
    'Integra os sinais recebidos pelos dendritos e sintetiza proteínas, receptores e enzimas para neurotransmissores.',
    'Alta taxa metabólica de transcrição, tradução e transporte axonal ao longo do citoesqueleto.',
    'Por serem altamente especializados, neurônios maduros geralmente permanecem em fase G0 e não realizam mitose.',
    [
      step(
        'Centro metabólico e integração',
        'SOMA NEURONAL',
        'O núcleo ativo e os corpúsculos de Nissl (blocos azuis de RER) produzem continuamente proteínas que viajam pelo axônio até as sinapses.',
        'neuron_soma_main', [0.85, 0.85, 4.8], 'neuron_soma'
      )
    ]
  ),

  neuron_dendrites: item(
    'Dendritos ramificados', '#70f8ff',
    'Prolongamentos citoplasmáticos múltiplos, curtos e altamente ramificados que se projetam do corpo celular.',
    'Ampliam enormemente a superfície receptora, captando impulsos químicos de centenas a milhares de outros neurônios.',
    'Conversão de sinais químicos (neurotransmissores) em potenciais elétricos graduados direcionados ao soma.',
    'A formação e o fortalecimento de espinhas dendríticas são a base celular da memória e da aprendizagem (neuroplasticidade).',
    [
      step(
        'Captação de impulsos pelos dendritos',
        'ANTENAS RECEPTORAS',
        'Observe os sinais luminosos convergindo pelas ramificações dendríticas em direção ao corpo celular para disparar um novo potencial de ação.',
        'neuron_dend_main', [0.95, 0.9, 5.6], 'neuron_dendrites'
      )
    ]
  ),

  neuron_myelin: item(
    'Axônio, bainha de mielina e Ranvier', '#f2cf80',
    'Prolongamento único e longo envolto por segmentos lipídicos isolantes (bainha de mielina das células de Schwann/oligodendrócitos) separados pelos nódulos de Ranvier.',
    'Conduz o impulso nervoso a altíssima velocidade (até 120 m/s) por condução saltatória.',
    'Abertura sequencial de canais de Na⁺ e K⁺ concentrados apenas nos nódulos de Ranvier expostos.',
    'Doenças desmielinizantes como a esclerose múltipla comprometem o isolamento da mielina e lentificam a condução nervosa.',
    [
      step(
        'Bainha de mielina (células de Schwann / oligodendrócitos)',
        'ISOLAMENTO LIPÍDICO EM CAMADAS',
        'No sistema nervoso periférico, células de Schwann (note os núcleos roxos na face externa) enrolam múltiplas camadas concêntricas de membrana rica em lipídios ao redor do axônio, impedindo fuga de corrente.',
        'neuron_myelin_main', [0.6, 0.95, 6.2], 'neuron_myelin_wrap'
      ),
      step(
        'Condução saltatória nos nódulos de Ranvier (Nav1.6)',
        'ATÉ 120 m/s · ECONOMIA DE ATP',
        'Nos intervalos nus entre as bainhas (nódulos de Ranvier), acumulam-se canais de Na⁺ dependentes de voltagem (Nav1.6): o potencial de ação "salta" de nódulo em nódulo, multiplicando a velocidade e economizando ATP.',
        'neuron_myelin_main', [0.5, 0.88, 5.6], 'neuron_saltatory'
      )
    ]
  ),

  neuron_synapse: item(
    'Terminais axônicos e sinapse química', '#7dffcc',
    'Botões pré-sinápticos ricos em mitocôndrias, canais de Ca²⁺ dependentes de voltagem e vesículas sinápticas voltadas à membrana pós-sináptica com receptores.',
    'Converte o impulso elétrico em sinal químico (neurotransmissores) através da fenda sináptica (~20–30 nm) até o neurônio, músculo ou glândula seguinte.',
    'Despolarização → influxo de Ca²⁺ → fusão vesicular mediada por sinaptotagmina/SNARE → abertura de canais iônicos pós-sinápticos.',
    'Anestésicos, antidepressivos (ISRS) e toxinas como a botulínica (que cliva proteínas SNARE) atuam diretamente na maquinaria dessa sinapse.',
    [
      step(
        'Influxo de Ca²⁺ e exocitose vesicular (SNARE)',
        'ACOPLAMENTO ELÉTRICO–SECRETOR',
        'A chegada do potencial de ação abre canais de Ca²⁺ (dourados) no botão pré-sináptico; o cálcio ativa o complexo SNARE, fundindo vesículas sinápticas à membrana ativa.',
        'neuron_syn_main', [0.85, 0.72, 4.4], 'neuron_syn_ca'
      ),
      step(
        'Fenda sináptica e ligação aos receptores pós-sinápticos',
        'COMUNICAÇÃO QUÍMICA DIRECIONAL',
        'Os neurotransmissores (ciano-verde) difundem-se rapidamente pela fenda sináptica até os receptores dourados na membrana pós-sináptica curva, gerando um novo sinal excitatório ou inibitório.',
        'neuron_syn_main', [0.88, 0.75, 4.6], 'neuron_synapse'
      )
    ]
  ),

  // =========================================================================
  // OSTEÓCITO (TECIDO ÓSSEO / ESQUELÉTICO)
  // =========================================================================
  osteocyte_lacuna: item(
    'Lacuna e matriz óssea mineralizada', '#e6dcc5',
    'Cavidade esculpida no interior da matriz extracelular rígida composta por fibras de colágeno tipo I impregnadas por cristais de hidroxiapatita (fosfato de cálcio).',
    'Confere resistência mecânica ao esqueleto enquanto abriga e protege os osteócitos vivos em seu interior.',
    'Remodelação contínua equilibrando deposição mineral (osteoblastos) e reabsorção (osteoclastos).',
    'Apesar da aparência rígida, o osso é um tecido vivo altamente vascularizado e capaz de se regenerar após fraturas.',
    [
      step(
        'Célula viva em matriz rígida de hidroxiapatita',
        'TECIDO ÓSSEO',
        'O osteócito habita uma microcavidade (lacuna) cercada por lamelas concêntricas mineralizadas de cálcio e fosfato.',
        'osteo_lac_main', [1.4, 1.4, 7.6], 'osteo_lacuna'
      )
    ]
  ),

  osteocyte_body: item(
    'Corpo celular do osteócito', '#e8b268',
    'Osteoblasto maduro que ficou aprisionado na própria matriz que secretou, assumindo formato amendoado e estrelado.',
    'Mantém a viabilidade da matriz óssea local e atua como principal sensor de carga mecânica do esqueleto.',
    'Metabolismo de manutenção e sinalização parácrina de remodelação óssea.',
    'A morte maciça de osteócitos em uma região óssea desencadeia reabsorção local da matriz por osteoclastos.',
    [
      step(
        'Manutenção e controle da matriz',
        'CORPO ESTRELADO',
        'No centro da lacuna, o corpo celular preserva núcleo ativo e controla o equilíbrio local de sais minerais ao redor do tecido ósseo.',
        'osteo_body_main', [0.85, 0.75, 4.2], 'osteo_body'
      )
    ]
  ),

  osteocyte_processes: item(
    'Prolongamentos e canalículos ósseos', '#70f8ff',
    'Dezenas de finos prolongamentos citoplasmáticos (filopódios) que atravessam túneis microscópicos na matriz chamados canalículos.',
    'Conectam osteócitos vizinhos via junções comunicantes (gap junctions) para troca de nutrientes, Ca²⁺ e sinais de esforço mecânico.',
    'Mecanotransdução: percebem microdeformações do fluido nos canalículos durante exercícios físicos e estimulam o fortalecimento do osso.',
    'Atividades físicas de impacto ativam essa rede de canalículos, prevenindo a perda de massa óssea (osteoporose).',
    [
      step(
        'Rede de canalículos e mecanotransdução (fluxo de fluido)',
        'SENSOR DE CARGA MECÂNICA',
        'A cada impacto físico, o fluido intersticial desloca-se dentro dos microcanalículos provocando tensão de cisalhamento nos prolongamentos e no cílio primário, disparando ondas de Ca²⁺ que comandam o fortalecimento ósseo.',
        'osteo_proc_main', [1.1, 0.9, 5.4], 'osteo_canaliculi'
      ),
      step(
        'Junções comunicantes (Conexina 43) entre osteócitos',
        'SINALIZAÇÃO E NUTRIÇÃO NO OSSO',
        'Nas pontas dos prolongamentos, placas hexagonais de junções comunicantes (gap junctions de Conexina 43, ciano-verde) acoplam osteócitos vizinhos permitindo a difusão de nutrientes e sinais desde os vasos do canal de Havers.',
        'osteo_proc_main', [1.45, 0.72, 5.6], 'osteo_gap'
      )
    ]
  ),

  // =========================================================================
  // HEMÁCIA / ERITRÓCITO (TECIDO SANGUÍNEO)
  // =========================================================================
  rbc_membrane: item(
    'Membrana bicôncava flexível', '#e63e52',
    'Membrana plasmática moldada em disco bicôncavo (~7,5 μm) sustentada internamente por um citoesqueleto elástico de espectrina.',
    'Aumenta a relação superfície/volume para trocas gasosas ultrarrápidas e permite deformação ao passar por capilares finíssimos.',
    'Troca passiva de O₂ e CO₂ e transporte iônico (proteína banda 3) em equilíbrio osmótico.',
    'Na anemia falciforme, a mutação da hemoglobina deforma essa membrana em foice rígida, obstruindo pequenos vasos.',
    [
      step(
        'Disco bicôncavo e deformação capilar (~7,5 μm)',
        'ADAPTAÇÃO AO FLUXO SANGUÍNEO',
        'A geometria bicôncava (perfil Evans-Fung) eleva a razão superfície/volume em ~40% em relação a uma esfera e permite que a hemácia dobre-se ao atravessar capilares de apenas 3–4 μm.',
        'rbc_mem_main', [1.4, 1.8, 6.8], 'rbc_flex'
      ),
      step(
        'Rede cortical de Espectrina–Anquirina e Banda 3',
        'CITOESQUELETO ELÁSTICO SUBMEMBRANAR',
        'Abaixo da bicamada lipídica, uma malha triangular flexível de espectrina ancora-se às proteínas transmembrana Banda 3 (trocador Cl⁻/HCO₃⁻, ciano) via anquirina — garantindo memória elástica sem romper a membrana.',
        'rbc_mem_main', [1.15, 1.45, 5.2], 'rbc_spectrin'
      )
    ]
  ),

  rbc_anucleate: item(
    'Interior anucleado (sem núcleo/mitocôndrias)', '#ff9ec4',
    'Durante a maturação na medula óssea, eritrócitos de mamíferos expelem o núcleo e degradam suas mitocôndrias.',
    'Maximiza o espaço interno disponível para hemoglobina e evita que a própria hemácia consuma o O₂ que transporta.',
    'Obtém ATP exclusivamente por glicólise anaeróbica (fermentação lática) no citosol.',
    'Sem núcleo para renovar proteínas, cada hemácia vive cerca de 120 dias antes de ser reciclada no baço e no fígado.',
    [
      step(
        'Por que a hemácia não tem núcleo?',
        'ESPECIALIZAÇÃO EXTREMA',
        'A ausência de núcleo e mitocôndrias no centro bicôncavo libera espaço para cerca de 270 milhões de moléculas de hemoglobina e garante que todo o O₂ chegue íntegro aos tecidos.',
        'rbc_anuc_main', [0.85, 0.9, 4.4], 'rbc_anucleate'
      )
    ]
  ),

  rbc_hemoglobin: item(
    'Hemoglobina (grupos heme Fe²⁺ + O₂)', '#ffd25a',
    'Proteína quaternária formada por 4 cadeias polipeptídicas (2 α e 2 β), cada uma abrigando um grupo prostético heme com um átomo central de ferro (Fe²⁺).',
    'Liga-se reversivelmente a até 4 moléculas de O₂ nos pulmões (oxi-hemoglobina) e libera O₂ nos tecidos.',
    'Ligação cooperativa ao oxigênio modulada pelo pH e pela concentração de CO₂ (efeito Bohr).',
    'A deficiência de ferro reduz a produção de hemoglobina, causando anemia ferropriva e fadiga por menor oferta de O₂.',
    [
      step(
        'Captura reversível de O₂ no ferro (Fe²⁺)',
        'TRANSPORTE DE GASES',
        'No corte interno, observe os tetrâmeros de hemoglobina com seus 4 centros dourados de ferro (Fe²⁺) capturando e liberando moléculas de oxigênio (ciano).',
        'rbc_hb_main', [0.85, 0.75, 4.0], 'rbc_hemoglobin'
      )
    ]
  ),

  // =========================================================================
  // CÉLULA EPITELIAL INTESTINAL (ENTERÓCITO POLARIZADO)
  // =========================================================================
  epi_microvilli: item(
    'Microvilosidades (borda em escova)', '#68d8c2',
    'Dezenas de projeções digitiformes da membrana apical sustentadas por feixes internos de filamentos de actina.',
    'Multiplicam a área de superfície apical em cerca de 20 vezes para absorção eficiente de glicose, aminoácidos e água.',
    'Enzimas digestivas ancoradas na membrana apical acopladas a transportadores ativos (SGLT1) de nutrientes.',
    'Na doença celíaca, a inflamação achata essas microvilosidades e vilosidades intestinais, causando má absorção nutricional.',
    [
      step(
        'Borda em escova e absorção de nutrientes',
        'ESPECIALIZAÇÃO APICAL · ×20 ÁREA',
        'Observe os nutrientes dourados descendo entre as projeções da membrana apical: cada microvilosidade amplia drasticamente a capacidade de absorção do intestino.',
        'epi_villi_main', [0.95, 0.95, 4.4], 'epi_microvilli'
      )
    ]
  ),

  epi_junctions: item(
    'Junções oclusivas e desmossomos', '#ffe37d',
    'Cinturão apical de proteínas de vedação (junções oclusivas / tight junctions) somado a placas laterais de ancoragem mecânica (desmossomos).',
    'Vedam o espaço entre células vizinhas impedindo vazamento paracelular e mantêm o epitélio firmemente unido.',
    'Mantêm separadas as proteínas da face apical (lúmen intestinal) e da face basolateral (corrente sanguínea).',
    'Graças às junções oclusivas, os nutrientes precisam atravessar seletivamente a célula em vez de vazar livremente entre elas.',
    [
      step(
        'Vedação intercelular e coesão mecânica',
        'BARREIRA EPITELIAL',
        'O anel dourado superior (junção oclusiva) sela as células contra bactérias e vazamentos, enquanto os desmossomos rosados ancoram o citoesqueleto lateralmente.',
        'epi_junc_main', [1.15, 0.65, 4.4], 'epi_junctions'
      )
    ]
  ),

  epi_body: item(
    'Polaridade celular (núcleo basal e Golgi)', '#9884f0',
    'Célula colunar alta com nítida polaridade estrutural: núcleo oval deslocado para a base, Complexo de Golgi supranuclear e mitocôndrias abundantes.',
    'Organiza o transporte direcional (transcitose) de nutrientes do lúmen intestinal até os vasos sanguíneos na base.',
    'Absorção apical ativa, processamento lipídico/proteico interno e liberação basolateral.',
    'A polaridade apicobasal é característica essencial de todos os epitélios de revestimento e secreção.',
    [
      step(
        'Polaridade apicobasal: núcleo basal e Golgi supranuclear',
        'ARQUITETURA COLUNAR POLARIZADA',
        'O núcleo oval desloca-se para a base enquanto o Complexo de Golgi e fileiras de mitocôndrias ocupam a região supranuclear, alinhados ao fluxo direcional de nutrientes do intestino ao sangue.',
        'epi_body_main', [1.1, 0.65, 5.2], 'epi_polarity'
      ),
      step(
        'Absorção polarizada (SGLT1 apical → GLUT2 basolateral)',
        'TRANSPORTE DIRECIONAL DE NUTRIENTES',
        'Na borda em escova, cotransportadores SGLT1 captam glicose + Na⁺ do lúmen intestinal; no polo basolateral, transportadores GLUT2 e a bomba Na⁺/K⁺ entregam a glicose diretamente aos capilares abaixo da lâmina basal.',
        'epi_body_main', [1.2, 0.45, 5.6], 'epi_transcytosis'
      )
    ]
  ),

  epi_basal: item(
    'Lâmina basal (membrana basal)', '#c79ef0',
    'Malha acelular densa de colágeno tipo IV e laminina sobre a qual repousa a base das células epiteliais.',
    'Ancora o epitélio ao tecido conjuntivo subjacente, atua como filtro molecular e orienta a regeneração tecidual.',
    'Troca de nutrientes e gases por difusão a partir dos capilares do tecido conjuntivo (epitélios são avasculares).',
    'A invasão da lâmina basal por células tumorais epiteliais marca a transição de um carcinoma in situ para um tumor invasivo.',
    [
      step(
        'Ancoragem e suporte do epitélio',
        'MATRIZ DE SUPORTE BASAL',
        'Todas as células epiteliais apoiam-se sobre esta malha fibrosa proteica que separa e conecta o epitélio aos vasos sanguíneos abaixo.',
        'epi_basal_main', [1.1, 0.65, 4.8], 'epi_basal'
      )
    ]
  ),

  // =========================================================================
  // GALERIA & 10 TIPOS DE VÍRUS (ACELULARES)
  // =========================================================================
  v_hiv: item(
    'HIV', '#b3388f',
    'Retrovírus envelopado esférico revestido por espículas triméricas gp120/gp41 (cabeça azulada em cogumelo), abrigando internamente um capsídeo cônico (p24) com duas fitas de RNA e a enzima transcriptase reversa.',
    'Infecta linfócitos T CD4⁺ e macrófagos, convertendo seu RNA viral em DNA dupla-fita (provírus) que se integra ao genoma humano.',
    'Retrotranscrição (RNA → DNA via transcriptase reversa) e integração genômica mediada pela integrase viral.',
    'A terapia antirretroviral combinada (TARV) bloqueia enzimas virais específicas e permite carga viral indetectável e vida normal.',
    [
      step(
        'HIV · Retrovírus envelopado (gp120 e capsídeo cônico)',
        'RETROVIRIDAE · LENTIVIRUS',
        'Observe as espículas triméricas azuladas que se ligam ao receptor CD4 humano e o característico capsídeo cônico interno contendo o genoma diploide de RNA.',
        'v_hiv_main', [0.85, 0.7, 4.4], 'v_hiv'
      )
    ]
  ),

  v_hbv: item(
    'HBV (Hepatite B)', '#f29b42',
    'Partícula esférica envelopada (partícula de Dane) densamente cravejada por rosetas do antígeno de superfície HBsAg, contendo capsídeo icosaédrico interno (HBcAg) com DNA circular parcialmente dupla-fita.',
    'Infecta especificamente hepatócitos (células do fígado), estabelecendo um minicromossomo viral (cccDNA) no núcleo celular.',
    'Replicação única entre vírus de DNA: transcreve um RNA pré-genômico que depois é convertido novamente em DNA por transcriptase reversa.',
    'A vacina recombinante contra Hepatite B utiliza exatamente a proteína HBsAg purificada da superfície para induzir imunidade duradoura.',
    [
      step(
        'HBV · Superfície cravejada de antígenos HBsAg',
        'HEPADNAVIRIDAE · HEPATITE B',
        'A textura nodular alaranjada corresponde aos complexos lipoproteicos de HBsAg — o principal marcador sorológico diagnosticado em exames de sangue.',
        'v_hbv_main', [0.85, 0.7, 4.4], 'v_hbv'
      )
    ]
  ),

  v_ebola: item(
    'Ebolavírus', '#e62e6b',
    'Filovírus envelopado de formato filamentoso sinuoso e longo, frequentemente curvado em gancho ("cajado de pastor") ou anel, com glicoproteínas GP na membrana e nucleocapsídeo helicoidal interno de RNA.',
    'Entra em células endoteliais, dendríticas e macrófagos por macropinocitose após reconhecimento das glicoproteínas GP.',
    'Transcrição e replicação de RNA fita simples de polaridade negativa (ssRNA−) no citoplasma da célula hospedeira.',
    'Sua morfologia filamentosa flexível permite comprimentos superiores a 1 µm — gigantesca em comparação a vírus esféricos comuns.',
    [
      step(
        'Ebolavírus · Filovírus filamentoso em "cajado"',
        'FILOVIRIDAE · ssRNA(−)',
        'Diferente de vírus esféricos, o Ebolavírus forma longos filamentos maleáveis cujo envelope carmesim envolve o nucleocapsídeo helicoidal de RNA.',
        'v_ebola_main', [0.75, 0.65, 4.8], 'v_ebola'
      )
    ]
  ),

  v_adeno: item(
    'Adenovírus', '#2d93eb',
    'Vírus NÃO envelopado (nu) com capsídeo icosaédrico simétrico de 20 faces triangulares e 12 fibras proteicas projetadas dos vértices (pentons), terminadas em botões globulares de adesão.',
    'Os botões na ponta das 12 fibras ancoram-se a receptores respiratórios ou oculares, desencadeando endocitose e entrega do dsDNA linear ao núcleo.',
    'Replicação nuclear de DNA dupla-fita linear utilizando DNA polimerase própria do vírus.',
    'Por não ter envelope lipídico, resiste bem ao ambiente; versões modificadas e seguras servem como vetores em vacinas e terapia gênica.',
    [
      step(
        'Adenovírus · Icosaedro nu com 12 fibras nos vértices',
        'ADENOVIRIDAE · dsDNA',
        'Observe a geometria cristalina de 20 faces triangulares e as 12 antenas de fibra nos vértices com botões esverdeados responsáveis pela ligação à célula-alvo.',
        'v_adeno_main', [0.95, 0.75, 4.6], 'v_adeno'
      )
    ]
  ),

  v_influenza: item(
    'Influenza (Gripe)', '#2989c9',
    'Vírus envelopado com duas espículas glicoproteicas distintas na superfície — Hemaglutinina (HA, azul) e Neuraminidase (NA, rosa-coral em cogumelo) — e genoma dividido em 8 segmentos de RNA.',
    'A Hemaglutinina liga-se ao ácido siálico das células respiratórias para invadi-las; a Neuraminidase cliva esse açúcar para liberar novos vírus.',
    'A segmentação em 8 fitas de RNA permite rearranjo genético quando dois subtipos infectam a mesma célula (origem de cepas H1N1, H3N2).',
    'Antivirais como o oseltamivir inibem especificamente a enzima Neuraminidase (NA), impedindo a saída de novas partículas virais.',
    [
      step(
        'Influenza · Espículas HA (azul) e NA (rosa-coral)',
        'ORTHOMYXOVIRIDAE · RNA SEGMENTADO',
        'Distinga os dois tipos de projeções no envelope: bastões azuis de Hemaglutinina (entrada) e cogumelos corais de Neuraminidase (liberação viral).',
        'v_influenza_main', [0.85, 0.7, 4.4], 'v_influenza'
      )
    ]
  ),

  v_lyssa: item(
    'Lyssavirus (Raiva)', '#38c78b',
    'Rhabdovírus envelopado com inconfundível formato de projétil ("bala"): extremidade superior arredondada, base plana, superfície coberta por espículas G e ribonucleoproteína helicoidal compactada no interior.',
    'Liga-se a receptores neuromusculares e viaja por transporte axonal retrógrado ao longo dos neurônios até o sistema nervoso central.',
    'Replicação citoplasmática de ssRNA de sentido negativo, formando inclusões características chamadas corpúsculos de Negri.',
    'A vacinação antirrábica de cães, gatos e protocolos pós-exposição humanos é a medida definitiva de prevenção contra a raiva.',
    [
      step(
        'Lyssavirus · Formato característico de projétil',
        'RHABDOVIRIDAE · NEUROTROPISMO',
        'O formato de "bala" esmeralda resulta do empacotamento compacto da ribonucleoproteína helicoidal interna sob o envelope lipídico com espículas G.',
        'v_lyssa_main', [0.95, 0.7, 4.5], 'v_lyssa'
      )
    ]
  ),

  v_phage: item(
    'Bacteriófago T4', '#e02828',
    'Vírus complexo não envelopado (Myoviridae): cabeça icosaédrica rubi com dsDNA linear NU (~169 kb, sem histonas, compactado com Mg²⁺/poliaminas), colar, bainha helicoidal contrátil azul em corte, tubo interno rígido oco (gp19), placa basal hexagonal e 6 fibras articuladas.',
    'Cabeça, colar e tubo interno oco descem em bloco enquanto a bainha externa se contrai sem abrir lacuna no topo, perfurando a bactéria e injetando o fio contínuo de DNA nu sob ~60 atm de pressão.',
    'Pode seguir ciclo lítico (multiplicação rápida e lise da bactéria) ou, em fagos temperados, ciclo lisogênico (integração como profago).',
    'A fagoterapia estuda o uso clínico de bacteriófagos para combater infecções por bactérias multirresistentes a antibióticos.',
    [
      step(
        'Bacteriófago T4 · Tubo oco (gp19) e injeção de DNA nu',
        'VÍRUS COMPLEXO · SEM HISTONAS (~60 ATM)',
        'Observe o fio contínuo de dsDNA nu (sem histonas!) descendo pelo interior oco do tubo interno azul enquanto o conjunto cabeça + colar + tubo avança como pistão e a bainha helicoidal contrai-se ancorada na placa basal.',
        'v_phage_main', [1.1, 0.55, 4.9], 'v_phage'
      )
    ]
  ),

  v_hpv: item(
    'HPV (Papilomavírus)', '#2b78c9',
    'Vírus NÃO envelopado altamente simétrico cujo capsídeo esférico é formado por 72 capsômeros pentaméricos da proteína L1 (padrão de estrelas azuis com miolo dourado) abrigando dsDNA circular.',
    'Infecta células basais de epitélios cutâneos e mucosos, estimulando a proliferação celular para replicar seu DNA circular.',
    'Os tipos de alto risco oncogênico expressam proteínas E6 e E7 que interferem no controle do ciclo celular (p53 e pRb).',
    'A vacina contra o HPV utiliza partículas semelhantes a vírus (VLPs) feitas apenas da proteína L1 — sem DNA viral — garantindo altíssima proteção.',
    [
      step(
        'HPV · 72 capsômeros pentaméricos em roseta (L1)',
        'PAPILLOMAVIRIDAE · dsDNA CIRCULAR',
        'Cada roseta estrelada azul e dourada é um pentâmero da proteína L1: juntas, montam uma couraça proteica rígida sem envelope lipídico.',
        'v_hpv_main', [0.85, 0.7, 4.4], 'v_hpv'
      )
    ]
  ),

  v_rota: item(
    'Rotavírus', '#6dc44b',
    'Vírus NÃO envelopado de tripla camada proteica com poros radiais que lhe conferem aparência de roda ("rota" em latim) e 60 espículas avermelhadas (VP4), guardando 11 segmentos de dsRNA.',
    'Invade enterócitos maduros do intestino delgado após ativação proteolítica das espículas VP4 pelas enzimas digestivas.',
    'Replicação dos 11 segmentos de RNA dupla-fita ocorre dentro do próprio capsídeo interno sem expor o dsRNA às defesas celulares.',
    'Sua tripla camada proteica resiste ao ácido do estômago; a vacina oral infantil reduziu drasticamente internações por gastroenterite.',
    [
      step(
        'Rotavírus · Capsídeo em "roda" e espículas VP4',
        'REOVIRIDAE · TRIPLA CAMADA PROTEICA',
        'Note os poros circulares na camada esverdeada externa (VP7) e as espículas carmesins (VP4) que medeiam a entrada nos enterócitos.',
        'v_rota_main', [0.85, 0.7, 4.4], 'v_rota'
      )
    ]
  ),

  v_herpes: item(
    'Herpesvírus', '#3896e0',
    'Grande vírus envelopado azul-oceano coberto por longas espículas cônicas de glicoproteínas, camada intermediária amorfa de tegumento proteico e capsídeo icosaédrico interno com dsDNA linear.',
    'Funde seu envelope diretamente com a membrana celular e transporta o capsídeo até os poros nucleares para liberar o dsDNA no núcleo.',
    'Capacidade marcante de estabelecer latência vitalícia em neurônios sensoriais ou linfócitos, reativando-se sob queda de imunidade.',
    'A família Herpesviridae inclui os vírus do herpes simples (HSV-1/2), catapora/herpes-zóster (VZV) e Epstein-Barr (EBV).',
    [
      step(
        'Herpesvírus · Longas espículas cônicas e tegumento',
        'HERPESVIRIDAE · LATÊNCIA VIRAL',
        'Sob o envelope cravejado de projeções cônicas encontra-se o tegumento proteico envolvendo o grande capsídeo icosaédrico de DNA.',
        'v_herpes_main', [0.9, 0.72, 4.5], 'v_herpes'
      )
    ]
  ),

  // =========================================================================
  // 9 FORMATOS & ARRANJOS BACTERIANOS VISTOS AO MICROSCÓPIO
  // =========================================================================
  b_cocci: item(
    '1. Cocos (Esferas)', '#b668ff',
    'Bactérias de formato esférico ou ovalado, isoladas, com parede celular resistente de peptidoglicano e camada capsular hidratada.',
    'A geometria esférica reduz a razão superfície/volume, conferindo maior tolerância à dessecação ambiental.',
    'Divisão celular por fissão binária com separação completa das células-filhas após a formação do septo.',
    'Micrococcus luteus (presente na pele e no ar) é um exemplo clássico de cocos isolados e em tétrades.',
    [
      step(
        'Cocos · Morfologia esférica isolada',
        'MORFOLOGIA BACTERIANA · 1/9',
        'Bactérias esféricas que se separam completamente após a divisão celular, exibindo parede espessa e halo gelatinoso capsular.',
        'b_cocci_main', [0.8, 0.65, 4.3], 'b_cocci'
      )
    ]
  ),

  b_diplococci: item(
    '2. Diplococos (Pares)', '#c270ff',
    'Pares de bactérias esféricas ou reniformes que permanecem aderidas face a face após a fissão binária em um único plano, frequentemente envoltas por cápsula comum.',
    'A cápsula polissacarídica compartilhada protege o par contra a fagocitose pelas células de defesa.',
    'Fissão binária em plano único com retenção parcial da parede septal entre as duas células irmãs.',
    'Exemplos médicos importantes incluem Streptococcus pneumoniae (pneumonia) e Neisseria meningitidis (meningite).',
    [
      step(
        'Diplococos · Pares unidos por septo e cápsula',
        'MORFOLOGIA BACTERIANA · 2/9',
        'Observe o par de cocos ligeiramente achatados na face de contato, compartilhando um septo luminoso e um envoltório capsular translúcido.',
        'b_diplococci_main', [0.8, 0.65, 4.2], 'b_diplococci'
      )
    ]
  ),

  b_streptococci: item(
    '3. Estreptococos (Cadeias)', '#c475ff',
    'Longas cadeias flexíveis ("colares de pérolas") formadas por cocos alinhados que não se soltam após divisões repetidas sempre no mesmo eixo.',
    'O arranjo filamentoso em cadeia facilita a aderência a mucosas e a formação de colônias organizadas.',
    'Divisões consecutivas em plano paralelo único mantêm as paredes conectadas em sequência linear.',
    'Inclui tanto patógenos como Streptococcus pyogenes (faringite) quanto espécies benéficas usadas em iogurtes (S. thermophilus).',
    [
      step(
        'Estreptococos · Cadeias em colar de pérolas',
        'MORFOLOGIA BACTERIANA · 3/9',
        'Quando os cocos se dividem repetidamente no mesmo plano sem se desprender, formam estas cadeias curvadas e maleáveis.',
        'b_streptococci_main', [0.85, 0.65, 4.5], 'b_streptococci'
      )
    ]
  ),

  b_staphylococci: item(
    '4. Estafilococos (Cachos)', '#c970ff',
    'Aglomerados tridimensionais densos e irregulares semelhantes a cachos de uva, envoltos por matriz extracelular gelatinosa.',
    'A organização em cachos compactos favorece a proteção coletiva em biofilmes sobre pele e superfícies.',
    'Divisão celular em múltiplos planos aleatórios (X, Y e Z) mantendo forte coesão entre as células-filhas.',
    'Staphylococcus aureus habita pele e fossas nasais e é um modelo clássico em microbiologia clínica e resistência antimicrobiana.',
    [
      step(
        'Estafilococos · Cachos tridimensionais tipo uva',
        'MORFOLOGIA BACTERIANA · 4/9',
        'Diferente das cadeias lineares, divisões em planos aleatórios geram este cacho compacto protegido por uma fina película de biofilme.',
        'b_staphylococci_main', [0.85, 0.7, 4.4], 'b_staphylococci'
      )
    ]
  ),

  b_bacilli: item(
    '5. Bacilos (Bastonetes)', '#58c8ff',
    'Células procarióticas cilíndricas em formato de bastonete com polos arredondados, podendo ser isoladas ou agrupadas livremente.',
    'A maior razão superfície/volume dos bastonetes otimiza a absorção rápida de nutrientes em meios líquidos e intestinais.',
    'Alongamento longitudinal guiado por proteínas MreB antes da septação transversal no centro da célula.',
    'Escherichia coli (microbiota intestinal e pesquisa genética) e Lactobacillus (fermentação lática) são bacilos clássicos.',
    [
      step(
        'Bacilos · Bastonetes cilíndricos alongados',
        'MORFOLOGIA BACTERIANA · 5/9',
        'Bastonetes suaves e encapsulados cuja forma alongada aumenta a área de troca com o meio para absorção eficiente de nutrientes.',
        'b_bacilli_main', [0.85, 0.65, 4.4], 'b_bacilli'
      )
    ]
  ),

  b_streptobacilli: item(
    '6. Estreptobacilos (Fila)', '#8b7dff',
    'Cadeias lineares articuladas formadas por bacilos ligados extremidade com extremidade após a divisão transversal.',
    'A disposição em fila contínua cria filamentos estáveis em fluidos e biofilmes microbianos.',
    'Fissão binária estritamente transversal ao eixo longo do bastonete com permanência dos septos polares.',
    'Gêneros como Streptobacillus e certas espécies de Bacillus formam longas filas características em preparações coradas.',
    [
      step(
        'Estreptobacilos · Bacilos alinhados em fila',
        'MORFOLOGIA BACTERIANA · 6/9',
        'Bastonetes que permanecem conectados ponta a ponta pelos septos transversais, formando um filamento articulado contínuo.',
        'b_streptobacilli_main', [0.85, 0.65, 4.6], 'b_streptobacilli'
      )
    ]
  ),

  b_vibrio: item(
    '7. Vibriões (Vírgula)', '#d470ff',
    'Bastonetes curtos e nitidamente encurvados em formato de vírgula (arco suave), equipados com flagelo polar único de alta velocidade.',
    'A curvatura hidrodinâmica somada ao flagelo polar garante deslocamento veloz em ambientes aquáticos e mucosos.',
    'Quimiotaxia ativa e natação direcionada em águas estuarinas, marinhas ou doces contaminadas.',
    'Vibrio cholerae (agente causador da cólera) e Vibrio fischeri (bactéria bioluminescente marinha) possuem esta morfologia.',
    [
      step(
        'Vibriões · Formato de vírgula com flagelo polar',
        'MORFOLOGIA BACTERIANA · 7/9',
        'Observe o corpo em arco suave impulsionado pelo batimento rotatório do flagelo inserido em uma das extremidades.',
        'b_vibrio_main', [0.85, 0.65, 4.5], 'b_vibrio'
      )
    ]
  ),

  b_spirilla: item(
    '8. Espirilos (Espiral rígida)', '#8d74ff',
    'Bactérias helicoidais relativamente espessas e de parede RÍGIDA, dotadas de tufos de flagelos externos em um ou ambos os polos.',
    'A hélice rígida gira em torno de seu eixo como um propulsor naval, vencendo correntes e viscosidade em ambientes aquáticos.',
    'Rotação coordenada dos tufos flagelares polares (anfitríquios) alimentada por gradiente de prótons (H⁺).',
    'Spirillum volutans e Campylobacter jejuni exemplificam organismos espiralados de estrutura celular rígida.',
    [
      step(
        'Espirilos · Hélice rígida com tufos flagelares',
        'MORFOLOGIA BACTERIANA · 8/9',
        'Diferente das espiroquetas flexíveis, os espirilos possuem parede rígida e tufos de flagelos externos nas pontas que giram todo o corpo.',
        'b_spirilla_main', [0.85, 0.65, 4.7], 'b_spirilla'
      )
    ]
  ),

  b_spirochetes: item(
    '9. Espiroquetas (Saca-rolhas)', '#cc78ff',
    'Bactérias espiraladas extremamente finas, longas e FLEXÍVEIS em saca-rolhas, dotadas de endoflagelos (filamento axial) internos dentro do espaço periplasmático.',
    'A contração helicoidal gerada pelo filamento axial interno permite "perfurar" mucos espessos e tecidos onde flagelos externos travariam.',
    'Rotação dos endoflagelos internos sob a membrana externa produz movimento ondulatório tipo saca-rolhas.',
    'Inclui Treponema pallidum (sífilis), Borrelia burgdorferi (doença de Lyme) e Leptospira interrogans (leptospirose).',
    [
      step(
        'Espiroquetas · Saca-rolhas flexível com endoflagelo',
        'MORFOLOGIA BACTERIANA · 9/9',
        'Através da bainha externa translúcida vê-se o filamento axial luminoso (endoflagelo) que faz toda a espiral fina girar e flexionar.',
        'b_spirochetes_main', [0.85, 0.65, 4.7], 'b_spirochetes'
      )
    ]
  )
};
