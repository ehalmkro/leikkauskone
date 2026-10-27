// Start page: what this is about and a choice between the two flows, each with its meter.

import { DATA } from "../../data/measures.js";
import { FLOW_IDS } from "../flows.js";
import { hasProgress } from "../state.js";
import { flow, totals } from "../model.js";
import { t, esc } from "../text.js";
import { $, $$ } from "../ui.js";
import { barMarkup } from "./meter.js";

const root = () => $("#intro");

export function render() {
  const choice = (id) => `
    <article class="flow-choice" data-flow-card="${id}">
      <h3>${esc(t(`${id}Title`))}</h3>
      <p class="flow-lead">${t(`${id}LeadHtml`)}</p>
      <div class="bar-frame intro-bar" data-flow-bar></div>
      <p class="intro-meta">${esc(t("introMeta", { n: flow(id).questions.length }))}</p>
      <button type="button" class="btn big" data-flow="${id}"></button>
    </article>`;

  root().innerHTML = `
    <p class="eyebrow">${esc(t("introEyebrow"))}</p>
    <h1>${esc(t("appName"))}</h1>
    <p class="intro-lead">${t("introLeadHtml")}</p>
    <h2 class="intro-question">${esc(t("introQuestion"))}</h2>
    <p class="intro-hint">${esc(t("introHint"))}</p>
    <div class="flow-choices">${FLOW_IDS.map(choice).join("")}</div>
    <p class="intro-browse"><button type="button" class="link-button" data-view-link="measures">${esc(t("introBrowse", { n: Object.keys(DATA.measures).length }))} →</button></p>`;
}

export function update() {
  $$("[data-flow-card]", root()).forEach((card) => {
    const id = card.dataset.flowCard;
    const { total, byCategory } = totals(id);
    $("[data-flow-bar]", card).innerHTML = barMarkup(id, total, byCategory);
    $("[data-flow]", card).textContent = hasProgress(id) ? t("introContinue") : t("introStart");
  });
}

export function bind() {}
