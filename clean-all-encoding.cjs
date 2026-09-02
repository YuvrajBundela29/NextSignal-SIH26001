const fs = require('fs');
const path = require('path');

const srcDir = 'Y:/Dev/projects/NextSignal-SIH26001/src';

function getAllTs(dir) {
  const results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) results.push(...getAllTs(full));
    else if (item.name.endsWith('.ts') || item.name.endsWith('.html')) results.push(full);
  }
  return results;
}

const files = getAllTs(srcDir);
let totalFixed = 0;

for (const file of files) {
  const buf = fs.readFileSync(file);
  let hasNonAscii = false;
  for (const b of buf) { if (b > 127) { hasNonAscii = true; break; } }
  if (!hasNonAscii) continue;

  // Read as UTF-8
  const content = buf.toString('utf8');
  const lines = content.split('\r\n');
  let fileFixed = 0;

  const newLines = lines.map((line, i) => {
    // Check if line has non-ASCII characters
    let hasNonAsciiInLine = false;
    for (let c = 0; c < line.length; c++) {
      if (line.charCodeAt(c) > 127) { hasNonAsciiInLine = true; break; }
    }
    if (!hasNonAsciiInLine) return line;

    // Replace all non-ASCII sequences with empty string or ASCII equivalent
    // Most of them are garbled emoji in DOM strings
    let fixed = '';
    for (let c = 0; c < line.length; c++) {
      const code = line.charCodeAt(c);
      if (code <= 127) {
        fixed += line[c];
      }
      // Drop all non-ASCII bytes - they're all garbled sequences in this codebase
    }
    // Clean up any double-spaces left by removal
    fixed = fixed.replace(/  +/g, ' ').trimEnd();
    fileFixed++;
    return fixed;
  });

  const newContent = newLines.join('\r\n');
  const outBuf = Buffer.from(newContent, 'utf8');
  fs.writeFileSync(file, outBuf);
  console.log('Cleaned', path.relative('Y:/Dev/projects/NextSignal-SIH26001', file), '- fixed lines:', fileFixed);
  totalFixed += fileFixed;
}

console.log('\nTotal files processed, total lines fixed:', totalFixed);