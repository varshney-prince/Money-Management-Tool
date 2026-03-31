# Concerns

## Technical Debt

### 🔴 Critical

**1. Monolithic Single File**
- `moneydash-final.html` is 1,641 lines with HTML, CSS, and JS all mixed together
- Impossible to have multiple developers work on different features simultaneously
- No code reuse across pages or projects
- Makes any refactoring risky since everything is coupled

**2. Global Mutable State**
- All data lives in global `let` variables (`incomes`, `expenses`, `assets`, `loans`, `history`)
- Any function can mutate any state at any time — no encapsulation
- Race conditions possible with async operations (File System API + state mutation)
- No undo/redo capability

**3. innerHTML XSS Vulnerability**
- All rendering uses `innerHTML` with template literals containing user data
- User-supplied values like `item.name`, `item.note`, `item.borrower` are not sanitized
- Example: A user could create an income named `<img onerror=alert(1) src=x>` and it would execute
- Affected functions: `renderLists()`, `renderRecent()`, `renderHistory()`, `renderLending()`, `renderFullList()`, `renderCatList()`

### 🟡 Important

**4. No Data Validation**
- Amounts accept negative values (only partially validated in lending)
- No max value limits — user could enter astronomically large numbers
- Date fields accept any date — no range validation
- Category values not validated against allowed lists on import
- Excel import trusts all data without validation

**5. Data Loss Risks**
- `folderHandle` is lost on page refresh — user must re-pick folder
- If user closes browser without saving, data since last save is lost
- `confirmReset()` clears localStorage but provides only a single `confirm()` gate
- History stored in both localStorage and Excel — can drift out of sync
- No automatic backup or auto-save

**6. Analysis Charts Use Fake Data**
- `renderTrend()` (line 1198) generates synthetic trend data instead of using actual historical data
- Line: `data:mo.map((_,i)=>Math.round(ti*(0.88+i*.025)))` — manufactured, not real
- The Analysis tab gives a false impression of trends

**7. Chart.js Destroy-Recreate Pattern**
- Every render destroys and recreates all chart instances
- This is wasteful — Chart.js supports `chart.update()` for data changes
- Causes potential memory leaks if references aren't properly cleaned up

### 🟢 Minor

**8. No Responsive Design for Mobile**
- Only one `@media` breakpoint at `1100px` which collapses the grid
- Sidebar has no mobile toggle/hamburger menu
- On phones, the sidebar takes full width or is inaccessible
- Modals don't resize well for small screens

**9. Hardcoded Currency (₹ / INR)**
- Currency symbol `₹` and `en-IN` locale are hardcoded throughout
- `fmt()` function returns Indian rupee formatting
- No way to switch to USD, EUR, etc.

**10. Investment Simulator Inaccuracy**
- Uses annual compounding for SIP: `sip*(Math.pow(1+r,n)-1)/r`
- Real SIP uses monthly compounding — the formula should use monthly rate
- Can give significantly inaccurate projections for long durations

## Security Concerns

**XSS via innerHTML** (see #3 above)
- **Severity:** High in a context where someone else could provide data
- **Practical risk:** Low, since this is a personal finance tool used locally
- **Fix:** Use `textContent` for user data, or sanitize before inserting

**No data encryption**
- Financial data stored as plain text in localStorage and `.xlsx`
- Anyone with access to the browser/computer can read all financial data
- `.xlsx` file on disk is unencrypted

## Performance Concerns

**Full re-render on every change**
- `renderAll()` rebuilds all DOM and charts even for a single entry change
- For large datasets (100+ entries), this could cause noticeable lag
- No virtual scrolling for long lists

**Chart.js bundle size**
- Full Chart.js UMD bundle loaded even though only 2 chart types used (doughnut, line)
- ~200KB of JavaScript for charting alone

## Fragile Areas

**1. ID Generation**
- `nid(arr)` relies on `Math.max(...arr.map(r=>r.id))` — breaks with very large arrays (stack overflow)
- If IDs get corrupted in Excel, can generate duplicate IDs

**2. Excel Sheet Name Dependencies**
- `parseXLSX()` uses hardcoded sheet names: `'Incomes'`, `'Expenses'`, `'Assets'`, `'Loans'`, `'History'`
- Renaming a sheet in Excel breaks the import

**3. History JSON in Excel**
- History stores `Incomes JSON`, `Expenses JSON`, `Assets JSON` as serialized JSON strings in Excel cells
- Excel has cell character limits (~32,767 chars) — a month with many entries could exceed this
- JSON parsing errors would silently lose history data

**4. Asset/Liability Dual-Purpose Array**
- `assets[]` array stores both assets AND liabilities, distinguished only by `.type` field
- This is confusing and error-prone — easy to forget the filter when aggregating
