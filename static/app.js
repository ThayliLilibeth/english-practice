const LEITNER_INTERVALS = [1, 2, 4, 7, 14, 30, 60]; // días por caja (0-6)

let state = {
  vocab: [],
  phrases: [],
  phrasalVerbs: [],
  writings: [],
  dailyChallenge: { date: null, verbId: null, answered: false, correct: false },
  stats: { streak: 0, lastStudyDate: null, totalReviews: 0, totalCorrect: 0, writingsReviewed: 0, dailyChallengesCompleted: 0, todayCount: 0 },
  mistakes: [],
  categoryStats: {},
  savedExpressions: [],
};

let currentCard = null;
let cardFlipped = false;
let currentPhrase = null;
let phraseAnswered = false;
let phraseHistory = [];
let currentChallengeVerb = null;

// ---------- utils ----------
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isDue(item) {
  return !item.due || item.due <= todayStr();
}

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function normalize(str) {
  return str.trim().toLowerCase().replace(/[.!?¿¡,]/g, "").replace(/\s+/g, " ");
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

// ---------- persistence ----------
async function loadState() {
  const res = await fetch("/api/data");
  state = await res.json();
  if (!state.mistakes) state.mistakes = [];
  if (!state.categoryStats) state.categoryStats = {};
  if (!state.savedExpressions) state.savedExpressions = [];
}

// records one graded answer for the "English Brain" weak-areas view;
// `detail` (question/wrong/correct) is only needed when the answer was wrong
function logAttempt(category, subcategory, correct, detail) {
  if (!state.categoryStats[category]) state.categoryStats[category] = { correct: 0, incorrect: 0 };
  if (correct) {
    state.categoryStats[category].correct += 1;
  } else {
    state.categoryStats[category].incorrect += 1;
    if (detail) {
      state.mistakes.push({ id: uid("m"), category, subcategory, date: todayStr(), ...detail });
      if (state.mistakes.length > 300) state.mistakes = state.mistakes.slice(-300);
    }
  }
}

async function saveState() {
  await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  renderStatsPill();
}

function registerStudyEvent(correct) {
  const today = todayStr();
  if (state.stats.lastStudyDate !== today) {
    const yesterday = addDaysStr(-1);
    state.stats.streak = state.stats.lastStudyDate === yesterday ? state.stats.streak + 1 : 1;
    state.stats.lastStudyDate = today;
    state.stats.todayCount = 0;
  }
  state.stats.totalReviews += 1;
  state.stats.todayCount = (state.stats.todayCount || 0) + 1;
  if (correct) state.stats.totalCorrect += 1;
}

// ---------- tabs ----------
const TAB_RENDERERS = {
  home: renderHome,
  content: renderLibrary,
  stats: renderStats,
  flashcards: renderFlashcard,
  phrases: renderPhrase,
  challenge: renderChallenge,
  writing: renderWritingHistory,
  reading: initReading,
  material: renderGuide,
  path: initPath,
};

function activateTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.classList.add("active");
  const panel = document.getElementById("tab-" + tabName);
  if (panel) panel.classList.add("active");
  const render = TAB_RENDERERS[tabName];
  if (render) render();
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
}

// ---------- sub-tabs (used inside "Material de apoyo" and "Frases y Gramática") ----------
function setupSubTabs() {
  document.querySelectorAll(".subtabs").forEach((nav) => {
    const panelGroup = nav.parentElement;
    const prefix = panelGroup.id.replace("tab-", "");
    nav.querySelectorAll(".subtab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        nav.querySelectorAll(".subtab-btn").forEach((b) => b.classList.remove("active"));
        panelGroup.querySelectorAll(".subtab-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(prefix + "-" + btn.dataset.subtab).classList.add("active");
        if (prefix === "material" && btn.dataset.subtab === "verbs") renderVerbs();
        if (prefix === "material" && btn.dataset.subtab === "preps") renderPreps();
        if (prefix === "material" && btn.dataset.subtab === "adjectives") renderAdjectiveOrder();
        if (prefix === "material" && btn.dataset.subtab === "connectors") renderConnectors();
        if (prefix === "phrases" && btn.dataset.subtab === "quiz") renderGrammarQuiz();
        if (prefix === "phrases" && btn.dataset.subtab === "preps") renderPrepsQuiz();
        if (prefix === "phrases" && btn.dataset.subtab === "adjectives") renderAdjectivesQuiz();
        if (prefix === "phrases" && btn.dataset.subtab === "connectors") renderConnectorsQuiz();
        if (prefix === "content" && btn.dataset.subtab === "library") renderLibrary();
      });
    });
  });
}

// ---------- flashcards ----------
function pickDueVocab() {
  return state.vocab.filter(isDue);
}

function renderFlashcard() {
  const area = document.getElementById("flashcardArea");
  const due = pickDueVocab();

  if (due.length === 0) {
    area.innerHTML = `<div class="empty-state">🎉 ¡No hay tarjetas pendientes por hoy!<br/><br/>
      <button class="secondary" id="reviewAllBtn">Repasar todas de todos modos</button></div>`;
    const btn = document.getElementById("reviewAllBtn");
    if (btn) btn.addEventListener("click", () => renderFlashcardFrom(state.vocab));
    return;
  }
  renderFlashcardFrom(due);
}

function renderFlashcardFrom(pool) {
  const area = document.getElementById("flashcardArea");
  if (pool.length === 0) {
    area.innerHTML = `<div class="empty-state">No tienes vocabulario todavía. Ve a "Añadir contenido".</div>`;
    return;
  }
  currentCard = pool[Math.floor(Math.random() * pool.length)];
  cardFlipped = false;

  area.innerHTML = `
    <div class="flashcard" id="flashcardEl">
      <span class="box-badge">📦 Caja ${currentCard.box}</span>
      <div class="word">${currentCard.en}</div>
      <div class="tap-hint">👆 Toca la tarjeta para ver la traducción</div>
    </div>
    <div class="flashcard-actions" id="flashcardActions" style="display:none">
      <button class="btn-again" data-grade="again">🔁 Otra vez</button>
      <button class="btn-hard" data-grade="hard">🤔 Difícil</button>
      <button class="btn-good" data-grade="good">✅ Bien</button>
    </div>
  `;

  document.getElementById("flashcardEl").addEventListener("click", flipCard);
  document.getElementById("flashcardActions").addEventListener("click", (e) => {
    const grade = e.target.dataset.grade;
    if (grade) gradeCard(grade);
  });
}

function flipCard() {
  cardFlipped = !cardFlipped;
  const el = document.getElementById("flashcardEl");
  const badge = `<span class="box-badge">📦 Caja ${currentCard.box}</span>`;
  if (cardFlipped) {
    el.innerHTML = `
      ${badge}
      <div class="word">${currentCard.es}</div>
      ${currentCard.example ? `<div class="sub">"${currentCard.example}"</div>` : ""}
      <div class="tap-hint">👆 Toca la tarjeta para ver la palabra en inglés</div>
    `;
  } else {
    el.innerHTML = `
      ${badge}
      <div class="word">${currentCard.en}</div>
      <div class="tap-hint">👆 Toca la tarjeta para ver la traducción</div>
    `;
  }
  document.getElementById("flashcardActions").style.display = "flex";
}

function gradeCard(grade) {
  const item = currentCard;
  if (grade === "again") {
    item.box = 0;
    item.due = addDaysStr(LEITNER_INTERVALS[0]);
    item.incorrect += 1;
    registerStudyEvent(false);
  } else if (grade === "hard") {
    item.due = addDaysStr(1);
    registerStudyEvent(true);
  } else {
    item.box = Math.min(item.box + 1, LEITNER_INTERVALS.length - 1);
    item.due = addDaysStr(LEITNER_INTERVALS[item.box]);
    item.correct += 1;
    registerStudyEvent(true);
  }
  saveState();
  renderFlashcard();
}

// ---------- phrases ----------
function renderPhrase(fromHistory) {
  const area = document.getElementById("phraseArea");
  if (state.phrases.length === 0) {
    area.innerHTML = `<div class="empty-state">No tienes ejercicios todavía. Ve a "Añadir contenido".</div>`;
    return;
  }
  if (!fromHistory) {
    if (currentPhrase) phraseHistory.push(currentPhrase);
    currentPhrase = state.phrases[Math.floor(Math.random() * state.phrases.length)];
  }
  phraseAnswered = false;

  const label = currentPhrase.type === "fill" ? "🧩 Completa el espacio" : "🌐 Traduce al inglés";

  area.innerHTML = `
    <div class="phrase-card">
      <div class="hint">${label}</div>
      <div class="prompt">${currentPhrase.prompt}</div>
      <input type="text" id="phraseInput" placeholder="Escribe tu respuesta..." autocomplete="off" />
      <div class="feedback" id="phraseFeedback"></div>
      <div class="row-buttons">
        <button class="secondary" id="prevBtn" ${phraseHistory.length === 0 ? "disabled" : ""}>⬅️ Anterior</button>
        <button class="primary" id="checkBtn">Comprobar</button>
        <button class="secondary" id="nextBtn">Siguiente ➡️</button>
      </div>
    </div>
  `;

  const input = document.getElementById("phraseInput");
  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPhrase();
  });
  document.getElementById("checkBtn").addEventListener("click", checkPhrase);
  document.getElementById("nextBtn").addEventListener("click", () => renderPhrase(false));
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (phraseHistory.length === 0) return;
    currentPhrase = phraseHistory.pop();
    renderPhrase(true);
  });
}

function checkPhrase() {
  if (phraseAnswered) return;
  phraseAnswered = true;
  const input = document.getElementById("phraseInput");
  const fb = document.getElementById("phraseFeedback");
  const correct = normalize(input.value) === normalize(currentPhrase.answer);

  if (correct) {
    fb.textContent = "✅ ¡Correcto!";
    fb.className = "feedback correct";
  } else {
    fb.textContent = `❌ Respuesta correcta: "${currentPhrase.answer}"`;
    fb.className = "feedback incorrect";
  }
  registerStudyEvent(correct);
  logAttempt(
    "Vocabulary",
    currentPhrase.type === "fill" ? "Fill in the blank" : "Translation",
    correct,
    !correct ? { question: currentPhrase.prompt, wrong: input.value, correct: currentPhrase.answer } : null
  );
  saveState();
}

// ---------- add content ----------
function setupAddForms() {
  document.getElementById("addVocabForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const en = document.getElementById("vEn").value.trim();
    const es = document.getElementById("vEs").value.trim();
    const example = document.getElementById("vExample").value.trim();
    if (!en || !es) return;
    state.vocab.push({ id: uid("v"), en, es, example, box: 0, due: null, correct: 0, incorrect: 0 });
    saveState();
    e.target.reset();
    toast("Palabra añadida");
  });

  document.getElementById("addPhraseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("pType").value;
    const prompt = document.getElementById("pPrompt").value.trim();
    const answer = document.getElementById("pAnswer").value.trim();
    const hint = document.getElementById("pHint").value.trim();
    if (!prompt || !answer) return;
    state.phrases.push({ id: uid("p"), type, prompt, answer, hint });
    saveState();
    e.target.reset();
    toast("Ejercicio añadido");
  });

  document.getElementById("addPhrasalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const verb = document.getElementById("pvVerb").value.trim();
    const meaning = document.getElementById("pvMeaning").value.trim();
    const example = document.getElementById("pvExample").value.trim();
    if (!verb || !meaning) return;
    state.phrasalVerbs.push({ id: uid("pv"), verb, meaning, example });
    saveState();
    e.target.reset();
    toast("Phrasal verb añadido");
  });
}

