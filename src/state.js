// Application state and saving it in the browser.

import { CONFIG } from "../content/config.js";
import { DATA } from "../data/measures.js";
import { FLOWS, FLOW_IDS } from "./flows.js";

const STORAGE_KEY = "leikkauskone:v1";

// Each flow keeps its own answers, so the visitor can do one, then the other, and come back.
const progress = () => ({
  step: 0,
  answered: new Set(), // questions answered one at a time, so that "No change" shows as chosen only once picked
  selected: new Map(), // measure id -> count (1, or the number of steps for adjustable measures)
});

export const state = {
  lang: browserLanguage(),
  flow: "budget", // "budget" | "climate"
  view: "intro", // "intro" | "questions" | "measures"
  layout: "single", // questions one at a time ("single") or all at once ("all")
  year: CONFIG.defaultYear,
  includeFunds: false,
  expanded: new Set(), // open groups in the measures view
  query: "",
  flows: Object.fromEntries(FLOW_IDS.map((id) => [id, progress()])),

  // The current flow's progress
  get selected() {
    return this.flows[this.flow].selected;
  },
  get answered() {
    return this.flows[this.flow].answered;
  },
  get step() {
    return this.flows[this.flow].step;
  },
  set step(value) {
    this.flows[this.flow].step = value;
  },
};

// Question steps are 0 … n - 1; step n is the result page.
export const resultStep = (flow = state.flow) => FLOWS[flow].questions.length;

// Views register here; changed() re-syncs them and saves the state.
const listeners = [];
export const onChange = (fn) => listeners.push(fn);
export function changed() {
  listeners.forEach((fn) => fn());
  save();
}

export function hasProgress(flow = state.flow) {
  const p = state.flows[flow];
  return p.selected.size > 0 || p.answered.size > 0;
}

export function resetAnswers() {
  state.flows[state.flow] = progress();
}

function browserLanguage() {
  const codes = CONFIG.languages.map((l) => l.code);
  const preferred = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
  return preferred.find((l) => codes.includes(l)) || codes[0];
}

// ---------- localStorage ----------

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lang: state.lang,
        flow: state.flow,
        view: state.view,
        layout: state.layout,
        year: state.year,
        includeFunds: state.includeFunds,
        flows: Object.fromEntries(
          FLOW_IDS.map((id) => {
            const p = state.flows[id];
            return [id, { step: p.step, answered: [...p.answered], selected: [...p.selected] }];
          })
        ),
      })
    );
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); the page still works.
  }
}

function loadProgress(flow, saved) {
  const p = state.flows[flow];
  const measures = FLOWS[flow].measures;
  if (Number.isInteger(saved.step)) p.step = Math.max(0, Math.min(saved.step, resultStep(flow)));
  (saved.answered || []).forEach((id) => p.answered.add(id));
  (saved.selected || []).forEach(([id, count]) => measures[id] && p.selected.set(id, Math.min(count, measures[id].unit?.max || 1)));
}

export function load() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return;
  }
  if (!saved) return;
  if (CONFIG.languages.some((l) => l.code === saved.lang)) state.lang = saved.lang;
  if (FLOW_IDS.includes(saved.flow)) state.flow = saved.flow;
  if (["intro", "questions", "measures"].includes(saved.view)) state.view = saved.view;
  if (state.view === "measures") state.flow = "budget"; // the measures view only exists for the budget
  if (saved.layout === "all") state.layout = "all";
  if (DATA.years.includes(saved.year)) state.year = saved.year;
  state.includeFunds = saved.includeFunds === true;
  // Older saves had only the budget flow
  const flows = saved.flows || { budget: saved };
  FLOW_IDS.forEach((id) => flows[id] && loadProgress(id, flows[id]));
}
