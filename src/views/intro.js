// Start page: what this is about, three key figures and a start button.

import { hasProgress, resetAnswers } from "../state.js";
import { M, QS } from "../model.js";
import { t, esc } from "../text.js";
import { $, showView } from "../ui.js";

const root = () => $("#intro");

export function render() {
  const fact = (value, label) => `<li><strong>${esc(value)}</strong><span>${esc(label)}</span></li>`;
  root().innerHTML = `
    <div class="intro-card">
      <p class="eyebrow">${esc(t("introEyebrow"))}</p>
      <h1>${esc(t("appName"))}</h1>
      <p class="intro-lead">${t("introLeadHtml")}</p>
      <ul class="facts">
        ${fact(t("introFactDeficitValue"), t("introFactDeficit"))}
        ${fact(t("introFactTargetValue"), t("introFactTarget"))}
        ${fact(String(QS.length), t("introFactQuestions"))}
      </ul>
      <p class="intro-question">${esc(t("introQuestion"))}</p>
      <div class="actions">
        <button type="button" class="btn big" data-intro="start"></button>
        <button type="button" class="btn secondary big" data-intro="restart">${esc(t("introRestart"))}</button>
      </div>
      <p><button type="button" class="link-button" data-intro="browse">${esc(t("introBrowse", { n: Object.keys(M).length }))} →</button></p>
    </div>`;
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
