// features/netWorth.js
import { state, CONSTANTS, markDirty } from '../core/state.js';
import { td, nid, fmt, calcs, nwCalcs, empty } from '../core/utils.js';
import { dispatchToast, dispatchRender } from '../core/storage.js';

export function runSim() {
  const rate = parseFloat(document.getElementById('sim-type').value);
  const amt = parseFloat(document.getElementById('sim-amt').value) || 50000;
  const yrs = parseInt(document.getElementById('sim-yrs').value, 10);
  const sip = parseFloat(document.getElementById('sim-sip').value) || 0;

  const r = rate, n = yrs;
  const fvLump = amt * Math.pow(1 + r, n);
  const fvSip = sip > 0 ? sip * (Math.pow(1 + r, n) - 1) / r : 0;
  const fv = Math.round(fvLump + fvSip);
  const totalInvested = Math.round(amt + sip * 12 * n);

  document.getElementById('sim-fv').textContent = fmt(fv);
  document.getElementById('sim-inv').textContent = fmt(totalInvested);
  document.getElementById('sim-grw').textContent = fmt(fv - totalInvested);
  document.getElementById('sim-result').classList.remove('hidden');

  if (state.charts.simCh) { state.charts.simCh.destroy(); state.charts.simCh = null; }
  const labs = [], vals = [];
  for (let i = 0; i <= n; i++) {
    labs.push(i + 'yr');
    const v = amt * Math.pow(1 + r, i) + (sip > 0 ? sip * (Math.pow(1 + r, i) - 1) / r : 0);
    vals.push(Math.round(v));
  }
  state.charts.simCh = new window.Chart(document.getElementById('simChart'), {
    type: 'line',
    data: { labels: labs, datasets: [{ data: vals, borderColor: '#34d399', borderWidth: 3, tension: .35, pointRadius: 0, fill: true, backgroundColor: 'rgba(52,211,153,.07)' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#27272a' }, ticks: { color: '#a3a3a3' } }, x: { grid: { color: '#27272a' }, ticks: { color: '#a3a3a3' } } } }
  });
}

export function setAT(t) {
  state.currentAT = t;
  const isA = t === 'asset';
  document.getElementById('at-a').style.background = isA ? '#6366f1' : 'transparent';
  document.getElementById('at-a').style.color = isA ? '#fff' : '#a1a1aa';
  document.getElementById('at-l').style.background = !isA ? '#e11d48' : 'transparent';
  document.getElementById('at-l').style.color = !isA ? '#fff' : '#a1a1aa';
  document.getElementById('a-submit').style.background = isA ? '#6366f1' : '#e11d48';
  document.getElementById('a-submit').textContent = isA ? 'Add Asset' : 'Add Liability';
  
  const cats = isA ? CONSTANTS.ASSET_CATS : CONSTANTS.LIAB_CATS;
  document.getElementById('a-cat').innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

export function addAsset() {
  const name = document.getElementById('a-name').value.trim();
  const cat = document.getElementById('a-cat').value;
  const val = parseFloat(document.getElementById('a-val').value);
  const date = document.getElementById('a-date').value || td();
  const note = document.getElementById('a-note').value.trim();
  
  if (!name || !val) { dispatchToast('Please fill name and value', true); return; }
  
  state.assets.push({ id: nid(state.assets), type: state.currentAT, name, category: cat, value: val, date, note });
  ['a-name', 'a-val', 'a-note'].forEach(id => document.getElementById(id).value = '');
  markDirty();
  dispatchRender();
  
  dispatchToast(state.currentAT === 'asset' ? '✅ Asset added!' : '✅ Liability added!');
  if (state.currentAT === 'asset') window.dispatchEvent(new CustomEvent('app-confetti'));
  window.dispatchEvent(new CustomEvent('app-close-modal', { detail: 'asset' }));
}

export function delAsset(id) {
  if (!confirm('Delete this entry?')) return;
  state.assets = state.assets.filter(a => a.id !== id);
  markDirty();
  dispatchRender();
  dispatchToast('Deleted');
}

export function nwToggle(v) {
  state.nwView = v;
  document.getElementById('nwt-a').classList.toggle('on', v === 'a');
  document.getElementById('nwt-l').classList.toggle('on', v === 'l');
  renderCatList();
}

export function renderNW() {
  const nw = nwCalcs(), { surplus } = calcs();

  document.getElementById('nw-ta').textContent = fmt(nw.ta);
  document.getElementById('nw-tl').textContent = fmt(nw.tl);
  document.getElementById('nw-tot').textContent = (nw.nw < 0 ? '-' : '') + fmt(Math.abs(nw.nw));
  document.getElementById('nw-tot').style.color = nw.nw >= 0 ? '#fff' : '#fb7185';
  document.getElementById('nw-ta-count').textContent = nw.aItems.length + ' asset' + (nw.aItems.length !== 1 ? 's' : '');
  document.getElementById('nw-tl-count').textContent = nw.lItems.length + ' liabilit' + (nw.lItems.length !== 1 ? 'ies' : 'y');
  document.getElementById('nw-dta').textContent = 'Debt/Asset: ' + nw.dta + '%';
  document.getElementById('nw-dta').style.color = nw.dta < 30 ? '#34d399' : nw.dta < 60 ? '#fbbf24' : '#fb7185';

  const sc = nw.score;
  document.getElementById('nw-score').textContent = sc + '/100';
  document.getElementById('nw-score').style.color = sc >= 70 ? '#34d399' : sc >= 45 ? '#fbbf24' : '#fb7185';
  document.getElementById('nw-health').textContent = sc >= 70 ? '✅ Healthy finances' : sc >= 45 ? '⚠️ Room to improve' : '🚨 Needs attention';

  const pct = nw.ta > 0 ? Math.max(5, Math.min(95, Math.round((nw.ta - nw.tl) / nw.ta * 100))) : 50;
  document.getElementById('nw-bar').style.width = pct + '%';

  document.getElementById('nw-liq').textContent = fmt(nw.liq);
  document.getElementById('nw-inv').textContent = fmt(nw.inv);
  document.getElementById('nw-phy').textContent = fmt(nw.phy);

  if (surplus > 0 && nw.nw > 0) {
    const mo = Math.ceil(nw.nw / surplus);
    document.getElementById('nw-goal').textContent = mo > 240 ? '240+ mo' : (mo + 'mo to 2×');
  } else { document.getElementById('nw-goal').textContent = '—'; }

  renderAssetPie();
  renderLiabPie();
  renderCatList();
  renderNWTrend();
  renderFullList();
}

export function renderAssetPie() {
  if (state.charts.aPie) { state.charts.aPie.destroy(); state.charts.aPie = null; }
  const items = state.assets.filter(a => a.type === 'asset'); 
  if (!items.length) return;
  const map = {}; items.forEach(a => { map[a.category] = (map[a.category] || 0) + a.value; });
  const labs = Object.keys(map), vals = Object.values(map);
  state.charts.aPie = new window.Chart(document.getElementById('assetPie'), {
    type: 'doughnut',
    data: { labels: labs, datasets: [{ data: vals, backgroundColor: CONSTANTS.AC.slice(0, labs.length), borderWidth: 7, borderColor: '#18181b' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 12, font: { size: 11 }, boxWidth: 11 } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)} (${Math.round(ctx.raw / vals.reduce((a, b) => a + b, 0) * 100)}%)` } } } }
  });
}

export function renderLiabPie() {
  if (state.charts.lPie) { state.charts.lPie.destroy(); state.charts.lPie = null; }
  const items = state.assets.filter(a => a.type === 'liability'); 
  if (!items.length) return;
  const map = {}; items.forEach(a => { map[a.category] = (map[a.category] || 0) + a.value; });
  const labs = Object.keys(map), vals = Object.values(map);
  state.charts.lPie = new window.Chart(document.getElementById('liabPie'), {
    type: 'doughnut',
    data: { labels: labs, datasets: [{ data: vals, backgroundColor: CONSTANTS.LC.slice(0, labs.length), borderWidth: 7, borderColor: '#18181b' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 12, font: { size: 11 }, boxWidth: 11 } }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmt(ctx.raw)} (${Math.round(ctx.raw / vals.reduce((a, b) => a + b, 0) * 100)}%)` } } } }
  });
}

