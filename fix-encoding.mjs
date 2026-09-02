const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';

// Read as buffer then decode as UTF-8
const buf = fs.readFileSync(path);
let content = buf.toString('utf8');

// We need to identify the problematic sections and replace them.
// Strategy: use regex to replace garbled non-ASCII sequences in specific patterns.

// The garbled sequences all start with some variant of high-byte sequences.
// Simpler: split on \r\n, fix specific lines by identifying their unique surrounding ASCII context.

const lines = content.split('\r\n');

const fixes = {
  // Feed selector options (lines 140-143, 0-indexed)
  140: `                <option value="live" style="background: #0b1120; color: #38bdf8;" \${!this.isOfflineDemo ? 'selected' : ''}>\u25BA Live (Open-Meteo &amp; USGS)</option>`,
  141: `                <option value="monsoon_deluge" style="background: #0b1120; color: #38bdf8;" \${this.isOfflineDemo && this.currentScenario === 'monsoon_deluge' ? 'selected' : ''}>\u25C6 Demo (Monsoon Deluge)</option>`,
  142: `                <option value="seismic_crisis" style="background: #0b1120; color: #38bdf8;" \${this.isOfflineDemo && this.currentScenario === 'seismic_crisis' ? 'selected' : ''}>\u25C6 Demo (Seismic M5.8)</option>`,
  143: `                <option value="normal_baseline" style="background: #0b1120; color: #38bdf8;" \${this.isOfflineDemo && this.currentScenario === 'normal_baseline' ? 'selected' : ''}>\u25C6 Demo (Normal Baseline)</option>`,
  149: `              <span>\u25CF Live Feed Active</span>`,
  165: `              <span style="font-size: 10px; margin-right: 4px;">Lang:</span>`,
  168: `                <option value="hi" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'hi' ? 'selected' : ''}>Hindi</option>`,
  169: `                <option value="as" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'as' ? 'selected' : ''}>Assamese</option>`,
  170: `                <option value="bn" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'bn' ? 'selected' : ''}>Bengali</option>`,
  171: `                <option value="mni" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'mni' ? 'selected' : ''}>Manipuri</option>`,
  172: `                <option value="lus" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'lus' ? 'selected' : ''}>Mizo</option>`,
  174: `                <option value="ne" style="background: #0b1120; color: #f8fafc;" \${this.lang === 'ne' ? 'selected' : ''}>Nepali</option>`,
  217: `                  Risk HUD`,
  220: `                  Highways`,
  223: `                  Shelters`,
  227: `                  [Chart] Backtest`,
  237: `                    Arterial Highway Corridors`,
  249: `                    <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px;">\${h.origin} &rarr; \${h.destination}</div>`,
  251: `                      &rarr; Click for Step-by-Step Waypoints`,
  260: `                  Designated Safe Shelters &amp; Evacuation Centers`,
  275: `                      \${s.hasMedicalPost ? '[+] Medical Post' : ''} \${s.hasGeneratorPower ? '[+] Generator Power' : ''} \${s.hasSatelliteComms ? '[+] Satellite Link' : ''}`,
  445: `            <span>Rain: \${rain24}mm</span>`,
};

let fixCount = 0;
for (const [idxStr, newLine] of Object.entries(fixes)) {
  const idx = parseInt(idxStr);
  if (idx < lines.length) {
    const oldLine = lines[idx];
    // Check if this line has non-ASCII
    const hasNonAscii = [...oldLine].some(c => c.charCodeAt(0) > 127);
    if (hasNonAscii) {
      lines[idx] = newLine;
      fixCount++;
      console.log('Fixed L' + (idx+1));
    } else {
      console.log('Skip L' + (idx+1) + ' (already clean)');
    }
  }
}

const newContent = lines.join('\r\n');
fs.writeFileSync(path, newContent, { encoding: 'utf8' });
console.log('Total fixed:', fixCount);

// Verify
const verify = fs.readFileSync(path);
let nonAscii = 0;
for (const b of verify) { if (b > 127) nonAscii++; }
console.log('Non-ASCII bytes remaining in LandslideDashboard.ts:', nonAscii);