// ---------- library ----------
function renderLibrary() {
  const vocabList = document.getElementById("vocabList");
  const phraseList = document.getElementById("phraseList");
  const phrasalList = document.getElementById("phrasalList");

  vocabList.innerHTML = state.vocab.length
    ? state.vocab
        .map(
          (v) => `
      <div class="list-item">
        <div class="info"><strong>${v.en}</strong><span>${v.es}${v.example ? " · " + v.example : ""}</span></div>
        <button data-id="${v.id}" class="del-vocab">Eliminar</button>
      </div>`
        )
        .join("")
    : `<div class="empty-state">Sin palabras todavía.</div>`;

  phraseList.innerHTML = state.phrases.length
    ? state.phrases
        .map(
          (p) => `
      <div class="list-item">
        <div class="info"><strong>${p.prompt}</strong><span>${p.type === "fill" ? "Completar" : "Traducir"} · resp: ${p.answer}</span></div>
        <button data-id="${p.id}" class="del-phrase">Eliminar</button>
      </div>`
        )
        .join("")
    : `<div class="empty-state">Sin ejercicios todavía.</div>`;

  vocabList.querySelectorAll(".del-vocab").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.vocab = state.vocab.filter((v) => v.id !== btn.dataset.id);
      saveState();
      renderLibrary();
    })
  );
  phraseList.querySelectorAll(".del-phrase").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.phrases = state.phrases.filter((p) => p.id !== btn.dataset.id);
      saveState();
      renderLibrary();
    })
  );

  phrasalList.innerHTML = state.phrasalVerbs.length
    ? state.phrasalVerbs
        .map(
          (pv) => `
      <div class="list-item">
        <div class="info"><strong>${pv.verb}</strong><span>${pv.meaning}${pv.example ? " · " + pv.example : ""}</span></div>
        <button data-id="${pv.id}" class="del-phrasal">Eliminar</button>
      </div>`
        )
        .join("")
    : `<div class="empty-state">Sin phrasal verbs todavía.</div>`;

  phrasalList.querySelectorAll(".del-phrasal").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.phrasalVerbs = state.phrasalVerbs.filter((pv) => pv.id !== btn.dataset.id);
      saveState();
      renderLibrary();
    })
  );
}

// ---------- grammar quiz (multiple choice, batch grading) ----------
const QUIZ_BANK = [
  { q: "'By the time we launched, we ___ testing for three weeks.'", opts: ["did", "have done", "had been doing", "were doing"], c: 2, cat: "Grammar", sub: "Past perfect continuous" },
  { q: "'If I ___ you, I would have asked for help.'", opts: ["was", "were", "am", "had been"], c: 1, cat: "Grammar", sub: "Conditionals" },
  { q: "'The report ___ by the finance team every month.'", opts: ["reviews", "is reviewed", "reviewed", "is reviewing"], c: 1, cat: "Grammar", sub: "Passive voice" },
  { q: "'She said she ___ finish the report by Friday.' (estilo indirecto)", opts: ["will", "would", "has", "is"], c: 1, cat: "Grammar", sub: "Reported speech" },
  { q: "'You ___ have called me — I would have picked you up.' (reproche sobre el pasado)", opts: ["should", "must", "can", "will"], c: 0, cat: "Grammar", sub: "Modals" },
  { q: "'This is the manager ___ approved the budget.'", opts: ["who", "which", "whose", "whom"], c: 0, cat: "Grammar", sub: "Relative clauses" },
  { q: "'I'm looking forward ___ you next week.'", opts: ["to see", "seeing", "to seeing", "see"], c: 2, cat: "Grammar", sub: "Gerunds & infinitives" },
  { q: "'___ have I seen such a disorganized handover.' (inversión)", opts: ["Never", "Not", "No", "None"], c: 0, cat: "Grammar", sub: "Inversion" },
  { q: "Elige la oración correcta.", opts: ["Neither of the options are good.", "Neither of the options is good.", "Neither of the option is good.", "Neither the options is good."], c: 1, cat: "Grammar", sub: "Subject-verb agreement" },
  { q: "'We need to ___ this issue before the client notices.'", opts: ["make do", "sort out", "take off", "get along"], c: 1, cat: "Vocabulary", sub: "Phrasal verbs" },
  { q: "'Could you ___ me a hand with this spreadsheet?'", opts: ["do", "make", "give", "take"], c: 2, cat: "Vocabulary", sub: "Collocations" },
  { q: "'It's ___ hour to walk there, so we should leave now.'", opts: ["a", "an", "the", "—"], c: 1, cat: "Grammar", sub: "Articles" },
  { q: "'This version is far ___ than the previous one.'", opts: ["good", "gooder", "better", "best"], c: 2, cat: "Grammar", sub: "Comparatives & superlatives" },
  { q: "'I'd rather you ___ that in writing.'", opts: ["send", "sent", "to send", "sending"], c: 1, cat: "Grammar", sub: "Subjunctive / I'd rather" },
  { q: "'The meeting has been postponed, ___ gives us more time to prepare.'", opts: ["that", "what", "which", "who"], c: 2, cat: "Grammar", sub: "Relative clauses" },
  { q: "'You've finished the report, ___?' (question tag)", opts: ["haven't you", "didn't you", "don't you", "aren't you"], c: 0, cat: "Grammar", sub: "Question tags" },
  { q: "'They're used to ___ under pressure.'", opts: ["work", "working", "worked", "be working"], c: 1, cat: "Grammar", sub: "Gerunds & infinitives" },
  { q: "'Despite ___ tired, she kept debugging until midnight.'", opts: ["be", "being", "been", "to be"], c: 1, cat: "Grammar", sub: "Gerunds & infinitives" },
  { q: "'The evidence suggests...' se usa para:", opts: ["dar una orden", "presentar un argumento persuasivo con datos", "pedir disculpas", "cambiar de tema"], c: 1, cat: "Vocabulary", sub: "Functional language" },
  { q: "'She's been putting off the decision for weeks.' 'To put off' significa:", opts: ["posponer", "apurar", "cancelar", "anunciar"], c: 0, cat: "Vocabulary", sub: "Phrasal verbs" },
];

// generic batch multiple-choice quiz (reused by grammar quiz, path quiz, and topic quizzes)
function renderBatchQuiz(containerId, terminalId, groupPrefix, questions) {
  const area = document.getElementById(containerId);
  area.innerHTML = questions
    .map(
      (q, qi) => `
    <div class="quiz-q">
      <p>${qi + 1}. ${q.q}</p>
      ${q.opts
        .map(
          (o, oi) => `
        <label class="quiz-opt" data-qi="${qi}" data-oi="${oi}">
          <input type="radio" name="${groupPrefix}${qi}" value="${oi}" /> ${o}
        </label>`
        )
        .join("")}
    </div>`
    )
    .join("");
  document.getElementById(terminalId).innerHTML = `$ esperando ejecución de quiz...`;
}

function gradeBatchQuiz(containerId, terminalId, groupPrefix, questions, fallbackCategory, fallbackSubcategory) {
  let correct = 0;
  const lines = [];
  questions.forEach((q, qi) => {
    const selected = document.querySelector(`#${containerId} input[name="${groupPrefix}${qi}"]:checked`);
    const opts = document.querySelectorAll(`#${containerId} .quiz-opt[data-qi="${qi}"]`);
    opts.forEach((o) => o.classList.remove("correct", "wrong"));
    if (selected) {
      const oi = parseInt(selected.value);
      const optEl = document.querySelector(`#${containerId} .quiz-opt[data-qi="${qi}"][data-oi="${oi}"]`);
      const isCorrect = oi === q.c;
      if (isCorrect) {
        correct++;
        optEl.classList.add("correct");
        lines.push(`✓ Q${qi + 1} passed`);
      } else {
        optEl.classList.add("wrong");
        document.querySelector(`#${containerId} .quiz-opt[data-qi="${qi}"][data-oi="${q.c}"]`).classList.add("correct");
        lines.push(`✗ Q${qi + 1} failed — correcta: "${q.opts[q.c]}"`);
      }
      logAttempt(q.cat || fallbackCategory || "Grammar", q.sub || fallbackSubcategory || "General", isCorrect, !isCorrect ? { question: q.q, wrong: q.opts[oi], correct: q.opts[q.c] } : null);
    } else {
      lines.push(`⚠ Q${qi + 1} sin responder`);
    }
  });
  saveState();
  const term = document.getElementById(terminalId);
  term.innerHTML =
    `$ run quiz\n` +
    lines.map((l) => (l.startsWith("✗") || l.startsWith("⚠") ? `<span class="quiz-err">${l}</span>` : l)).join("\n") +
    `\n<span class="quiz-info">${correct}/${questions.length} tests passed</span>`;
}

let grammarQuizSet = [];

function renderGrammarQuiz() {
  grammarQuizSet = shuffle(QUIZ_BANK).slice(0, 8);
  renderBatchQuiz("grammarQuizArea", "quizTerminal", "gq", grammarQuizSet);
}

function setupGrammarQuiz() {
  document.getElementById("runQuizBtn").addEventListener("click", () => gradeBatchQuiz("grammarQuizArea", "quizTerminal", "gq", grammarQuizSet, "Grammar", "General"));
  document.getElementById("newQuizSetBtn").addEventListener("click", renderGrammarQuiz);
}

// ---------- topic quizzes (prepositions, adjective order, connectors) ----------
const PREPOSITIONS_QUIZ = [
  { q: "'I was born ___ 1998.'", opts: ["in", "on", "at", "to"], c: 0 },
  { q: "'The meeting is ___ Monday morning.'", opts: ["in", "on", "at", "for"], c: 1 },
  { q: "'Let's meet ___ 6 pm.'", opts: ["in", "on", "at", "by"], c: 2 },
  { q: "'She lives ___ Madrid.'", opts: ["in", "on", "at", "to"], c: 0 },
  { q: "'The keys are ___ the table.'", opts: ["in", "on", "at", "under"], c: 1 },
  { q: "'He's waiting ___ the bus stop.'", opts: ["in", "on", "at", "for"], c: 2 },
  { q: "'We go to the beach ___ summer.'", opts: ["in", "on", "at", "during"], c: 0 },
  { q: "'I'll see you ___ my birthday party.'", opts: ["in", "on", "at", "for"], c: 1 },
];

const ADJECTIVE_ORDER_QUIZ = [
  { q: "¿Cuál es el orden correcto?", opts: ["a wooden small table", "a small wooden table", "a table small wooden", "a wooden table small"], c: 1 },
  { q: "Elige la oración con el orden correcto.", opts: ["a black big dog", "a big black dog", "a dog big black", "a black dog big"], c: 1 },
  { q: "'She has ___ hair.'", opts: ["blonde long", "long blonde", "hair long blonde", "blonde hair long"], c: 1 },
  { q: "En el orden de adjetivos, ¿qué va primero?", opts: ["tamaño", "opinión", "van juntos siempre", "depende del verbo"], c: 1 },
  { q: "¿Qué categoría va justo antes del sustantivo?", opts: ["color", "material o propósito", "edad", "opinión"], c: 1 },
  { q: "'A ___ car.'", opts: ["red fast Italian", "fast red Italian", "Italian red fast", "red Italian fast"], c: 1 },
];

