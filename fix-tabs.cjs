const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';
const buf = fs.readFileSync(path);
let content = buf.toString('utf8');

// Fix 1: The backtest button is orphaned AFTER the closing </div> of the tab-bar.
// Find the three-tab bar closing div followed immediately by the orphan backtest button
// and restructure so the backtest button is the 4th child INSIDE the tab-bar div.

// Strategy: find the tab-btn-shelters button, which is the last correctly-placed button.
// Replace the shelters button's closing sequence + the stray closing div + orphan backtest
// with: shelters button properly closed, then backtest button, then the tab-bar closing div.

const sheltersAndOrphan = `</button>
              </div>
                <button id="tab-btn-backtest" style="flex: 1; padding: 10px 4px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent; font-size: 9.5px;">
                  [Chart] Backtest
                </button>`;

const sheltersAndFixed = `</button>
                <button id="tab-btn-backtest" style="flex: 1; padding: 10px 4px; font-size: 10px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent; border-left: 1px solid #1e293b;">
                  Backtest
                </button>
              </div>`;

if (content.includes(sheltersAndOrphan)) {
  content = content.replace(sheltersAndOrphan, sheltersAndFixed);
  console.log('Fix 1a: Moved backtest button inside tab-bar div - exact match');
} else {
  // Normalize: try with \r\n  
  const old2 = '</button>\r\n              </div>\r\n                <button id="tab-btn-backtest"';
  const idx = content.indexOf(old2);
  console.log('Pattern 1a idx (CRLF):', idx);
  if (idx >= 0) {
    const endIdx = content.indexOf('</button>', idx + old2.length) + '</button>'.length;
    const toReplace = content.substring(idx, endIdx);
    console.log('Replacing:', JSON.stringify(toReplace.substring(0, 100)));
    const replacement = `</button>
                <button id="tab-btn-backtest" style="flex: 1; padding: 10px 4px; font-size: 10px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent; border-left: 1px solid #1e293b;">
                  Backtest
                </button>
              </div>`;
    content = content.substring(0, idx) + replacement + content.substring(endIdx);
    console.log('Fix 1a: Replaced via CRLF pattern');
  }
}

// Fix 2: Add padding-bottom to the right sidebar's aside element
// to prevent content rendering under the fixed Netlify badge (~40px tall)
const sidebarAside = `<aside style="width: 370px; background: #050811; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">`;
const sidebarAsideFixed = `<aside style="width: 370px; background: #050811; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500; padding-bottom: 48px;">`;

if (content.includes(sidebarAside)) {
  content = content.replace(sidebarAside, sidebarAsideFixed);
  console.log('Fix 2: Added padding-bottom:48px to right sidebar aside');
} else {
  console.log('Fix 2: aside pattern not found');
}

// Write back as UTF-8 no BOM
fs.writeFileSync(path, Buffer.from(content, 'utf8'));
console.log('File written');

// Final verification
const verify = fs.readFileSync(path);
let nonAscii = 0;
for (const b of verify) { if (b > 127) nonAscii++; }
console.log('Non-ASCII bytes remaining:', nonAscii);

// Confirm backtest button is now inside the tab-bar div
const checkContent = verify.toString('utf8');
const tabBarDivClose = checkContent.indexOf('</div>\r\n\r\n              <!-- Tab Contents');
const backtestBtn = checkContent.indexOf('tab-btn-backtest');
console.log('tab-bar closing div at:', tabBarDivClose);
console.log('backtest btn at:', backtestBtn);
console.log('backtest is BEFORE closing div:', backtestBtn < tabBarDivClose);