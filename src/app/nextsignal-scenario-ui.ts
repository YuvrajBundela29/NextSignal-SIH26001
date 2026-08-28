/**
 * NextSignal Scenario UI Renderer
 *
 * Renders the "What Happens Next?" output into the DOM.
 * Uses the NextSignal design system CSS classes.
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import type { WhatHappensNextResult, ScenarioCase } from './nextsignal-scenario-engine';
import { normalizeProbabilities } from './nextsignal-scenario-engine';

function renderConfidenceLabel(confidence: 'low' | 'medium' | 'high'): string {
  const colors: Record<string, string> = {
    low: '#f59e0b',
    medium: '#3b82f6',
    high: '#10b981',
  };
  return `<span style="color:${colors[confidence] ?? '#94a3b8'};font-weight:600;font-size:11px;font-family:var(--ns-font-mono)">${confidence.toUpperCase()} confidence</span>`;
}

function renderScenarioCase(scenarioCase: ScenarioCase, probability: number): string {
  const colorMap: Record<string, string> = {
    bull: 'var(--ns-bull)',
    base: 'var(--ns-text-secondary)',
    bear: 'var(--ns-bear)',
  };
  const bgMap: Record<string, string> = {
    bull: 'rgba(16, 185, 129, 0.05)',
    base: 'rgba(107, 114, 128, 0.05)',
    bear: 'rgba(239, 68, 68, 0.05)',
  };
  const color = colorMap[scenarioCase.label] ?? 'var(--ns-text)';
  const bg = bgMap[scenarioCase.label] ?? 'transparent';

  return `
    <div style="background:${bg};border:1px solid ${color}25;border-radius:var(--ns-radius-md);padding:16px">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px">
        <span style="font-family:var(--ns-font-display);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${color}">${scenarioCase.label} case</span>
        <span style="font-family:var(--ns-font-display);font-size:22px;font-weight:800;color:${color}">${probability}%</span>
        <span style="font-size:9px;color:var(--ns-text-dim);text-transform:uppercase;letter-spacing:0.5px">estimated probability</span>
      </div>
      <p style="font-family:var(--ns-font-body);font-size:13px;font-weight:600;color:var(--ns-text);margin:0 0 8px">${scenarioCase.title}</p>
      <p style="font-family:var(--ns-font-body);font-size:12px;color:var(--ns-text-secondary);line-height:1.5;margin:0 0 12px">${scenarioCase.summary}</p>

      ${scenarioCase.keyDrivers.length > 0 ? `
        <div style="margin-bottom:10px">
          <p style="font-size:10px;font-weight:700;color:var(--ns-text-dim);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px">Key Drivers</p>
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px">
            ${scenarioCase.keyDrivers.map((d) => `
              <li style="font-size:12px;color:var(--ns-text-secondary);display:flex;align-items:flex-start;gap:6px;line-height:1.4">
                <span style="color:${color};margin-top:2px;flex-shrink:0">▸</span>${d}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${scenarioCase.invalidationConditions.length > 0 ? `
        <div style="padding:8px;background:rgba(0,0,0,0.2);border-radius:var(--ns-radius-sm)">
          <p style="font-size:10px;font-weight:700;color:var(--ns-text-dim);text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px">Invalidated If</p>
          ${scenarioCase.invalidationConditions.map((c) => `
            <p style="font-size:11px;color:var(--ns-text-dim);margin:0 0 2px;line-height:1.4">• ${c}</p>
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-top:10px;display:flex;justify-content:flex-end">
        ${renderConfidenceLabel(scenarioCase.confidence)}
      </div>
    </div>
  `;
}

/**
 * Render the full "What Happens Next?" output into a container element.
 */