const CONNECTORS_QUIZ = [
  { q: "'I like tea, ___ I prefer coffee.'", opts: ["and", "but", "so", "because"], c: 1 },
  { q: "'It was raining, ___ we stayed home.'", opts: ["so", "but", "although", "despite"], c: 0 },
  { q: "'___ the traffic, we arrived on time.'", opts: ["Because", "Despite", "So", "Therefore"], c: 1 },
  { q: "'She studied hard. ___, she passed the exam.'", opts: ["However", "Although", "As a result", "But"], c: 2 },
  { q: "'First we'll review the agenda; ___ we'll discuss the budget.'", opts: ["then", "because", "although", "despite"], c: 0 },
  { q: "'Some fruits, ___ apples, are cheap.'", opts: ["such as", "therefore", "however", "since"], c: 0 },
  { q: "'___, the project was a success.'", opts: ["In conclusion", "Since", "Because", "On the other hand"], c: 0 },
  { q: "'I was tired; ___, I kept working.'", opts: ["however", "so", "because", "for example"], c: 0 },
];

function renderPrepsQuiz() {
  renderBatchQuiz("prepsQuizArea", "prepsTerminal", "pq", PREPOSITIONS_QUIZ);
}
function renderAdjectivesQuiz() {
  renderBatchQuiz("adjectivesQuizArea", "adjectivesTerminal", "aq", ADJECTIVE_ORDER_QUIZ);
}
function renderConnectorsQuiz() {
  renderBatchQuiz("connectorsQuizArea", "connectorsTerminal", "cq", CONNECTORS_QUIZ);
}

function setupTopicQuizzes() {
  document.getElementById("prepsQuizBtn").addEventListener("click", () => gradeBatchQuiz("prepsQuizArea", "prepsTerminal", "pq", PREPOSITIONS_QUIZ, "Grammar", "Prepositions"));
  document.getElementById("adjectivesQuizBtn").addEventListener("click", () => gradeBatchQuiz("adjectivesQuizArea", "adjectivesTerminal", "aq", ADJECTIVE_ORDER_QUIZ, "Grammar", "Adjective order"));
  document.getElementById("connectorsQuizBtn").addEventListener("click", () => gradeBatchQuiz("connectorsQuizArea", "connectorsTerminal", "cq", CONNECTORS_QUIZ, "Vocabulary", "Connectors"));
}

// ---------- reading comprehension ----------
const READING_TEXTS = [
  {
    id: 1,
    title: "The Shift to Asynchronous Work",
    level: "B2",
    text: "Many tech companies have moved away from constant meetings toward asynchronous work, where employees respond to messages and complete tasks on their own schedule instead of being online at the same time. Supporters argue that this approach reduces interruptions and allows people in different time zones to collaborate more easily. Instead of a live meeting, a team might record a short video update or write a detailed document that anyone can read later. Critics, however, warn that async work can slow down decisions that need to happen quickly, and that some employees feel isolated without regular face-to-face contact. Most companies that adopt this model still keep a few synchronous meetings each week to maintain a sense of connection among team members, and they rely heavily on clear, well-organized written communication to make asynchronous work succeed.",
    questions: [
      { type: "mc", q: "According to the text, one advantage of asynchronous work is that it...", opts: ["increases the number of meetings", "helps people in different time zones collaborate", "requires everyone to be online at the same time", "eliminates the need for written communication"], c: 1 },
      { type: "mc", q: "What do critics say about asynchronous work?", opts: ["It makes decisions faster", "It can make employees feel isolated", "It removes the need for documents", "It only works in one time zone"], c: 1 },
      { type: "mc", q: "Según el texto, ¿qué hacen muchas empresas para mantener conexión entre el equipo?", opts: ["Eliminan todas las reuniones", "Mantienen algunas reuniones sincrónicas cada semana", "Prohíben los mensajes escritos", "Solo usan videollamadas grabadas"], c: 1 },
      { type: "short", q: "In your own words, what does 'asynchronous work' mean?", sample: "Working without everyone being online at the same time — you respond to messages and finish tasks on your own schedule instead of in a live meeting." },
      { type: "short", q: "Why is clear written communication especially important for async teams?", sample: "Because there's no live meeting to ask questions in real time, so messages and documents have to be clear enough to be understood on their own." },
    ],
  },
  {
    id: 2,
    title: "Artificial Intelligence in Everyday Tools",
    level: "B2-C1",
    text: "Artificial intelligence has quietly become part of many everyday tools, from the autocomplete feature in a text message to the recommendations on a streaming service. These systems are trained on large amounts of data so they can recognize patterns and make predictions about what a person is likely to want or do next. While this can make life more convenient, it also raises questions about privacy, since the systems need access to personal information to work well. There is also concern about bias: if the data used to train an AI system reflects existing inequalities, the system may repeat or even worsen them. Companies developing these tools increasingly face pressure to explain how their systems make decisions, not just to satisfy regulators but to maintain the trust of the people who use them every day.",
    questions: [
      { type: "mc", q: "How do the AI systems mentioned in the text learn to make predictions?", opts: ["By asking users direct questions", "By being trained on large amounts of data", "By following a fixed set of rules only", "By copying other companies' software"], c: 1 },
      { type: "mc", q: "What is one concern about bias in AI systems, according to the text?", opts: ["AI systems never use real data", "Biased training data can worsen existing inequalities", "Bias only affects streaming recommendations", "Bias is impossible to detect"], c: 1 },
      { type: "mc", q: "'Quietly become part of' most likely means the change has been...", opts: ["loud and sudden", "gradual and not very noticeable", "reversed recently", "limited to one industry"], c: 1 },
      { type: "short", q: "What is one reason companies face pressure to explain how their AI systems make decisions?", sample: "To maintain users' trust and satisfy regulators — people want to understand decisions made by systems that affect them, not just follow rules." },
      { type: "short", q: "Summarize the main idea of the text in one or two sentences.", sample: "AI is now built into many everyday tools and learns from large datasets, but this convenience brings real concerns about privacy and bias that companies are under pressure to address." },
    ],
  },
  {
    id: 3,
    title: "A Brief History of the Internet",
    level: "C1",
    text: "The internet began as a research project in the late 1960s, when a small number of university and government computers were connected to test whether a decentralized network could survive if part of it failed. For decades, it remained a tool used mainly by academics and the military, largely unknown to the general public. That changed in the early 1990s with the invention of the World Wide Web, which introduced a simple way to link documents together and view them through a browser. Suddenly, anyone with a computer and a modem could access information published by people anywhere in the world. What followed was a period of explosive growth: businesses moved online, social media reshaped how people communicate, and smartphones later made constant connectivity the norm rather than the exception. Even so, many of the internet's original design principles, built for a much smaller and more trusting network, still shape how it operates today, for better and for worse.",
    questions: [
      { type: "mc", q: "Why was the internet originally designed as a decentralized network?", opts: ["To make it easier to shut down", "To test whether it could survive if part of it failed", "To limit access to universities only", "To reduce the cost of computers"], c: 1 },
      { type: "mc", q: "What role did the World Wide Web play in the internet's history?", opts: ["It was the internet's original name", "It made linking and viewing documents through a browser possible, expanding access", "It replaced smartphones", "It was invented before the internet itself"], c: 1 },
      { type: "mc", q: "The phrase 'for better and for worse' at the end suggests that the internet's original design...", opts: ["had only positive effects", "had only negative effects", "has both advantages and disadvantages today", "has been completely replaced"], c: 2 },
      { type: "short", q: "What changed about who could use the internet after the invention of the World Wide Web?", sample: "It went from being used mainly by academics and the military to being accessible to anyone with a computer and a modem, letting them access information from around the world." },
      { type: "short", q: "According to the text, how did smartphones change how people use the internet?", sample: "They made constant connectivity the norm rather than the exception — people became connected all the time instead of only at specific moments." },
    ],
  },
];

let currentReadingId = null;

function renderReadingPicker() {
  const picker = document.getElementById("readingPicker");
  picker.innerHTML = READING_TEXTS.map(
    (t) => `<button class="filter-btn reading-pick-btn${t.id === currentReadingId ? " active" : ""}" data-id="${t.id}">${t.title} <span class="reading-level">${t.level}</span></button>`
  ).join("");
  picker.querySelectorAll(".reading-pick-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectReadingText(parseInt(btn.dataset.id)));
  });
}

function selectReadingText(id) {
  currentReadingId = id;
  renderReadingPicker();
  renderReadingText(id);
}

function renderReadingText(id) {
  const t = READING_TEXTS.find((x) => x.id === id);
  const area = document.getElementById("readingArea");
  area.innerHTML = `
    <div class="reading-passage">
      <div class="reading-passage-title">${t.title} <span class="reading-level">${t.level}</span></div>
      <p class="reading-passage-text">${t.text}</p>
    </div>
    <div id="readingQuestions">
      ${t.questions
        .map((q, qi) => {
          if (q.type === "mc") {
            return `
            <div class="quiz-q">
              <p>${qi + 1}. ${q.q}</p>
              ${q.opts
                .map(
                  (o, oi) => `
                <label class="quiz-opt" data-qi="${qi}" data-oi="${oi}">
                  <input type="radio" name="rdq${qi}" value="${oi}" /> ${o}
                </label>`
                )
                .join("")}
            </div>`;
          }
          return `
            <div class="quiz-q">
              <p>${qi + 1}. ${q.q}</p>
              <input type="text" class="reading-short-input" id="readingShort${qi}" placeholder="Escribe tu respuesta..." autocomplete="off" />
              <div class="reading-sample" id="readingSample${qi}" style="display:none"><strong>Respuesta modelo:</strong> ${q.sample}</div>
            </div>`;
        })
        .join("")}
    </div>
    <div class="row-buttons" style="margin-top:12px">
      <button class="primary" id="readingCheckBtn">Comprobar respuestas</button>
    </div>
    <div class="quiz-terminal" id="readingTerminal">$ esperando ejecución de quiz...</div>
  `;
  document.getElementById("readingCheckBtn").addEventListener("click", () => gradeReadingText(t));
}

function gradeReadingText(t) {
  let correct = 0;
  let mcTotal = 0;
  const lines = [];
  t.questions.forEach((q, qi) => {
    if (q.type === "mc") {
      mcTotal++;
      const selected = document.querySelector(`#readingQuestions input[name="rdq${qi}"]:checked`);
      const opts = document.querySelectorAll(`#readingQuestions .quiz-opt[data-qi="${qi}"]`);
      opts.forEach((o) => o.classList.remove("correct", "wrong"));
      if (selected) {
        const oi = parseInt(selected.value);
        const optEl = document.querySelector(`#readingQuestions .quiz-opt[data-qi="${qi}"][data-oi="${oi}"]`);
        const isCorrect = oi === q.c;
        if (isCorrect) {
          correct++;
          optEl.classList.add("correct");
          lines.push(`✓ Q${qi + 1} passed`);
        } else {
          optEl.classList.add("wrong");
          document.querySelector(`#readingQuestions .quiz-opt[data-qi="${qi}"][data-oi="${q.c}"]`).classList.add("correct");
          lines.push(`✗ Q${qi + 1} failed — correcta: "${q.opts[q.c]}"`);
        }
        registerStudyEvent(isCorrect);
        logAttempt("Reading", t.title, isCorrect, !isCorrect ? { question: q.q, wrong: q.opts[oi], correct: q.opts[q.c] } : null);
      } else {
        lines.push(`⚠ Q${qi + 1} sin responder`);
      }
    } else {
      document.getElementById(`readingSample${qi}`).style.display = "block";
      lines.push(`ℹ Q${qi + 1} respuesta modelo revelada — compárala con la tuya`);
    }
  });
  saveState();
  const term = document.getElementById("readingTerminal");
  term.innerHTML =
    `$ run reading quiz\n` +
    lines.map((l) => (l.startsWith("✗") || l.startsWith("⚠") ? `<span class="quiz-err">${l}</span>` : l)).join("\n") +
    `\n<span class="quiz-info">${correct}/${mcTotal} opción múltiple correctas</span>`;
}

