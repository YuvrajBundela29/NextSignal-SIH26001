const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';
const content = fs.readFileSync(path, 'utf8');

// Fix resetTabs to include the backtest button and content
const oldReset = `    const resetTabs = () => {
      [tabBtnHud, tabBtnHwy, tabBtnShl].forEach(btn => {
        if (btn) {
          btn.style.background = '#0b1120';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent].forEach(c => {
        if (c) c.style.display = 'none';
      });
    };`;

const newReset = `    const tabBtnBacktest = document.getElementById('tab-btn-backtest') as HTMLButtonElement | null;
    const backtestContent = document.getElementById('backtest-tab-content') as HTMLElement | null;

    const resetTabs = () => {
      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnBacktest].forEach(btn => {
        if (btn) {
          btn.style.background = '#0b1120';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent, backtestContent].forEach(c => {
        if (c) c.style.display = 'none';
      });
    };`;

if (content.includes(oldReset)) {
  let fixed = content.replace(oldReset, newReset);

  // Now remove the old duplicate tabBtnBacktest/backtestContent declarations
  // that appear AFTER the resetTabs block (they were added as orphan code)
  const oldOrphanDecl = `    const tabBtnBacktest = document.getElementById('tab-btn-backtest');
    const backtestContent = document.getElementById('backtest-tab-content');
    if (tabBtnBacktest && backtestContent) {
      tabBtnBacktest.addEventListener('click', () => {
        resetTabs();
        tabBtnBacktest.style.background = '#050811';
        tabBtnBacktest.style.color = '#38bdf8';
        tabBtnBacktest.style.borderBottom = '2px solid #38bdf8';
        backtestContent.style.display = 'flex';
        if (!backtestContent.hasChildNodes()) {
          new BacktestPanel(backtestContent);
        }
      });
    }`;

  const newBacktestHandler = `    if (tabBtnBacktest && backtestContent) {
      tabBtnBacktest.addEventListener('click', () => {
        resetTabs();
        tabBtnBacktest.style.background = '#050811';
        tabBtnBacktest.style.color = '#38bdf8';
        tabBtnBacktest.style.borderBottom = '2px solid #38bdf8';
        backtestContent.style.display = 'flex';
        if (!backtestContent.hasChildNodes()) {
          new BacktestPanel(backtestContent);
        }
      });
    }`;

  if (fixed.includes(oldOrphanDecl)) {
    fixed = fixed.replace(oldOrphanDecl, newBacktestHandler);
    console.log('Removed duplicate tabBtnBacktest declarations');
  } else {
    console.log('Orphan declaration pattern not found - checking for CRLF version');
    // The file uses CRLF - try indexOf
    const orphanIdx = fixed.indexOf("    const tabBtnBacktest = document.getElementById('tab-btn-backtest');");
    console.log('Orphan const at idx:', orphanIdx);
  }

  fs.writeFileSync(path, Buffer.from(fixed, 'utf8'));
  console.log('resetTabs fixed to include backtest button');
} else {
  console.log('resetTabs pattern not found');
  // Show what IS there
  const idx = content.indexOf('const resetTabs');
  console.log('resetTabs at idx:', idx);
  if (idx >= 0) console.log(content.substring(idx, idx + 300));
}

// Verify
const verify = fs.readFileSync(path, 'utf8');
let nonAscii = 0;
for (const b of Buffer.from(verify)) { if (b > 127) nonAscii++; }
console.log('Non-ASCII bytes:', nonAscii);