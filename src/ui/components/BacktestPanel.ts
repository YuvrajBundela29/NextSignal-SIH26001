/**
 * BacktestPanel — Historical Validation Chart
 * Renders the COOLR backtest results as an inline SVG bar chart + summary table.
 * Pure TypeScript / DOM, no external chart library required.
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
    const maxScore = 100;

    const bars = r.results.map((res, i) => {
      const barWidth = (res.predictedRiskScore / maxScore) * 320;
      const color = this.levelColor(res.predictedLevel);
      const y = i * 38 + 10;
      const labelName = res.district.length > 18 ? res.district.slice(0, 16) + '…' : res.district;
      return `
        <g>
          <text x="4" y="${y + 14}" font-size="10" fill="#94a3b8" font-family="JetBrains Mono, monospace">${labelName}</text>
          <rect x="148" y="${y}" width="${barWidth}" height="22" rx="3" fill="${color}" opacity="0.85"/>
          <text x="${148 + barWidth + 5}" y="${y + 15}" font-size="10" fill="${color}" font-weight="600">${res.predictedRiskScore}</text>
          ${res.truePositive ? `<text x="490" y="${y + 15}" font-size="9" fill="#22c55e">✓ DETECTED</text>` : `<text x="490" y="${y + 15}" font-size="9" fill="#ef4444">✗ MISSED</text>`}
        </g>`;
    }).join('');

    const svgHeight = r.results.length * 38 + 20;

    this.container.innerHTML = `
      <div class="backtest-panel" style="background:#0c1221;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:8px;height:8px;background:#3b82f6;border-radius:50%;box-shadow:0 0 8px #3b82f6;"></div>
          <h3 style="color:#e2e8f0;font-size:14px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0;">
            MODEL VALIDATION — NASA COOLR / GSI Historical Backtest
          </h3>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
          ${[
            { label: 'Events Tested', value: r.totalEvents, color: '#94a3b8' },
            { label: 'Detection Rate', value: r.detectionRate + '%', color: '#22c55e' },
            { label: 'Avg Risk Score', value: r.averageRiskScore, color: '#f97316' },
            { label: 'Critical Flagged', value: r.criticalDetections, color: '#ef4444' },
          ].map(m => `
            <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:12px;text-align:center;">
              <div style="color:${m.color};font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace;">${m.value}</div>
              <div style="color:#64748b;font-size:10px;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">${m.label}</div>
            </div>`).join('')}
        </div>

        <div style="color:#64748b;font-size:11px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em;">Predicted Risk Score Per Event (Pre-Event Reconstruction)</div>
        <svg width="560" height="${svgHeight}" style="overflow:visible;display:block;margin-bottom:16px;">
          ${bars}
        </svg>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'JetBrains Mono',monospace;">
            <thead>
              <tr style="color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Date</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Location</th>
                <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Score</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Level</th>
                <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Fatalities</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #1e3a5f;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${r.results.map(res => `
                <tr style="border-bottom:1px solid #0f172a;">
                  <td style="padding:5px 8px;color:#94a3b8;">${res.eventDate}</td>
                  <td style="padding:5px 8px;color:#cbd5e1;">${res.location.length > 30 ? res.location.slice(0, 28) + '…' : res.location}</td>
                  <td style="padding:5px 8px;text-align:right;color:${this.levelColor(res.predictedLevel)};font-weight:700;">${res.predictedRiskScore}</td>
                  <td style="padding:5px 8px;"><span style="background:${this.levelColor(res.predictedLevel)}22;color:${this.levelColor(res.predictedLevel)};padding:2px 6px;border-radius:4px;font-size:10px;">${res.predictedLevel}</span></td>
                  <td style="padding:5px 8px;text-align:right;color:#f87171;">${res.fatalities}</td>
                  <td style="padding:5px 8px;color:${res.truePositive ? '#22c55e' : '#ef4444'};">${res.truePositive ? '✓ Correctly Flagged' : '✗ Below Threshold'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top:14px;padding:10px 14px;background:#0f172a;border-radius:8px;border-left:3px solid #3b82f6;">
          <div style="color:#94a3b8;font-size:10px;line-height:1.6;">
            <strong style="color:#e2e8f0;">Methodology:</strong> Pre-event conditions reconstructed from documented trigger-type rainfall thresholds
            (IMD/NDMA post-event reports) and district slope DEM data. Model correctly flagged
            <strong style="color:#22c55e;">${r.truePositives}/${r.totalEvents} events</strong> as ≥ MODERATE risk
            (${r.detectionRate}% detection rate). False negatives due to sub-threshold rainfall proxies.
            Validated against NASA COOLR &amp; GSI event catalog (2020–2024).
          </div>
        </div>
      </div>`;
  }
}