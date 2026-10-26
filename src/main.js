// Leikkauskone – entry point.
//
// The visitor's choices live in one place, `state.selected` (measure id -> count). Every view is derived from
// it: after a change, changed() (state.js) calls update() below, which re-syncs all views and saves the state.

import { CONFIG } from "../content/config.js";
import { DATA } from "../data/measures.js";
import { state, onChange, load } from "./state.js";
import { totals } from "./model.js";
import { t, loc, esc } from "./text.js";
import { $, $$, showView } from "./ui.js";
import * as intro from "./views/intro.js";
import * as meter from "./views/meter.js";
import * as questions from "./views/questions.js";
import * as measures from "./views/measures.js";
import * as share from "./views/share.js";

const views = [intro, meter, questions, measures];

// Static texts and everything that depends on the language
function render() {
  document.documentElement.lang = state.lang;
  document.title = t("pageTitle");
  $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  $$("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $("#lang").value = state.lang;
  $("#sources").innerHTML = CONFIG.sources
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(loc(s.name))}</a></li>`)
    .join("");
  $("#source-note").textContent =
    t("sourceNote", { source: DATA.source.name, date: DATA.source.date }) +
    (DATA.source.taxes ? t("sourceNoteTaxes") : ".") +
    t("sourceNoteInterpretation");
  views.forEach((v) => v.render());
}

function update() {
  document.body.dataset.view = state.view;
  $$("[data-view-section]").forEach((el) => (el.hidden = el.dataset.viewSection !== state.view));
  $$(".tabs [data-view-link]").forEach((el) => {
    if (el.dataset.viewLink === state.view) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  const sums = totals();
  views.forEach((v) => v.update(sums));
}

function bind() {
  $("#lang").addEventListener("change", (e) => {
    state.lang = e.target.value;
    render();
    update();
  });
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-view-link]");
    if (link) showView(link.dataset.viewLink);
  });
  views.forEach((v) => v.bind());
  share.bind();
}

load();
$("#lang").innerHTML = CONFIG.languages.map((l) => `<option value="${l.code}" lang="${l.code}">${esc(l.name)}</option>`).join("");
render();
bind();
onChange(update);
update();
document.documentElement.classList.remove("loading");
