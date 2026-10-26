// Application state, saving it in the browser, and share links.

import { DATA } from "../data/measures.js";
import { CONFIG } from "../content/config.js";
import { QUESTIONS } from "../content/questions.js";

const M = DATA.measures;
const STORAGE_KEY = "leikkauskone:v1";

// Question steps are 0 … n - 1; step n is the result page.
export const RESULT_STEP = QUESTIONS.questions.length;

export const state = {
  lang: browserLanguage(),
  view: "intro", // "intro" | "questions" | "measures"
  layout: "single", // questions one at a time ("single") or all at once ("all")
  step: 0,
  answered: new Set(), // questions answered one at a time, so that "No change" shows as chosen only once picked
  year: CONFIG.defaultYear,
  includeFunds: false,
  selected: new Map(), // measure id -> count (1, or the number of steps for adjustable tax measures)
  expanded: new Set(), // open groups in the measures view
  query: "",
};

// Views register here; changed() re-syncs them and saves the state.
const listeners = [];
export const onChange = (fn) => listeners.push(fn);
export function changed() {
  listeners.forEach((fn) => fn());
  save();
}

export const hasProgress = () => state.selected.size > 0 || state.answered.size > 0;

export function resetAnswers() {
  state.selected.clear();
  state.answered.clear();
  state.step = 0;
}

function browserLanguage() {
  const codes = CONFIG.languages.map((l) => l.code);
  const preferred = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
  return preferred.find((l) => codes.includes(l)) || codes[0];
}

const maxCount = (id) => M[id].unit?.max || 1;

// ---------- localStorage ----------

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lang: state.lang,
        view: state.view,
        layout: state.layout,
        step: state.step,
        answered: [...state.answered],
        year: state.year,
        includeFunds: state.includeFunds,
        selected: [...state.selected],
      })
    );
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); the page still works.
  }
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
  if (["intro", "questions", "measures"].includes(saved.view)) state.view = saved.view;
  if (saved.layout === "all") state.layout = "all";
  if (Number.isInteger(saved.step)) state.step = Math.max(0, Math.min(saved.step, RESULT_STEP));
  if (DATA.years.includes(saved.year)) state.year = saved.year;
  state.includeFunds = saved.includeFunds === true;
  (saved.answered || []).forEach((id) => state.answered.add(id));
  (saved.selected || []).forEach(([id, count]) => M[id] && state.selected.set(id, Math.min(count, maxCount(id))));
}

// ---------- Share links ----------
// The selection is packed into a fixed-size code: one bit per measure (three bits for adjustable ones),
// measures in id order, six bits per URL-safe character – about 85 characters whatever is selected.
// The code is tied to the data: if measures are added or removed, older links decode differently.

const LINK_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const LINK_ORDER = Object.keys(M).sort();
const bitsFor = (id) => (M[id].unit ? 3 : 1);

function encodeSelection() {
  const bits = [];
  for (const id of LINK_ORDER) {
    const count = state.selected.get(id) || 0;
    for (let b = bitsFor(id) - 1; b >= 0; b--) bits.push((count >> b) & 1);
  }
  let code = "";
  for (let i = 0; i < bits.length; i += 6) {
    code += LINK_CHARS[bits.slice(i, i + 6).reduce((v, bit, j) => v | (bit << (5 - j)), 0)];
  }
  return code.replace(/A+$/, ""); // trailing zeros are implied
}

function decodeSelection(code) {
  const bits = [...code].flatMap((ch) => {
    const v = Math.max(0, LINK_CHARS.indexOf(ch));
    return [5, 4, 3, 2, 1, 0].map((b) => (v >> b) & 1);
  });
  const selected = new Map();
  let pos = 0;
  for (const id of LINK_ORDER) {
    let count = 0;
    for (let b = 0; b < bitsFor(id); b++) count = (count << 1) | (bits[pos++] || 0);
    if (count) selected.set(id, Math.min(count, maxCount(id)));
  }
  return selected;
}

export const shareUrl = () => `${location.href.split("#")[0]}#s=${encodeSelection()}`;

// A shared link opens the sender's choices on the result page; the code is then removed from the address bar.
export function loadSharedLink() {
  const code = new URLSearchParams(location.hash.slice(1)).get("s");
  if (code == null) return;
  state.selected = decodeSelection(code);
  state.answered = new Set(QUESTIONS.questions.map((q) => q.id));
  state.view = "questions";
  state.layout = "single";
  state.step = RESULT_STEP;
  history.replaceState(null, "", location.pathname + location.search);
}