function initReading() {
  const panel = document.getElementById("tab-reading");
  if (panel.dataset.rendered) return;
  panel.dataset.rendered = "1";
  selectReadingText(READING_TEXTS[0].id);
}

// ---------- daily challenge (phrasal verbs) ----------
function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

function getTodayChallengeVerb() {
  if (!state.phrasalVerbs.length) return null;
  const idx = dayOfYear() % state.phrasalVerbs.length;
  return state.phrasalVerbs[idx];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderChallenge() {
  const area = document.getElementById("challengeArea");
  const verb = getTodayChallengeVerb();

  if (!verb) {
    area.innerHTML = `<div class="empty-state">Añade algunos phrasal verbs en "Añadir contenido" para desbloquear el reto diario.</div>`;
    return;
  }

  currentChallengeVerb = verb;
  const today = todayStr();
  const alreadyDone = state.dailyChallenge.date === today && state.dailyChallenge.answered && state.dailyChallenge.verbId === verb.id;

  const distractors = shuffle(state.phrasalVerbs.filter((pv) => pv.id !== verb.id)).slice(0, 3);
  const options = shuffle([verb, ...distractors]);

  area.innerHTML = `
    <div class="challenge-card">
      <div class="eyebrow">Reto diario · Phrasal verb</div>
      <div class="verb">${verb.verb}</div>
      <div class="example">"${verb.example}"</div>
      <div class="choice-list" id="challengeChoices">
        ${options
          .map((o) => `<button class="choice-btn" data-id="${o.id}" ${alreadyDone ? "disabled" : ""}>${o.meaning}</button>`)
          .join("")}
      </div>
      <div class="feedback" id="challengeFeedback">${alreadyDone ? (state.dailyChallenge.correct ? "✅ Ya completaste el reto de hoy. ¡Bien hecho!" : "Ya completaste el reto de hoy. Vuelve mañana por otro.") : ""}</div>
    </div>
  `;

  if (!alreadyDone) {
    document.getElementById("challengeChoices").addEventListener("click", (e) => {
      const btn = e.target.closest(".choice-btn");
      if (!btn) return;
      answerChallenge(btn.dataset.id, verb);
    });
  }
}

function answerChallenge(chosenId, verb) {
  const correct = chosenId === verb.id;
  document.querySelectorAll("#challengeChoices .choice-btn").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.id === verb.id) btn.classList.add("correct");
    else if (btn.dataset.id === chosenId) btn.classList.add("incorrect");
  });
  document.getElementById("challengeFeedback").innerHTML = correct
    ? "✅ ¡Correcto!"
    : `❌ La respuesta correcta era: "${verb.meaning}"`;

  state.dailyChallenge = { date: todayStr(), verbId: verb.id, answered: true, correct };
  state.stats.dailyChallengesCompleted += 1;
  registerStudyEvent(correct);
  saveState();
}

// ---------- writing corrections ----------
function setupWriting() {
  document.getElementById("checkWritingBtn").addEventListener("click", checkWriting);
}

