import React, { useState, useMemo, useRef } from "react";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600&display=swap');
.ork-shimmer::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,transparent 35%,rgba(201,162,75,.45) 50%,transparent 65%);background-size:250% 250%;animation:orkShimmer 3.2s linear infinite;pointer-events:none;}
@keyframes orkShimmer{0%{background-position:150% 0}100%{background-position:-150% 0}}
@keyframes orkReveal{0%{opacity:0;transform:translateY(14px) rotateX(18deg) scale(.94)}100%{opacity:1;transform:translateY(0) rotateX(0) scale(1)}}
@keyframes orkGlow{0%,100%{box-shadow:0 0 34px -8px rgba(201,162,75,.35),0 20px 60px -30px rgba(0,0,0,.9)}50%{box-shadow:0 0 54px -6px rgba(201,162,75,.55),0 20px 60px -30px rgba(0,0,0,.9)}}
@keyframes orkRise{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
@keyframes orkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes orkSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.ork-reveal{animation:orkReveal .7s cubic-bezier(.2,.7,.2,1) both}
.ork-glow{animation:orkGlow 4.5s ease-in-out infinite}
.ork-rise{animation:orkRise .6s ease both}
.ork-float{animation:orkFloat 5s ease-in-out infinite}
.ork-spin{animation:orkSpin 1s linear infinite}
.ork-src{transition:all .25s ease}
.ork-btn{transition:transform .15s ease, filter .25s ease}
.ork-btn:active{transform:scale(.98)}
.ork-quote{overflow:hidden}
.ork-quote::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion: reduce){.ork-shimmer::before,.ork-reveal,.ork-glow,.ork-rise,.ork-float,.ork-spin{animation:none!important}}
`;

const IMAGE_BASE = "";
const AI_ENDPOINT = "https://script.google.com/macros/s/AKfycbwHP8-WFfO5cHzOYbIP5tOgXUWKDngA4CLDr-qtBAoK4uG1jo-1DgqTcmOiSX2psnPl/exec";

// —— Переклади інтерфейсу ——
const T = {
  uk: {
    subtitle: "підказка Всесвіту",
    howMany: "Скільки карт", cardWords: ["карта", "карти", "карти"],
    question: "Твоє питання", questionPh: "Напиши, що зараз хвилює…",
    sources: { tarot: ["Таро", "78 карт"], mac: ["МАК", "образи"], quote: ["Мудрість", "вислови"] },
    getAnswer: "Отримати відповідь", readingOne: "Читаю карту…", readingMany: "Читаю карти…",
    meaning: "Опис", guidance: "Порада",
    apiError: "Не вдалося отримати відповідь. Спробуй ще раз за мить.",
    limit: "На сьогодні ліміт звернень вичерпано. Повертайся завтра 🌙",
    reviews: "Відгуки", leaveReview: "Залишити свій відгук",
    reviewAuthor: "Як тебе підписати?", reviewAuthorPh: "Ім'я, місто (необов'язково)",
    reviewText: "Твій відгук", reviewTextPh: "Поділись, чим був корисним Оракул…",
    reviewNote: "Відгук спершу побачу я — і додам його на сайт після перегляду.",
    reviewNeed: "Напиши, будь ласка, кілька слів 🙏", reviewErr: "Не вдалося надіслати. Спробуй ще раз.",
    reviewSend: "Надіслати відгук", sending: "Надсилаю…",
    reviewDone: "Дякую 🌿 Твій відгук надіслано мені на розгляд — після перегляду я додам його сюди.",
    consult: "Запис на консультацію", consultSub: "Залиш заявку — і я особисто з тобою зв'яжуся",
    name: "Як тебе звати?", namePh: "Твоє ім'я",
    contact: "Як з тобою зв'язатися?", contactPh: "Email, телеграм або телефон",
    request: "З чим хочеш попрацювати?", requestHelp: "Опиши простими словами, що зараз турбує або чого хочеш досягти.",
    requestPh: "Напр.: хочу розібратися зі страхом і повернути енергію до роботи",
    formNeed: "Впиши, будь ласка, ім'я та контакт 🙏", formErr: "Не вдалося надіслати. Спробуй ще раз або напиши в Instagram.",
    formSend: "Надіслати запис", thanks: "Дякую 🌿", formDoneBody: "Твій запис отримано. Я зв'яжуся з тобою найближчим часом.",
    footer: "Не заміна консультації фахівця · простір для рефлексії",
  },
  en: {
    subtitle: "a hint from the Universe",
    howMany: "How many cards", cardWords: ["card", "cards", "cards"],
    question: "Your question", questionPh: "Write what's on your mind…",
    sources: { tarot: ["Tarot", "78 cards"], mac: ["MAC", "images"], quote: ["Wisdom", "quotes"] },
    getAnswer: "Get your answer", readingOne: "Reading the card…", readingMany: "Reading the cards…",
    meaning: "Meaning", guidance: "Guidance",
    apiError: "Couldn't get an answer. Please try again in a moment.",
    limit: "You've reached today's limit. Come back tomorrow 🌙",
    reviews: "Reviews", leaveReview: "Leave a review",
    reviewAuthor: "How should we sign you?", reviewAuthorPh: "Name, city (optional)",
    reviewText: "Your review", reviewTextPh: "Share how the Oracle helped you…",
    reviewNote: "I'll see it first and add it to the site after review.",
    reviewNeed: "Please write a few words 🙏", reviewErr: "Couldn't send. Please try again.",
    reviewSend: "Send review", sending: "Sending…",
    reviewDone: "Thank you 🌿 Your review was sent to me for approval — I'll add it after review.",
    consult: "Book a consultation", consultSub: "Leave a request and I'll personally get in touch",
    name: "What's your name?", namePh: "Your name",
    contact: "How can I reach you?", contactPh: "Email, Telegram or phone",
    request: "What would you like to work on?", requestHelp: "Describe simply what's troubling you or what you want to achieve.",
    requestPh: "e.g. I want to work through fear and bring energy back to my work",
    formNeed: "Please enter your name and contact 🙏", formErr: "Couldn't send. Try again or message me on Instagram.",
    formSend: "Send request", thanks: "Thank you 🌿", formDoneBody: "Your request was received. I'll be in touch soon.",
    footer: "Not a substitute for professional advice · a space to reflect",
  },
};

// —— Старші Аркани: [roman, укр, slug, англ] ——
const MAJORS = [
  ["0","Дурень","fool","The Fool"],["I","Маг","magician","The Magician"],["II","Верховна Жриця","high-priestess","The High Priestess"],["III","Імператриця","empress","The Empress"],
  ["IV","Імператор","emperor","The Emperor"],["V","Ієрофант","hierophant","The Hierophant"],["VI","Закохані","lovers","The Lovers"],["VII","Колісниця","chariot","The Chariot"],
  ["VIII","Сила","strength","Strength"],["IX","Відлюдник","hermit","The Hermit"],["X","Колесо Фортуни","wheel","Wheel of Fortune"],["XI","Справедливість","justice","Justice"],
  ["XII","Повішений","hanged-man","The Hanged Man"],["XIII","Смерть","death","Death"],["XIV","Помірність","temperance","Temperance"],["XV","Диявол","devil","The Devil"],
  ["XVI","Вежа","tower","The Tower"],["XVII","Зірка","star","The Star"],["XVIII","Місяць","moon","The Moon"],["XIX","Сонце","sun","The Sun"],
  ["XX","Суд","judgement","Judgement"],["XXI","Світ","world","The World"],
];
const RANKS = ["Туз","Двійка","Трійка","Четвірка","П'ятірка","Шістка","Сімка","Вісімка","Дев'ятка","Десятка","Паж","Лицар","Королева","Король"];
const RANKS_EN = ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"];
const RANK_SLUGS = ["ace","02","03","04","05","06","07","08","09","10","page","knight","queen","king"];
const SUITS = [
  { name:"Жезлів", en:"Wands", slug:"wands", glyph:"❧", c1:"#3a1710", c2:"#b5502e" },
  { name:"Кубків", en:"Cups", slug:"cups", glyph:"❥", c1:"#0f2630", c2:"#2e6e7e" },
  { name:"Мечів", en:"Swords", slug:"swords", glyph:"✦", c1:"#1a1a2e", c2:"#6b6bad" },
  { name:"Пентаклів", en:"Pentacles", slug:"pentacles", glyph:"✵", c1:"#1a2410", c2:"#7d8f3a" },
];
function buildTarot() {
  const majors = MAJORS.map(([rn,name,sl,en],i)=>({
    kind:"tarot", luk:name, len:en, roman:rn, glyph:"✧",
    slug:`tarot-major-${String(i).padStart(2,"0")}-${sl}`,
    c1:"#241335", c2:"#c9a24b", tuk:"Старший Аркан", ten:"Major Arcana",
  }));
  const minors=[];
  SUITS.forEach((s)=>{ RANKS.forEach((r,ri)=>{ minors.push({
    kind:"tarot", luk:`${r} ${s.name}`, len:`${RANKS_EN[ri]} of ${s.en}`, roman:"", glyph:s.glyph,
    slug:`tarot-${s.slug}-${RANK_SLUGS[ri]}`, c1:s.c1, c2:s.c2, tuk:"Молодший Аркан", ten:"Minor Arcana",
  }); }); });
  return [...majors, ...minors];
}

// —— МАК: [укр, c1, c2, slug, англ] ——
const MAC = [
  ["Туман над рікою","#12271e","#3f6d78","mist","Mist over the river"],
  ["Відчинені двері","#241a2e","#7a5a86","door","An open door"],
  ["Самотнє дерево","#1c2416","#6f8a4a","tree","A lone tree"],
  ["Місток над прірвою","#201720","#8a5a6a","bridge","A bridge over the abyss"],
  ["Розкрита долоня","#2a2016","#c9a24b","palm","An open palm"],
  ["Птах у польоті","#141d2b","#5a7fb0","bird","A bird in flight"],
  ["Ключ до дверей","#10222a","#4a8a99","key","A key to the door"],
  ["Дзеркало води","#1c150e","#d9a64b","mirror","A mirror of water"],
  ["Стежка в лісі","#12271e","#3f6d78","path","A forest path"],
  ["Свічка у темряві","#241a2e","#7a5a86","candle","A candle in the dark"],
  ["Коріння і крона","#1c2416","#6f8a4a","roots","Roots and crown"],
  ["Хвиля","#201720","#8a5a6a","wave","A wave"],
  ["Гірська вершина","#2a2016","#c9a24b","summit","A mountain peak"],
  ["Насінина в землі","#141d2b","#5a7fb0","seed","A seed in the earth"],
  ["Світанок над пагорбами","#10222a","#4a8a99","dawn","Dawn over the hills"],
  ["Роздоріжжя","#1c150e","#d9a64b","crossroads","A crossroads"],
  ["Порожній човен","#12271e","#3f6d78","boat","An empty boat"],
  ["Джерело","#241a2e","#7a5a86","spring","A spring"],
  ["Крила за спиною","#1c2416","#6f8a4a","wings","Wings behind you"],
  ["Лабіринт","#201720","#8a5a6a","labyrinth","A labyrinth"],
  ["Гніздо","#2a2016","#c9a24b","nest","A nest"],
  ["Клубок ниток","#141d2b","#5a7fb0","thread","A ball of thread"],
  ["Спалах світла","#10222a","#4a8a99","burst","A burst of light"],
  ["Хмара в темному небі","#1c150e","#d9a64b","cloud","A cloud in a dark sky"],
  ["Острови в морі","#12271e","#3f6d78","islands","Islands in the sea"],
  ["Світло, що згортається","#241a2e","#7a5a86","inward","Light folding inward"],
  ["Візерунок золота","#1c2416","#6f8a4a","goldpattern","A pattern of gold"],
  ["Плетиво ліній","#201720","#8a5a6a","lines","A weave of lines"],
  ["Спори в тумані","#2a2016","#c9a24b","spores","Spores in the haze"],
  ["Амоніт у камені","#141d2b","#5a7fb0","ammonite","Ammonite in stone"],
  ["Стародавня маска","#10222a","#4a8a99","mask","An ancient mask"],
  ["Терези рівноваги","#1c150e","#d9a64b","scales","Scales of balance"],
  ["Амфора у воді","#12271e","#3f6d78","amphora","An amphora in water"],
  ["Стрілка компаса","#241a2e","#7a5a86","compass","A compass needle"],
  ["Ліхтар над водою","#1c2416","#6f8a4a","lantern","A lantern over water"],
  ["Кокон на гілці","#201720","#8a5a6a","chrysalis","A cocoon on a twig"],
  ["Зачинені брами","#2a2016","#c9a24b","gates","Closed gates"],
  ["Комета","#141d2b","#5a7fb0","comet","A comet"],
  ["Печера у скелі","#10222a","#4a8a99","cave","A cave in the cliff"],
  ["Крило бабки","#1c150e","#d9a64b","dragonfly","A dragonfly wing"],
  ["Перо на книзі","#12271e","#3f6d78","quill","A quill on a book"],
  ["Папороть розгортається","#241a2e","#7a5a86","fern","An unfurling fern"],
  ["Гейзер","#1c2416","#6f8a4a","geyser","A geyser"],
  ["Скляна куля","#201720","#8a5a6a","sphere","A glass sphere"],
  ["Дзвін у тиші","#2a2016","#c9a24b","bell","A bell in silence"],
  ["Крапля, що падає","#141d2b","#5a7fb0","drop","A falling drop"],
  ["Струна арфи","#10222a","#4a8a99","harp","A vibrating harp string"],
  ["Чаша в стовбурі","#1c150e","#d9a64b","hollow","A basin in the trunk"],
  ["Пісочний годинник","#12271e","#3f6d78","hourglass","An hourglass"],
  ["Тінь у тумані","#241a2e","#7a5a86","shadow","A shadow in the mist"],
  ["Замкова шпарина","#1c2416","#6f8a4a","keyhole","A keyhole"],
  ["Туманність","#201720","#8a5a6a","nebula","A nebula"],
  ["Мережа зв'язків","#2a2016","#c9a24b","network","A web of connections"],
  ["Барабан на землі","#141d2b","#5a7fb0","drum","A drum on the earth"],
  ["Сова в дуплі","#10222a","#4a8a99","owl","An owl in the hollow"],
  ["Промінь крізь призму","#1c150e","#d9a64b","prism","A ray through a prism"],
  ["Дощ у просторі","#12271e","#3f6d78","rain","Rain in open space"],
  ["Відлив","#241a2e","#7a5a86","tide","The receding tide"],
  ["Якір на дні","#1c2416","#6f8a4a","anchor","An anchor on the seabed"],
  ["Мушля в піску","#201720","#8a5a6a","shell","A shell in the sand"],
  ["Поділ клітини","#2a2016","#c9a24b","cell","A dividing cell"],
  ["Прожилки листка","#141d2b","#5a7fb0","leaf","The veins of a leaf"],
  ["Вежа в хмарах","#10222a","#4a8a99","spire","A tower in the clouds"],
  ["Спіраль, що постає","#1c150e","#d9a64b","spiral","An emerging spiral"],
  ["Жеода з кристалами","#12271e","#3f6d78","geode","A geode of crystals"],
  ["Розколотий валун","#241a2e","#7a5a86","boulder","A split boulder"],
  ["Камінь у тумані","#1c2416","#6f8a4a","standingstone","A stone in the mist"],
  ["Арка на узбережжі","#201720","#8a5a6a","seaarch","An arch on the shore"],
  ["Кам'яна арка в полі","#2a2016","#c9a24b","archway","A stone archway in a field"],
  ["Чаша в камені","#141d2b","#5a7fb0","basin","A basin in stone"],
  ["Сходинка вгору","#10222a","#4a8a99","step","A step upward"],
  ["Вода по каменях","#1c150e","#d9a64b","cascade","Water over stones"],
  ["Лотос розкривається","#12271e","#3f6d78","lotus","A lotus opening"],
  ["Геометричний візерунок","#241a2e","#7a5a86","geo","A geometric pattern"],
  ["Візерунок серця","#1c2416","#6f8a4a","heartpattern","A pattern of the heart"],
  ["Край золотої тканини","#201720","#8a5a6a","textile","The edge of golden cloth"],
  ["Циферблат у тіні","#2a2016","#c9a24b","dial","A dial in shadow"],
  ["Градієнт світла","#141d2b","#5a7fb0","gradient","A gradient of light"],
];
function buildMac() {
  return MAC.map(([luk,c1,c2,sl,len],i)=>({
    kind:"mac", luk, len, glyph:"◈", roman:"",
    slug:`mac-${String(i+1).padStart(2,"0")}-${sl}`,
    c1, c2, tuk:"Асоціативний образ", ten:"Associative image",
  }));
}

// —— Мудрість: [укр, автор, англ] ——
const QUOTES = [
  ["Подорож у тисячу миль починається з першого кроку.","Лао-цзи","A journey of a thousand miles begins with a single step."],
  ["Той, хто має «навіщо», витримає майже будь-яке «як».","Фрідріх Ніцше","He who has a why to live can bear almost any how."],
  ["Уява важливіша за знання.","Альберт Ейнштейн","Imagination is more important than knowledge."],
  ["Наше життя є те, чим його роблять наші думки.","Марк Аврелій","Our life is what our thoughts make it."],
  ["Ми страждаємо частіше в уяві, ніж насправді.","Сенека","We suffer more often in imagination than in reality."],
  ["Ваш час обмежений — не витрачайте його, живучи чужим життям.","Стів Джобс","Your time is limited, so don't waste it living someone else's life."],
  ["Це завжди здається неможливим, доки не зроблено.","Нельсон Мандела","It always seems impossible until it's done."],
  ["У житті немає чого боятися — його треба лише зрозуміти.","Марі Кюрі","Nothing in life is to be feared, it is only to be understood."],
  ["Немає нічого постійного, окрім змін.","Геракліт","There is nothing permanent except change."],
  ["Сила не у фізичних можливостях, а в незламній волі.","Махатма Ганді","Strength does not come from physical capacity. It comes from an indomitable will."],
  ["Те, що ти шукаєш, теж шукає тебе.","Румі","What you are seeking is also seeking you."],
  ["Хто дивиться назовні — марить; хто дивиться всередину — прокидається.","Карл Юнг","Who looks outside, dreams; who looks inside, awakes."],
  ["Щоб дійти до джерела, треба пливти проти течії.","Станіслав Єжи Лец","To reach the source, you must swim against the current."],
  ["Ми — це те, про що ми думаємо.","Дгаммапада","We are what we think."],
];
function buildQuotes() {
  return QUOTES.map(([luk,author,len])=>({
    kind:"quote", luk, len, author, glyph:"❝", roman:"",
    c1:"#1a1420", c2:"#c9a24b", tuk:"Мудрість", ten:"Wisdom",
  }));
}

const SOURCE_KEYS = [
  { key:"tarot", glyph:"✧" }, { key:"mac", glyph:"◈" }, { key:"quote", glyph:"❝" },
];

const C = {
  bg:"#0E2019", panel:"#14291F", panel2:"#1B3527",
  gold:"#C9A24B", goldSoft:"#E4CF95", cream:"#F3EAD3",
  mauve:"#8AA394", line:"rgba(201,162,75,.20)", ember:"#123D2A",
};

const lbl = (it, lang) => (lang === "en" ? it.len : it.luk);
const tg = (it, lang) => (lang === "en" ? it.ten : it.tuk);

// —— Фаза Місяця ——
function moonInfo(date) {
  var syn = 29.53058867;
  var knownNew = Date.UTC(2000, 0, 6, 18, 14, 0);
  var days = (date.getTime() - knownNew) / 86400000;
  var age = days % syn; if (age < 0) age += syn;
  var lunarDay = Math.floor(age) + 1;
  var p = age / syn;
  var P = [
    ["Новий місяць","New Moon","🌑"],["Молодий місяць, що росте","Waxing Crescent","🌒"],
    ["Перша чверть","First Quarter","🌓"],["Місяць, що росте","Waxing Gibbous","🌔"],
    ["Повний місяць","Full Moon","🌕"],["Місяць, що спадає","Waning Gibbous","🌖"],
    ["Остання чверть","Last Quarter","🌗"],["Спадний серп","Waning Crescent","🌘"],
  ];
  var idx;
  if (p < 0.033 || p >= 0.967) idx = 0;
  else if (p < 0.216) idx = 1; else if (p < 0.284) idx = 2; else if (p < 0.466) idx = 3;
  else if (p < 0.534) idx = 4; else if (p < 0.716) idx = 5; else if (p < 0.784) idx = 6; else idx = 7;
  return { uk: P[idx][0], en: P[idx][1], emoji: P[idx][2], day: lunarDay };
}

// —— М'який денний ліміт ——
var DAILY_LIMIT = 10;
function limitLeft() {
  try {
    var today = new Date().toISOString().slice(0, 10);
    var raw = JSON.parse(localStorage.getItem("orakul_limit") || "{}");
    if (raw.date !== today) return DAILY_LIMIT;
    return Math.max(0, DAILY_LIMIT - (raw.count || 0));
  } catch (e) { return DAILY_LIMIT; }
}
function bumpLimit() {
  try {
    var today = new Date().toISOString().slice(0, 10);
    var raw = JSON.parse(localStorage.getItem("orakul_limit") || "{}");
    if (raw.date !== today) raw = { date: today, count: 0 };
    raw.count = (raw.count || 0) + 1;
    localStorage.setItem("orakul_limit", JSON.stringify(raw));
  } catch (e) {}
}

async function interpret(source, items, question, moon, lang) {
  const en = lang === "en";
  const q = question.trim() || (en ? "General question — what is important for me to realise now." : "Загальний запит — що мені зараз важливо усвідомити.");
  const many = items.length > 1;
  const describe = (it) => {
    if (source === "tarot") return it.roman ? `${lbl(it,lang)} (${it.roman})` : lbl(it,lang);
    if (source === "mac") return en ? `image "${lbl(it,lang)}"` : `образ «${lbl(it,lang)}»`;
    return `"${lbl(it,lang)}" — ${it.author}`;
  };
  const kindWord = source === "tarot" ? (en?"Tarot cards":"карти Таро") : source === "mac" ? (en?"MAC images":"МАК-образи") : (en?"quotes":"вислови");
  const list = items.map((it,i)=>`${i+1}. ${describe(it)}`).join("\n");
  const authors = source === "quote" ? items.map((it)=>it.author).join(", ") : "";

  const system = en
    ? ("You are a warm transformation practitioner blending coaching, psychosomatics and energy practice. " +
       "You speak English, human, caring and concrete, without esoteric pomp and without promises about the future. " +
       "Your language is alive: emotional contact, a simple metaphor, a practical step. " +
       "Where fitting, let the Moon phase gently colour the reading in one light touch (never forced). " +
       "Reply ONLY with valid JSON, no markdown, exactly: {\"description\":\"...\",\"advice\":\"...\"}. " +
       (many ? "description — 3-4 sentences on what these symbols form TOGETHER as one combination for this exact question. "
             : "description — 2-3 sentences on what this symbol opens for this exact question. ") +
       "advice — 2-3 warm sentences with one concrete step for today.")
    : ("Ти — тепла практикиня трансформації, що поєднує коучинг, психосоматику та енергетичні практики. " +
       "Говориш українською, по-людськи, дбайливо й конкретно, без езотеричного пафосу та без обіцянок майбутнього. " +
       "Твоя мова жива: емоційний контакт, проста метафора, практичний крок. " +
       "Якщо доречно, м'яко, одним штрихом, впери передбачення у фазу Місяця (не притягуючи за вуха). " +
       "Відповідай ЛИШЕ валідним JSON без markdown, рівно: {\"description\":\"...\",\"advice\":\"...\"}. " +
       (many ? "description — 3-4 речення про те, що ці символи складають РАЗОМ як єдина комбінація саме для цього запиту. "
             : "description — 2-3 речення про те, що цей символ відкриває саме для цього запиту. ") +
       "advice — 2-3 речення теплої поради з одним конкретним кроком на сьогодні.");

  const user = en
    ? (`Source: ${kindWord}.\nCards drawn: ${items.length}.\n${list}\n` + (moon?`Moon phase today: ${moon}.\n`:"") + `Person's question: "${q}".\n` +
       (many ? "Read them TOGETHER as one combination: how they interact and what they mean together. Give a whole vision, not each one at length."
             : (source==="quote" ? `Explain how this quote answers the question, and give a step. Be sure to name the author (${authors}) naturally in the text, e.g. "the words of Steve Jobs remind you…".` : "Reveal the meaning for this exact question and give a step.")))
    : (`Джерело: ${kindWord}.\nВипало карт: ${items.length}.\n${list}\n` + (moon?`Фаза Місяця сьогодні: ${moon}.\n`:"") + `Запит людини: "${q}".\n` +
       (many ? "Прочитай їх РАЗОМ як одну комбінацію: як вони взаємодіють і що означають у зв'язці. Дай цілісне бачення."
             : (source==="quote" ? `Поясни, як саме цей вислів відповідає на запит, і дай крок. Обов'язково назви автора вислову (${authors}) у тексті — природно, наприклад «слова Стіва Джобса нагадують…».` : "Розкрий значення саме для цього запиту й дай крок.")));

  const body = JSON.stringify({ system, user });
  let text = "";
  for (let attempt = 0; attempt < 3 && !text; attempt++) {
    try {
      const res = await fetch(AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body });
      if (res.ok) { const data = await res.json(); text = (data.text || "").trim(); }
    } catch (e) {}
    if (!text) await new Promise((r) => setTimeout(r, 700));
  }
  if (!text) throw new Error("api");
  return salvage(text);
}

// Дістає description/advice навіть із неповного або "сирого" JSON
function salvage(text) {
  const clean = text.replace(/```json|
