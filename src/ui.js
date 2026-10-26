// Small DOM helpers shared by the views.

import { M } from "./model.js";
import { state, changed } from "./state.js";
import { t, nameOf, truncate } from "./text.js";

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function showView(view) {
  state.view = view;
  changed();
  window.scrollTo({ top: 0 });
  $("#main").focus({ preventScroll: true });
}

let toastTimer;
export function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 5000);
}

// Tells the visitor which conflicting choices were dropped.
export function notifyRemoved(ids) {
  if (!ids.length) return;
  toast(t("toastRemoved", { names: ids.map((id) => `”${truncate(nameOf(M[id]), 70)}”`).join(", ") }));
}
