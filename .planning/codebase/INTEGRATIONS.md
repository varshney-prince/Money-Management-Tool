# External Integrations

## Data Persistence

### File System Access API (Primary)
- **API:** `window.showDirectoryPicker()`, `FileSystemDirectoryHandle`, `FileSystemFileHandle`
- **Usage:** Reading and writing `moneydash.xlsx` to a user-selected folder
- **Flow:**
  1. User picks folder via `pickFolder()` (line 710)
  2. App tries to auto-load `moneydash.xlsx` from the folder
  3. `saveToExcel()` writes back to the same folder handle
- **Limitation:** Chromium-only, handle lost on page reload (must re-pick or fall back)

### localStorage (Secondary)
- **Key `moneydash_folder`:** Stores the folder name string for display on reload
- **Key `moneydash_history`:** Stores JSON-serialized history array of archived months
- **Usage:** Supplements the File System API — remembers folder selection and history data across sessions

### Excel Files (SheetJS)
- **File format:** `.xlsx` (Office Open XML)
- **Sheets in workbook:**
  | Sheet | Columns | Purpose |
  |-------|---------|---------|
  | `Incomes` | ID, Name, Amount, Date, Note | Income source records |
  | `Expenses` | ID, Name, Category, Amount, Date, Note | Expense records |
  | `Assets` | ID, Type, Name, Category, Value, Date, Note | Asset/liability records |
  | `Loans` | ID, Borrower, Amount, Collateral, Interest, Months, Date, Note, Status | Lending records |
  | `History` | ID, Month Key, Month Name, Archived At, Incomes JSON, Expenses JSON, Assets JSON | Archived month snapshots |
  | `Summary` | Key, Value | Computed summary stats (read-only, generated on save) |
- **Read:** `parseXLSX(arrayBuffer)` at line 792
- **Write:** `buildWB()` at line 814 constructs the workbook

## External CDN Services
| Service | URL Pattern | What it loads |
|---------|-------------|---------------|
| jsdelivr | `cdn.jsdelivr.net/npm/chart.js@4.4.1/...` | Chart.js UMD bundle |
| cdnjs | `cdnjs.cloudflare.com/ajax/libs/xlsx/...` | SheetJS full bundle |
| cdnjs | `cdnjs.cloudflare.com/ajax/libs/font-awesome/...` | Font Awesome CSS + fonts |
| Google Fonts | `fonts.googleapis.com/css2?...` | Inter + Space Grotesk fonts |

## External APIs
- **None** — The application makes no HTTP/fetch requests
- **No backend server** — Fully client-side

## Authentication
- **None** — No user accounts, no auth providers

## Databases
- **None** — Data lives in browser localStorage and user's local `.xlsx` file

## Webhooks / Events
- **`beforeunload`** event listener (line 1635) — Warns user about unsaved changes
- No external webhook integrations
