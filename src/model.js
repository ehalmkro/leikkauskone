// Calculations and selection rules. Budget amounts are million euros per year,
// climate amounts million tonnes of CO₂ equivalent per year.

import { DATA } from "../data/measures.js";
import { FLOWS } from "./flows.js";
import { state } from "./state.js";

// All measures of both flows by id (the ids do not overlap)
export const M = Object.assign({}, ...Object.values(FLOWS).map((f) => f.measures));
export const YEARS = DATA.years;

export const flow = (id = state.flow) => FLOWS[id];
export const flowYear = (id = state.flow) => FLOWS[id].year ?? state.year;

// Expand question levels: "VER-74*3" -> { id: "VER-74", count: 3 }
for (const q of Object.values(FLOWS).flatMap((f) => f.questions)) {
  for (const level of q.levels) {
    level.items = level.measures.map((s) => {
      const [id, count] = s.split("*");
      if (!M[id]) console.warn(`questions.js: unknown measure ${id} in ${q.id}`);
      return { id, count: Number(count) || 1 };
    });
    level.items = level.items.filter((x) => M[x.id]);
  }
  q.ids = [...new Set(q.levels.flatMap((l) => l.items.map((x) => x.id)))];
}

const yearIndex = () => YEARS.indexOf(state.year);

// Impact of one measure (or one step of an adjustable measure) in a year; null = no euro estimate.
// Climate measures have a single estimate for their target year.
export function impact(m, i = yearIndex()) {
  if (m.mt != null) return m.mt;
  const gov = m.government[i];
  const funds = state.includeFunds ? m.funds[i] : null;
  if (gov == null && funds == null) return null;
  return (gov || 0) + (funds || 0);
}

export const hasEstimate = (m) => m.government.some((x) => x != null) || m.funds.some((x) => x != null);
export const selectedImpact = (id) => (impact(M[id]) || 0) * (state.selected.get(id) || 0);
export const savesMoney = (m) => YEARS.reduce((sum, _, i) => sum + (impact(m, i) || 0), 0) > 0;

export function totals(id = state.flow) {
  const f = FLOWS[id];
  const selected = state.flows[id].selected;
  const amount = (mid) => (impact(M[mid]) || 0) * (selected.get(mid) || 0);
  const byType = Object.fromEntries(f.types.map((type) => [type, 0]));
  for (const mid of selected.keys()) byType[M[mid].type] += amount(mid);
  const byCategory = {};
  for (const c of f.categories) byCategory[c.id] = c.measures.reduce((sum, mid) => sum + amount(mid), 0);
  const total = Object.values(byType).reduce((a, b) => a + b, 0);
  return { total, byType, byCategory };
}

// ---------- Selecting measures ----------

export const selectedConflicts = (id) => M[id].conflicts.filter((c) => state.selected.has(c));

// Selects a measure (count 0 removes it) and drops conflicting selections. Returns the dropped ids.
export function select(id, count = 1) {
  const removed = count > 0 ? selectedConflicts(id) : [];
  removed.forEach((c) => state.selected.delete(c));
  if (count > 0) state.selected.set(id, count);
  else state.selected.delete(id);
  return removed;
}

// Measures that "Select group" adds: savers from largest to smallest, skipping conflicts,
// so that among alternatives the one that saves the most wins.
export function packageFor(group, selected = state.selected) {
  const taken = new Set(selected.keys());
  const toAdd = [];
  const byImpact = [...group.measures].sort((a, b) => (impact(M[b]) || 0) - (impact(M[a]) || 0));
  for (const id of byImpact) {
    const m = M[id];
    if (taken.has(id) || !savesMoney(m) || m.conflicts.some((c) => taken.has(c))) continue;
    toAdd.push(id);
    taken.add(id);
  }
  return toAdd;
}

export const potential = (group) => packageFor(group, new Map()).reduce((sum, id) => sum + (impact(M[id]) || 0), 0);

// ---------- Question levels ----------
// A question's answer is not stored: it is whichever level matches the current selection.

export const levelTotal = (level) => level.items.reduce((sum, x) => sum + (impact(M[x.id]) || 0) * x.count, 0);

// 0 = no change, 1… = level, -1 = the selection matches no level (edited in the measures view)
export function currentLevel(q) {
  const chosen = q.ids.filter((id) => state.selected.has(id));
  if (!chosen.length) return 0;
  const n = q.levels.findIndex(
    (l) => l.items.length === chosen.length && l.items.every((x) => state.selected.get(x.id) === x.count)
  );
  return n + 1 || -1;
}

// Returns ids of conflicting measures that were dropped from other questions or views.
export function setLevel(q, n) {
  q.ids.forEach((id) => state.selected.delete(id));
  return n > 0 ? q.levels[n - 1].items.flatMap((x) => select(x.id, x.count)) : [];
}