export function renderCatList() {
  const items = state.assets.filter(a => a.type === (state.nwView === 'a' ? 'asset' : 'liability'));
  const total = items.reduce((s, a) => s + a.value, 0);
  const map = {}; items.forEach(a => { map[a.category] = (map[a.category] || 0) + a.value; });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const colors = state.nwView === 'a' ? CONSTANTS.AC : CONSTANTS.LC;
  
  document.getElementById('nw-catlist').innerHTML = sorted.map(([cat, val], i) => {
    const pct = total ? Math.round(val / total * 100) : 0;
    return `<div style="margin-bottom:13px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <div style="display:flex;gap:7px;align-items:center;"><span style="font-size:16px;">${CONSTANTS.ICONS[cat] || '💼'}</span><span style="font-size:13px;font-weight:500;">${cat}</span></div>
        <div><span style="font-weight:600;font-size:13px;">${fmt(val)}</span><span style="color:#a1a1aa;font-size:11px;margin-left:6px;">${pct}%</span></div>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%;background:${colors[i % colors.length]};"></div></div>
    </div>`;
  }).join('') || empty('No ' + (state.nwView === 'a' ? 'assets' : 'liabilities') + ' added yet');
}

export function renderNWTrend() {
  if (state.charts.nwCh) { state.charts.nwCh.destroy(); state.charts.nwCh = null; }
  const ctx = document.getElementById('nwTrend'); 
  if (!ctx) return;
  const { ta, tl } = nwCalcs(), { surplus } = calcs();
  const labels = [], nwData = [], aData = [], lData = [];
  const base = new Date();
  for (let i = 0; i <= 24; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    labels.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
    const projA = ta + surplus * i;
    const projL = Math.max(0, tl * (1 - 0.004 * i));
    aData.push(Math.round(projA));
    lData.push(Math.round(projL));
    nwData.push(Math.round(projA - projL));
  }
  state.charts.nwCh = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Net Worth', data: nwData, borderColor: '#818cf8', borderWidth: 3, tension: .4, pointRadius: 0, fill: true, backgroundColor: 'rgba(129,140,248,.07)' },
        { label: 'Assets', data: aData, borderColor: '#34d399', borderWidth: 2, tension: .4, pointRadius: 0, borderDash: [5, 4] },
        { label: 'Liabilities', data: lData, borderColor: '#fb7185', borderWidth: 2, tension: .4, pointRadius: 0, borderDash: [5, 4] },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#a1a1aa', font: { size: 11 }, boxWidth: 18 } } },
      scales: { y: { grid: { color: '#27272a' }, ticks: { color: '#71717a', callback: v => v >= 100000 ? (v / 100000).toFixed(1) + 'L' : (v / 1000).toFixed(0) + 'K' } }, x: { grid: { color: '#27272a' }, ticks: { color: '#71717a' } } }
    }
  });
}

