import type { LandslideAlert, AppLanguage } from '../../services/landslide/types';

export class AlertTicker {
  private container: HTMLElement;
  private lang: AppLanguage = 'en';
  private alerts: LandslideAlert[] = [];
  private currentIndex = 0;
  private isPaused = false;
  private timerId: number | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.startAutoCycle();
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
    this.renderCurrentAlert();
  }

  public render(alerts: LandslideAlert[]) {
    this.alerts = alerts || [];
    if (this.currentIndex >= this.alerts.length) {
      this.currentIndex = 0;
    }
    this.renderCurrentAlert();
  }

  private startAutoCycle() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      if (!this.isPaused && this.alerts.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.alerts.length;
        this.renderCurrentAlert();
      }
    }, 12000); // 12 seconds per alert (relaxed, easily readable pace)
  }

  private renderCurrentAlert() {
    if (this.alerts.length === 0) {
      this.container.innerHTML = `
        <div style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #22c55e;">🛡️</span>
            <span>NORTHEAST INDIA TELEMETRY ACTIVE: All 28 monitored NER districts within standard baseline thresholds.</span>
          </div>
          <span style="font-size: 10px; color: #64748b;">MDoNER Disaster Early Warning Portal</span>
        </div>
      `;
      return;
    }

    const a = this.alerts[this.currentIndex] || this.alerts[0];
    const isCrit = a.level === 'CRITICAL';
    const bg = isCrit ? '#7f1d1d' : '#7c2d12';
    const border = isCrit ? '#ef4444' : '#f97316';
    const headline = this.lang === 'hi' ? a.headlineHi : a.headlineEn;
    const details = this.lang === 'hi' ? a.detailsHi : a.detailsEn;

    this.container.innerHTML = `
      <div style="background: ${bg}; border-bottom: 1px solid ${border}; padding: 6px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; color: #ffffff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);">
        <!-- Left: Badge & Alert Counter -->
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; border: 1px solid ${border}; font-weight: 800; font-size: 10px;">
            <span class="pulse-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${isCrit ? '#ef4444' : '#f97316'};"></span>
            <span>WARNING [${this.currentIndex + 1}/${this.alerts.length}]</span>
          </div>
          <span style="background: ${isCrit ? '#ef4444' : '#f97316'}; color: white; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px;">
            ${a.level}
          </span>
        </div>

        <!-- Center: Headline & Details (Clear, Static, Read at user pace) -->
        <div style="flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;">
          <strong style="color: #ffffff; font-size: 12px;">${headline}</strong>
          <span style="color: rgba(255,255,255,0.85); font-size: 11px;">&bull; ${details}</span>
        </div>

        <!-- Right: Interactive Controls (Prev / Pause / Next / View All) -->
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button id="btn-ticker-prev" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold;">
            ◀ Prev
          </button>
          <button id="btn-ticker-pause" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold;">
            ${this.isPaused ? '▶ Play' : '⏸ Pause'}
          </button>
          <button id="btn-ticker-next" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold;">
            Next ▶
          </button>
        </div>
      </div>
    `;

    // Bind event listeners for prev/next/pause
    document.getElementById('btn-ticker-prev')?.addEventListener('click', () => {
      this.currentIndex = (this.currentIndex - 1 + this.alerts.length) % this.alerts.length;
      this.renderCurrentAlert();
    });

    document.getElementById('btn-ticker-next')?.addEventListener('click', () => {
      this.currentIndex = (this.currentIndex + 1) % this.alerts.length;
      this.renderCurrentAlert();
    });

    document.getElementById('btn-ticker-pause')?.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      this.renderCurrentAlert();
    });
  }
}
