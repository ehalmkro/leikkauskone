// Sticky meter: the running total, the bar and the next target.

import { CONFIG } from "../../content/config.js";
import { DATA } from "../../data/measures.js";
import { state, changed } from "../state.js";
import { flow, flowYear } from "../model.js";
import { t, loc, nameOf, formatAmount, esc } from "../text.js";
import { $, toast } from "../ui.js";

// The bar: coloured segments per category, the target band and reference markers.
// Also used on the start page, once per flow.
export function barMarkup(id = state.flow, total = 0, byCategory = {}) {
  const { meter, categories } = flow(id);
  const { scaleMax, target, markers } = meter;
  const format = (value) => formatAmount(value, id);
  const max = Math.max(scaleMax, total * 1.05);
  const pct = (value) => `${(value / max) * 100}%`;
  const segments = categories
    .map((c, i) =>
      byCategory[c.id] > 0
        ? `<div class="bar-segment" style="width:${pct(byCategory[c.id])};background:var(--series-${i + 1})" title="${esc(nameOf(c))}: ${format(byCategory[c.id])}"></div>`
        : ""
    )
    .join("");
  const targetReached = total >= target.from;
  const band = `
    <div class="target-band${targetReached ? " reached" : ""}" style="left:${pct(target.from)};width:${pct(target.to - target.from)}">
      <span>${targetReached ? "✓ " : ""}${esc(loc(target.label))}</span>
    </div>`;
  const marks = markers
    .map((m) => {
      const position = m.value / max;
      const classes = ["marker", total >= m.value && "reached", position > 0.85 && "at-end"].filter(Boolean).join(" ");
      return `<div class="${classes}" style="left:${pct(m.value)}"><span>${total >= m.value ? "✓ " : ""}${esc(loc(m.label))}</span></div>`;
    })
    .join("");
  return `
    <div class="bar" role="img" aria-label="${esc(t("barAria", { total: format(total), max: format(max) }))}">${segments}</div>
    <div class="bar-marks" aria-hidden="true">${band}${marks}</div>`;
}

export function render() {
  $("#year").innerHTML = DATA.years.map((y) => `<option value="${y}">${y}</option>`).join("");
}

export function update({ total, byCategory }) {
  $("#year").value = String(state.year);
  $("#funds").checked = state.includeFunds;
  $("#year-label").textContent = flowYear();
  $("#total").textContent = formatAmount(total);
  $("#bar-frame").innerHTML = barMarkup(state.flow, total, byCategory);

  const milestones = flow().milestones;
  $("#milestone-list").innerHTML = milestones
    .map((ms) => {
      const ok = total >= ms.value;
      return `<li class="${ok ? "reached" : ""}" title="${esc(loc(ms.description))}">
        <span class="icon" aria-hidden="true">${ok ? "✓" : ""}</span>
        <span>${esc(loc(ms.name))}: ${formatAmount(ms.value)}${ok ? ` – ${esc(t("reached"))}` : ""}</span></li>`;
    })
    .join("");

  const next = milestones.find((ms) => total < ms.value);
  const previous = milestones.filter((ms) => total >= ms.value).pop();
  let text;
  if (!next) text = t("allReachedHtml");
  else if (previous) text = t("reachedNextHtml", { reached: esc(loc(previous.name)), next: esc(loc(next.name)), missing: formatAmount(next.value - total) });
  else text = t("nextHtml", { next: esc(loc(next.name)), missing: formatAmount(next.value - total) });
  if (flow().year == null && state.year !== CONFIG.defaultYear) {
    text += ` <span class="year-note">${esc(t("yearNote", { year: CONFIG.defaultYear }))}</span>`;
  }
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
