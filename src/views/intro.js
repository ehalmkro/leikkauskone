// Start page: what this is about, the empty meter the visitor is about to fill, and a start button.

import { hasProgress, resetAnswers } from "../state.js";
import { M, QS } from "../model.js";
import { t, esc } from "../text.js";
import { $, showView } from "../ui.js";
import { barMarkup } from "./meter.js";

const root = () => $("#intro");

export function render() {
  root().innerHTML = `
    <p class="eyebrow">${esc(t("introEyebrow"))}</p>
    <h1>${esc(t("appName"))}</h1>
    <p class="intro-lead">${t("introLeadHtml")}</p>
    <div class="bar-frame intro-bar">${barMarkup()}</div>
    <h2 class="intro-question">${esc(t("introQuestion"))}</h2>
    <p class="intro-meta">${esc(t("introMeta", { n: QS.length }))}</p>
    <div class="actions">
      <button type="button" class="btn big" data-intro="start"></button>
      <button type="button" class="btn secondary big" data-intro="restart">${esc(t("introRestart"))}</button>
    </div>
    <p class="intro-browse"><button type="button" class="link-button" data-intro="browse">${esc(t("introBrowse", { n: Object.keys(M).length }))} →</button></p>`;
}

export function update() {
  const resume = hasProgress();
  $('[data-intro="start"]', root()).textContent = resume ? t("introContinue") : t("introStart");
  $('[data-intro="restart"]', root()).hidden = !resume;
}

export function bind() {
  root().addEventListener("click", (e) => {
    const action = e.target.closest("[data-intro]")?.dataset.intro;
    if (action === "restart") resetAnswers();
    if (action === "start" || action === "restart") showView("questions");
    if (action === "browse") showView("measures");
  });
}
