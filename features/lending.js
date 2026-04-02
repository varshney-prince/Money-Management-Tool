// features/lending.js
import { state, CONSTANTS, markDirty } from '../core/state.js';
import { td, nid, fmt, empty } from '../core/utils.js';
import { dispatchToast, dispatchRender } from '../core/storage.js';

export function runLendSim() {
  const p = parseFloat(document.getElementById('l-amt').value) || 0;
  const r = parseFloat(document.getElementById('l-rate').value) || 0;
  const t = parseInt(document.getElementById('l-mo').value, 10) || 0;
  
  if (!p || !t) { document.getElementById('l-sim-res').innerHTML = ''; return; }
  
  const mRate = r / 12 / 100;
  let emi = 0, tot = p;
  
  if (r > 0) {
    emi = p * mRate * Math.pow(1 + mRate, t) / (Math.pow(1 + mRate, t) - 1);
    tot = emi * t;
  } else {
    emi = p / t;
  }
  
  document.getElementById('l-sim-res').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px dashed #3f3f46;">
      <div style="color:#a1a1aa;font-size:12px;">Monthly EMI: <span style="color:#fff;font-weight:600;">${fmt(emi)}</span></div>
      <div style="color:#a1a1aa;font-size:12px;">Total Return: <span style="color:#34d399;font-weight:600;">${fmt(tot)}</span></div>
    </div>`;
}

export function addLoan() {
  const br = document.getElementById('l-name').value.trim();
  const amt = parseFloat(document.getElementById('l-amt').value);
  const col = parseFloat(document.getElementById('l-col').value) || 0;
  const rt = parseFloat(document.getElementById('l-rate').value) || 0;
  const mo = parseInt(document.getElementById('l-mo').value, 10) || 0;
  const dt = document.getElementById('l-date').value || td();
  const nt = document.getElementById('l-note').value.trim();
  
  if (!br || !amt) { dispatchToast('Borrower name & amount are required', true); return; }
  
  state.loans.push({ id: nid(state.loans), borrower: br, amount: amt, collateral: col, rate: rt, months: mo, date: dt, note: nt, status: 'active' });
  ['l-name', 'l-amt', 'l-col', 'l-rate', 'l-mo', 'l-note'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('l-sim-res').innerHTML = '';
  
  markDirty();
  dispatchRender();
  dispatchToast('✅ Loan record added!');
  window.dispatchEvent(new CustomEvent('app-confetti'));
  window.dispatchEvent(new CustomEvent('app-close-modal', { detail: 'lend' }));
}

export function settleLoan(id) {
  if (!confirm('Mark this loan as fully paid/settled?')) return;
  const l = state.loans.find(x => x.id === id);
  if (l) l.status = 'settled';
  markDirty();
  dispatchRender();
  dispatchToast('Loan marked as settled');
}

export function delLoan(id) {
  if (!confirm('Delete this record?')) return;
  state.loans = state.loans.filter(x => x.id !== id);
  markDirty();
  dispatchRender();
  dispatchToast('Record deleted');
}

export function renderLending() {
  const calcEMI = (p, r, t) => {
    if (!p || !t) return 0;
    if (r === 0) return p / t;
    const mRate = r / 12 / 100;
    return p * mRate * Math.pow(1 + mRate, t) / (Math.pow(1 + mRate, t) - 1);
  };
  
  const card = (l) => {
    const emi = calcEMI(l.amount, l.rate, l.months);
    const cr = l.amount ? Math.round(l.collateral / l.amount * 100) : 0;
    const isAct = l.status !== 'settled';
    
    return `
      <div style="background:#27272a;border-radius:14px;padding:18px;position:relative;overflow:hidden;border-left:4px solid ${isAct ? '#3b82f6' : '#10b981'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <div style="font-weight:600;font-size:15px;color:${isAct ? '#fff' : '#a1a1aa'};text-decoration:${isAct ? 'none' : 'line-through'};">${l.borrower}</div>
            <div style="font-size:12px;color:#a1a1aa;margin-top:3px;">${l.date}${l.note ? ' · ' + l.note : ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;font-size:18px;color:${isAct ? '#3b82f6' : '#10b981'};">${fmt(l.amount)}</div>
            <div style="background:${isAct ? 'rgba(59,130,246,.1)' : 'rgba(16,185,129,.1)'};color:${isAct ? '#60a5fa' : '#34d399'};padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;display:inline-block;margin-top:4px;text-transform:uppercase;">${l.status}</div>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;background:#18181b;padding:12px;border-radius:10px;margin-bottom:14px;">
          <div><div style="color:#71717a;font-size:11px;margin-bottom:2px;">Interest Rate</div><div style="font-size:13px;font-weight:500;">${l.rate}% p.a.</div></div>
          <div><div style="color:#71717a;font-size:11px;margin-bottom:2px;">Duration</div><div style="font-size:13px;font-weight:500;">${l.months} mo</div></div>
          <div><div style="color:#71717a;font-size:11px;margin-bottom:2px;">Monthly EMI</div><div style="font-size:13px;font-weight:500;color:#facc15;">${fmt(Math.round(emi))}</div></div>
        </div>
        
        <div style="display:flex;justify-content:space-between;align-items:center;background:#18181b;padding:12px;border-radius:10px;margin-bottom:14px;">
          <div>
            <div style="color:#71717a;font-size:11px;margin-bottom:4px;">Collateral Value</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:14px;font-weight:600;color:${cr >= 100 ? '#34d399' : cr >= 50 ? '#fbbf24' : '#fb7185'}">${fmt(l.collateral)}</span>
              <span style="font-size:11px;color:#a1a1aa;">(${cr}%)</span>
            </div>
          </div>
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:18px;">
            ${cr >= 100 ? '🛡️' : '⚠️'}
          </div>
        </div>
        
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          ${isAct ? `<button class="btn-settle-loan btn btn-v" data-id="${l.id}" style="font-size:12px;padding:6px 14px;"><i class="fa-solid fa-check"></i> Settle</button>` : ''}
          <button class="btn-del-loan" data-id="${l.id}" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:13px;padding:6px;"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  };

  const act = state.loans.filter(l => l.status !== 'settled').sort((a, b) => b.id - a.id);
  const set = state.loans.filter(l => l.status === 'settled').sort((a, b) => b.id - a.id);

  let html = '';
  if (act.length) { html += `<h3 style="font-size:13px;font-weight:600;color:#3b82f6;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em;">Active Loans</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:24px;">${act.map(card).join('')}</div>`; }
  if (set.length) { html += `<h3 style="font-size:13px;font-weight:600;color:#10b981;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em;">Settled</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">${set.map(card).join('')}</div>`; }
  
  document.getElementById('lend-list').innerHTML = html || empty('No lending records yet. Click "Create Record" to track money lent to others.');

  document.querySelectorAll('.btn-settle-loan').forEach(btn => {
    btn.addEventListener('click', e => settleLoan(parseInt(e.currentTarget.getAttribute('data-id'), 10)));
  });
  document.querySelectorAll('.btn-del-loan').forEach(btn => {
    btn.addEventListener('click', e => delLoan(parseInt(e.currentTarget.getAttribute('data-id'), 10)));
  });
}
