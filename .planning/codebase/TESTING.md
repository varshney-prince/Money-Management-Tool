# Testing

## Current State
- **No test framework** installed or configured
- **No test files** exist anywhere in the project
- **No CI/CD pipeline** for automated testing
- **No linting** (ESLint, Prettier, Stylelint, etc.)
- **No type checking** (TypeScript, JSDoc, Flow)

## Test Coverage
- **0% automated coverage**
- All testing is manual — open the HTML file in a browser and interact

## Manual Testing Areas

### Critical Paths (must test manually)
1. **Setup flow:** Folder picker → file import → launch
2. **CRUD operations:** Add/delete income, expense, asset, loan
3. **Data persistence:** Save to Excel → reload → verify data round-trips
4. **History archiving:** Archive month → verify snapshot → restore month
5. **Chart rendering:** Verify all 7 charts render with data

### Browser-Specific Testing
- **Chromium required:** File System Access API (`showDirectoryPicker`)
- **Fallback path:** Other browsers should show warning and use download instead

## Recommended Test Strategy (for future)
Given the monolithic structure, the most practical approaches would be:

### Unit Tests
- Extract `calcs()`, `nwCalcs()`, `fmt()`, `nid()`, `getMonthKey()`, `getMonthName()` into a testable module
- These are pure functions with no DOM dependencies — easy to test

### Integration Tests
- Browser-based testing (Playwright/Puppeteer) for:
  - Setup wizard flow
  - Tab navigation
  - Modal open/close
  - Add/delete entries and verify UI updates
  - Excel export/import round-trip

### Data Integrity Tests
- Verify `parseXLSX()` → `buildWB()` round-trip preserves all data
- Verify `archiveCurrentMonth()` → `restoreMonth()` preserves all data
- Verify ID generation (`nid()`) never produces duplicates

## Testability Challenges
1. **Global state mutation** — Functions modify global arrays directly, hard to isolate
2. **DOM coupling** — Render functions read from and write to DOM directly
3. **No dependency injection** — Chart.js, SheetJS loaded as globals
4. **Inline event handlers** — Hard to trigger programmatically for testing
5. **Single file** — Cannot import individual functions without refactoring
