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

  card.classList.remove("hidden");
}

function showNotFound() {
  card.classList.add("hidden");
  statusEl.textContent =
    "Не нашёл в мини-базе 😅 Попробуй другой E-номер/название или добавь эту добавку в additives.js.";
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
  // быстрые кнопки
  const popular = ["E200", "E202", "E211", "E220", "E250", "E330"];
  chipsWrap.innerHTML = "";

  popular.forEach(e => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = e;
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
