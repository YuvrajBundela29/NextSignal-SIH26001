const fs = require('fs');
const path = 'Y:/Dev/projects/NextSignal-SIH26001/src/ui/LandslideDashboard.ts';

const buf = fs.readFileSync(path);
let content = buf.toString('utf8');
const lines = content.split('\r\n');

const fixes = {
  140: '                <option value="live" style="background: #0b1120; color: #38bdf8;" ${!this.isOfflineDemo ? \'selected\' : \'\'}>\u25BA Live (Open-Meteo &amp; USGS)</option>',
  141: '                <option value="monsoon_deluge" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === \'monsoon_deluge\' ? \'selected\' : \'\'}>&#9670; Demo (Monsoon Deluge)</option>',
  142: '                <option value="seismic_crisis" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === \'seismic_crisis\' ? \'selected\' : \'\'}>&#9670; Demo (Seismic M5.8)</option>',
  143: '                <option value="normal_baseline" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === \'normal_baseline\' ? \'selected\' : \'\'}>&#9670; Demo (Normal Baseline)</option>',
  149: '              <span>\u25CF Live Feed Active</span>',
  165: '              <span style="font-size: 10px; margin-right: 4px;">Lang:</span>',
  168: '                <option value="hi" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'hi\' ? \'selected\' : \'\'}>Hindi</option>',
  169: '                <option value="as" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'as\' ? \'selected\' : \'\'}>Assamese</option>',
  170: '                <option value="bn" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'bn\' ? \'selected\' : \'\'}>Bengali</option>',
  171: '                <option value="mni" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'mni\' ? \'selected\' : \'\'}>Manipuri</option>',
  172: '                <option value="lus" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'lus\' ? \'selected\' : \'\'}>Mizo</option>',
  174: '                <option value="ne" style="background: #0b1120; color: #f8fafc;" ${this.lang === \'ne\' ? \'selected\' : \'\'}>Nepali</option>',
  217: '                  Risk HUD',
  220: '                  Highways',
  223: '                  Shelters',
  227: '                  [Chart] Backtest',
  237: '                    Arterial Highway Corridors',
  249: '                    <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px;">${h.origin} &rarr; ${h.destination}</div>',
  251: '                      &rarr; Click for Step-by-Step Waypoints',
  260: '                  Designated Safe Shelters &amp; Evacuation Centers',
  275: '                      ${s.hasMedicalPost ? \'[+] Medical Post\' : \'\'} ${s.hasGeneratorPower ? \'[+] Generator\' : \'\'} ${s.hasSatelliteComms ? \'[+] Satellite\' : \'\'}',
  445: '            <span>Rain: ${rain24}mm</span>',
};

let fixCount = 0;
for (const [idxStr, newLine] of Object.entries(fixes)) {
  const idx = parseInt(idxStr);
  if (idx < lines.length) {
    const hasNonAscii = [...lines[idx]].some(c => c.charCodeAt(0) > 127);
    if (hasNonAscii) {
      lines[idx] = newLine;
      fixCount++;
      console.log('Fixed L' + (idx+1));
    }
  }
}

const newContent = lines.join('\r\n');
// Write as UTF-8 no BOM
const buf2 = Buffer.from(newContent, 'utf8');
fs.writeFileSync(path, buf2);
console.log('Total fixed:', fixCount);

const verify = fs.readFileSync(path);
let nonAscii = 0;
for (const b of verify) { if (b > 127) nonAscii++; }
console.log('Non-ASCII bytes remaining:', nonAscii);