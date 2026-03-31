<!-- GSD:project-start source:PROJECT.md -->
## Project

**MoneyDash Refactoring**

MoneyDash is a browser-based personal finance dashboard featuring income/expense tracking, net worth management, lending, and month-by-month history archiving. This initiative will refactor the existing 1,641-line monolithic HTML file into a simple, maintainable structure with separate CSS and JS files, while retaining the vanilla tech stack and zero-build setup.

**Core Value:** Users can manage their personal finances securely through a fast, fully client-side application that saves directly to their local filesystem. The split must not break any existing functionality, data compatibility, or the File System Access API integration.

### Constraints

- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES2020+) — No build step.
- **Dependencies**: Must continue to use CDNs for Chart.js, SheetJS, and Font Awesome.
- **Browser Compatibility**: Must keep the File System Access API working in Chromium browsers.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages & Runtime
- **HTML5** — Single-page application rendered as a monolithic HTML file
- **CSS3** — Embedded `<style>` block within `<head>`, no external stylesheets
- **JavaScript (ES2020+)** — Embedded `<script>` block, uses async/await, optional chaining (`?.`), nullish coalescing (`??`), arrow functions, template literals
## Runtime Environment
- **Browser-only** — No server, no build step, no bundler
- **File System Access API** — Uses `window.showDirectoryPicker()` for folder-based persistence (Chromium only)
- **localStorage** — Fallback persistence for folder path and history data
## Frameworks & Libraries (CDN-loaded)
| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| Chart.js | 4.4.1 | jsdelivr | All charts: doughnut pies, line trends, projections |
| SheetJS (xlsx) | 0.18.5 | cdnjs | Excel file read/write — core data persistence layer |
| Font Awesome | 6.5.1 | cdnjs | Icon system throughout the UI |
## Fonts
- **Inter** (400, 500, 600) — Primary body font via Google Fonts
- **Space Grotesk** (500, 600) — Logo/brand font via Google Fonts
## Configuration
- No config files (`.env`, `tsconfig`, etc.)
- No environment variables
- All configuration is hardcoded in JavaScript constants:
## Package Management
- `package.json` exists but only contains `"gsd": "^0.0.3"` dependency — **not used by the application**
- `node_modules/` exists but is unrelated to app functionality
- No `package-lock.json` scripts, no `npm run` commands for the app itself
## Build & Deploy
- **No build step** — The HTML file is served directly
- **No bundler** (no Webpack, Vite, Rollup, etc.)
- **No minification pipeline**
- **No CI/CD configuration**
- Deployment: Open `moneydash-final.html` directly in a Chromium browser
## Browser Compatibility
- **Primary target:** Chromium-based browsers (Chrome, Edge) — required for File System Access API
- **Degraded mode:** Other browsers can still use the app but files download instead of saving to a folder
- Uses `showDirectoryPicker` with fallback warning UI
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
### CSS
- **Inline styles heavily used** — Many elements have `style="..."` attributes directly in HTML (e.g., grid layouts, colors, padding)
- **CSS classes for reusable patterns** — `.btn`, `.btn-g`, `.card`, `.modal`, `.field`, `.nav-link`
- **Abbreviated class names** — `.g` (grid), `.c12`/`.c8`/`.c4` (column spans), `.cw` (chart wrapper)
- **CSS variables:** None used — colors are hardcoded as hex values
- **Design tokens in CSS:** A consistent color palette throughout:
- **Border radius:** `9999px` (pill) used extensively, `18px` for cards, `14px` for sub-cards
### JavaScript
- **No modules** — All code in a single `<script>` block, global scope
- **Function declarations** — Mix of `function name()` and arrow functions
- **Template literals** — Used exclusively for HTML generation via `innerHTML`
- **Semicolons:** Used consistently
- **Spacing:** Compact/minified style for variable declarations, expanded for function bodies
- **Destructuring:** Used in calcs extraction: `const {ti,te,surplus} = calcs()`
### HTML
- **Semantic elements:** Minimal — primarily `<div>`, `<button>`, `<input>`, `<select>`
- **Inline event handlers:** `onclick`, `oninput`, `onchange` used throughout
- **Section comments:** Clear separator comments for major sections:
## Patterns
### Rendering Pattern
### CRUD Pattern
### Chart Pattern
## Error Handling
- **Minimal** — Most errors are `try/catch` swallowed or logged to console
- **User-facing errors:** `toast(msg, true)` for error messages (red toast)
- **Form validation:** Basic null/empty checks, no regex or type validation
- **File operations:** `try/catch` around File System API with fallback to download
- **No error boundaries or global error handlers**
## Data Formatting
- **Currency:** `fmt(n)` → `'₹' + Math.abs(n).toLocaleString('en-IN')` (Indian formatting with comma grouping)
- **Dates:** ISO format `YYYY-MM-DD` stored, `<input type="date">` for input
- **Percentages:** Integer `Math.round()` display
## UI Interaction Patterns
- **Confirmation dialogs:** Native `confirm()` for destructive actions (delete, reset, restore)
- **Unsaved changes:** Yellow dot indicator + `beforeunload` warning
- **Confetti animation:** Triggered on positive actions (add income, create loan, etc.)
- **Toast notifications:** 2.8-second auto-dismiss, green (success) or red (error)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern
## Layers
```
```
## Data Flow
### State Management
```javascript
```
- `folderHandle` — File System Access API handle
- `unsaved` — Dirty flag for save indicator
- `nwView` — Net Worth tab toggle ('a' or 'l')
- `currentAT` — Asset type toggle ('asset' or 'liability')
- Chart instances: `iPie`, `ePie`, `aPie`, `lPie`, `trendCh`, `nwCh`, `simCh`
### Data Flow Diagram
```
```
### Computation Pipeline
```
```
## Entry Points
- **File:** `moneydash-final.html` — the entire application
- **Init:** `window.onload` (line 697) — Sets date fields, checks localStorage, optionally skips to step 2
- **User entry flows:**
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
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
