// Measures view: all measures by category and group, with a summary sidebar.

import { CONFIG } from "../../content/config.js";
import { DATA } from "../../data/measures.js";
import { state, changed } from "../state.js";
import { M, YEARS, impact, hasEstimate, selectedImpact, savesMoney, selectedConflicts, select, packageFor, potential } from "../model.js";
import { t, loc, nameOf, formatEur, formatNumber, esc, truncate } from "../text.js";
import { $, $$, toast, notifyRemoved } from "../ui.js";

const root = () => $("#measures");
const swatch = (i) => `<span class="swatch" style="background:var(--series-${i + 1})"></span>`;

export function render() {
  const descriptions = CONFIG.categoryDescriptions || {};
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
function renderDetails(m) {
  const fmt = (x) => (x == null ? "–" : formatNumber(x, 1));
  const meur = state.lang === "fi" ? "milj. €" : "€m";
  const now = YEARS.indexOf(state.year);
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

export function update({ total, byCategory }) {
  const yearIndex = YEARS.indexOf(state.year);

  for (const li of $$(".measure", root())) {
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

    const a = impact(m, yearIndex);
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

  $$("details[open][data-details]", root()).forEach((d) => ($(".measure-details-body", d).innerHTML = renderDetails(M[d.dataset.details])));
  updateSummary(total, byCategory);
  applySearch();
}

function updateSummary(total, byCategory) {
  const n = state.selected.size;
  $("#selection-count").textContent = n ? t("selectionCount", { n, total: formatEur(total), year: state.year }) : t("nothingSelectedMeasures");
  $("#breakdown tbody").innerHTML = DATA.categories
    .map((c, i) => (byCategory[c.id] ? `<tr><td>${swatch(i)}${esc(nameOf(c))}</td><td>${formatEur(byCategory[c.id])}</td></tr>` : ""))
    .join("");
  const chosen = [...state.selected.keys()].sort((a, b) => selectedImpact(b) - selectedImpact(a));
  $("#selected-list").innerHTML = chosen
    .map((id) => {
      const m = M[id];
      const name = truncate(nameOf(m), 90) + (m.unit ? ` (+${state.selected.get(id)} × ${m.unit.step})` : "");
      return `<li><span class="name">${esc(name)}</span><span class="amount">${formatEur(selectedImpact(id))}</span>
        <button type="button" data-remove="${id}" aria-label="${esc(t("removeNamed", { name: nameOf(m) }))}">×</button></li>`;
    })
    .join("");
  $("#selected-title").hidden = !n;
  $("#summary-actions").hidden = !n;
}

function setExpanded(groupEl, expanded) {
  $(".group-toggle", groupEl).setAttribute("aria-expanded", String(expanded));
  $(".measure-list", groupEl).hidden = !expanded;
}

function applySearch() {
  const query = state.query.trim().toLowerCase();
  let matches = 0;
  for (const cat of $$(".category", root())) {
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

export function bind() {
  const el = root();

  let searchTimer;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value;
      applySearch();
    }, 120);
  });

  el.addEventListener("change", (e) => {
    const id = e.target.dataset.select;
    if (!id) return;
    if (e.target.checked) notifyRemoved(select(id));
    else select(id, 0);
    changed();
  });

  el.addEventListener("click", (e) => {
    const toggle = e.target.closest(".group-toggle");
    if (toggle) {
      const g = toggle.closest(".group");
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      if (expanded) state.expanded.add(g.dataset.group);
      else state.expanded.delete(g.dataset.group);
      setExpanded(g, expanded);
      return;
    }

    const button = e.target.closest("button");
    if (!button) return;
    if (button.dataset.step) {
      const id = button.dataset.id;
      const count = Math.max(0, Math.min((state.selected.get(id) || 0) + Number(button.dataset.step), M[id].unit.max));
      notifyRemoved(select(id, count));
      changed();
    } else if (button.dataset.package) {
      const group = DATA.categories.flatMap((c) => c.groups).find((g) => g.id === button.dataset.package);
      if (button.dataset.action === "remove") {
        group.measures.forEach((id) => state.selected.delete(id));
      } else {
        const toAdd = packageFor(group);
        toAdd.forEach((id) => state.selected.set(id, 1));
        const skipped = group.measures.filter((id) => !state.selected.has(id) && hasEstimate(M[id]) && savesMoney(M[id]));
        if (skipped.length) toast(t("toastPackage", { added: toAdd.length, skipped: skipped.length }));
      }
      changed();
    } else if (button.dataset.remove) {
      state.selected.delete(button.dataset.remove);
      changed();
    }
  });

  // Details are filled in when opened
  el.addEventListener(
    "toggle",
    (e) => {
      const d = e.target;
      if (d.open && d.matches("[data-details]")) $(".measure-details-body", d).innerHTML = renderDetails(M[d.dataset.details]);
    },
    true
  );
}
