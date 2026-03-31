# Technology Stack

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
  - `LS_KEY = 'moneydash_folder'` — localStorage key for folder name
  - Color palettes: `IC`, `EC`, `AC`, `LC` arrays
  - Category definitions: `ASSET_CATS`, `LIAB_CATS`
  - Icons mapping: `ICONS`, `LEND_ICONS`

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
