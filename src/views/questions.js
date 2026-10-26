// Questions view: 17 questions shown one at a time (default) or all at once, and a result page.
// Both layouts use the same markup; CSS and update() decide what is visible.

import { CONFIG } from "../../content/config.js";
import { QUESTIONS } from "../../content/questions.js";
import { state, changed, RESULT_STEP, resetAnswers } from "../state.js";
import { M, QS, impact, selectedImpact, levelTotal, currentLevel, setLevel } from "../model.js";
import { t, loc, nameOf, formatEur, esc } from "../text.js";
import { $, $$, notifyRemoved, showView, prefersReducedMotion } from "../ui.js";

const AUTO_ADVANCE_MS = 600;
const root = () => $("#questions");

const levelName = (q, n) => (n === 0 ? t("noChange") : loc(q.levels[n - 1].name) || t(n === 1 ? "levelLow" : "levelHigh"));

export function render() {
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
      <p class="notice-text" data-edited hidden>${esc(t("editedInMeasures"))}</p>
      <div class="options">${[0, ...q.levels.map((_, i) => i + 1)].map((n) => option(q, n)).join("")}</div>
      <p class="chosen-description" data-chosen-description></p>
      <details class="card-details" data-card-details="${q.id}">
        <summary>${esc(t("cardDetails"))}</summary>
        <div class="card-details-body"></div>
      </details>
    </fieldset>`;

  root().innerHTML = `
    <h1 class="visually-hidden">${esc(t("navQuestions"))}</h1>
    <div class="questions-toolbar">
      <p class="progress-text" data-progress-text></p>
      <button type="button" class="link-button" data-toggle-layout></button>
    </div>
    <div class="progress" data-single-only aria-hidden="true"><div data-progress-bar></div></div>

    ${QUESTIONS.sections
      .map(
        (s) => `
      <section class="question-section">
        <h2>${esc(loc(s.title))}</h2>
        ${QS.filter((q) => q.section === s.id).map(question).join("")}
      </section>`
      )
      .join("")}

    <nav class="step-nav" data-single-only aria-label="${esc(t("stepNavLabel"))}">
      <button type="button" class="btn secondary big" data-step-by="-1">${esc(t("previous"))}</button>
      <button type="button" class="btn big" data-step-by="1"></button>
    </nav>

    <section class="result" id="result">
      <h2 tabindex="-1">${esc(t("resultTitle"))}</h2>
      <p class="result-text" data-result-text></p>
      <div class="actions">
        <button type="button" class="btn" data-share-image>${esc(t("shareImage"))}</button>
      </div>
      <h3 class="answers-title">${esc(t("yourAnswers"))}</h3>
      <p class="muted answers-hint">${esc(t("answersHint"))}</p>
      <ol class="answers" data-answers></ol>
      <div class="actions">
        <button type="button" class="btn secondary" data-start-over>${esc(t("startOver"))}</button>
        <button type="button" class="btn secondary" data-show-measures>${esc(t("toMeasures", { n: Object.keys(M).length }))}</button>
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

export function update({ spending, taxes, total }) {
  const el = root();
  const single = state.layout === "single";
  const onResult = single && state.step === RESULT_STEP;
  el.dataset.layout = state.layout;

  // Visibility
  $$("[data-single-only]", el).forEach((x) => (x.hidden = !single || onResult));
  $$(".question", el).forEach((x, i) => (x.hidden = single && i !== state.step));
  $$(".question-section", el).forEach((x) => (x.hidden = !$$(".question", x).some((q) => !q.hidden)));
  $("#result").hidden = single && !onResult;
  $("[data-toggle-layout]", el).textContent = single ? t("showAll") : t("showOneByOne");

  const progress = $("[data-progress-text]", el);
  progress.hidden = !single || onResult;
  if (single && !onResult) {
    const q = QS[state.step];
    const section = QUESTIONS.sections.find((s) => s.id === q.section);
    progress.textContent = `${t("questionOf", { n: state.step + 1, total: RESULT_STEP })} · ${loc(section.title)}`;
    $("[data-progress-bar]", el).style.width = `${(state.step / RESULT_STEP) * 100}%`;
    $('[data-step-by="-1"]', el).disabled = state.step === 0;
    $('[data-step-by="1"]', el).textContent = state.step === RESULT_STEP - 1 ? t("toResult") : t("next");
  }

  // Answers
  for (const q of QS) {
    const qEl = $(`.question[data-question="${q.id}"]`, el);
    const current = currentLevel(q);
    // One at a time, "No change" is marked only once the visitor has actually picked it
    const showNoChange = !single || state.answered.has(q.id);
    $$("input", qEl).forEach((input) => {
      const n = Number(input.value);
      input.checked = n === current && (n > 0 || showNoChange);
      $("[data-level-amount]", input.closest(".option")).textContent = n === 0 ? "" : formatEur(levelTotal(q.levels[n - 1]));
    });
    qEl.classList.toggle("answered", current !== 0);
    $("[data-edited]", qEl).hidden = current !== -1;
    $("[data-chosen-description]", qEl).textContent = current > 0 ? loc(q.levels[current - 1].description) : "";
  }
  $$("details[open][data-card-details]", el).forEach(
    (d) => ($(".card-details-body", d).innerHTML = renderCardDetails(QS.find((q) => q.id === d.dataset.cardDetails)))
  );

  // Result page
  const milestones = CONFIG.milestones;
  const reached = milestones.filter((ms) => total >= ms.value);
  let text = t("resultNothing");
  if (state.selected.size) {
    text = t("resultSplit", { spending: formatEur(spending), taxes: formatEur(taxes), total: formatEur(total) });
    if (!reached.length) text += t("resultNone", { first: formatEur(milestones[0].value) });
    else if (reached.length === milestones.length) text += t("resultAll");
    else text += t("resultSome", { name: loc(reached[reached.length - 1].name) });
    text += t("resultQuestion");
  }
  $("[data-result-text]", el).textContent = text;

  $("[data-answers]", el).innerHTML = QS.map((q, i) => {
    const n = currentLevel(q);
    const answer = n === -1 ? t("modified") : levelName(q, n);
    const amount = n === 0 ? "" : formatEur(q.ids.reduce((sum, id) => sum + selectedImpact(id), 0));
    return `<li><button type="button" class="answer" data-go-to-step="${i}">
        <span class="answer-question">${esc(loc(q.title))}</span>
        <span class="answer-choice${n === 0 ? " muted" : ""}">${esc(answer)}${amount ? ` · ${amount}` : ""}</span>
      </button></li>`;
  }).join("");
}

// ---------- Moving between questions ----------

let advanceTimer;

function goToStep(step) {
  clearTimeout(advanceTimer);
  state.layout = "single";
  state.step = Math.max(0, Math.min(step, RESULT_STEP));
  changed();
  // Bring the new question below the sticky meter and move focus to its heading
  const heading = state.step === RESULT_STEP ? $("#result h2") : $$(".question h3", root())[state.step];
  const meterHeight = $(".meter").getBoundingClientRect().height;
  const top = heading.getBoundingClientRect().top;
  if (top < meterHeight || top > window.innerHeight * 0.5) {
    window.scrollTo({ top: top + window.scrollY - meterHeight - 70, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
  heading.focus({ preventScroll: true });
}

export function bind() {
  const el = root();

  // Choosing with a mouse or finger moves on automatically; keyboard users use the Next button.
  let pointerChoice = false;
  el.addEventListener("pointerdown", (e) => (pointerChoice = !!e.target.closest(".option")));

  el.addEventListener("change", (e) => {
    const input = e.target.closest(".question input");
    if (!input) return;
    const q = QS.find((x) => `q-${x.id}` === input.name);
    state.answered.add(q.id);
    notifyRemoved(setLevel(q, Number(input.value)));
    changed();
    if (state.layout === "single" && pointerChoice) {
      const step = state.step;
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => state.step === step && state.view === "questions" && goToStep(step + 1), AUTO_ADVANCE_MS);
    }
    pointerChoice = false;
  });

  el.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    if (button.dataset.stepBy) goToStep(state.step + Number(button.dataset.stepBy));
    else if (button.dataset.goToStep) goToStep(Number(button.dataset.goToStep));
    else if ("toggleLayout" in button.dataset) {
      clearTimeout(advanceTimer);
      state.layout = state.layout === "single" ? "all" : "single";
      changed();
    } else if ("startOver" in button.dataset) {
      resetAnswers();
      goToStep(0);
    } else if ("showMeasures" in button.dataset) showView("measures");
  });

  // Details are filled in when opened
  el.addEventListener(
    "toggle",
    (e) => {
      const d = e.target;
      if (d.open && d.matches("[data-card-details]")) {
        $(".card-details-body", d).innerHTML = renderCardDetails(QS.find((q) => q.id === d.dataset.cardDetails));
      }
    },
    true
  );
}
