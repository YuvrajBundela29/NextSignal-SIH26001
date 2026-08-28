/**
 * NextSignal Alerts UI Renderer
 *
 * Renders the full Alert feed with:
 * - Severity badges (Critical / Warning / Info)
 * - Time deltas & timestamps
 * - Associated Entity badges & probability shifts
 * - Mark as read / Dismiss controls
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import { getAlerts, markAlertAsRead, dismissAlert, type NextSignalAlert } from './nextsignal-alerts-engine';

export function renderAlertsView(container: HTMLElement): void {
  const alerts = getAlerts();

  const formatRelativeTime = (isoString: string): string => {
    const delta = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(delta / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  container.innerHTML = `
    <div class="ns-widget" style="max-width:800px;margin:0 auto;box-shadow:var(--ns-shadow-lg)">
      <div class="ns-widget-header" style="padding:16px 20px">
        <div>
          <span class="ns-widget-title" style="font-size:14px">Intelligence Alerts</span>
          <p style="margin:4px 0 0;font-size:11px;color:var(--ns-text-dim)">
            Real-time threshold notifications for scenario probability shifts and critical signals
          </p>
        </div>
        <span class="ns-widget-status" style="margin-left:auto">
          <span class="ns-widget-status-dot"></span>
          ${alerts.length} Active
        </span>
      </div>

      <div class="ns-widget-content" style="padding:16px 20px">
        ${alerts.length === 0 ? `
          <div class="ns-empty-state">
            <div class="ns-empty-icon">✓</div>
            <p class="ns-empty-title">All clear — no active alerts</p>
            <p class="ns-empty-subtitle">NextSignal is continuously monitoring signal deltas.</p>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:10px">
            ${alerts.map((alert: NextSignalAlert) => `
              <div class="ns-alert ${alert.severity}" data-id="${alert.id}" style="cursor:pointer;opacity:${alert.read ? '0.75' : '1'};transition:var(--ns-transition-fast)">
                <div class="ns-alert-icon">
                  ${alert.severity === 'critical' ? '▲' : alert.severity === 'warning' ? '◈' : '◉'}
                </div>
                <div class="ns-alert-body">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span class="ns-alert-title">${alert.title}</span>
                    ${alert.entity ? `
                      <span style="font-size:10px;font-family:var(--ns-font-mono);background:rgba(255,255,255,0.06);padding:1px 5px;border-radius:3px;color:var(--ns-text-secondary)">
                        ${alert.entity}
                      </span>
                    ` : ''}
                    <span class="ns-alert-time" style="margin-left:auto">
                      ${formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                  <p class="ns-alert-summary">${alert.summary}</p>
                  ${alert.deltaInfo ? `
                    <div style="margin-top:6px;font-size:10px;font-family:var(--ns-font-mono);color:var(--ns-signal-amber);font-weight:600">
                      ⚡ ${alert.deltaInfo}
                    </div>
                  ` : ''}
                </div>
                <button class="ns-dismiss-alert-btn" data-id="${alert.id}" style="background:none;border:none;color:var(--ns-text-dim);cursor:pointer;font-size:12px;padding:4px 6px;margin-left:8px" title="Dismiss">
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach mark-read handlers on alert click
  container.querySelectorAll<HTMLElement>('.ns-alert').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (id) {
        markAlertAsRead(id);
        renderAlertsView(container);
      }
    });
  });

  // Attach dismiss handlers
  container.querySelectorAll<HTMLButtonElement>('.ns-dismiss-alert-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id) {
        dismissAlert(id);
        renderAlertsView(container);
      }
    });
  });
}
