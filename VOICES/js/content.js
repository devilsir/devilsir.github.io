/* VOICES: content original. Historical records have named sources. */
window.V = window.V || {};
V.content = {
  "characters": {
    "nia": {
      "name": "Nia",
      "role": "Programadora e investigadora",
      "quote": "Arquivo sem fonte? Meu detector de cilada apitou.",
      "accent": "#27C8D8"
    },
    "leo": {
      "name": "Leo",
      "role": "Investigador das perguntas boas",
      "quote": "Essa pista é pequena. A pergunta que ela abre, nem tanto.",
      "accent": "#F4B85A"
    },
    "taina": {
      "name": "Tainá",
      "role": "Documentarista indígena da cidade",
      "quote": "Eu conto minha história. Cada povo tem muitas outras.",
      "accent": "#74D59D"
    },
    "sol": {
      "name": "Sol",
      "role": "Produtora musical e artista",
      "quote": "Meu beat tem grave. Meu cartaz tem crédito.",
      "accent": "#E96687"
    },
    "pix": {
      "name": "PIX",
      "role": "Tradutor, scanner e fã de tomadas",
      "quote": "Bateria: 92%. Curiosidade: valor fora da escala.",
      "accent": "#9AABFF"
    },
    "curator": {
      "name": "Mara",
      "role": "Curadora do museu",
      "quote": "Uma vitrine mostra escolhas. Vamos examinar quais.",
      "accent": "#F4B85A"
    },
    "librarian": {
      "name": "Davi",
      "role": "Bibliotecário e guardião das fontes",
      "quote": "Fonte, data, contexto. A senha da investigação.",
      "accent": "#74D59D"
    },
    "scientist": {
      "name": "Dra. Luma",
      "role": "Pesquisadora e mentora do laboratório",
      "quote": "Uma conclusão forte suporta perguntas.",
      "accent": "#27C8D8"
    },
    "journalist": {
      "name": "Ravi",
      "role": "Jornalista da Rádio Harmonia",
      "quote": "Um post pode chegar rápido. A apuração tem que chegar junto.",
      "accent": "#E96687"
    },
    "resident": {
      "name": "Jo",
      "role": "Moradora e articuladora comunitária",
      "quote": "Perguntar como eu participo é um bom começo.",
      "accent": "#F4B85A"
    },
    "student": {
      "name": "Bia",
      "role": "Estudante e inventora do clube",
      "quote": "Se ninguém pergunta, a gente pergunta.",
      "accent": "#9AABFF"
    },
    "musician": {
      "name": "Lia",
      "role": "Musicista e organizadora do festival",
      "quote": "História também faz parte da apresentação.",
      "accent": "#E96687"
    }
  },
  "chapters": [
    {
      "id": 1,
      "title": "Rhythm District",
      "name": "Distrito do Ritmo",
      "subtitle": "O palco acende. Os créditos sumiram.",
      "color": "#E96687",
      "minigame": "beat",
      "boss": {
        "id": "djglitch",
        "name": "DJ GLITCH",
        "tip": "Observe os pulsos, desvie dos ruídos e use as três pistas quando o núcleo abrir.",
        "logic": "Popularidade não apaga autoria. Uma produção nova precisa reconhecer pessoas, contextos e contribuições."
      },
      "intro": [
        {
          "speaker": "sol",
          "en": {
            "6": "The stage is ready. The names are missing.",
            "7": "The festival poster lost the artists’ names last night.",
            "8": "Although the stage is ready, the corrupted poster hides the people behind the music."
          },
          "pt": "O palco está pronto, mas o cartaz perdeu os nomes de quem fez a música."
        },
        {
          "speaker": "nia",
          "en": {
            "6": "Let’s find the credits.",
            "7": "Who made the music? Let’s follow the evidence.",
            "8": "We need more than a catchy beat: we need evidence about its creators and context."
          },
          "pt": "Vamos investigar os créditos, quem criou as músicas e o contexto cultural."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "I hear a beat. I do not hear a beet.",
            "7": "A beat is a rhythm. A beet is a vegetable.",
            "8": "Translation complete: beat means a musical pulse here. My vegetable detector can rest."
          },
          "pt": "Beat aqui é batida musical. Beet é beterraba. Meu detector de salada já pode descansar."
        }
      ],
      "resolution": [
        {
          "speaker": "musician",
          "en": {
            "6": "The names are back. Thank you!",
            "7": "We restored the names and added cultural notes.",
            "8": "The poster now identifies the creators and explains the cultural references, so audiences can learn more."
          },
          "pt": "Os nomes voltaram e o cartaz explica as referências culturais."
        },
        {
          "speaker": "sol",
          "en": {
            "6": "Our new music has clear credits.",
            "7": "We made a new game track, not a traditional performance.",
            "8": "Our original game track accompanies the festival; it does not claim to reproduce an authentic tradition."
          },
          "pt": "A trilha original do jogo acompanha o festival. Ela não se apresenta como execução autêntica de uma tradição."
        },
        {
          "speaker": "nia",
          "en": {
            "6": "A strange file points to the museum.",
            "7": "The missing credits came from the city archive.",
            "8": "The same archive error affects the museum, so our next investigation begins there."
          },
          "pt": "O mesmo erro do arquivo da cidade chegou ao museu. É nossa próxima investigação."
        }
      ],
      "npcs": [
        {
          "character": "musician",
          "name": "Lia — organizadora do festival",
          "lines": [
            {
              "speaker": "musician",
              "en": {
                "6": "Music has people and stories.",
                "7": "The poster kept the sound but removed the people.",
                "8": "When a poster removes creators and context, listeners lose part of the story."
              },
              "pt": "O cartaz manteve o som e apagou pessoas e contexto. Música também tem história."
            },
            {
              "speaker": "musician",
              "en": {
                "6": "Look at the mural and the small archive.",
                "7": "You can find three clues near the mural, the shop and the archive.",
                "8": "Compare the three records near the mural, shop and archive before repairing the stage."
              },
              "pt": "Compare as três pistas do mural, da loja e do arquivo antes de reparar o palco."
            }
          ],
          "choice": {
            "prompt": "Como o festival vai apresentar suas referências?",
            "options": [
              {
                "label": "Criar um painel de contexto cultural",
                "flag": "c1_context_panel",
                "reply": {
                  "speaker": "musician",
                  "en": {
                    "6": "The panel explains the references.",
                    "7": "We will place the panel beside the stage.",
                    "8": "A panel beside the stage can explain the references without replacing the creators’ own voices."
                  },
                  "pt": "Um painel ao lado do palco vai contextualizar as referências e abrir espaço para as vozes de quem participa."
                }
              },
              {
                "label": "Destacar criadores no programa do festival",
                "flag": "c1_artist_program",
                "reply": {
                  "speaker": "musician",
                  "en": {
                    "6": "The program shows the creators.",
                    "7": "We will add the creators and their roles to the program.",
                    "8": "The program can make authorship visible; the cultural notes will accompany it."
                  },
                  "pt": "O programa vai destacar criadores e funções, acompanhado das notas culturais."
                }
              }
            ]
          }
        },
        {
          "character": "sol",
          "name": "Sol — mesa de produção",
          "lines": [
            {
              "speaker": "sol",
              "en": {
                "6": "Different traditions have different stories.",
                "7": "Samba de roda and capoeira have different histories and practices.",
                "8": "Both connect to Afro-Brazilian histories, but we should not reduce them to one sound or one practice."
              },
              "pt": "Samba de roda e capoeira têm práticas e histórias próprias. Não vamos reduzir tudo a um som só."
            },
            {
              "speaker": "sol",
              "en": {
                "6": "Help me repair the beat machine.",
                "7": "Let’s use the repaired machine to make our own track.",
                "8": "Once we repair the controller, we can compose an original track with clearly labelled references."
              },
              "pt": "Conserte a mesa para criar uma faixa original com referências bem identificadas."
            }
          ],
          "choice": {
            "prompt": "Que detalhe entra na apresentação de Sol?",
            "options": [
              {
                "label": "Dar crédito à equipe de criação",
                "flag": "c1_creator_credit",
                "reply": {
                  "speaker": "sol",
                  "en": {
                    "6": "Names, roles and thanks. Ready!",
                    "7": "I added every creator and their role.",
                    "8": "I added the creators and their roles because a team’s work deserves accurate attribution."
                  },
                  "pt": "Vou incluir nomes e funções da equipe. Crédito faz parte da produção."
                }
              },
              {
                "label": "Explicar que a trilha do jogo é original",
                "flag": "c1_original_music",
                "reply": {
                  "speaker": "sol",
                  "en": {
                    "6": "New track. Clear label. Let’s go!",
                    "7": "I labelled the track as original game music.",
                    "8": "The label distinguishes our original game music from the cultural practices discussed in the archive."
                  },
                  "pt": "A etiqueta identifica a trilha como música original do jogo e distingue as práticas citadas no arquivo."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c1_samba",
          "title": "Arquivo: samba de roda",
          "en": {
            "6": "Samba de roda brings music, dance and poetry together.",
            "7": "Samba de roda developed in the Recôncavo of Bahia and brings music, dance and poetry together.",
            "8": "Samba de roda connects music, dance and poetry in the Recôncavo of Bahia; its communities keep the practice alive."
          },
          "pt": "O samba de roda reúne música, dança e poesia no Recôncavo Baiano. Comunidades transmitem e recriam essa prática viva.",
          "source": "samba_iphan",
          "word": "rhythm",
          "icon": "music"
        },
        {
          "id": "c1_capoeira",
          "title": "Arquivo: roda de capoeira",
          "en": {
            "6": "Capoeira is an Afro-Brazilian cultural practice.",
            "7": "Capoeira combines movement and music in an Afro-Brazilian cultural practice.",
            "8": "Capoeira combines movement, music and shared learning; its cultural history is broader than a fighting move."
          },
          "pt": "A capoeira é uma prática cultural afro-brasileira que articula movimento, música e aprendizagem entre participantes.",
          "source": "capoeira_unesco",
          "word": "heritage",
          "icon": "music"
        },
        {
          "id": "c1_credit",
          "title": "Ficha ficcional: quem faz o festival",
          "en": {
            "6": "This festival card shows names and roles.",
            "7": "The festival card listed the creators before the glitch removed their names.",
            "8": "The restored fictional card identifies creators and cultural references, because a sound alone does not explain its history."
          },
          "pt": "Nesta ficha ficcional, nomes e funções identificam quem fez o festival. As referências culturais precisam de contexto, além do som.",
          "source": "samba_iphan",
          "word": "credit",
          "icon": "card"
        }
      ],
      "takeaway": "Um festival pode divertir e reconhecer criadores, comunidades e contextos culturais ao mesmo tempo.",
      "objective": "Converse com Lia e Sol, reúna três pistas, repare a mesa de ritmo e restaure os créditos."
    },
    {
      "id": 2,
      "title": "The Forgotten Museum",
      "name": "Museu das Memórias",
      "subtitle": "O continente é enorme. A vitrine ficou pequena.",
      "color": "#F4B85A",
      "minigame": "timeline",
      "boss": {
        "id": "eraser",
        "name": "THE ERASER",
        "tip": "As faixas de apagamento avisam antes de passar. Proteja as pistas e reconstrua os registros.",
        "logic": "Uma vitrine parcial não representa um continente inteiro. Compare datas, regiões e fontes."
      },
      "intro": [
        {
          "speaker": "curator",
          "en": {
            "6": "This museum has missing pages.",
            "7": "The first gallery lost many African histories.",
            "8": "The gallery now begins with enslavement, so it erases earlier societies and many other histories."
          },
          "pt": "A galeria começa pela escravização e apaga sociedades anteriores e muitas outras histórias africanas."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "Africa has many peoples and histories.",
            "7": "Mali, Songhai and Kongo existed in different places and periods.",
            "8": "Mali, Songhai and Kongo belong to different regional histories; one label cannot explain all of Africa."
          },
          "pt": "Mali, Songhai e Kongo pertencem a histórias regionais diferentes. Uma etiqueta não explica toda a África."
        },
        {
          "speaker": "leo",
          "en": {
            "6": "Let’s check places and dates.",
            "7": "We will compare dates and locations before repairing the timeline.",
            "8": "A chronological list is useful, but we must also keep each event’s location and context visible."
          },
          "pt": "Vamos organizar datas mantendo os lugares e contextos visíveis."
        }
      ],
      "resolution": [
        {
          "speaker": "curator",
          "en": {
            "6": "The panels are back. The story is wider.",
            "7": "We restored three regional panels and repaired the dates.",
            "8": "The repaired gallery presents specific African societies alongside later events, rather than treating them as one story."
          },
          "pt": "A galeria agora apresenta sociedades africanas específicas e eventos posteriores, sem transformá-los em uma história única."
        },
        {
          "speaker": "leo",
          "en": {
            "6": "These dates are clues, not the whole story.",
            "7": "Six events cannot show every history of Africa or Brazil.",
            "8": "This small timeline is a selection for comparison; its gaps are a reason to investigate further."
          },
          "pt": "Esta linha do tempo é uma seleção para comparar. As lacunas convidam a continuar investigando."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "New signal: the laboratory.",
            "7": "The restored archive points to a laboratory with missing names.",
            "8": "A second attribution error appears in the laboratory, so let’s follow that signal."
          },
          "pt": "Um novo erro de autoria apareceu no laboratório. Vamos seguir o sinal."
        }
      ],
      "npcs": [
        {
          "character": "curator",
          "name": "Mara — curadora",
          "lines": [
            {
              "speaker": "curator",
              "en": {
                "6": "A museum chooses what to show.",
                "7": "Someone removed the older panels and shortened the labels.",
                "8": "An exhibition is a selection of records; we need to examine what it includes and what it leaves out."
              },
              "pt": "Uma exposição seleciona registros. Precisamos examinar o que ela inclui e o que deixa de fora."
            },
            {
              "speaker": "curator",
              "en": {
                "6": "Check the map with the timeline.",
                "7": "Do not place Kongo in the same region as Mali.",
                "8": "Keep the map beside the timeline: Kongo is in Central Africa, while Mali and Songhai are in West Africa."
              },
              "pt": "Mantenha o mapa ao lado das datas: Kongo fica na África Central; Mali e Songhai, na África Ocidental."
            }
          ],
          "choice": {
            "prompt": "Qual apoio você quer destacar na nova galeria?",
            "options": [
              {
                "label": "Mapa com lugares e regiões",
                "flag": "c2_regional_map",
                "reply": {
                  "speaker": "curator",
                  "en": {
                    "6": "The map shows different regions.",
                    "7": "I added regional labels to the gallery map.",
                    "8": "Regional labels prevent a single timeline from suggesting that every society occupied the same place."
                  },
                  "pt": "O mapa vai destacar regiões e impedir que a cronologia pareça a história de um único lugar."
                }
              },
              {
                "label": "Etiquetas com datas e fontes",
                "flag": "c2_source_labels",
                "reply": {
                  "speaker": "curator",
                  "en": {
                    "6": "Every card has a date and a source.",
                    "7": "I added dates and source names to the panels.",
                    "8": "Readers can inspect dates and source names, then ask what other records might add."
                  },
                  "pt": "As etiquetas vão mostrar datas e fontes para que o público possa conferir e fazer novas perguntas."
                }
              }
            ]
          }
        },
        {
          "character": "librarian",
          "name": "Davi — sala de registros",
          "lines": [
            {
              "speaker": "librarian",
              "en": {
                "6": "People keep memory in many ways.",
                "7": "We found written records, art and oral traditions.",
                "8": "Written documents, material objects and oral traditions can contribute different evidence; historians compare them."
              },
              "pt": "Documentos escritos, objetos e tradições orais oferecem evidências diferentes. Historiadores as comparam."
            },
            {
              "speaker": "librarian",
              "en": {
                "6": "A small side record discusses abolition.",
                "7": "You can read a short record about abolition or focus on the regional panels.",
                "8": "The optional side record discusses legal abolition and continuing barriers without showing violence."
              },
              "pt": "Um registro lateral opcional aborda abolição legal e barreiras persistentes, sem imagens de violência."
            }
          ],
          "choice": {
            "prompt": "O que consultar primeiro?",
            "options": [
              {
                "label": "Explorar as sociedades e os registros africanos",
                "flag": "c2_regional_first",
                "reply": {
                  "speaker": "librarian",
                  "en": {
                    "6": "Let’s read the three regional records.",
                    "7": "Start with the Mali, Songhai and Kongo records.",
                    "8": "The regional records restore histories erased by the faulty exhibition; you can return to the side record later."
                  },
                  "pt": "Comece pelos registros de Mali, Songhai e Kongo. O registro lateral continua disponível."
                }
              },
              {
                "label": "Ler o registro contextual da abolição",
                "flag": "c2_abolition_context",
                "reply": {
                  "speaker": "librarian",
                  "en": {
                    "6": "The Atlantic trade forced African people to the Americas. This record also shows Brazil’s law of 1888.",
                    "7": "The Atlantic trade forced African people to the Americas. The 1888 law ended legal slavery in Brazil.",
                    "8": "The Atlantic trade forced African people to the Americas; although legal slavery ended in Brazil in 1888, social barriers remained."
                  },
                  "pt": "No tráfico atlântico, pessoas africanas foram levadas à força para as Américas. Resistências e lutas por liberdade enfrentaram a escravização. No Brasil, a lei de 1888 extinguiu legalmente a escravidão; barreiras sociais persistiram."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c2_mali",
          "title": "Mali — África Ocidental",
          "en": {
            "6": "This record shows Mali and Mansa Musa’s journey in 1324.",
            "7": "Mansa Musa, ruler of Mali, made a pilgrimage to Mecca in 1324.",
            "8": "Mansa Musa’s 1324 pilgrimage connected Mali to wider networks; Mali’s history also includes trade, cities and scholarship."
          },
          "pt": "Mansa Musa, governante do Mali, realizou uma peregrinação a Meca em 1324. Esse registro se relaciona a redes de comércio, cidades e estudos.",
          "source": "mali_met",
          "word": "history",
          "icon": "map"
        },
        {
          "id": "c2_songhai",
          "title": "Songhai — África Ocidental",
          "en": {
            "6": "Sonni Ali’s reign starts in 1464 on this timeline.",
            "7": "Sonni Ali began his reign in 1464 in the history of Songhai.",
            "8": "The beginning of Sonni Ali’s reign in 1464 is one marker in Songhai’s political history, linked to regional trade networks."
          },
          "pt": "O início do reinado de Sonni Ali, em 1464, é um marco na história política de Songhai, ligada a redes comerciais regionais.",
          "source": "songhai_unesco",
          "word": "timeline",
          "icon": "scroll"
        },
        {
          "id": "c2_kongo",
          "title": "Kongo — África Central",
          "en": {
            "6": "Kongo has its own history. This card marks contact in 1483.",
            "7": "In the museum’s chronology, Diogo Cão reached the Congo River’s mouth in 1483.",
            "8": "The 1483 contact with Portugal concerns an existing Central African society; it does not mark the beginning of Kongo’s history."
          },
          "pt": "Na cronologia usada pelo museu, Diogo Cão chegou à foz do Congo em 1483. O contato com Portugal ocorreu com sociedades já existentes; não iniciou a história de Kongo.",
          "source": "kongo_met",
          "word": "source",
          "icon": "map"
        }
      ],
      "sensitiveRecord": {
        "id": "c2_optional_abolition",
        "title": "Registro contextual: Brasil, 1888",
        "en": {
          "6": "The Atlantic trade forced African people to the Americas. This record also shows Brazil’s law of 1888.",
          "7": "The Atlantic trade forced African people to the Americas. The 1888 law ended legal slavery in Brazil.",
          "8": "The Atlantic trade forced African people to the Americas; although legal slavery ended in Brazil in 1888, social barriers remained."
        },
        "pt": "No tráfico atlântico, pessoas africanas foram levadas à força para as Américas. Resistências e lutas por liberdade enfrentaram a escravização. No Brasil, a Lei nº 3.353, de 13 de maio de 1888, extinguiu legalmente a escravidão. O fim legal não eliminou as barreiras sociais. Esse registro não inclui imagens de violência nem transforma sofrimento em desafio.",
        "source": "abolition_law",
        "optIn": true,
        "contextSources": [
          "routes_unesco",
          "reboucas_an"
        ]
      },
      "takeaway": "Sociedades africanas têm histórias diversas. Datas ajudam a comparar eventos; mapas e fontes evitam generalizações.",
      "objective": "Leia as três vitrines, converse com Mara e Davi e reconstrua a cronologia com datas e lugares."
    },
    {
      "id": 3,
      "title": "Hidden Geniuses",
      "name": "Talentos em Evidência",
      "subtitle": "O projeto funciona. A autoria está corrompida.",
      "color": "#27C8D8",
      "minigame": "evidence",
      "boss": {
        "id": "copycat",
        "name": "COPYCAT",
        "tip": "Desvie das cópias, acompanhe o original e conecte cada conjunto de evidências à pessoa certa.",
        "logic": "Semelhança não prova autoria. Uma atribuição precisa corresponder a registros verificáveis."
      },
      "intro": [
        {
          "speaker": "scientist",
          "en": {
            "6": "The labels mix up three people.",
            "7": "The exhibition mixed up a mathematician, a writer and an engineer.",
            "8": "The machines still work, but the corrupted labels confuse the people behind different contributions."
          },
          "pt": "As máquinas funcionam, mas as etiquetas misturam contribuições de uma matemática, uma escritora e um engenheiro."
        },
        {
          "speaker": "leo",
          "en": {
            "6": "Which clues support each name?",
            "7": "Who checked the flight calculations? Who wrote the book?",
            "8": "We should match documented contributions to names without inventing achievements or quotations."
          },
          "pt": "Vamos ligar contribuições documentadas aos nomes, sem inventar feitos ou citações."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "I am a robot. I do not invent biographies.",
            "7": "I checked my scanner. It finds sources, not magical biographies.",
            "8": "My scanner can organise records, but people must still evaluate what those records support."
          },
          "pt": "Meu scanner organiza registros. As pessoas ainda precisam avaliar o que eles sustentam."
        }
      ],
      "resolution": [
        {
          "speaker": "scientist",
          "en": {
            "6": "Three names. Three clear records.",
            "7": "We matched the contributions and restored the labels.",
            "8": "The exhibition now credits different kinds of work accurately, from mathematics to writing and engineering."
          },
          "pt": "A exposição atribui corretamente diferentes trabalhos: matemática, escrita e engenharia."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "A famous name is not the only voice.",
            "7": "We can keep looking for people missing from other records.",
            "8": "These profiles widen the exhibition, but a few celebrated people cannot represent every overlooked contribution."
          },
          "pt": "Os perfis ampliam a exposição. Algumas pessoas famosas não representam todas as contribuições apagadas."
        },
        {
          "speaker": "nia",
          "en": {
            "6": "The glitch now spreads through posts.",
            "7": "The next signal comes from the city’s message network.",
            "8": "The same error is spreading through the message network; we need to inspect how claims travel."
          },
          "pt": "O erro está se espalhando na rede de mensagens. Precisamos investigar como as afirmações circulam."
        }
      ],
      "npcs": [
        {
          "character": "scientist",
          "name": "Dra. Luma — bancada do laboratório",
          "lines": [
            {
              "speaker": "scientist",
              "en": {
                "6": "A clue supports a specific claim.",
                "7": "A notebook about flight maths is not evidence about every invention.",
                "8": "A record supports a particular conclusion; we must not turn a documented contribution into an unsupported invention."
              },
              "pt": "Uma pista sustenta uma conclusão específica. Não podemos transformá-la em uma invenção sem comprovação."
            },
            {
              "speaker": "scientist",
              "en": {
                "6": "Read all three documents in each folder.",
                "7": "The correct name matches the whole folder, not one familiar word.",
                "8": "Compare all three document summaries before choosing an attribution; a familiar word alone is weaker evidence."
              },
              "pt": "Compare os três resumos da pasta. Uma palavra familiar sozinha não decide a autoria."
            }
          ],
          "choice": {
            "prompt": "Como você vai revisar as etiquetas?",
            "options": [
              {
                "label": "Conferir as três pistas de cada pasta",
                "flag": "c3_compare_documents",
                "reply": {
                  "speaker": "scientist",
                  "en": {
                    "6": "Three clues. One supported match.",
                    "7": "I grouped the three summaries for your comparison.",
                    "8": "Grouping the summaries helps you compare their support for a specific conclusion."
                  },
                  "pt": "As três pistas de cada pasta ficam juntas para comparar a conclusão que elas sustentam."
                }
              },
              {
                "label": "Explicar por que a atribuição é sustentada",
                "flag": "c3_explain_attribution",
                "reply": {
                  "speaker": "scientist",
                  "en": {
                    "6": "A name needs a reason.",
                    "7": "We will add a short explanation beside each name.",
                    "8": "A short explanation makes the connection between record and attribution visible to other readers."
                  },
                  "pt": "Cada nome terá uma explicação breve ligando contribuição e registro."
                }
              }
            ]
          }
        },
        {
          "character": "librarian",
          "name": "Davi — arquivo de autoria",
          "lines": [
            {
              "speaker": "librarian",
              "en": {
                "6": "Not every important work is a machine.",
                "7": "Writers, engineers and mathematicians contributed in different ways.",
                "8": "A writer’s work is not less valuable because it is not a machine; an exhibition can recognise different contributions."
              },
              "pt": "Escritores, engenheiros e matemáticos contribuem de maneiras diferentes. Uma obra não precisa ser uma máquina para ter valor."
            },
            {
              "speaker": "librarian",
              "en": {
                "6": "These cards are summaries, not quotations.",
                "7": "We wrote the cards from institutional sources.",
                "8": "The cards summarise institutional sources; they do not put invented words into historical people’s mouths."
              },
              "pt": "As fichas resumem fontes institucionais. Não colocam frases inventadas na boca de pessoas históricas."
            }
          ],
          "choice": {
            "prompt": "O que destacar na exposição revisada?",
            "options": [
              {
                "label": "Diferentes formas de conhecimento",
                "flag": "c3_many_knowledge",
                "reply": {
                  "speaker": "librarian",
                  "en": {
                    "6": "Books and calculations both matter.",
                    "7": "We will connect books, calculations and engineering plans.",
                    "8": "The display will connect different forms of knowledge while keeping their contributions distinct."
                  },
                  "pt": "A exposição aproxima escrita, cálculos e projetos de engenharia, mantendo as contribuições distintas."
                }
              },
              {
                "label": "Autoria acompanhada de fonte",
                "flag": "c3_traceable_credit",
                "reply": {
                  "speaker": "librarian",
                  "en": {
                    "6": "Every name has a source.",
                    "7": "We will show the source beside each profile.",
                    "8": "Readers can trace the attribution to a source instead of accepting a label simply because it looks official."
                  },
                  "pt": "O público poderá seguir a atribuição até a fonte, além de confiar na aparência de uma etiqueta."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c3_johnson",
          "title": "Katherine Johnson — matemática",
          "en": {
            "6": "This card is about Katherine Johnson and space maths.",
            "7": "Katherine Johnson checked the flight calculations for John Glenn’s orbital mission in 1962.",
            "8": "Although electronic computers calculated the orbit, Katherine Johnson checked their results before John Glenn’s 1962 flight."
          },
          "pt": "Katherine Johnson foi uma matemática. Em 1962, verificou os cálculos para a missão orbital de John Glenn.",
          "source": "johnson_nasa",
          "word": "mathematics",
          "icon": "star"
        },
        {
          "id": "c3_carolina",
          "title": "Carolina Maria de Jesus — escritora",
          "en": {
            "6": "This card shows a writer and her book, published in 1960.",
            "7": "Carolina Maria de Jesus wrote Quarto de despejo, published in 1960.",
            "8": "Carolina Maria de Jesus’s Quarto de despejo was published in 1960; her literary work deserves accurate authorship."
          },
          "pt": "Carolina Maria de Jesus escreveu Quarto de despejo, publicado em 1960. Sua produção inclui escrita literária, poesia e composição.",
          "source": "carolina_an",
          "word": "writer",
          "icon": "book"
        },
        {
          "id": "c3_reboucas",
          "title": "André Rebouças — engenheiro",
          "en": {
            "6": "This card shows an engineer and his public work.",
            "7": "André Rebouças worked on port projects and took part in the abolitionist movement.",
            "8": "André Rebouças combined engineering work with abolitionist activity and argued for conditions for life after freedom."
          },
          "pt": "André Rebouças foi um engenheiro negro, trabalhou em obras portuárias e participou do movimento abolicionista. Também defendia condições de subsistência após a liberdade.",
          "source": "reboucas_an",
          "word": "engineer",
          "icon": "tool"
        }
      ],
      "takeaway": "Reconhecer contribuições exige relacionar nomes, trabalhos e fontes. História da ciência também envolve equipes e diferentes conhecimentos.",
      "objective": "Inspecione as três fichas, compare as pastas do laboratório e devolva os créditos corretos."
    },
    {
      "id": 4,
      "title": "The Bias Network",
      "name": "Rede sob Investigação",
      "subtitle": "O post corre. O contexto precisa acompanhar.",
      "color": "#9AABFF",
      "minigame": "bias",
      "boss": {
        "id": "clickbait",
        "name": "CLICKBAIT",
        "tip": "As manchetes piscam para distrair. Observe a origem, a data e o contexto antes de liberar a correção.",
        "logic": "Um post popular não vira evidência só por circular. Identifique o tipo de problema e responda ao que os registros sustentam."
      },
      "intro": [
        {
          "speaker": "journalist",
          "en": {
            "6": "The network spreads broken messages.",
            "7": "Some posts lost dates. Others generalised whole communities.",
            "8": "The network mixes inaccurate claims, stereotypes and discrimination; we need to distinguish their effects."
          },
          "pt": "A rede mistura informações incorretas, estereótipos e discriminação. Precisamos distinguir cada problema."
        },
        {
          "speaker": "nia",
          "en": {
            "6": "Let’s check before we share.",
            "7": "We should check the source before sharing a post.",
            "8": "Before sharing, inspect the source, date and context; then consider what the claim does to people."
          },
          "pt": "Antes de compartilhar, confira fonte, data e contexto e pense no efeito da afirmação sobre as pessoas."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "A disagreement is not always discrimination.",
            "7": "People can disagree about a song without denying anyone’s rights.",
            "8": "A difference in musical taste is not equivalent to excluding someone because of race; context matters."
          },
          "pt": "Discordar sobre uma música não equivale a excluir alguém por raça. O contexto importa."
        }
      ],
      "resolution": [
        {
          "speaker": "journalist",
          "en": {
            "6": "The corrected posts show context.",
            "7": "We restored dates, added sources and flagged discriminatory access rules.",
            "8": "Each correction addresses the identified problem instead of calling every disagreement the same thing."
          },
          "pt": "As correções respondem a cada problema: datas, fontes, generalizações e critérios discriminatórios."
        },
        {
          "speaker": "student",
          "en": {
            "6": "I can ask for help.",
            "7": "I learned to save a record and ask a trusted adult for help.",
            "8": "When a post targets someone, support and trusted adult involvement can matter more than winning an argument online."
          },
          "pt": "Quando alguém é alvo de um post, acolhimento e ajuda de um adulto de confiança podem importar mais que vencer uma discussão online."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "New message: the community centre.",
            "7": "The next mission comes from the community centre.",
            "8": "Residents have sent invitations to discuss access, so our investigation moves from screens to the neighbourhood."
          },
          "pt": "Moradores convidaram a equipe para discutir acesso no centro comunitário."
        }
      ],
      "npcs": [
        {
          "character": "journalist",
          "name": "Ravi — estação de apuração",
          "lines": [
            {
              "speaker": "journalist",
              "en": {
                "6": "A bright title is not a source.",
                "7": "The loudest headline did not include its date.",
                "8": "A headline can draw attention while hiding the information needed to assess its claim."
              },
              "pt": "Uma manchete chamativa pode esconder dados necessários para avaliar a afirmação."
            },
            {
              "speaker": "journalist",
              "en": {
                "6": "Ask: who, when, where and why?",
                "7": "Who posted it? When? What was removed?",
                "8": "Ask who produced the post, when it appeared, what context was removed and which evidence supports it."
              },
              "pt": "Pergunte quem produziu, quando publicou, que contexto retirou e qual evidência sustenta o post."
            }
          ],
          "choice": {
            "prompt": "Qual recurso acompanhará as correções?",
            "options": [
              {
                "label": "Mostrar fontes e datas",
                "flag": "c4_sources_dates",
                "reply": {
                  "speaker": "journalist",
                  "en": {
                    "6": "Sources and dates stay visible.",
                    "7": "I added source and date fields to the correction cards.",
                    "8": "Visible source and date fields help readers inspect the claim without depending on our authority alone."
                  },
                  "pt": "As correções mostram fontes e datas para o leitor conferir."
                }
              },
              {
                "label": "Explicar o contexto que faltava",
                "flag": "c4_restore_context",
                "reply": {
                  "speaker": "journalist",
                  "en": {
                    "6": "The full context is here.",
                    "7": "I added a short note about the missing context.",
                    "8": "The note explains why the removed context changes the claim, while preserving the original record for review."
                  },
                  "pt": "Uma nota explica como o contexto retirado muda a interpretação e preserva o registro para revisão."
                }
              }
            ]
          }
        },
        {
          "character": "student",
          "name": "Bia — clube de estudantes",
          "lines": [
            {
              "speaker": "student",
              "en": {
                "6": "We can support people and ask for help.",
                "7": "One club rule excluded a student because of skin colour.",
                "8": "The fictional club’s race-based exclusion is discriminatory; it needs support for the student and a change to the rule."
              },
              "pt": "A regra ficcional do clube excluiu uma estudante pela cor da pele. É discriminação: exige apoio à estudante e mudança no critério."
            },
            {
              "speaker": "student",
              "en": {
                "6": "We do not need to share personal stories here.",
                "7": "We can discuss the fictional cases without exposing classmates.",
                "8": "We can analyse these fictional records without asking anyone to prove or recount a personal experience."
              },
              "pt": "Podemos analisar casos ficcionais sem pedir relatos pessoais ou expor colegas."
            }
          ],
          "choice": {
            "prompt": "Como o clube vai encaminhar o caso?",
            "options": [
              {
                "label": "Acolher a estudante e envolver a escola",
                "flag": "c4_support_student",
                "reply": {
                  "speaker": "student",
                  "en": {
                    "6": "Support first. A trusted adult can help.",
                    "7": "We will support the student and involve a trusted school adult.",
                    "8": "Support and responsible adult involvement can help address the discriminatory rule without exposing the student online."
                  },
                  "pt": "O clube vai acolher a estudante e procurar um adulto de confiança da escola, evitando exposição online."
                }
              },
              {
                "label": "Registrar a regra e pedir sua revisão",
                "flag": "c4_review_rule",
                "reply": {
                  "speaker": "student",
                  "en": {
                    "6": "We save the rule and ask for change.",
                    "7": "We will preserve the record and request a review with adult support.",
                    "8": "Preserving the record helps a supported request for review; responsibility should not fall only on the excluded student."
                  },
                  "pt": "O clube vai guardar o registro e pedir revisão com apoio de adultos. A responsabilidade não fica só com a estudante excluída."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c4_racism",
          "title": "Direitos: discriminação racial",
          "en": {
            "6": "A race-based exclusion denies fair access.",
            "7": "The fictional club excluded a student because of skin colour: this is racial discrimination.",
            "8": "Race-based exclusion is discriminatory; it differs from a disagreement about taste and requires a response to denied access."
          },
          "pt": "Excluir uma pessoa por cor ou raça é discriminação racial. Não é uma simples diferença de gosto. Os casos desta rede são ficcionais.",
          "source": "racism_unicef",
          "word": "rights",
          "icon": "shield"
        },
        {
          "id": "c4_stereotype",
          "title": "Pista: cuidado com generalizações",
          "en": {
            "6": "One person is not a whole people.",
            "7": "A post claimed that every Indigenous people lived in the same way.",
            "8": "The post treats diverse peoples as identical; different voices and contemporary information challenge its stereotype."
          },
          "pt": "Um post ficcional tratou povos indígenas diversos como idênticos. Diferentes vozes e informações atuais ajudam a questionar esse estereótipo.",
          "source": "indigenous_ibge",
          "word": "stereotype",
          "icon": "eye"
        },
        {
          "id": "c4_context",
          "title": "Apuração: a data foi cortada",
          "en": {
            "6": "Read the date and the full message.",
            "7": "An old festival notice lost its date and looked current.",
            "8": "The cropped fictional notice looks current, but restoring the date changes its meaning; we cannot infer the sender’s intention from this alone."
          },
          "pt": "Um aviso antigo ficcional perdeu a data e pareceu atual. Repor data e contexto corrige a informação. Isso, sozinho, não prova intenção de enganar.",
          "source": "media_unesco",
          "word": "context",
          "icon": "search"
        }
      ],
      "takeaway": "Investigue a afirmação e seu efeito: discriminação, estereótipo, informação incorreta e opinião não são categorias equivalentes.",
      "objective": "Converse na rede, reúna os três registros e corrija quatro posts com contexto e apoio às pessoas."
    },
    {
      "id": 5,
      "title": "One City, Many Voices",
      "name": "Uma Cidade, Muitas Vozes",
      "subtitle": "Participar não deveria exigir atravessar barreiras.",
      "color": "#74D59D",
      "minigame": "city",
      "boss": {
        "id": "wall",
        "name": "THE WALL",
        "tip": "As barreiras acendem antes de fechar. Use o mapa de acesso e as prioridades da comunidade para abrir caminhos.",
        "logic": "Convite não basta quando o acesso é desigual. Ouça quem participa, remova barreiras e acompanhe o resultado."
      },
      "intro": [
        {
          "speaker": "resident",
          "en": {
            "6": "Our centre needs better access.",
            "7": "The centre had a festival, but some residents could not take part.",
            "8": "A festival can welcome everyone in words while leaving practical barriers to participation."
          },
          "pt": "O centro convidou todos para o festival, mas ainda havia barreiras práticas à participação."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "Ask people what they need.",
            "7": "Residents described different needs. We should listen before building.",
            "8": "Community members can identify different barriers; we need their participation before choosing projects."
          },
          "pt": "Moradores podem identificar barreiras diferentes. Precisamos de sua participação antes de escolher projetos."
        },
        {
          "speaker": "leo",
          "en": {
            "6": "We have a budget and several projects.",
            "7": "We cannot fund every project at once, so let’s compare priorities.",
            "8": "A limited budget requires choices, but every first step also needs maintenance and a plan for unmet needs."
          },
          "pt": "O orçamento é limitado. Cada primeiro passo precisa de manutenção e de um plano para necessidades ainda não atendidas."
        }
      ],
      "resolution": [
        {
          "speaker": "resident",
          "en": {
            "6": "The first projects are ready. We keep checking.",
            "7": "We built the first projects and agreed to review them with residents.",
            "8": "The first projects remove some barriers; residents will monitor results and identify what still needs work."
          },
          "pt": "Os primeiros projetos removem algumas barreiras. Moradores acompanharão os resultados e o que ainda precisa mudar."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "Many peoples live in the present.",
            "7": "Our exhibition includes contemporary Indigenous voices.",
            "8": "Contemporary Indigenous voices belong in the city’s cultural life; they are not confined to an imagined past."
          },
          "pt": "Vozes indígenas contemporâneas fazem parte da vida cultural. Elas não pertencem apenas a um passado imaginado."
        },
        {
          "speaker": "nia",
          "en": {
            "6": "Now we can inspect the main archive.",
            "7": "Our access records unlock the city’s main archive.",
            "8": "The restored records now reveal how BIAS.EXE selected its data, so we can inspect the system itself."
          },
          "pt": "Os registros revelam como BIAS.EXE selecionou seus dados. Agora podemos investigar o arquivo principal."
        }
      ],
      "npcs": [
        {
          "character": "resident",
          "name": "Jo — centro comunitário",
          "lines": [
            {
              "speaker": "resident",
              "en": {
                "6": "A step and a long trip can block access.",
                "7": "Residents reported barriers in the entrance and travel routes.",
                "8": "In this fictional neighbourhood, the entrance and travel routes create different barriers; projects must respond to residents’ priorities."
              },
              "pt": "Neste bairro ficcional, a entrada e os trajetos criam barreiras diferentes. Os projetos precisam responder às prioridades dos moradores."
            },
            {
              "speaker": "resident",
              "en": {
                "6": "Ask us before choosing.",
                "7": "We want to help choose and review the projects.",
                "8": "Residents need a voice in priorities and review; the city should not treat them only as recipients of help."
              },
              "pt": "Moradores querem participar das prioridades e da revisão. A cidade não deve tratá-los apenas como quem recebe ajuda."
            }
          ],
          "choice": {
            "prompt": "Como a comunidade vai acompanhar os projetos?",
            "options": [
              {
                "label": "Realizar uma roda de avaliação",
                "flag": "c5_feedback_circle",
                "reply": {
                  "speaker": "resident",
                  "en": {
                    "6": "We meet and share feedback.",
                    "7": "We will meet to discuss access after the first projects open.",
                    "8": "An accessible review meeting can show who benefited and which barriers remain."
                  },
                  "pt": "Uma reunião acessível vai mostrar quem conseguiu participar e quais barreiras continuam."
                }
              },
              {
                "label": "Criar um registro público de necessidades",
                "flag": "c5_public_needs",
                "reply": {
                  "speaker": "resident",
                  "en": {
                    "6": "We record needs and next steps.",
                    "7": "We will list needs, priorities and follow-up dates.",
                    "8": "A public record can make unfinished needs and follow-up dates visible, with personal information protected."
                  },
                  "pt": "Um registro público vai mostrar necessidades, prioridades e datas de acompanhamento, preservando dados pessoais."
                }
              }
            ]
          }
        },
        {
          "character": "taina",
          "name": "Tainá — oficina de memória",
          "lines": [
            {
              "speaker": "taina",
              "en": {
                "6": "Indigenous people are here today.",
                "7": "Different Indigenous peoples live in different settings today.",
                "8": "Indigenous peoples have diverse contemporary lives, including within and outside Indigenous territories."
              },
              "pt": "Povos indígenas têm vidas contemporâneas diversas, dentro e fora de Terras Indígenas."
            },
            {
              "speaker": "taina",
              "en": {
                "6": "My story is one story. Ask before recording.",
                "7": "My story does not stand for every people. Ask permission before recording.",
                "8": "I can share my experience, but it does not represent every people; recording and publication need consent."
              },
              "pt": "Posso compartilhar minha experiência, mas ela não representa todos os povos. Gravação e publicação precisam de consentimento."
            }
          ],
          "choice": {
            "prompt": "Como montar a mostra de memória?",
            "options": [
              {
                "label": "Convidar diferentes pessoas para decidir a mostra",
                "flag": "c5_shared_exhibition",
                "reply": {
                  "speaker": "taina",
                  "en": {
                    "6": "We choose the display together.",
                    "7": "Participants will help choose what the display includes.",
                    "8": "Participants can help decide the display and how they are represented rather than just supplying material."
                  },
                  "pt": "Participantes vão ajudar a decidir a mostra e sua representação, além de fornecer material."
                }
              },
              {
                "label": "Pedir autorização e identificar cada relato",
                "flag": "c5_consent_records",
                "reply": {
                  "speaker": "taina",
                  "en": {
                    "6": "Ask first. Credit each speaker.",
                    "7": "We will request permission and identify each account’s speaker.",
                    "8": "Permission and clear attribution preserve the distinction between a personal account and a claim about every community."
                  },
                  "pt": "Vamos pedir autorização e identificar cada relato, distinguindo experiência pessoal de afirmações sobre todas as comunidades."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c5_indigenous",
          "title": "Presente: muitos povos indígenas",
          "en": {
            "6": "Indigenous peoples have different languages and ways of life.",
            "7": "The census shows Indigenous people living within and outside Indigenous territories.",
            "8": "Contemporary census records show diverse Indigenous peoples, languages and settings; one fictional character cannot represent them all."
          },
          "pt": "O Censo registra povos indígenas contemporâneos, línguas e modos de vida diversos, dentro e fora de Terras Indígenas. Tainá é uma personagem ficcional, não uma representante de todos esses povos.",
          "source": "indigenous_ibge",
          "word": "community",
          "icon": "map"
        },
        {
          "id": "c5_access",
          "title": "Mapa ficcional: caminhos de participação",
          "en": {
            "6": "An invitation needs an accessible route.",
            "7": "Residents marked barriers before the city selected projects.",
            "8": "The fictional access map connects residents’ reports to projects; choosing a project is a first step, not proof that every barrier disappeared."
          },
          "pt": "No mapa ficcional, relatos dos moradores orientam projetos. Fazer uma escolha inicia um trabalho; não prova que todas as barreiras desapareceram.",
          "source": "school_unicef",
          "word": "access",
          "icon": "route"
        },
        {
          "id": "c5_participation",
          "title": "Ata ficcional: decidir e revisar",
          "en": {
            "6": "People help decide and review the plan.",
            "7": "Residents asked to take part in decisions and later reviews.",
            "8": "Community participation helps identify priorities and review practices, while public institutions remain responsible for their actions."
          },
          "pt": "Na ata ficcional, a comunidade participa das prioridades e da revisão. As instituições continuam responsáveis por suas ações.",
          "source": "school_unicef",
          "word": "review",
          "icon": "people"
        }
      ],
      "takeaway": "Escuta, acesso e acompanhamento fazem parte da participação. Projetos podem melhorar a cidade sem resolver tudo de uma vez.",
      "objective": "Investigue as barreiras, ouça os moradores e escolha projetos dentro do orçamento, com acompanhamento."
    },
    {
      "id": 6,
      "title": "Reboot the Story",
      "name": "Reinicie a História",
      "subtitle": "O erro está nos dados. E nas decisões sobre eles.",
      "color": "#7145CB",
      "minigame": "final",
      "boss": {
        "id": "bias",
        "name": "BIAS.EXE",
        "tip": "Repare os três núcleos: fontes, representação e revisão. Desvie dos pulsos e use evidências quando cada núcleo abrir.",
        "logic": "Os dados já continham exclusões. Corrigir o programa exige registros melhores, participação e responsabilidade humana contínua."
      },
      "intro": [
        {
          "speaker": "nia",
          "en": {
            "6": "The archive has missing voices.",
            "7": "BIAS.EXE learned from records that already excluded people.",
            "8": "BIAS.EXE reproduced patterns in incomplete records; the program did not create every exclusion on its own."
          },
          "pt": "BIAS.EXE reproduziu padrões de registros incompletos. O programa não criou sozinho todas as exclusões."
        },
        {
          "speaker": "leo",
          "en": {
            "6": "We check the data and the rules.",
            "7": "We need to repair the records and review the selection rules.",
            "8": "More records can help, but we also need to inspect how people select data and evaluate the system’s effects."
          },
          "pt": "Mais registros podem ajudar. Também precisamos examinar como os dados são selecionados e como os efeitos são avaliados."
        },
        {
          "speaker": "taina",
          "en": {
            "6": "People stay responsible.",
            "7": "A reboot cannot replace ongoing human responsibility.",
            "8": "A reboot is only a step: people must remain accountable, hear affected communities and review decisions."
          },
          "pt": "Reiniciar é apenas um passo. Pessoas devem continuar responsáveis, ouvir comunidades afetadas e revisar decisões."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "I am ready. So are our sources.",
            "7": "My scanner is ready, and our evidence cards are organised.",
            "8": "I can help organise the evidence, but our team will decide what the system needs to change."
          },
          "pt": "Meu scanner está pronto. Ele organiza as evidências; nossa equipe decide o que precisa mudar."
        }
      ],
      "resolution": [
        {
          "speaker": "nia",
          "en": {
            "6": "The archive works again. The work continues.",
            "7": "We repaired the archive and kept a review process active.",
            "8": "We restored the archive, but a continuing review process matters as new records and decisions appear."
          },
          "pt": "O arquivo foi restaurado e a revisão continua ativa conforme surgem novos registros e decisões."
        },
        {
          "speaker": "sol",
          "en": {
            "6": "Clear credits. More voices. New music!",
            "7": "The festival returned with credits and space for new artists.",
            "8": "The festival now has clear credits and invites new contributors; the archive will keep learning from their work."
          },
          "pt": "O festival voltou com créditos e espaço para novos artistas. O arquivo continuará recebendo suas contribuições."
        },
        {
          "speaker": "resident",
          "en": {
            "6": "We check the city together.",
            "7": "Residents will review access and send feedback.",
            "8": "Residents and institutions will monitor access together; participation is part of the city’s continuing work."
          },
          "pt": "Moradores e instituições vão acompanhar o acesso. Participar faz parte do trabalho contínuo da cidade."
        },
        {
          "speaker": "pix",
          "en": {
            "6": "System restored. Curiosity stays on.",
            "7": "System restored. The next good question is yours.",
            "8": "System restored. A reliable archive is never finished, so the next careful question is yours."
          },
          "pt": "Sistema restaurado. Um arquivo confiável continua em construção. A próxima boa pergunta é sua."
        }
      ],
      "npcs": [
        {
          "character": "nia",
          "name": "Nia — núcleo de auditoria",
          "lines": [
            {
              "speaker": "nia",
              "en": {
                "6": "This sample hides part of the city.",
                "7": "The fictional data sample included only a few districts.",
                "8": "The fictional sample leaves districts out, so its conclusions cannot describe the whole city without further evidence."
              },
              "pt": "A amostra ficcional deixou bairros de fora. Suas conclusões não descrevem toda a cidade sem novas evidências."
            },
            {
              "speaker": "nia",
              "en": {
                "6": "We need sources and a review log.",
                "7": "Our repair log records each source and each change.",
                "8": "A traceable repair log lets people inspect the sources, reasons and effects of changes over time."
              },
              "pt": "Um registro de revisão mostra fontes, motivos e efeitos das mudanças ao longo do tempo."
            }
          ],
          "choice": {
            "prompt": "Como manter a revisão depois do reboot?",
            "options": [
              {
                "label": "Mostrar fontes e manter um registro de mudanças",
                "flag": "c6_audit_log",
                "reply": {
                  "speaker": "nia",
                  "en": {
                    "6": "Sources and changes stay visible.",
                    "7": "We will keep sources and a dated change log.",
                    "8": "A dated change log supports review and makes our choices open to questions."
                  },
                  "pt": "Vamos manter fontes e um registro datado de mudanças para que nossas escolhas possam ser questionadas."
                }
              },
              {
                "label": "Criar um canal acessível para pedir revisão",
                "flag": "c6_review_channel",
                "reply": {
                  "speaker": "nia",
                  "en": {
                    "6": "People can ask for a review.",
                    "7": "We will open an accessible review channel.",
                    "8": "An accessible review channel helps affected people question decisions, while the team remains responsible for responding."
                  },
                  "pt": "Um canal acessível permite questionar decisões. A equipe continua responsável por responder."
                }
              }
            ]
          }
        },
        {
          "character": "taina",
          "name": "Tainá — estação de vozes",
          "lines": [
            {
              "speaker": "taina",
              "en": {
                "6": "A record can miss a voice.",
                "7": "Some people were missing before BIAS.EXE read the archive.",
                "8": "An archive can already reflect exclusions; correcting an algorithm also requires examining how records were collected."
              },
              "pt": "Um arquivo pode conter exclusões anteriores ao programa. Corrigir o algoritmo exige examinar como os registros foram reunidos."
            },
            {
              "speaker": "taina",
              "en": {
                "6": "Ask who is missing and who decides.",
                "7": "Who was left out? Who chose the records?",
                "8": "Ask who is absent, who selected the records and how communities can take part in the next review."
              },
              "pt": "Pergunte quem está ausente, quem selecionou os registros e como as comunidades podem participar da próxima revisão."
            }
          ],
          "choice": {
            "prompt": "Qual compromisso acompanhará o sistema restaurado?",
            "options": [
              {
                "label": "Revisões periódicas com participação",
                "flag": "c6_shared_review",
                "reply": {
                  "speaker": "taina",
                  "en": {
                    "6": "We review the archive together.",
                    "7": "We will schedule reviews with different participants.",
                    "8": "Scheduled reviews with different participants can identify gaps that one team overlooks."
                  },
                  "pt": "Revisões periódicas com diferentes participantes ajudam a perceber lacunas que uma equipe pode deixar passar."
                }
              },
              {
                "label": "Reconhecer limites e corrigir novos erros",
                "flag": "c6_acknowledge_limits",
                "reply": {
                  "speaker": "taina",
                  "en": {
                    "6": "We show limits and correct mistakes.",
                    "7": "We will state limits and correct new mistakes when evidence appears.",
                    "8": "Acknowledging limits and documenting corrections makes responsibility an ongoing practice instead of a final victory claim."
                  },
                  "pt": "Vamos mostrar limites e documentar correções. Responsabilidade continua depois da vitória."
                }
              }
            ]
          }
        }
      ],
      "clues": [
        {
          "id": "c6_dataset",
          "title": "Arquivo ficcional: amostra incompleta",
          "en": {
            "6": "This sample leaves people out.",
            "7": "The fictional training sample omitted some communities and their records.",
            "8": "The fictional sample contains exclusions; adding records helps only if people also examine selection rules and effects."
          },
          "pt": "Esta amostra ficcional omitiu comunidades e registros. Reunir mais dados ajuda, mas também é preciso examinar critérios e efeitos.",
          "source": "ai_unesco",
          "word": "data",
          "icon": "database"
        },
        {
          "id": "c6_logic",
          "title": "Nota: sistemas podem reproduzir vieses",
          "en": {
            "6": "A system can repeat a biased pattern.",
            "7": "An AI system can reproduce patterns from biased data and decisions.",
            "8": "AI systems can reproduce or amplify biases through their data, design and use; a technical correction does not replace human accountability."
          },
          "pt": "Sistemas de IA podem reproduzir ou ampliar vieses pelos dados, projeto e uso. Uma correção técnica não substitui a responsabilidade humana.",
          "source": "ai_unesco",
          "word": "bias",
          "icon": "chip"
        },
        {
          "id": "c6_review",
          "title": "Plano ficcional: revisão contínua",
          "en": {
            "6": "People check sources and review decisions.",
            "7": "The team created a source log and a way to request review.",
            "8": "The fictional review plan combines sources, community participation and human responsibility as the archive changes."
          },
          "pt": "O plano ficcional combina fontes, participação e responsabilidade humana enquanto o arquivo muda. A revisão não termina no reboot.",
          "source": "ai_unesco",
          "word": "responsibility",
          "icon": "shield"
        }
      ],
      "takeaway": "Dados e programas são feitos e usados por pessoas. Fontes confiáveis, vozes diversas e revisão contínua ajudam a corrigir exclusões.",
      "objective": "Combine as pistas, repare as regras do arquivo e encerre BIAS.EXE com um plano de revisão."
    }
  ],
  "glossary": [
    {
      "en": "rhythm",
      "pt": "ritmo",
      "example": "Follow the rhythm.",
      "examplePt": "Siga o ritmo."
    },
    {
      "en": "credit",
      "pt": "crédito de autoria",
      "example": "Give credit to the creators.",
      "examplePt": "Dê crédito aos criadores."
    },
    {
      "en": "heritage",
      "pt": "patrimônio cultural",
      "example": "Heritage connects generations.",
      "examplePt": "O patrimônio cultural conecta gerações."
    },
    {
      "en": "history",
      "pt": "história",
      "example": "History has many sources.",
      "examplePt": "A história tem muitas fontes."
    },
    {
      "en": "timeline",
      "pt": "linha do tempo",
      "example": "Check the timeline and the map.",
      "examplePt": "Confira a linha do tempo e o mapa."
    },
    {
      "en": "source",
      "pt": "fonte",
      "example": "Check the source.",
      "examplePt": "Confira a fonte."
    },
    {
      "en": "mathematics",
      "pt": "matemática",
      "example": "Mathematics helps us check calculations.",
      "examplePt": "A matemática ajuda a conferir cálculos."
    },
    {
      "en": "writer",
      "pt": "escritor ou escritora",
      "example": "The writer creates a book.",
      "examplePt": "A escritora cria um livro."
    },
    {
      "en": "engineer",
      "pt": "engenheiro ou engenheira",
      "example": "The engineer plans a project.",
      "examplePt": "A engenheira planeja um projeto."
    },
    {
      "en": "evidence",
      "pt": "evidência",
      "example": "Evidence supports a claim.",
      "examplePt": "A evidência sustenta uma afirmação."
    },
    {
      "en": "stereotype",
      "pt": "estereótipo",
      "example": "A stereotype can hide differences.",
      "examplePt": "Um estereótipo pode esconder diferenças."
    },
    {
      "en": "context",
      "pt": "contexto",
      "example": "Read the full context.",
      "examplePt": "Leia o contexto completo."
    },
    {
      "en": "community",
      "pt": "comunidade",
      "example": "The community helps decide.",
      "examplePt": "A comunidade ajuda a decidir."
    },
    {
      "en": "access",
      "pt": "acesso",
      "example": "Access needs more than an invitation.",
      "examplePt": "O acesso exige mais que um convite."
    },
    {
      "en": "rights",
      "pt": "direitos",
      "example": "Everyone has rights.",
      "examplePt": "Todas as pessoas têm direitos."
    },
    {
      "en": "data",
      "pt": "dados",
      "example": "These data need careful review.",
      "examplePt": "Estes dados precisam de revisão cuidadosa."
    },
    {
      "en": "review",
      "pt": "revisar ou revisão",
      "example": "Review the decision.",
      "examplePt": "Revise a decisão."
    },
    {
      "en": "responsibility",
      "pt": "responsabilidade",
      "example": "People keep responsibility.",
      "examplePt": "As pessoas continuam responsáveis."
    },
    {
      "en": "listen",
      "pt": "ouvir ou escutar",
      "example": "Listen to the residents.",
      "examplePt": "Ouça os moradores."
    },
    {
      "en": "because",
      "pt": "porque",
      "example": "Check it because the date is missing.",
      "examplePt": "Confira porque a data está faltando."
    },
    {
      "en": "however",
      "pt": "porém ou no entanto",
      "example": "The post is popular. However, it lacks a source.",
      "examplePt": "O post é popular. Porém, não tem fonte."
    },
    {
      "en": "before",
      "pt": "antes ou antes de",
      "example": "Check before you share.",
      "examplePt": "Confira antes de compartilhar."
    },
    {
      "en": "after",
      "pt": "depois ou depois de",
      "example": "Review access after the project opens.",
      "examplePt": "Revise o acesso depois que o projeto abrir."
    },
    {
      "en": "share",
      "pt": "compartilhar",
      "example": "Share the corrected context.",
      "examplePt": "Compartilhe o contexto corrigido."
    },
    {
      "en": "bias",
      "pt": "viés ou tendência parcial",
      "example": "A biased sample can leave people out.",
      "examplePt": "Uma amostra enviesada pode deixar pessoas de fora."
    }
  ],
  "sources": [
    {
      "id": "samba_iphan",
      "name": "Iphan — Samba de Roda e reconhecimento pela UNESCO",
      "url": "https://bcr.iphan.gov.br/acoes-de-salvaguarda/reconhecimento-do-samba-de-roda-do-estado-da-bahia-pela-unesco-como-obra-prima-do-patrimonio-oral-e-imaterial-da-humanidade-e-posterior-incorporacao-a-lista-representativa/",
      "note": "Cap. 1: expressão do Recôncavo que reúne música, dança e poesia; protagonismo de comunidades negras e transmissão pela participação. Referência cultural, sem reprodução musical ou coreográfica."
    },
    {
      "id": "capoeira_unesco",
      "name": "UNESCO — Capoeira circle",
      "url": "https://ich.unesco.org/en/RL/capoeira-circle-00892",
      "note": "Cap. 1: prática cultural afro-brasileira com luta, dança, música e transmissão entre participantes. Inscrita na Lista Representativa em 2014. Página consultada também por seu registro indexado."
    },
    {
      "id": "mali_met",
      "name": "The Met — Sahel: Art and Empires on the Shores of the Sahara",
      "url": "https://www.metmuseum.org/exhibitions/sahel-art-empire-sahara/inside-the-exhibition",
      "note": "Cap. 2: Mali na África Ocidental; peregrinação de Mansa Musa em 1324; comércio, estudos e pluralidade de registros. Não equivale à história de todo o continente."
    },
    {
      "id": "songhai_unesco",
      "name": "UNESCO / ICOMOS — Tomb of Askia, avaliação patrimonial",
      "url": "https://whc.unesco.org/document/151848",
      "note": "Cap. 2: início do reinado de Sonni Ali em 1464; Songhai e rotas comerciais. Usamos somente a data do reinado e o contexto comercial, sem reproduzir genealogias discutíveis do documento."
    },
    {
      "id": "kongo_met",
      "name": "The Met — Kongo: Power and Majesty, Exhibition Galleries",
      "url": "https://www.metmuseum.org/exhibitions/listings/2015/kongo/exhibition-galleries",
      "note": "Cap. 2: sociedades da África Central e chegada de Diogo Cão à foz do Congo em 1483 na cronologia desta exposição. O jogo apresenta contato entre sociedades já existentes, sem linguagem de descobrimento."
    },
    {
      "id": "abolition_law",
      "name": "Presidência da República — Lei nº 3.353, de 13 de maio de 1888",
      "url": "https://www.planalto.gov.br/ccivil_03/leis/lim/lim3353.htm",
      "note": "Registro contextual do cap. 2: extinção legal da escravidão no Brasil. A lei é lida junto ao perfil de Rebouças para não sugerir que o texto legal resolveu desigualdades ou que a luta coletiva não importou."
    },
    {
      "id": "johnson_nasa",
      "name": "NASA — Katherine Johnson Biography",
      "url": "https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/",
      "note": "Cap. 3: matemática que verificou cálculos da missão orbital de John Glenn em 1962. Não inventamos falas nem afirmamos que ela inventou um foguete ou trabalhou sozinha."
    },
    {
      "id": "carolina_an",
      "name": "Arquivo Nacional — Série Mulheres e o Arquivo: Carolina de Jesus",
      "url": "https://www.gov.br/arquivonacional/pt-br/canais_atendimento/imprensa/noticias/serie-mulheres-e-o-arquivo-carolina-de-jesus",
      "note": "Cap. 3: Carolina Maria de Jesus, escritora, poeta e compositora; publicação de Quarto de despejo em 1960. Não reproduzimos trechos de seu diário."
    },
    {
      "id": "reboucas_an",
      "name": "Arquivo Nacional — André Pinto Rebouças",
      "url": "https://www.gov.br/arquivonacional/pt-br/sites_eventos/sites-tematicos-1/brasil-oitocentista/conheca-o-acervo/andre-pinto-reboucas-ow",
      "note": "Cap. 3: engenheiro negro, atuação nas docas do Rio de Janeiro e participação abolicionista. Defendia condições de subsistência e acesso à terra após a abolição; não lhe atribuímos invenções sem comprovação."
    },
    {
      "id": "racism_unicef",
      "name": "UNICEF Brasil — O impacto do racismo na infância",
      "url": "https://www.unicef.org/brazil/relatorios/o-impacto-do-racismo-na-infancia",
      "note": "Caps. 4 e 5: racismo e discriminação racial violam direitos e afetam crianças. Os casos do jogo são ficcionais e não pedem exposição pessoal."
    },
    {
      "id": "school_unicef",
      "name": "UNICEF e parceiros — Indicadores da Qualidade na Educação: Relações Raciais na Escola",
      "url": "https://www.unicef.org/brazil/relatorios/indicadores-da-qualidade-na-educacao-relacoes-raciais-na-escola",
      "note": "Caps. 4 e 5: participação da comunidade escolar e avaliação de práticas para enfrentar o racismo. Inspirou os exercícios ficcionais de escuta e acompanhamento."
    },
    {
      "id": "media_unesco",
      "name": "UNESCO — Do you trust what you watch or read?",
      "url": "https://www.unesco.org/en/articles/do-you-trust-what-you-watch-or-read",
      "note": "Cap. 4: verificar fonte, credibilidade, precisão e finalidade de informações. Não presumimos intenção deliberada de enganar quando só identificamos uma informação incorreta."
    },
    {
      "id": "indigenous_ibge",
      "name": "IBGE Educa — Os indígenas no Censo 2022",
      "url": "https://educa.ibge.gov.br/criancas/brasil/2848-nosso-povo/22324-os-indigenas-no-censo-2022.html",
      "note": "Cap. 5: povos indígenas contemporâneos, diversidade de línguas e modos de vida, residências dentro e fora de Terras Indígenas. O jogo evita cifras porque não são necessárias à missão."
    },
    {
      "id": "ai_unesco",
      "name": "UNESCO — Ethics of Artificial Intelligence",
      "url": "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
      "note": "Cap. 6: sistemas podem reproduzir e ampliar vieses; responsabilidade humana, participação, transparência e revisão. BIAS.EXE e os dados de New Harmony são ficção, não modelo técnico de todas as IAs."
    },
    {
      "id": "bncc_mec",
      "name": "MEC — Base Nacional Comum Curricular, Educação Infantil e Ensino Fundamental",
      "url": "https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf",
      "note": "Referência temática: leitura e interação em inglês, dimensão intercultural, diversidade e investigação histórica. Perfis do jogo são escolhas didáticas; não prometem cobertura integral nem atribuem códigos específicos."
    },
    {
      "id": "crmg_see",
      "name": "SEE/MG — Currículo Referência de Minas Gerais e Planos de Curso",
      "url": "https://curriculoreferencia.educacao.mg.gov.br/index.php/plano-de-cursos-crmg",
      "note": "Portal institucional para o professor relacionar a atividade ao planejamento local. Não afirmamos existir uma edição exclusiva CRMG 2026 nem uma correspondência automática por trimestre."
    },
    {
      "id": "law11645",
      "name": "Presidência da República — Lei nº 11.645, de 10 de março de 2008",
      "url": "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11645.htm",
      "note": "Referência curricular: inclusão de História e Cultura Afro-Brasileira e Indígena no currículo. O jogo é um recurso complementar interdisciplinar."
    },
    {
      "id": "routes_unesco",
      "name": "UNESCO Courier — From political recognition to demands for justice",
      "url": "https://courier.unesco.org/en/articles/political-recognition-demands-justice",
      "note": "Registro contextual do cap. 2: memória do tráfico atlântico, escravização, resistência e liberdade. O jogo usa explicação breve, sem sofrimento como espetáculo ou desafio."
    }
  ],
  "timeline": [
    {
      "id": "t_mali",
      "year": 1324,
      "date": "1324",
      "label": "Mali: peregrinação de Mansa Musa",
      "en": "Mansa Musa of Mali makes a pilgrimage to Mecca.",
      "pt": "África Ocidental: Mansa Musa realiza sua peregrinação a Meca. É um registro específico da história do Mali.",
      "source": "mali_met"
    },
    {
      "id": "t_songhai",
      "year": 1464,
      "date": "1464",
      "label": "Songhai: início do reinado de Sonni Ali",
      "en": "Sonni Ali begins his reign in Songhai.",
      "pt": "África Ocidental: início do reinado de Sonni Ali na história de Songhai.",
      "source": "songhai_unesco"
    },
    {
      "id": "t_kongo",
      "year": 1483,
      "date": "1483",
      "label": "Kongo: contato com portugueses",
      "en": "Diogo Cão reaches the Congo River’s mouth, in this museum chronology.",
      "pt": "África Central: a cronologia da exposição do Met registra a chegada de Diogo Cão à foz do Congo. Kongo já tinha sua história.",
      "source": "kongo_met"
    },
    {
      "id": "t_abolition",
      "year": 1888,
      "date": "13/05/1888",
      "label": "Brasil: abolição legal da escravidão",
      "en": "The law of 13 May ends legal slavery in Brazil.",
      "pt": "Brasil: a Lei nº 3.353 extingue legalmente a escravidão. Este marco não significa que todas as desigualdades terminaram.",
      "source": "abolition_law",
      "optionalSensitive": true
    },
    {
      "id": "t_carolina",
      "year": 1960,
      "date": "1960",
      "label": "Brasil: publicação de Quarto de despejo",
      "en": "Carolina Maria de Jesus’s Quarto de despejo is published.",
      "pt": "Brasil: publicação de Quarto de despejo, de Carolina Maria de Jesus.",
      "source": "carolina_an"
    },
    {
      "id": "t_johnson",
      "year": 1962,
      "date": "1962",
      "label": "Estados Unidos: verificação de cálculos orbitais",
      "en": "Katherine Johnson checks calculations for John Glenn’s orbital mission.",
      "pt": "Estados Unidos: Katherine Johnson verifica cálculos para a missão orbital de John Glenn.",
      "source": "johnson_nasa"
    }
  ],
  "evidence": [
    {
      "id": "e_johnson",
      "name": "Katherine Johnson",
      "characteristic": "Matemática e verificação de cálculos de trajetórias espaciais.",
      "documents": [
        "Resumo educativo, não transcrição: o registro da NASA identifica uma matemática de suas equipes.",
        "O perfil documenta a conferência de cálculos para a missão orbital de John Glenn em 1962.",
        "A contribuição trata de cálculo e trajetória; não diz que essa pessoa inventou sozinha um foguete."
      ],
      "answer": "Katherine Johnson",
      "source": "johnson_nasa"
    },
    {
      "id": "e_carolina",
      "name": "Carolina Maria de Jesus",
      "characteristic": "Autoria literária de Quarto de despejo, publicado em 1960.",
      "documents": [
        "Resumo educativo, não transcrição: o Arquivo Nacional identifica uma escritora brasileira negra.",
        "O registro relaciona seu nome à obra Quarto de despejo, publicada em 1960.",
        "O perfil também menciona poesia e composição. A pasta é sobre autoria literária, não cálculos orbitais."
      ],
      "answer": "Carolina Maria de Jesus",
      "source": "carolina_an"
    },
    {
      "id": "e_reboucas",
      "name": "André Rebouças",
      "characteristic": "Engenharia portuária e participação no movimento abolicionista.",
      "documents": [
        "Resumo educativo, não transcrição: o Arquivo Nacional registra a atuação de um engenheiro negro.",
        "A biografia trata de obras nas docas do Rio de Janeiro.",
        "O mesmo perfil documenta participação abolicionista e preocupação com condições de subsistência após a liberdade."
      ],
      "answer": "André Rebouças",
      "source": "reboucas_an"
    }
  ],
  "biasCases": [
    {
      "id": "b_discrimination",
      "type": "Discriminação racial",
      "headline": "Caso ficcional: clube exclui estudante por cor da pele",
      "context": "O registro ficcional do clube confirma que a inscrição foi negada por cor da pele. A questão é como responder ao acesso negado, sem expor a estudante.",
      "missing": [
        "Acolher a estudante, preservar o registro e pedir revisão com apoio de um adulto de confiança.",
        "Transformar o caso em disputa pública para ganhar curtidas.",
        "Tratar o critério de cor da pele como uma preferência musical.",
        "Pedir que a estudante resolva sozinha o problema."
      ],
      "correct": 0,
      "explanation": "Há um critério racial explícito de exclusão: isso é discriminação racial. A resposta precisa apoiar a pessoa e mudar o critério. Não cabe à estudante carregar a responsabilidade sozinha.",
      "source": "racism_unicef"
    },
    {
      "id": "b_stereotype",
      "type": "Estereótipo",
      "headline": "Caso ficcional: um vídeo diz que todos os povos indígenas vivem igual",
      "context": "O vídeo usa uma imagem antiga e generaliza muitos povos, línguas e vidas contemporâneas. Não oferece fontes para essa generalização.",
      "missing": [
        "Vozes de diferentes povos e informações atuais, sem tomar uma pessoa como representante de todos.",
        "Mais cópias da mesma foto antiga.",
        "Uma regra que diga como toda pessoa indígena deveria viver.",
        "A quantidade de curtidas do vídeo."
      ],
      "correct": 0,
      "explanation": "O problema é uma generalização que apaga diferenças. Povos indígenas são diversos e contemporâneos. Informações e vozes distintas questionam o estereótipo.",
      "source": "indigenous_ibge"
    },
    {
      "id": "b_context",
      "type": "Informação incorreta",
      "headline": "Caso ficcional: “A feira cultural foi cancelada!”",
      "context": "A imagem veio de um aviso de outra edição da feira. A data foi cortada. O anúncio atual, disponível na escola, confirma que a nova edição acontecerá.",
      "missing": [
        "A data e a versão completa do aviso, comparadas com o anúncio atual.",
        "Uma manchete mais urgente.",
        "O número de compartilhamentos.",
        "Uma suposição sobre a intenção da pessoa que enviou."
      ],
      "correct": 0,
      "explanation": "O aviso antigo sem data produz uma informação incorreta sobre a edição atual. Verificar registros corrige o contexto. Esses dados não bastam para afirmar que alguém mentiu deliberadamente.",
      "source": "media_unesco"
    },
    {
      "id": "b_opinion",
      "type": "Opinião e discordância",
      "headline": "Caso ficcional: dois amigos preferem bandas diferentes",
      "context": "Um amigo gosta de guitarras; outro prefere sintetizadores. Eles discordam sobre a música, sem atacar identidades ou negar acesso a ninguém.",
      "missing": [
        "Reconhecer que são gostos pessoais e conversar sem transformar preferência em fato universal.",
        "Uma prova de que todos devem gostar da mesma banda.",
        "Uma acusação de discriminação sem analisar o contexto.",
        "Apagar todas as músicas diferentes da favorita."
      ],
      "correct": 0,
      "explanation": "Neste contexto, há opiniões sobre gosto musical. Discordância não equivale automaticamente a discriminação. Isso muda se surgem exclusão ou ataques ligados a identidades.",
      "source": "media_unesco"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "chapter": 1,
      "grade": 6,
      "prompt": "Leia: “Give credit to the creators.” O que o festival deve fazer?",
      "options": [
        "Esconder os nomes.",
        "Identificar quem criou.",
        "Copiar sem registro.",
        "Trocar a data."
      ],
      "correct": 1,
      "explanation": "Give credit significa reconhecer a autoria. Creators são as pessoas criadoras."
    },
    {
      "id": "q2",
      "chapter": 1,
      "grade": 6,
      "prompt": "Complete: “Sol ___ music for the festival.”",
      "options": [
        "make",
        "making",
        "makes",
        "to make"
      ],
      "correct": 2,
      "explanation": "No Simple Present, com Sol (she), usamos makes. A frase diz que Sol faz música para o festival."
    },
    {
      "id": "q3",
      "chapter": 2,
      "grade": 7,
      "prompt": "Leia: “Mansa Musa travelled in 1324.” Qual pergunta procura a data?",
      "options": [
        "Who travelled?",
        "Where did he travel?",
        "What did he read?",
        "When did he travel?"
      ],
      "correct": 3,
      "explanation": "When pergunta quando. Who pergunta quem; where pergunta onde. Travelled está no passado."
    },
    {
      "id": "q4",
      "chapter": 2,
      "grade": 7,
      "prompt": "Leia: “Kongo had its own history before contact in 1483.” Qual leitura respeita a pista?",
      "options": [
        "Kongo já tinha sua história antes desse contato.",
        "Toda a África começou em 1483.",
        "Mali e Kongo são o mesmo lugar.",
        "A data apaga a necessidade de fonte."
      ],
      "correct": 0,
      "explanation": "Before significa antes. A data se refere ao contato registrado, não ao início da história de Kongo ou da África."
    },
    {
      "id": "q5",
      "chapter": 3,
      "grade": 7,
      "prompt": "Complete o registro no passado: “Katherine Johnson ___ the calculations in 1962.”",
      "options": [
        "check",
        "checking",
        "checked",
        "checks"
      ],
      "correct": 2,
      "explanation": "Checked é o Simple Past de check. A pista documenta a verificação dos cálculos, sem atribuir a ela a invenção de um foguete."
    },
    {
      "id": "q6",
      "chapter": 3,
      "grade": 8,
      "prompt": "Leia: “The label looks official. However, it lacks a source.” O que however conecta?",
      "options": [
        "Duas ideias idênticas.",
        "Um contraste entre aparência e falta de fonte.",
        "Uma data e um lugar.",
        "Uma ordem de ações sem contraste."
      ],
      "correct": 1,
      "explanation": "However significa porém/no entanto. A aparência oficial não resolve a ausência de fonte."
    },
    {
      "id": "q7",
      "chapter": 4,
      "grade": 6,
      "prompt": "Leia: “Check before you share.” Qual sequência a frase pede?",
      "options": [
        "Compartilhar e depois esquecer.",
        "Compartilhar porque é popular.",
        "Trocar o título e postar.",
        "Conferir antes de compartilhar."
      ],
      "correct": 3,
      "explanation": "Check = confira; before = antes; share = compartilhe."
    },
    {
      "id": "q8",
      "chapter": 4,
      "grade": 8,
      "prompt": "Leia: “The post is popular, but the date is missing.” Qual conclusão é mais sustentada?",
      "options": [
        "Popularidade não confirma a informação; falta conferir a data e o contexto.",
        "Muitas curtidas provam que é atual.",
        "A falta de data prova que o autor quis mentir.",
        "Todo desacordo é discriminação racial."
      ],
      "correct": 0,
      "explanation": "But introduz contraste. A ausência de data pede apuração e não prova, sozinha, intenção de enganar."
    },
    {
      "id": "q9",
      "chapter": 5,
      "grade": 6,
      "prompt": "Leia: “Listen to the community.” O que a equipe deve fazer antes de escolher projetos?",
      "options": [
        "Decidir sem conversar.",
        "Escolher só o projeto mais bonito.",
        "Ouvir a comunidade.",
        "Apagar necessidades antigas."
      ],
      "correct": 2,
      "explanation": "Listen significa ouvir ou escutar. Participantes ajudam a identificar prioridades e barreiras."
    },
    {
      "id": "q10",
      "chapter": 5,
      "grade": 8,
      "prompt": "Leia: “This route is more accessible, but other barriers remain.” Qual interpretação mantém as duas ideias?",
      "options": [
        "O projeto resolveu toda a desigualdade.",
        "O caminho melhorou o acesso; ainda há trabalho a fazer.",
        "More accessible significa mais caro.",
        "Nenhum projeto pode ajudar."
      ],
      "correct": 1,
      "explanation": "More accessible = mais acessível. But marca o contraste com barreiras que permanecem."
    },
    {
      "id": "q11",
      "chapter": 6,
      "grade": 7,
      "prompt": "Leia: “Who selected the records?” Que pergunta Nia faz?",
      "options": [
        "Quando a música acabou?",
        "Onde fica o palco?",
        "Quanto custou a rampa?",
        "Quem selecionou os registros?"
      ],
      "correct": 3,
      "explanation": "Who pergunta quem. O arquivo precisa de revisão das escolhas de pessoas, além de correção do programa."
    },
    {
      "id": "q12",
      "chapter": 6,
      "grade": 8,
      "prompt": "Complete: “We keep reviewing ___ new errors can appear.”",
      "options": [
        "because",
        "before",
        "however",
        "and then"
      ],
      "correct": 0,
      "explanation": "Because introduz a razão: continuamos revisando porque novos erros podem aparecer."
    }
  ],
  "profiles": {
    "6": {
      "name": "Explorer",
      "label": "6º ano — Explorador",
      "description": "Frases curtas, vocabulário cotidiano e apoio de tradução."
    },
    "7": {
      "name": "Investigator",
      "label": "7º ano — Investigador",
      "description": "Perguntas, descrições no passado e comparação de pistas."
    },
    "8": {
      "name": "Analyst",
      "label": "8º ano — Analista",
      "description": "Conectivos, comparativos e justificativas baseadas em evidência."
    }
  },
  "historicalNote": "New Harmony, a equipe VOICES, os NPCs, posts, projetos e chefes são ficção. Fichas históricas resumem fontes identificadas. Nenhuma fala de NPC é citação de pessoa histórica.",
  "timelineNote": "Seleção de eventos de lugares e períodos diferentes para comparação. Não é uma linha completa da história da África, do Brasil ou da ciência.",
  "curriculumNote": "Recurso complementar com aproximações temáticas à BNCC e às referências da SEE/MG: interação e leitura em inglês, dimensão intercultural, investigação histórica e cidadania. Perfis linguísticos são escolhas didáticas, não equivalem a cobertura completa do currículo ou a um trimestre específico."
};
