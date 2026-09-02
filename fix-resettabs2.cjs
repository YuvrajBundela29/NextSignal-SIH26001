const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';
const buf = fs.readFileSync(path);
let content = buf.toString('utf8');

// File uses \r\n, need to match with CRLF
// Fix resetTabs array to include tabBtnBacktest and backtestContent
// First, move the tabBtnBacktest/backtestContent declarations UP above resetTabs
// so resetTabs can reference them

// Step 1: Find and replace the line that declares tabBtnShl to also declare backtest vars
const oldTabDecls = `    const tabBtnHud = document.getElementById('tab-btn-hud');\r\n    const tabBtnHwy = document.getElementById('tab-btn-highways');\r\n    const tabBtnShl = document.getElementById('tab-btn-shelters');\r\n\r\n    const hudContent = document.getElementById('hud-tab-content');\r\n    const hwyContent = document.getElementById('highways-tab-content');\r\n    const shlContent = document.getElementById('shelters-tab-content');`;

const newTabDecls = `    const tabBtnHud = document.getElementById('tab-btn-hud') as HTMLButtonElement | null;\r\n    const tabBtnHwy = document.getElementById('tab-btn-highways') as HTMLButtonElement | null;\r\n    const tabBtnShl = document.getElementById('tab-btn-shelters') as HTMLButtonElement | null;\r\n    const tabBtnBacktest = document.getElementById('tab-btn-backtest') as HTMLButtonElement | null;\r\n\r\n    const hudContent = document.getElementById('hud-tab-content') as HTMLElement | null;\r\n    const hwyContent = document.getElementById('highways-tab-content') as HTMLElement | null;\r\n    const shlContent = document.getElementById('shelters-tab-content') as HTMLElement | null;\r\n    const backtestContent = document.getElementById('backtest-tab-content') as HTMLElement | null;`;

if (content.includes(oldTabDecls)) {
  content = content.replace(oldTabDecls, newTabDecls);
  console.log('Step 1: Added backtest decls before resetTabs');
} else {
  console.log('Step 1: pattern not found');
}

// Step 2: Fix resetTabs to include backtest button in both arrays
const oldResetArr1 = `      [tabBtnHud, tabBtnHwy, tabBtnShl].forEach(btn => {`;
const newResetArr1 = `      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnBacktest].forEach(btn => {`;
const oldResetArr2 = `      [hudContent, hwyContent, shlContent].forEach(c => {`;
const newResetArr2 = `      [hudContent, hwyContent, shlContent, backtestContent].forEach(c => {`;

// Need CRLF versions
const oldR1 = oldResetArr1.replace(/\n/g, '\r\n');
const oldR2 = oldResetArr2.replace(/\n/g, '\r\n');

if (content.includes(oldResetArr1)) {
  content = content.replace(oldResetArr1, newResetArr1);
  console.log('Step 2a: Added tabBtnBacktest to button reset array');
} else if (content.includes(oldR1)) {
  content = content.replace(oldR1, newResetArr1);
  console.log('Step 2a: Added tabBtnBacktest (CRLF match)');
}

if (content.includes(oldResetArr2)) {
  content = content.replace(oldResetArr2, newResetArr2);
  console.log('Step 2b: Added backtestContent to content hide array');
} else if (content.includes(oldR2)) {
  content = content.replace(oldR2, newResetArr2);
  console.log('Step 2b: Added backtestContent (CRLF match)');
}

// Step 3: Remove the orphan duplicate backtest declarations that come AFTER resetTabs
// (the ones added by the earlier session that now conflict with the moved-up declarations)
// Find: "    const tabBtnBacktest = document.getElementById('tab-btn-backtest');" (the second occurrence)
const lines = content.split('\r\n');
let removed = 0;
// Find lines to remove: the duplicate const declarations and the wrapping if() block
let inOrphanBlock = false;
let orphanBraceDepth = 0;
const filteredLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect the start of the orphan block
  if (!inOrphanBlock && 
      line.includes("const tabBtnBacktest = document.getElementById('tab-btn-backtest')") &&
      // Make sure it's not a typed cast (our new declaration has 'as HTMLButtonElement')
      !line.includes('as HTMLButton')) {
    inOrphanBlock = true;
    orphanBraceDepth = 0;
    removed++;
    continue;
  }
  if (!inOrphanBlock && 
      line.includes("const backtestContent = document.getElementById('backtest-tab-content')") &&
      !line.includes('as HTMLElement')) {
    removed++;
    continue;  
  }
  
  if (inOrphanBlock) {
    // Count braces to find when the if() block ends
    for (const c of line) {
      if (c === '{') orphanBraceDepth++;
      if (c === '}') orphanBraceDepth--;
    }
    removed++;
    if (orphanBraceDepth < 0 || (orphanBraceDepth === 0 && line.trim() === '}')) {
      inOrphanBlock = false;
    }
    continue;
  }
  
  filteredLines.push(line);
}

content = filteredLines.join('\r\n');
console.log('Step 3: Removed', removed, 'orphan lines');

// Step 4: Add back a clean backtest click handler after the shelters handler
// Find the shlContent.style.display = 'flex'; and insert after its closing });
const shlHandlerEnd = `        shlContent.style.display = 'flex';\r\n      }\r\n    });`;
const backtestHandler = `        shlContent.style.display = 'flex';\r\n      }\r\n    });\r\n\r\n    if (tabBtnBacktest && backtestContent) {\r\n      tabBtnBacktest.addEventListener('click', () => {\r\n        resetTabs();\r\n        tabBtnBacktest.style.background = '#050811';\r\n        tabBtnBacktest.style.color = '#38bdf8';\r\n        tabBtnBacktest.style.borderBottom = '2px solid #38bdf8';\r\n        backtestContent.style.display = 'flex';\r\n        if (!backtestContent.hasChildNodes()) {\r\n          new BacktestPanel(backtestContent);\r\n        }\r\n      });\r\n    }`;

if (content.includes(shlHandlerEnd)) {
  content = content.replace(shlHandlerEnd, backtestHandler);
  console.log('Step 4: Added clean backtest click handler');
} else {
  console.log('Step 4: shlHandlerEnd not found, handler may already exist');
}

fs.writeFileSync(path, Buffer.from(content, 'utf8'));

// Verify
const verify = fs.readFileSync(path, 'utf8');
let nonAscii = 0;
for (const b of Buffer.from(verify)) { if (b > 127) nonAscii++; }
console.log('Non-ASCII remaining:', nonAscii);

// Count occurrences of tabBtnBacktest
const occurrences = (verify.match(/tabBtnBacktest/g) || []).length;
console.log('tabBtnBacktest occurrences:', occurrences);