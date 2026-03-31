# Directory Structure

## Project Root: `d:\Money-Manager\`

```
Money-Manager/
├── moneydash-final.html    (98,869 bytes) ← THE ENTIRE APPLICATION
├── moneydash.xlsx           (19,975 bytes) ← Sample/saved data file
├── package.json                    (48 bytes) ← Only gsd dependency, unused by app
├── package-lock.json        (33,763 bytes) ← Auto-generated, unused by app
├── node_modules/                            ← Only gsd package, unused by app
└── .planning/                               ← GSD planning directory
    └── codebase/                            ← Codebase mapping documents
```

## Key Locations

### Application Code
- **Everything:** `moneydash-final.html` — All HTML, CSS, and JavaScript in one file

### File Sections within `moneydash-final.html`
| Line Range | Section | Description |
|-----------|---------|-------------|
| 1–9 | Head/meta | Document head, CDN script/link tags |
| 10–117 | CSS `<style>` | All application styles |
| 119–171 | Setup Screen | Folder picker + file import UI |
| 173–568 | Main App | Sidebar, header, all 8 tab contents |
| 570–658 | Modals | Income, expense, asset, lending modals |
| 660 | Toast | Notification element |
| 662–693 | Constants & State | Global variables, color palettes, categories |
| 694–777 | Setup Flow | `pickFolder()`, `importExcel()`, `createNew()`, `launch()` |
| 789–864 | Excel Layer | `parseXLSX()`, `buildWB()`, `saveToExcel()`, `exportExcel()` |
| 866–896 | Helpers | `calcs()`, `nwCalcs()`, `fmt()`, etc. |
| 898–1017 | History | Archive, restore, delete month functions |
| 1019–1091 | Render Overview | `renderAll()`, `renderLists()`, `renderRecent()`, `renderPies()` |
| 1094–1193 | Render History | `renderHistory()`, `toggleHistoryMonth()` |
| 1195–1207 | Render Trend | `renderTrend()` — Analysis tab line chart |
| 1209–1345 | Render Net Worth | `renderNW()`, asset/liability pies, category list, NW trend, full list |
| 1347–1376 | Simulator | `runSim()` — Investment growth calculator |
| 1378–1440 | CRUD Income/Expense/Asset | `addEntry()`, `delEntry()`, `addAsset()`, `delAsset()` |
| 1442–1590 | Lending | `addLoan()`, `delLoan()`, `repayLoan()`, `renderLending()` |
| 1592–1638 | Nav/Modal/Utils | `sw()`, `openModal()`, `toast()`, `confetti()`, `confirmReset()` |

### Data File
- `moneydash.xlsx` — Excel workbook with 6 sheets (Incomes, Expenses, Assets, Loans, History, Summary)

## Naming Conventions
- **HTML IDs:** kebab-case prefixed by section (`ov-inc`, `nw-ta`, `lend-total-loaned`, `sim-fv`)
- **CSS classes:** Short, abbreviated (`btn-g`, `btn-r`, `cw`, `nwtab`, `h-month`)
- **JS functions:** camelCase (`renderAll`, `archiveCurrentMonth`, `nwCalcs`)
- **JS variables:** camelCase for locals, ALL_CAPS for constant arrays (`IC`, `EC`, `ASSET_CATS`)
- **Data field names:** lowercase camelCase (`monthKey`, `archivedAt`, `borrower`)

## File Size Distribution
| File | Size | % of Total |
|------|------|------------|
| `moneydash-final.html` | 98.9 KB | 100% of app code |
| `moneydash.xlsx` | 20 KB | Data file |
| `package.json` | 48 B | Unused |
