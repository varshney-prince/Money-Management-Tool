// core/utils.js
import { state, CONSTANTS } from './state.js';

export function td() { 
  return new Date().toISOString().split('T')[0]; 
}

export function nid(arr) { 
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1; 
}

export function fmt(n) { 
  return '₹' + Math.abs(n).toLocaleString('en-IN'); 
}

export function calcs() {
  const ti = state.incomes.reduce((a, b) => a + b.amount, 0);
  const te = state.expenses.reduce((a, b) => a + b.amount, 0);
  const surplus = ti - te;
  return {
    ti, te, surplus,
    daily: Math.max(0, Math.floor(surplus / 30)),
    rate: ti ? Math.round((surplus / ti) * 100) : 0
  };
}

export function nwCalcs() {
  const aItems = state.assets.filter(a => a.type === 'asset');
  const lItems = state.assets.filter(a => a.type === 'liability');
  
  const ta = aItems.reduce((s, a) => s + a.value, 0);
  const tl = lItems.reduce((s, a) => s + a.value, 0);
  const nw = ta - tl;
  const dta = ta ? Math.round((tl / ta) * 100) : 0;
  
  const liq = aItems.filter(a => ['Cash & Savings','Fixed Deposit'].includes(a.category)).reduce((s,a) => s + a.value, 0);
  const inv = aItems.filter(a => ['Stocks & Equity','Mutual Funds','Gold & Precious','Crypto','EPF / PPF'].includes(a.category)).reduce((s,a) => s + a.value, 0);
  const phy = aItems.filter(a => ['Real Estate','Vehicle','Business','Other Asset'].includes(a.category)).reduce((s,a) => s + a.value, 0);
  
  // Financial Health Score 0-100
  let score = 50;
  if(dta < 20) score += 20; 
  else if(dta < 40) score += 10; 
  else if(dta > 80) score -= 20;
  
  const { rate } = calcs(); 
  if(rate >= 40) score += 15; 
  else if(rate >= 20) score += 7; 
  else if(rate < 0) score -= 15;
  
  if(liq > 0 && ta > 0 && liq / ta > 0.1) score += 10; 
  else score -= 5;
  
  if(inv > 0 && ta > 0 && inv/ta > 0.2) score += 5;
  
  score = Math.max(0, Math.min(100, score));
  return { ta, tl, nw, dta, liq, inv, phy, score, aItems, lItems };
}

export function empty(msg){ 
  return `<div style="color:#52525b;text-align:center;padding:32px;font-size:13px;">${msg}</div>`; 
}
