// core/storage.js
import { state, markDirty, markClean } from './state.js';
import { td, calcs, nwCalcs } from './utils.js';
// We will trigger events for UI to respond (e.g. 'data-loaded', 'toast')

export function dispatchToast(msg, err=false) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { msg, err } }));
}

export function dispatchRender() {
  window.dispatchEvent(new CustomEvent('app-render'));
}

export function launchApp() {
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').style.display = 'flex';
  loadHistoryFromStorage();
  dispatchRender();
}

export async function pickFolder() {
  if (!('showDirectoryPicker' in window)) {
    localStorage.setItem(state.LS_KEY, 'Downloads (auto)');
    document.getElementById('folder-display').textContent = 'Downloads folder (files will download automatically)';
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2-continue').classList.remove('hidden');
    document.getElementById('fsa-warn').classList.remove('hidden');
    return;
  }
  try {
    state.folderHandle = await window.showDirectoryPicker({ mode:'readwrite' });
    localStorage.setItem(state.LS_KEY, state.folderHandle.name);
    document.getElementById('folder-display').textContent = '📁 ' + state.folderHandle.name;
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2-continue').classList.remove('hidden');
    
    try {
      const fh = await state.folderHandle.getFileHandle('moneydash.xlsx');
      const file = await fh.getFile();
      const ab = await file.arrayBuffer();
      parseXLSX(ab);
      document.getElementById('fname').textContent = 'moneydash.xlsx';
      launchApp();
      dispatchToast('📂 Loaded moneydash.xlsx from folder!');
    } catch { 
      // If error (not found), just proceed to step 2
      document.querySelectorAll('.setup-step').forEach(s=>s.classList.remove('active'));
      document.getElementById('step-file').classList.add('active');
    }
  } catch(e) { 
    if(e.name !== 'AbortError') dispatchToast('Could not access folder', true); 
  }
}

export function importExcel(file) {
  if(!file) return;
  const r = new FileReader();
  r.onload = e => { 
    parseXLSX(e.target.result); 
    document.getElementById('fname').textContent = file.name; 
    launchApp(); 
    dispatchToast('✅ File imported!'); 
  };
  r.readAsArrayBuffer(file);
}

export function createNew() {
  state.incomes = [{id:1,name:'Salary',amount:120000,date:td(),note:'Main job'},{id:2,name:'Freelance',amount:45000,date:td(),note:''},{id:3,name:'Dividends',amount:20000,date:td(),note:''}];
  state.expenses = [{id:1,name:'Rent',category:'Rent',amount:25000,date:td(),note:''},{id:2,name:'Groceries',category:'Food & Groceries',amount:12000,date:td(),note:''},{id:3,name:'Fuel',category:'Transport',amount:8500,date:td(),note:''},{id:4,name:'Electricity',category:'Utilities',amount:4800,date:td(),note:''},{id:5,name:'Netflix',category:'Entertainment',amount:950,date:td(),note:''}];
  state.assets = [
    {id:1, type:'asset',     name:'SBI Savings',      category:'Cash & Savings',  value:280000,  date:td(), note:''},
    {id:2, type:'asset',     name:'HDFC FD',           category:'Fixed Deposit',   value:500000,  date:td(), note:'7.2% p.a.'},
    {id:3, type:'asset',     name:'Zerodha Portfolio', category:'Stocks & Equity', value:350000,  date:td(), note:''},
    {id:4, type:'asset',     name:'Mirae Asset MF',    category:'Mutual Funds',    value:180000,  date:td(), note:''},
    {id:5, type:'asset',     name:'Digital Gold',      category:'Gold & Precious', value:90000,   date:td(), note:''},
    {id:6, type:'asset',     name:'2BHK Apartment',    category:'Real Estate',     value:6500000, date:td(), note:'Market value'},
    {id:7, type:'asset',     name:'EPF Balance',       category:'EPF / PPF',       value:420000,  date:td(), note:''},
    {id:8, type:'liability', name:'Home Loan',         category:'Home Loan',       value:3200000, date:td(), note:'SBI, 8.5%'},
    {id:9, type:'liability', name:'Car Loan',          category:'Car Loan',        value:280000,  date:td(), note:'HDFC, 9.2%'},
    {id:10,type:'liability', name:'Credit Card Dues',  category:'Credit Card',     value:45000,   date:td(), note:''},
  ];
  state.loans = [
    {id:1,borrower:'Rahul Sharma',amount:50000,collateral:75000,rate:12,months:6,date:td(),note:'Personal loan - car repair',status:'active'},
    {id:2,borrower:'Priya Patel',amount:100000,collateral:150000,rate:10,months:12,date:td(),note:'Education loan',status:'active'},
  ];
  state.history = [];
  localStorage.removeItem('moneydash_history');
  document.getElementById('fname').textContent = 'moneydash.xlsx (new)';
  markDirty();
  launchApp();
  dispatchToast('✨ New database created!');
  window.dispatchEvent(new CustomEvent('app-confetti'));
}

