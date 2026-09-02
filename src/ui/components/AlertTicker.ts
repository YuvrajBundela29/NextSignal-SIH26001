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
 }, 10000);
 }

 private renderCurrentAlert() {
 if (this.alerts.length === 0) {
 this.container.innerHTML = `
 <div style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 4px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8;">
 <div style="display: flex; align-items: center; gap: 8px;">
 <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e;"></span>
 <span style="font-weight: 600; color: #e2e8f0;">REGIONAL TELEMETRY STATUS:</span>
 <span>All 28 monitored North Eastern Region districts are within baseline stability limits.</span>
 </div>
 <span style="font-size: 10px; color: #64748b; font-weight: 600;">MDoNER Early Warning System</span>
 </div>
 `;
 return;
 }

 const a = this.alerts[this.currentIndex] || this.alerts[0];
 const isCrit = a.level === 'CRITICAL';
 const accentColor = isCrit ? '#ef4444' : '#f59e0b';
 const badgeBg = isCrit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
 const headline = this.lang === 'hi' ? a.headlineHi : a.headlineEn;
 const details = this.lang === 'hi' ? a.detailsHi : a.detailsEn;

 this.container.innerHTML = `
 <div style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 4px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 11px; color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
 <!-- Left: Status Badge & Counter -->
 <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
 <span style="display: flex; align-items: center; gap: 5px; background: ${badgeBg}; color: ${accentColor}; border: 1px solid ${accentColor}40; padding: 1px 7px; border-radius: 4px; font-weight: 800; font-size: 9px; letter-spacing: 0.5px;">
 <span style="width: 6px; height: 6px; border-radius: 50%; background: ${accentColor};"></span>
 ${a.level} ADVISORY [${this.currentIndex + 1}/${this.alerts.length}]
 </span>
 </div>

 <!-- Center: Alert Content -->
 <div style="flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;">
 <strong style="color: #ffffff; font-size: 11px; font-weight: 700;">${headline}</strong>
 <span style="color: #94a3b8; font-size: 10.5px;">&bull; ${details}</span>
 </div>

 <!-- Right: Simple Controls -->
 <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
 <button id="btn-ticker-prev" style="background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; padding: 2px 7px; border-radius: 3px; font-size: 9px; cursor: pointer; font-weight: 600;">
 Prev
 </button>
 <button id="btn-ticker-pause" style="background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; padding: 2px 7px; border-radius: 3px; font-size: 9px; cursor: pointer; font-weight: 600;">
 ${this.isPaused ? 'Resume' : 'Pause'}
 </button>
 <button id="btn-ticker-next" style="background: #0f172a; border: 1px solid #1e293b; color: #94a3b8; padding: 2px 7px; border-radius: 3px; font-size: 9px; cursor: pointer; font-weight: 600;">
 Next
 </button>
 </div>
 </div>
 `;

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
