/**
 * NextSignal Watchlist UI Renderer
 *
 * Renders the enhanced Watchlist view with:
 * - Entity badges (Ticker / Country / Sector)
 * - Scenario probability mini-bars (Bull / Base / Bear)
 * - 24h probability delta pills (e.g. ▲ +8% Bear)
 * - Active signal indicators with strength markers
 * - Risk classification badges
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import { getWatchlist, removeFromWatchlist, type WatchlistEntity } from './nextsignal-watchlist-engine';

export function renderWatchlistView(container: HTMLElement): void {
  const items = getWatchlist();

  const getRiskBadge = (level: string): string => {
    switch (level) {
      case 'critical': return '<span style="color:var(--ns-signal-red);background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700">CRITICAL</span>';
      case 'high': return '<span style="color:var(--ns-signal-amber);background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700">HIGH</span>';
      case 'medium': return '<span style="color:var(--ns-signal-blue-light);background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.3);padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700">MEDIUM</span>';
      default: return '<span style="color:var(--ns-signal-green);background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700">LOW</span>';
    }
  };

  container.innerHTML = `
    <div class="ns-widget" style="max-width:1000px;margin:0 auto;box-shadow:var(--ns-shadow-lg)">
      <div class="ns-widget-header" style="padding:16px 20px">
        <div>
          <span class="ns-widget-title" style="font-size:14px">Scenario Watchlist</span>
          <p style="margin:4px 0 0;font-size:11px;color:var(--ns-text-dim)">
            Tracking ${items.length} entities with real-time scenario probability updates & signal convergence alerts
          </p>
        </div>
        <button id="ns-add-watchlist-btn" class="ns-btn-primary" style="padding:6px 14px;font-size:12px;margin-left:auto">
          + Add Entity
        </button>
      </div>

      <div class="ns-widget-content" style="padding:0;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:12px">
          <thead>
            <tr style="border-bottom:1px solid var(--ns-border);background:rgba(0,0,0,0.2);color:var(--ns-text-dim);font-size:10px;text-transform:uppercase;letter-spacing:0.6px;font-family:var(--ns-font-mono)">
              <th style="padding:12px 16px">Entity</th>
              <th style="padding:12px 14px">Type</th>
              <th style="padding:12px 14px;text-align:right">Price / Value</th>
              <th style="padding:12px 14px;min-width:140px">Scenario (Bull/Base/Bear)</th>
              <th style="padding:12px 14px">24h Delta</th>
              <th style="padding:12px 14px;text-align:center">Signals</th>
              <th style="padding:12px 14px">Risk Level</th>
              <th style="padding:12px 14px;text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: WatchlistEntity) => {
              const deltaSign = item.probabilityDelta24h.delta >= 0 ? '+' : '';
              const deltaColor = item.probabilityDelta24h.label === 'bull'
                ? 'var(--ns-signal-green)'
                : item.probabilityDelta24h.label === 'bear'
                ? 'var(--ns-signal-red)'
                : 'var(--ns-text-secondary)';

              return `
                <tr style="border-bottom:1px solid var(--ns-border);transition:var(--ns-transition-fast)" class="ns-watchlist-row">
                  <td style="padding:12px 16px">
                    <div style="font-weight:700;color:var(--ns-text);font-family:var(--ns-font-mono)">${item.symbolOrCode}</div>
                    <div style="font-size:11px;color:var(--ns-text-secondary)">${item.name}</div>
                  </td>
                  <td style="padding:12px 14px">
                    <span style="font-size:10px;text-transform:uppercase;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;color:var(--ns-text-dim)">
                      ${item.type}
                    </span>
                  </td>
                  <td style="padding:12px 14px;text-align:right;font-family:var(--ns-font-mono)">
                    <div style="font-weight:600;color:var(--ns-text)">${item.currentPriceOrScore ?? '—'}</div>
                    <div style="font-size:10px;color:${item.change24h?.startsWith('+') ? 'var(--ns-signal-green)' : 'var(--ns-signal-red)'}">
                      ${item.change24h ?? ''}
                    </div>
                  </td>
                  <td style="padding:12px 14px">
                    <div class="ns-prob-bars" style="height:18px;border-radius:3px">
                      <div class="ns-prob-bar bull" style="width:${item.scenarioProbabilities.bull}%;font-size:8px">${item.scenarioProbabilities.bull}%</div>
                      <div class="ns-prob-bar base" style="width:${item.scenarioProbabilities.base}%;font-size:8px">${item.scenarioProbabilities.base}%</div>
                      <div class="ns-prob-bar bear" style="width:${item.scenarioProbabilities.bear}%;font-size:8px">${item.scenarioProbabilities.bear}%</div>
                    </div>
                  </td>
                  <td style="padding:12px 14px;font-family:var(--ns-font-mono)">
                    <span style="color:${deltaColor};font-weight:700">
                      ${deltaSign}${item.probabilityDelta24h.delta}%
                    </span>
                    <span style="font-size:9px;color:var(--ns-text-dim);text-transform:uppercase">
                      ${item.probabilityDelta24h.label}
                    </span>
                  </td>
                  <td style="padding:12px 14px;text-align:center">
                    <span style="font-family:var(--ns-font-mono);font-weight:700;color:var(--ns-signal-blue-light)">
                      ${item.activeSignalCount}
                    </span>
                  </td>
                  <td style="padding:12px 14px">
                    ${getRiskBadge(item.riskLevel)}
                  </td>
                  <td style="padding:12px 14px;text-align:right">
                    <button class="ns-remove-btn" data-id="${item.id}" style="background:none;border:none;color:var(--ns-text-dim);cursor:pointer;font-size:14px;padding:4px 8px" title="Remove from watchlist">
                      ✕
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach delete handlers
  container.querySelectorAll<HTMLButtonElement>('.ns-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id) {
        removeFromWatchlist(id);
        renderWatchlistView(container);
      }
    });
  });

  // Attach Add Entity modal trigger
  container.querySelector('#ns-add-watchlist-btn')?.addEventListener('click', () => {
    const symbol = prompt('Enter Ticker, Country Code, or Sector name (e.g. AAPL, US, SEMICONDUCTORS):');
    if (symbol && symbol.trim()) {
      import('./nextsignal-watchlist-engine').then(({ addToWatchlist }) => {
        addToWatchlist({
          symbolOrCode: symbol.toUpperCase().trim(),
          name: `${symbol.trim()} Intelligence Track`,
          type: 'asset',
          currentPriceOrScore: 'Active',
          change24h: '0.0%',
          scenarioProbabilities: { bull: 35, base: 45, bear: 20 },
          probabilityDelta24h: { label: 'base', delta: 0 },
          activeSignalCount: 3,
          highestSignalStrength: 'moderate',
          riskLevel: 'medium',
        });
        renderWatchlistView(container);
      });
    }
  });
}
