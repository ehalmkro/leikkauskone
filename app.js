// Leikkauskone – application logic.
//
// The visitor's choices live in one place, `state.selected` (measure id -> count). Everything on the page is
// derived from it: update() re-syncs the DOM after every change. Easy-mode answers are not stored separately –
// a question's answer is whichever of its levels matches the current selection.
//
// Inputs: data.js (CUTS_DATA), config.js (CONFIG), i18n.js (STRINGS), questions.js (QUESTIONS).
// All amounts are million euros per year.

(function () {
  "use strict";

  const { CUTS_DATA: DATA, CONFIG, STRINGS, QUESTIONS } = window;
  const M = DATA.measures;
  const YEARS = DATA.years;
  const QS = QUESTIONS.questions;
  const RESULT_STEP = QS.length; // wizard steps 0 … QS.length - 1 are questions, QS.length is the result page
  const STORAGE_KEY = "leikkauskone:v1";
  const AUTO_ADVANCE_MS = 600;

  // Expand easy-mode levels: "VER-74*3" -> { id: "VER-74", count: 3 }
  for (const q of QS) {
    for (const level of q.levels) {
      level.items = level.measures.map((s) => {
        const [id, count] = s.split("*");
        return { id, count: Number(count) || 1 };
      });
      level.items.filter((x) => !M[x.id]).forEach((x) => console.warn(`questions.js: unknown measure ${x.id} in ${q.id}`));
      level.items = level.items.filter((x) => M[x.id]);
    }
    q.ids = [...new Set(q.levels.flatMap((l) => l.items.map((x) => x.id)))];
  }

  const state = {
    lang: browserLanguage(),
    mode: "easy", // "easy" | "advanced"
    easyView: "wizard", // "wizard" (one question at a time) | "list" (all at once)
    step: 0,
    answered: new Set(), // questions answered in the wizard, so that "No change" shows as chosen only once picked
    year: CONFIG.defaultYear,
    includeFunds: false,
    selected: new Map(), // measure id -> count (1, or the number of steps for adjustable tax measures)
    expanded: new Set(), // open groups in the detailed view
    query: "",
  };

  // ---------- Helpers ----------

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function browserLanguage() {
    const codes = CONFIG.languages.map((l) => l.code);
    const preferred = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
    return preferred.find((l) => codes.includes(l)) || codes[0];
  }

  // UI string with {placeholders}; falls back to the first language if a key is missing.
  function t(key, vars = {}) {
    const fallback = STRINGS[CONFIG.languages[0].code];
    const s = STRINGS[state.lang]?.[key] ?? fallback[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  }

  // A text from config.js or questions.js: either a plain string or { fi: …, en: … }.
  const loc = (v) => (v == null || typeof v === "string" ? v ?? "" : v[state.lang] ?? v[CONFIG.languages[0].code] ?? "");

  // Measures, groups and categories have a Finnish `name` and an English `nameEn`.
  const nameOf = (x) => (state.lang !== "fi" && x.nameEn ? x.nameEn : x.name);

  const numberFormats = {};
  function formatNumber(value, maxDecimals, minDecimals = 0) {
    const key = `${state.lang}:${maxDecimals}:${minDecimals}`;
    numberFormats[key] ??= new Intl.NumberFormat(state.lang === "fi" ? "fi-FI" : "en-GB", {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
    return numberFormats[key].format(value);
  }

  // Finnish "1,2 mrd €" / "350 milj. €", English "€1.2bn" / "€350m"
  function formatEur(millions) {
    const a = Math.abs(millions);
    const sign = millions < 0 ? "−" : "";
    if (a === 0) return state.lang === "fi" ? "0 €" : "€0";
    const [num, unit] = a >= 1000 ? [formatNumber(a / 1000, 1, 1), t("billions")] : [formatNumber(a, a < 10 ? 1 : 0), t("millions")];
    return state.lang === "fi" ? `${sign}${num} ${unit}` : `${sign}€${num}${unit}`;
  }

  // ---------- Calculations ----------

  const yearIndex = () => YEARS.indexOf(state.year);

  // Impact of one measure (or one step of an adjustable measure); null = no euro estimate.
  function impact(m, i = yearIndex()) {
    const gov = m.government[i];
    const funds = state.includeFunds ? m.funds[i] : null;
    if (gov == null && funds == null) return null;
    return (gov || 0) + (funds || 0);
  }

  const hasEstimate = (m) => m.government.some((x) => x != null) || m.funds.some((x) => x != null);
  const selectedImpact = (id) => (impact(M[id]) || 0) * (state.selected.get(id) || 0);
  const savesMoney = (m) => YEARS.reduce((sum, _, i) => sum + (impact(m, i) || 0), 0) > 0;

  function totals() {
    let spending = 0;
    let taxes = 0;
    for (const id of state.selected.keys()) {
      if (M[id].type === "tax") taxes += selectedImpact(id);
      else spending += selectedImpact(id);
    }
    const byCategory = {};
    for (const c of DATA.categories) {
      byCategory[c.id] = c.groups.flatMap((g) => g.measures).reduce((sum, id) => sum + selectedImpact(id), 0);
    }
    return { spending, taxes, total: spending + taxes, byCategory };
  }

  // ---------- Selection rules ----------

  const selectedConflicts = (id) => M[id].conflicts.filter((c) => state.selected.has(c));

  // Selects a measure (count 0 removes it) and drops conflicting selections. Returns the dropped ids.
  function select(id, count = 1) {
    const removed = count > 0 ? selectedConflicts(id) : [];
    removed.forEach((c) => state.selected.delete(c));
    if (count > 0) state.selected.set(id, count);
    else state.selected.delete(id);
    return removed;
  }

  // Measures a "Select group" click would add: savers from largest to smallest, skipping conflicts,
  // so that among alternatives the one that saves the most wins.
  function packageFor(group, selected = state.selected) {
    const taken = new Set(selected.keys());
    const toAdd = [];
    const byImpact = [...group.measures].sort((a, b) => (impact(M[b]) || 0) - (impact(M[a]) || 0));
    for (const id of byImpact) {
      const m = M[id];
      if (taken.has(id) || !savesMoney(m) || m.conflicts.some((c) => taken.has(c))) continue;
      toAdd.push(id);
      taken.add(id);
    }
    return toAdd;
  }

  const potential = (group) => packageFor(group, new Map()).reduce((sum, id) => sum + (impact(M[id]) || 0), 0);

  // ---------- Easy-mode questions ----------

  const levelTotal = (level) => level.items.reduce((sum, x) => sum + (impact(M[x.id]) || 0) * x.count, 0);
  const levelName = (q, n) => (n === 0 ? t("noChange") : loc(q.levels[n - 1].name) || t(n === 1 ? "levelLow" : "levelHigh"));

  // 0 = no change, 1… = level, -1 = the selection matches no level (edited in the detailed view)
  function currentLevel(q) {
    const chosen = q.ids.filter((id) => state.selected.has(id));
    if (!chosen.length) return 0;
    const n = q.levels.findIndex(
      (l) => l.items.length === chosen.length && l.items.every((x) => state.selected.get(x.id) === x.count)
    );
    return n + 1 || -1;
  }

  function setLevel(q, n) {
    q.ids.forEach((id) => state.selected.delete(id));
    if (n > 0) notifyRemoved(q.levels[n - 1].items.flatMap((x) => select(x.id, x.count)));
  }

  // ---------- Saving and share links ----------

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lang: state.lang,
          mode: state.mode,
          easyView: state.easyView,
          step: state.step,
          answered: [...state.answered],
          year: state.year,
          includeFunds: state.includeFunds,
          selected: [...state.selected],
        })
      );
    } catch {
      // Storage can be unavailable (private browsing, blocked site data); the page still works.
    }
  }

  function load() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return;
    }
    if (!saved) return;
    if (CONFIG.languages.some((l) => l.code === saved.lang)) state.lang = saved.lang;
    if (saved.mode === "advanced") state.mode = "advanced";
    if (saved.easyView === "list") state.easyView = "list";
    if (Number.isInteger(saved.step)) state.step = Math.max(0, Math.min(saved.step, RESULT_STEP));
    if (YEARS.includes(saved.year)) state.year = saved.year;
    state.includeFunds = saved.includeFunds === true;
    (saved.answered || []).forEach((id) => state.answered.add(id));
    (saved.selected || []).forEach(([id, count]) => M[id] && select(id, Math.min(count, M[id].unit?.max || 1)));
  }

  // Share links pack the selection into a fixed-size code: one bit per measure (three bits for adjustable
  // ones), measures in id order, six bits per URL-safe character. About 85 characters whatever is selected.
  // The code is tied to the data: if measures are added or removed, older links decode differently.
  const LINK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const LINK_ORDER = Object.keys(M).sort();
  const bitsFor = (id) => (M[id].unit ? 3 : 1);

  function encodeSelection() {
    const bits = [];
    for (const id of LINK_ORDER) {
      const count = state.selected.get(id) || 0;
      for (let b = bitsFor(id) - 1; b >= 0; b--) bits.push((count >> b) & 1);
    }
    let code = "";
    for (let i = 0; i < bits.length; i += 6) {
      code += LINK_CHARS[bits.slice(i, i + 6).reduce((v, bit, j) => v | (bit << (5 - j)), 0)];
    }
    return code.replace(/A+$/, ""); // trailing zeros are implied
  }

  function decodeSelection(code) {
    const bits = [...code].flatMap((ch) => {
      const v = Math.max(0, LINK_CHARS.indexOf(ch));
      return [5, 4, 3, 2, 1, 0].map((b) => (v >> b) & 1);
    });
    const selected = new Map();
    let pos = 0;
    for (const id of LINK_ORDER) {
      let count = 0;
      for (let b = 0; b < bitsFor(id); b++) count = (count << 1) | (bits[pos++] || 0);
      if (count) selected.set(id, Math.min(count, M[id].unit?.max || 1));
    }
    return selected;
  }

  const shareUrl = () => `${location.href.split("#")[0]}#s=${encodeSelection()}`;

  // A shared link opens the sender's choices on the result page; the code is then removed from the address bar.
  function loadSharedLink() {
    const code = new URLSearchParams(location.hash.slice(1)).get("s");
    if (code == null) return;
    state.selected = decodeSelection(code);
    state.answered = new Set(QS.map((q) => q.id));
    state.mode = "easy";
    state.easyView = "wizard";
    state.step = RESULT_STEP;
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---------- Toast ----------

  let toastTimer;
  function toast(text) {
    const el = $("#toast");
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 5000);
  }

  function notifyRemoved(removed) {
    if (!removed.length) return;
    toast(t("toastRemoved", { names: removed.map((id) => `”${truncate(nameOf(M[id]), 70)}”`).join(", ") }));
  }

  // ---------- Rendering (on start and when the language changes) ----------

  function renderAll() {
    document.documentElement.lang = state.lang;
    document.title = t("pageTitle");
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    $$("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $("#lang").value = state.lang;
    $("#year").innerHTML = YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");
    $("#sources").innerHTML = CONFIG.sources
      .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(loc(s.name))}</a></li>`)
      .join("");
    $("#source-note").textContent =
      t("sourceNote", { source: DATA.source.name, date: DATA.source.date }) +
      (DATA.source.taxes ? t("sourceNoteTaxes") : ".") +
      t("sourceNoteInterpretation");
    renderEasy();
    renderDetailed();
  }

  // Easy mode: the same question markup serves both views; CSS and update() decide what is shown.
  function renderEasy() {
    const option = (q, n) => `
      <label class="option">
        <input type="radio" name="q-${q.id}" value="${n}">
        <span class="option-text">
          <span class="option-head">
            <span class="option-name">${esc(levelName(q, n))}</span>
            <span class="option-amount" data-level-amount></span>
          </span>
          <span class="option-description">${esc(n === 0 ? t("noChangeDescription") : loc(q.levels[n - 1].description))}</span>
        </span>
      </label>`;

    const question = (q) => `
      <fieldset class="question" data-question="${q.id}">
        <legend><h3 tabindex="-1">${esc(loc(q.title))}</h3></legend>
        <p class="question-description">${esc(loc(q.description))}</p>
        <p class="notice-text" data-edited hidden>${esc(t("modifiedInAdvanced"))}</p>
        <div class="options">${[0, ...q.levels.map((_, i) => i + 1)].map((n) => option(q, n)).join("")}</div>
        <p class="chosen-description" data-chosen-description></p>
        <details class="card-details" data-card-details="${q.id}">
          <summary>${esc(t("cardDetails"))}</summary>
          <div class="card-details-body"></div>
        </details>
      </fieldset>`;

    $("#easy").innerHTML = `
      <div class="segmented easy-view-switch" role="group" aria-label="${esc(t("easyViewLabel"))}">
        <button type="button" data-easy-view="wizard">${esc(t("viewOneByOne"))}</button>
        <button type="button" data-easy-view="list">${esc(t("viewAll"))}</button>
      </div>

      <div class="wizard-progress" data-wizard-only>
        <p data-progress-text></p>
        <div class="progress" aria-hidden="true"><div data-progress-bar></div></div>
      </div>

      ${QUESTIONS.sections
        .map(
          (s) => `
        <section class="question-section" data-section="${s.id}">
          <h2>${esc(loc(s.title))}</h2>
          ${QS.filter((q) => q.section === s.id).map(question).join("")}
        </section>`
        )
        .join("")}

      <nav class="wizard-nav" data-wizard-only aria-label="${esc(t("wizardNav"))}">
        <button type="button" class="btn secondary big" data-step-by="-1">${esc(t("previous"))}</button>
        <button type="button" class="btn big" data-step-by="1"></button>
      </nav>

      <section class="result" id="result">
        <h2 tabindex="-1">${esc(t("resultTitle"))}</h2>
        <p class="result-text" data-result-text></p>
        <div class="actions">
          <button type="button" class="btn" data-share-image>${esc(t("shareImage"))}</button>
          <button type="button" class="btn secondary" data-share>${esc(t("share"))}</button>
        </div>
        <h3 class="answers-title">${esc(t("yourAnswers"))}</h3>
        <p class="muted answers-hint">${esc(t("answersHint"))}</p>
        <ol class="answers" data-answers></ol>
        <div class="actions">
          <button type="button" class="btn secondary" data-start-over>${esc(t("startOver"))}</button>
          <button type="button" class="btn secondary" data-mode="advanced">${esc(t("toAdvanced", { n: Object.keys(M).length }))}</button>
        </div>
      </section>`;
  }

  function renderCardDetails(q) {
    return q.levels
      .map(
        (l, i) => `
        <p class="details-title">${esc(levelName(q, i + 1))}:</p>
        <ul>${l.items
          .map((x) => {
            const a = impact(M[x.id]);
            const steps = M[x.id].unit ? ` (+${x.count} × ${esc(M[x.id].unit.step)})` : "";
            return `<li><span>${esc(nameOf(M[x.id]))}${steps}</span><span class="num">${a == null ? "–" : formatEur(a * x.count)}</span></li>`;
          })
          .join("")}</ul>`
      )
      .join("");
  }

  // Detailed view: categories → groups → individual measures.
  function renderDetailed() {
    const descriptions = CONFIG.categoryDescriptions || {};
    const swatch = (i) => `<span class="swatch" style="background:var(--series-${i + 1})"></span>`;
    $("#categories").innerHTML = `
      <nav class="jump-nav" aria-label="${esc(t("categoriesNav"))}">
        ${DATA.categories.map((c, i) => `<a href="#cat-${c.id}">${swatch(i)}${esc(nameOf(c))}</a>`).join("")}
      </nav>
      ${DATA.categories
        .map(
          (c, i) => `
        <section class="category" id="cat-${c.id}" data-category="${c.id}">
          <div class="category-header">
            <h2>${swatch(i)}${esc(nameOf(c))}</h2>
            <span class="category-total" data-category-total></span>
          </div>
          ${descriptions[c.id] ? `<p class="category-description">${esc(loc(descriptions[c.id]))}</p>` : ""}
          ${c.groups.map(renderGroup).join("")}
        </section>`
        )
        .join("")}
      <p class="no-results" id="no-results" hidden>${esc(t("noResults"))}</p>`;
  }

  function renderGroup(g) {
    return `
      <div class="group" data-group="${g.id}">
        <div class="group-header">
          <button type="button" class="group-toggle" aria-expanded="false" aria-controls="list-${g.id}">
            <span class="chevron" aria-hidden="true"></span>
            <span>
              <span class="group-name">${esc(nameOf(g))}</span><br>
              <span class="group-status" data-group-status></span>
            </span>
          </button>
          <div class="group-figures" data-group-figures></div>
          <button type="button" class="btn small" data-package="${g.id}"></button>
        </div>
        <ul class="measure-list" id="list-${g.id}" hidden>
          ${g.measures.map((id) => renderMeasure(M[id])).join("")}
        </ul>
      </div>`;
  }

  function renderMeasure(m) {
    const badges = [];
    if (m.alternative) badges.push(t("badgeAlternative"));
    if (!hasEstimate(m)) badges.push(t("badgeNoEstimate"));
    if (m.type === "tax" && m.fromYear > YEARS[0]) badges.push(t("badgeFrom", { year: m.fromYear }));
    const fundsBadge = m.funds.some((x) => x > 0) ? `<span class="badge notice" data-funds-badge>${esc(t("badgeFunds"))}</span>` : "";
    // The budget item ("kohde") only makes sense in Finnish
    const target = state.lang === "fi" && m.type === "spending" && m.target ? `<span>${esc(m.target)}</span>` : "";

    const control = m.unit
      ? `<span class="measure-select"><span class="measure-name" id="name-${m.id}">${esc(nameOf(m))}</span></span>
         <span class="stepper" role="group" aria-labelledby="name-${m.id}">
           <button type="button" data-step="-1" data-id="${m.id}" aria-label="${esc(t("decrease"))}">−</button>
           <output data-count aria-live="polite"></output>
           <button type="button" data-step="1" data-id="${m.id}" aria-label="${esc(t("increase"))}">+</button>
         </span>`
      : `<label class="measure-select">
           <input type="checkbox" data-select="${m.id}">
           <span class="measure-name">${esc(nameOf(m))}</span>
         </label>`;

    return `
      <li class="measure${m.unit ? " measure-unit" : ""}" data-id="${m.id}">
        <div class="measure-row">
          ${control}
          <span class="measure-amount" data-amount></span>
        </div>
        <div class="measure-meta">${target}${badges.map((b) => `<span class="badge">${esc(b)}</span>`).join("")}${fundsBadge}</div>
        <p class="measure-conflict" data-conflict hidden></p>
        <details class="measure-details" data-details="${m.id}">
          <summary>${esc(t("details"))}</summary>
          <div class="measure-details-body"></div>
        </details>
      </li>`;
  }

  // Filled in only when opened.
  function renderMeasureDetails(m) {
    const fmt = (x) => (x == null ? "–" : formatNumber(x, 1));
    const meur = state.lang === "fi" ? "milj. €" : "€m";
    const now = yearIndex();
    const cell = (x, i, tag = "td") => `<${tag}${i === now ? ' class="current"' : ""}>${tag === "th" ? x : fmt(x)}</${tag}>`;
    let html;
    if (m.type === "tax") {
      const value = m.government.some((x) => x != null) ? Math.max(...m.government.map((x) => x || 0)) : null;
      const basis = state.lang !== "fi" && m.basisEn ? m.basisEn : m.basis;
      html = `<p><strong>${esc(t("taxEstimate"))}:</strong> ${esc(m.vmEstimate || "–")} ${meur}<br>
        <strong>${esc(t("taxUsed"))}:</strong> ${value == null ? t("noEstimate") : formatEur(value)}${m.unit ? ` (${esc(t("perStep", { step: m.unit.step }))})` : ""} – ${esc(basis)}.<br>
        ${esc(t("taxConstant"))}${m.fromYear > YEARS[0] ? esc(t("taxFrom", { year: m.fromYear })) : ""}.</p>`;
    } else {
      html = `<div class="table-scroll"><table class="year-table">
        <thead><tr><th scope="col">${meur}</th>${YEARS.map((y, i) => cell(y, i, "th")).join("")}</tr></thead>
        <tbody>
          <tr><th scope="row">${esc(t("governmentRow"))}</th>${m.government.map((x, i) => cell(x, i)).join("")}</tr>
          <tr><th scope="row">${esc(t("fundsRow"))}</th>${m.funds.map((x, i) => cell(x, i)).join("")}</tr>
        </tbody></table></div>`;
    }
    // VM's background texts exist only in Finnish
    if (m.background || m.memo) {
      if (state.lang !== "fi") html += `<p><em>${esc(t("backgroundFinnishOnly"))}</em></p>`;
      if (m.background) html += `<p lang="fi">${esc(m.background)}</p>`;
      if (m.memo) html += `<p lang="fi"><strong>${esc(t("memo"))}:</strong> ${esc(m.memo)}</p>`;
    }
    if (m.conflicts.length) {
      html += `<p><strong>${esc(t("cannotCombine"))}:</strong> ${m.conflicts.map((c) => esc(truncate(nameOf(M[c]), 80))).join("; ")}</p>`;
    }
    return html;
  }

  // ---------- Update (after every change) ----------

  function update() {
    document.body.dataset.mode = state.mode;
    $$(".mode-switch [data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
    $("#year").value = String(state.year);
    $("#funds").checked = state.includeFunds;
    $("#year-label").textContent = state.year;

    const sums = totals();
    updateMeter(sums);
    updateEasy(sums);
    updateDetailed(sums);
    $$("details[open][data-details]").forEach((d) => ($(".measure-details-body", d).innerHTML = renderMeasureDetails(M[d.dataset.details])));
    $$("details[open][data-card-details]").forEach(
      (d) => ($(".card-details-body", d).innerHTML = renderCardDetails(QS.find((q) => q.id === d.dataset.cardDetails)))
    );
    save();
  }

  function updateMeter({ total, byCategory }) {
    $("#total").textContent = formatEur(total);
    const max = Math.max(CONFIG.scaleMax, total * 1.05);
    const milestones = CONFIG.milestones;

    $("#bar").innerHTML = DATA.categories
      .map((c, i) =>
        byCategory[c.id] > 0
          ? `<div class="bar-segment" style="width:${(byCategory[c.id] / max) * 100}%;background:var(--series-${i + 1})" title="${esc(nameOf(c))}: ${formatEur(byCategory[c.id])}"></div>`
          : ""
      )
      .join("");
    $("#bar").setAttribute("aria-label", t("barAria", { total: formatEur(total), max: formatEur(max) }));

    $("#milestones").innerHTML = milestones
      .map((ms, n) => {
        const left = (ms.value / max) * 100;
        const classes = ["milestone", total >= ms.value && "reached", left > 85 && "align-right", n % 2 && "upper"].filter(Boolean).join(" ");
        return `<div class="${classes}" style="left:${left}%"><span>${esc(loc(ms.short))}</span></div>`;
      })
      .join("");

    $("#milestone-list").innerHTML = milestones
      .map((ms) => {
        const ok = total >= ms.value;
        return `<li class="${ok ? "reached" : ""}" title="${esc(loc(ms.description))}">
          <span class="icon" aria-hidden="true">${ok ? "✓" : ""}</span>
          <span>${esc(loc(ms.name))}: ${formatEur(ms.value)}${ok ? ` – ${esc(t("reached"))}` : ""}</span></li>`;
      })
      .join("");

    const next = milestones.find((ms) => total < ms.value);
    const previous = milestones.filter((ms) => total >= ms.value).pop();
    let text;
    if (!next) text = t("allReachedHtml");
    else if (previous) text = t("reachedNextHtml", { reached: esc(loc(previous.name)), next: esc(loc(next.name)), missing: formatEur(next.value - total) });
    else text = t("nextHtml", { next: esc(loc(next.name)), missing: formatEur(next.value - total) });
    if (state.year !== CONFIG.defaultYear) text += ` <span class="year-note">${esc(t("yearNote", { year: CONFIG.defaultYear }))}</span>`;
    $("#next-goal").innerHTML = text;
  }

  function updateEasy({ spending, taxes, total }) {
    const wizard = state.easyView === "wizard";
    const onResult = wizard && state.step === RESULT_STEP;
    $("#easy").dataset.view = state.easyView;
    $$("[data-easy-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.easyView === state.easyView)));

    // Which parts are visible
    $$("[data-wizard-only]").forEach((el) => (el.hidden = !wizard || onResult));
    $$(".question").forEach((el, i) => (el.hidden = wizard && i !== state.step));
    $$(".question-section").forEach((el) => (el.hidden = !$$(".question", el).some((q) => !q.hidden)));
    $("#result").hidden = wizard && !onResult;

    if (wizard && !onResult) {
      const q = QS[state.step];
      const section = QUESTIONS.sections.find((s) => s.id === q.section);
      $("[data-progress-text]").textContent = `${t("questionOf", { n: state.step + 1, total: RESULT_STEP })} · ${loc(section.title)}`;
      $("[data-progress-bar]").style.width = `${(state.step / RESULT_STEP) * 100}%`;
      $('[data-step-by="-1"]').disabled = state.step === 0;
      $('[data-step-by="1"]').textContent = state.step === RESULT_STEP - 1 ? t("toResult") : t("next");
    }

    // Answers
    for (const q of QS) {
      const el = $(`.question[data-question="${q.id}"]`);
      const current = currentLevel(q);
      // In the wizard, "No change" is marked only once the visitor has actually picked it
      const showNoChange = !wizard || state.answered.has(q.id);
      $$("input", el).forEach((input) => {
        const n = Number(input.value);
        input.checked = n === current && (n > 0 || showNoChange);
        const amount = $("[data-level-amount]", input.closest(".option"));
        amount.textContent = n === 0 ? "" : formatEur(levelTotal(q.levels[n - 1]));
      });
      el.classList.toggle("answered", current !== 0);
      $("[data-edited]", el).hidden = current !== -1;
      $("[data-chosen-description]", el).textContent = current > 0 ? loc(q.levels[current - 1].description) : "";
    }

    // Result page
    const milestones = CONFIG.milestones;
    const reached = milestones.filter((ms) => total >= ms.value);
    let text = t("resultNothing");
    if (state.selected.size) {
      text = t("resultSplit", { spending: formatEur(spending), taxes: formatEur(taxes), total: formatEur(total) });
      if (!reached.length) text += t("resultNone", { first: formatEur(milestones[0].value) });
      else if (reached.length === milestones.length) text += t("resultAll");
      else text += t("resultSome", { name: loc(reached[reached.length - 1].name).toLowerCase() });
      text += t("resultQuestion");
    }
    $("[data-result-text]").textContent = text;

    $("[data-answers]").innerHTML = QS.map((q, i) => {
      const n = currentLevel(q);
      const answer = n === -1 ? t("modified") : levelName(q, n);
      const amount = n === 0 ? "" : formatEur(q.ids.reduce((sum, id) => sum + selectedImpact(id), 0));
      return `<li><button type="button" class="answer" data-go-to-step="${i}">
          <span class="answer-question">${esc(loc(q.title))}</span>
          <span class="answer-choice${n === 0 ? " muted" : ""}">${esc(answer)}${amount ? ` · ${amount}` : ""}</span>
        </button></li>`;
    }).join("");
  }

  function updateDetailed({ total, byCategory }) {
    const i = yearIndex();
    for (const li of $$(".measure")) {
      const id = li.dataset.id;
      const m = M[id];
      const count = state.selected.get(id) || 0;
      li.classList.toggle("selected", count > 0);

      const checkbox = $("input[data-select]", li);
      if (checkbox) checkbox.checked = count > 0;
      if (m.unit) {
        $("[data-count]", li).textContent = count ? `+${count} × ${m.unit.step}` : t("noIncrease");
        $('[data-step="-1"]', li).disabled = count === 0;
        $('[data-step="1"]', li).disabled = count >= m.unit.max;
      }

      const a = impact(m, i);
      const amountEl = $("[data-amount]", li);
      amountEl.classList.toggle("empty", a == null);
      amountEl.classList.toggle("negative", a != null && a < 0);
      amountEl.textContent = a == null ? t("noEstimate") : m.unit && count <= 1 ? `${formatEur(a)} / ${m.unit.step}` : formatEur(a * Math.max(count, 1));
      amountEl.title = a != null && a < 0 ? t("negativeTitle") : "";

      const fundsBadge = $("[data-funds-badge]", li);
      if (fundsBadge) fundsBadge.hidden = state.includeFunds;

      const conflicts = count ? [] : selectedConflicts(id);
      li.classList.toggle("blocked", conflicts.length > 0);
      const conflictEl = $("[data-conflict]", li);
      conflictEl.hidden = !conflicts.length;
      conflictEl.textContent = conflicts.length ? t("conflictNote", { names: conflicts.map((c) => truncate(nameOf(M[c]), 60)).join("; ") }) : "";
    }

    for (const c of DATA.categories) {
      let categoryPotential = 0;
      for (const g of c.groups) {
        const el = $(`[data-group="${g.id}"]`);
        const chosen = g.measures.filter((id) => state.selected.has(id));
        const groupTotal = chosen.reduce((sum, id) => sum + selectedImpact(id), 0);
        const pot = potential(g);
        categoryPotential += pot;
        el.classList.toggle("has-selection", chosen.length > 0);
        $("[data-group-status]", el).textContent =
          t("measuresCount", { n: g.measures.length }) + (chosen.length ? ` · ${t("selectedCount", { n: chosen.length })}` : "");
        $("[data-group-figures]", el).innerHTML = chosen.length
          ? `<strong>${formatEur(groupTotal)}</strong>${esc(t("selectedFigure"))}`
          : `<strong>${formatEur(pot)}</strong>${esc(t("maxFigure"))}`;

        const btn = $("[data-package]", el);
        const canAdd = packageFor(g).length > 0;
        btn.textContent = canAdd ? (chosen.length ? t("selectRest") : t("selectGroup")) : t("removeSelections");
        btn.classList.toggle("secondary", !canAdd);
        btn.disabled = !canAdd && !chosen.length;
        btn.dataset.action = canAdd ? "add" : "remove";
      }
      $(`[data-category="${c.id}"] [data-category-total]`).innerHTML = byCategory[c.id]
        ? t("categorySelected", { total: formatEur(byCategory[c.id]), max: formatEur(categoryPotential) })
        : t("categoryMax", { max: formatEur(categoryPotential) });
    }

    // Sidebar summary
    const n = state.selected.size;
    $("#selection-count").textContent = n ? t("selectionCount", { n, total: formatEur(total), year: state.year }) : t("nothingSelectedAdvanced");
    $("#breakdown tbody").innerHTML = DATA.categories
      .map((c, idx) =>
        byCategory[c.id]
          ? `<tr><td><span class="swatch" style="background:var(--series-${idx + 1})"></span>${esc(nameOf(c))}</td><td>${formatEur(byCategory[c.id])}</td></tr>`
          : ""
      )
      .join("");
    const chosen = [...state.selected.keys()].sort((a, b) => selectedImpact(b) - selectedImpact(a));
    $("#selected-list").innerHTML = chosen
      .map((id) => {
        const m = M[id];
        const count = state.selected.get(id);
        const name = truncate(nameOf(m), 90) + (m.unit ? ` (+${count} × ${m.unit.step})` : "");
        return `<li><span class="name">${esc(name)}</span><span class="amount">${formatEur(selectedImpact(id))}</span>
          <button type="button" data-remove="${id}" aria-label="${esc(t("removeNamed", { name: nameOf(m) }))}">×</button></li>`;
      })
      .join("");
    $("#selected-title").hidden = !n;
    $("#summary-actions").hidden = !n;

    applySearch();
  }

  function setExpanded(groupEl, expanded) {
    $(".group-toggle", groupEl).setAttribute("aria-expanded", String(expanded));
    $(".measure-list", groupEl).hidden = !expanded;
  }

  function applySearch() {
    const query = state.query.trim().toLowerCase();
    let matches = 0;
    for (const cat of $$(".category")) {
      let catMatches = 0;
      for (const g of $$(".group", cat)) {
        const groupName = $(".group-name", g).textContent;
        let groupMatches = 0;
        for (const li of $$(".measure", g)) {
          const m = M[li.dataset.id];
          // Both languages are searched, so Finnish terms work in the English view too
          li.hidden = !!query && ![m.name, m.nameEn, m.target, groupName].join(" ").toLowerCase().includes(query);
          if (!li.hidden) groupMatches++;
        }
        g.hidden = !!query && !groupMatches;
        setExpanded(g, query ? groupMatches > 0 : state.expanded.has(g.dataset.group));
        catMatches += groupMatches;
      }
      cat.hidden = !!query && !catMatches;
      matches += catMatches;
    }
    $("#no-results").hidden = !query || matches > 0;
    $(".jump-nav").hidden = !!query;
  }

  // ---------- Wizard navigation ----------

  let advanceTimer;

  function goToStep(step) {
    clearTimeout(advanceTimer);
    state.step = Math.max(0, Math.min(step, RESULT_STEP));
    update();
    // Bring the new question below the sticky meter and move focus to its heading
    const heading = state.step === RESULT_STEP ? $("#result h2") : $$(".question h3")[state.step];
    const meterHeight = $(".meter").getBoundingClientRect().height;
    const top = heading.getBoundingClientRect().top;
    if (top < meterHeight || top > window.innerHeight * 0.5) {
      window.scrollTo({ top: top + window.scrollY - meterHeight - 60, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
    heading.focus({ preventScroll: true });
  }

  // ---------- Sharing ----------

  async function share() {
    const text = t("shareText", { total: formatEur(totals().total) });
    const url = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title: t("appName"), text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast(t("toastCopied"));
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("toastCopyFailed"));
    }
  }

  function imageData() {
    const { spending, taxes, total, byCategory } = totals();
    const milestones = CONFIG.milestones;
    const reached = milestones.filter((ms) => total >= ms.value);
    const next = milestones.find((ms) => total < ms.value);
    let status;
    if (!next) status = t("imageAllReached");
    else if (reached.length) status = t("imageReached", { name: loc(reached[reached.length - 1].name) });
    else status = t("imageMissing", { target: formatEur(next.value), missing: formatEur(next.value - total) });
    const hosted = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

    return {
      appName: t("appName"),
      year: state.year,
      headline: t("imageHeadline"),
      total: formatEur(total),
      totalValue: total,
      status,
      statusReached: reached.length > 0,
      scaleMax: CONFIG.scaleMax,
      segments: DATA.categories.map((c, i) => ({ value: byCategory[c.id], colorIndex: i })),
      milestones: milestones.map((ms) => ({ value: ms.value, label: loc(ms.short), reached: total >= ms.value })),
      cutsLabel: t("imageCuts"),
      cuts: formatEur(spending),
      taxesLabel: t("imageTaxes"),
      taxes: formatEur(taxes),
      topLabel: t("imageTop"),
      top: [...state.selected.keys()]
        .sort((a, b) => selectedImpact(b) - selectedImpact(a))
        .slice(0, 3)
        .map((id) => ({ name: nameOf(M[id]), amount: formatEur(selectedImpact(id)) })),
      cta: t("imageCta"),
      source: t("imageSource"),
      url: hosted ? (location.host + location.pathname).replace(/\/(index\.html)?$/, "") : "",
    };
  }

  let imageFile = null;
  let imageUrl = null;

  async function openImageDialog() {
    let blob;
    try {
      blob = await window.ShareImage.render(imageData());
    } catch {
      toast(t("imageFailed"));
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(blob);
    imageFile = new File([blob], t("imageFileName"), { type: "image/png" });

    const img = $("#share-image");
    img.src = imageUrl;
    img.alt = t("imageAlt", { total: formatEur(totals().total), year: state.year });
    $("#image-download").href = imageUrl;
    $("#image-download").download = t("imageFileName");
    // Phones can share the file directly (e.g. to WhatsApp); elsewhere it is downloaded
    $("#image-share").hidden = !navigator.canShare?.({ files: [imageFile] });
    $("#image-dialog").showModal();
  }

  async function shareImageFile() {
    try {
      await navigator.share({ files: [imageFile], text: `${t("shareText", { total: formatEur(totals().total) })} ${shareUrl()}` });
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("toastCopyFailed"));
    }
  }

  // ---------- Events ----------

  function bindEvents() {
    $("#lang").addEventListener("change", (e) => {
      state.lang = e.target.value;
      renderAll();
      update();
    });
    $("#year").addEventListener("change", (e) => {
      state.year = Number(e.target.value);
      update();
    });
    $("#funds").addEventListener("change", (e) => {
      state.includeFunds = e.target.checked;
      update();
    });
    $("#clear").addEventListener("click", () => {
      if (!state.selected.size) return;
      state.selected.clear();
      state.answered.clear();
      update();
      toast(t("toastCleared"));
    });

    let searchTimer;
    $("#search").addEventListener("input", (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = e.target.value;
        applySearch();
      }, 120);
    });

    // Auto-advance only follows a pointer choice; keyboard users move on with the Next button.
    let pointerChoice = false;
    document.addEventListener("pointerdown", (e) => (pointerChoice = !!e.target.closest(".option")));

    document.addEventListener("change", (e) => {
      const input = e.target;
      if (input.matches(".question input[type=radio]")) {
        const q = QS.find((x) => `q-${x.id}` === input.name);
        state.answered.add(q.id);
        setLevel(q, Number(input.value));
        update();
        if (state.easyView === "wizard" && pointerChoice) {
          const step = state.step;
          clearTimeout(advanceTimer);
          advanceTimer = setTimeout(() => state.step === step && goToStep(step + 1), AUTO_ADVANCE_MS);
        }
        pointerChoice = false;
      } else if (input.matches("[data-select]")) {
        if (input.checked) notifyRemoved(select(input.dataset.select));
        else select(input.dataset.select, 0);
        update();
      }
    });

    // Buttons declare what they do with a data attribute; the first match wins.
    const actions = {
      "data-mode": (el) => {
        state.mode = el.dataset.mode;
        update();
        if (!el.closest(".mode-switch")) window.scrollTo({ top: 0 });
      },
      "data-easy-view": (el) => {
        clearTimeout(advanceTimer);
        state.easyView = el.dataset.easyView;
        update();
      },
      "data-step-by": (el) => goToStep(state.step + Number(el.dataset.stepBy)),
      "data-go-to-step": (el) => {
        state.easyView = "wizard";
        goToStep(Number(el.dataset.goToStep));
      },
      "data-start-over": () => {
        state.selected.clear();
        state.answered.clear();
        state.easyView = "wizard";
        goToStep(0);
      },
      "data-share": () => share(),
      "data-share-image": () => openImageDialog(),
      "data-step": (el) => {
        const id = el.dataset.id;
        const count = Math.max(0, Math.min((state.selected.get(id) || 0) + Number(el.dataset.step), M[id].unit.max));
        notifyRemoved(select(id, count));
        update();
      },
      "data-package": (el) => {
        const group = DATA.categories.flatMap((c) => c.groups).find((g) => g.id === el.dataset.package);
        if (el.dataset.action === "remove") {
          group.measures.forEach((id) => state.selected.delete(id));
        } else {
          const toAdd = packageFor(group);
          toAdd.forEach((id) => state.selected.set(id, 1));
          const skipped = group.measures.filter((id) => !state.selected.has(id) && hasEstimate(M[id]) && savesMoney(M[id]));
          if (skipped.length) toast(t("toastPackage", { added: toAdd.length, skipped: skipped.length }));
        }
        update();
      },
      "data-remove": (el) => {
        state.selected.delete(el.dataset.remove);
        update();
      },
    };

    document.addEventListener("click", (e) => {
      const toggle = e.target.closest(".group-toggle");
      if (toggle) {
        const g = toggle.closest(".group");
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        if (expanded) state.expanded.add(g.dataset.group);
        else state.expanded.delete(g.dataset.group);
        setExpanded(g, expanded);
        return;
      }
      for (const [attr, run] of Object.entries(actions)) {
        const el = e.target.closest(`button[${attr}]`);
        if (el) return run(el);
      }
    });

    $("#image-close").addEventListener("click", () => $("#image-dialog").close());
    $("#image-share").addEventListener("click", shareImageFile);
    $("#image-dialog").addEventListener("click", (e) => e.target === e.currentTarget && e.currentTarget.close());

    // Details are filled in when opened
    document.addEventListener(
      "toggle",
      (e) => {
        const d = e.target;
        if (!d.open) return;
        if (d.matches("[data-details]")) $(".measure-details-body", d).innerHTML = renderMeasureDetails(M[d.dataset.details]);
        if (d.matches("[data-card-details]")) {
          $(".card-details-body", d).innerHTML = renderCardDetails(QS.find((q) => q.id === d.dataset.cardDetails));
        }
      },
      true
    );
  }

  // ---------- Start ----------

  load();
  loadSharedLink();
  $("#lang").innerHTML = CONFIG.languages.map((l) => `<option value="${l.code}" lang="${l.code}">${esc(l.name)}</option>`).join("");
  renderAll();
  bindEvents();
  update();
})();
