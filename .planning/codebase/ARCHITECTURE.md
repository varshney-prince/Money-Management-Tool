# Architecture

## Pattern
**Monolithic Single-Page Application (SPA)** — Everything lives in one HTML file (`moneydash-final.html`, 1641 lines). No framework, no component system, no routing library. DOM manipulation via vanilla JavaScript with `innerHTML` template literals.

## Layers

```
┌─────────────────────────────────────────────┐
│              UI Layer (HTML/CSS)             │
│  Setup Screen → Sidebar → Tab Content       │
│  Modals → Toast → Confetti                  │
├─────────────────────────────────────────────┤
│           Rendering Layer (JS)              │
│  renderAll() → renderLists() → renderPies() │
│  renderNW() → renderHistory() → renderTrend │
│  renderLending() → renderFullList()         │
├─────────────────────────────────────────────┤
│           Business Logic Layer (JS)         │
│  calcs() → nwCalcs()                        │
│  archiveCurrentMonth() → restoreMonth()     │
│  runSim() (investment simulator)            │
├─────────────────────────────────────────────┤
│              CRUD Layer (JS)                │
│  addEntry() → delEntry()                    │
│  addAsset() → delAsset()                    │
│  addLoan() → delLoan() → repayLoan()       │
├─────────────────────────────────────────────┤
│         Persistence Layer (JS)              │
│  parseXLSX() ↔ buildWB()                   │
│  saveToExcel() / exportExcel()              │
│  localStorage (history, folder key)         │
└─────────────────────────────────────────────┘
```

## Data Flow

### State Management
All application state is held in **global mutable arrays**:
```javascript
let incomes = [];    // Income source records
let expenses = [];   // Expense records
let assets = [];     // Assets AND liabilities (distinguished by .type field)
let loans = [];      // Lending records
let history = [];    // Archived month snapshots
```

Additional global state:
- `folderHandle` — File System Access API handle
- `unsaved` — Dirty flag for save indicator
- `nwView` — Net Worth tab toggle ('a' or 'l')
- `currentAT` — Asset type toggle ('asset' or 'liability')
- Chart instances: `iPie`, `ePie`, `aPie`, `lPie`, `trendCh`, `nwCh`, `simCh`

### Data Flow Diagram
```
User Action → CRUD function → Mutate global array
                            → markDirty()
                            → renderAll() / renderNW() / renderLending()
                            → DOM updated via innerHTML
                            → toast() notification

Save action → buildWB() → XLSX.write() → File System API / download
Load action → parseXLSX() → Populate global arrays → launch() → renderAll()
```

### Computation Pipeline
```
calcs()   → {ti, te, surplus, daily, rate}     ← derived from incomes[] + expenses[]
nwCalcs() → {ta, tl, nw, dta, liq, inv, phy, score} ← derived from assets[]
```
These are **computed fresh** on every render call — no caching or derived state.

## Entry Points
- **File:** `moneydash-final.html` — the entire application
- **Init:** `window.onload` (line 697) — Sets date fields, checks localStorage, optionally skips to step 2
- **User entry flows:**
  1. `pickFolder()` → auto-load xlsx → `launch()`
  2. `importExcel(evt)` → `parseXLSX()` → `launch()`
  3. `createNew()` → populate sample data → `launch()`

## Key Abstractions

### Tab Navigation System
- 8 tabs (Overview, Income, Expenses, Analysis, Simulator, Net Worth, History, Lending)
- `sw(n)` function toggles `.tab-content` visibility and triggers tab-specific renders
- Sidebar nav links call `sw(n)` via `onclick`

### Modal System
- 4 modals: `modal-income`, `modal-expense`, `modal-asset`, `modal-lend`
- `openModal(type)` / `closeModal(type)` toggle `display:flex/none`
- Click-outside-to-close via `onclick` on overlay

### Chart System
- 7 Chart.js instances, each stored in a global variable
- Pattern: destroy old → create new on every render
- Types used: `doughnut` (4 pies), `line` (3 trends)

### ID Generation
- `nid(arr)` — returns `max(id) + 1` from the array, or 1 if empty
- Simple incrementing integer IDs, not UUIDs
