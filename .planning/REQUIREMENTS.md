# Requirements: MoneyDash Refactoring

**Defined:** 2026-03-31
**Core Value:** Users can manage their personal finances securely through a fast, fully client-side application that saves directly to their local filesystem. The split must not break any existing functionality, data compatibility, or the File System Access API integration.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Refactoring

- [ ] **REFACT-01**: CSS code is completely extracted from `moneydash-final.html` to a new `style.css` file.
- [ ] **REFACT-02**: JavaScript logic is completely extracted from `moneydash-final.html` to a new `app.js` file.
- [ ] **REFACT-03**: The HTML file references the extracted CSS using `<link>` and the JS using a classic `<script>` tag.
- [ ] **REFACT-04**: No ES modularization (`type="module"`) is used, ensuring global inline event handlers (e.g., `onclick`) do not break.
- [ ] **REFACT-05**: All global variables and state remain fully operational across the application.
- [ ] **REFACT-06**: UI rendering, charts, simulators, and all DOM manipulation functions correctly post-split.
- [ ] **REFACT-07**: File System Access API hooks, Excel reading/writing, and localStorage functionality continue to work seamlessly.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Architectural Modernization
- **MOD-01**: Migrate all inline HTML event handlers (e.g., `onclick="addEntry()"`) to JavaScript `addEventListener` hooks for cleaner separation of concerns.
- **MOD-02**: Break CSS into a standard methodology (like BEM) with distinct component files.
- **MOD-03**: Wrap global mutable variables inside state management functions/modules.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Framework Migration | Out of scope for a simple file split. Moving to React/Vue adds immense complexity to a working app. |
| Build Tooling | Staying pure vanilla frontend (no Webpack/Vite) to keep deployment as simple as opening the file. |
| New Features | Functionality must remain 100% frozen. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| REFACT-01 | Phase 1 | Pending |
| REFACT-02 | Phase 1 | Pending |
| REFACT-03 | Phase 1 | Pending |
| REFACT-04 | Phase 1 | Pending |
| REFACT-05 | Phase 1 | Pending |
| REFACT-06 | Phase 1 | Pending |
| REFACT-07 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 0
- Unmapped: 7 ⚠️

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
