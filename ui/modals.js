// ui/modals.js
import { td } from '../core/utils.js';

export function openModal(type) {
  document.getElementById(`modal-${type}`).style.display = 'flex';
  const prefix = type === 'income' ? 'i' : type === 'expense' ? 'e' : type === 'asset' ? 'a' : 'l';
  const dateEl = document.getElementById(`${prefix}-date`);
  if (dateEl) dateEl.value = td();
  if (type === 'lend' && document.getElementById('l-sim-res')) {
    document.getElementById('l-sim-res').innerHTML = '';
  }
}

export function closeModal(type) {
  document.getElementById(`modal-${type}`).style.display = 'none';
}

export function initModals() {
  window.addEventListener('app-close-modal', e => closeModal(e.detail));
  
  // click outside to close
  window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  };
}

export function toast(msg, err=false) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.background = err ? '#f43f5e' : '#10b981';
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

export function confetti() {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.animationDelay = Math.random() * 0.5 + 's';
    c.style.background = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)];
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2500);
  }
}
