(() => {
  "use strict";

  const references = Array.isArray(window.STICKER_REFERENCES) ? window.STICKER_REFERENCES : [];
  const TOTAL = references.length || 77;
  const STORAGE_KEY = "world-stars-album-2026-v1";
  const PASS_SCORE = 15;
  const DEFAULT_MUSIC_VOLUME = 30;

  const QUIZ_QUESTIONS = [
    {
        "id": "q001",
        "question": "As seen in class: Which sentence correctly answers “Where are you from?”",
        "options": [
            "I am from Brazil.",
            "I have from Brazil.",
            "I is from Brazil.",
            "I am Brazil from."
        ],
        "answer": 0,
        "note": "Use “I am from + country.”"
    },
    {
        "id": "q002",
        "question": "As seen in class: Complete: She is from Japan. She is ____.",
        "options": [
            "Japanese",
            "Japanian",
            "Japans",
            "Japan"
        ],
        "answer": 0,
        "note": "Japan is the country; Japanese is the nationality."
    },
    {
        "id": "q003",
        "question": "As seen in class: Complete: He is from France. He is ____.",
        "options": [
            "French",
            "France",
            "Franch",
            "Francese"
        ],
        "answer": 0,
        "note": "France is the country; French is the nationality."
    },
    {
        "id": "q004",
        "question": "As seen in class: Complete: They are from Portugal. They are ____.",
        "options": [
            "Portuguese",
            "Portugal",
            "Portugalian",
            "Portugals"
        ],
        "answer": 0,
        "note": "Portugal is the country; Portuguese is the nationality."
    },
    {
        "id": "q005",
        "question": "As seen in class: Complete: We are from Italy. We are ____.",
        "options": [
            "Italian",
            "Italy",
            "Italish",
            "Italies"
        ],
        "answer": 0,
        "note": "Italy is the country; Italian is the nationality."
    },
    {
        "id": "q006",
        "question": "As seen in class: Complete: I am from Brazil. I am ____.",
        "options": [
            "Brazilian",
            "Brazil",
            "Brasil",
            "Braziler"
        ],
        "answer": 0,
        "note": "Brazilian is the nationality."
    },
    {
        "id": "q007",
        "question": "As seen in class: Which question asks about origin?",
        "options": [
            "Where are you from?",
            "How old are you?",
            "What is your job?",
            "Where is the sofa?"
        ],
        "answer": 0,
        "note": "Use “Where are you from?” to ask about origin."
    },
    {
        "id": "q008",
        "question": "As seen in class: Complete the dialogue: “Where are you from?” “____.”",
        "options": [
            "I am from Argentina.",
            "I am a doctor.",
            "It is under the chair.",
            "My mother is kind."
        ],
        "answer": 0,
        "note": "The answer should name a country."
    },
    {
        "id": "q009",
        "question": "As seen in class: What is the nationality for The United States?",
        "options": [
            "American",
            "English",
            "Chinese",
            "French"
        ],
        "answer": 0,
        "note": "People from the United States can be called American."
    },
    {
        "id": "q010",
        "question": "As seen in class: What is the nationality for England?",
        "options": [
            "English",
            "Englandian",
            "American",
            "Japanese"
        ],
        "answer": 0,
        "note": "England is the country; English is the nationality."
    },
    {
        "id": "q011",
        "question": "As seen in class: What is the nationality for China?",
        "options": [
            "Chinese",
            "China",
            "Chinish",
            "Chinan"
        ],
        "answer": 0,
        "note": "China is the country; Chinese is the nationality."
    },
    {
        "id": "q012",
        "question": "As seen in class: Which word is a country?",
        "options": [
            "Brazil",
            "Brazilian",
            "English",
            "French"
        ],
        "answer": 0,
        "note": "Brazil is a country; Brazilian is a nationality."
    },
    {
        "id": "q013",
        "question": "As seen in class: Which word is a nationality?",
        "options": [
            "Argentinian",
            "Argentina",
            "January",
            "kitchen"
        ],
        "answer": 0,
        "note": "Argentinian is a nationality."
    },
    {
        "id": "q014",
        "question": "As seen in class: Complete: I study at school. I am a ____.",
        "options": [
            "student",
            "driver",
            "cook",
            "farmer"
        ],
        "answer": 0,
        "note": "A student studies at school."
    },
    {
        "id": "q015",
        "question": "As seen in class: Complete: She works in a hospital. She is a ____.",
        "options": [
            "doctor",
            "driver",
            "farmer",
            "soccer player"
        ],
        "answer": 0,
        "note": "Doctor is an occupation connected to hospitals."
    },
    {
        "id": "q016",
        "question": "As seen in class: Complete: He drives a bus. He is a ____.",
        "options": [
            "driver",
            "teacher",
            "nurse",
            "cook"
        ],
        "answer": 0,
        "note": "A driver drives vehicles."
    },
    {
        "id": "q017",
        "question": "As seen in class: Complete: My aunt works in a school. She is a ____.",
        "options": [
            "teacher",
            "farmer",
            "driver",
            "police officer"
        ],
        "answer": 0,
        "note": "A teacher works in a school."
    },
    {
        "id": "q018",
        "question": "As seen in class: Complete: He prepares food in a restaurant. He is a ____.",
        "options": [
            "cook",
            "student",
            "doctor",
            "driver"
        ],
        "answer": 0,
        "note": "A cook prepares food."
    },
    {
        "id": "q019",
        "question": "As seen in class: Complete: He plays soccer professionally. He is a ____.",
        "options": [
            "soccer player",
            "nurse",
            "teacher",
            "farmer"
        ],
        "answer": 0,
        "note": "A soccer player plays soccer."
    },
    {
        "id": "q020",
        "question": "As seen in class: Choose the correct sentence.",
        "options": [
            "She is a nurse.",
            "She are a nurse.",
            "She am a nurse.",
            "She be a nurse."
        ],
        "answer": 0,
        "note": "Use “is” with she."
    },
    {
        "id": "q021",
        "question": "As seen in class: Choose the correct sentence.",
        "options": [
            "They are students.",
            "They is students.",
            "They am students.",
            "They was students."
        ],
        "answer": 0,
        "note": "Use “are” with they in the present."
    },
    {
        "id": "q022",
        "question": "As seen in class: Which word is an occupation?",
        "options": [
            "farmer",
            "February",
            "Brazilian",
            "under"
        ],
        "answer": 0,
        "note": "Farmer is an occupation."
    },
    {
        "id": "q023",
        "question": "As seen in class: Complete: My mother is a teacher. “teacher” is a/an ____.",
        "options": [
            "occupation",
            "month",
            "preposition",
            "nationality"
        ],
        "answer": 0,
        "note": "Teacher is a job/occupation."
    },
    {
        "id": "q024",
        "question": "As seen in class: Which month comes after March?",
        "options": [
            "April",
            "January",
            "February",
            "December"
        ],
        "answer": 0,
        "note": "The order is January, February, March, April."
    },
    {
        "id": "q025",
        "question": "As seen in class: Which month comes before February?",
        "options": [
            "January",
            "March",
            "May",
            "June"
        ],
        "answer": 0,
        "note": "January comes before February."
    },
    {
        "id": "q026",
        "question": "As seen in class: Which month comes after November?",
        "options": [
            "December",
            "October",
            "September",
            "July"
        ],
        "answer": 0,
        "note": "December comes after November."
    },
    {
        "id": "q027",
        "question": "As seen in class: Which month comes before May?",
        "options": [
            "April",
            "June",
            "August",
            "March"
        ],
        "answer": 0,
        "note": "April comes before May."
    },
    {
        "id": "q028",
        "question": "As seen in class: Complete: Christmas is in ____.",
        "options": [
            "December",
            "July",
            "March",
            "October"
        ],
        "answer": 0,
        "note": "Christmas is in December."
    },
    {
        "id": "q029",
        "question": "As seen in class: Complete: My birthday is in ____.",
        "options": [
            "May",
            "Brazil",
            "teacher",
            "under"
        ],
        "answer": 0,
        "note": "Use a month after “in” for birthdays."
    },
    {
        "id": "q030",
        "question": "As seen in class: Which option has months in the correct order?",
        "options": [
            "January, February, March",
            "March, January, February",
            "February, January, March",
            "April, February, March"
        ],
        "answer": 0,
        "note": "The year starts with January, February, March."
    },
    {
        "id": "q031",
        "question": "As seen in class: In English, months usually start with ____.",
        "options": [
            "a capital letter",
            "a number",
            "an apostrophe",
            "a preposition"
        ],
        "answer": 0,
        "note": "Months are capitalized in English."
    },
    {
        "id": "q032",
        "question": "As seen in class: Which word is a month?",
        "options": [
            "September",
            "student",
            "sister",
            "sofa"
        ],
        "answer": 0,
        "note": "September is a month."
    },
    {
        "id": "q033",
        "question": "As seen in class: Which month is between June and August?",
        "options": [
            "July",
            "May",
            "April",
            "October"
        ],
        "answer": 0,
        "note": "July comes between June and August."
    },
    {
        "id": "q034",
        "question": "As seen in class: My mother’s mother is my ____.",
        "options": [
            "grandmother",
            "aunt",
            "sister",
            "daughter"
        ],
        "answer": 0,
        "note": "Grandmother means your parent’s mother."
    },
    {
        "id": "q035",
        "question": "As seen in class: My father’s father is my ____.",
        "options": [
            "grandfather",
            "brother",
            "uncle",
            "son"
        ],
        "answer": 0,
        "note": "Grandfather means your parent’s father."
    },
    {
        "id": "q036",
        "question": "As seen in class: My mom and dad are my ____.",
        "options": [
            "parents",
            "children",
            "siblings",
            "cousins"
        ],
        "answer": 0,
        "note": "Parents means mother and father."
    },
    {
        "id": "q037",
        "question": "As seen in class: My brother and sister are my ____.",
        "options": [
            "siblings",
            "parents",
            "grandparents",
            "uncles"
        ],
        "answer": 0,
        "note": "Siblings means brothers and sisters."
    },
    {
        "id": "q038",
        "question": "As seen in class: My aunt’s child is my ____.",
        "options": [
            "cousin",
            "father",
            "grandmother",
            "wife"
        ],
        "answer": 0,
        "note": "A cousin can be your aunt’s or uncle’s child."
    },
    {
        "id": "q039",
        "question": "As seen in class: My mother’s brother is my ____.",
        "options": [
            "uncle",
            "grandfather",
            "son",
            "nephew"
        ],
        "answer": 0,
        "note": "Your mother’s brother is your uncle."
    },
    {
        "id": "q040",
        "question": "As seen in class: My father’s sister is my ____.",
        "options": [
            "aunt",
            "daughter",
            "cousin",
            "grandchild"
        ],
        "answer": 0,
        "note": "Your father’s sister is your aunt."
    },
    {
        "id": "q041",
        "question": "As seen in class: A boy child in a family is a ____.",
        "options": [
            "son",
            "daughter",
            "sister",
            "mother"
        ],
        "answer": 0,
        "note": "Son means a male child."
    },
    {
        "id": "q042",
        "question": "As seen in class: A girl child in a family is a ____.",
        "options": [
            "daughter",
            "son",
            "father",
            "brother"
        ],
        "answer": 0,
        "note": "Daughter means a female child."
    },
    {
        "id": "q043",
        "question": "As seen in class: Which word means “parente”?",
        "options": [
            "relative",
            "parents",
            "person",
            "people"
        ],
        "answer": 0,
        "note": "Relative means parente; parents means pais."
    },
    {
        "id": "q044",
        "question": "As seen in class: Which word means “filhos/crianças”?",
        "options": [
            "children",
            "childs",
            "childes",
            "childies"
        ],
        "answer": 0,
        "note": "Children is the plural of child."
    },
    {
        "id": "q045",
        "question": "As seen in class: Which word means “mãe”?",
        "options": [
            "mother",
            "father",
            "brother",
            "aunt"
        ],
        "answer": 0,
        "note": "Mother means mãe."
    },
    {
        "id": "q046",
        "question": "As seen in class: Which word means “pai”?",
        "options": [
            "father",
            "mother",
            "sister",
            "daughter"
        ],
        "answer": 0,
        "note": "Father means pai."
    },
    {
        "id": "q047",
        "question": "As seen in class: Choose the correct possessive form: the pencil of Maria.",
        "options": [
            "Maria’s pencil",
            "Marias pencil",
            "Pencil’s Maria",
            "Maria pencil’s"
        ],
        "answer": 0,
        "note": "Use name + ’s to show possession."
    },
    {
        "id": "q048",
        "question": "As seen in class: Choose the correct possessive form: the car of João.",
        "options": [
            "João’s car",
            "Joãos car",
            "Car’s João",
            "João car’s"
        ],
        "answer": 0,
        "note": "Use name + ’s to show possession."
    },
    {
        "id": "q049",
        "question": "As seen in class: Choose the correct meaning of “Lucas’s book”.",
        "options": [
            "the book of Lucas",
            "the Lucas of book",
            "Lucas is a book",
            "the books of Lucas"
        ],
        "answer": 0,
        "note": "The possessive ’s shows ownership."
    },
    {
        "id": "q050",
        "question": "As seen in class: Complete: My ____ house = the house of my parents.",
        "options": [
            "parents’",
            "parent’s",
            "parents",
            "parentes"
        ],
        "answer": 0,
        "note": "For a regular plural ending in -s, add only an apostrophe."
    },
    {
        "id": "q051",
        "question": "As seen in class: Complete: The ____ toys = the toys of the children.",
        "options": [
            "children’s",
            "childrens",
            "children’",
            "child’s"
        ],
        "answer": 0,
        "note": "Children is irregular, so use children’s."
    },
    {
        "id": "q052",
        "question": "As seen in class: What does the possessive case show?",
        "options": [
            "possession",
            "month order",
            "nationality",
            "place in a room"
        ],
        "answer": 0,
        "note": "Possessive case shows that something belongs to someone."
    },
    {
        "id": "q053",
        "question": "As seen in class: Choose the correct plural of cat.",
        "options": [
            "cats",
            "cates",
            "caties",
            "catves"
        ],
        "answer": 0,
        "note": "The general plural rule adds -s."
    },
    {
        "id": "q054",
        "question": "As seen in class: Choose the correct plural of box.",
        "options": [
            "boxes",
            "boxs",
            "boxies",
            "boxves"
        ],
        "answer": 0,
        "note": "Words ending in x usually add -es."
    },
    {
        "id": "q055",
        "question": "As seen in class: Choose the correct plural of church.",
        "options": [
            "churches",
            "churchs",
            "churchies",
            "churchves"
        ],
        "answer": 0,
        "note": "Words ending in ch usually add -es."
    },
    {
        "id": "q056",
        "question": "As seen in class: Choose the correct plural of baby.",
        "options": [
            "babies",
            "babys",
            "babyes",
            "babyses"
        ],
        "answer": 0,
        "note": "Consonant + y changes to -ies."
    },
    {
        "id": "q057",
        "question": "As seen in class: Choose the correct plural of boy.",
        "options": [
            "boys",
            "boies",
            "boyes",
            "boyves"
        ],
        "answer": 0,
        "note": "Vowel + y usually adds -s."
    },
    {
        "id": "q058",
        "question": "As seen in class: Choose the correct plural of knife.",
        "options": [
            "knives",
            "knifes",
            "knifies",
            "knifees"
        ],
        "answer": 0,
        "note": "Some words ending in f/fe change to -ves."
    },
    {
        "id": "q059",
        "question": "As seen in class: Choose the correct plural of leaf.",
        "options": [
            "leaves",
            "leafs",
            "leafes",
            "leafies"
        ],
        "answer": 0,
        "note": "Leaf changes to leaves."
    },
    {
        "id": "q060",
        "question": "As seen in class: Choose the correct plural of tomato.",
        "options": [
            "tomatoes",
            "tomatos",
            "tomatoies",
            "tomatoves"
        ],
        "answer": 0,
        "note": "Many consonant + o words add -es."
    },
    {
        "id": "q061",
        "question": "As seen in class: Choose the correct plural of photo.",
        "options": [
            "photos",
            "photoes",
            "photies",
            "photoves"
        ],
        "answer": 0,
        "note": "Photo is a common exception and adds -s."
    },
    {
        "id": "q062",
        "question": "As seen in class: Choose the correct plural of man.",
        "options": [
            "men",
            "mans",
            "manies",
            "manes"
        ],
        "answer": 0,
        "note": "Man has an irregular plural: men."
    },
    {
        "id": "q063",
        "question": "As seen in class: Choose the correct plural of woman.",
        "options": [
            "women",
            "womans",
            "womanes",
            "womanies"
        ],
        "answer": 0,
        "note": "Woman has an irregular plural: women."
    },
    {
        "id": "q064",
        "question": "As seen in class: Choose the correct plural of tooth.",
        "options": [
            "teeth",
            "tooths",
            "toothes",
            "toothies"
        ],
        "answer": 0,
        "note": "Tooth has an irregular plural: teeth."
    },
    {
        "id": "q065",
        "question": "As seen in class: Choose the correct plural of fish.",
        "options": [
            "fish",
            "fishes only",
            "fishs",
            "fishies"
        ],
        "answer": 0,
        "note": "Fish can be unchanged in plural."
    },
    {
        "id": "q066",
        "question": "As seen in class: Choose the correct plural of sheep.",
        "options": [
            "sheep",
            "sheeps",
            "sheepes",
            "sheepies"
        ],
        "answer": 0,
        "note": "Sheep is unchanged in plural."
    },
    {
        "id": "q067",
        "question": "As seen in class: Choose the correct plural of person for everyday use.",
        "options": [
            "people",
            "persons",
            "persones",
            "personies"
        ],
        "answer": 0,
        "note": "People is the common plural of person."
    },
    {
        "id": "q068",
        "question": "As seen in class: The fridge is usually in the ____.",
        "options": [
            "kitchen",
            "bathroom",
            "garage",
            "bedroom"
        ],
        "answer": 0,
        "note": "Kitchen vocabulary was part of the house unit."
    },
    {
        "id": "q069",
        "question": "As seen in class: The bed is usually in the ____.",
        "options": [
            "bedroom",
            "kitchen",
            "garden",
            "garage"
        ],
        "answer": 0,
        "note": "A bed is usually in the bedroom."
    },
    {
        "id": "q070",
        "question": "As seen in class: The sofa is usually in the ____.",
        "options": [
            "living room",
            "bathroom",
            "garage",
            "yard"
        ],
        "answer": 0,
        "note": "A sofa is usually in the living room."
    },
    {
        "id": "q071",
        "question": "As seen in class: The mirror is usually in the ____.",
        "options": [
            "bathroom",
            "garden",
            "garage",
            "dining room"
        ],
        "answer": 0,
        "note": "A mirror is often in the bathroom."
    },
    {
        "id": "q072",
        "question": "As seen in class: A table is usually in the ____.",
        "options": [
            "dining room",
            "bathroom",
            "garage",
            "yard"
        ],
        "answer": 0,
        "note": "Dining room is connected to meals and tables."
    },
    {
        "id": "q073",
        "question": "As seen in class: Which word is furniture?",
        "options": [
            "chair",
            "bedroom",
            "kitchen",
            "garden"
        ],
        "answer": 0,
        "note": "Chair is furniture."
    },
    {
        "id": "q074",
        "question": "As seen in class: Which word is a part of the house?",
        "options": [
            "garage",
            "sofa",
            "bed",
            "table"
        ],
        "answer": 0,
        "note": "Garage is a part of the house."
    },
    {
        "id": "q075",
        "question": "As seen in class: Which item keeps food cold?",
        "options": [
            "fridge",
            "stove",
            "sofa",
            "wardrobe"
        ],
        "answer": 0,
        "note": "A fridge keeps food cold."
    },
    {
        "id": "q076",
        "question": "As seen in class: Which item is used to cook food?",
        "options": [
            "stove",
            "mirror",
            "wardrobe",
            "chair"
        ],
        "answer": 0,
        "note": "A stove is used for cooking."
    },
    {
        "id": "q077",
        "question": "As seen in class: Which item is used to store clothes?",
        "options": [
            "wardrobe",
            "fridge",
            "mirror",
            "yard"
        ],
        "answer": 0,
        "note": "A wardrobe stores clothes."
    },
    {
        "id": "q078",
        "question": "As seen in class: Which place can have flowers?",
        "options": [
            "garden",
            "bathroom",
            "bedroom only",
            "garage only"
        ],
        "answer": 0,
        "note": "A garden can have flowers."
    },
    {
        "id": "q079",
        "question": "As seen in class: Complete: There ____ a bed in the bedroom.",
        "options": [
            "is",
            "are",
            "am",
            "were"
        ],
        "answer": 0,
        "note": "Use “there is” for one thing."
    },
    {
        "id": "q080",
        "question": "As seen in class: Complete: There ____ two chairs in the kitchen.",
        "options": [
            "are",
            "is",
            "am",
            "was"
        ],
        "answer": 0,
        "note": "Use “there are” for plural objects."
    },
    {
        "id": "q081",
        "question": "As seen in class: Complete: There ____ a fridge in the kitchen.",
        "options": [
            "is",
            "are",
            "were",
            "am"
        ],
        "answer": 0,
        "note": "A fridge is singular, so use “there is.”"
    },
    {
        "id": "q082",
        "question": "As seen in class: Complete: There ____ three bedrooms in my house.",
        "options": [
            "are",
            "is",
            "am",
            "was"
        ],
        "answer": 0,
        "note": "Three bedrooms is plural, so use “there are.”"
    },
    {
        "id": "q083",
        "question": "As seen in class: Choose the singular question.",
        "options": [
            "Is there a sofa?",
            "Are there chairs?",
            "There are books.",
            "There aren’t tables."
        ],
        "answer": 0,
        "note": "Use “Is there...?” for singular."
    },
    {
        "id": "q084",
        "question": "As seen in class: Choose the plural question.",
        "options": [
            "Are there chairs?",
            "Is there a sofa?",
            "There is a bed.",
            "There isn’t a TV."
        ],
        "answer": 0,
        "note": "Use “Are there...?” for plural."
    },
    {
        "id": "q085",
        "question": "As seen in class: Complete: There ____ books on the table.",
        "options": [
            "are",
            "is",
            "am",
            "was"
        ],
        "answer": 0,
        "note": "Books is plural, so use “there are.”"
    },
    {
        "id": "q086",
        "question": "As seen in class: Complete: There ____ a TV in the bathroom.",
        "options": [
            "isn’t",
            "aren’t",
            "am not",
            "weren’t"
        ],
        "answer": 0,
        "note": "Use “there isn’t” for singular negative."
    },
    {
        "id": "q087",
        "question": "As seen in class: Complete: The pencil is ____ the table.",
        "options": [
            "on",
            "January",
            "Brazilian",
            "doctor"
        ],
        "answer": 0,
        "note": "On is a preposition of place."
    },
    {
        "id": "q088",
        "question": "As seen in class: Complete: The ball is ____ the chair.",
        "options": [
            "under",
            "teacher",
            "April",
            "Brazil"
        ],
        "answer": 0,
        "note": "Under means embaixo de."
    },
    {
        "id": "q089",
        "question": "As seen in class: Complete: The book is ____ the bag.",
        "options": [
            "in",
            "on top only",
            "French",
            "cook"
        ],
        "answer": 0,
        "note": "In means dentro/em."
    },
    {
        "id": "q090",
        "question": "As seen in class: Complete: The sofa is ____ the table.",
        "options": [
            "next to",
            "February",
            "student",
            "American"
        ],
        "answer": 0,
        "note": "Next to means beside/ao lado de."
    },
    {
        "id": "q091",
        "question": "As seen in class: Complete: The chair is ____ the bed and the wardrobe.",
        "options": [
            "between",
            "behind",
            "in front of",
            "under only"
        ],
        "answer": 0,
        "note": "Between means between two things."
    },
    {
        "id": "q092",
        "question": "As seen in class: Complete: The garden is ____ the house.",
        "options": [
            "behind",
            "January",
            "nurse",
            "Brazilian"
        ],
        "answer": 0,
        "note": "Behind means atrás de."
    },
    {
        "id": "q093",
        "question": "As seen in class: Complete: The car is ____ the garage.",
        "options": [
            "in front of",
            "doctor",
            "December",
            "Japanese"
        ],
        "answer": 0,
        "note": "In front of means em frente de."
    },
    {
        "id": "q094",
        "question": "As seen in class: Which subject pronoun matches Maria?",
        "options": [
            "she",
            "he",
            "they",
            "it"
        ],
        "answer": 0,
        "note": "Use she for a female singular subject."
    },
    {
        "id": "q095",
        "question": "As seen in class: Which subject pronoun matches João?",
        "options": [
            "he",
            "she",
            "we",
            "it"
        ],
        "answer": 0,
        "note": "Use he for a male singular subject."
    },
    {
        "id": "q096",
        "question": "As seen in class: Which subject pronoun matches “my friends”?",
        "options": [
            "they",
            "he",
            "she",
            "it"
        ],
        "answer": 0,
        "note": "Use they for plural people."
    },
    {
        "id": "q097",
        "question": "As seen in class: Complete in the present: They ____ the champions.",
        "options": [
            "are",
            "is",
            "am",
            "was"
        ],
        "answer": 0,
        "note": "They uses are in the present."
    },
    {
        "id": "q098",
        "question": "As seen in class: Complete in the past: She ____ beautiful.",
        "options": [
            "was",
            "were",
            "are",
            "am"
        ],
        "answer": 0,
        "note": "She uses was in the past."
    },
    {
        "id": "q099",
        "question": "As seen in class: Complete in the present: I ____ proud.",
        "options": [
            "am",
            "is",
            "are",
            "were"
        ],
        "answer": 0,
        "note": "I uses am in the present."
    },
    {
        "id": "q100",
        "question": "As seen in class: Complete in the past: You ____ strong.",
        "options": [
            "were",
            "was",
            "is",
            "am"
        ],
        "answer": 0,
        "note": "You uses were in the past."
    },
    {
        "id": "q101",
        "question": "As seen in class: Complete in the future: He ____ strong.",
        "options": [
            "will be",
            "was",
            "are",
            "am"
        ],
        "answer": 0,
        "note": "Use will be for future with verb to be."
    },
    {
        "id": "q102",
        "question": "As seen in class: Which object pronoun matches “she”?",
        "options": [
            "her",
            "him",
            "us",
            "them"
        ],
        "answer": 0,
        "note": "She becomes her as an object pronoun."
    },
    {
        "id": "q103",
        "question": "As seen in class: Which object pronoun matches “he”?",
        "options": [
            "him",
            "her",
            "it",
            "us"
        ],
        "answer": 0,
        "note": "He becomes him as an object pronoun."
    },
    {
        "id": "q104",
        "question": "As seen in class: Which object pronoun matches “they”?",
        "options": [
            "them",
            "us",
            "me",
            "you only"
        ],
        "answer": 0,
        "note": "They becomes them as an object pronoun."
    },
    {
        "id": "q105",
        "question": "As seen in class: Which object pronoun matches “we”?",
        "options": [
            "us",
            "them",
            "him",
            "her"
        ],
        "answer": 0,
        "note": "We becomes us as an object pronoun."
    }
];


  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const pageLabels = [
    "Capa",
    "Página 2 · Figurinhas 00–08",
    "Página 3 · Figurinhas 09–16",
    "Página 4 · Figurinhas 17–24",
    "Página 5 · Figurinhas 25–32",
    "Página 6 · Figurinhas 33–40",
    "Página 7 · Figurinhas 41–48",
    "Página 8 · Figurinhas 49–56",
    "Página 9 · Figurinhas 57–64",
    "Página 10 · Figurinhas extras 61–66",
    "Página 11 · Figurinhas extras 67–73",
    "Contracapa",
  ];

  const pageAlts = [
    "Capa do álbum World Stars 2026",
    "Primeira página interna do álbum, com nove espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Última página com espaços para figurinhas",
    "Página 10 com figurinhas extras",
    "Página 11 com figurinhas extras",
    "Contracapa do álbum World Stars 2026",
  ];

  const topSlot = { left: 39.53, top: 4.05, width: 21.78, height: 22.1 };
  const gridSlots = [
    { left: 3.04, top: 27.7, width: 21.85, height: 22.1 },
    { left: 27.37, top: 27.7, width: 21.85, height: 22.1 },
    { left: 51.27, top: 27.7, width: 21.85, height: 22.1 },
    { left: 75.25, top: 27.7, width: 21.85, height: 22.1 },
    { left: 3.04, top: 52.45, width: 21.85, height: 22.1 },
    { left: 27.37, top: 52.45, width: 21.85, height: 22.1 },
    { left: 51.27, top: 52.45, width: 21.85, height: 22.1 },
    { left: 75.25, top: 52.45, width: 21.85, height: 22.1 },
  ];

  const specialPage10Slots = [
    { left: 7.5, top: 9.5, width: 24, height: 22.8 },
    { left: 38, top: 9.5, width: 24, height: 22.8 },
    { left: 68.5, top: 9.5, width: 24, height: 22.8 },
    { left: 7.5, top: 35.5, width: 24, height: 22.8 },
    { left: 38, top: 35.5, width: 24, height: 22.8 },
    { left: 68.5, top: 35.5, width: 24, height: 22.8 },
  ];

  const specialPage11Slots = [
    { left: 6.5, top: 10, width: 20.5, height: 21.8 },
    { left: 28.6, top: 10, width: 20.5, height: 21.8 },
    { left: 50.7, top: 10, width: 20.5, height: 21.8 },
    { left: 72.8, top: 10, width: 20.5, height: 21.8 },
    { left: 12.5, top: 36.8, width: 24, height: 22.8 },
    { left: 38, top: 36.8, width: 24, height: 22.8 },
    { left: 63.5, top: 36.8, width: 24, height: 22.8 },
  ];

  let state = loadState();
  let currentView = "album";
  let currentFilter = "all";
  let pasteTarget = null;
  let pendingQuizStickerId = null;
  let currentQuiz = null;
  let currentProfileStickerId = null;
  let justPasted = null;
  let toastTimer = 0;
  let sourceObjectUrl = null;
  let sourceImage = null;
  let lastMatch = null;
  let pointerDrag = null;
  let pageSwipe = null;
  let suppressPageClick = false;
  let isPageFullscreen = false;
  let musicUnlocked = false;
  let crop = { zoom: 1, offsetX: 0, offsetY: 0 };

  const elements = {
    albumView: $("#albumView"),
    inventoryView: $("#inventoryView"),
    albumPage: $("#albumPage"),
    pageWrap: $("#pageWrap"),
    stickerLayer: $("#stickerLayer"),
    pageStrip: $("#pageStrip"),
    previousPage: $("#previousPage"),
    nextPage: $("#nextPage"),
    pageCounter: $("#pageCounter"),
    pageEyebrow: $("#pageEyebrow"),
    miniInventory: $("#miniInventory"),
    inventoryGrid: $("#inventoryGrid"),
    filterCount: $("#filterCount"),
    pasteBanner: $("#pasteBanner"),
    pasteThumb: $("#pasteThumb"),
    pasteTitle: $("#pasteTitle"),
    scannerModal: $("#scannerModal"),
    sourceStep: $("#sourceStep"),
    cropStep: $("#cropStep"),
    analyzingStep: $("#analyzingStep"),
    resultStep: $("#resultStep"),
    cameraInput: $("#cameraInput"),
    galleryInput: $("#galleryInput"),
    cropCanvas: $("#cropCanvas"),
    cropStage: $("#cropStage"),
    zoomRange: $("#zoomRange"),
    resultBadge: $("#resultBadge"),
    resultIcon: $("#resultIcon"),
    resultEyebrow: $("#resultEyebrow"),
    resultTitle: $("#resultTitle"),
    resultMessage: $("#resultMessage"),
    matchedSticker: $("#matchedSticker"),
    matchedLabel: $("#matchedLabel"),
    scoreFill: $("#scoreFill"),
    scoreValue: $("#scoreValue"),
    resultActions: $("#resultActions"),
    toast: $("#toast"),
    toastIcon: $("#toastIcon"),
    toastMessage: $("#toastMessage"),
    confetti: $("#confetti"),
    analysisCanvas: $("#analysisCanvas"),
    fullscreenPage: $("#fullscreenPage"),
    exitFullscreen: $("#exitFullscreen"),
    profileModal: $("#profileModal"),
    profileSticker: $("#profileSticker"),
    profileNumber: $("#profileNumber"),
    profileName: $("#profileName"),
    profileRole: $("#profileRole"),
    profileAge: $("#profileAge"),
    editProfileAge: $("#editProfileAge"),
    profileLocation: $("#profileLocation"),
    profileDescription: $("#profileDescription"),
    editProfileDescription: $("#editProfileDescription"),
    quizModal: $("#quizModal"),
    closeQuiz: $("#closeQuiz"),
    quizSticker: $("#quizSticker"),
    quizNumber: $("#quizNumber"),
    quizQuestion: $("#quizQuestion"),
    quizOptions: $("#quizOptions"),
    quizFeedback: $("#quizFeedback"),
    quizCancel: $("#quizCancel"),
    quizRetry: $("#quizRetry"),
    musicButton: $("#musicButton"),
    musicVolume: $("#musicVolume"),
    musicVolumeLabel: $("#musicVolumeLabel"),
    volumePopover: $("#volumePopover"),
    backgroundMusic: $("#backgroundMusic"),
  };

  function defaultState() {
    return { unlocked: [], placed: [], page: 1, quizAnswered: [], profileEdits: {} };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || !Array.isArray(stored.unlocked) || !Array.isArray(stored.placed)) {
        return defaultState();
      }
      const validIds = new Set(references.map((item) => item.id));
      const unlocked = [...new Set(stored.unlocked.map(Number))].filter((id) => validIds.has(id));
      const placed = [...new Set(stored.placed.map(Number))].filter((id) => validIds.has(id));
      for (const id of placed) if (!unlocked.includes(id)) unlocked.push(id);
      const validQuestionIds = new Set(QUIZ_QUESTIONS.map((item) => item.id || item.question));
      const quizAnswered = Array.isArray(stored.quizAnswered)
        ? [...new Set(stored.quizAnswered.map(String))].filter((id) => validQuestionIds.has(id))
        : [];
      const profileEdits = stored.profileEdits && typeof stored.profileEdits === "object" && !Array.isArray(stored.profileEdits)
        ? Object.fromEntries(
            Object.entries(stored.profileEdits)
              .filter(([id]) => validIds.has(Number(id)))
              .map(([id, value]) => [
                id,
                {
                  age: typeof value?.age === "string" ? value.age : "",
                  description: typeof value?.description === "string" ? value.description : "",
                },
              ])
          )
        : {};
      return {
        unlocked,
        placed,
        page: 1,
        quizAnswered,
        profileEdits,
      };
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // The album still works for the current session when browser storage is unavailable.
    }
  }

  function referenceById(id) {
    return references.find((item) => item.id === Number(id));
  }

  function orderedReferences() {
    return [...references].sort((left, right) => left.albumPosition - right.albumPosition);
  }

  function placementFor(stickerId) {
    const reference = referenceById(stickerId);
    if (!reference) return null;
    const position = Number(reference.albumPosition);
    if (position >= 0 && position <= 8) return { page: 2, slot: position };
    if (position >= 9 && position <= 63) {
      const offset = position - 9;
      return { page: 3 + Math.floor(offset / 8), slot: offset % 8 };
    }
    if (position >= 64 && position <= 69) return { page: 10, slot: position - 64 };
    if (position >= 70 && position <= 76) return { page: 11, slot: position - 70 };
    return null;
  }

  function idsForPage(page) {
    return orderedReferences()
      .filter((reference) => placementFor(reference.id)?.page === page)
      .map((reference) => reference.id);
  }

  function slotPosition(page, slotIndex) {
    if (page === 2) return slotIndex === 0 ? topSlot : gridSlots[slotIndex - 1];
    if (page === 10) return specialPage10Slots[slotIndex];
    if (page === 11) return specialPage11Slots[slotIndex];
    return gridSlots[slotIndex];
  }

  function updateProgress() {
    const unlocked = state.unlocked.length;
    const placed = state.placed.length;
    const collectedPercent = Math.round((unlocked / TOTAL) * 100);
    const placedPercent = Math.round((placed / TOTAL) * 100);

    $("#headerProgress").textContent = `${unlocked}/${TOTAL}`;
    $("#miniProgress i").textContent = collectedPercent;
    $("#miniProgress").style.background = `conic-gradient(var(--yellow) ${collectedPercent}%, rgba(255,255,255,.13) 0)`;
    $("#progressPercent").textContent = `${placedPercent}%`;
    $("#progressRing").style.background = `conic-gradient(var(--yellow) ${placedPercent}%, rgba(255,255,255,.12) 0)`;
    $("#unlockedCount").textContent = unlocked;
    $("#placedCount").textContent = placed;
    $("#statUnlocked").textContent = unlocked;
    $("#statPlaced").textContent = placed;
    $("#statMissing").textContent = TOTAL - unlocked;
  }

  function buildPageStrip() {
    elements.pageStrip.replaceChildren();
    for (let page = 1; page <= 12; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "page-thumbnail";
      button.dataset.page = String(page);
      button.setAttribute("aria-label", `Abrir ${pageLabels[page - 1]}`);
      button.innerHTML = `<img src="assets/album/page-${String(page).padStart(2, "0")}.webp" alt="" loading="lazy"><span>${page}</span>`;
      button.addEventListener("click", () => setPage(page));
      elements.pageStrip.append(button);
    }
  }

  function renderPage(direction = "forward") {
    const page = state.page;
    elements.pageCounter.textContent = `${page} / 12`;
    elements.pageEyebrow.textContent = pageLabels[page - 1];
    elements.previousPage.disabled = page === 1;
    elements.nextPage.disabled = page === 12;
    elements.albumPage.classList.remove("is-ready", "turn-forward", "turn-backward");
    elements.albumPage.alt = pageAlts[page - 1];
    elements.albumPage.onload = () => {
      elements.albumPage.classList.add("is-ready", direction === "backward" ? "turn-backward" : "turn-forward");
    };
    elements.albumPage.src = `assets/album/page-${String(page).padStart(2, "0")}.webp`;

    $$(".page-thumbnail", elements.pageStrip).forEach((thumb) => {
      const active = Number(thumb.dataset.page) === page;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-current", active ? "page" : "false");
      if (active) {
        const targetLeft = thumb.offsetLeft - (elements.pageStrip.clientWidth - thumb.offsetWidth) / 2;
        elements.pageStrip.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      }
    });
    renderStickerLayer();
    preloadPage(page - 1);
    preloadPage(page + 1);
  }

  function preloadPage(page) {
    if (page < 1 || page > 12) return;
    const image = new Image();
    image.src = `assets/album/page-${String(page).padStart(2, "0")}.webp`;
  }

  function setPage(page) {
    const next = clamp(Number(page), 1, 12);
    if (next === state.page) return renderStickerLayer();
    const direction = next < state.page ? "backward" : "forward";
    state.page = next;
    saveState();
    renderPage(direction);
  }

  function renderStickerLayer() {
    elements.stickerLayer.replaceChildren();
    const pageIds = idsForPage(state.page);

    pageIds.forEach((id) => {
      const placement = placementFor(id);
      const position = slotPosition(state.page, placement.slot);
      const reference = referenceById(id);
      if (!position) return;
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "album-slot";
      slot.style.left = `${position.left}%`;
      slot.style.top = `${position.top}%`;
      slot.style.width = `${position.width}%`;
      slot.style.height = `${position.height}%`;
      slot.dataset.stickerId = String(id);
      slot.setAttribute("aria-label", `Espaço da Figurinha ${reference.number}`);

      if (state.placed.includes(id)) {
        const image = document.createElement("img");
        image.src = reference.src;
        image.alt = reference.label;
        image.draggable = false;
        slot.append(image);
        slot.classList.add("has-profile");
        slot.setAttribute("aria-label", `Abrir perfil de ${reference.name}`);
        slot.addEventListener("click", () => openProfile(id));
        if (justPasted === id) {
          slot.classList.add("just-pasted");
          window.setTimeout(() => {
            justPasted = null;
            slot.classList.remove("just-pasted");
          }, 800);
        }
      } else if (pasteTarget === id) {
        slot.classList.add("is-target");
        slot.setAttribute("aria-label", `Colar ${referenceById(id).label} neste espaço`);
        slot.addEventListener("click", () => pasteSticker(id));
      } else if (state.page === 10 || state.page === 11) {
        slot.classList.add("is-special-placeholder");
        slot.dataset.number = reference.number;
      }
      elements.stickerLayer.append(slot);
    });
  }

  function renderMiniInventory() {
    elements.miniInventory.replaceChildren();
    const available = state.unlocked.filter((id) => !state.placed.includes(id)).slice(0, 4);
    for (let index = 0; index < 4; index += 1) {
      const item = document.createElement("div");
      const id = available[index];
      item.className = `mini-sticker${id ? "" : " is-empty"}`;
      if (id) {
        const reference = referenceById(id);
        item.innerHTML = `<img src="${reference.src}" alt="${reference.label}">`;
      } else {
        item.textContent = "+";
        item.setAttribute("aria-hidden", "true");
      }
      elements.miniInventory.append(item);
    }
  }

  function inventoryState(id) {
    if (state.placed.includes(id)) return "placed";
    if (state.unlocked.includes(id)) return "available";
    return "missing";
  }

  function inventoryFilterMatches(id) {
    return currentFilter === "all" || inventoryState(id) === currentFilter;
  }

  function renderInventory() {
    const filtered = orderedReferences().filter((item) => inventoryFilterMatches(item.id));
    elements.filterCount.textContent = `${filtered.length} ${filtered.length === 1 ? "figurinha" : "figurinhas"}`;
    elements.inventoryGrid.replaceChildren();

    filtered.forEach((reference) => {
      const itemState = inventoryState(reference.id);
      const placement = placementFor(reference.id);
      const card = document.createElement("article");
      card.className = `sticker-card is-${itemState}`;
      const stateLabel = itemState === "placed" ? "Colada" : itemState === "available" ? "Nova" : "Faltando";
      const image = itemState === "missing" ? "" : `<img src="${reference.src}" alt="${reference.label}" loading="lazy">`;
      const buttonLabel = itemState === "placed" ? "Ver no álbum" : itemState === "available" ? "Colar no álbum" : "Ainda não encontrada";
      const buttonClass = itemState === "placed" ? "sticker-action secondary" : "sticker-action";
      card.innerHTML = `
        <figure>${image}<span class="sticker-state">${stateLabel}</span></figure>
        <div class="sticker-card-content">
          <strong>${reference.label}</strong>
          <small>Página ${placement.page} · espaço ${placement.slot + 1}</small>
          <button class="${buttonClass}" type="button" ${itemState === "missing" ? "disabled" : ""}>${buttonLabel}</button>
        </div>`;
      if (itemState !== "missing") {
        $(".sticker-action", card).addEventListener("click", () => {
          if (itemState === "available") startPaste(reference.id);
          else viewPlacedSticker(reference.id);
        });
      }
      elements.inventoryGrid.append(card);
    });
  }

  function renderAll() {
    updateProgress();
    renderPage("forward");
    renderMiniInventory();
    renderInventory();
  }

  function switchView(view, options = {}) {
    currentView = view === "inventory" ? "inventory" : "album";
    elements.albumView.classList.toggle("is-active", currentView === "album");
    elements.inventoryView.classList.toggle("is-active", currentView === "inventory");
    $$('[data-view="album"]').forEach((button) => button.classList.toggle("is-active", currentView === "album"));
    $$('[data-view="inventory"]').forEach((button) => button.classList.toggle("is-active", currentView === "inventory"));
    if (!options.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentView === "inventory") renderInventory();
  }

  function startPaste(id) {
    const reference = referenceById(id);
    const placement = placementFor(id);
    if (!reference || !placement || state.placed.includes(id)) return;
    pasteTarget = id;
    elements.pasteThumb.src = reference.src;
    elements.pasteThumb.alt = reference.label;
    elements.pasteTitle.textContent = `${reference.label} pronta`;
    elements.pasteBanner.classList.add("is-visible");
    switchView("album");
    setPage(placement.page);
    renderStickerLayer();
    window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function cancelPaste() {
    pasteTarget = null;
    elements.pasteBanner.classList.remove("is-visible");
    renderStickerLayer();
  }

  function pasteSticker(id) {
    if (pasteTarget !== id || state.placed.includes(id)) return;
    openPasteQuiz(id);
  }

  function finalizePasteSticker(id) {
    if (pasteTarget !== id || state.placed.includes(id)) return;
    state.placed.push(id);
    if (!state.unlocked.includes(id)) state.unlocked.push(id);
    justPasted = id;
    saveState();
    cancelPaste();
    renderAll();
    celebrate(36);
    showToast(`${referenceById(id).label} colada no álbum!`, "★");
    window.setTimeout(() => openProfile(id), 280);
  }


  function quizQuestionId(question) {
    return question?.id || question?.question || "";
  }

  function unansweredQuizPool(previousQuestion = "") {
    const answered = new Set(Array.isArray(state.quizAnswered) ? state.quizAnswered : []);
    let pool = QUIZ_QUESTIONS.filter((question) => !answered.has(quizQuestionId(question)));
    if (pool.length > 1 && previousQuestion) {
      const withoutPrevious = pool.filter((question) => question.question !== previousQuestion);
      if (withoutPrevious.length) pool = withoutPrevious;
    }
    return pool.length ? pool : QUIZ_QUESTIONS.filter((question) => question.question !== previousQuestion) || QUIZ_QUESTIONS;
  }

  function markQuizQuestionAnswered(question) {
    const id = quizQuestionId(question);
    if (!id) return;
    if (!Array.isArray(state.quizAnswered)) state.quizAnswered = [];
    if (!state.quizAnswered.includes(id)) state.quizAnswered.push(id);
    saveState();
  }

  function randomQuizQuestion(previousQuestion = "") {
    const pool = unansweredQuizPool(previousQuestion);
    const question = pool[Math.floor(Math.random() * pool.length)];
    const options = question.options.map((text, index) => ({ text, correct: index === question.answer }));
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    return { ...question, options };
  }

  function renderQuizQuestion(previousQuestion = "") {
    const nextQuestion = randomQuizQuestion(previousQuestion);
    currentQuiz = nextQuestion;
    elements.quizQuestion.textContent = currentQuiz.question;
    elements.quizFeedback.hidden = true;
    elements.quizFeedback.className = "quiz-feedback";
    elements.quizFeedback.textContent = "";
    elements.quizRetry.hidden = true;
    elements.quizOptions.replaceChildren();

    currentQuiz.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.dataset.correct = option.correct ? "true" : "false";
      button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><strong>${option.text}</strong>`;
      button.addEventListener("click", () => answerQuizOption(button, option.correct));
      elements.quizOptions.append(button);
    });
    window.setTimeout(() => $(".quiz-option", elements.quizOptions)?.focus(), 30);
  }

  function openPasteQuiz(id) {
    const reference = referenceById(id);
    if (!reference) return;
    pendingQuizStickerId = id;
    elements.quizSticker.src = reference.src;
    elements.quizSticker.alt = reference.label;
    elements.quizNumber.textContent = `Sticker ${reference.number}`;
    renderQuizQuestion();
    elements.quizModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeQuiz() {
    elements.quizModal.hidden = true;
    pendingQuizStickerId = null;
    currentQuiz = null;
    elements.quizRetry.hidden = true;
    if (elements.scannerModal.hidden && elements.profileModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
  }

  function cancelQuizAttempt() {
    closeQuiz();
    cancelPaste();
    showToast("Figurinha guardada no inventário. Tente colar depois.", "✓");
  }

  function retryQuizQuestion() {
    const previousQuestion = currentQuiz?.question || "";
    renderQuizQuestion(previousQuestion);
  }

  function answerQuizOption(button, isCorrect) {
    const buttons = $$(".quiz-option", elements.quizOptions);
    elements.quizFeedback.hidden = false;

    if (!isCorrect) {
      buttons.forEach((item) => {
        item.disabled = true;
      });
      button.classList.add("is-wrong");
      elements.quizFeedback.className = "quiz-feedback is-wrong";
      elements.quizFeedback.textContent = "Not yet — click Retry for a new question, or Cancel to try later.";
      elements.quizRetry.hidden = false;
      window.setTimeout(() => elements.quizRetry.focus(), 30);
      return;
    }

    buttons.forEach((item) => {
      item.disabled = true;
      if (item.dataset.correct === "true") item.classList.add("is-correct");
    });
    elements.quizFeedback.className = "quiz-feedback is-correct";
    elements.quizFeedback.textContent = currentQuiz?.note ? `Correct! ${currentQuiz.note}` : "Correct!";
    markQuizQuestionAnswered(currentQuiz);
    const stickerId = pendingQuizStickerId;
    window.setTimeout(() => {
      elements.quizModal.hidden = true;
      pendingQuizStickerId = null;
      currentQuiz = null;
      finalizePasteSticker(stickerId);
    }, 650);
  }

  function setMusicVolume(value) {
    const volume = clamp(Number(value) || 0, 0, 100);
    elements.musicVolume.value = String(volume);
    elements.musicVolumeLabel.textContent = `${volume}%`;
    elements.backgroundMusic.volume = volume / 100;
    elements.musicButton.classList.toggle("is-muted", volume === 0);
  }

  function startBackgroundMusic() {
    if (!elements.backgroundMusic || document.hidden) return;
    musicUnlocked = true;
    const playback = elements.backgroundMusic.play();
    if (playback && typeof playback.then === "function") {
      playback
        .then(() => elements.musicButton.classList.add("is-playing"))
        .catch(() => elements.musicButton.classList.remove("is-playing"));
    }
  }

  function pauseBackgroundMusic() {
    if (!elements.backgroundMusic) return;
    elements.backgroundMusic.pause();
    elements.musicButton.classList.remove("is-playing");
  }

  function toggleVolumePopover() {
    const willOpen = elements.volumePopover.hidden;
    elements.volumePopover.hidden = !willOpen;
    elements.musicButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      startBackgroundMusic();
      window.setTimeout(() => elements.musicVolume.focus(), 30);
    }
  }

  function closeVolumePopover() {
    elements.volumePopover.hidden = true;
    elements.musicButton.setAttribute("aria-expanded", "false");
  }

  function viewPlacedSticker(id) {
    const placement = placementFor(id);
    pasteTarget = null;
    elements.pasteBanner.classList.remove("is-visible");
    switchView("album");
    setPage(placement.page);
    window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function profileEditsFor(id) {
    if (!state.profileEdits || typeof state.profileEdits !== "object") state.profileEdits = {};
    return state.profileEdits[String(id)] || {};
  }

  function profileValue(reference, field) {
    const edits = profileEditsFor(reference.id);
    const edited = typeof edits[field] === "string" ? edits[field].trim() : "";
    return edited || reference[field] || "Não informada";
  }

  function saveProfileEdit(id, field, value) {
    if (!state.profileEdits || typeof state.profileEdits !== "object") state.profileEdits = {};
    const key = String(id);
    const current = state.profileEdits[key] || {};
    const next = String(value || "").trim();
    if (next) {
      state.profileEdits[key] = { ...current, [field]: next };
    } else {
      delete current[field];
      if (current.age || current.description) state.profileEdits[key] = current;
      else delete state.profileEdits[key];
    }
    saveState();
  }

  function refreshProfileText(reference) {
    elements.profileAge.textContent = profileValue(reference, "age");
    elements.profileDescription.textContent = profileValue(reference, "description");
  }

  function editCurrentProfileField(field) {
    if (!currentProfileStickerId) return;
    const reference = referenceById(currentProfileStickerId);
    if (!reference) return;
    const isAge = field === "age";
    const label = isAge ? "idade" : "sobre";
    const current = isAge ? elements.profileAge.textContent : elements.profileDescription.textContent;
    const value = window.prompt(`Editar ${label} de ${reference.name}:`, current);
    if (value === null) return;
    saveProfileEdit(reference.id, field, value);
    refreshProfileText(reference);
    showToast(isAge ? "Idade atualizada." : "Sobre atualizado.", "✎");
  }

  function openProfile(id) {
    const reference = referenceById(id);
    const placement = placementFor(id);
    if (!reference || !placement) return;
    if (isPageFullscreen) exitPageFullscreen();
    elements.profileSticker.src = reference.src;
    elements.profileSticker.alt = reference.label;
    elements.profileNumber.textContent = `Figurinha ${reference.number}`;
    elements.profileName.textContent = reference.name;
    currentProfileStickerId = id;
    elements.profileRole.textContent = reference.role;
    refreshProfileText(reference);
    elements.profileLocation.textContent = `Página ${placement.page} · espaço ${placement.slot + 1}`;
    elements.profileModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#closeProfile").focus(), 30);
  }

  function closeProfile() {
    currentProfileStickerId = null;
    elements.profileModal.hidden = true;
    if (elements.scannerModal.hidden && elements.quizModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
  }

  function enterPageFullscreen() {
    isPageFullscreen = true;
    document.body.classList.add("page-fullscreen-active");
    document.body.style.overflow = "hidden";
    const isTopLevelApp = window.self === window.top;
    if (isTopLevelApp && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    window.setTimeout(() => elements.exitFullscreen.focus(), 80);
  }

  function exitPageFullscreen() {
    isPageFullscreen = false;
    document.body.classList.remove("page-fullscreen-active");
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    if (elements.scannerModal.hidden && elements.profileModal.hidden && elements.quizModal.hidden) document.body.style.overflow = "";
  }

  function openScanner() {
    showScannerStep("source");
    elements.scannerModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#closeScanner").focus(), 30);
  }

  function closeScanner() {
    elements.scannerModal.hidden = true;
    if (elements.profileModal.hidden && elements.quizModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
    elements.cameraInput.value = "";
    elements.galleryInput.value = "";
    if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
    sourceObjectUrl = null;
    sourceImage = null;
    lastMatch = null;
  }

  function showScannerStep(step) {
    elements.sourceStep.hidden = step !== "source";
    elements.cropStep.hidden = step !== "crop";
    elements.analyzingStep.hidden = step !== "analyzing";
    elements.resultStep.hidden = step !== "result";
    if (step !== "result") elements.resultStep.classList.remove("is-failed");
  }

  function receiveFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Escolha um arquivo de imagem.", "!");
      return;
    }
    if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
    sourceObjectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      sourceImage = image;
      crop = { zoom: 1, offsetX: 0, offsetY: 0 };
      elements.zoomRange.value = "1";
      showScannerStep("crop");
      drawCrop();
    };
    image.onerror = () => {
      showToast("Não consegui abrir essa imagem. Tente JPG, PNG ou WEBP.", "!");
      showScannerStep("source");
    };
    image.src = sourceObjectUrl;
  }

  function cropGeometry() {
    if (!sourceImage) return null;
    const canvas = elements.cropCanvas;
    const baseScale = Math.max(canvas.width / sourceImage.naturalWidth, canvas.height / sourceImage.naturalHeight);
    const scale = baseScale * crop.zoom;
    const width = sourceImage.naturalWidth * scale;
    const height = sourceImage.naturalHeight * scale;
    const centerX = (canvas.width - width) / 2;
    const centerY = (canvas.height - height) / 2;
    let x = clamp(centerX + crop.offsetX, canvas.width - width, 0);
    let y = clamp(centerY + crop.offsetY, canvas.height - height, 0);
    crop.offsetX = x - centerX;
    crop.offsetY = y - centerY;
    return { x, y, width, height };
  }

  function drawCrop() {
    if (!sourceImage) return;
    const canvas = elements.cropCanvas;
    const context = canvas.getContext("2d", { alpha: false });
    const geometry = cropGeometry();
    context.fillStyle = "#111827";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(sourceImage, geometry.x, geometry.y, geometry.width, geometry.height);
  }

  function resetFileChoice() {
    elements.cameraInput.value = "";
    elements.galleryInput.value = "";
    showScannerStep("source");
  }

  async function analyzeSticker() {
    if (!sourceImage || !references.length) return;
    showScannerStep("analyzing");
    await wait(760);
    const candidates = createCandidateVariants();
    const scored = references.map((reference) => {
      const score = Math.max(...candidates.map((candidate) => compareFeatures(candidate, reference.features)));
      return { reference, score };
    }).sort((a, b) => b.score - a.score);

    const bestScore = scored[0].score;
    const equivalentMissing = scored.find((result) =>
      result.score >= bestScore - 3 && !state.unlocked.includes(result.reference.id)
    );
    const chosen = state.unlocked.includes(scored[0].reference.id) && equivalentMissing ? equivalentMissing : scored[0];
    lastMatch = { ...chosen, accepted: chosen.score >= PASS_SCORE };

    await wait(260);
    if (lastMatch.accepted && !state.unlocked.includes(lastMatch.reference.id)) {
      state.unlocked.push(lastMatch.reference.id);
      saveState();
      updateProgress();
      renderMiniInventory();
      renderInventory();
      celebrate(44);
    }
    renderMatchResult();
    showScannerStep("result");
    window.setTimeout(() => {
      elements.scoreFill.style.width = `${Math.round(lastMatch.score)}%`;
    }, 60);
  }

  function renderMatchResult() {
    const { reference, score, accepted } = lastMatch;
    const rounded = Math.round(score);
    const alreadyPlaced = state.placed.includes(reference.id);
    const alreadyUnlocked = state.unlocked.includes(reference.id);
    elements.resultStep.classList.toggle("is-failed", !accepted);
    elements.resultIcon.textContent = accepted ? "✓" : "×";
    elements.resultEyebrow.textContent = accepted ? "Figurinha reconhecida" : "Semelhança insuficiente";
    elements.resultTitle.textContent = accepted ? "Match encontrado!" : "Ainda não deu match";
    elements.resultMessage.textContent = accepted
      ? alreadyPlaced
        ? "Essa figurinha já está colada no seu álbum."
        : "A figurinha passou pelo limite de 15% e já entrou no seu inventário."
      : "Ajuste o enquadramento e tente novamente com a figurinha inteira e uma luz mais uniforme.";
    elements.matchedSticker.src = reference.src;
    elements.matchedSticker.alt = reference.label;
    elements.matchedLabel.textContent = reference.label;
    elements.scoreValue.textContent = `${rounded}%`;
    elements.scoreFill.style.width = "0%";
    elements.resultActions.replaceChildren();

    if (accepted) {
      if (!alreadyPlaced) {
        elements.resultActions.append(
          actionButton("Continuar depois", "secondary-button", closeScanner),
          actionButton("Colar agora", "primary-button", () => {
            closeScanner();
            startPaste(reference.id);
          }),
        );
      } else {
        elements.resultActions.append(
          actionButton("Fechar", "secondary-button", closeScanner),
          actionButton("Ver no álbum", "primary-button", () => {
            closeScanner();
            viewPlacedSticker(reference.id);
          }),
        );
      }
      if (alreadyUnlocked && !alreadyPlaced) showToast(`${reference.label} está no inventário.`, "✓");
    } else {
      elements.resultActions.append(
        actionButton("Outra foto", "secondary-button", resetFileChoice),
        actionButton("Reenquadrar", "primary-button", () => showScannerStep("crop")),
      );
    }
  }

  function actionButton(label, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function createCandidateVariants() {
    const source = elements.cropCanvas;
    const variants = [
      [0, 0, 300, 450],
      [4, 6, 292, 438],
      [7, 10, 286, 430],
      [0, 7, 296, 436],
      [4, 0, 292, 440],
    ];
    return variants.map(([x, y, width, height]) => describeCanvas(source, x, y, width, height));
  }

  function canvasPixels(source, sx, sy, sw, sh, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
    return context.getImageData(0, 0, width, height).data;
  }

  function normalizeVector(values) {
    let mean = 0;
    for (const value of values) mean += value;
    mean /= values.length;
    let norm = 0;
    const normalized = new Float32Array(values.length);
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index] - mean;
      normalized[index] = value;
      norm += value * value;
    }
    norm = Math.sqrt(norm);
    if (norm > 1e-7) {
      for (let index = 0; index < normalized.length; index += 1) normalized[index] /= norm;
    }
    return normalized;
  }

  function grayscale(data) {
    const values = new Float32Array(data.length / 4);
    for (let pixel = 0, index = 0; pixel < data.length; pixel += 4, index += 1) {
      const red = data[pixel] / 255;
      const green = data[pixel + 1] / 255;
      const blue = data[pixel + 2] / 255;
      values[index] = red * 0.299 + green * 0.587 + blue * 0.114;
    }
    return values;
  }

  function describeCanvas(source, sx, sy, sw, sh) {
    const base = document.createElement("canvas");
    base.width = 96;
    base.height = 144;
    const baseContext = base.getContext("2d", { willReadFrequently: true });
    baseContext.imageSmoothingEnabled = true;
    baseContext.imageSmoothingQuality = "high";
    baseContext.drawImage(source, sx, sy, sw, sh, 0, 0, 96, 144);

    const smallData = canvasPixels(base, 15, 17, 66, 100, 24, 36);
    const gray = grayscale(smallData);
    const grayNormalized = normalizeVector(gray);
    const edges = new Float32Array(gray.length);
    for (let y = 1; y < 35; y += 1) {
      for (let x = 1; x < 23; x += 1) {
        const index = y * 24 + x;
        const gx = gray[index + 1] - gray[index - 1];
        const gy = gray[index + 24] - gray[index - 24];
        edges[index] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    const edgeNormalized = normalizeVector(edges);

    const coarseData = canvasPixels(base, 15, 17, 66, 100, 12, 18);
    const chromaValues = new Float32Array(12 * 18 * 2);
    for (let pixel = 0, index = 0; pixel < coarseData.length; pixel += 4, index += 2) {
      const red = coarseData[pixel] / 255;
      const green = coarseData[pixel + 1] / 255;
      const blue = coarseData[pixel + 2] / 255;
      const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
      chromaValues[index] = (blue - luminance) * 0.564;
      chromaValues[index + 1] = (red - luminance) * 0.713;
    }
    const chromaNormalized = normalizeVector(chromaValues);

    const mask = new Uint8Array(24 * 36);
    for (let pixel = 0, index = 0; pixel < smallData.length; pixel += 4, index += 1) {
      const red = smallData[pixel] / 255;
      const green = smallData[pixel + 1] / 255;
      const blue = smallData[pixel + 2] / 255;
      const blueBackground = blue > 0.48 && blue > green * 1.12 && green > red * 1.45;
      mask[index] = blueBackground ? 0 : 1;
    }

    const hashData = canvasPixels(base, 15, 17, 66, 100, 9, 8);
    const hashGray = grayscale(hashData);
    const hash = new Uint8Array(64);
    let hashIndex = 0;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        hash[hashIndex] = hashGray[y * 9 + x + 1] >= hashGray[y * 9 + x] ? 1 : 0;
        hashIndex += 1;
      }
    }

    const footerData = canvasPixels(base, 4, 106, 88, 36, 32, 12);
    const footer = normalizeVector(grayscale(footerData));
    return { gray: grayNormalized, edge: edgeNormalized, chroma: chromaNormalized, mask, hash, footer };
  }

  function cosine(candidate, stored) {
    let dot = 0;
    let candidateNorm = 0;
    let storedNorm = 0;
    for (let index = 0; index < candidate.length; index += 1) {
      const left = candidate[index];
      const right = stored[index];
      dot += left * right;
      candidateNorm += left * left;
      storedNorm += right * right;
    }
    return dot / (Math.sqrt(candidateNorm * storedNorm) + 1e-9);
  }

  function compareFeatures(candidate, stored) {
    const gray = cosine(candidate.gray, stored.gray);
    const edge = cosine(candidate.edge, stored.edge);
    const chroma = cosine(candidate.chroma, stored.chroma);
    const footer = cosine(candidate.footer, stored.footer);
    let intersection = 0;
    let union = 0;
    let matchingHash = 0;
    for (let index = 0; index < candidate.mask.length; index += 1) {
      const left = candidate.mask[index] === 1;
      const right = stored.mask[index] === 1;
      if (left && right) intersection += 1;
      if (left || right) union += 1;
    }
    for (let index = 0; index < candidate.hash.length; index += 1) {
      if (candidate.hash[index] === stored.hash[index]) matchingHash += 1;
    }
    const mask = intersection / Math.max(1, union);
    const hash = matchingHash / candidate.hash.length;
    const raw =
      0.27 * ((gray + 1) / 2) +
      0.24 * edge +
      0.14 * ((chroma + 1) / 2) +
      0.08 * hash +
      0.05 * mask +
      0.22 * ((footer + 1) / 2);
    return clamp(((raw - 0.58) / 0.42) * 100, 0, 100);
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function showToast(message, icon = "✓") {
    window.clearTimeout(toastTimer);
    elements.toastMessage.textContent = message;
    elements.toastIcon.textContent = icon;
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2900);
  }

  function celebrate(amount = 40) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ffc400", "#0b9ee8", "#15a95e", "#ffffff", "#e13a53"];
    for (let index = 0; index < amount; index += 1) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--duration", `${2.2 + Math.random() * 1.5}s`);
      piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
      piece.style.setProperty("--spin", `${-540 + Math.random() * 1080}deg`);
      piece.style.animationDelay = `${Math.random() * 0.28}s`;
      elements.confetti.append(piece);
      window.setTimeout(() => piece.remove(), 4100);
    }
  }

  function resetAlbum() {
    const confirmed = window.confirm("Recomeçar o álbum? Todas as figurinhas desbloqueadas e coladas serão removidas deste aparelho.");
    if (!confirmed) return;
    state = defaultState();
    pasteTarget = null;
    saveState();
    elements.pasteBanner.classList.remove("is-visible");
    currentFilter = "all";
    $$("[data-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.filter === "all"));
    renderAll();
    switchView("album");
    showToast("Álbum reiniciado.", "↻");
  }

  function bindEvents() {
    elements.previousPage.addEventListener("click", () => setPage(state.page - 1));
    elements.nextPage.addEventListener("click", () => setPage(state.page + 1));
    $("#brandButton").addEventListener("click", () => {
      switchView("album");
      setPage(1);
    });
    $("#progressChip").addEventListener("click", () => switchView("inventory"));
    $("#resetButton").addEventListener("click", resetAlbum);
    elements.musicButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleVolumePopover();
    });
    elements.volumePopover.addEventListener("click", (event) => event.stopPropagation());
    elements.musicVolume.addEventListener("input", () => {
      setMusicVolume(elements.musicVolume.value);
      startBackgroundMusic();
    });
    const unlockMusic = () => {
      if (!musicUnlocked || elements.backgroundMusic.paused) startBackgroundMusic();
    };
    document.addEventListener("pointerdown", unlockMusic, { passive: true });
    document.addEventListener("keydown", unlockMusic);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseBackgroundMusic();
    });
    window.addEventListener("pagehide", pauseBackgroundMusic);
    window.addEventListener("beforeunload", pauseBackgroundMusic);
    window.addEventListener("blur", () => {
      if (document.visibilityState === "hidden") pauseBackgroundMusic();
    });
    document.addEventListener("click", closeVolumePopover);
    $("#cancelPaste").addEventListener("click", cancelPaste);
    elements.closeQuiz.addEventListener("click", closeQuiz);
    elements.quizCancel.addEventListener("click", cancelQuizAttempt);
    elements.quizRetry.addEventListener("click", retryQuizQuestion);
    elements.fullscreenPage.addEventListener("click", enterPageFullscreen);
    elements.exitFullscreen.addEventListener("click", exitPageFullscreen);
    $("#closeProfile").addEventListener("click", closeProfile);
    $("#profileContinue").addEventListener("click", closeProfile);
    elements.editProfileAge?.addEventListener("click", () => editCurrentProfileField("age"));
    elements.editProfileDescription?.addEventListener("click", () => editCurrentProfileField("description"));

    $$('[data-view]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    [$("#openScanner"), $("#openScannerInventory"), $("#mobileScanner")].forEach((button) => button.addEventListener("click", openScanner));

    $$("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        $$("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderInventory();
      });
    });

    $("#closeScanner").addEventListener("click", closeScanner);
    $("#chooseAnother").addEventListener("click", resetFileChoice);
    $("#analyzeSticker").addEventListener("click", analyzeSticker);
    elements.cameraInput.addEventListener("change", (event) => receiveFile(event.target.files[0]));
    elements.galleryInput.addEventListener("change", (event) => receiveFile(event.target.files[0]));
    elements.zoomRange.addEventListener("input", () => {
      crop.zoom = Number(elements.zoomRange.value);
      drawCrop();
    });

    elements.cropStage.addEventListener("pointerdown", (event) => {
      if (!sourceImage) return;
      elements.cropStage.setPointerCapture(event.pointerId);
      pointerDrag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        offsetX: crop.offsetX,
        offsetY: crop.offsetY,
      };
    });
    elements.cropStage.addEventListener("pointermove", (event) => {
      if (!pointerDrag || pointerDrag.id !== event.pointerId) return;
      const scale = elements.cropCanvas.width / elements.cropStage.clientWidth;
      crop.offsetX = pointerDrag.offsetX + (event.clientX - pointerDrag.x) * scale;
      crop.offsetY = pointerDrag.offsetY + (event.clientY - pointerDrag.y) * scale;
      drawCrop();
    });
    const endPointer = (event) => {
      if (pointerDrag && pointerDrag.id === event.pointerId) pointerDrag = null;
    };
    elements.cropStage.addEventListener("pointerup", endPointer);
    elements.cropStage.addEventListener("pointercancel", endPointer);
    elements.cropStage.addEventListener("wheel", (event) => {
      event.preventDefault();
      crop.zoom = clamp(crop.zoom + (event.deltaY > 0 ? -0.08 : 0.08), 1, 3);
      elements.zoomRange.value = String(crop.zoom);
      drawCrop();
    }, { passive: false });

    elements.pageWrap.addEventListener("pointerdown", (event) => {
      if (pasteTarget || event.target.closest(".fullscreen-exit")) return;
      elements.pageWrap.setPointerCapture(event.pointerId);
      pageSwipe = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
        changed: false,
      };
      elements.pageWrap.classList.add("is-dragging");
    });

    elements.pageWrap.addEventListener("pointermove", (event) => {
      if (!pageSwipe || pageSwipe.id !== event.pointerId || pasteTarget) return;
      const dx = event.clientX - pageSwipe.x;
      const dy = event.clientY - pageSwipe.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) pageSwipe.moved = true;
      if (Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) > 12) event.preventDefault();
    }, { passive: false });

    const finishPageSwipe = (event) => {
      if (!pageSwipe || pageSwipe.id !== event.pointerId || pasteTarget) return;
      const dx = event.clientX - pageSwipe.x;
      const dy = event.clientY - pageSwipe.y;
      const shouldTurn = Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.15;
      pageSwipe.changed = shouldTurn;
      elements.pageWrap.classList.remove("is-dragging");
      if (shouldTurn) {
        suppressPageClick = true;
        setPage(state.page + (dx < 0 ? 1 : -1));
        window.setTimeout(() => { suppressPageClick = false; }, 160);
      }
      window.setTimeout(() => { pageSwipe = null; }, 0);
    };

    const cancelPageSwipe = (event) => {
      if (pageSwipe && pageSwipe.id === event.pointerId) {
        elements.pageWrap.classList.remove("is-dragging");
        pageSwipe = null;
      }
    };

    elements.pageWrap.addEventListener("pointerup", finishPageSwipe);
    elements.pageWrap.addEventListener("pointercancel", cancelPageSwipe);
    elements.pageWrap.addEventListener("lostpointercapture", cancelPageSwipe);
    elements.pageWrap.addEventListener("click", (event) => {
      if (suppressPageClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    elements.scannerModal.addEventListener("click", (event) => {
      if (event.target === elements.scannerModal) closeScanner();
    });
    elements.profileModal.addEventListener("click", (event) => {
      if (event.target === elements.profileModal) closeProfile();
    });
    elements.quizModal.addEventListener("click", (event) => {
      if (event.target === elements.quizModal) closeQuiz();
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && isPageFullscreen) exitPageFullscreen();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.quizModal.hidden) return closeQuiz();
      if (event.key === "Escape" && !elements.profileModal.hidden) return closeProfile();
      if (event.key === "Escape" && !elements.scannerModal.hidden) return closeScanner();
      if (event.key === "Escape" && isPageFullscreen) return exitPageFullscreen();
      if (!elements.scannerModal.hidden || currentView !== "album") return;
      if (event.key === "ArrowLeft") setPage(state.page - 1);
      if (event.key === "ArrowRight") setPage(state.page + 1);
    });
  }

  function initialize() {
    window.__pauseAlbumMusic = pauseBackgroundMusic;
    state.page = 1;
    setMusicVolume(DEFAULT_MUSIC_VOLUME);
    buildPageStrip();
    bindEvents();
    renderAll();
    switchView("album", { keepScroll: true });
  }

  initialize();

  // A tiny local test surface helps verify matching without any network access.
  window.__WORLD_STARS_ALBUM__ = {
    getState: () => JSON.parse(JSON.stringify(state)),
    compareFeatures,
    describeCanvas,
    passScore: PASS_SCORE,
  };
})();
