// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  CONSTANTS & STATE
// ══════════════════════════════════════════════════════════
const LS_KEY = 'moneydash_folder';
let incomes=[], expenses=[], assets=[], loans=[];
let folderHandle=null, unsaved=false;
let nwView='a'; // 'a'=assets 'l'=liabilities
let currentAT='asset';
let history=[]; // Array of {monthKey, monthName, archivedAt, incomes, expenses, assets}

// chart instances
let iPie=null, ePie=null, aPie=null, lPie=null, trendCh=null, nwCh=null, simCh=null;

const IC = ['#10b981','#34d399','#4ade80','#a3e635','#06b6d4','#818cf8','#f472b6','#fbbf24'];
const EC = ['#f43f5e','#fb923c','#facc15','#a78bfa','#38bdf8','#fb7185','#e879f9','#34d399'];
const AC = ['#6366f1','#818cf8','#a78bfa','#c4b5fd','#34d399','#10b981','#fbbf24','#f59e0b','#38bdf8','#06b6d4'];
const LC = ['#f43f5e','#fb7185','#fb923c','#fca5a5','#e879f9','#fda4af'];

const ICONS = {
  'Cash & Savings':'🏦','Fixed Deposit':'📋','Stocks & Equity':'📈','Mutual Funds':'📊',
  'Gold & Precious':'🥇','Real Estate':'🏠','Vehicle':'🚗','EPF / PPF':'🛡️',
  'Crypto':'₿','Business':'🏢','Other Asset':'💼',
  'Home Loan':'🏠','Car Loan':'🚗','Personal Loan':'💸',
  'Credit Card':'💳','Education Loan':'🎓','Other Liability':'📌'
};
const ASSET_CATS = ['Cash & Savings','Fixed Deposit','Stocks & Equity','Mutual Funds','Gold & Precious','Real Estate','Vehicle','EPF / PPF','Crypto','Business','Other Asset'];
const LIAB_CATS  = ['Home Loan','Car Loan','Personal Loan','Credit Card','Education Loan','Other Liability'];
const LEND_ICONS = {
  'Personal':'👤','Business':'🏢','Education':'🎓','Medical':'🏥','Emergency':'🚨','Other':'💸'
};


