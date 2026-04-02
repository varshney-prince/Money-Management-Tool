// ui/navigation.js
import { renderOverview } from '../features/overview.js';
import { renderLists } from '../features/transactions.js';
import { renderNW } from '../features/netWorth.js';
import { renderHistory } from '../features/history.js';
import { renderLending } from '../features/lending.js';

export function sw(n) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + n).classList.add('active');
  
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-' + n).classList.add('active');

  const titles = ['Overview', 'Income', 'Expenses', 'Analysis', 'Simulator', 'Net Worth', 'History', 'Lending'];
  document.getElementById('page-title').textContent = titles[n];

  // Specific renders per tab
  if (n === 0 || n === 3) renderOverview();
  if (n === 1 || n === 2) renderLists();
  if (n === 5) renderNW();
  if (n === 6) renderHistory();
  if (n === 7) renderLending();
}

export function renderAll() {
  renderOverview();
  renderLists();
  renderNW();
  renderHistory();
  renderLending();
}

export function initNavigation() {
  window.addEventListener('app-nav', e => sw(e.detail));
  window.addEventListener('app-render', () => renderAll());
}