async function checkWriting() {
  const input = document.getElementById("writingInput");
  const status = document.getElementById("writingStatus");
  const results = document.getElementById("writingResults");
  const text = input.value.trim();
  if (!text) return;

  status.textContent = "Revisando...";
  results.innerHTML = "";

  let data;
  try {
    const res = await fetch("/api/check-writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    data = await res.json();
  } catch (err) {
    status.textContent = "";
    results.innerHTML = `<div class="issue-card">No se pudo conectar con el corrector. Revisa tu conexión a internet.</div>`;
    return;
  }

  if (!data.ok) {
    status.textContent = "";
    results.innerHTML = `<div class="issue-card">${data.error || "Ocurrió un error al revisar el texto."}</div>`;
    return;
  }

  status.textContent = "";
  const matches = data.matches || [];

  if (matches.length === 0) {
    results.innerHTML = `<div class="all-good">✅ ¡Muy bien! No se encontraron errores.</div>`;
  } else {
    results.innerHTML = matches
      .map((m) => {
        const before = m.context.slice(0, m.offset);
        const errText = m.context.slice(m.offset, m.offset + m.length);
        const after = m.context.slice(m.offset + m.length);
        const chips = m.replacements.length
          ? `<div class="chip-list">${m.replacements.map((r) => `<span class="chip">${r}</span>`).join("")}</div>`
          : "";
        return `
        <div class="issue-card">
          <div class="category">${m.category || "Sugerencia"}</div>
          <div class="msg">${m.message}</div>
          <div class="snippet">${before}<mark>${errText}</mark>${after}</div>
          ${chips}
        </div>`;
      })
      .join("");
  }

  state.writings.unshift({ id: uid("w"), date: todayStr(), text, issuesCount: matches.length });
  state.writings = state.writings.slice(0, 20);
  state.stats.writingsReviewed += 1;
  saveState();
  renderWritingHistory();
}

function renderWritingHistory() {
  const list = document.getElementById("writingHistory");
  if (!list) return;
  list.innerHTML = state.writings.length
    ? state.writings
        .map(
          (w) => `
      <div class="list-item">
        <div class="info"><strong>${w.date}</strong><span>${w.text.slice(0, 80)}${w.text.length > 80 ? "…" : ""}</span></div>
        <span class="hint">${w.issuesCount === 0 ? "sin errores ✅" : w.issuesCount + " sugerencia(s)"}</span>
      </div>`
        )
        .join("")
    : `<div class="empty-state">Aún no has revisado ningún texto.</div>`;
}

// ---------- verb tenses guide ----------
const VERB_TENSES_GUIDE = [
  { icon: "☀️", name: "Present Simple", use: "Hábitos, rutinas y hechos generales.", affirmative: "Subject + verb (+s/es en 3ª persona)", negative: "Subject + don't/doesn't + verb", question: "Do/Does + subject + verb?", example: "She works every day. / She doesn't work on Sundays. / Does she work here?" },
  { icon: "🌤️", name: "Present Continuous", use: "Acciones que ocurren en este momento.", affirmative: "Subject + am/is/are + verb-ing", negative: "Subject + am/is/are + not + verb-ing", question: "Am/Is/Are + subject + verb-ing?", example: "I am studying English now. / She isn't watching TV. / Are you listening?" },
  { icon: "🕰️", name: "Past Simple", use: "Acciones terminadas en un momento específico del pasado.", affirmative: "Subject + verb-ed (o forma irregular)", negative: "Subject + didn't + verb (base)", question: "Did + subject + verb (base)?", example: "They visited Paris last year. / He didn't call me. / Did you see that?" },
  { icon: "🌙", name: "Past Continuous", use: "Acción en progreso en el pasado, a menudo interrumpida por otra.", affirmative: "Subject + was/were + verb-ing", negative: "Subject + was/were + not + verb-ing", question: "Was/Were + subject + verb-ing?", example: "I was reading when you called. / They weren't listening." },
  { icon: "✅", name: "Present Perfect", use: "Experiencias pasadas o resultados que importan ahora, sin tiempo específico.", affirmative: "Subject + have/has + past participle", negative: "Subject + have/has + not + past participle", question: "Have/Has + subject + past participle?", example: "I have visited London twice. / She hasn't finished yet. / Have you eaten?" },
  { icon: "⏱️", name: "Present Perfect Continuous", use: "Acción que empezó en el pasado y continúa (o acaba de terminar), con énfasis en la duración.", affirmative: "Subject + have/has + been + verb-ing", negative: "Subject + have/has + not + been + verb-ing", question: "Have/Has + subject + been + verb-ing?", example: "I have been studying for two hours." },
  { icon: "📜", name: "Past Perfect", use: "Una acción pasada que ocurrió antes que otra acción pasada.", affirmative: "Subject + had + past participle", negative: "Subject + had + not + past participle", question: "Had + subject + past participle?", example: "She had left before I arrived." },
  { icon: "⏳", name: "Past Perfect Continuous", use: "Acción en progreso antes de otro momento en el pasado, con énfasis en la duración.", affirmative: "Subject + had + been + verb-ing", negative: "Subject + had + not + been + verb-ing", question: "Had + subject + been + verb-ing?", example: "They had been waiting for an hour when the bus arrived." },
  { icon: "🚀", name: "Future Simple (will)", use: "Predicciones, decisiones espontáneas, promesas.", affirmative: "Subject + will + verb (base)", negative: "Subject + won't + verb (base)", question: "Will + subject + verb (base)?", example: "I will call you tomorrow. / She won't come. / Will you help me?" },
  { icon: "🗓️", name: "Future (going to)", use: "Planes e intenciones ya decididos.", affirmative: "Subject + am/is/are + going to + verb", negative: "Subject + am/is/are + not + going to + verb", question: "Am/Is/Are + subject + going to + verb?", example: "We are going to travel next month." },
  { icon: "✈️", name: "Future Continuous", use: "Acción en progreso en un momento específico del futuro.", affirmative: "Subject + will + be + verb-ing", negative: "Subject + will + not + be + verb-ing", question: "Will + subject + be + verb-ing?", example: "This time tomorrow, I will be flying to Madrid." },
  { icon: "🏁", name: "Future Perfect", use: "Acción que estará completada antes de un momento futuro.", affirmative: "Subject + will + have + past participle", negative: "Subject + will + not + have + past participle", question: "Will + subject + have + past participle?", example: "By 2030, I will have finished my degree." },
  { icon: "🔬", name: "Zero Conditional", use: "Hechos generales y verdades científicas.", affirmative: "If + present simple, present simple", negative: "—", question: "—", example: "If you heat water to 100°C, it boils." },
  { icon: "🌦️", name: "First Conditional", use: "Situaciones futuras reales o probables.", affirmative: "If + present simple, will + verb (base)", negative: "—", question: "—", example: "If it rains, I will stay home." },
  { icon: "💭", name: "Second Conditional", use: "Situaciones hipotéticas o improbables en presente/futuro.", affirmative: "If + past simple, would + verb (base)", negative: "—", question: "—", example: "If I had more time, I would travel more." },
  { icon: "⏮️", name: "Third Conditional", use: "Situaciones hipotéticas sobre el pasado (que ya no se pueden cambiar).", affirmative: "If + past perfect, would have + past participle", negative: "—", question: "—", example: "If I had studied, I would have passed the exam." },
  { icon: "🎭", name: "Passive Voice", use: "Cuando la acción importa más que quién la realiza.", affirmative: "Subject + be (conjugado) + past participle (+ by agent)", negative: "Subject + be + not + past participle", question: "Be + subject + past participle?", example: "The book was written by the author. / Was it finished on time?" },
  { icon: "💬", name: "Reported Speech", use: "Contar lo que alguien dijo, generalmente retrocediendo un tiempo verbal.", affirmative: "Subject + said (that) + [tiempo retrocedido]", negative: "—", question: "—", example: "\"I am tired\" → She said (that) she was tired." },
];

function renderGuide() {
  const area = document.getElementById("guideArea");
  if (area.dataset.rendered) return;
  area.dataset.rendered = "1";
  area.innerHTML = VERB_TENSES_GUIDE.map(
    (t, i) => `
    <details class="guide-item" ${i === 0 ? "open" : ""}>
      <summary>${t.icon} ${t.name}</summary>
      <div class="guide-body">
        <div class="use">${t.use}</div>
        <div class="row"><span class="k">Afirmativo</span>${t.affirmative}</div>
        <div class="row"><span class="k">Negativo</span>${t.negative}</div>
        <div class="row"><span class="k">Pregunta</span>${t.question}</div>
        <div class="row example">${t.example}</div>
      </div>
    </details>`
  ).join("");
}

// ---------- verbs table (regular & irregular) ----------
const VERBS_DATA = [
  // regulares (ejemplos representativos de las reglas de conjugación)
  { base: "work", past: "worked", participle: "worked", es: "trabajar", type: "regular" },
  { base: "play", past: "played", participle: "played", es: "jugar", type: "regular" },
  { base: "watch", past: "watched", participle: "watched", es: "mirar / ver", type: "regular" },
  { base: "want", past: "wanted", participle: "wanted", es: "querer", type: "regular" },
  { base: "need", past: "needed", participle: "needed", es: "necesitar", type: "regular" },
  { base: "like", past: "liked", participle: "liked", es: "gustar", type: "regular" },
  { base: "live", past: "lived", participle: "lived", es: "vivir", type: "regular" },
  { base: "love", past: "loved", participle: "loved", es: "amar", type: "regular" },
  { base: "close", past: "closed", participle: "closed", es: "cerrar", type: "regular" },
  { base: "move", past: "moved", participle: "moved", es: "mover / mudarse", type: "regular" },
  { base: "study", past: "studied", participle: "studied", es: "estudiar", type: "regular" },
  { base: "carry", past: "carried", participle: "carried", es: "cargar / llevar", type: "regular" },
  { base: "try", past: "tried", participle: "tried", es: "intentar", type: "regular" },
  { base: "cry", past: "cried", participle: "cried", es: "llorar", type: "regular" },
  { base: "stop", past: "stopped", participle: "stopped", es: "parar / detener", type: "regular" },
  { base: "plan", past: "planned", participle: "planned", es: "planear", type: "regular" },
  { base: "travel", past: "travelled", participle: "travelled", es: "viajar", type: "regular" },
  { base: "prefer", past: "preferred", participle: "preferred", es: "preferir", type: "regular" },
  { base: "help", past: "helped", participle: "helped", es: "ayudar", type: "regular" },
  { base: "start", past: "started", participle: "started", es: "empezar", type: "regular" },
  { base: "finish", past: "finished", participle: "finished", es: "terminar", type: "regular" },
  { base: "listen", past: "listened", participle: "listened", es: "escuchar", type: "regular" },
  { base: "talk", past: "talked", participle: "talked", es: "hablar", type: "regular" },
  { base: "walk", past: "walked", participle: "walked", es: "caminar", type: "regular" },
  { base: "ask", past: "asked", participle: "asked", es: "preguntar / pedir", type: "regular" },
  { base: "answer", past: "answered", participle: "answered", es: "responder", type: "regular" },
  { base: "clean", past: "cleaned", participle: "cleaned", es: "limpiar", type: "regular" },
  { base: "cook", past: "cooked", participle: "cooked", es: "cocinar", type: "regular" },
  { base: "open", past: "opened", participle: "opened", es: "abrir", type: "regular" },
  { base: "use", past: "used", participle: "used", es: "usar", type: "regular" },
  // irregulares (los más comunes)
  { base: "be", past: "was/were", participle: "been", es: "ser / estar", type: "irregular" },
  { base: "have", past: "had", participle: "had", es: "tener / haber", type: "irregular" },
  { base: "do", past: "did", participle: "done", es: "hacer", type: "irregular" },
  { base: "go", past: "went", participle: "gone", es: "ir", type: "irregular" },
  { base: "get", past: "got", participle: "gotten/got", es: "conseguir / obtener", type: "irregular" },
  { base: "make", past: "made", participle: "made", es: "hacer / fabricar", type: "irregular" },
  { base: "know", past: "knew", participle: "known", es: "saber / conocer", type: "irregular" },
  { base: "think", past: "thought", participle: "thought", es: "pensar", type: "irregular" },
  { base: "take", past: "took", participle: "taken", es: "tomar / llevar", type: "irregular" },
  { base: "see", past: "saw", participle: "seen", es: "ver", type: "irregular" },
  { base: "come", past: "came", participle: "come", es: "venir", type: "irregular" },
  { base: "give", past: "gave", participle: "given", es: "dar", type: "irregular" },
  { base: "find", past: "found", participle: "found", es: "encontrar", type: "irregular" },
  { base: "tell", past: "told", participle: "told", es: "decir / contar", type: "irregular" },
  { base: "say", past: "said", participle: "said", es: "decir", type: "irregular" },
  { base: "feel", past: "felt", participle: "felt", es: "sentir", type: "irregular" },
  { base: "leave", past: "left", participle: "left", es: "salir / dejar", type: "irregular" },
  { base: "put", past: "put", participle: "put", es: "poner", type: "irregular" },
  { base: "bring", past: "brought", participle: "brought", es: "traer", type: "irregular" },
  { base: "begin", past: "began", participle: "begun", es: "empezar / comenzar", type: "irregular" },
  { base: "keep", past: "kept", participle: "kept", es: "mantener / guardar", type: "irregular" },
  { base: "hold", past: "held", participle: "held", es: "sostener / sujetar", type: "irregular" },
  { base: "write", past: "wrote", participle: "written", es: "escribir", type: "irregular" },
  { base: "stand", past: "stood", participle: "stood", es: "estar de pie / pararse", type: "irregular" },
  { base: "hear", past: "heard", participle: "heard", es: "oír / escuchar", type: "irregular" },
  { base: "let", past: "let", participle: "let", es: "dejar / permitir", type: "irregular" },
  { base: "mean", past: "meant", participle: "meant", es: "significar", type: "irregular" },
  { base: "set", past: "set", participle: "set", es: "poner / fijar", type: "irregular" },
  { base: "meet", past: "met", participle: "met", es: "conocer / encontrarse", type: "irregular" },
  { base: "run", past: "ran", participle: "run", es: "correr", type: "irregular" },
  { base: "pay", past: "paid", participle: "paid", es: "pagar", type: "irregular" },
  { base: "sit", past: "sat", participle: "sat", es: "sentarse", type: "irregular" },
  { base: "speak", past: "spoke", participle: "spoken", es: "hablar", type: "irregular" },
  { base: "lie", past: "lay", participle: "lain", es: "acostarse / yacer", type: "irregular" },
  { base: "lead", past: "led", participle: "led", es: "liderar / guiar", type: "irregular" },
  { base: "read", past: "read", participle: "read", es: "leer", type: "irregular" },
  { base: "grow", past: "grew", participle: "grown", es: "crecer", type: "irregular" },
  { base: "lose", past: "lost", participle: "lost", es: "perder", type: "irregular" },
  { base: "fall", past: "fell", participle: "fallen", es: "caer", type: "irregular" },
  { base: "send", past: "sent", participle: "sent", es: "enviar", type: "irregular" },
  { base: "build", past: "built", participle: "built", es: "construir", type: "irregular" },
  { base: "understand", past: "understood", participle: "understood", es: "entender", type: "irregular" },
  { base: "draw", past: "drew", participle: "drawn", es: "dibujar", type: "irregular" },
  { base: "break", past: "broke", participle: "broken", es: "romper", type: "irregular" },
  { base: "spend", past: "spent", participle: "spent", es: "gastar / pasar (tiempo)", type: "irregular" },
  { base: "cut", past: "cut", participle: "cut", es: "cortar", type: "irregular" },
  { base: "rise", past: "rose", participle: "risen", es: "levantarse / subir", type: "irregular" },
  { base: "drive", past: "drove", participle: "driven", es: "conducir", type: "irregular" },
  { base: "buy", past: "bought", participle: "bought", es: "comprar", type: "irregular" },
  { base: "wear", past: "wore", participle: "worn", es: "llevar puesto / vestir", type: "irregular" },
  { base: "choose", past: "chose", participle: "chosen", es: "elegir", type: "irregular" },
  { base: "eat", past: "ate", participle: "eaten", es: "comer", type: "irregular" },
  { base: "drink", past: "drank", participle: "drunk", es: "beber", type: "irregular" },
  { base: "sleep", past: "slept", participle: "slept", es: "dormir", type: "irregular" },
  { base: "fly", past: "flew", participle: "flown", es: "volar", type: "irregular" },
  { base: "sell", past: "sold", participle: "sold", es: "vender", type: "irregular" },
  { base: "catch", past: "caught", participle: "caught", es: "atrapar / coger", type: "irregular" },
  { base: "teach", past: "taught", participle: "taught", es: "enseñar", type: "irregular" },
  { base: "forget", past: "forgot", participle: "forgotten", es: "olvidar", type: "irregular" },
  { base: "win", past: "won", participle: "won", es: "ganar", type: "irregular" },
  { base: "swim", past: "swam", participle: "swum", es: "nadar", type: "irregular" },
  { base: "show", past: "showed", participle: "shown", es: "mostrar", type: "irregular" },
  // más regulares (vocabulario de trabajo/negocios)
  { base: "develop", past: "developed", participle: "developed", es: "desarrollar", type: "regular" },
  { base: "decide", past: "decided", participle: "decided", es: "decidir", type: "regular" },
  { base: "discuss", past: "discussed", participle: "discussed", es: "discutir / hablar sobre", type: "regular" },
  { base: "agree", past: "agreed", participle: "agreed", es: "estar de acuerdo", type: "regular" },
  { base: "disagree", past: "disagreed", participle: "disagreed", es: "estar en desacuerdo", type: "regular" },
  { base: "improve", past: "improved", participle: "improved", es: "mejorar", type: "regular" },
  { base: "increase", past: "increased", participle: "increased", es: "aumentar", type: "regular" },
  { base: "decrease", past: "decreased", participle: "decreased", es: "disminuir", type: "regular" },
  { base: "create", past: "created", participle: "created", es: "crear", type: "regular" },
  { base: "deliver", past: "delivered", participle: "delivered", es: "entregar", type: "regular" },
  { base: "implement", past: "implemented", participle: "implemented", es: "implementar", type: "regular" },
  { base: "manage", past: "managed", participle: "managed", es: "gestionar / manejar", type: "regular" },
  { base: "organize", past: "organized", participle: "organized", es: "organizar", type: "regular" },
  { base: "prepare", past: "prepared", participle: "prepared", es: "preparar", type: "regular" },
  { base: "produce", past: "produced", participle: "produced", es: "producir", type: "regular" },
  { base: "reduce", past: "reduced", participle: "reduced", es: "reducir", type: "regular" },
  { base: "suggest", past: "suggested", participle: "suggested", es: "sugerir", type: "regular" },
  { base: "support", past: "supported", participle: "supported", es: "apoyar", type: "regular" },
  { base: "arrange", past: "arranged", participle: "arranged", es: "arreglar / organizar", type: "regular" },
  { base: "solve", past: "solved", participle: "solved", es: "resolver", type: "regular" },
  { base: "explain", past: "explained", participle: "explained", es: "explicar", type: "regular" },
  { base: "compare", past: "compared", participle: "compared", es: "comparar", type: "regular" },
  { base: "introduce", past: "introduced", participle: "introduced", es: "presentar / introducir", type: "regular" },
  { base: "allow", past: "allowed", participle: "allowed", es: "permitir", type: "regular" },
  { base: "consider", past: "considered", participle: "considered", es: "considerar", type: "regular" },
  // más irregulares
  { base: "become", past: "became", participle: "become", es: "convertirse / llegar a ser", type: "irregular" },
  { base: "bend", past: "bent", participle: "bent", es: "doblar", type: "irregular" },
  { base: "bet", past: "bet", participle: "bet", es: "apostar", type: "irregular" },
  { base: "bind", past: "bound", participle: "bound", es: "atar / vincular", type: "irregular" },
  { base: "bite", past: "bit", participle: "bitten", es: "morder", type: "irregular" },
  { base: "bleed", past: "bled", participle: "bled", es: "sangrar", type: "irregular" },
  { base: "blow", past: "blew", participle: "blown", es: "soplar", type: "irregular" },
  { base: "burst", past: "burst", participle: "burst", es: "reventar / estallar", type: "irregular" },
  { base: "cast", past: "cast", participle: "cast", es: "lanzar / elegir (actor)", type: "irregular" },
  { base: "cost", past: "cost", participle: "cost", es: "costar", type: "irregular" },
  { base: "creep", past: "crept", participle: "crept", es: "arrastrarse / deslizarse", type: "irregular" },
  { base: "deal", past: "dealt", participle: "dealt", es: "tratar (con algo)", type: "irregular" },
  { base: "dig", past: "dug", participle: "dug", es: "cavar", type: "irregular" },
  { base: "dream", past: "dreamt", participle: "dreamt", es: "soñar", type: "irregular" },
  { base: "feed", past: "fed", participle: "fed", es: "alimentar", type: "irregular" },
  { base: "fight", past: "fought", participle: "fought", es: "pelear / luchar", type: "irregular" },
  { base: "flee", past: "fled", participle: "fled", es: "huir", type: "irregular" },
  { base: "forgive", past: "forgave", participle: "forgiven", es: "perdonar", type: "irregular" },
  { base: "freeze", past: "froze", participle: "frozen", es: "congelar", type: "irregular" },
  { base: "hang", past: "hung", participle: "hung", es: "colgar", type: "irregular" },
  { base: "hide", past: "hid", participle: "hidden", es: "esconder", type: "irregular" },
  { base: "hit", past: "hit", participle: "hit", es: "golpear", type: "irregular" },
  { base: "hurt", past: "hurt", participle: "hurt", es: "lastimar / doler", type: "irregular" },
  { base: "lay", past: "laid", participle: "laid", es: "colocar / poner (algo)", type: "irregular" },
  { base: "lend", past: "lent", participle: "lent", es: "prestar", type: "irregular" },
  { base: "light", past: "lit", participle: "lit", es: "encender", type: "irregular" },
  { base: "ride", past: "rode", participle: "ridden", es: "montar / andar en", type: "irregular" },
  { base: "ring", past: "rang", participle: "rung", es: "sonar / timbrar", type: "irregular" },
  { base: "seek", past: "sought", participle: "sought", es: "buscar", type: "irregular" },
  { base: "shake", past: "shook", participle: "shaken", es: "agitar / sacudir", type: "irregular" },
  { base: "shine", past: "shone", participle: "shone", es: "brillar", type: "irregular" },
  { base: "shoot", past: "shot", participle: "shot", es: "disparar / filmar", type: "irregular" },
  { base: "shrink", past: "shrank", participle: "shrunk", es: "encoger", type: "irregular" },
  { base: "shut", past: "shut", participle: "shut", es: "cerrar", type: "irregular" },
  { base: "sing", past: "sang", participle: "sung", es: "cantar", type: "irregular" },
  { base: "sink", past: "sank", participle: "sunk", es: "hundir", type: "irregular" },
  { base: "slide", past: "slid", participle: "slid", es: "deslizar", type: "irregular" },
  { base: "spin", past: "spun", participle: "spun", es: "girar", type: "irregular" },
  { base: "spread", past: "spread", participle: "spread", es: "esparcir / difundir", type: "irregular" },
  { base: "spring", past: "sprang", participle: "sprung", es: "saltar / brotar", type: "irregular" },
  { base: "steal", past: "stole", participle: "stolen", es: "robar", type: "irregular" },
  { base: "stick", past: "stuck", participle: "stuck", es: "pegar / quedarse atascado", type: "irregular" },
  { base: "sting", past: "stung", participle: "stung", es: "picar", type: "irregular" },
  { base: "strike", past: "struck", participle: "struck", es: "golpear / hacer huelga", type: "irregular" },
  { base: "swear", past: "swore", participle: "sworn", es: "jurar", type: "irregular" },
  { base: "sweep", past: "swept", participle: "swept", es: "barrer", type: "irregular" },
  { base: "swing", past: "swung", participle: "swung", es: "columpiar / balancear", type: "irregular" },
  { base: "throw", past: "threw", participle: "thrown", es: "lanzar", type: "irregular" },
  { base: "tear", past: "tore", participle: "torn", es: "rasgar / romper", type: "irregular" },
  { base: "upset", past: "upset", participle: "upset", es: "alterar / disgustar", type: "irregular" },
  { base: "wake", past: "woke", participle: "woken", es: "despertar", type: "irregular" },
  { base: "weep", past: "wept", participle: "wept", es: "llorar", type: "irregular" },
  { base: "wind", past: "wound", participle: "wound", es: "enrollar", type: "irregular" },
  { base: "withdraw", past: "withdrew", participle: "withdrawn", es: "retirar", type: "irregular" },
];

let verbsFilter = "all";

function renderVerbs() {
  const search = document.getElementById("verbSearch").value.trim().toLowerCase();
  const filtered = VERBS_DATA.filter((v) => {
    if (verbsFilter !== "all" && v.type !== verbsFilter) return false;
    if (!search) return true;
    return (
      v.base.toLowerCase().includes(search) ||
      v.es.toLowerCase().includes(search) ||
      v.past.toLowerCase().includes(search) ||
      v.participle.toLowerCase().includes(search)
    );
  });

  const body = document.getElementById("verbsTableBody");
  const empty = document.getElementById("verbsEmpty");
  body.innerHTML = filtered
    .map(
      (v) => `
    <tr>
      <td>${v.base}</td>
      <td>${v.past}</td>
      <td>${v.participle}</td>
      <td>${v.es}</td>
      <td><span class="verb-tag verb-tag-${v.type}">${v.type === "regular" ? "Regular" : "Irregular"}</span></td>
    </tr>`
    )
    .join("");
  empty.style.display = filtered.length === 0 ? "block" : "none";
}

function setupVerbsControls() {
  document.getElementById("verbSearch").addEventListener("input", renderVerbs);
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      verbsFilter = btn.dataset.filter;
      renderVerbs();
    });
  });
}