// ══════════════════════════════════════════════════════════
// DATA & STORAGE
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  EXCEL  (SheetJS)
// ══════════════════════════════════════════════════════════
function parseXLSX(ab) {
  const wb = XLSX.read(ab, {type:'array'});
  if(wb.SheetNames.includes('Incomes'))
    incomes = XLSX.utils.sheet_to_json(wb.Sheets['Incomes']).map((r,i)=>({id:r.ID??i+1,name:r.Name??'',amount:+r.Amount||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Expenses'))
    expenses = XLSX.utils.sheet_to_json(wb.Sheets['Expenses']).map((r,i)=>({id:r.ID??i+1,name:r.Name??'',category:r.Category??'Other',amount:+r.Amount||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Assets'))
    assets = XLSX.utils.sheet_to_json(wb.Sheets['Assets']).map((r,i)=>({id:r.ID??i+1,type:r.Type??'asset',name:r.Name??'',category:r.Category??'Other Asset',value:+r.Value||0,date:r.Date??'',note:r.Note??''}));
  if(wb.SheetNames.includes('Loans'))
    loans = XLSX.utils.sheet_to_json(wb.Sheets['Loans']).map((r,i)=>({id:r.ID??i+1,borrower:r.Borrower??'',amount:+r.Amount||0,collateral:+r.Collateral||0,rate:r.Interest?+r.Interest:0,months:r.Months?+r.Months:0,date:r.Date??'',note:r.Note??'',status:r.Status??'active'}));
  if(wb.SheetNames.includes('History'))
    history = XLSX.utils.sheet_to_json(wb.Sheets['History']).map((r,i)=>({
      id:i+1,
      monthKey:r['Month Key']??'',
      monthName:r['Month Name']??'Unknown',
      archivedAt:r['Archived At']??'',
      incomes: JSON.parse(r['Incomes JSON']??'[]'),
      expenses: JSON.parse(r['Expenses JSON']??'[]'),
      assets: JSON.parse(r['Assets JSON']??'[]')
    }));
}

function buildWB() {
  const wb = XLSX.utils.book_new();
  const mkSheet = (hdr, rows, cols) => { const ws=XLSX.utils.aoa_to_sheet([hdr,...rows]); ws['!cols']=cols; return ws; };
  XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Name','Amount','Date','Note'], incomes.map(r=>[r.id,r.name,r.amount,r.date,r.note]), [{wch:5},{wch:24},{wch:14},{wch:14},{wch:28}]), 'Incomes');
  XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Name','Category','Amount','Date','Note'], expenses.map(r=>[r.id,r.name,r.category,r.amount,r.date,r.note]), [{wch:5},{wch:24},{wch:20},{wch:14},{wch:14},{wch:28}]), 'Expenses');
  XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Type','Name','Category','Value','Date','Note'], assets.map(r=>[r.id,r.type,r.name,r.category,r.value,r.date,r.note]), [{wch:5},{wch:10},{wch:26},{wch:20},{wch:14},{wch:14},{wch:28}]), 'Assets');
  XLSX.utils.book_append_sheet(wb, mkSheet(['ID','Borrower','Amount','Collateral','Interest','Months','Date','Note','Status'], loans.map(r=>[r.id,r.borrower,r.amount,r.collateral,r.rate,r.months,r.date,r.note,r.status]), [{wch:5},{wch:24},{wch:14},{wch:14},{wch:10},{wch:8},{wch:14},{wch:28},{wch:12}]), 'Loans');

  // History
  const historyRows = history.map((h, i) => [
    i+1,
    h.monthKey,
    h.monthName,
    h.archivedAt,
    JSON.stringify(h.incomes),
    JSON.stringify(h.expenses),
    JSON.stringify(h.assets)
  ]);
  XLSX.utils.book_append_sheet(wb, mkSheet(
    ['ID','Month Key','Month Name','Archived At','Incomes JSON','Expenses JSON','Assets JSON'],
    historyRows,
    [{wch:7},{wch:24},{wch:20},{wch:24},{wch:60},{wch:60},{wch:60}]
  ), 'History');

  // Summary
  const {ti,te,surplus} = calcs();
  const {ta,tl,nw,dta}  = nwCalcs();
  const sum = [['Key','Value'],['Monthly Income',ti],['Monthly Expenses',te],['Net Surplus',surplus],['Savings Rate %',ti?Math.round((surplus/ti)*100):0],['',''],['Total Assets',ta],['Total Liabilities',tl],['Net Worth',nw],['Debt/Asset %',dta],['Last Updated',new Date().toLocaleString()]];
  const sWS = XLSX.utils.aoa_to_sheet(sum); sWS['!cols']=[{wch:22},{wch:18}];
  XLSX.utils.book_append_sheet(wb, sWS, 'Summary');
  return wb;
}

async function saveToExcel() {
  const buf = XLSX.write(buildWB(), {type:'array',bookType:'xlsx'});
  if(folderHandle) {
    try {
      const fh = await folderHandle.getFileHandle('moneydash.xlsx',{create:true});
      const w  = await fh.createWritable();
      await w.write(new Blob([buf],{type:'application/octet-stream'}));
      await w.close();
      markClean();
      toast('💾 Saved to '+folderHandle.name+'/moneydash.xlsx');
      return;
    } catch(e){ console.warn(e); }
  }
  dlBlob(buf,'moneydash.xlsx'); markClean(); toast('💾 Downloaded moneydash.xlsx');
}

function exportExcel() { const buf=XLSX.write(buildWB(),{type:'array',bookType:'xlsx'}); dlBlob(buf,'moneydash.xlsx'); toast('📥 Downloading…'); }
function dlBlob(buf,name) { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([buf],{type:'application/octet-stream'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }


// ══════════════════════════════════════════════════════════
//  HISTORY FUNCTIONS
// ══════════════════════════════════════════════════════════
function getMonthKey(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toISOString().slice(0,7); // YYYY-MM
}

function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month-1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getArchivedAt() {
  return new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function archiveCurrentMonth() {
  if (incomes.length === 0 && expenses.length === 0 && assets.length === 0 && loans.length === 0) {
    toast('No data to archive', true);
    return;
  }

  const monthKey = getMonthKey(td());
  const monthName = getMonthName(monthKey);

  // Deep copy data to preserve it
  const archiveData = {
    monthKey: monthKey,
    monthName: monthName,
    archivedAt: getArchivedAt(),
    incomes: JSON.parse(JSON.stringify(incomes)),
    expenses: JSON.parse(JSON.stringify(expenses)),
    assets: JSON.parse(JSON.stringify(assets)),
    loans: JSON.parse(JSON.stringify(loans))
  };

  // Check if already archived this month
  const existingIdx = history.findIndex(h => h.monthKey === monthKey);
  if (existingIdx >= 0) {
    if (!confirm('This month is already archived. Replace it?')) return;
    history[existingIdx] = archiveData;
  } else {
    history.unshift(archiveData);
  }

  // Save history to localStorage
  localStorage.setItem('moneydash_history', JSON.stringify(history));

  toast('✅ Month archived! Ready for new month.');
  renderHistory();

  // Show reset confirmation
  setTimeout(() => {
    if (confirm('Month archived. Would you like to reset your current month data now?')) {
      resetDashboard();
    }
  }, 500);
}

function resetDashboard() {
  if (!confirm('Are you sure? This will clear all current data.')) return;

  // Clear current month data
  incomes = [];
  expenses = [];
  assets = [];
  loans = [];

  markDirty();
  renderAll();
  renderNW();
  renderHistory();
  renderLending();
  toast('🔄 Dashboard reset for new month');
  sw(0); // Go to Overview
}

function restoreMonth(monthKey) {
  const archive = history.find(h => h.monthKey === monthKey);
  if (!archive) return;

  if (!confirm(`Restore data from ${archive.monthName}? This will replace current month data.`)) return;

  incomes = JSON.parse(JSON.stringify(archive.incomes));
  expenses = JSON.parse(JSON.stringify(archive.expenses));
  assets = JSON.parse(JSON.stringify(archive.assets));
  loans = JSON.parse(JSON.stringify(archive.loans));

  markDirty();
  localStorage.setItem('moneydash_history', JSON.stringify(history));
  renderAll();
  renderNW();
  renderHistory();
  renderLending();
  toast(`✅ Restored data from ${archive.monthName}`);
  sw(0);
}

function deleteMonth(monthKey) {
  if (!confirm('Delete this month from history? This cannot be undone.')) return;

  history = history.filter(h => h.monthKey !== monthKey);
  localStorage.setItem('moneydash_history', JSON.stringify(history));
  renderHistory();
  toast('🗑️ History entry deleted');
}

function loadHistoryFromStorage() {
  try {
    const saved = localStorage.getItem('moneydash_history');
    if (saved) {
      history = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load history:', e);
    history = [];
  }
}


// ══════════════════════════════════════════════════════════
//  SIMULATOR
// ══════════════════════════════════════════════════════════
function runSim() {
  const rate=parseFloat(document.getElementById('sim-type').value);
  const amt =parseFloat(document.getElementById('sim-amt').value)||50000;
  const yrs =parseInt(document.getElementById('sim-yrs').value);
  const sip =parseFloat(document.getElementById('sim-sip').value)||0;

  // Future value with SIP: FV = P*(1+r)^n + SIP*[((1+r)^n - 1)/r]
  const r=rate, n=yrs;
  const fvLump = amt*Math.pow(1+r,n);
  const fvSip  = sip>0 ? sip*(Math.pow(1+r,n)-1)/r : 0;
  const fv=Math.round(fvLump+fvSip);
  const totalInvested=Math.round(amt+sip*12*n);

  document.getElementById('sim-fv').textContent  = fmt(fv);
  document.getElementById('sim-inv').textContent = fmt(totalInvested);
  document.getElementById('sim-grw').textContent = fmt(fv-totalInvested);
  document.getElementById('sim-result').classList.remove('hidden');

  if(simCh){simCh.destroy();simCh=null;}
  const labs=[], vals=[];
  for(let i=0;i<=n;i++){
    labs.push(i+'yr');
    const v=amt*Math.pow(1+r,i)+(sip>0?sip*(Math.pow(1+r,i)-1)/r:0);
    vals.push(Math.round(v));
  }
  simCh=new Chart(document.getElementById('simChart'),{type:'line',data:{labels:labs,datasets:[{data:vals,borderColor:'#34d399',borderWidth:3,tension:.35,pointRadius:0,fill:true,backgroundColor:'rgba(52,211,153,.07)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#27272a'},ticks:{color:'#a3a3a3'}},x:{grid:{color:'#27272a'},ticks:{color:'#a3a3a3'}}}}});
}


// ══════════════════════════════════════════════════════════
//  CRUD — INCOME / EXPENSE
// ══════════════════════════════════════════════════════════
function addEntry(type) {
  if(type==='income'){
    const name=document.getElementById('i-name').value.trim(), amt=parseFloat(document.getElementById('i-amt').value);
    const date=document.getElementById('i-date').value||td(), note=document.getElementById('i-note').value.trim();
    if(!name||!amt){ toast('Please fill name and amount',true); return; }
    incomes.push({id:nid(incomes),name,amount:amt,date,note});
    ['i-name','i-amt','i-note'].forEach(id=>document.getElementById(id).value='');
    closeModal('income'); markDirty(); renderAll(); toast('✅ Income added!'); confetti();
  } else {
    const name=document.getElementById('e-name').value.trim(), cat=document.getElementById('e-cat').value;
    const amt=parseFloat(document.getElementById('e-amt').value);
    const date=document.getElementById('e-date').value||td(), note=document.getElementById('e-note').value.trim();
    if(!name||!amt){ toast('Please fill name and amount',true); return; }
    expenses.push({id:nid(expenses),name,category:cat,amount:amt,date,note});
    ['e-name','e-amt','e-note'].forEach(id=>document.getElementById(id).value='');
    closeModal('expense'); markDirty(); renderAll(); toast('✅ Expense added!');
  }
}

function delEntry(type,id) {
  if(!confirm('Delete this entry?')) return;
  if(type==='income') incomes=incomes.filter(r=>r.id!==id);
  else expenses=expenses.filter(r=>r.id!==id);
  markDirty(); renderAll(); toast('Deleted');
}


// ══════════════════════════════════════════════════════════
//  CRUD — ASSETS
// ══════════════════════════════════════════════════════════
function setAT(t) {
  currentAT=t;
  const isA=t==='asset';
  document.getElementById('at-a').style.background=isA?'#6366f1':'transparent';
  document.getElementById('at-a').style.color=isA?'#fff':'#a1a1aa';
  document.getElementById('at-l').style.background=!isA?'#e11d48':'transparent';
  document.getElementById('at-l').style.color=!isA?'#fff':'#a1a1aa';
  document.getElementById('a-submit').style.background=isA?'#6366f1':'#e11d48';
  document.getElementById('a-submit').textContent=isA?'Add Asset':'Add Liability';
  // repopulate categories
  const cats=isA?ASSET_CATS:LIAB_CATS;
  document.getElementById('a-cat').innerHTML=cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function addAsset() {
  const name=document.getElementById('a-name').value.trim(), cat=document.getElementById('a-cat').value;
  const val=parseFloat(document.getElementById('a-val').value);
  const date=document.getElementById('a-date').value||td(), note=document.getElementById('a-note').value.trim();
  if(!name||!val){ toast('Please fill name and value',true); return; }
  assets.push({id:nid(assets),type:currentAT,name,category:cat,value:val,date,note});
  ['a-name','a-val','a-note'].forEach(id=>document.getElementById(id).value='');
  closeModal('asset'); markDirty(); renderAll(); renderNW();
  toast(currentAT==='asset'?'✅ Asset added!':'✅ Liability added!');
  if(currentAT==='asset') confetti();
}

function delAsset(id) {
  if(!confirm('Delete this entry?')) return;
  assets=assets.filter(a=>a.id!==id);
  markDirty(); renderNW(); toast('Deleted');
}


// ══════════════════════════════════════════════════════════
//  LENDING FUNCTIONS
// ══════════════════════════════════════════════════════════
function addLoan() {
  const borrower=document.getElementById('l-borrower').value.trim();
  const amount=parseFloat(document.getElementById('l-amt').value);
  const collateral=parseFloat(document.getElementById('l-collat').value);
  const rate=parseFloat(document.getElementById('l-rate').value)||0;
  const months=parseInt(document.getElementById('l-months').value)||0;
  const date=document.getElementById('l-date').value||td();
  const note=document.getElementById('l-note').value.trim();

  // Validation
  const errorEl=document.getElementById('lend-error');
  errorEl.style.display='none';

  if(!borrower||!amount||!collateral) {
    showError('Please fill borrower name, loan amount, and collateral value');
    return;
  }

  if(amount>=collateral) {
    showError('Loan amount must be less than collateral value');
    return;
  }

  if(amount<=0||collateral<=0) {
    showError('Amount and collateral must be positive');
    return;
  }

  if(rate<0||months<0) {
    showError('Interest rate and months cannot be negative');
    return;
  }

  const loan={
    id:nid(loans),
    borrower,
    amount,
    collateral,
    rate,
    months,
    date,
    note,
    status:'active'
  };

  loans.push(loan);
  closeModal('lend');
  markDirty();
  renderLending();
  renderNW();
  toast('✅ Loan created!');
  confetti();
}

function showError(msg) {
  const el=document.getElementById('lend-error');
  el.textContent=msg;
  el.style.display='block';
}

function delLoan(id) {
  if(!confirm('Delete this loan record?')) return;
  loans=loans.filter(l=>l.id!==id);
  markDirty();
  renderLending();
  toast('🗑️ Loan deleted');
}

function repayLoan(id) {
  const loan=loans.find(l=>l.id===id);
  if(!loan) return;

  if(!confirm(`Mark loan to ${loan.borrower} as repaid?`)) return;

  loan.status='repaid';
  markDirty();
  renderLending();
  toast('✅ Loan marked as repaid!');
}

function renderLending() {
  const q=(document.getElementById('lend-search')?.value||'').toLowerCase();
  const items=loans.filter(l=>(!q||l.borrower.toLowerCase().includes(q)));

  if(!document.getElementById('lend-list')) return;

  const totalLoaned=items.reduce((s,l)=>s+l.amount,0);
  const totalCollateral=items.reduce((s,l)=>s+l.collateral,0);
  const estInterest=items.reduce((s,l)=>s+(l.amount*l.rate*l.months/100),0);
  const activeCount=items.filter(l=>l.status==='active').length;

  if(document.getElementById('lend-total-loaned')) document.getElementById('lend-total-loaned').textContent=fmt(totalLoaned);
  if(document.getElementById('lend-total-collateral')) document.getElementById('lend-total-collateral').textContent=fmt(totalCollateral);
  if(document.getElementById('lend-est-interest')) document.getElementById('lend-est-interest').textContent=fmt(estInterest);
  if(document.getElementById('lend-active-count')) document.getElementById('lend-active-count').textContent=activeCount;
  if(document.getElementById('lend-loan-count')) document.getElementById('lend-loan-count').textContent=items.length+' active loan'+(items.length!==1?'s':'');

  const row=(item)=>`
    <div style="background:#27272a;border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px;transition:background .2s;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:12px;background:rgba(251,191,36,.15);display:flex;align-items:center;justify-content:center;font-size:18px;">
            ${LEND_ICONS[item.note?.includes('Business')?'Business':item.note?.includes('Education')?'Education':item.note?.includes('Medical')?'Medical':'Personal']||'👤'}
          </div>
          <div>
            <div style="font-weight:600;font-size:15px;color:#fff;">${item.borrower}</div>
            <div style="font-size:11px;color:#a1a1aa;">${item.date}${item.note?' · '+item.note:''}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;font-size:20px;color:#34d399;">${fmt(item.amount)}</div>
          <div style="font-size:11px;color:#a1a1aa;">${item.status==='active'?'Active':'Repaid'}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;background:#09090b;border-radius:10px;padding:12px;">
        <div>
          <div style="font-size:10px;color:#6ee7b7;">Collateral</div>
          <div style="font-weight:600;color:#fff;">${fmt(item.collateral)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#fbbf24;">Interest Rate</div>
          <div style="font-weight:600;color:#fff;">${item.rate>0?item.rate+'%':'0%'}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#818cf8;">Timeline</div>
          <div style="font-weight:600;color:#fff;">${item.months>0?item.months+' months':'No deadline'}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;">
        ${item.status==='active'
          ?`<button onclick="repayLoan(${item.id})" class="btn btn-g" style="flex:1;justify-content:center;font-size:12px;padding:8px;">
              <i class="fa-solid fa-check"></i> Repaid
            </button>`
          :`<button onclick="repayLoan(${item.id})" class="btn btn-z" style="flex:1;justify-content:center;font-size:12px;padding:8px;background:rgba(52,211,153,.2);color:#34d399;">
              <i class="fa-solid fa-check"></i> Repaid
            </button>`}
        <button onclick="delLoan(${item.id})" class="btn btn-r" style="flex:1;justify-content:center;font-size:12px;padding:8px;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>`;

  document.getElementById('lend-list').innerHTML=items.length?items.map(row).join(''):empty('No loans yet. Click "New Loan" to create one.');
}


// ══════════════════════════════════════════════════════════
// UI & DOM
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  SETUP FLOW
// ══════════════════════════════════════════════════════════
window.onload = () => {
  const t = td();
  ['i-date','e-date','a-date','l-date'].forEach(id => document.getElementById(id).value = t);
  setAT('asset');
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    document.getElementById('folder-display').textContent = '📁 ' + saved;
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2').classList.remove('hidden');
    goStep(2);
  }
};

async function pickFolder() {
  if (!('showDirectoryPicker' in window)) {
    localStorage.setItem(LS_KEY, 'Downloads (auto)');
    document.getElementById('folder-display').textContent = 'Downloads folder (files will download automatically)';
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2').classList.remove('hidden');
    document.getElementById('fsa-warn').classList.remove('hidden');
    return;
  }
  try {
    folderHandle = await window.showDirectoryPicker({ mode:'readwrite' });
    localStorage.setItem(LS_KEY, folderHandle.name);
    document.getElementById('folder-display').textContent = '📁 ' + folderHandle.name;
    document.getElementById('folder-chosen').classList.remove('hidden');
    document.getElementById('btn-step2').classList.remove('hidden');
    // try to auto-load existing file
    try {
      const fh   = await folderHandle.getFileHandle('moneydash.xlsx');
      const file = await fh.getFile();
      const ab   = await file.arrayBuffer();
      parseXLSX(ab);
      document.getElementById('fname').textContent = 'moneydash.xlsx';
      launch();
      toast('📂 Loaded moneydash.xlsx from folder!');
    } catch { goStep(2); }
  } catch(e) { if(e.name!=='AbortError') toast('Could not access folder',true); }
}

function goStep(n) {
  document.querySelectorAll('.setup-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+(n===1?'folder':'file')).classList.add('active');
}

function importExcel(evt) {
  const file = evt.target.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e => { parseXLSX(e.target.result); document.getElementById('fname').textContent=file.name; launch(); toast('✅ File imported!'); };
  r.readAsArrayBuffer(file);
}

function createNew() {
  incomes  = [{id:1,name:'Salary',amount:120000,date:td(),note:'Main job'},{id:2,name:'Freelance',amount:45000,date:td(),note:''},{id:3,name:'Dividends',amount:20000,date:td(),note:''}];
  expenses = [{id:1,name:'Rent',category:'Rent',amount:25000,date:td(),note:''},{id:2,name:'Groceries',category:'Food & Groceries',amount:12000,date:td(),note:''},{id:3,name:'Fuel',category:'Transport',amount:8500,date:td(),note:''},{id:4,name:'Electricity',category:'Utilities',amount:4800,date:td(),note:''},{id:5,name:'Netflix',category:'Entertainment',amount:950,date:td(),note:''}];
  assets = [
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
  loans = [
    {id:1,borrower:'Rahul Sharma',amount:50000,collateral:75000,rate:12,months:6,date:td(),note:'Personal loan - car repair',status:'active'},
    {id:2,borrower:'Priya Patel',amount:100000,collateral:150000,rate:10,months:12,date:td(),note:'Education loan',status:'active'},
  ];
  history = []; // Clear history
  localStorage.removeItem('moneydash_history');
  document.getElementById('fname').textContent = 'moneydash.xlsx (new)';
  markDirty();
  launch();
  renderHistory();
  toast('✨ New database created!');
  confetti();
}

function launch() {
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').style.display = 'flex';
  loadHistoryFromStorage(); // Load history from localStorage
  renderAll();
  renderHistory(); // Render history view
  renderLending(); // Render lending view
}


// ══════════════════════════════════════════════════════════
//  RENDER — OVERVIEW + SHARED
// ══════════════════════════════════════════════════════════

// --- RENDER LOGIC ---
function renderAll() {
  const c=calcs(), nw=nwCalcs();

  // overview cards
  document.getElementById('ov-inc').textContent = fmt(c.ti);
  document.getElementById('ov-exp').textContent = fmt(c.te);
  document.getElementById('ov-day').textContent = fmt(c.daily);
  document.getElementById('ov-sur').textContent = fmt(c.surplus);
  document.getElementById('ov-sur').style.color = c.surplus>=0?'#34d399':'#fb7185';
  document.getElementById('ov-rate').textContent= c.rate+'%';
  document.getElementById('ov-msg').textContent  = c.rate>=50?'🎉 Excellent!':c.rate>=30?'👍 On track':'⚠️ Save more';

  // savings ring
  const circ=289, off=circ-(circ*Math.min(c.rate,100)/100);
  document.getElementById('ring-circle').style.strokeDashoffset=off;
  document.getElementById('ring-circle').style.stroke=c.rate>=50?'#10b981':c.rate>=25?'#fbbf24':'#f43f5e';

  // net worth on overview
  document.getElementById('ov-nw').textContent  = (nw.nw<0?'-':'')+fmt(Math.abs(nw.nw));
  document.getElementById('ov-nw').style.color  = nw.nw>=0?'#fff':'#fb7185';
  document.getElementById('ov-nwsub').textContent=`Assets ${fmt(nw.ta)} · Liabilities ${fmt(nw.tl)}`;

  // analysis cards
  document.getElementById('an-day').textContent  = fmt(c.daily);
  document.getElementById('an-proj').textContent = fmt(c.surplus*6);
  document.getElementById('an-sur').textContent  = fmt(c.surplus);
  document.getElementById('an-sur').style.color  = c.surplus>=0?'#34d399':'#fb7185';

  renderLists();
  renderRecent();
  renderPies();
}

function renderLists() {
  const card=(bg,amt,colr,item,del)=>`
    <div style="background:#27272a;border-radius:14px;padding:18px;display:flex;justify-content:space-between;align-items:center;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:500;font-size:14px;">${item.name}</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:3px;">${item.date||''}${item.note?' · '+item.note:''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;font-weight:700;color:${colr};">${fmt(amt)}</div>
        <button onclick="${del}" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:14px;padding:4px;"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;

  document.getElementById('inc-list').innerHTML = incomes.map(i=>card('#27272a',i.amount,'#34d399',i,`delEntry('income',${i.id})`)).join('')||empty('No income entries yet');
  document.getElementById('exp-list').innerHTML = expenses.map(e=>card('#27272a',e.amount,'#fb7185',{name:e.name,date:e.date,note:e.category},`delEntry('expense',${e.id})`)).join('')||empty('No expense entries yet');
}

function renderRecent() {
  const all=[...incomes.map(i=>({type:'income',name:i.name,amount:i.amount,date:i.date,sub:''})),...expenses.map(e=>({type:'expense',name:e.name,amount:e.amount,date:e.date,sub:e.category})),...loans.map(l=>({type:'loan',name:l.borrower,amount:l.amount,date:l.date,sub:'Loan'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  document.getElementById('recent').innerHTML=all.map((r,i)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i<all.length-1?'border-bottom:1px solid #27272a':''}">
      <div style="display:flex;gap:11px;align-items:center;">
        <div style="width:30px;height:30px;border-radius:9999px;background:${r.type==='income'?'rgba(52,211,153,.1)':r.type==='expense'?'rgba(251,113,133,.1)':'rgba(251,191,36,.1)'};display:flex;align-items:center;justify-content:center;color:${r.type==='income'?'#34d399':r.type==='expense'?'#fb7185':'#fbbf24'};font-size:14px;">${r.type==='income'?'↑':r.type==='expense'?'↓':'💸'}</div>
        <div><div style="font-weight:500;font-size:13px;">${r.name}</div><div style="font-size:11px;color:#a1a1aa;">${r.date}${r.sub?' · '+r.sub:''}</div></div>
      </div>
      <div style="font-weight:600;font-size:13px;color:${r.type==='income'?'#34d399':r.type==='expense'?'#fb7185':'#fbbf24'};">${r.type==='income'?'+':r.type==='expense'?'-':'💸'}${fmt(r.amount)}</div>
    </div>`).join('')||empty('No activity yet');
}

function renderPies() {
  const pie=(id,labels,data,colors,inst)=>{ if(inst){inst.destroy();inst=null;} if(!data.length) return null;
    return new Chart(document.getElementById(id),{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors.slice(0,data.length),borderWidth:7,borderColor:'#18181b'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{position:'bottom',labels:{color:'#a1a1aa',padding:13,font:{size:11},boxWidth:11}}}}});};
  iPie=pie('incPie',incomes.map(i=>i.name),incomes.map(i=>i.amount),IC,iPie);
  ePie=pie('expPie',expenses.map(e=>e.category),expenses.map(e=>e.amount),EC,ePie);
}

function empty(msg){ return `<div style="color:#52525b;text-align:center;padding:32px;font-size:13px;">${msg}</div>`; }


// ══════════════════════════════════════════════════════════
//  RENDER — HISTORY
// ══════════════════════════════════════════════════════════
function renderHistory() {
  const container = document.getElementById('history-container');
  const emptyMsg = document.getElementById('history-empty');

  if (!history.length) {
    if (container) container.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');

  container.innerHTML = history.map(archive => {
    const totalInc = archive.incomes.reduce((s, i) => s + i.amount, 0);
    const totalExp = archive.expenses.reduce((s, e) => s + e.amount, 0);
    const assets = archive.assets.filter(a => a.type === 'asset').reduce((s, a) => s + a.value, 0);
    const liabs = archive.assets.filter(a => a.type === 'liability').reduce((s, a) => s + a.value, 0);

    return `
      <div class="h-month">
        <div class="h-month-header" onclick="toggleHistoryMonth('${archive.monthKey}', this)">
          <div class="h-month-title">
            ${archive.monthName}
            <span class="h-archived-label">Archived</span>
          </div>
          <div class="h-month-counts">
            <span style="color:#34d399;margin-right:12px;">Income: ${fmt(totalInc)}</span>
            <span style="color:#fb7185;margin-right:12px;">Expense: ${fmt(totalExp)}</span>
            <span style="color:#6366f1;">NW: ${fmt(assets - liabs)}</span>
          </div>
          <i class="fa-solid fa-chevron-down" style="color:#a1a1aa;transition:transform .2s;"></i>
        </div>
        <div class="h-month-body" id="hbody-${archive.monthKey}">
          <!-- Income entries -->
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#34d399;margin-bottom:8px;">Income Sources (${archive.incomes.length})</div>
            ${archive.incomes.length ? archive.incomes.map(i => `
              <div class="h-record">
                <span class="h-record-name">${i.name}</span>
                <span class="h-record-amt inc">${fmt(i.amount)}</span>
              </div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No income entries</div>'}
          </div>

          <!-- Expense entries -->
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#fb7185;margin-bottom:8px;">Expenses (${archive.expenses.length})</div>
            ${archive.expenses.length ? archive.expenses.map(e => `
              <div class="h-record">
                <span class="h-record-name">${e.name} <span style="color:#a1a1aa">(${e.category})</span></span>
                <span class="h-record-amt exp">${fmt(e.amount)}</span>
              </div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No expense entries</div>'}
          </div>

          <!-- Asset entries -->
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#6366f1;margin-bottom:8px;">Assets & Liabilities (${archive.assets.length})</div>
            ${archive.assets.length ? archive.assets.map(a => `
              <div class="h-record">
                <span class="h-record-name">${a.name} <span style="color:#a1a1aa">(${a.category})</span></span>
                <span class="h-record-amt ${a.type === 'asset' ? 'asset' : 'liab'}">${a.type === 'asset' ? '+' : '-'}${fmt(a.value)}</span>
              </div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No asset entries</div>'}
          </div>

          <!-- Archive info -->
          <div style="background:#09090b;border-radius:8px;padding:10px;margin-bottom:10px;font-size:11px;color:#a1a1aa;">
            <i class="fa-solid fa-calendar-days"></i> Archived on: ${archive.archivedAt}
          </div>

          <!-- Action buttons -->
          <div class="h-btn-row">
            <button onclick="restoreMonth('${archive.monthKey}')" class="btn btn-v" style="flex:1;justify-content:center;">
              <i class="fa-solid fa-rotate-left"></i> Restore
            </button>
            <button onclick="deleteMonth('${archive.monthKey}')" class="btn btn-r" style="flex:1;justify-content:center;">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleHistoryMonth(monthKey, header) {
  const body = document.getElementById('hbody-' + monthKey);
  if (body) {
    body.classList.toggle('open');
    const icon = header.querySelector('i.fa-chevron-down');
    if (body.classList.contains('open')) {
      icon.style.transform = 'rotate(180deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  }
}


// ══════════════════════════════════════════════════════════
//  RENDER — TREND
// ══════════════════════════════════════════════════════════
function renderTrend() {
  const ctx=document.getElementById('trendChart'); if(!ctx) return;
  if(trendCh){trendCh.destroy();trendCh=null;}
  const {ti,te}=calcs();
  const mo=['Feb','Mar','Apr','May','Jun','Jul'];
  trendCh=new Chart(ctx,{type:'line',data:{labels:mo,datasets:[
    {label:'Income',  data:mo.map((_,i)=>Math.round(ti*(0.88+i*.025))),borderColor:'#10b981',borderWidth:3,tension:.4,pointRadius:3,pointBackgroundColor:'#10b981'},
    {label:'Expenses',data:mo.map((_,i)=>Math.round(te*(1.05-i*.01))), borderColor:'#f43f5e',borderWidth:3,tension:.4,pointRadius:3,pointBackgroundColor:'#f43f5e'},
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#d1d5db',font:{size:12}}}},scales:{y:{grid:{color:'#27272a'},ticks:{color:'#71717a'}},x:{grid:{color:'#27272a'},ticks:{color:'#71717a'}}}}});
}


// ══════════════════════════════════════════════════════════
//  RENDER — NET WORTH
// ══════════════════════════════════════════════════════════
function renderNW() {
  const nw=nwCalcs(), {surplus}=calcs();

  document.getElementById('nw-ta').textContent    = fmt(nw.ta);
  document.getElementById('nw-tl').textContent    = fmt(nw.tl);
  document.getElementById('nw-tot').textContent   = (nw.nw<0?'-':'')+fmt(Math.abs(nw.nw));
  document.getElementById('nw-tot').style.color   = nw.nw>=0?'#fff':'#fb7185';
  document.getElementById('nw-ta-count').textContent = nw.aItems.length+' asset'+(nw.aItems.length!==1?'s':'');
  document.getElementById('nw-tl-count').textContent = nw.lItems.length+' liabilit'+(nw.lItems.length!==1?'ies':'y');
  document.getElementById('nw-dta').textContent   = 'Debt/Asset: '+nw.dta+'%';
  document.getElementById('nw-dta').style.color   = nw.dta<30?'#34d399':nw.dta<60?'#fbbf24':'#fb7185';

  // Health score
  const sc=nw.score;
  document.getElementById('nw-score').textContent = sc+'/100';
  document.getElementById('nw-score').style.color = sc>=70?'#34d399':sc>=45?'#fbbf24':'#fb7185';
  document.getElementById('nw-health').textContent= sc>=70?'✅ Healthy finances':sc>=45?'⚠️ Room to improve':'🚨 Needs attention';

  // bar
  const pct=nw.ta>0?Math.max(5,Math.min(95,Math.round((nw.ta-nw.tl)/nw.ta*100))):50;
  document.getElementById('nw-bar').style.width=pct+'%';

  // quick cards
  document.getElementById('nw-liq').textContent = fmt(nw.liq);
  document.getElementById('nw-inv').textContent = fmt(nw.inv);
  document.getElementById('nw-phy').textContent = fmt(nw.phy);

  // goal: how many months to double NW
  if(surplus>0 && nw.nw>0) {
    const mo=Math.ceil(nw.nw/surplus);
    document.getElementById('nw-goal').textContent = mo>240?'240+ mo':(mo+'mo to 2×');
  } else { document.getElementById('nw-goal').textContent='—'; }

  renderAssetPie();
  renderLiabPie();
  renderCatList();
  renderNWTrend();
  renderFullList();
}

function renderAssetPie() {
  if(aPie){aPie.destroy();aPie=null;}
  const items=assets.filter(a=>a.type==='asset'); if(!items.length) return;
  const map={}; items.forEach(a=>{ map[a.category]=(map[a.category]||0)+a.value; });
  const labs=Object.keys(map), vals=Object.values(map);
  aPie=new Chart(document.getElementById('assetPie'),{type:'doughnut',data:{labels:labs,datasets:[{data:vals,backgroundColor:AC.slice(0,labs.length),borderWidth:7,borderColor:'#18181b'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#a1a1aa',padding:12,font:{size:11},boxWidth:11}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${fmt(ctx.raw)} (${Math.round(ctx.raw/vals.reduce((a,b)=>a+b,0)*100)}%)`}}}}});
}

function renderLiabPie() {
  if(lPie){lPie.destroy();lPie=null;}
  const items=assets.filter(a=>a.type==='liability'); if(!items.length) return;
  const map={}; items.forEach(a=>{ map[a.category]=(map[a.category]||0)+a.value; });
  const labs=Object.keys(map), vals=Object.values(map);
  lPie=new Chart(document.getElementById('liabPie'),{type:'doughnut',data:{labels:labs,datasets:[{data:vals,backgroundColor:LC.slice(0,labs.length),borderWidth:7,borderColor:'#18181b'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#a1a1aa',padding:12,font:{size:11},boxWidth:11}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${fmt(ctx.raw)} (${Math.round(ctx.raw/vals.reduce((a,b)=>a+b,0)*100)}%)`}}}}});
}

function renderCatList() {
  const items=assets.filter(a=>a.type===(nwView==='a'?'asset':'liability'));
  const total=items.reduce((s,a)=>s+a.value,0);
  const map={}; items.forEach(a=>{ map[a.category]=(map[a.category]||0)+a.value; });
  const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]);
  const colors=nwView==='a'?AC:LC;
  document.getElementById('nw-catlist').innerHTML=sorted.map(([cat,val],i)=>{
    const pct=total?Math.round(val/total*100):0;
    return `<div style="margin-bottom:13px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <div style="display:flex;gap:7px;align-items:center;"><span style="font-size:16px;">${ICONS[cat]||'💼'}</span><span style="font-size:13px;font-weight:500;">${cat}</span></div>
        <div><span style="font-weight:600;font-size:13px;">${fmt(val)}</span><span style="color:#a1a1aa;font-size:11px;margin-left:6px;">${pct}%</span></div>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%;background:${colors[i%colors.length]};"></div></div>
    </div>`;
  }).join('')||empty('No '+(nwView==='a'?'assets':'liabilities')+' added yet');
}

function renderNWTrend() {
  if(nwCh){nwCh.destroy();nwCh=null;}
  const ctx=document.getElementById('nwTrend'); if(!ctx) return;
  const {ta,tl,nw}=nwCalcs(), {surplus}=calcs();
  const labels=[], nwData=[], aData=[], lData=[];
  const base=new Date();
  for(let i=0;i<=24;i++){
    const d=new Date(base.getFullYear(),base.getMonth()+i,1);
    labels.push(d.toLocaleString('default',{month:'short',year:'2-digit'}));
    const projA=ta+surplus*i;
    const projL=Math.max(0,tl*(1-0.004*i));
    aData.push(Math.round(projA));
    lData.push(Math.round(projL));
    nwData.push(Math.round(projA-projL));
  }
  nwCh=new Chart(ctx,{type:'line',data:{labels,datasets:[
    {label:'Net Worth',  data:nwData,borderColor:'#818cf8',borderWidth:3,tension:.4,pointRadius:0,fill:true,backgroundColor:'rgba(129,140,248,.07)'},
    {label:'Assets',     data:aData, borderColor:'#34d399',borderWidth:2,tension:.4,pointRadius:0,borderDash:[5,4]},
    {label:'Liabilities',data:lData, borderColor:'#fb7185',borderWidth:2,tension:.4,pointRadius:0,borderDash:[5,4]},
  ]},options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{labels:{color:'#a1a1aa',font:{size:11},boxWidth:18}}},
    scales:{y:{grid:{color:'#27272a'},ticks:{color:'#71717a',callback:v=>v>=100000?(v/100000).toFixed(1)+'L':(v/1000).toFixed(0)+'K'}},x:{grid:{color:'#27272a'},ticks:{color:'#71717a'}}}}});
}

function renderFullList() {
  const q=(document.getElementById('nw-search')?.value||'').toLowerCase();
  const aItems=assets.filter(a=>a.type==='asset'    && (!q||a.name.toLowerCase().includes(q)||a.category.toLowerCase().includes(q))).sort((a,b)=>b.value-a.value);
  const lItems=assets.filter(a=>a.type==='liability' && (!q||a.name.toLowerCase().includes(q)||a.category.toLowerCase().includes(q))).sort((a,b)=>b.value-a.value);

  const row=(item,col)=>`
    <div class="a-row">
      <div class="a-icon" style="background:${item.type==='asset'?'rgba(99,102,241,.15)':'rgba(251,113,133,.15)'};">${ICONS[item.category]||'💼'}</div>
      <div style="flex:1;min-width:0;margin:0 12px;">
        <div style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:2px;">${item.category}${item.note?' · '+item.note:''} · ${item.date}</div>
      </div>
      <div style="font-weight:700;font-size:15px;color:${col};flex-shrink:0;">${fmt(item.value)}</div>
      <button onclick="delAsset(${item.id})" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:13px;padding:4px 8px;margin-left:6px;" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div>`;

  const sec=(title,items,col,tc)=>items.length?`
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:600;color:${tc};text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px;display:flex;align-items:center;gap:8px;">
        <span>${title}</span><span style="background:${tc}22;color:${tc};padding:2px 8px;border-radius:9999px;font-size:10px;">${fmt(items.reduce((s,a)=>s+a.value,0))}</span>
      </div>
      ${items.map(a=>row(a,col)).join('')}
    </div>`:'';

  document.getElementById('nw-fulllist').innerHTML=
    (aItems.length||lItems.length)?
      sec('Assets',aItems,'#34d399','#818cf8')+sec('Liabilities',lItems,'#fb7185','#fb7185')
    : empty('No assets or liabilities yet — click "+ Add" to get started.');
}

function nwToggle(v) {
  nwView=v;
  document.getElementById('nwt-a').classList.toggle('on',v==='a');
  document.getElementById('nwt-l').classList.toggle('on',v==='l');
  renderCatList();
}


// ══════════════════════════════════════════════════════════
//  NAV / MODAL / UTILS
// ══════════════════════════════════════════════════════════
const TABS=['Overview','Income','Expenses','Analysis','Simulator','Net Worth','History','Lending'];
function sw(n) {
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('nav-'+n).classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t=>{t.classList.remove('active');t.style.display='none';});
  const tab=document.getElementById('tab-'+n);
  tab.classList.add('active'); tab.style.display='block';
  document.getElementById('page-title').textContent=TABS[n];
  document.getElementById('btn-asset').classList.toggle('hidden',n!==5);
  if(n===3) setTimeout(renderTrend,80);
  if(n===5) setTimeout(renderNW,80);
  if(n===6) setTimeout(renderHistory,80);
  if(n===7) setTimeout(renderLending,80);
}

function openModal(t)  { document.getElementById('modal-'+t).style.display='flex'; }
function closeModal(t) { document.getElementById('modal-'+t).style.display='none'; }

let _tt;
function toast(msg,err=false) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='show'+(err?' err':'');
  clearTimeout(_tt); _tt=setTimeout(()=>{ el.className=err?'err':''; },2800);
}

function confetti() {
  const cols=['#10b981','#34d399','#a3e635','#06b6d4','#f59e0b','#818cf8'];
  for(let i=0;i<65;i++){
    const c=document.createElement('div'); c.className='confetti';
    c.style.cssText=`left:${Math.random()*100}vw;top:-8px;background:${cols[Math.random()*cols.length|0]};animation-delay:${Math.random()*1.2}s;border-radius:${Math.random()>.5?'50%':'2px'};`;
    document.body.appendChild(c); setTimeout(()=>c.remove(),4500);
  }
}

function confirmReset() {
  if(confirm('Clear session and choose a new file? (Current unsaved data will be lost)')) {
    localStorage.removeItem(LS_KEY); localStorage.removeItem('moneydash_history'); location.reload();
  }
}

window.addEventListener('beforeunload', e => {
  if(unsaved){ e.preventDefault(); e.returnValue='Unsaved changes — save before leaving?'; }
});

// ══════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
function td() { return new Date().toISOString().split('T')[0]; }
function nid(arr) { return arr.length ? Math.max(...arr.map(r=>r.id))+1 : 1; }
function fmt(n) { return '₹'+Math.abs(n).toLocaleString('en-IN'); }
function markDirty() { unsaved=true;  document.getElementById('udot').classList.remove('hidden'); }
function markClean() { unsaved=false; document.getElementById('udot').classList.add('hidden'); }

function calcs() {
  const ti=incomes.reduce((a,b)=>a+b.amount,0), te=expenses.reduce((a,b)=>a+b.amount,0);
  const surplus=ti-te;
  return {ti,te,surplus,daily:Math.max(0,Math.floor(surplus/30)),rate:ti?Math.round((surplus/ti)*100):0};
}

function nwCalcs() {
  const aItems=assets.filter(a=>a.type==='asset'),  lItems=assets.filter(a=>a.type==='liability');
  const ta=aItems.reduce((s,a)=>s+a.value,0),       tl=lItems.reduce((s,a)=>s+a.value,0);
  const nw=ta-tl, dta=ta?Math.round((tl/ta)*100):0;
  const liq = aItems.filter(a=>['Cash & Savings','Fixed Deposit'].includes(a.category)).reduce((s,a)=>s+a.value,0);
  const inv = aItems.filter(a=>['Stocks & Equity','Mutual Funds','Gold & Precious','Crypto','EPF / PPF'].includes(a.category)).reduce((s,a)=>s+a.value,0);
  const phy = aItems.filter(a=>['Real Estate','Vehicle','Business','Other Asset'].includes(a.category)).reduce((s,a)=>s+a.value,0);
  // Financial Health Score 0-100
  let score=50;
  if(dta<20) score+=20; else if(dta<40) score+=10; else if(dta>80) score-=20;
  const {rate}=calcs(); if(rate>=40) score+=15; else if(rate>=20) score+=7; else if(rate<0) score-=15;
  if(liq>0 && ta>0 && liq/ta>0.1) score+=10; else score-=5;
  if(inv>0 && ta>0 && inv/ta>0.2) score+=5;
  score=Math.max(0,Math.min(100,score));
  return {ta,tl,nw,dta,liq,inv,phy,score,aItems,lItems};
}

