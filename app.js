const q = document.getElementById("q");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

const card = document.getElementById("card");
const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const chEl = document.getElementById("ch");
const orEl = document.getElementById("or");
const dnEl = document.getElementById("dn");

const chipsWrap = document.getElementById("chips");
const NOT_FOUND_PHRASES = [
  "Не нашёл 😅 Введи E-номер (например E211) или название добавки.",
  "Такой добавки в базе нет 🤔 Попробуй E*** или имя (например «лимонная кислота»).",
  "Похоже, это не E-добавка 🙃 Нужен номер типа E330 или название.",
  "Моя мини-база в шоке 😄 Введи E-номер или название добавки.",
  "Я обыскал базу и не нашёл 🕵️‍♂️ Введи E-номер (E200–E999) или название.",
  "Упс! Такой записи нет 😬 Нужен формат E211 или название добавки.",
  "Это звучит загадочно ✨ Но мне нужен E-номер или название добавки."
];

function randomNotFound() {
  return NOT_FOUND_PHRASES[Math.floor(Math.random() * NOT_FOUND_PHRASES.length)];
}
function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizeE(input) {
  // "e-211" -> "E211", " E 330 " -> "E330"
  const m = String(input || "").toLowerCase().match(/e\s*-?\s*(\d{3,4})/i);
  return m ? `E${m[1]}` : null;
}

function riskLabel(risk) {
  if (risk === "low") return "🟢 низкий риск";
  if (risk === "medium") return "🟡 средний риск";
  if (risk === "high") return "🔴 высокий риск";
  return "⚪ неизвестно";
}

function findAdditive(input) {
  const raw = String(input || "").trim();
  const e = normalizeE(raw);
  const n = normalize(raw);

  // 1) поиск по E-номеру
  if (e) {
    const byE = ADDITIVES.find(a => a.e.toUpperCase() === e.toUpperCase());
    if (byE) return byE;
  }

  // 2) поиск по названию/заголовку
  if (n.length >= 2) {
    const exact = ADDITIVES.find(a =>
      a.names?.some(name => normalize(name) === n) ||
      normalize(a.title).includes(n)
    );
    if (exact) return exact;

    const partial = ADDITIVES.find(a =>
      a.names?.some(name => normalize(name).includes(n)) ||
      normalize(a.title).includes(n)
    );
    if (partial) return partial;
  }

  return null;
}

function showCard(a) {
  titleEl.textContent = a.title;

  const cat = a.category ? `<span class="badge">${a.category}</span>` : "";
  const rk  = a.risk ? `<span class="badge">${riskLabel(a.risk)}</span>` : "";
  metaEl.innerHTML = `${cat} ${rk}`.trim();

  chEl.textContent = a.characteristics || "";
  orEl.textContent = a.origin || "";
  dnEl.textContent = a.danger || "";

card.classList.add("hidden");
card.classList.remove("show");

requestAnimationFrame(() => {
  card.classList.remove("hidden");
  card.classList.add("show");
});

}
function showNotFound() {
  card.classList.add("hidden");
  card.classList.remove("show");
  statusEl.textContent = randomNotFound();
}



function ask() {
  const query = q.value.trim();
  if (!query) return;

  statusEl.textContent = "";
  const a = findAdditive(query);

  if (a) showCard(a);
  else showNotFound();
}

function renderChips() {
  chipsWrap.innerHTML = "";

  // берём только самые популярные (первые 20, чтобы не было перегруза)
  const popular = ADDITIVES
    .map(a => a.e)
    .filter(Boolean)
    .slice(0, 20);

  popular.forEach(e => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = e;
    chip.title = "Нажми, чтобы найти " + e;

    chip.addEventListener("click", () => {
      q.value = e;
      ask();
    });

    chipsWrap.appendChild(chip);
  });
}


btn.addEventListener("click", ask);
q.addEventListener("keydown", (e) => { if (e.key === "Enter") ask(); });

renderChips();
