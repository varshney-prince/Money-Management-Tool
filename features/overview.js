// features/overview.js
import { state, CONSTANTS } from '../core/state.js';
import { fmt, calcs, empty } from '../core/utils.js';
import { dispatchToast } from '../core/storage.js';

export function renderOverview() {
  const c = calcs();
  
  // overview cards
  document.getElementById('ov-inc').textContent = fmt(c.ti);
  document.getElementById('ov-exp').textContent = fmt(c.te);
  document.getElementById('ov-day').textContent = fmt(c.daily);
  document.getElementById('ov-sur').textContent = fmt(c.surplus);
  document.getElementById('ov-sur').style.color = c.surplus >= 0 ? '#34d399' : '#fb7185';
  document.getElementById('ov-rate').textContent = c.rate + '%';
  document.getElementById('ov-msg').textContent = c.rate >= 50 ? '🎉 Excellent!' : c.rate >= 30 ? '👍 On track' : '⚠️ Save more';

  // savings ring
  const circ = 289, off = circ - (circ * Math.min(c.rate, 100) / 100);
  document.getElementById('ring-circle').style.strokeDashoffset = off;
  document.getElementById('ring-circle').style.stroke = c.rate >= 50 ? '#10b981' : c.rate >= 25 ? '#fbbf24' : '#f43f5e';

  // analysis cards
  document.getElementById('an-day').textContent = fmt(c.daily);
  document.getElementById('an-proj').textContent = fmt(c.surplus * 6);
  document.getElementById('an-sur').textContent = fmt(c.surplus);
  document.getElementById('an-sur').style.color = c.surplus >= 0 ? '#34d399' : '#fb7185';

  renderRecent();
  renderPies();
  renderTrend();
}

function renderRecent() {
  const all = [
    ...state.incomes.map(i => ({ type: 'income', name: i.name, amount: i.amount, date: i.date, sub: '' })),
    ...state.expenses.map(e => ({ type: 'expense', name: e.name, amount: e.amount, date: e.date, sub: e.category })),
    ...state.loans.map(l => ({ type: 'loan', name: l.borrower, amount: l.amount, date: l.date, sub: 'Loan' }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  document.getElementById('recent').innerHTML = all.map((r, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i < all.length - 1 ? 'border-bottom:1px solid #27272a' : ''}">
      <div style="display:flex;gap:11px;align-items:center;">
        <div style="width:30px;height:30px;border-radius:9999px;background:${r.type === 'income' ? 'rgba(52,211,153,.1)' : r.type === 'expense' ? 'rgba(251,113,133,.1)' : 'rgba(251,191,36,.1)'};display:flex;align-items:center;justify-content:center;color:${r.type === 'income' ? '#34d399' : r.type === 'expense' ? '#fb7185' : '#fbbf24'};font-size:14px;">${r.type === 'income' ? '↑' : r.type === 'expense' ? '↓' : '💸'}</div>
        <div><div style="font-weight:500;font-size:13px;">${r.name}</div><div style="font-size:11px;color:#a1a1aa;">${r.date}${r.sub ? ' · ' + r.sub : ''}</div></div>
      </div>
      <div style="font-weight:600;font-size:13px;color:${r.type === 'income' ? '#34d399' : r.type === 'expense' ? '#fb7185' : '#fbbf24'};">${r.type === 'income' ? '+' : r.type === 'expense' ? '-' : '💸'}${fmt(r.amount)}</div>
    </div>`).join('') || empty('No activity yet');
}

function renderPies() {
  const pie = (id, labels, data, colors, inst) => { 
    if (inst) { inst.destroy(); inst = null; } 
    if (!data.length) return null;
    return new window.Chart(document.getElementById(id), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, data.length), borderWidth: 7, borderColor: '#18181b' }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 13, font: { size: 11 }, boxWidth: 11 } } } }
    });
  };
  state.charts.iPie = pie('incPie', state.incomes.map(i => i.name), state.incomes.map(i => i.amount), CONSTANTS.IC, state.charts.iPie);
  state.charts.ePie = pie('expPie', state.expenses.map(e => e.category), state.expenses.map(e => e.amount), CONSTANTS.EC, state.charts.ePie);
}

function renderTrend() {
  const ctx = document.getElementById('trendChart'); 
  if(!ctx) return;
  if(state.charts.trendCh) { state.charts.trendCh.destroy(); state.charts.trendCh = null; }
  const {ti,te} = calcs();
  const mo = ['Feb','Mar','Apr','May','Jun','Jul']; // Demo labels
  state.charts.trendCh = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: mo,
      datasets: [
        { label: 'Income', data: mo.map((_,i) => Math.round(ti*(0.88+i*.025))), borderColor: '#10b981', borderWidth: 3, tension: .4, pointRadius: 3, pointBackgroundColor: '#10b981' },
        { label: 'Expenses', data: mo.map((_,i) => Math.round(te*(1.05-i*.01))), borderColor: '#f43f5e', borderWidth: 3, tension: .4, pointRadius: 3, pointBackgroundColor: '#f43f5e' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#d1d5db', font: { size: 12 } } } },
      scales: { y: { grid: { color: '#27272a' }, ticks: { color: '#71717a' } }, x: { grid: { color: '#27272a' }, ticks: { color: '#71717a' } } }
    }
  });
}