// ---------- prepositions (in / on / at) ----------
const PREPOSITIONS_GUIDE = [
  {
    prep: "IN",
    icon: "📦",
    time: [
      { rule: "Meses, años, estaciones, siglos", example: "in July, in 2024, in summer, in the 21st century" },
      { rule: "Partes largas del día", example: "in the morning, in the afternoon, in the evening" },
      { rule: "Períodos largos", example: "in the past, in the future, in a few weeks" },
    ],
    place: [
      { rule: "Países, ciudades, zonas grandes", example: "in Mexico, in Madrid, in the north" },
      { rule: "Espacios cerrados o delimitados", example: "in the room, in the car, in a box" },
      { rule: "Continentes", example: "in South America, in Europe" },
    ],
  },
  {
    prep: "ON",
    icon: "📅",
    time: [
      { rule: "Días de la semana y fechas", example: "on Monday, on July 4th" },
      { rule: "Día + parte del día", example: "on Monday morning, on Friday night" },
      { rule: "Días especiales", example: "on my birthday, on Christmas Day" },
    ],
    place: [
      { rule: "Superficies", example: "on the table, on the wall, on the floor" },
      { rule: "Calles", example: "on Main Street, on the corner" },
      { rule: "Pisos de un edificio", example: "on the second floor" },
      { rule: "Transporte en el que caminas", example: "on the bus, on the train, on a plane" },
    ],
  },
  {
    prep: "AT",
    icon: "📍",
    time: [
      { rule: "Horas exactas", example: "at 5 o'clock, at noon, at midnight" },
      { rule: "Momentos precisos", example: "at the moment, at the same time" },
      { rule: "Excepciones fijas", example: "at night, at the weekend (UK)" },
    ],
    place: [
      { rule: "Direcciones y puntos precisos", example: "at 22 Baker Street" },
      { rule: "Lugares específicos", example: "at home, at work, at school, at the airport, at the bus stop" },
    ],
  },
];

function renderPreps() {
  const area = document.getElementById("prepsArea");
  if (area.dataset.rendered) return;
  area.dataset.rendered = "1";
  area.innerHTML = PREPOSITIONS_GUIDE.map(
    (p) => `
    <div class="prep-card">
      <div class="prep-title">${p.icon} ${p.prep}</div>
      <div class="prep-block">
        <div class="prep-block-label">Tiempo</div>
        ${p.time.map((r) => `<div class="prep-rule"><strong>${r.rule}</strong><span>${r.example}</span></div>`).join("")}
      </div>
      <div class="prep-block">
        <div class="prep-block-label">Lugar</div>
        ${p.place.map((r) => `<div class="prep-rule"><strong>${r.rule}</strong><span>${r.example}</span></div>`).join("")}
      </div>
    </div>`
  ).join("");
}

// ---------- adjective order (describir algo/a alguien) ----------
const ADJECTIVE_ORDER = [
  { n: 1, cat: "Opinión", examples: "beautiful, lovely, terrible, nice" },
  { n: 2, cat: "Tamaño", examples: "big, small, tall, tiny" },
  { n: 3, cat: "Edad", examples: "old, young, new, ancient" },
  { n: 4, cat: "Forma", examples: "round, square, oval" },
  { n: 5, cat: "Color", examples: "red, blue, dark, blonde" },
  { n: 6, cat: "Origen", examples: "French, Mexican, American" },
  { n: 7, cat: "Material", examples: "wooden, metal, cotton" },
  { n: 8, cat: "Propósito / tipo", examples: "sleeping (bag), racing (car), sports (car)" },
];

const ADJECTIVE_EXAMPLES = [
  { es: "Una hermosa mujer alta y joven.", en: "A beautiful, tall, young woman.", note: "opinión + tamaño + edad" },
  { es: "Una mesa pequeña, redonda y de madera.", en: "A small, round, wooden table.", note: "tamaño + forma + material" },
  { es: "Un auto deportivo negro, viejo y alemán.", en: "An old, black, German sports car.", note: "edad + color + origen + propósito" },
  { es: "Pelo largo y rubio.", en: "Long, blonde hair.", note: "tamaño + color (para describir a una persona)" },
];

