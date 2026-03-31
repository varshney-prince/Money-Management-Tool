# ROADMAP: MoneyDash Refactoring

## Phase 1: Modular File Decomposition
**Goal**: Split the monolithic 1,600+ line HTML into an `index.html`, `style.css`, and `app.js` file while maintaining 100% functional equivalence.
**Requirements**: REFACT-01, REFACT-02, REFACT-03, REFACT-04, REFACT-05, REFACT-06, REFACT-07

**Success criteria**:
1. `style.css` contains all 100+ lines of CSS formerly in the `<head>` tag.
2. `app.js` contains all 1,000+ lines of code formerly in the bottom `<script>` tag.
3. `index.html` loads both files correctly without errors.
4. UI renders correctly (no broken layouts).
5. All buttons and interactive elements work as expected (no broken `onclick` handlers).
6. File System Access API can successfully save `moneydash.xlsx` and localStorage correctly saves preferences.
