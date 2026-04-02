// core/state.js

export const state = {
  LS_KEY: 'moneydash_folder',
  incomes: [],
  expenses: [],
  assets: [],
  loans: [],
  history: [],
  
  folderHandle: null,
  unsaved: false,
  nwView: 'a', // 'a'=assets 'l'=liabilities
  currentAT: 'asset',
  
  // chart instances
  charts: {
    iPie: null,
    ePie: null,
    aPie: null,
    lPie: null,
    trendCh: null,
    nwCh: null,
    simCh: null
  }
};

export const CONSTANTS = {
  IC: ['#10b981','#34d399','#4ade80','#a3e635','#06b6d4','#818cf8','#f472b6','#fbbf24'],
  EC: ['#f43f5e','#fb923c','#facc15','#a78bfa','#38bdf8','#fb7185','#e879f9','#34d399'],
  AC: ['#6366f1','#818cf8','#a78bfa','#c4b5fd','#34d399','#10b981','#fbbf24','#f59e0b','#38bdf8','#06b6d4'],
  LC: ['#f43f5e','#fb7185','#fb923c','#fca5a5','#e879f9','#fda4af'],
  
  ICONS: {
    'Cash & Savings':'🏦','Fixed Deposit':'📋','Stocks & Equity':'📈','Mutual Funds':'📊',
    'Gold & Precious':'🥇','Real Estate':'🏠','Vehicle':'🚗','EPF / PPF':'🛡️',
    'Crypto':'₿','Business':'🏢','Other Asset':'💼',
    'Home Loan':'🏠','Car Loan':'🚗','Personal Loan':'💸',
    'Credit Card':'💳','Education Loan':'🎓','Other Liability':'📌'
  },
  
  ASSET_CATS: ['Cash & Savings','Fixed Deposit','Stocks & Equity','Mutual Funds','Gold & Precious','Real Estate','Vehicle','EPF / PPF','Crypto','Business','Other Asset'],
  LIAB_CATS: ['Home Loan','Car Loan','Personal Loan','Credit Card','Education Loan','Other Liability'],
  
  LEND_ICONS: {
    'Personal':'👤','Business':'🏢','Education':'🎓','Medical':'🏥','Emergency':'🚨','Other':'💸'
  }
};

export function markDirty() { 
  state.unsaved = true;  
  document.getElementById('udot').classList.remove('hidden'); 
}

export function markClean() { 
  state.unsaved = false; 
  document.getElementById('udot').classList.add('hidden'); 
}
