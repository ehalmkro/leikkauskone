// Sticky meter: the running total, the bar with milestones and the next target.

import { CONFIG } from "../../content/config.js";
import { DATA } from "../../data/measures.js";
import { state, changed } from "../state.js";
import { t, loc, nameOf, formatEur, esc } from "../text.js";
import { $, toast } from "../ui.js";

export function render() {
  $("#year").innerHTML = DATA.years.map((y) => `<option value="${y}">${y}</option>`).join("");
}

export function update({ total, byCategory }) {
  $("#year").value = String(state.year);
  $("#funds").checked = state.includeFunds;
  $("#year-label").textContent = state.year;
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

  // Tick labels alternate between two rows so that neighbours don't overlap
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

export function bind() {
  $("#year").addEventListener("change", (e) => {
    state.year = Number(e.target.value);
    changed();
  });
  $("#funds").addEventListener("change", (e) => {
    state.includeFunds = e.target.checked;
    changed();
  });
  $("#clear").addEventListener("click", () => {
    if (!state.selected.size) return;
    state.selected.clear();
    state.answered.clear();
    changed();
    toast(t("toastCleared"));
  });
}
