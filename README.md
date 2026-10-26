# Leikkauskone (Budget Cutter)

An interactive page for trying out how the Finnish public finances could reach the next parliamentary term's
fiscal adjustment target, using the measures listed in the Ministry of Finance (VM) *expenditure and structural
review* (26 Oct 2026) and the options in its *tax review*.

The page has two views:

- **Easy** (default): 17 big questions ("Cut support for families with children?") answered with
  *No change / A little / A lot*, one at a time or all at once. Each option explains what it means and what
  it saves. The result page lists the answers and can be shared as a link or an image.
- **Detailed**: all 459 measures, grouped and individually selectable.

Both views share the same selections: easy-mode answers show up as individual measures in the detailed view.

The UI is in Finnish and English. Choices are saved in the browser (localStorage), so the page continues
where it was left.

## Running

Open `index.html` in a browser – double-clicking is enough. No build step, no dependencies, no server.

## Files

| File | What it is | Edit? |
|---|---|---|
| `index.html` | Page structure | Yes |
| `style.css` | Styles. Colours and sizes are variables at the top of the file (light and dark theme). | Yes |
| `i18n.js` | UI strings in Finnish and English | Yes |
| `questions.js` | Easy-mode questions and their levels (which measures each level selects) | Yes |
| `config.js` | Milestones, default year, category notes, source links | Yes |
| `app.js` | Application logic | When needed |
| `share-image.js` | Draws the shareable PNG result image (canvas) | When needed |
| `data/grouping.csv` | Categories and groups of spending measures, alternatives and overlaps | Yes (e.g. in Excel) |
| `data/taxes.csv` | Tax measures, the figure used and where it comes from | Yes (e.g. in Excel) |
| `data/translations_en.csv` | English names for measures, groups, categories and tax bases | Yes (e.g. in Excel) |
| `data.js` | Data used by the page – **generated**, do not edit by hand | No |
| `tools/build_data.py` | Builds `data.js` from the Excel file and the CSVs | – |
| `Excel-taulukko meno- ja rakennekartoitus.xlsx` | The original VM spreadsheet | No |

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

### Easy-mode questions

In `questions.js` every question has two levels ("A little" and "A lot"), each listing measure ids
(for per-unit tax yields, the number of steps after an asterisk, e.g. `"VER-74*3"`). Euro amounts are calculated
automatically. Avoid putting conflicting measures in different questions – otherwise answering one question
clears another.

## How it works

The visitor's choices are a single map from measure id to count. Everything else – totals, easy-mode answers,
the meter – is derived from it on each change, so the two views can never disagree.

Share links (`#s=…`) encode the choices as a bitmask over all measures in id order: one bit per measure, three
bits for adjustable tax measures, six bits per character. A link is about 85 characters regardless of how much
is selected. The encoding depends on the set of measures, so links made before the data changes may not
open correctly afterwards.

## How the numbers work

- Spending figures are VM's estimates of the effect on central and local government finances in the selected
  year. The effect on social security funds can be included in the detailed view.
- Tax revenue estimates are at the 2028 level and assumed constant. Where VM gives the net effect on public
  finances (including index-linked benefits and price elasticity), that figure is used.
- Milestones: the EU 3% deficit limit (~€4.5bn, a rough estimate), the adjustment target of €8–11bn by 2031
  (Finnish Government publication 2026:17) and the €12.3bn deficit of the 2027 state budget.
- The grouping, the easy-mode questions, the English translations and the detection of overlaps are the
  author's interpretation. VM has not assessed the combined effects of the measures.
