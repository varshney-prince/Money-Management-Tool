# MoneyDash Refactoring

## What This Is

MoneyDash is a browser-based personal finance dashboard featuring income/expense tracking, net worth management, lending, and month-by-month history archiving. This initiative will refactor the existing 1,641-line monolithic HTML file into a simple, maintainable structure with separate CSS and JS files, while retaining the vanilla tech stack and zero-build setup.

## Core Value

Users can manage their personal finances securely through a fast, fully client-side application that saves directly to their local filesystem. The split must not break any existing functionality, data compatibility, or the File System Access API integration.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Manage income and expense records — existing
- ✓ Track assets and liabilities with net worth calculations — existing
- ✓ Archiving monthly history with JSON snapshots inside Excel — existing
- ✓ Persist data utilizing the File System Access API and `.xlsx` files — existing
- ✓ Visualize financial insights using Chart.js — existing
- ✓ Investment growth simulator — existing
- ✓ Loan and collateral tracking — existing
- ✓ Single page application with tabbed navigation — existing
- ✓ Extract all CSS from `moneydash-final.html` into a new `style.css` file — Validated in Phase 1: Modular File Decomposition
- ✓ Extract all JavaScript from `moneydash-final.html` into a new `app.js` file — Validated in Phase 1: Modular File Decomposition
- ✓ Create a clean `index.html` that links the new CSS and JS files — Validated in Phase 1: Modular File Decomposition
- ✓ Validate that all interconnected logic, DOM manipulation, charts, and file persistence work perfectly with the split files — Validated in Phase 1: Modular File Decomposition

### Active

<!-- Current scope. Building toward these. -->

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Framework Migration** — We are specifically not moving to React, Vue, or Vite. Kept simple to minimize risk.
- **Build Tooling** — No Webpack, Rollup, or Babel. The app remains 100% browser-native.
- **New Features** — Focus is entirely on reducing the technical debt of the monolithic file structure.

## Context

The current `moneydash-final.html` is very long and difficult to maintain. As identified in `.planning/codebase/CONCERNS.md`, this monolithic approach is the #1 item of technical debt. By splitting it into three modular files, future feature extraction and maintenance will be significantly easier.

## Constraints

- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES2020+) — No build step.
- **Dependencies**: Must continue to use CDNs for Chart.js, SheetJS, and Font Awesome.
- **Browser Compatibility**: Must keep the File System Access API working in Chromium browsers.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Simple Split Strategy | Going straight to a framework would be too massive an undertaking right now. A simple split solves the biggest pain point (1 file) with the lowest risk. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

Last updated: 2026-04-02
