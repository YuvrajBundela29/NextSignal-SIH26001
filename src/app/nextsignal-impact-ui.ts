/**
 * NextSignal Impact Map UI Renderer
 *
 * Renders interactive causal impact chains:
 * Root Event -> 1st Order Effect -> 2nd Order Effect -> Affected Sectors -> Assets
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import type { ImpactChainResult, ImpactNode } from './nextsignal-impact-engine';

export function renderImpactChain(container: HTMLElement, result: ImpactChainResult): void {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'var(--ns-signal-red)';
      case 'high': return 'var(--ns-signal-amber)';
      case 'medium': return 'var(--ns-signal-blue-light)';
      case 'low': return 'var(--ns-signal-green)';
      default: return 'var(--ns-text-secondary)';
    }
  };

  const getNodeTypeBadge = (type: string): string => {
    const labels: Record<string, string> = {
      event: 'Trigger Event',
      first_order: '1st Order Effect',
      second_order: '2nd Order Effect',
      sector: 'Sector Impact',
      asset: 'Asset Impact',
      supply_chain: 'Supply Chain',
    };
    return labels[type] || type.toUpperCase();
  };

  container.innerHTML = `
    <div class="ns-widget" style="margin-top:16px;border-color:var(--ns-border-accent)">
      <div class="ns-widget-header">
        <span class="ns-widget-title">Impact Map & Causal Chain</span>
        <span style="font-size:10px;color:var(--ns-signal-blue-light);margin-left:auto;font-family:var(--ns-font-mono)">
          Time Lag: ${result.estimatedTimeLag}
        </span>
      </div>
      <div class="ns-widget-content">
        <p style="font-size:12px;color:var(--ns-text-secondary);line-height:1.5;margin:0 0 16px">
          ${result.summary}
        </p>

        <!-- Visual Causal Chain Flow -->
        <div class="ns-impact-chain">
          ${result.nodes.map((node: ImpactNode, idx: number) => {
            const isLast = idx === result.nodes.length - 1;
            const color = getSeverityColor(node.severity);

            return `
              <div class="ns-impact-node">
                <div class="ns-impact-connector">
                  <div class="ns-impact-dot ${node.severity}" style="background:${color}"></div>
                  ${!isLast ? '<div class="ns-impact-line"></div>' : ''}
                </div>
                <div class="ns-impact-content">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span style="font-size:10px;font-weight:700;letter-spacing:0.5px;color:${color};text-transform:uppercase;background:rgba(255,255,255,0.04);padding:2px 6px;border-radius:3px">
                      ${getNodeTypeBadge(node.type)}
                    </span>
                    <span style="font-size:11px;color:var(--ns-text-dim);font-family:var(--ns-font-mono);margin-left:auto">
                      ${node.probability}% probability
                    </span>
                  </div>
                  <div class="ns-impact-label">${node.label}</div>
                  <div class="ns-impact-rationale">${node.description}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Affected Summary Bar -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--ns-border);display:flex;gap:16px;flex-wrap:wrap">
          <div>
            <span style="font-size:10px;text-transform:uppercase;color:var(--ns-text-dim);font-weight:700">Affected Sectors: </span>
            <span style="font-size:11px;color:var(--ns-text);font-weight:600">${result.affectedSectors.join(', ')}</span>
          </div>
          <div>
            <span style="font-size:10px;text-transform:uppercase;color:var(--ns-text-dim);font-weight:700">Key Assets: </span>
            <span style="font-size:11px;color:var(--ns-signal-green);font-weight:700;font-family:var(--ns-font-mono)">${result.affectedAssets.join(' · ')}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
