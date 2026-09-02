const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';
let content = fs.readFileSync(path, 'utf8');

// The file ends with the shelters handler missing its closing '    });'
// Find the broken end and fix it
const brokenEnd = `      shlContent.style.display = 'flex';\r\n      }\r\n}\r\n`;
const fixedEnd = `      shlContent.style.display = 'flex';\r\n      }\r\n    });\r\n\r\n    if (tabBtnBacktest && backtestContent) {\r\n      tabBtnBacktest.addEventListener('click', () => {\r\n        resetTabs();\r\n        tabBtnBacktest.style.background = '#050811';\r\n        tabBtnBacktest.style.color = '#38bdf8';\r\n        tabBtnBacktest.style.borderBottom = '2px solid #38bdf8';\r\n        backtestContent.style.display = 'flex';\r\n        if (!backtestContent.hasChildNodes()) {\r\n          new BacktestPanel(backtestContent);\r\n        }\r\n      });\r\n    }\r\n\r\n    // Highway Corridor Item clicks -> Open Highway Navigator\r\n    hwyContent?.addEventListener('click', (e) => {\r\n      const target = (e.target as HTMLElement).closest('.hwy-corridor-item');\r\n      if (target) {\r\n        const id = target.getAttribute('data-id');\r\n        if (id) {\r\n          this.situationMapComp?.openHighwayNavigator(id);\r\n        }\r\n      }\r\n    });\r\n  }\r\n}\r\n`;

if (content.includes(brokenEnd)) {
  content = content.replace(brokenEnd, fixedEnd);
  console.log('Fixed broken file ending and added backtest handler + highway click handler + proper class closure');
} else {
  console.log('Broken end pattern not matched');
  // Show last 200 chars
  console.log('Last 300 chars:', JSON.stringify(content.substring(content.length - 300)));
}

fs.writeFileSync(path, Buffer.from(content, 'utf8'));

// Verify
const verify = fs.readFileSync(path, 'utf8');
let nonAscii = 0;
for (const b of Buffer.from(verify)) { if (b > 127) nonAscii++; }
console.log('Non-ASCII remaining:', nonAscii);
const lines = verify.split('\r\n');
console.log('Total lines:', lines.length);
console.log('Last 5 lines:', lines.slice(-5).join(' | '));