function renderAdjectiveOrder() {
  const area = document.getElementById("adjectivesArea");
  if (area.dataset.rendered) return;
  area.dataset.rendered = "1";
  area.innerHTML = `
    <div class="verbs-table-wrap">
      <table class="verbs-table">
        <thead>
          <tr><th>#</th><th>Categoría</th><th>Ejemplos</th></tr>
        </thead>
        <tbody>
          ${ADJECTIVE_ORDER.map((a) => `<tr><td>${a.n}</td><td>${a.cat}</td><td>${a.examples}</td></tr>`).join("")}
          <tr><td>→</td><td><strong>Sustantivo</strong></td><td>la palabra que describes</td></tr>
        </tbody>
      </table>
    </div>
    <p class="hint" style="margin:16px 0 10px">Ejemplos completos:</p>
    <div class="list">
      ${ADJECTIVE_EXAMPLES.map(
        (e) => `
        <div class="list-item">
          <div class="info"><strong>${e.en}</strong><span>${e.es} — ${e.note}</span></div>
        </div>`
      ).join("")}
    </div>
  `;
}

// ---------- connectors ----------
const CONNECTORS_GUIDE = [
  {
    category: "Adición",
    items: [
      { en: "and", es: "y", example: "She speaks English and French." },
      { en: "also", es: "también", example: "He's smart. He's also very kind." },
      { en: "in addition", es: "además", example: "In addition, we need more time." },
      { en: "moreover", es: "es más / además", example: "Moreover, the plan saves money." },
      { en: "besides", es: "además de eso", example: "Besides, it's too late to change now." },
    ],
  },
  {
    category: "Contraste",
    items: [
      { en: "but", es: "pero", example: "I like tea, but I prefer coffee." },
      { en: "however", es: "sin embargo", example: "The plan was good. However, it failed." },
      { en: "although / though", es: "aunque", example: "Although it was raining, we went out." },
      { en: "on the other hand", es: "por otro lado", example: "On the other hand, it's more expensive." },
      { en: "despite / in spite of", es: "a pesar de", example: "Despite the rain, we had fun." },
    ],
  },
  {
    category: "Causa",
    items: [
      { en: "because", es: "porque", example: "I left early because I was tired." },
      { en: "since", es: "ya que / dado que", example: "Since it's raining, let's stay home." },
      { en: "as", es: "como / ya que", example: "As she was late, we started without her." },
      { en: "due to / because of", es: "debido a", example: "The delay was due to traffic." },
    ],
  },
  {
    category: "Consecuencia",
    items: [
      { en: "so", es: "así que", example: "It was late, so we went home." },
      { en: "therefore", es: "por lo tanto", example: "The tests failed; therefore, we can't deploy." },
      { en: "as a result", es: "como resultado", example: "As a result, sales increased." },
      { en: "consequently", es: "en consecuencia", example: "Consequently, the meeting was postponed." },
    ],
  },
  {
    category: "Secuencia",
    items: [
      { en: "first / first of all", es: "primero", example: "First, let's review the agenda." },
      { en: "then / next", es: "luego / después", example: "Then we'll discuss the budget." },
      { en: "after that", es: "después de eso", example: "After that, we'll take questions." },
      { en: "finally", es: "finalmente", example: "Finally, we'll wrap up the meeting." },
      { en: "meanwhile", es: "mientras tanto", example: "Meanwhile, the team kept working." },
    ],
  },
  {
    category: "Ejemplos y conclusión",
    items: [
      { en: "for example / for instance", es: "por ejemplo", example: "Some fruits, for example apples, are cheap." },
      { en: "such as", es: "tales como", example: "Tools such as Slack help teams communicate." },
      { en: "in conclusion", es: "en conclusión", example: "In conclusion, the project was a success." },
      { en: "to sum up", es: "en resumen", example: "To sum up, we need more resources." },
    ],
  },
];

function renderConnectors() {
  const area = document.getElementById("connectorsArea");
  if (area.dataset.rendered) return;
  area.dataset.rendered = "1";
  area.innerHTML = CONNECTORS_GUIDE.map(
    (group, i) => `
    <details class="guide-item" ${i === 0 ? "open" : ""}>
      <summary>🔗 ${group.category}</summary>
      <div class="guide-body">
        ${group.items
          .map(
            (c) => `
          <div class="row"><span class="k">${c.en}</span>${c.es}</div>
          <div class="row example">"${c.example}"</div>`
          )
          .join("")}
      </div>
    </details>`
  ).join("");
}

// ---------- stats ----------
function svgRingGauge(percent, colorVar) {
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;
  return `
    <svg width="120" height="120" viewBox="0 0 120 120" class="ring-gauge">
      <circle cx="60" cy="60" r="${r}" fill="none" style="stroke:var(--border)" stroke-width="10"/>
      <circle cx="60" cy="60" r="${r}" fill="none" style="stroke:${colorVar}" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        transform="rotate(-90 60 60)"/>
      <text x="60" y="57" text-anchor="middle" class="ring-value">${percent}%</text>
      <text x="60" y="74" text-anchor="middle" class="ring-label">PRECISIÓN</text>
    </svg>`;
}

function svgBarChart(data, opts = {}) {
  const w = opts.width || 320;
  const h = opts.height || 150;
  const padTop = 24;
  const padBottom = 26;
  const padSide = 14;
  const chartH = h - padTop - padBottom;
  const n = data.length;
  const gap = n > 8 ? 6 : 12;
  const barW = Math.max(14, Math.min(40, (w - padSide * 2 - gap * (n - 1)) / n));
  const totalBarsW = barW * n + gap * (n - 1);
  const startX = (w - totalBarsW) / 2;
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const color = opts.color || "var(--primary)";
  const baselineY = padTop + chartH;

  const bars = data
    .map((d, i) => {
      const bh = d.value ? (d.value / maxVal) * chartH : 0;
      const x = startX + i * (barW + gap);
      const y = baselineY - Math.max(bh, d.value > 0 ? 2 : 0);
      return `
      <rect class="bar-rect" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(bh, d.value > 0 ? 2 : 0).toFixed(1)}" rx="4" style="fill:${color}"><title>${d.label}: ${d.value}</title></rect>
      ${d.value > 0 ? `<text class="bar-value" x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle">${d.value}</text>` : ""}
      <text class="bar-axis-label" x="${(x + barW / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle">${d.label}</text>`;
    })
    .join("");

  return `
    <svg class="bar-chart" width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      <line class="bar-gridline" x1="${padSide}" y1="${baselineY}" x2="${w - padSide}" y2="${baselineY}"/>
      ${bars}
    </svg>`;
}

function renderStats() {
  const area = document.getElementById("statsArea");
  const s = state.stats;
  const accuracy = s.totalReviews ? Math.round((s.totalCorrect / s.totalReviews) * 100) : 0;
  const dueCount = pickDueVocab().length;
  const accuracyColor = accuracy >= 80 ? "var(--good)" : accuracy >= 50 ? "var(--warn)" : "var(--bad)";

  const byBox = [0, 0, 0, 0, 0, 0, 0];
  state.vocab.forEach((v) => (byBox[v.box] += 1));
  const boxData = byBox.map((count, i) => ({ label: "Caja " + i, value: count }));

  const compositionData = [
    { label: "Vocab.", value: state.vocab.length },
    { label: "Frases", value: state.phrases.length },
    { label: "Phrasal", value: state.phrasalVerbs.length },
  ];

  area.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><span class="label">🔥 Racha de estudio</span><span class="value">${s.streak} día(s)</span></div>
      <div class="stat-card"><span class="label">⏳ Pendientes hoy</span><span class="value">${dueCount}</span></div>
      <div class="stat-card"><span class="label">✍️ Textos revisados</span><span class="value">${s.writingsReviewed}</span></div>
      <div class="stat-card"><span class="label">🎯 Retos completados</span><span class="value">${s.dailyChallengesCompleted}</span></div>
    </div>

    <div class="chart-card">
      <div class="chart-title">🎯 Precisión general</div>
      <div class="chart-caption">Proporción de respuestas correctas sobre el total de repasos (${s.totalCorrect}/${s.totalReviews})</div>
      <div class="chart-row">
        <div class="ring-gauge-wrap">
          ${svgRingGauge(accuracy, accuracyColor)}
        </div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-title">🗂️ Progreso por nivel de dominio</div>
      <div class="chart-caption">Sistema Leitner: cuantas más palabras en cajas altas, más dominadas están</div>
      ${svgBarChart(boxData, { height: 160 })}
    </div>

    <div class="chart-card">
      <div class="chart-title">📦 Tu contenido guardado</div>
      <div class="chart-caption">Cantidad de elementos por tipo</div>
      ${svgBarChart(compositionData, { height: 150, color: "var(--accent)" })}
    </div>
  `;
}

function renderStatsPill() {
  const pill = document.getElementById("statsPill");
  const dueCount = pickDueVocab().length;
  pill.textContent = `🔥 ${state.stats.streak} día(s) · ⏳ ${dueCount} pendientes · 📚 ${state.vocab.length} palabras`;
}

// ---------- home / dashboard ----------
const USER_NAME = "Thay";
const DAILY_GOAL = 10;

function greetingByHour() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function renderHome() {
  const area = document.getElementById("homeArea");
  const dueCount = pickDueVocab().length;
  const xp = state.stats.totalCorrect * 10 + state.stats.dailyChallengesCompleted * 20;
  const todayCount = state.stats.lastStudyDate === todayStr() ? state.stats.todayCount || 0 : 0;
  const goalPct = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100));
  const c1Pct = typeof pathOverallPct === "function" ? pathOverallPct() : 0;

  const verb = getTodayChallengeVerb();
  const today = todayStr();
  const challengeDone = verb && state.dailyChallenge.date === today && state.dailyChallenge.answered && state.dailyChallenge.verbId === verb.id;

  area.innerHTML = `
    <div class="home-greeting">
      <h2>${greetingByHour()}, ${USER_NAME} 👋</h2>
    </div>

    <div class="home-top-grid">
      <div class="stat-card"><span class="label">🔥 Racha</span><span class="value">${state.stats.streak} día(s)</span></div>
      <div class="stat-card"><span class="label">⭐ XP</span><span class="value">${xp}</span></div>
      <div class="stat-card"><span class="label">🛤️ Ruta B2→C1</span><span class="value">${c1Pct}%</span></div>
      <div class="stat-card home-goal-card">
        <span class="label">🎯 Meta de hoy</span>
        <span class="value">${todayCount}/${DAILY_GOAL} repasos</span>
        <div class="progress-bar" style="margin-top:8px"><div style="width:${goalPct}%"></div></div>
      </div>
    </div>

    ${
      verb
        ? `
    <div class="challenge-card home-challenge-card">
      <div class="eyebrow">🎯 Reto diario · Phrasal verb</div>
      <div class="verb">${verb.verb}</div>
      <div class="example">"${verb.example}"</div>
      ${
        challengeDone
          ? `<div class="feedback">${state.dailyChallenge.correct ? "✅ Ya completaste el reto de hoy." : "Ya respondiste hoy — vuelve mañana por otro."}</div>`
          : `<button class="primary" id="homeChallengeBtn">Comenzar →</button>`
      }
    </div>`
        : ""
    }

    <div class="chart-card">
      <div class="chart-title">📚 Continuar aprendiendo</div>
      <div class="home-quick-grid">
        <button class="home-quick-card" data-goto="flashcards"><span class="qc-icon">📚</span><span class="qc-label">Flashcards</span><span class="qc-sub">${dueCount} pendientes</span></button>
        <button class="home-quick-card" data-goto="phrases"><span class="qc-icon">📝</span><span class="qc-label">Frases y Gramática</span></button>
        <button class="home-quick-card" data-goto="reading"><span class="qc-icon">📖</span><span class="qc-label">Reading</span></button>
        <button class="home-quick-card" data-goto="writing"><span class="qc-icon">✍️</span><span class="qc-label">Escritura</span></button>
        <button class="home-quick-card" data-goto="path"><span class="qc-icon">🛤️</span><span class="qc-label">Ruta B2→C1</span></button>
      </div>
    </div>

    <h2 class="home-brain-heading">🧠 English Brain</h2>
    <div id="homeBrainArea" class="stats-area"></div>
  `;

  area.querySelectorAll(".home-quick-card").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.goto));
  });

  const challengeBtn = document.getElementById("homeChallengeBtn");
  if (challengeBtn) challengeBtn.addEventListener("click", () => activateTab("challenge"));

  renderEnglishBrain("homeBrainArea");
}

