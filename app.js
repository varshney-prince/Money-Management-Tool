// app.js (Orchestrator)
import { state, CONSTANTS } from './core/state.js';
import { td, fmt } from './core/utils.js';
import { dispatchToast, dispatchRender, pickFolder, importExcel, createNew, saveToExcel, exportExcel, archiveCurrentMonth, initStorage } from './core/storage.js';
import { addEntry } from './features/transactions.js';
import { setAT, addAsset, nwToggle, runSim } from './features/netWorth.js';
import { addLoan, runLendSim } from './features/lending.js';
import { openModal, closeModal, initModals, toast, confetti } from './ui/modals.js';
import { sw, initNavigation } from './ui/navigation.js';

window.onload = () => {
  // Bind setup
  document.getElementById('btn-pick-folder').addEventListener('click', pickFolder);
  document.getElementById('xlsx-import').addEventListener('change', (e) => importExcel(e.target.files[0]));
  document.getElementById('btn-create-new').addEventListener('click', createNew);
  document.getElementById('btn-step2-back').addEventListener('click', () => {
    document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-folder').classList.add('active');
  });
  const btnStep2Continue = document.getElementById('btn-step2-continue');
  if (btnStep2Continue) {
    btnStep2Continue.addEventListener('click', () => {
      document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
      document.getElementById('step-file').classList.add('active');
    });
  }

  // Bind Sidebar
  for (let i=0; i<=7; i++) {
    const nav = document.getElementById('nav-'+i);
    if(nav) nav.addEventListener('click', () => sw(i));
  }
  document.getElementById('btn-save-excel').addEventListener('click', saveToExcel);
  document.getElementById('btn-export-excel').addEventListener('click', exportExcel);
  document.getElementById('btn-reset').addEventListener('click', () => {
    if(!confirm('Reset session and change folder?')) return;
    localStorage.removeItem(state.LS_KEY);
    location.reload();
  });

  // Bind Modals & Overlays
  document.getElementById('btn-add-income').addEventListener('click', () => openModal('income'));
  document.getElementById('btn-add-expense').addEventListener('click', () => openModal('expense'));
  document.getElementById('btn-add-asset').addEventListener('click', () => { setAT('asset'); openModal('asset'); });
  document.getElementById('btn-add-loan').addEventListener('click', () => openModal('lend'));
  const btnAddAsset2 = document.getElementById('btn-add-asset-2');
  if(btnAddAsset2) btnAddAsset2.addEventListener('click', () => { setAT('asset'); openModal('asset'); });
  
  // Modals interactions
  document.getElementById('i-submit').addEventListener('click', () => addEntry('income'));
  document.getElementById('e-submit').addEventListener('click', () => addEntry('expense'));
  document.getElementById('a-submit').addEventListener('click', () => addAsset());
  document.getElementById('l-submit').addEventListener('click', () => addLoan());
  
  document.getElementById('btn-close-income').addEventListener('click', () => closeModal('income'));
  document.getElementById('btn-close-expense').addEventListener('click', () => closeModal('expense'));
  document.getElementById('btn-close-asset').addEventListener('click', () => closeModal('asset'));
  document.getElementById('btn-close-lend').addEventListener('click', () => closeModal('lend'));

  // Bind specific interactions
  document.getElementById('at-a').addEventListener('click', () => setAT('asset'));
  document.getElementById('at-l').addEventListener('click', () => setAT('liability'));
  document.getElementById('nwt-a').addEventListener('click', () => nwToggle('a'));
  document.getElementById('nwt-l').addEventListener('click', () => nwToggle('l'));
  
  // Overview NW Card
  const btnOvNw = document.getElementById('btn-ov-nw');
  if(btnOvNw) btnOvNw.addEventListener('click', () => sw(5));
  
  const nwSearch = document.getElementById('nw-search');
  if(nwSearch) nwSearch.addEventListener('input', () => dispatchRender());

  document.getElementById('sim-type').addEventListener('change', runSim);
  document.getElementById('sim-amt').addEventListener('input', runSim);
  document.getElementById('sim-yrs').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('sim-yrlbl').textContent = val + ' year' + (val > 1 ? 's' : '');
    runSim();
  });
  document.getElementById('btn-run-sim').addEventListener('click', runSim);
  document.getElementById('sim-sip').addEventListener('input', runSim);

  // Lending simulations
  ['l-amt', 'l-rate', 'l-mo'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', runLendSim);
  });
  
  const lendSearch = document.getElementById('lend-search');
  if(lendSearch) lendSearch.addEventListener('input', () => {
    import('./features/lending.js').then(m => m.renderLending());
  });

  // History button
  const btnArchive = document.getElementById('btn-archive');
  if(btnArchive) btnArchive.addEventListener('click', archiveCurrentMonth);

  // Cross-component events
  window.addEventListener('app-toast', e => toast(e.detail.msg, e.detail.err));
  window.addEventListener('app-confetti', () => confetti());

  // Input Dates
  ['i-date','e-date','a-date','l-date'].forEach(id => {
    const e = document.getElementById(id);
    if(e) e.value = td();
  });

  // Init
  initModals();
  initNavigation();
  initStorage();
};