export function renderFullList() {
  const q = (document.getElementById('nw-search')?.value || '').toLowerCase();
  const aItems = state.assets.filter(a => a.type === 'asset' && (!q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))).sort((a, b) => b.value - a.value);
  const lItems = state.assets.filter(a => a.type === 'liability' && (!q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))).sort((a, b) => b.value - a.value);

  const row = (item, col) => `
    <div class="a-row">
      <div class="a-icon" style="background:${item.type === 'asset' ? 'rgba(99,102,241,.15)' : 'rgba(251,113,133,.15)'};">${CONSTANTS.ICONS[item.category] || '💼'}</div>
      <div style="flex:1;min-width:0;margin:0 12px;">
        <div style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:2px;">${item.category}${item.note ? ' · ' + item.note : ''} · ${item.date}</div>
      </div>
      <div style="font-weight:700;font-size:15px;color:${col};flex-shrink:0;">${fmt(item.value)}</div>
      <button class="btn-del-asset" data-id="${item.id}" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:13px;padding:4px 8px;margin-left:6px;" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div>`;

  const sec = (title, items, col, tc) => items.length ? `
    <div style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:600;color:${tc};text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px;display:flex;align-items:center;gap:8px;">
        <span>${title}</span><span style="background:${tc}22;color:${tc};padding:2px 8px;border-radius:9999px;font-size:10px;">${fmt(items.reduce((s, a) => s + a.value, 0))}</span>
      </div>
      ${items.map(a => row(a, col)).join('')}
    </div>` : '';

  document.getElementById('nw-fulllist').innerHTML = (aItems.length || lItems.length) ? sec('Assets', aItems, '#34d399', '#818cf8') + sec('Liabilities', lItems, '#fb7185', '#fb7185') : empty('No assets or liabilities yet — click "+ Add" to get started.');

  // Re-attach delete listeners
  document.querySelectorAll('.btn-del-asset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      delAsset(parseInt(e.currentTarget.getAttribute('data-id'), 10));
    });
  });
}
