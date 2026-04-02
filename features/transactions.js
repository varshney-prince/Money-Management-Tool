// features/transactions.js
import { state, markDirty } from '../core/state.js';
import { td, nid, fmt, empty } from '../core/utils.js';
import { dispatchToast, dispatchRender } from '../core/storage.js';

export function addEntry(type) {
  if (type === 'income') {
    const name = document.getElementById('i-name').value.trim();
    const amt = parseFloat(document.getElementById('i-amt').value);
    const date = document.getElementById('i-date').value || td();
    const note = document.getElementById('i-note').value.trim();
    if (!name || !amt) { dispatchToast('Please fill name and amount', true); return; }
    state.incomes.push({ id: nid(state.incomes), name, amount: amt, date, note });
    ['i-name','i-amt','i-note'].forEach(id => document.getElementById(id).value = '');
    markDirty();
    dispatchRender();
    dispatchToast('✅ Income added!');
    window.dispatchEvent(new CustomEvent('app-confetti'));
    window.dispatchEvent(new CustomEvent('app-close-modal', { detail: 'income' }));
  } else {
    const name = document.getElementById('e-name').value.trim();
    const cat = document.getElementById('e-cat').value;
    const amt = parseFloat(document.getElementById('e-amt').value);
    const date = document.getElementById('e-date').value || td();
    const note = document.getElementById('e-note').value.trim();
    if (!name || !amt) { dispatchToast('Please fill name and amount', true); return; }
    state.expenses.push({ id: nid(state.expenses), name, category: cat, amount: amt, date, note });
    ['e-name','e-amt','e-note'].forEach(id => document.getElementById(id).value = '');
    markDirty();
    dispatchRender();
    dispatchToast('✅ Expense added!');
    window.dispatchEvent(new CustomEvent('app-close-modal', { detail: 'expense' }));
  }
}

export function delEntry(type, id) {
  if (!confirm('Delete this entry?')) return;
  if (type === 'income') {
    state.incomes = state.incomes.filter(r => r.id !== id);
  } else {
    state.expenses = state.expenses.filter(r => r.id !== id);
  }
  markDirty();
  dispatchRender();
  dispatchToast('Deleted');
}

export function renderLists() {
  const card = (bg, amt, colr, item, delAttr) => `
    <div style="background:#27272a;border-radius:14px;padding:18px;display:flex;justify-content:space-between;align-items:center;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:500;font-size:14px;">${item.name}</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:3px;">${item.date||''}${item.note ? ' · ' + item.note : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;font-weight:700;color:${colr};">${fmt(amt)}</div>
        <button class="btn-del-entry" data-type="${delAttr.type}" data-id="${delAttr.id}" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:14px;padding:4px;"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;

  document.getElementById('inc-list').innerHTML = state.incomes.map(i => card('#27272a', i.amount, '#34d399', i, { type: 'income', id: i.id })).join('') || empty('No income entries yet');
  document.getElementById('exp-list').innerHTML = state.expenses.map(e => card('#27272a', e.amount, '#fb7185', { name: e.name, date: e.date, note: e.category }, { type: 'expense', id: e.id })).join('') || empty('No expense entries yet');

  // Re-attach delete listeners
  document.querySelectorAll('.btn-del-entry').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-type');
      const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      delEntry(type, id);
    });
  });
}
