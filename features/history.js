// features/history.js
import { state } from '../core/state.js';
import { fmt } from '../core/utils.js';
import { deleteMonth, restoreMonth } from '../core/storage.js';

export function renderHistory() {
  const container = document.getElementById('history-container');
  const emptyMsg = document.getElementById('history-empty');

  if (!state.history.length) {
    if (container) container.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }

  if (emptyMsg) emptyMsg.classList.add('hidden');

  container.innerHTML = state.history.map(archive => {
    const totalInc = archive.incomes.reduce((s, i) => s + i.amount, 0);
    const totalExp = archive.expenses.reduce((s, e) => s + e.amount, 0);
    const assets = archive.assets.filter(a => a.type === 'asset').reduce((s, a) => s + a.value, 0);
    const liabs = archive.assets.filter(a => a.type === 'liability').reduce((s, a) => s + a.value, 0);

    return `
      <div class="h-month">
        <div class="h-month-header" data-monthkey="${archive.monthKey}">
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
              <div class="h-record"><span class="h-record-name">${i.name}</span><span class="h-record-amt inc">${fmt(i.amount)}</span></div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No income entries</div>'}
          </div>

          <!-- Expense entries -->
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#fb7185;margin-bottom:8px;">Expenses (${archive.expenses.length})</div>
            ${archive.expenses.length ? archive.expenses.map(e => `
              <div class="h-record"><span class="h-record-name">${e.name} <span style="color:#a1a1aa">(${e.category})</span></span><span class="h-record-amt exp">${fmt(e.amount)}</span></div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No expense entries</div>'}
          </div>

          <!-- Asset entries -->
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#6366f1;margin-bottom:8px;">Assets & Liabilities (${archive.assets.length})</div>
            ${archive.assets.length ? archive.assets.map(a => `
              <div class="h-record"><span class="h-record-name">${a.name} <span style="color:#a1a1aa">(${a.category})</span></span><span class="h-record-amt ${a.type === 'asset' ? 'asset' : 'liab'}">${a.type === 'asset' ? '+' : '-'}${fmt(a.value)}</span></div>
            `).join('') : '<div style="font-size:12px;color:#52525b;padding:8px;">No asset entries</div>'}
          </div>

          <!-- Archive info -->
          <div style="background:#09090b;border-radius:8px;padding:10px;margin-bottom:10px;font-size:11px;color:#a1a1aa;">
            <i class="fa-solid fa-calendar-days"></i> Archived on: ${archive.archivedAt}
          </div>

          <!-- Action buttons -->
          <div class="h-btn-row">
            <button class="btn btn-v btn-hist-restore" data-id="${archive.monthKey}" style="flex:1;justify-content:center;">
              <i class="fa-solid fa-rotate-left"></i> Restore
            </button>
            <button class="btn btn-r btn-hist-delete" data-id="${archive.monthKey}" style="flex:1;justify-content:center;">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.h-month-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const monthKey = e.currentTarget.getAttribute('data-monthkey');
      const body = document.getElementById('hbody-' + monthKey);
      if (body) {
        body.classList.toggle('open');
        const icon = e.currentTarget.querySelector('i.fa-chevron-down');
        icon.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });

  document.querySelectorAll('.btn-hist-restore').forEach(btn => {
    btn.addEventListener('click', (e) => restoreMonth(e.currentTarget.getAttribute('data-id')));
  });
  
  document.querySelectorAll('.btn-hist-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deleteMonth(e.currentTarget.getAttribute('data-id')));
  });
}
