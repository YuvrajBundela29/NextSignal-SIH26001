import type { LandslideAlert } from '../../services/landslide/types';

export class AlertTicker {
  private container: HTMLElement;
  private isHi = false;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
  }

  public render(alerts: LandslideAlert[]) {
    if (!alerts || alerts.length === 0) {
      this.container.innerHTML = `
        <div style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #22c55e;">●</span>
            <span>${this.isHi ? 'पूर्वोत्तर भारत टेलीमेट्री सक्रिय: कोई गंभीर आपातकालीन चेतावनी नहीं।' : 'NORTHEAST INDIA TELEMETRY ACTIVE: All monitored districts within standard safety parameters.'}</span>
          </div>
          <span style="font-size: 10px; color: #64748b;">MDoNER Disaster Portal</span>
        </div>
      `;
      return;
    }

    const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL');
    const hasCritical = criticalAlerts.length > 0;
    const tickerBg = hasCritical ? '#7f1d1d' : '#7c2d12';
    const tickerBorder = hasCritical ? '#ef4444' : '#f97316';

    const marqueeItems = alerts
      .map(
        (a) => `
      <span style="margin-right: 32px; font-weight: bold; color: ${a.level === 'CRITICAL' ? '#fecaca' : '#fed7aa'};">
        ${this.isHi ? a.headlineHi : a.headlineEn} &bull; <span style="font-weight: normal; opacity: 0.9;">${this.isHi ? a.detailsHi : a.detailsEn}</span>
      </span>
    `
      )
      .join('');

    this.container.innerHTML = `
      <div style="background: ${tickerBg}; border-bottom: 1px solid ${tickerBorder}; padding: 6px 16px; display: flex; align-items: center; gap: 12px; font-size: 11px; color: #ffffff; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap; font-weight: 800; text-transform: uppercase; background: #00000044; padding: 2px 8px; border-radius: 4px; border: 1px solid ${tickerBorder};">
          <span class="pulse-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>
          <span>${this.isHi ? 'सक्रिय चेतावनी' : 'ACTIVE WARNINGS'} (${alerts.length})</span>
        </div>
        <div style="flex: 1; overflow: hidden; white-space: nowrap; position: relative;">
          <div style="display: inline-block; animation: marquee 30s linear infinite;">
            ${marqueeItems}
          </div>
        </div>
      </div>
    `;
  }
}
