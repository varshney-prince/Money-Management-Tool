# MoneyDash: Smart Personal Finance Manager

**MoneyDash** is a fast, secure, and fully client-side personal finance dashboard designed for high-performance money management without the need for a server or complex database setup.

The application allows you to track every aspect of your financial life—from daily expenses and income to complex lending and overall net worth—all while saving directly to your local file system as a standard Excel file.

## 🚀 Key Features

- **Full Financial Overview**: Track monthly income, expenses, and daily spend limits with a clean, dynamic dashboard.
- **Net Worth Management**: Manage your assets and liabilities with live health scoring, debt-to-asset ratios, and a 24-month growth projection.
- **Lending & Collateral Tracker**: Track money lent to others with built-in interest calculators, repayment timelines, and collateral value monitoring.
- **Investment Growth Simulator**: Plan your future with a SIP/Lumpsum simulator featuring Chart.js visualizations for various asset classes.
- **Historical Archiving**: Archive your monthly data into a persistent history log to track long-term trends while keeping your current dashboard clean.
- **Privacy-First Storage**: Uses the **File System Access API** to save your data directly to a `moneydash.xlsx` file on your device. Zero data ever leaves your computer.

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, ES2020+ JavaScript (Modular Architecture).
- **Visualization**: [Chart.js](https://www.chartjs.org/) for all financial trends and distributions.
- **Data Engine**: [SheetJS (xlsx)](https://sheetjs.com/) for reading and writing Excel databases.
- **Icons**: Font Awesome 6.
- **Zero Build**: No bundlers, compilers, or `node_modules` required to run—just pure browser power.

## 📦 Getting Started

Since the application uses modern JavaScript modules, it must be served through a local web server to bypass browser security restrictions.

1. **Clone the repo**:
   ```bash
   git clone https://github.com/varshney-prince/Money-Management-Tool.git
   cd Money-Management-Tool
   ```

2. **Serve the project**:
   - Using Python: `python -m http.server 8000`
   - Using Node: `npx serve .`
   - Or use VS Code's **Live Server** extension.

3. **Open in Browser**: Navigate to `http://localhost:8000` (or your local port) in a Chromium-based browser (Chrome, Edge, etc.) for full File System Access API support.

## 📝 License

This project is open-source and available for personal use. Feel free to contribute or adapt it for your own financial journey!
