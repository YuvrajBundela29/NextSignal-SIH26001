const fs = require('fs');

const code = `/**
 * BacktestPanel - Methodology Illustration Chart
 * Responsive SVG bar chart + summary table for the COOLR backtest.
 * Designed to fit within the 370px right sidebar (330px inner width after padding).
 * Pure TypeScript / DOM, no external chart library.
 */

import { runBacktest } from '../../services/landslide/backtest-validator';
import type { BacktestReport } from '../../services/landslide/backtest-validator';

export class BacktestPanel {
  private container: HTMLElement;
  private report: BacktestReport;

  constructor(container: HTMLElement) {
    this.container = container;
    this.report = runBacktest();
    this.render();
  }

  private levelColor(level: string): string {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH':     return '#f97316';
      case 'MODERATE': return '#eab308';
      default:         return '#22c55e';
    }
  }

  private render(): void {
    const r = this.report;
    // SVG intrinsic viewport: 320px wide (fits comfortably in 330px inner width)
    const SVG_W = 320;
    const LABEL_W = 80;   // district label column
    const BAR_START = LABEL_W + 4;
    const BAR_MAX_W = SVG_W - LABEL_W - 44; // 44px for score text + detected tick
    const ROW_H = 28;
    const svgHeight = r.results.length * ROW_H + 8;

    const bars = r.results.map((res, i) => {
      const barW = Math.max(2, (res.predictedRiskScore / 100) * BAR_MAX_W);
      const color = this.levelColor(res.predictedLevel);
      const y = i * ROW_H + 4;
      const label = res.district.length > 12 ? res.district.slice(0, 11) + '~' : res.district;
      const tick = res.truePositive ? '&#10003;' : '&#215;';
      const tickColor = res.truePositive ? '#22c55e' : '#ef4444';
      return \`
      <g>
        <text x="2" y="\${y + 17}" font-size="9" fill="#94a3b8" font-family="monospace">\${label}</text>
        <rect x="\${BAR_START}" y="\${y + 4}" width="\${barW}" height="16" rx="2" fill="\${color}" opacity="0.85"/>
        <text x="\${BAR_START + barW + 3}" y="\${y + 16}" font-size="9" fill="\${color}" font-weight="700">\${res.predictedRiskScore}</text>
        <text x="\${SVG_W - 12}" y="\${y + 16}" font-size="10" fill="\${tickColor}" text-anchor="middle">\${tick}</text>
      </g>\`;
    }).join('');

    this.container.innerHTML = \`
    <div style="padding:10px 8px;overflow-y:auto;overflow-x:hidden;height:100%;box-sizing:border-box;">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:7px;height:7px;background:#3b82f6;border-radius:50%;flex-shrink:0;box-shadow:0 0 6px #3b82f6;"></div>
        <div style="color:#e2e8f0;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;line-height:1.3;">
          Methodology Illustration
        </div>
      </div>
      <div style="color:#64748b;font-size:9px;margin-bottom:12px;line-height:1.4;">
        Scoring behaviour on NASA COOLR / GSI documented events (NER, 2020-2024)
      </div>

      <!-- 3-stat summary (3 cols fit in 330px) -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">
        \${[
          { label: 'Detection Rate', value: r.detectionRate + '%', color: '#22c55e' },
          { label: 'Avg Score',      value: r.averageRiskScore,    color: '#f97316' },
          { label: 'Critical',       value: r.criticalDetections,  color: '#ef4444' },
        ].map(m => \`
          <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:6px;padding:8px 6px;text-align:center;">
            <div style="color:\${m.color};font-size:18px;font-weight:800;font-family:monospace;">\${m.value}</div>
            <div style="color:#64748b;font-size:9px;margin-top:2px;text-transform:uppercase;">\${m.label}</div>
          </div>
        \`).join('')}
      </div>

      <!-- Bar Chart -->
      <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">
        Risk Score per Event &nbsp;&#10003;=detected &nbsp;&#215;=missed
      </div>
      <div style="overflow-x:hidden;width:100%;">
        <svg viewBox="0 0 \${SVG_W} \${svgHeight}" width="100%" height="\${svgHeight}" style="display:block;overflow:visible;">
          \${bars}
        </svg>
      </div>

      <!-- Compact table: Date | District | Score | Result -->
      <div style="margin-top:12px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:9px;font-family:monospace;">
          <thead>
            <tr style="color:#475569;text-transform:uppercase;">
              <th style="text-align:left;padding:4px 4px;border-bottom:1px solid #1e3a5f;">Date</th>
              <th style="text-align:left;padding:4px 4px;border-bottom:1px solid #1e3a5f;">District</th>
              <th style="text-align:right;padding:4px 4px;border-bottom:1px solid #1e3a5f;">Score</th>
              <th style="text-align:left;padding:4px 4px;border-bottom:1px solid #1e3a5f;">Level</th>
              <th style="text-align:center;padding:4px 4px;border-bottom:1px solid #1e3a5f;">Det.</th>
            </tr>
          </thead>
          <tbody>
            \${r.results.map(res => {
              const loc = res.location.length > 22 ? res.location.slice(0, 20) + '..' : res.location;
              const col = this.levelColor(res.predictedLevel);
              return \`
              <tr style="border-bottom:1px solid #0d1524;">
                <td style="padding:3px 4px;color:#64748b;white-space:nowrap;">\${res.eventDate.slice(0,7)}</td>
                <td style="padding:3px 4px;color:#cbd5e1;">\${loc}</td>
                <td style="padding:3px 4px;text-align:right;color:\${col};font-weight:700;">\${res.predictedRiskScore}</td>
                <td style="padding:3px 4px;"><span style="background:\${col}22;color:\${col};padding:1px 4px;border-radius:3px;">\${res.predictedLevel}</span></td>
                <td style="padding:3px 4px;text-align:center;color:\${res.truePositive ? '#22c55e' : '#ef4444'};">\${res.truePositive ? '&#10003;' : '&#215;'}</td>
              </tr>\`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Methodology note -->
      <div style="margin-top:10px;padding:8px 10px;background:#0f172a;border-radius:6px;border-left:2px solid #3b82f6;">
        <div style="color:#94a3b8;font-size:9px;line-height:1.6;">
          <strong style="color:#e2e8f0;">Methodology:</strong>
          Pre-event rainfall reconstructed from IMD/NDMA trigger archetypes.
          Model would score <strong style="color:#22c55e;">\${r.truePositives}/\${r.totalEvents}</strong>
          events as MODERATE+ (\${r.detectionRate}% detection rate).
          Reference: NASA COOLR &amp; GSI catalog 2020-2024.
        </div>
      </div>

    </div>\`;
  }
}
`;

fs.writeFileSync(
  'Y:/Dev/projects/NextSignal-SIH26001/src/ui/components/BacktestPanel.ts',
  Buffer.from(code, 'utf8')
);

// Verify zero non-ASCII
const verify = fs.readFileSync('Y:/Dev/projects/NextSignal-SIH26001/src/ui/components/BacktestPanel.ts');
let nonAscii = 0;
for (const b of verify) { if (b > 127) nonAscii++; }
console.log('Written. Non-ASCII bytes:', nonAscii);