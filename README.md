# Leikkauskone (Budget Cutter)

An interactive page for trying out how the Finnish public finances could reach the next parliamentary term's
fiscal adjustment target, using the measures listed in the Ministry of Finance (VM) *expenditure and structural
review* (26 Oct 2026) and the options in its *tax review*.

The page has two views:

- **Questions** (the main view): 17 big questions ("Cut support for families with children?") answered with
  *No change / A little / A lot*, one at a time or all at once. Each option explains what it means and what
  it saves. The result page lists the answers and can be shared as an image.
- **All measures**: all 459 measures, grouped and individually selectable.

Both views share the same selections: answers to the questions show up as individual measures in the other view.

The UI is in Finnish and English. Choices are saved in the browser (localStorage), so the page continues
where it was left.

## Running

The page uses JavaScript modules, which browsers do not load from `file://`. Serve the folder with any static
server, for example:

```bash
python3 -m http.server
```

and open <http://localhost:8000>. There is no build step and there are no dependencies.

## Files

| Path | What it is |
|---|---|
| `index.html`, `style.css` | Page structure and styles. Colours and sizes are variables at the top of `style.css` (light and dark theme). |
| `content/questions.js` | The questions and their levels (which measures each level selects) |
| `content/strings.js` | UI texts in Finnish and English |
| `content/config.js` | Languages, milestones, default year, category notes, source links |
| `src/main.js` | Entry point: header, language, switching views |
| `src/state.js` | State and saving it in the browser |
| `src/model.js` | Calculations and selection rules |
| `src/text.js`, `src/ui.js` | Translation and formatting helpers, small DOM helpers |
| `src/views/` | Start page, meter, questions, measures and sharing |
| `src/share-image.js` | Draws the shareable PNG result image |
| `data/grouping.csv`, `data/taxes.csv`, `data/translations_en.csv` | Grouping, tax measures and English names – editable, e.g. in Excel |
| `data/measures.js` | Data used by the page – **generated**, do not edit by hand |
| `tools/build_data.py` | Builds `data/measures.js` from the Excel file and the CSVs |
| `Excel-taulukko meno- ja rakennekartoitus.xlsx` | The original VM spreadsheet |

## Updating the data

After editing the CSV files or replacing the Excel file with a new version, run:

```bash
pip install openpyxl
python3 tools/build_data.py
```

The script warns about Excel rows missing from `grouping.csv`, "TAI" (= "OR") alternatives without an
alternative group, and missing English translations.

### CSV columns

The CSVs use `;` as the separator so they open directly in Excel with Finnish settings.

- `category` / `group` – the category and group a measure belongs to (a new name creates a new group).
- `alternative_group` – only one measure with the same tag can be selected (e.g. cutting Yle's funding by 20% *or* 10%).
- `conflicts_with` – space-separated ids of measures that overlap with this one (e.g. the general index freeze and individual index measures).
- `taxes.csv`: `impact_meur` is the figure used (M€ per year), `unit_max` makes the row adjustable (+/−) with steps of `unit_step`, `from_year` is the first year the revenue accrues, and `basis` explains where the figure comes from.
- `translations_en.csv`: keys are measure ids, `category:<id>`, `group:<Finnish group name>` and `basis:<Finnish basis text>`.

### Questions

In `content/questions.js` every question has two levels ("A little" and "A lot"), each listing measure ids
(for per-unit tax yields, the number of steps after an asterisk, e.g. `"VER-74*3"`). Euro amounts are calculated
automatically. Avoid putting conflicting measures in different questions – otherwise answering one question
clears another.

## How it works

The visitor's choices are a single map from measure id to count. Everything else – totals, answers to the questions,
the meter – is derived from it on each change, so the two views can never disagree.


## How the numbers work

- Spending figures are VM's estimates of the effect on central and local government finances in the selected
  year. The effect on social security funds can be included in the all-measures view.
- Tax revenue estimates are at the 2028 level and assumed constant. Where VM gives the net effect on public
  finances (including index-linked benefits and price elasticity), that figure is used.
- Milestones: the EU 3% deficit limit (~€4.5bn, a rough estimate), the adjustment target of €8–11bn by 2031
  (Finnish Government publication 2026:17) and the €12.3bn deficit of the 2027 state budget.
- The grouping, the questions, the English translations and the detection of overlaps are the
  author's interpretation. VM has not assessed the combined effects of the measures.
