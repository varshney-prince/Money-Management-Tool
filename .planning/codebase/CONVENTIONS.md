# Conventions

## Code Style

### CSS
- **Inline styles heavily used** — Many elements have `style="..."` attributes directly in HTML (e.g., grid layouts, colors, padding)
- **CSS classes for reusable patterns** — `.btn`, `.btn-g`, `.card`, `.modal`, `.field`, `.nav-link`
- **Abbreviated class names** — `.g` (grid), `.c12`/`.c8`/`.c4` (column spans), `.cw` (chart wrapper)
- **CSS variables:** None used — colors are hardcoded as hex values
- **Design tokens in CSS:** A consistent color palette throughout:
  - Background: `#09090b` (darkest), `#18181b` (cards), `#27272a` (interactive)
  - Text: `#e4e4e7` (body), `#a1a1aa` (muted), `#fff` (emphasis)
  - Accent green: `#10b981`, `#34d399`
  - Accent red: `#e11d48`, `#fb7185`, `#f43f5e`
  - Accent purple: `#6366f1`, `#818cf8`
  - Accent amber: `#fbbf24`, `#f59e0b`
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
  ```html
  <!-- ══════════════════════════════════════════════════════
       SECTION NAME
  ═══════════════════════════════════════════════════════ -->
  ```

## Patterns

### Rendering Pattern
All render functions follow the same pattern:
1. Compute data from global state
2. Generate HTML string via template literals
3. Assign to `.innerHTML` of a container
4. Destroy and recreate Chart.js instances if applicable

```javascript
function renderSomething() {
  const items = globalArray.filter(...);
  document.getElementById('container').innerHTML = items.map(item => `
    <div>...</div>
  `).join('') || empty('Empty message');
}
```

### CRUD Pattern
```javascript
function addThing() {
  // 1. Read form inputs
  const name = document.getElementById('t-name').value.trim();
  // 2. Validate
  if(!name) { toast('Error', true); return; }
  // 3. Push to global array with nid() for ID
  things.push({id: nid(things), name, ...});
  // 4. Clear form
  ['t-name'].forEach(id => document.getElementById(id).value = '');
  // 5. Close modal, mark dirty, re-render, toast
  closeModal('thing'); markDirty(); renderAll(); toast('✅ Added!');
}
```

### Chart Pattern
```javascript
let chartInstance = null;
function renderChart() {
  if(chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartInstance = new Chart(canvas, config);
}
```

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
