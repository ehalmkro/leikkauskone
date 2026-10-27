// Translations and number formatting.

import { CONFIG } from "../content/config.js";
import { STRINGS } from "../content/strings.js";
import { state } from "./state.js";

const FALLBACK = CONFIG.languages[0].code;

// UI string with {placeholders}. A flow can override strings (STRINGS.fi.climate); missing keys fall back to the first language.
export function t(key, vars = {}) {
  const lookup = (lang) => STRINGS[lang]?.[state.flow]?.[key] ?? STRINGS[lang]?.[key];
  const s = lookup(state.lang) ?? lookup(FALLBACK) ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

// A text from config.js or questions.js: either a plain string or { fi: …, en: … }.
export const loc = (v) => (v == null || typeof v === "string" ? v ?? "" : v[state.lang] ?? v[FALLBACK] ?? "");

// Measures, groups and categories have a Finnish `name` and an English `nameEn`.
export const nameOf = (x) => (state.lang !== "fi" && x.nameEn ? x.nameEn : x.name);

const numberFormats = {};
export function formatNumber(value, maxDecimals, minDecimals = 0) {
  const key = `${state.lang}:${maxDecimals}:${minDecimals}`;
  numberFormats[key] ??= new Intl.NumberFormat(state.lang === "fi" ? "fi-FI" : "en-GB", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
  return numberFormats[key].format(value);
}

// Finnish "1,2 mrd €" / "350 milj. €", English "€1.2bn" / "€350m"
export function formatEur(millions) {
  const a = Math.abs(millions);
  const sign = millions < 0 ? "−" : "";
  if (a === 0) return state.lang === "fi" ? "0 €" : "€0";
  const [num, unit] = a >= 1000 ? [formatNumber(a / 1000, 1, 1), t("billions")] : [formatNumber(a, a < 10 ? 1 : 0), t("millions")];
  return state.lang === "fi" ? `${sign}${num} ${unit}` : `${sign}€${num}${unit}`;
}

// "12,3 Mt" / "12.3 Mt" (million tonnes of CO₂ equivalent)
export function formatMt(value) {
  const a = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  return `${sign}${formatNumber(a, a < 1 ? 2 : 1)} Mt`;
}

// Amount in the current flow's unit
export const formatAmount = (value, flow = state.flow) => (flow === "climate" ? formatMt(value) : formatEur(value));

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