export function parseXLSX(ab) {
  const wb = window.XLSX.read(ab, {type:'array'});
  if(wb.SheetNames.includes('Incomes'))
    state.incomes = window.XLSX.utils.sheet_to_json(wb.Sheets['Incomes']).map((r,i)=>({id:r.ID??i+1,name:r.Name??'',amount:+r.Amount||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Expenses'))
    state.expenses = window.XLSX.utils.sheet_to_json(wb.Sheets['Expenses']).map((r,i)=>({id:r.ID??i+1,name:r.Name??'',category:r.Category??'Other',amount:+r.Amount||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Assets'))
    state.assets = window.XLSX.utils.sheet_to_json(wb.Sheets['Assets']).map((r,i)=>({id:r.ID??i+1,type:r.Type??'asset',name:r.Name??'',category:r.Category??'Other Asset',value:+r.Value||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Loans'))
    state.loans = window.XLSX.utils.sheet_to_json(wb.Sheets['Loans']).map((r,i)=>({id:r.ID??i+1,borrower:r.Borrower??'',amount:+r.Amount||0,collateral:+r.Collateral||0,rate:r.Interest?+r.Interest:0,months:r.Months?+r.Months:0,date:r.Date??'',note:r.Note??'',status:r.Status??'active'}));
  if(wb.SheetNames.includes('History'))
    state.history = window.XLSX.utils.sheet_to_json(wb.Sheets['History']).map((r,i)=>({
      id:i+1, monthKey:r['Month Key']??'', monthName:r['Month Name']??'Unknown', archivedAt:r['Archived At']??'',
      incomes: JSON.parse(r['Incomes JSON']??'[]'), expenses: JSON.parse(r['Expenses JSON']??'[]'), assets: JSON.parse(r['Assets JSON']??'[]')
    }));
}

export function buildWB() {
  const wb = window.XLSX.utils.book_new();
  const mkSheet = (hdr, rows, cols) => { const ws=window.XLSX.utils.aoa_to_sheet([hdr,...rows]); ws['!cols']=cols; return ws; };
  window.XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Name','Amount','Date','Note'], state.incomes.map(r=>[r.id,r.name,r.amount,r.date,r.note]), [{wch:5},{wch:24},{wch:14},{wch:14},{wch:28}]), 'Incomes');
  window.XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Name','Category','Amount','Date','Note'], state.expenses.map(r=>[r.id,r.name,r.category,r.amount,r.date,r.note]), [{wch:5},{wch:24},{wch:20},{wch:14},{wch:14},{wch:28}]), 'Expenses');
  window.XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Type','Name','Category','Value','Date','Note'], state.assets.map(r=>[r.id,r.type,r.name,r.category,r.value,r.date,r.note]), [{wch:5},{wch:10},{wch:26},{wch:20},{wch:14},{wch:14},{wch:28}]), 'Assets');
  window.XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Borrower','Amount','Collateral','Interest','Months','Date','Note','Status'], state.loans.map(r=>[r.id,r.borrower,r.amount,r.collateral,r.rate,r.months,r.date,r.note,r.status]), [{wch:5},{wch:24},{wch:14},{wch:14},{wch:10},{wch:8},{wch:14},{wch:28},{wch:12}]), 'Loans');

  const historyRows = state.history.map((h, i) => [i+1, h.monthKey, h.monthName, h.archivedAt, JSON.stringify(h.incomes), JSON.stringify(h.expenses), JSON.stringify(h.assets)]);
  window.XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Month Key','Month Name','Archived At','Incomes JSON','Expenses JSON','Assets JSON'], historyRows, [{wch:7},{wch:24},{wch:20},{wch:24},{wch:60},{wch:60},{wch:60}]), 'History');

  const {ti,te,surplus} = calcs();
  const {ta,tl,nw,dta}  = nwCalcs();
  const sum = [['Key','Value'],['Monthly Income',ti],['Monthly Expenses',te],['Net Surplus',surplus],['Savings Rate %',ti?Math.round((surplus/ti)*100):0],['',''],['Total Assets',ta],['Total Liabilities',tl],['Net Worth',nw],['Debt/Asset %',dta],['Last Updated',new Date().toLocaleString()]];
  const sWS = window.XLSX.utils.aoa_to_sheet(sum); sWS['!cols']=[{wch:22},{wch:18}];
  window.XLSX.utils.book_append_sheet(wb, sWS, 'Summary');
  return wb;
}

export async function saveToExcel() {
  const buf = window.XLSX.write(buildWB(), {type:'array',bookType:'xlsx'});
  if(state.folderHandle) {
    try {
      const fh = await state.folderHandle.getFileHandle('moneydash.xlsx',{create:true});
      const w  = await fh.createWritable();
      await w.write(new Blob([buf],{type:'application/octet-stream'}));
      await w.close();
      markClean();
      dispatchToast('💾 Saved to '+state.folderHandle.name+'/moneydash.xlsx');
      return;
    } catch(e){ console.warn(e); }
  }
  dlBlob(buf,'moneydash.xlsx'); 
  markClean(); 
  dispatchToast('💾 Downloaded moneydash.xlsx');
}

export function exportExcel() { 
  const buf=window.XLSX.write(buildWB(),{type:'array',bookType:'xlsx'}); 
  dlBlob(buf,'moneydash.xlsx'); 
  dispatchToast('📥 Downloading…'); 
}

function dlBlob(buf,name) { 
  const a=document.createElement('a'); 
  a.href=URL.createObjectURL(new Blob([buf],{type:'application/octet-stream'})); 
  a.download=name; 
  a.click(); 
  setTimeout(()=>URL.revokeObjectURL(a.href),1000); 
}

// HISTORY LOGIC
export function getMonthKey(dateStr) { return (dateStr ? new Date(dateStr) : new Date()).toISOString().slice(0,7); }
export function getMonthName(monthKey) { const [year, month] = monthKey.split('-').map(Number); return new Date(year, month-1).toLocaleString('default', { month: 'long', year: 'numeric' }); }
export function getArchivedAt() { return new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export function loadHistoryFromStorage() {
  try {
    const saved = localStorage.getItem('moneydash_history');
    if (saved) state.history = JSON.parse(saved);
  } catch (e) {
    state.history = [];
  }
}

export function archiveCurrentMonth() {
  if (state.incomes.length === 0 && state.expenses.length === 0 && state.assets.length === 0 && state.loans.length === 0) {
    dispatchToast('No data to archive', true); return;
  }
  const monthKey = getMonthKey(td());
  const archiveData = {
    monthKey: monthKey, monthName: getMonthName(monthKey), archivedAt: getArchivedAt(),
    incomes: JSON.parse(JSON.stringify(state.incomes)), expenses: JSON.parse(JSON.stringify(state.expenses)),
    assets: JSON.parse(JSON.stringify(state.assets)), loans: JSON.parse(JSON.stringify(state.loans))
  };
  const existingIdx = state.history.findIndex(h => h.monthKey === monthKey);
  if (existingIdx >= 0) {
    if (!confirm('This month is already archived. Replace it?')) return;
    state.history[existingIdx] = archiveData;
  } else {
    state.history.unshift(archiveData);
  }
  localStorage.setItem('moneydash_history', JSON.stringify(state.history));
  dispatchToast('✅ Month archived! Ready for new month.');
  dispatchRender();

  setTimeout(() => {
    if (confirm('Month archived. Would you like to reset your current month data now?')) resetDashboard();
  }, 500);
}

export function resetDashboard() {
  if (!confirm('Are you sure? This will clear all current data.')) return;
  state.incomes = []; state.expenses = []; state.assets = []; state.loans = [];
  markDirty();
  dispatchRender();
  dispatchToast('🔄 Dashboard reset for new month');
  window.dispatchEvent(new CustomEvent('app-nav', { detail: 0 })); // Go to Overview
}

export function restoreMonth(monthKey) {
  const archive = state.history.find(h => h.monthKey === monthKey);
  if (!archive) return;
  if (!confirm(`Restore data from ${archive.monthName}? This will replace current month data.`)) return;
  state.incomes = JSON.parse(JSON.stringify(archive.incomes));
  state.expenses = JSON.parse(JSON.stringify(archive.expenses));
  state.assets = JSON.parse(JSON.stringify(archive.assets));
  state.loans = JSON.parse(JSON.stringify(archive.loans));
  markDirty();
  localStorage.setItem('moneydash_history', JSON.stringify(state.history));
  dispatchRender();
  dispatchToast(`✅ Restored data from ${archive.monthName}`);
  window.dispatchEvent(new CustomEvent('app-nav', { detail: 0 }));
}

export function deleteMonth(monthKey) {
  if (!confirm('Delete this month from history? This cannot be undone.')) return;
  state.history = state.history.filter(h => h.monthKey !== monthKey);
  localStorage.setItem('moneydash_history', JSON.stringify(state.history));
  dispatchRender();
  dispatchToast('🗑️ History entry deleted');
}

export function initStorage() {
  const saved = localStorage.getItem(state.LS_KEY);
  if (saved) {
    document.getElementById('folder-display').textContent = '📁 ' + saved;
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2-continue').classList.remove('hidden');
    document.querySelectorAll('.setup-step').forEach(s=>s.classList.remove('active'));
    document.getElementById('step-file').classList.add('active');
  }
}