export function renderWhatHappensNext(
  container: HTMLElement,
  result: WhatHappensNextResult,
  _query: string,
): void {
  const probs = normalizeProbabilities({
    bull: result.cases.bull.probability,
    base: result.cases.base.probability,
    bear: result.cases.bear.probability,
  });

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--ns-border)">
        <div>
          <h2 style="font-family:var(--ns-font-display);font-size:20px;font-weight:800;color:var(--ns-text);margin:0 0 4px">${result.entity}</h2>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:var(--ns-text-dim);text-transform:uppercase;letter-spacing:0.5px;font-family:var(--ns-font-body)">${result.entityType}</span>
            <span style="color:var(--ns-border)">·</span>
            <span style="font-size:11px;color:var(--ns-text-dim);font-family:var(--ns-font-body)">Horizon: ${result.timeHorizon}</span>
            <span style="color:var(--ns-border)">·</span>
            <span style="font-size:11px;color:var(--ns-text-dim);font-family:var(--ns-font-mono)">${new Date(result.generatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
        <div style="margin-left:auto">
          <!-- Probability bars -->
          <div class="ns-prob-bars" style="width:120px">
            <div class="ns-prob-bar bull" style="width:${probs.bull}%">${probs.bull}%</div>
            <div class="ns-prob-bar base" style="width:${probs.base}%">${probs.base}%</div>
            <div class="ns-prob-bar bear" style="width:${probs.bear}%">${probs.bear}%</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:3px">
            <span style="font-size:9px;color:var(--ns-bull);font-family:var(--ns-font-mono)">BULL</span>
            <span style="font-size:9px;color:var(--ns-text-dim);font-family:var(--ns-font-mono)">BASE</span>
            <span style="font-size:9px;color:var(--ns-bear);font-family:var(--ns-font-mono)">BEAR</span>
          </div>
        </div>
      </div>

      <!-- Current State -->
      ${result.currentState ? `
        <div class="ns-widget">
          <div class="ns-widget-header">
            <span class="ns-widget-title">Current State</span>
          </div>
          <div class="ns-widget-content">
            <p style="font-size:13px;color:var(--ns-text-secondary);line-height:1.6;margin:0">${result.currentState}</p>
          </div>
        </div>
      ` : ''}

      <!-- Important Signals -->
      ${result.importantSignals.length > 0 ? `
        <div class="ns-widget">
          <div class="ns-widget-header">
            <span class="ns-widget-title">Important Signals</span>
            <span style="font-size:10px;color:var(--ns-signal-blue-light);margin-left:auto">◎</span>
          </div>
          <div class="ns-widget-content">
            <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">
              ${result.importantSignals.map((s) => `
                <li style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--ns-text-secondary);line-height:1.5">
                  <span style="color:var(--ns-signal-blue-light);margin-top:2px;flex-shrink:0">◎</span>${s}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <!-- Scenario Cases -->
      <div>
        <p style="font-family:var(--ns-font-display);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--ns-text-secondary);margin:0 0 12px">Scenario Analysis</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          ${renderScenarioCase(result.cases.bull, probs.bull)}
          ${renderScenarioCase(result.cases.base, probs.base)}
          ${renderScenarioCase(result.cases.bear, probs.bear)}
        </div>
      </div>

      <!-- Emerging Risks -->
      ${result.emergingRisks.length > 0 ? `
        <div class="ns-widget" style="border-color:rgba(239,68,68,0.2)">
          <div class="ns-widget-header">
            <span class="ns-widget-title" style="color:var(--ns-signal-red)">Emerging Risks</span>
          </div>
          <div class="ns-widget-content">
            <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
              ${result.emergingRisks.map((r) => `
                <li style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--ns-text-secondary);line-height:1.5">
                  <span style="color:var(--ns-signal-red);margin-top:2px;flex-shrink:0">▲</span>${r}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <!-- Potential Impacts -->
      ${result.potentialImpacts.length > 0 ? `
        <div class="ns-widget">
          <div class="ns-widget-header">
            <span class="ns-widget-title">Potential Impacts</span>
          </div>
          <div class="ns-widget-content">
            <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
              ${result.potentialImpacts.map((i) => `
                <li style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--ns-text-secondary);line-height:1.5">
                  <span style="color:var(--ns-signal-amber);margin-top:2px;flex-shrink:0">→</span>${i}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <!-- Impact Map & Causal Chain Container -->
      <div id="ns-impact-chain-container"></div>

      <!-- What to Watch -->
      ${result.watchNext.length > 0 ? `
        <div class="ns-widget">
          <div class="ns-widget-header">
            <span class="ns-widget-title">What to Watch Next</span>
          </div>
          <div class="ns-widget-content">
            <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
              ${result.watchNext.map((w) => `
                <li style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--ns-text-secondary);line-height:1.5">
                  <span style="color:var(--ns-signal-green);margin-top:2px;flex-shrink:0">•</span>${w}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <!-- Disclaimer -->
      <p class="ns-disclaimer">${result.disclaimer}</p>

    </div>
  `;

  // Asynchronously compute and render the Impact Chain
  const impactContainer = container.querySelector<HTMLElement>('#ns-impact-chain-container');
  if (impactContainer) {
    import('./nextsignal-impact-engine').then(async ({ computeImpactChain }) => {
      const impactResult = await computeImpactChain(result.entity);
      const { renderImpactChain } = await import('./nextsignal-impact-ui');
      renderImpactChain(impactContainer, impactResult);
    }).catch(() => {});
  }
}

