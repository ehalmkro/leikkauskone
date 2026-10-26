// Leikkauskone – application logic.
// Data comes from data.js (window.CUTS_DATA), settings from config.js (window.CONFIG),
// UI strings from i18n.js (window.STRINGS) and easy-mode questions from questions.js (window.QUESTIONS).
// All amounts are million euros per year.

(function () {
  "use strict";

  const DATA = window.CUTS_DATA;
  const CONFIG = window.CONFIG;
  const STRINGS = window.STRINGS;
  const Q = window.QUESTIONS;
  const M = DATA.measures;
  const YEARS = DATA.years;

  // Easy-mode levels: "VER-74*3" -> { id: "VER-74", count: 3 }
  for (const q of Q.questions) {
    for (const level of q.levels) {
      level.items = level.measures.map((s) => {
        const [id, count] = s.split("*");
        if (!M[id]) console.warn(`questions.js: unknown measure ${id} (${q.id})`);
        return { id, count: Number(count) || 1 };
      });
    }
    q.allIds = [...new Set(q.levels.flatMap((l) => l.items.map((x) => x.id)))].filter((id) => M[id]);
  }

  // Browser language decides the default: Finnish browsers get Finnish, everyone else English.
  const detectedLang = (navigator.languages || [navigator.language || ""]).some((l) => /^fi\b/i.test(l))
    ? "fi"
    : CONFIG.languages.find((l) => l !== "fi") || "fi";

  // selected = Map(id -> count). A regular measure has count 1, unit-yield measures the number of steps.
  const state = {
    lang: detectedLang,
    mode: "easy", // "easy" or "advanced"
    year: CONFIG.defaultYear,
    includeFunds: false,
    selected: new Map(),
    expanded: new Set(), // expanded groups
    query: "",
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- Translations ----------

  // UI string with {placeholders}; falls back to Finnish if a key is missing.
  function t(key, vars = {}) {
    const s = STRINGS[state.lang]?.[key] ?? STRINGS.fi[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  }

  // A text from config.js / questions.js: either a plain string or { fi, en }.
  const loc = (v) => (v == null || typeof v === "string" ? v ?? "" : v[state.lang] ?? v.fi ?? "");

  const nameOf = (x) => (state.lang !== "fi" && x.nameEn ? x.nameEn : x.name);

  function applyStaticTexts() {
    document.documentElement.lang = state.lang;
    document.title = t("pageTitle");
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    $$("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $$(".lang-switch [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  }

  // ---------- Numbers and formatting ----------

  const LOCALES = { fi: "fi-FI", en: "en-GB" };
  const formatters = {};
  function nf(kind) {
    const key = `${state.lang}:${kind}`;
    if (!formatters[key]) {
      const opts = {
        billions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
        millions: { maximumFractionDigits: 0 },
        small: { maximumFractionDigits: 1 },
      }[kind];
      formatters[key] = new Intl.NumberFormat(LOCALES[state.lang] || "fi-FI", opts);
    }
    return formatters[key];
  }

  function formatEur(millions) {
    const a = Math.abs(millions);
    const sign = millions < 0 ? "−" : "";
    if (a === 0) return state.lang === "fi" ? "0 €" : "€0";
    const [num, unit] =
      a >= 1000 ? [nf("billions").format(a / 1000), t("billions")] : [nf(a < 10 ? "small" : "millions").format(a), t("millions")];
    // Finnish: "1,2 mrd €", English: "€1.2bn"
    return state.lang === "fi" ? `${sign}${num} ${unit}` : `${sign}€${num}${unit}`;
  }

  const yearIndex = () => YEARS.indexOf(state.year);

  // Impact of one measure (or one unit step) in the given year; null = no euro estimate.
  function impact(m, i = yearIndex(), includeFunds = state.includeFunds) {
    const gov = m.government[i];
    const funds = includeFunds ? m.funds[i] : null;
    if (gov == null && funds == null) return null;
    return (gov || 0) + (funds || 0);
  }

  const hasEstimate = (m) => m.government.some((x) => x != null) || m.funds.some((x) => x != null);

  function selectedImpact(id) {
    const a = impact(M[id]);
    return a == null ? 0 : a * (state.selected.get(id) || 0);
  }

  function totalImpact() {
    let sum = 0;
    for (const id of state.selected.keys()) sum += selectedImpact(id);
    return sum;
  }

  // Does the measure save anything over the years with the current settings (used by group selection).
  function savesMoney(m) {
    return YEARS.reduce((sum, _, i) => sum + (impact(m, i) || 0), 0) > 0;
  }

  // ---------- Selection ----------

  function selectedConflicts(id) {
    return M[id].conflicts.filter((c) => state.selected.has(c));
  }

  // Selects a measure and removes conflicting selections. Returns the removed ids.
  function select(id, count = 1) {
    const removed = selectedConflicts(id);
    removed.forEach((c) => state.selected.delete(c));
    if (count > 0) state.selected.set(id, count);
    else state.selected.delete(id);
    return removed;
  }

  // Group "package": saving measures from largest to smallest, skipping conflicting ones.
  // Among alternatives, the one that saves the most gets picked.
  function packageFor(group, selected = state.selected) {
    const toAdd = [];
    const taken = new Set(selected.keys());
    const order = [...group.measures].sort((a, b) => (impact(M[b]) || 0) - (impact(M[a]) || 0));
    for (const id of order) {
      const m = M[id];
      if (taken.has(id) || !savesMoney(m)) continue;
      if (m.conflicts.some((c) => taken.has(c))) continue;
      toAdd.push(id);
      taken.add(id);
    }
    return toAdd;
  }

  // Largest possible saving of a group starting from an empty selection (sum of its package).
  function potential(group) {
    return packageFor(group, new Map()).reduce((sum, id) => sum + (impact(M[id]) || 0), 0);
  }

  // ---------- Easy-mode levels ----------

  const levelTotal = (level) => level.items.reduce((sum, x) => sum + (M[x.id] ? (impact(M[x.id]) || 0) * x.count : 0), 0);
  const levelName = (q, n) => (n === 0 ? t("noChange") : loc(q.levels[n - 1].name) || t(n === 1 ? "levelLow" : "levelHigh"));

  // 0 = no change, 1.. = level, -1 = selection was modified in the detailed view
  function currentLevel(q) {
    const chosen = q.allIds.filter((id) => state.selected.has(id));
    if (!chosen.length) return 0;
    const n = q.levels.findIndex(
      (l) => l.items.length === chosen.length && l.items.every((x) => state.selected.get(x.id) === x.count)
    );
    return n + 1 || -1;
  }

  function setLevel(q, n) {
    q.allIds.forEach((id) => state.selected.delete(id));
    if (n === 0) return;
    const removed = q.levels[n - 1].items.filter((x) => M[x.id]).flatMap((x) => select(x.id, x.count));
    notifyRemoved(removed);
  }

  // ---------- URL (selections in a shareable link) ----------

  function saveToUrl() {
    const parts = [];
    if (state.lang !== detectedLang) parts.push(`lang=${state.lang}`);
    if (state.mode === "advanced") parts.push("view=advanced");
    if (state.year !== CONFIG.defaultYear) parts.push(`year=${state.year}`);
    if (state.includeFunds) parts.push("funds=1");
    if (state.selected.size) {
      const s = [...state.selected].map(([id, count]) => (count > 1 ? `${id}*${count}` : id)).join(",");
      parts.push(`s=${s}`);
    }
    history.replaceState(null, "", parts.length ? "#" + parts.join("&") : location.pathname + location.search);
  }

  function loadFromUrl() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (CONFIG.languages.includes(p.get("lang"))) state.lang = p.get("lang");
    if (p.get("view") === "advanced") state.mode = "advanced";
    const y = Number(p.get("year"));
    if (YEARS.includes(y)) state.year = y;
    state.includeFunds = p.get("funds") === "1";
    for (const part of (p.get("s") || "").split(",").filter(Boolean)) {
      const [id, count] = part.split("*");
      if (M[id]) state.selected.set(id, Math.max(1, Math.min(Number(count) || 1, M[id].unit?.max || 1)));
    }
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
    const names = removed.map((id) => `”${truncate(nameOf(M[id]), 70)}”`).join(", ");
    toast(t("toastRemoved", { names }));
  }

  const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

  // ---------- Rendering (on start and when the language changes) ----------

  function renderStructure() {
    // Year selector
    $("#year").innerHTML = YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");

    // Quick links to categories
    const jumpLinks = DATA.categories
      .map(
        (c, i) =>
          `<a href="#cat-${c.id}"><span class="swatch" style="background:var(--series-${i + 1})"></span>${esc(nameOf(c))}</a>`
      )
      .join("");

    const descriptions = CONFIG.categoryDescriptions || {};
    $("#categories").innerHTML =
      `<nav class="jump-nav" aria-label="${esc(t("categoriesNav"))}">${jumpLinks}</nav>` +
      DATA.categories
        .map(
          (c, i) => `
      <section class="category" id="cat-${c.id}" data-category="${c.id}">
        <div class="category-header">
          <h2><span class="swatch" style="background:var(--series-${i + 1})"></span>${esc(nameOf(c))}</h2>
          <span class="category-total" data-category-total></span>
        </div>
        ${descriptions[c.id] ? `<p class="category-description">${esc(loc(descriptions[c.id]))}</p>` : ""}
        ${c.groups.map(renderGroup).join("")}
      </section>`
        )
        .join("") +
      `<p class="no-results" id="no-results" hidden>${esc(t("noResults"))}</p>`;

    // Sources
    $("#sources").innerHTML = CONFIG.sources
      .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(loc(s.name))}</a></li>`)
      .join("");
    $("#source-note").textContent =
      t("sourceNote", { source: DATA.source.name, date: DATA.source.date }) +
      (DATA.source.taxes ? t("sourceNoteTaxes") : ".") +
      t("sourceNoteInterpretation");
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
          <div class="group-actions">
            <button type="button" class="btn small" data-package="${g.id}"></button>
          </div>
        </div>
        <ul class="measure-list" id="list-${g.id}" hidden>
          ${g.measures.map((id) => renderMeasure(M[id])).join("")}
        </ul>
      </div>`;
  }

  function renderMeasure(m) {
    const badges = [];
    if (m.alternative) badges.push(`<span class="badge">${esc(t("badgeAlternative"))}</span>`);
    if (!hasEstimate(m)) badges.push(`<span class="badge">${esc(t("badgeNoEstimate"))}</span>`);
    if (m.type === "tax" && m.fromYear > YEARS[0]) badges.push(`<span class="badge">${esc(t("badgeFrom", { year: m.fromYear }))}</span>`);
    if (m.funds.some((x) => x > 0)) {
      badges.push(`<span class="badge notice" data-funds-badge>${esc(t("badgeFunds"))}</span>`);
    }
    // The budget item ("kohde") is only meaningful in Finnish
    const target = state.lang === "fi" && m.target && m.type === "spending" ? `<span>${esc(m.target)}</span>` : "";

    const control = m.unit
      ? `<div class="measure-select">
           <span class="measure-name">${esc(nameOf(m))}</span>
         </div>
         <div class="stepper" role="group" aria-label="${esc(t("stepperLabel"))}">
           <button type="button" data-step="-1" data-id="${m.id}" aria-label="${esc(t("decrease"))}">−</button>
           <output data-count></output>
           <button type="button" data-step="1" data-id="${m.id}" aria-label="${esc(t("increase"))}">+</button>
         </div>`
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
        <div class="measure-meta">${target}${badges.join("")}</div>
        <p class="measure-conflict" data-conflict hidden></p>
        <details class="measure-details" data-details="${m.id}">
          <summary>${esc(t("details"))}</summary>
          <div class="measure-details-body"></div>
        </details>
      </li>`;
  }

  // ---------- Easy mode ----------

  function renderEasy() {
    const card = (q) => `
      <article class="card" data-question="${q.id}">
        <h3>${esc(loc(q.title))}</h3>
        <p class="card-description">${esc(loc(q.description))}</p>
        <div class="levels" role="radiogroup" aria-label="${esc(loc(q.title))}">
          ${[0, ...q.levels.map((_, i) => i + 1)]
            .map(
              (n) => `
            <button type="button" class="level" role="radio" aria-checked="false" data-question="${q.id}" data-level="${n}">
              <span class="level-name">${esc(levelName(q, n))}</span>
              <span class="level-amount" data-level-amount></span>
            </button>`
            )
            .join("")}
        </div>
        <p class="level-description" data-level-description></p>
        <details class="card-details" data-card-details="${q.id}">
          <summary>${esc(t("cardDetails"))}</summary>
          <div class="card-details-body"></div>
        </details>
      </article>`;

    $("#easy").innerHTML =
      Q.sections
        .map(
          (s) => `
        <section class="section">
          <h2>${esc(loc(s.title))}</h2>
          <div class="cards">${Q.questions.filter((q) => q.section === s.id).map(card).join("")}</div>
        </section>`
        )
        .join("") +
      `<section class="result">
        <h2>${esc(t("resultTitle"))}</h2>
        <p data-result-text></p>
        <div class="result-actions">
          <button type="button" class="btn" data-share>${esc(t("share"))}</button>
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
          .filter((x) => M[x.id])
          .map((x) => {
            const a = impact(M[x.id]);
            const steps = M[x.id].unit ? ` (+${x.count} × ${esc(M[x.id].unit.step)})` : "";
            return `<li><span>${esc(nameOf(M[x.id]))}${steps}</span><span class="num">${a == null ? "–" : formatEur(a * x.count)}</span></li>`;
          })
          .join("")}</ul>`
      )
      .join("");
  }

  function updateEasy() {
    for (const q of Q.questions) {
      const el = $(`.card[data-question="${q.id}"]`);
      const current = currentLevel(q);
      el.classList.toggle("selected", current !== 0);
      $$(".level", el).forEach((b) => {
        const n = Number(b.dataset.level);
        b.setAttribute("aria-checked", String(n === current));
        $("[data-level-amount]", b).textContent = n === 0 ? "" : formatEur(levelTotal(q.levels[n - 1]));
      });
      $("[data-level-description]", el).textContent =
        current > 0 ? loc(q.levels[current - 1].description) : current === -1 ? t("modifiedInAdvanced") : "";
      const details = $("details", el);
      if (details.open) $(".card-details-body", details).innerHTML = renderCardDetails(q);
    }

    // Result summary
    let spending = 0;
    let taxes = 0;
    for (const id of state.selected.keys()) {
      if (M[id].type === "tax") taxes += selectedImpact(id);
      else spending += selectedImpact(id);
    }
    const total = spending + taxes;
    const milestones = CONFIG.milestones;
    const reached = milestones.filter((ms) => total >= ms.value);
    let text;
    if (!state.selected.size) {
      text = t("resultNothing");
    } else {
      text = t("resultSplit", { spending: formatEur(spending), taxes: formatEur(taxes), total: formatEur(total) });
      if (!reached.length) text += t("resultNone", { first: formatEur(milestones[0].value) });
      else if (reached.length === milestones.length) text += t("resultAll");
      else text += t("resultSome", { name: loc(reached[reached.length - 1].name).toLowerCase() });
      text += t("resultQuestion");
    }
    $("[data-result-text]").textContent = text;
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.classList.toggle("mode-easy", mode === "easy");
    document.body.classList.toggle("mode-advanced", mode === "advanced");
    $$(".mode-switch [data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  }

  function setLang(lang) {
    state.lang = lang;
    applyStaticTexts();
    renderStructure();
    renderEasy();
    update();
  }

  async function share() {
    const text = t("shareText", { total: formatEur(totalImpact()) });
    try {
      if (navigator.share) {
        await navigator.share({ title: t("appName"), text, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${location.href}`);
      toast(t("toastCopied"));
    } catch (e) {
      if (e?.name !== "AbortError") toast(t("toastCopyFailed"));
    }
  }

  // Measure details are rendered only when opened.
  function renderMeasureDetails(m) {
    const fmt = (x) => (x == null ? "–" : nf("small").format(x));
    const now = yearIndex();
    let html = "";
    if (m.type === "tax") {
      const value = m.government.find((x) => x != null) != null ? Math.max(...m.government.map((x) => x || 0)) : null;
      const used = value == null ? t("noEstimate") : formatEur(value);
      const basis = state.lang !== "fi" && m.basisEn ? m.basisEn : m.basis;
      html += `<p><strong>${esc(t("taxEstimate"))}:</strong> ${esc(m.vmEstimate || "–")} ${esc(state.lang === "fi" ? "milj. €" : "€m")}<br>
               <strong>${esc(t("taxUsed"))}:</strong> ${used}${m.unit ? ` (${esc(t("perStep", { step: m.unit.step }))})` : ""} – ${esc(basis)}.<br>
               ${esc(t("taxConstant"))}${m.fromYear > YEARS[0] ? esc(t("taxFrom", { year: m.fromYear })) : ""}.</p>`;
    } else {
      html += `<div class="table-scroll"><table class="year-table">
        <thead><tr><th>${esc(state.lang === "fi" ? "milj. €" : "€m")}</th>${YEARS.map((y, i) => `<th class="${i === now ? "current" : ""}">${y}</th>`).join("")}</tr></thead>
        <tbody>
          <tr><td>${esc(t("governmentRow"))}</td>${m.government.map((x, i) => `<td class="${i === now ? "current" : ""}">${fmt(x)}</td>`).join("")}</tr>
          <tr><td>${esc(t("fundsRow"))}</td>${m.funds.map((x, i) => `<td class="${i === now ? "current" : ""}">${fmt(x)}</td>`).join("")}</tr>
        </tbody></table></div>`;
    }
    // VM's background texts are only available in Finnish
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

  // ---------- Update (on every state change) ----------

  function update() {
    const i = yearIndex();
    $("#year").value = String(state.year);
    $("#funds").checked = state.includeFunds;
    $("#year-label").textContent = state.year;

    // Measure rows
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
      if (a == null) amountEl.textContent = t("noEstimate");
      else if (m.unit) amountEl.textContent = count > 1 ? formatEur(a * count) : `${formatEur(a)} / ${m.unit.step}`;
      else amountEl.textContent = formatEur(a);
      amountEl.title = a != null && a < 0 ? t("negativeTitle") : "";

      const fundsBadge = $("[data-funds-badge]", li);
      if (fundsBadge) fundsBadge.hidden = state.includeFunds;

      const conflicts = count ? [] : selectedConflicts(id);
      li.classList.toggle("blocked", conflicts.length > 0);
      const conflictEl = $("[data-conflict]", li);
      conflictEl.hidden = !conflicts.length;
      if (conflicts.length) {
        conflictEl.textContent = t("conflictNote", { names: conflicts.map((c) => truncate(nameOf(M[c]), 60)).join("; ") });
      }

      const details = $("details[data-details]", li);
      if (details.open) $(".measure-details-body", details).innerHTML = renderMeasureDetails(m);
    }

    // Groups and categories
    const categoryTotals = {};
    DATA.categories.forEach((c) => {
      let categoryTotal = 0;
      let categoryPotential = 0;
      for (const g of c.groups) {
        const el = $(`[data-group="${g.id}"]`);
        const chosen = g.measures.filter((id) => state.selected.has(id));
        const total = chosen.reduce((sum, id) => sum + selectedImpact(id), 0);
        const pot = potential(g);
        categoryTotal += total;
        categoryPotential += pot;
        el.classList.toggle("has-selection", chosen.length > 0);
        $("[data-group-status]", el).textContent =
          t("measuresCount", { n: g.measures.length }) + (chosen.length ? ` · ${t("selectedCount", { n: chosen.length })}` : "");
        $("[data-group-figures]", el).innerHTML = chosen.length
          ? `<strong>${formatEur(total)}</strong>${esc(t("selectedFigure"))}`
          : `<strong>${formatEur(pot)}</strong>${esc(t("maxFigure"))}`;

        const btn = $("[data-package]", el);
        const toAdd = packageFor(g);
        btn.textContent = toAdd.length ? (chosen.length ? t("selectRest") : t("selectGroup")) : t("removeSelections");
        btn.classList.toggle("secondary", !toAdd.length);
        btn.disabled = !toAdd.length && !chosen.length;
        btn.dataset.action = toAdd.length ? "add" : "remove";
      }
      categoryTotals[c.id] = categoryTotal;
      $(`[data-category="${c.id}"] [data-category-total]`).innerHTML = categoryTotal
        ? t("categorySelected", { total: formatEur(categoryTotal), max: formatEur(categoryPotential) })
        : t("categoryMax", { max: formatEur(categoryPotential) });
    });

    updateMeter(categoryTotals);
    updateSummary(categoryTotals);
    updateEasy();
    applySearch();
    saveToUrl();
  }

  function updateMeter(categoryTotals) {
    const total = totalImpact();
    $("#total").textContent = formatEur(total);

    const max = Math.max(CONFIG.scaleMax, total * 1.05);
    const pct = (x) => `${Math.max(0, (x / max) * 100)}%`;

    // Bar: one segment per category, fixed colour order
    $("#bar").innerHTML = DATA.categories
      .map((c, i) =>
        categoryTotals[c.id] > 0
          ? `<div class="bar-segment" style="width:${pct(categoryTotals[c.id])};background:var(--series-${i + 1})" title="${esc(nameOf(c))}: ${formatEur(categoryTotals[c.id])}"></div>`
          : ""
      )
      .join("");
    $("#bar").setAttribute("aria-label", t("barAria", { total: formatEur(total), max: formatEur(max) }));

    const milestones = CONFIG.milestones;
    $("#milestones").innerHTML = milestones
      .map((ms, n) => {
        const left = (ms.value / max) * 100;
        const classes = ["milestone", total >= ms.value ? "reached" : "", left > 85 ? "align-right" : "", n % 2 ? "upper" : ""].join(" ");
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
    const previous = [...milestones].reverse().find((ms) => total >= ms.value);
    let text;
    if (!next) {
      text = t("allReachedHtml");
    } else if (previous) {
      text = t("reachedNextHtml", { reached: esc(loc(previous.name)), next: esc(loc(next.name)), missing: formatEur(next.value - total) });
    } else {
      text = t("nextHtml", { next: esc(loc(next.name)), missing: formatEur(next.value - total) });
    }
    if (state.year !== CONFIG.defaultYear) {
      text += ` <span class="year-note">${esc(t("yearNote", { year: CONFIG.defaultYear }))}</span>`;
    }
    $("#next-goal").innerHTML = text;
  }

  function updateSummary(categoryTotals) {
    const n = state.selected.size;
    $("#selection-count").textContent = n
      ? t("selectionCount", { n, total: formatEur(totalImpact()), year: state.year })
      : t("nothingSelectedAdvanced");

    $("#breakdown tbody").innerHTML = DATA.categories
      .map((c, i) =>
        categoryTotals[c.id]
          ? `<tr><td><span class="swatch" style="background:var(--series-${i + 1})"></span>${esc(nameOf(c))}</td><td>${formatEur(categoryTotals[c.id])}</td></tr>`
          : ""
      )
      .join("");

    const chosen = [...state.selected.keys()].sort((a, b) => selectedImpact(b) - selectedImpact(a));
    $("#selected-list").innerHTML = chosen.length
      ? `<li class="selected-list-title">${esc(t("largestFirst"))}</li>` +
        chosen
          .map((id) => {
            const m = M[id];
            const count = state.selected.get(id);
            const name = truncate(nameOf(m), 90) + (m.unit && count ? ` (+${count} × ${m.unit.step})` : "");
            return `<li><span class="name">${esc(name)}</span><span class="amount">${formatEur(selectedImpact(id))}</span>
              <button type="button" data-remove="${id}" aria-label="${esc(t("removeNamed", { name: nameOf(m) }))}" title="${esc(t("remove"))}">×</button></li>`;
          })
          .join("")
      : "";
    $("#copy-link").hidden = !n;
  }

  // ---------- Search and expanding groups ----------

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
        let groupMatches = 0;
        const groupName = $(".group-name", g).textContent;
        for (const li of $$(".measure", g)) {
          const m = M[li.dataset.id];
          // Search both languages so e.g. "Yle" or a Finnish term works in the English view too
          const haystack = [m.name, m.nameEn, m.target, groupName].join(" ").toLowerCase();
          const visible = !query || haystack.includes(query);
          li.hidden = !visible;
          if (visible) groupMatches++;
        }
        g.hidden = query && !groupMatches;
        setExpanded(g, query ? groupMatches > 0 : state.expanded.has(g.dataset.group));
        catMatches += groupMatches;
      }
      cat.hidden = query && !catMatches;
      matches += catMatches;
    }
    $("#no-results").hidden = !query || matches > 0;
    $(".jump-nav").hidden = !!query;
  }

  // ---------- Events ----------

  function bindEvents() {
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

    document.addEventListener("change", (e) => {
      const id = e.target.dataset?.select;
      if (!id) return;
      if (e.target.checked) notifyRemoved(select(id));
      else state.selected.delete(id);
      update();
    });

    document.addEventListener("click", (e) => {
      const langBtn = e.target.closest("[data-lang]");
      if (langBtn) {
        if (langBtn.dataset.lang !== state.lang) setLang(langBtn.dataset.lang);
        return;
      }

      const levelBtn = e.target.closest("[data-level]");
      if (levelBtn) {
        const q = Q.questions.find((x) => x.id === levelBtn.dataset.question);
        setLevel(q, Number(levelBtn.dataset.level));
        update();
        return;
      }

      const modeBtn = e.target.closest("[data-mode]");
      if (modeBtn) {
        const fromPageBody = !modeBtn.closest(".mode-switch");
        setMode(modeBtn.dataset.mode);
        update();
        if (fromPageBody) window.scrollTo({ top: 0 });
        return;
      }

      if (e.target.closest("[data-share]")) {
        share();
        return;
      }

      const stepBtn = e.target.closest("[data-step]");
      if (stepBtn) {
        const id = stepBtn.dataset.id;
        const count = Math.max(0, Math.min((state.selected.get(id) || 0) + Number(stepBtn.dataset.step), M[id].unit.max));
        notifyRemoved(select(id, count));
        update();
        return;
      }

      const toggle = e.target.closest(".group-toggle");
      if (toggle) {
        const g = toggle.closest(".group");
        const expanded = toggle.getAttribute("aria-expanded") !== "true";
        if (expanded) state.expanded.add(g.dataset.group);
        else state.expanded.delete(g.dataset.group);
        setExpanded(g, expanded);
        return;
      }

      const pkgBtn = e.target.closest("[data-package]");
      if (pkgBtn) {
        const group = DATA.categories.flatMap((c) => c.groups).find((g) => g.id === pkgBtn.dataset.package);
        if (pkgBtn.dataset.action === "remove") {
          group.measures.forEach((id) => state.selected.delete(id));
        } else {
          const toAdd = packageFor(group);
          toAdd.forEach((id) => state.selected.set(id, 1));
          const skipped = group.measures.filter((id) => !state.selected.has(id) && hasEstimate(M[id]) && savesMoney(M[id]));
          if (skipped.length) toast(t("toastPackage", { added: toAdd.length, skipped: skipped.length }));
        }
        update();
        return;
      }

      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        state.selected.delete(removeBtn.dataset.remove);
        update();
      }
    });

    // Details are filled in when opened
    document.addEventListener(
      "toggle",
      (e) => {
        const d = e.target;
        if (d.matches?.("details[data-details]") && d.open) {
          $(".measure-details-body", d).innerHTML = renderMeasureDetails(M[d.dataset.details]);
        }
        if (d.matches?.("details[data-card-details]") && d.open) {
          const q = Q.questions.find((x) => x.id === d.dataset.cardDetails);
          $(".card-details-body", d).innerHTML = renderCardDetails(q);
        }
      },
      true
    );
  }

  // ---------- Startup ----------

  loadFromUrl();
  applyStaticTexts();
  renderStructure();
  renderEasy();
  setMode(state.mode);
  bindEvents();
  update();
})();
