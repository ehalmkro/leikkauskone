// The two flows: the state budget and greenhouse gas emissions. Each has its own measures, questions and meter;
// the views work the same for both.

import { CONFIG } from "../content/config.js";
import { QUESTIONS } from "../content/questions.js";
import { CLIMATE } from "../content/climate.js";
import { DATA } from "../data/measures.js";

export const FLOWS = {
  budget: {
    id: "budget",
    year: null, // chosen by the visitor (state.year)
    measures: DATA.measures,
    categories: DATA.categories.map((c) => ({ ...c, measures: c.groups.flatMap((g) => g.measures) })),
    types: CONFIG.types,
    sections: QUESTIONS.sections,
    questions: QUESTIONS.questions,
    meter: CONFIG.meter,
    milestones: CONFIG.milestones,
    sources: CONFIG.sources,
  },
  climate: {
    id: "climate",
    year: CLIMATE.year,
    measures: Object.fromEntries(Object.entries(CLIMATE.measures).map(([id, m]) => [id, { conflicts: [], ...m, id }])),
    categories: CLIMATE.categories,
    types: CLIMATE.types,
    sections: CLIMATE.sections,
    questions: CLIMATE.questions,
    meter: CLIMATE.meter,
    milestones: CLIMATE.milestones,
    sources: CLIMATE.sources,
  },
};

export const FLOW_IDS = Object.keys(FLOWS);
