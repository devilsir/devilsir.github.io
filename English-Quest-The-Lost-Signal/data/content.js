(function(){
  window.EQ = window.EQ || {};
  EQ.CONTENT = {
  "missions": [
    {
      "id": "6-1",
      "grade": 6,
      "title": "Whose Room Is This?",
      "description": "Investigue um quarto e descubra a quem pertence cada objeto.",
      "objectives": [
        "Family members",
        "Genitive case",
        "Possessive adjectives",
        "Furniture"
      ],
      "primaryGame": "sentence",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 6-1 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Whose Room Is This?”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "6-1-q1",
          "type": "choice",
          "prompt": "Anna is Lucas’s sister. Pedro is Anna’s father. Who is Pedro to Lucas?",
          "answer": "father",
          "options": [
            "brother",
            "father",
            "uncle",
            "cousin"
          ],
          "hint": "Follow the family relationship.",
          "explanation": "Pedro is also Lucas’s father.",
          "pt": "Pedro é o pai de Lucas.",
          "category": "Family members",
          "points": 100
        },
        {
          "id": "6-1-q2",
          "type": "sentence",
          "prompt": "Build the sentence that shows the owner.",
          "answer": [
            "This",
            "is",
            "Maya’s",
            "desk"
          ],
          "options": [],
          "hint": "Use name + ’s before the object.",
          "explanation": "The genitive ’s shows possession.",
          "pt": "Esta é a escrivaninha da Maya.",
          "category": "Genitive case",
          "points": 100
        },
        {
          "id": "6-1-q3",
          "type": "choice",
          "prompt": "The blue backpack belongs to Leo. Choose the correct sentence.",
          "answer": "It is his backpack.",
          "options": [
            "It is her backpack.",
            "It is his backpack.",
            "It is their backpacks.",
            "It are his backpack."
          ],
          "hint": "Leo uses his.",
          "explanation": "His refers to something that belongs to a boy or man.",
          "pt": "É a mochila dele.",
          "category": "Possessive adjectives",
          "points": 100
        },
        {
          "id": "6-1-q4",
          "type": "match",
          "prompt": "Match each family member to the clue.",
          "answer": [
            [
              "mother",
              "a female parent"
            ],
            [
              "cousin",
              "the child of your aunt or uncle"
            ],
            [
              "grandfather",
              "your parent’s father"
            ]
          ],
          "options": [],
          "hint": "Start with the easiest relationship.",
          "explanation": "Each family word names a specific relationship.",
          "pt": "Associe cada membro da família à pista.",
          "category": "Family members",
          "points": 100
        },
        {
          "id": "6-1-q5",
          "type": "choice",
          "prompt": "Which object is usually found next to a bed?",
          "answer": "nightstand",
          "options": [
            "shower",
            "nightstand",
            "stove",
            "sink"
          ],
          "hint": "Think about bedroom furniture.",
          "explanation": "A nightstand is a small table beside a bed.",
          "pt": "Qual objeto normalmente fica ao lado da cama?",
          "category": "Furniture",
          "points": 100
        },
        {
          "id": "6-1-q6",
          "type": "sentence",
          "prompt": "Complete the plural description.",
          "answer": [
            "These",
            "are",
            "their",
            "books"
          ],
          "options": [],
          "hint": "Books is plural, so use are.",
          "explanation": "These are + plural noun is the correct pattern.",
          "pt": "Estes são os livros deles.",
          "category": "Plurals",
          "points": 100
        },
        {
          "id": "6-1-q7",
          "type": "choice",
          "prompt": "One child, two ____.",
          "answer": "children",
          "options": [
            "childs",
            "childes",
            "children",
            "childrens"
          ],
          "hint": "This plural is irregular.",
          "explanation": "The plural of child is children.",
          "pt": "Uma criança, duas crianças.",
          "category": "Irregular plurals",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "6-2",
      "grade": 6,
      "title": "The Moving Furniture",
      "description": "Reposicione os móveis antes que o quarto se embaralhe novamente.",
      "objectives": [
        "There is / There are",
        "Prepositions",
        "House vocabulary"
      ],
      "primaryGame": "room",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 6-2 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Moving Furniture”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "6-2-q1",
          "type": "room",
          "prompt": "Place the lamp next to the window.",
          "answer": "next to the window",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on next to.",
          "explanation": "Next to means beside.",
          "pt": "Coloque o abajur ao lado da janela.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q2",
          "type": "room",
          "prompt": "Put the shoes under the desk.",
          "answer": "under the desk",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on under.",
          "explanation": "Under means below.",
          "pt": "Coloque os sapatos debaixo da escrivaninha.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q3",
          "type": "room",
          "prompt": "Move the rug in front of the sofa.",
          "answer": "in front of the sofa",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on in front of.",
          "explanation": "The rug should be before the sofa.",
          "pt": "Mova o tapete para a frente do sofá.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q4",
          "type": "room",
          "prompt": "Hide the key behind the door.",
          "answer": "behind the door",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on behind.",
          "explanation": "Behind means at the back of something.",
          "pt": "Esconda a chave atrás da porta.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q5",
          "type": "room",
          "prompt": "Put the pillow on the bed.",
          "answer": "on the bed",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on on.",
          "explanation": "On means touching the top surface.",
          "pt": "Coloque o travesseiro sobre a cama.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q6",
          "type": "room",
          "prompt": "Place the plant between the chairs.",
          "answer": "between the chairs",
          "options": [
            "on the bed",
            "under the desk",
            "next to the window",
            "between the chairs",
            "behind the door",
            "in front of the sofa"
          ],
          "hint": "Focus on between.",
          "explanation": "Between means in the middle of two things.",
          "pt": "Coloque a planta entre as cadeiras.",
          "category": "Prepositions",
          "points": 100
        },
        {
          "id": "6-2-q7",
          "type": "choice",
          "prompt": "Choose the correct room description.",
          "answer": "There are two chairs.",
          "options": [
            "There is two chairs.",
            "There are two chairs.",
            "There are a chair.",
            "There is chairs."
          ],
          "hint": "Two chairs is plural.",
          "explanation": "Use there are with plural nouns.",
          "pt": "Há duas cadeiras.",
          "category": "There is / There are",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "6-3",
      "grade": 6,
      "title": "The Missing Routine",
      "description": "Reconstrua a rotina apagada de uma das pessoas da casa.",
      "objectives": [
        "Simple Present",
        "Daily routines",
        "Time expressions"
      ],
      "primaryGame": "order",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 6-3 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Missing Routine”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "6-3-q1",
          "type": "order",
          "prompt": "Put the morning routine in order.",
          "answer": [
            "I wake up.",
            "I brush my teeth.",
            "I have breakfast.",
            "I go to school."
          ],
          "options": [],
          "hint": "Think about what happens first.",
          "explanation": "A routine follows a logical time sequence.",
          "pt": "Organize a rotina da manhã.",
          "category": "Daily routines",
          "points": 100
        },
        {
          "id": "6-3-q2",
          "type": "order",
          "prompt": "Organize Mia’s evening.",
          "answer": [
            "Mia gets home.",
            "She does her homework.",
            "She has dinner.",
            "She goes to bed."
          ],
          "options": [],
          "hint": "Use the usual evening sequence.",
          "explanation": "The events move from arriving home to sleeping.",
          "pt": "Organize a noite de Mia.",
          "category": "Daily routines",
          "points": 100
        },
        {
          "id": "6-3-q3",
          "type": "order",
          "prompt": "Rebuild Noah’s first actions.",
          "answer": [
            "The alarm rings.",
            "Noah gets up.",
            "He takes a shower.",
            "He gets dressed."
          ],
          "options": [],
          "hint": "The alarm starts the routine.",
          "explanation": "These actions follow a clear morning sequence.",
          "pt": "Reconstrua as primeiras ações de Noah.",
          "category": "Daily routines",
          "points": 100
        },
        {
          "id": "6-3-q4",
          "type": "choice",
          "prompt": "Kai ____ to school at 7:00 every day.",
          "answer": "goes",
          "options": [
            "go",
            "goes",
            "going",
            "is go"
          ],
          "hint": "Kai is third-person singular.",
          "explanation": "Add -es to go with he, she or it.",
          "pt": "Kai vai à escola às 7h todos os dias.",
          "category": "Simple Present",
          "points": 100
        },
        {
          "id": "6-3-q5",
          "type": "sentence",
          "prompt": "Build a routine sentence.",
          "answer": [
            "She",
            "does",
            "her",
            "homework",
            "after",
            "school"
          ],
          "options": [],
          "hint": "Start with the subject.",
          "explanation": "She does is the correct third-person form.",
          "pt": "Ela faz a lição de casa depois da escola.",
          "category": "Simple Present",
          "points": 100
        },
        {
          "id": "6-3-q6",
          "type": "choice",
          "prompt": "Which question asks about time?",
          "answer": "When do you wake up?",
          "options": [
            "Where do you live?",
            "Who is your sister?",
            "When do you wake up?",
            "What is your name?"
          ],
          "hint": "Look for the time question word.",
          "explanation": "When asks about time.",
          "pt": "Qual pergunta pede um horário?",
          "category": "WH-words",
          "points": 100
        },
        {
          "id": "6-3-q7",
          "type": "choice",
          "prompt": "Choose the correct negative sentence.",
          "answer": "He does not watch TV in the morning.",
          "options": [
            "He not watches TV in the morning.",
            "He does not watches TV in the morning.",
            "He does not watch TV in the morning.",
            "He do not watch TV in the morning."
          ],
          "hint": "After does not, use the base verb.",
          "explanation": "Does not + watch is correct.",
          "pt": "Ele não assiste TV de manhã.",
          "category": "Simple Present",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "7-1",
      "grade": 7,
      "title": "Ask the Right Question",
      "description": "Entreviste testemunhas usando a pergunta certa.",
      "objectives": [
        "WH-questions",
        "Questions and answers",
        "Interview language"
      ],
      "primaryGame": "choice",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 7-1 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Ask the Right Question”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "7-1-q1",
          "type": "choice",
          "prompt": "____ do you live?",
          "answer": "Where",
          "options": [
            "What",
            "Where",
            "Who",
            "When"
          ],
          "hint": "The answer is a place.",
          "explanation": "Where asks about place.",
          "pt": "Onde você mora?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q2",
          "type": "choice",
          "prompt": "____ is your favorite subject?",
          "answer": "What",
          "options": [
            "Why",
            "What",
            "How many",
            "Where"
          ],
          "hint": "The answer is information about a thing.",
          "explanation": "What asks for information.",
          "pt": "Qual é sua matéria favorita?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q3",
          "type": "choice",
          "prompt": "____ do you go to school? By bus.",
          "answer": "How",
          "options": [
            "Who",
            "How",
            "When",
            "What"
          ],
          "hint": "The answer explains the method.",
          "explanation": "How asks about manner.",
          "pt": "Como você vai à escola?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q4",
          "type": "choice",
          "prompt": "____ do you like science? Because it is interesting.",
          "answer": "Why",
          "options": [
            "Where",
            "When",
            "Why",
            "Which"
          ],
          "hint": "The answer gives a reason.",
          "explanation": "Why asks for a reason.",
          "pt": "Por que você gosta de ciências?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q5",
          "type": "choice",
          "prompt": "____ is your English teacher?",
          "answer": "Who",
          "options": [
            "What",
            "Who",
            "How",
            "Why"
          ],
          "hint": "The answer is a person.",
          "explanation": "Who asks about a person.",
          "pt": "Quem é seu professor de inglês?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q6",
          "type": "choice",
          "prompt": "____ books do you read each month?",
          "answer": "How many",
          "options": [
            "How often",
            "How much",
            "How many",
            "Whose"
          ],
          "hint": "Books are countable.",
          "explanation": "How many asks about countable quantity.",
          "pt": "Quantos livros você lê por mês?",
          "category": "WH-questions",
          "points": 100
        },
        {
          "id": "7-1-q7",
          "type": "sentence",
          "prompt": "Build the interview question.",
          "answer": [
            "What",
            "do",
            "you",
            "do",
            "after",
            "school"
          ],
          "options": [],
          "hint": "Use WH-word + do + subject + verb.",
          "explanation": "Simple Present questions use do with you.",
          "pt": "O que você faz depois da escola?",
          "category": "Question structure",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "7-2",
      "grade": 7,
      "title": "Messages Without Connections",
      "description": "Reconecte mensagens fragmentadas com coesão.",
      "objectives": [
        "Linking words",
        "Coherent messages",
        "Relationships between ideas"
      ],
      "primaryGame": "match",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 7-2 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Messages Without Connections”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "7-2-q1",
          "type": "match",
          "prompt": "Connect each sentence beginning to its best ending.",
          "answer": [
            [
              "I like art",
              "because I can be creative."
            ],
            [
              "The club is small",
              "but it is very active."
            ],
            [
              "We finished the project",
              "so we presented it."
            ]
          ],
          "options": [],
          "hint": "Because gives a reason, but contrasts, so gives a result.",
          "explanation": "Linking words show relationships between ideas.",
          "pt": "Conecte as partes das frases.",
          "category": "Linking words",
          "points": 100
        },
        {
          "id": "7-2-q2",
          "type": "choice",
          "prompt": "I wanted to play, ____ it was raining.",
          "answer": "but",
          "options": [
            "and",
            "because",
            "but",
            "so"
          ],
          "hint": "The ideas contrast.",
          "explanation": "But introduces contrast.",
          "pt": "Eu queria brincar, mas estava chovendo.",
          "category": "But",
          "points": 100
        },
        {
          "id": "7-2-q3",
          "type": "choice",
          "prompt": "She studied, ____ she passed the test.",
          "answer": "so",
          "options": [
            "however",
            "because",
            "so",
            "but"
          ],
          "hint": "The second part is a result.",
          "explanation": "So connects cause and result.",
          "pt": "Ela estudou, então passou na prova.",
          "category": "So",
          "points": 100
        },
        {
          "id": "7-2-q4",
          "type": "choice",
          "prompt": "I joined the robotics club ____ I love technology.",
          "answer": "because",
          "options": [
            "because",
            "however",
            "so",
            "and"
          ],
          "hint": "The second clause gives a reason.",
          "explanation": "Because introduces a reason.",
          "pt": "Entrei no clube de robótica porque amo tecnologia.",
          "category": "Because",
          "points": 100
        },
        {
          "id": "7-2-q5",
          "type": "sentence",
          "prompt": "Rebuild the connected message.",
          "answer": [
            "I",
            "agree",
            "because",
            "the",
            "idea",
            "is",
            "practical"
          ],
          "options": [],
          "hint": "Put the opinion before the reason.",
          "explanation": "I agree because connects a view and support.",
          "pt": "Eu concordo porque a ideia é prática.",
          "category": "Opinion + reason",
          "points": 100
        },
        {
          "id": "7-2-q6",
          "type": "match",
          "prompt": "Match each linker to its function.",
          "answer": [
            [
              "because",
              "reason"
            ],
            [
              "however",
              "contrast"
            ],
            [
              "and",
              "addition"
            ]
          ],
          "options": [],
          "hint": "Think about what each word does.",
          "explanation": "Linkers organize message logic.",
          "pt": "Associe o conector à função.",
          "category": "Linking functions",
          "points": 100
        },
        {
          "id": "7-2-q7",
          "type": "order",
          "prompt": "Organize the message so it is coherent.",
          "answer": [
            "Our class needed a plan.",
            "We shared our ideas.",
            "Then we voted.",
            "Finally, we started the project."
          ],
          "options": [],
          "hint": "Look for the logical sequence.",
          "explanation": "The message moves from problem to action.",
          "pt": "Organize a mensagem de forma coerente.",
          "category": "Coherence",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "7-3",
      "grade": 7,
      "title": "The Opinion Conflict",
      "description": "Ajude os personagens a discordar sem quebrar o diálogo.",
      "objectives": [
        "Opinions",
        "Agreement and disagreement",
        "Reasons"
      ],
      "primaryGame": "choice",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 7-3 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Opinion Conflict”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "7-3-q1",
          "type": "choice",
          "prompt": "Choose the most complete opinion.",
          "answer": "I think the library should stay open longer because students need a quiet place to study.",
          "options": [
            "Library longer.",
            "I think yes.",
            "I think the library should stay open longer because students need a quiet place to study.",
            "Because studying."
          ],
          "hint": "Include a position and a reason.",
          "explanation": "A complete opinion clearly states and supports a view.",
          "pt": "Escolha a opinião mais completa.",
          "category": "Opinion",
          "points": 100
        },
        {
          "id": "7-3-q2",
          "type": "choice",
          "prompt": "Choose a respectful disagreement.",
          "answer": "I understand your point, but I disagree because uniforms can limit self-expression.",
          "options": [
            "You are wrong.",
            "No.",
            "I understand your point, but I disagree because uniforms can limit self-expression.",
            "That is stupid."
          ],
          "hint": "Respect the person and explain the reason.",
          "explanation": "Constructive disagreement acknowledges the other view.",
          "pt": "Escolha uma discordância respeitosa.",
          "category": "Disagreement",
          "points": 100
        },
        {
          "id": "7-3-q3",
          "type": "sentence",
          "prompt": "Build a supported agreement.",
          "answer": [
            "I",
            "agree",
            "because",
            "the",
            "plan",
            "helps",
            "everyone"
          ],
          "options": [],
          "hint": "Use agree + because.",
          "explanation": "The sentence gives a position and reason.",
          "pt": "Eu concordo porque o plano ajuda todo mundo.",
          "category": "Agreement",
          "points": 100
        },
        {
          "id": "7-3-q4",
          "type": "choice",
          "prompt": "Which expression invites another opinion?",
          "answer": "What do you think?",
          "options": [
            "I disagree.",
            "What do you think?",
            "In my opinion.",
            "However."
          ],
          "hint": "It should be a question.",
          "explanation": "What do you think? invites another person to speak.",
          "pt": "Qual expressão convida outra opinião?",
          "category": "Interaction",
          "points": 100
        },
        {
          "id": "7-3-q5",
          "type": "match",
          "prompt": "Match each response to its purpose.",
          "answer": [
            [
              "In my opinion...",
              "introduce a view"
            ],
            [
              "I see your point, but...",
              "disagree respectfully"
            ],
            [
              "I agree because...",
              "support agreement"
            ]
          ],
          "options": [],
          "hint": "Look at the key expression.",
          "explanation": "Each phrase signals a communicative purpose.",
          "pt": "Associe cada resposta à função.",
          "category": "Opinion language",
          "points": 100
        },
        {
          "id": "7-3-q6",
          "type": "choice",
          "prompt": "Which reason best supports “Our class should recycle more”?",
          "answer": "It reduces waste and helps the environment.",
          "options": [
            "Because yes.",
            "It reduces waste and helps the environment.",
            "Everyone says so.",
            "Recycling is a word."
          ],
          "hint": "Choose a relevant reason.",
          "explanation": "The answer explains a direct benefit.",
          "pt": "Qual razão melhor sustenta a afirmação?",
          "category": "Reasoning",
          "points": 100
        },
        {
          "id": "7-3-q7",
          "type": "order",
          "prompt": "Organize a respectful response.",
          "answer": [
            "I understand your idea.",
            "However, I see one problem.",
            "The plan may cost too much.",
            "Could we try a cheaper option?"
          ],
          "options": [],
          "hint": "Acknowledge, contrast, explain, propose.",
          "explanation": "This structure keeps disagreement constructive.",
          "pt": "Organize uma resposta respeitosa.",
          "category": "Dialogue",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "8-1",
      "grade": 8,
      "title": "Tomorrow’s Warning",
      "description": "Diferencie previsões espontâneas e previsões com evidência.",
      "objectives": [
        "Will",
        "Going to",
        "Evidence-based predictions"
      ],
      "primaryGame": "choice",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 8-1 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Tomorrow’s Warning”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "8-1-q1",
          "type": "choice",
          "prompt": "Look at those dark clouds! It ____ rain.",
          "answer": "is going to",
          "options": [
            "will",
            "is going to",
            "is raining tomorrow",
            "will have"
          ],
          "hint": "There is visible evidence.",
          "explanation": "Going to fits an evidence-based prediction.",
          "pt": "Olhe as nuvens: vai chover.",
          "category": "Will vs going to",
          "points": 100
        },
        {
          "id": "8-1-q2",
          "type": "choice",
          "prompt": "I think people ____ use cleaner energy in the future.",
          "answer": "will",
          "options": [
            "are going to",
            "will",
            "are about to",
            "have"
          ],
          "hint": "This is a general prediction.",
          "explanation": "Will often expresses broad predictions.",
          "pt": "Acho que as pessoas usarão energia mais limpa.",
          "category": "Will vs going to",
          "points": 100
        },
        {
          "id": "8-1-q3",
          "type": "choice",
          "prompt": "The phone is ringing. I ____ answer it.",
          "answer": "will",
          "options": [
            "am going to",
            "will",
            "am answering tomorrow",
            "will be"
          ],
          "hint": "This decision is spontaneous.",
          "explanation": "Will fits a decision made now.",
          "pt": "O telefone está tocando. Eu vou atender.",
          "category": "Will",
          "points": 100
        },
        {
          "id": "8-1-q4",
          "type": "choice",
          "prompt": "We bought the materials. We ____ build a solar model.",
          "answer": "are going to",
          "options": [
            "will",
            "are going to",
            "are about",
            "will have"
          ],
          "hint": "The plan existed before speaking.",
          "explanation": "Going to expresses a prior plan.",
          "pt": "Compramos os materiais; vamos construir um modelo solar.",
          "category": "Going to",
          "points": 100
        },
        {
          "id": "8-1-q5",
          "type": "choice",
          "prompt": "Careful! The glass ____ fall!",
          "answer": "is going to",
          "options": [
            "will have",
            "is going to",
            "will be falling tomorrow",
            "goes to"
          ],
          "hint": "There is immediate evidence.",
          "explanation": "Going to fits the visible danger.",
          "pt": "Cuidado! O copo vai cair!",
          "category": "Going to",
          "points": 100
        },
        {
          "id": "8-1-q6",
          "type": "choice",
          "prompt": "Maybe robots ____ help doctors more in 2040.",
          "answer": "will",
          "options": [
            "are about to",
            "will",
            "are helping yesterday",
            "have"
          ],
          "hint": "This is a future possibility.",
          "explanation": "Will is suitable for this prediction.",
          "pt": "Talvez robôs ajudem mais médicos em 2040.",
          "category": "Will",
          "points": 100
        },
        {
          "id": "8-1-q7",
          "type": "sentence",
          "prompt": "Build the warning based on evidence.",
          "answer": [
            "The",
            "system",
            "is",
            "going",
            "to",
            "crash"
          ],
          "options": [],
          "hint": "Use be + going to + base verb.",
          "explanation": "Present evidence points to a likely result.",
          "pt": "O sistema vai travar.",
          "category": "Going to",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "8-2",
      "grade": 8,
      "title": "The Schedule Glitch",
      "description": "Organize compromissos futuros antes que desapareçam.",
      "objectives": [
        "Present Continuous for future",
        "Schedules",
        "Arrangements"
      ],
      "primaryGame": "order",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 8-2 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Schedule Glitch”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "8-2-q1",
          "type": "order",
          "prompt": "Organize tomorrow’s lab schedule.",
          "answer": [
            "We are meeting the scientist at 9:00.",
            "We are testing the robot at 10:30.",
            "We are presenting the results at 13:00.",
            "We are returning to school at 15:00."
          ],
          "options": [],
          "hint": "Follow the times.",
          "explanation": "The schedule follows chronological order.",
          "pt": "Organize a agenda do laboratório.",
          "category": "Arrangements",
          "points": 100
        },
        {
          "id": "8-2-q2",
          "type": "order",
          "prompt": "Repair Nova’s weekly schedule.",
          "answer": [
            "Nova is visiting the museum on Monday.",
            "She is interviewing an engineer on Tuesday.",
            "She is recording the report on Wednesday.",
            "She is sharing it on Thursday."
          ],
          "options": [],
          "hint": "Follow the days.",
          "explanation": "The sequence follows the week.",
          "pt": "Repare a agenda semanal de Nova.",
          "category": "Arrangements",
          "points": 100
        },
        {
          "id": "8-2-q3",
          "type": "order",
          "prompt": "Put the launch arrangements in order.",
          "answer": [
            "The team is checking the code first.",
            "They are meeting the director next.",
            "They are testing the update after lunch.",
            "They are launching it in the evening."
          ],
          "options": [],
          "hint": "Use first, next, after lunch and evening.",
          "explanation": "Time markers reveal the order.",
          "pt": "Organize os preparativos do lançamento.",
          "category": "Arrangements",
          "points": 100
        },
        {
          "id": "8-2-q4",
          "type": "choice",
          "prompt": "We ____ the technology fair tomorrow at 2 p.m.",
          "answer": "are visiting",
          "options": [
            "visit yesterday",
            "are visiting",
            "will have visited now",
            "visiting"
          ],
          "hint": "This is a fixed plan with a time.",
          "explanation": "Present Continuous describes the arrangement.",
          "pt": "Visitaremos a feira amanhã às 14h.",
          "category": "Present Continuous",
          "points": 100
        },
        {
          "id": "8-2-q5",
          "type": "sentence",
          "prompt": "Build the arranged event.",
          "answer": [
            "They",
            "are",
            "meeting",
            "the",
            "designer",
            "on",
            "Friday"
          ],
          "options": [],
          "hint": "Use subject + be + verb-ing.",
          "explanation": "Are meeting signals a planned arrangement.",
          "pt": "Eles vão encontrar o designer na sexta-feira.",
          "category": "Present Continuous",
          "points": 100
        },
        {
          "id": "8-2-q6",
          "type": "choice",
          "prompt": "Which sentence describes an arrangement?",
          "answer": "I am seeing the dentist at 4 p.m.",
          "options": [
            "I think it will rain.",
            "I am seeing the dentist at 4 p.m.",
            "The show is about to start.",
            "By 2030, they will have finished."
          ],
          "hint": "Look for a fixed time.",
          "explanation": "A dentist appointment is arranged.",
          "pt": "Qual frase descreve um compromisso marcado?",
          "category": "Arrangements",
          "points": 100
        },
        {
          "id": "8-2-q7",
          "type": "choice",
          "prompt": "The experiment is ____ begin. Everyone is ready.",
          "answer": "about to",
          "options": [
            "going",
            "about to",
            "will have",
            "meeting"
          ],
          "hint": "The action will happen very soon.",
          "explanation": "About to means imminent.",
          "pt": "O experimento está prestes a começar.",
          "category": "About to",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "8-3",
      "grade": 8,
      "title": "Before the Signal Ends",
      "description": "Leia a linha do tempo e escolha formas futuras avançadas.",
      "objectives": [
        "Future Continuous",
        "Future Perfect",
        "Future timeline"
      ],
      "primaryGame": "sentence",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 8-3 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Before the Signal Ends”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "8-3-q1",
          "type": "sentence",
          "prompt": "Complete the action in progress tomorrow.",
          "answer": [
            "At",
            "this",
            "time",
            "tomorrow,",
            "we",
            "will",
            "be",
            "traveling"
          ],
          "options": [],
          "hint": "Use will be + verb-ing.",
          "explanation": "Future Continuous shows future progress.",
          "pt": "A esta hora amanhã, estaremos viajando.",
          "category": "Future Continuous",
          "points": 100
        },
        {
          "id": "8-3-q2",
          "type": "sentence",
          "prompt": "Build the completed future action.",
          "answer": [
            "By",
            "2040,",
            "scientists",
            "will",
            "have",
            "developed",
            "new",
            "solutions"
          ],
          "options": [],
          "hint": "Use will have + past participle.",
          "explanation": "Future Perfect shows completion before a future point.",
          "pt": "Até 2040, cientistas terão desenvolvido soluções.",
          "category": "Future Perfect",
          "points": 100
        },
        {
          "id": "8-3-q3",
          "type": "choice",
          "prompt": "At 10 p.m., I ____ for the test.",
          "answer": "will be studying",
          "options": [
            "will have study",
            "will be studying",
            "am studied",
            "will studying"
          ],
          "hint": "The action will be in progress.",
          "explanation": "Will be studying is Future Continuous.",
          "pt": "Às 22h, estarei estudando.",
          "category": "Future Continuous",
          "points": 100
        },
        {
          "id": "8-3-q4",
          "type": "choice",
          "prompt": "By next Friday, we ____ the project.",
          "answer": "will have completed",
          "options": [
            "will be complete",
            "will have completed",
            "are complete yesterday",
            "will completed"
          ],
          "hint": "It will be finished before Friday.",
          "explanation": "Will have completed is Future Perfect.",
          "pt": "Até sexta, teremos concluído o projeto.",
          "category": "Future Perfect",
          "points": 100
        },
        {
          "id": "8-3-q5",
          "type": "order",
          "prompt": "Organize the future timeline.",
          "answer": [
            "The team will start at 8:00.",
            "At 10:00, they will be testing the system.",
            "By noon, they will have collected the data.",
            "In the afternoon, they will present the results."
          ],
          "options": [],
          "hint": "Use the stated times.",
          "explanation": "The sequence combines start, progress and completion.",
          "pt": "Organize a linha do tempo futura.",
          "category": "Future timeline",
          "points": 100
        },
        {
          "id": "8-3-q6",
          "type": "match",
          "prompt": "Match the form to its meaning.",
          "answer": [
            [
              "will be working",
              "in progress at a future time"
            ],
            [
              "will have finished",
              "completed before a future time"
            ],
            [
              "is about to start",
              "happening very soon"
            ]
          ],
          "options": [],
          "hint": "Notice each verb pattern.",
          "explanation": "Each form expresses a different future relation.",
          "pt": "Associe a forma ao significado.",
          "category": "Future forms",
          "points": 100
        },
        {
          "id": "8-3-q7",
          "type": "choice",
          "prompt": "Which sentence means the task will be complete before 6 p.m.?",
          "answer": "By 6 p.m., they will have repaired the signal.",
          "options": [
            "At 6 p.m., they will be repairing the signal.",
            "By 6 p.m., they will have repaired the signal.",
            "They are about to repair it at 6 p.m.",
            "They repair it yesterday."
          ],
          "hint": "Look for by + Future Perfect.",
          "explanation": "Future Perfect emphasizes completion before a deadline.",
          "pt": "Qual frase indica conclusão antes das 18h?",
          "category": "Future Perfect",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "9-1",
      "grade": 9,
      "title": "The Consequence Door",
      "description": "Crie cadeias de consequências realistas para abrir a porta.",
      "objectives": [
        "First Conditional",
        "Realistic consequences"
      ],
      "primaryGame": "sentence",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 9-1 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Consequence Door”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "9-1-q1",
          "type": "sentence",
          "prompt": "Build the realistic consequence.",
          "answer": [
            "If",
            "we",
            "activate",
            "the",
            "machine,",
            "the",
            "door",
            "will",
            "open"
          ],
          "options": [],
          "hint": "Use If + present, will + verb.",
          "explanation": "First Conditional expresses a real possibility.",
          "pt": "Se ativarmos a máquina, a porta abrirá.",
          "category": "First Conditional",
          "points": 100
        },
        {
          "id": "9-1-q2",
          "type": "choice",
          "prompt": "If the door opens, the signal ____ escape.",
          "answer": "will",
          "options": [
            "would",
            "will",
            "is",
            "has"
          ],
          "hint": "This is a realistic future result.",
          "explanation": "Use will in the result clause.",
          "pt": "Se a porta abrir, o sinal escapará.",
          "category": "First Conditional",
          "points": 100
        },
        {
          "id": "9-1-q3",
          "type": "choice",
          "prompt": "Choose the correct First Conditional sentence.",
          "answer": "If we save energy, the battery will last longer.",
          "options": [
            "If we will save energy, the battery lasts longer.",
            "If we save energy, the battery will last longer.",
            "If we saved energy, the battery would last longer.",
            "If we save energy, the battery would lasted."
          ],
          "hint": "Use present after if and will in the result.",
          "explanation": "This is the standard First Conditional form.",
          "pt": "Escolha a frase correta.",
          "category": "First Conditional",
          "points": 100
        },
        {
          "id": "9-1-q4",
          "type": "sentence",
          "prompt": "Complete the warning.",
          "answer": [
            "If",
            "you",
            "share",
            "the",
            "password,",
            "someone",
            "will",
            "access",
            "the",
            "account"
          ],
          "options": [],
          "hint": "Use a present condition and future result.",
          "explanation": "The consequence is realistic and possible.",
          "pt": "Se você compartilhar a senha, alguém acessará a conta.",
          "category": "Digital safety",
          "points": 100
        },
        {
          "id": "9-1-q5",
          "type": "match",
          "prompt": "Match each condition to the logical consequence.",
          "answer": [
            [
              "If the alarm rings,",
              "we will leave the lab."
            ],
            [
              "If you verify the source,",
              "you will avoid false information."
            ],
            [
              "If the class collaborates,",
              "the mission will end faster."
            ]
          ],
          "options": [],
          "hint": "Choose the logical result.",
          "explanation": "Each pair forms a possible condition and result.",
          "pt": "Associe condições e consequências.",
          "category": "Cause and consequence",
          "points": 100
        },
        {
          "id": "9-1-q6",
          "type": "choice",
          "prompt": "If we do not update the system, it ____ vulnerable.",
          "answer": "will remain",
          "options": [
            "would remained",
            "will remain",
            "remains yesterday",
            "will remaining"
          ],
          "hint": "This is a likely future result.",
          "explanation": "Will remain completes the First Conditional.",
          "pt": "Se não atualizarmos, ele continuará vulnerável.",
          "category": "First Conditional",
          "points": 100
        },
        {
          "id": "9-1-q7",
          "type": "order",
          "prompt": "Create a consequence chain.",
          "answer": [
            "If the server fails, the signal will stop.",
            "If the signal stops, Echo will lose a memory.",
            "If Echo loses a memory, the map will change.",
            "If the map changes, we will need a new route."
          ],
          "options": [],
          "hint": "Each result becomes the next condition.",
          "explanation": "The chain links realistic consequences.",
          "pt": "Crie uma cadeia de consequências.",
          "category": "Condition Chain",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "9-2",
      "grade": 9,
      "title": "Another Version of the School",
      "description": "Explore versões hipotéticas da escola.",
      "objectives": [
        "Second Conditional",
        "Hypothetical situations"
      ],
      "primaryGame": "choice",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 9-2 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “Another Version of the School”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "9-2-q1",
          "type": "choice",
          "prompt": "If I were the principal, I ____ more creative classes.",
          "answer": "would create",
          "options": [
            "will create",
            "would create",
            "created yesterday",
            "would created"
          ],
          "hint": "Use would + base verb.",
          "explanation": "Second Conditional describes a hypothetical result.",
          "pt": "Se eu fosse diretor, criaria aulas mais criativas.",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q2",
          "type": "choice",
          "prompt": "If our school were on Mars, students ____ special equipment.",
          "answer": "would need",
          "options": [
            "will need",
            "would need",
            "need yesterday",
            "would needed"
          ],
          "hint": "The situation is imaginary.",
          "explanation": "Would need expresses the hypothetical result.",
          "pt": "Se a escola fosse em Marte, os alunos precisariam de equipamentos.",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q3",
          "type": "choice",
          "prompt": "If I could redesign the classroom, I ____ flexible furniture.",
          "answer": "would choose",
          "options": [
            "will chose",
            "would choose",
            "choose yesterday",
            "would choosing"
          ],
          "hint": "Use would + choose.",
          "explanation": "The result imagines a different classroom.",
          "pt": "Se eu pudesse redesenhar a sala, escolheria móveis flexíveis.",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q4",
          "type": "choice",
          "prompt": "What would you do if you ____ an AI assistant?",
          "answer": "had",
          "options": [
            "have",
            "had",
            "will have",
            "having"
          ],
          "hint": "Use the past form after if.",
          "explanation": "Had completes the hypothetical condition.",
          "pt": "O que faria se tivesse um assistente de IA?",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q5",
          "type": "choice",
          "prompt": "If there were no internet, how ____ people communicate?",
          "answer": "would",
          "options": [
            "will",
            "do",
            "would",
            "are"
          ],
          "hint": "Use would in the result question.",
          "explanation": "Would marks the hypothetical result.",
          "pt": "Se não houvesse internet, como as pessoas se comunicariam?",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q6",
          "type": "choice",
          "prompt": "If Echo were human, it ____ emotions differently.",
          "answer": "would understand",
          "options": [
            "will understands",
            "would understand",
            "understood tomorrow",
            "would understood"
          ],
          "hint": "Use would + base verb.",
          "explanation": "Would understand is the correct result.",
          "pt": "Se Echo fosse humano, entenderia emoções de modo diferente.",
          "category": "Second Conditional",
          "points": 100
        },
        {
          "id": "9-2-q7",
          "type": "sentence",
          "prompt": "Build the hypothetical idea.",
          "answer": [
            "If",
            "we",
            "lived",
            "underwater,",
            "we",
            "would",
            "need",
            "special",
            "schools"
          ],
          "options": [],
          "hint": "Use If + past, would + verb.",
          "explanation": "The sentence imagines an unreal situation.",
          "pt": "Se vivêssemos debaixo d’água, precisaríamos de escolas especiais.",
          "category": "Second Conditional",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    },
    {
      "id": "9-3",
      "grade": 9,
      "title": "The Fake Signal",
      "description": "Investigue informação, persuasão, evidência e prefixos.",
      "objectives": [
        "Fact and opinion",
        "Persuasive language",
        "Evidence",
        "Prefixes"
      ],
      "primaryGame": "match",
      "story": [
        {
          "speaker": "Echo",
          "text": "Fragment 9-3 detected. The signal is unstable."
        },
        {
          "speaker": "Professor Pixel",
          "text": "Your mission is “The Fake Signal”. Use English clues to recover this part of the message."
        },
        {
          "speaker": "Lia",
          "text": "Let’s inspect every clue before we make our team decision."
        }
      ],
      "questions": [
        {
          "id": "9-3-q1",
          "type": "match",
          "prompt": "Classify each statement.",
          "answer": [
            [
              "The lab opened in 2024.",
              "fact"
            ],
            [
              "The lab is the most exciting place in school.",
              "opinion"
            ],
            [
              "Attendance records show 120 visitors.",
              "evidence"
            ]
          ],
          "options": [],
          "hint": "Facts can be checked; opinions judge; evidence supports.",
          "explanation": "Critical reading separates types of information.",
          "pt": "Classifique cada afirmação.",
          "category": "Fact / opinion / evidence",
          "points": 100
        },
        {
          "id": "9-3-q2",
          "type": "choice",
          "prompt": "Which headline uses persuasive language?",
          "answer": "The incredible device every student must try!",
          "options": [
            "The school tested three devices on Tuesday.",
            "The incredible device every student must try!",
            "The report contains 12 pages.",
            "The meeting begins at 9 a.m."
          ],
          "hint": "Look for emotional and commanding words.",
          "explanation": "Incredible and must try are persuasive.",
          "pt": "Qual manchete usa linguagem persuasiva?",
          "category": "Persuasion",
          "points": 100
        },
        {
          "id": "9-3-q3",
          "type": "match",
          "prompt": "Match the prefix to the transformed word.",
          "answer": [
            [
              "un-",
              "unhappy"
            ],
            [
              "im-",
              "impossible"
            ],
            [
              "dis-",
              "disagree"
            ]
          ],
          "options": [],
          "hint": "Attach each prefix to the correct word.",
          "explanation": "Prefixes change meaning.",
          "pt": "Associe o prefixo à palavra transformada.",
          "category": "Prefixes",
          "points": 100
        },
        {
          "id": "9-3-q4",
          "type": "choice",
          "prompt": "Which source is most reliable for the school event time?",
          "answer": "The official school calendar",
          "options": [
            "An anonymous comment",
            "A rumor in a group chat",
            "The official school calendar",
            "A meme without a source"
          ],
          "hint": "Choose the original accountable source.",
          "explanation": "The official calendar is the best source for the schedule.",
          "pt": "Qual fonte é mais confiável?",
          "category": "Reliable information",
          "points": 100
        },
        {
          "id": "9-3-q5",
          "type": "sentence",
          "prompt": "Build the critical question.",
          "answer": [
            "What",
            "evidence",
            "supports",
            "this",
            "claim"
          ],
          "options": [],
          "hint": "Ask directly about proof.",
          "explanation": "Critical readers check supporting evidence.",
          "pt": "Que evidência sustenta esta afirmação?",
          "category": "Critical reading",
          "points": 100
        },
        {
          "id": "9-3-q6",
          "type": "choice",
          "prompt": "A message says “Everyone agrees,” but gives no data. What is the best response?",
          "answer": "Ask for evidence and the source.",
          "options": [
            "Share it immediately.",
            "Assume it is true.",
            "Ask for evidence and the source.",
            "Ignore all information forever."
          ],
          "hint": "Verify before accepting or rejecting.",
          "explanation": "Asking for evidence supports careful evaluation.",
          "pt": "Qual é a melhor resposta?",
          "category": "Evidence",
          "points": 100
        },
        {
          "id": "9-3-q7",
          "type": "match",
          "prompt": "Repair each word with the correct prefix.",
          "answer": [
            [
              "regular",
              "irregular"
            ],
            [
              "understand",
              "misunderstand"
            ],
            [
              "honest",
              "dishonest"
            ]
          ],
          "options": [],
          "hint": "Consider the meaning of each prefix.",
          "explanation": "Ir-, mis- and dis- change words in different ways.",
          "pt": "Repare cada palavra com o prefixo correto.",
          "category": "Word formation",
          "points": 100
        }
      ],
      "exitTicket": [
        {
          "prompt": "What language clue helped you most?",
          "type": "reflection"
        },
        {
          "prompt": "Use one target expression in a new sentence.",
          "type": "application"
        },
        {
          "prompt": "How confident do you feel now?",
          "type": "self",
          "options": [
            "I need more practice",
            "I am developing",
            "I feel secure"
          ]
        }
      ]
    }
  ],
  "bosses": {
    "6": {
      "title": "The House Reconstruction",
      "description": "Reconstruct the whole mysterious house using family, furniture, place and routine clues.",
      "questionIds": [
        "6-1-q1",
        "6-2-q7",
        "6-3-q4",
        "6-3-q6"
      ]
    },
    "7": {
      "title": "The Inconsistent Message",
      "description": "Interview the district and identify which message breaks the evidence chain.",
      "questionIds": [
        "7-1-q4",
        "7-2-q1",
        "7-3-q2",
        "7-3-q6"
      ]
    },
    "8": {
      "title": "Timeline Collapse",
      "description": "Repair the future timeline before the simulation reaches zero.",
      "questionIds": [
        "8-1-q1",
        "8-2-q6",
        "8-3-q4",
        "8-3-q7"
      ]
    },
    "9": {
      "title": "Echo’s Final Message",
      "description": "Analyse the final transmission and choose the future of Echo.",
      "questionIds": [
        "9-1-q3",
        "9-2-q1",
        "9-3-q2",
        "9-3-q6"
      ]
    }
  },
  "characters": {
    "Echo": {
      "icon": "◉",
      "role": "IA fragmentada",
      "color": "#60e6c5"
    },
    "Professor Pixel": {
      "icon": "▧",
      "role": "Guia opcional",
      "color": "#ffcf5c"
    },
    "Lia": {
      "icon": "⌕",
      "role": "Investigação e leitura",
      "color": "#ff8a73"
    },
    "Kai": {
      "icon": "⚡",
      "role": "Desafios e ação",
      "color": "#a778ff"
    },
    "Nova": {
      "icon": "✦",
      "role": "Tecnologia e futuro",
      "color": "#4ee6a8"
    },
    "Glitch": {
      "icon": "⌁",
      "role": "Criatura digital",
      "color": "#ff5eab"
    }
  },
  "questionCount": 84
};
})();