// ---------- english brain ----------
const OVERUSE_WATCHLIST = {
  very: ["extremely", "highly", "remarkably"],
  really: ["genuinely", "truly", "particularly"],
  good: ["excellent", "solid", "outstanding"],
  nice: ["pleasant", "lovely", "delightful"],
  bad: ["poor", "disappointing", "subpar"],
  big: ["substantial", "significant", "considerable"],
  small: ["minor", "slight", "modest"],
  thing: ["factor", "aspect", "element"],
  get: ["obtain", "acquire", "receive"],
  important: ["crucial", "essential", "fundamental"],
  tired: ["exhausted", "drained", "worn out"],
  happy: ["delighted", "thrilled", "pleased"],
  said: ["stated", "mentioned", "pointed out"],
};

const SUGGESTED_EXPRESSIONS = [
  { en: "make a decision", es: "tomar una decisión" },
  { en: "highly unlikely", es: "muy poco probable" },
  { en: "deeply concerned", es: "profundamente preocupado" },
  { en: "take something into account", es: "tomar algo en cuenta" },
  { en: "raise an issue", es: "plantear un problema" },
  { en: "however", es: "sin embargo" },
  { en: "nevertheless", es: "sin embargo / no obstante" },
  { en: "whereas", es: "mientras que" },
  { en: "as a result", es: "como resultado" },
  { en: "on the other hand", es: "por otro lado" },
  { en: "to sum up", es: "en resumen" },
  { en: "to a large extent", es: "en gran medida" },
];

function countWordOccurrences(text, word) {
  const re = new RegExp(`\\b${word}\\b`, "gi");
  const m = text.match(re);
  return m ? m.length : 0;
}

function computeOveruse() {
  const allText = state.writings.map((w) => w.text).join(" ");
  return Object.keys(OVERUSE_WATCHLIST)
    .map((word) => ({ word, count: countWordOccurrences(allText, word) }))
    .filter((w) => w.count > 0)
    .sort((a, b) => b.count - a.count);
}

function computeWordsToForget() {
  return state.vocab
    .filter((v) => v.incorrect > 0)
    .sort((a, b) => b.incorrect - b.correct - (a.incorrect - a.correct))
    .slice(0, 8);
}

function computeRepeatedMistakes() {
  const groups = {};
  state.mistakes.forEach((m) => {
    const key = `${m.subcategory}::${m.wrong}::${m.correct}`;
    if (!groups[key]) groups[key] = { ...m, count: 0 };
    groups[key].count += 1;
  });
  return Object.values(groups).sort((a, b) => b.count - a.count);
}

function computeWeakTopics() {
  const byTopic = {};
  state.mistakes.forEach((m) => {
    const key = `${m.category} → ${m.subcategory}`;
    byTopic[key] = (byTopic[key] || 0) + 1;
  });
  return Object.entries(byTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

function computeCategoryBars() {
  const cs = state.categoryStats;
  return ["Grammar", "Vocabulary", "Reading"]
    .map((name) => {
      const c = cs[name];
      if (!c || c.correct + c.incorrect === 0) return null;
      return { name, pct: Math.round((c.correct / (c.correct + c.incorrect)) * 100) };
    })
    .filter(Boolean);
}

function renderCategoryBars(bars) {
  if (!bars.length) return `<div class="empty-state">Responde algunos quizzes de gramática, vocabulario o reading para ver tus áreas aquí.</div>`;
  return bars
    .map(
      (b) => `
    <div class="brain-bar-row">
      <span class="brain-bar-label">${b.name}</span>
      <div class="progress-bar"><div style="width:${b.pct}%; background:${b.pct >= 80 ? "var(--good)" : b.pct >= 50 ? "var(--warn)" : "var(--bad)"}"></div></div>
      <span class="brain-bar-pct">${b.pct}%</span>
    </div>`
    )
    .join("");
}

function saveExpression(en, es, containerId) {
  if (state.savedExpressions.some((x) => x.en.toLowerCase() === en.toLowerCase())) {
    toast("Ya la tienes guardada");
    return;
  }
  state.savedExpressions.push({ id: uid("ex"), en, es });
  saveState();
  toast("Expresión guardada");
  renderEnglishBrain(containerId);
}

function renderEnglishBrain(containerId) {
  const area = document.getElementById(containerId);
  const wordsToForget = computeWordsToForget();
  const repeatedMistakes = computeRepeatedMistakes();
  const weakTopics = computeWeakTopics();
  const overuse = computeOveruse();
  const bars = computeCategoryBars();

  area.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><span class="label">📉 Palabras que se te olvidan</span><span class="value">${wordsToForget.length}</span></div>
      <div class="stat-card"><span class="label">🔁 Errores que repites</span><span class="value">${repeatedMistakes.filter((m) => m.count > 1).length}</span></div>
      <div class="stat-card"><span class="label">💬 Expresiones guardadas</span><span class="value">${state.savedExpressions.length}</span></div>
      <div class="stat-card"><span class="label">🗣️ Palabras que sobreusas</span><span class="value">${overuse.length}</span></div>
    </div>

    <div class="chart-card">
      <div class="chart-title">📊 Tus áreas</div>
      <div class="chart-caption">Precisión por categoría, calculada con tus respuestas en los quizzes</div>
      ${renderCategoryBars(bars)}
    </div>

    <div class="chart-card">
      <div class="chart-title">📉 Palabras que se te olvidan</div>
      <div class="chart-caption">Vocabulario donde tienes más fallos que aciertos en flashcards</div>
      ${
        wordsToForget.length
          ? `<div class="list">${wordsToForget
              .map((v) => `<div class="list-item"><div class="info"><strong>${v.en}</strong><span>${v.es} · ✅ ${v.correct} / ❌ ${v.incorrect}</span></div></div>`)
              .join("")}</div>`
          : `<div class="empty-state">Aún no hay suficientes datos — repasa flashcards para ver esto.</div>`
      }
    </div>

    <div class="chart-card">
      <div class="chart-title">🔁 Errores que repites</div>
      <div class="chart-caption">Respuestas equivocadas en tus quizzes de gramática, vocabulario y reading</div>
      ${
        repeatedMistakes.length
          ? `<div class="list">${repeatedMistakes
              .slice(0, 8)
              .map(
                (m) => `
            <div class="list-item">
              <div class="info">
                <strong>❌ ${m.wrong}</strong>
                <span>✅ ${m.correct} · ${m.category} → ${m.subcategory}${m.count > 1 ? ` · repetido ${m.count}×` : ""}</span>
              </div>
            </div>`
              )
              .join("")}</div>`
          : `<div class="empty-state">Aún no hay errores registrados — a medida que hagas quizzes, aquí aparecerán los que se repiten.</div>`
      }
    </div>

    <div class="chart-card">
      <div class="chart-title">🧩 Temas donde más fallas</div>
      <div class="chart-caption">Agrupado por categoría gramatical / de vocabulario</div>
      ${
        weakTopics.length
          ? `<div class="list">${weakTopics.map(([topic, count]) => `<div class="list-item"><div class="info"><strong>${topic}</strong><span>${count} fallo(s)</span></div></div>`).join("")}</div>`
          : `<div class="empty-state">Todavía no hay suficientes datos.</div>`
      }
    </div>

    <div class="chart-card">
      <div class="chart-title">🗣️ Palabras que sobreusas</div>
      <div class="chart-caption">Basado en la frecuencia de estas palabras en tus textos de "Escritura"</div>
      ${
        overuse.length
          ? `<div class="list">${overuse
              .map(
                (o) => `
            <div class="list-item">
              <div class="info">
                <strong>${o.word}</strong>
                <span>usada ${o.count}× · prueba: ${OVERUSE_WATCHLIST[o.word].join(", ")}</span>
              </div>
            </div>`
              )
              .join("")}</div>`
          : `<div class="empty-state">Escribe algunos textos en "Escritura" para ver qué palabras repites de más.</div>`
      }
    </div>

    <div class="chart-card">
      <div class="chart-title">💬 Expresiones que quiero usar</div>
      <div class="chart-caption">Guarda frases y colocaciones de nivel C1 para practicarlas</div>
      <div class="brain-chip-list">
        ${SUGGESTED_EXPRESSIONS.map((e) => `<button class="filter-btn brain-suggest-chip" data-en="${e.en}" data-es="${e.es}">+ ${e.en}</button>`).join("")}
      </div>
      <form class="brain-expression-form">
        <input type="text" class="brain-expr-en" placeholder="Expresión en inglés" required />
        <input type="text" class="brain-expr-es" placeholder="Significado (opcional)" />
        <button type="submit" class="secondary">+ Guardar</button>
      </form>
      ${
        state.savedExpressions.length
          ? `<div class="list" style="margin-top:14px">${state.savedExpressions
              .map(
                (e) => `
            <div class="list-item">
              <div class="info"><strong>${e.en}</strong>${e.es ? `<span>${e.es}</span>` : ""}</div>
              <button data-id="${e.id}" class="del-expression">Eliminar</button>
            </div>`
              )
              .join("")}</div>`
          : ""
      }
    </div>
  `;

  area.querySelectorAll(".brain-suggest-chip").forEach((btn) => {
    btn.addEventListener("click", () => saveExpression(btn.dataset.en, btn.dataset.es, area.id));
  });

  area.querySelector(".brain-expression-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const en = e.target.querySelector(".brain-expr-en").value.trim();
    const es = e.target.querySelector(".brain-expr-es").value.trim();
    if (!en) return;
    saveExpression(en, es, area.id);
    e.target.reset();
  });

  area.querySelectorAll(".del-expression").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.savedExpressions = state.savedExpressions.filter((x) => x.id !== btn.dataset.id);
      saveState();
      renderEnglishBrain(area.id);
    });
  });
}

// ---------- init ----------
async function init() {
  await loadState();
  setupTabs();
  setupSubTabs();
  setupGrammarQuiz();
  setupTopicQuizzes();
  setupAddForms();
  setupWriting();
  setupVerbsControls();
  document.getElementById("topbarStatsBtn").addEventListener("click", () => activateTab("stats"));
  renderHome();
  renderStatsPill();
}

init();
