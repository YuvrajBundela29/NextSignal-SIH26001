import type { LandslideAlert, AppLanguage } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';

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
    }, 8000);
  }

  private getDistrictLocalizedName(districtId: string, fallbackName: string): string {
    const d = NER_DISTRICTS.find(item => item.id === districtId);
    if (!d) return fallbackName;
    switch (this.lang) {
      case 'hi': return d.nameHi || d.name;
      case 'as': return d.nameAs || d.name;
      case 'bn': return d.nameBn || d.name;
      case 'mni': return d.nameMni || d.name;
      case 'lus': return d.nameLus || d.name;
      case 'kha': return d.nameKha || d.name;
      case 'ne': return d.nameNe || d.name;
      default: return d.name;
    }
  }

  private getHeadline(a: LandslideAlert): string {
    const localizedDistrict = this.getDistrictLocalizedName(a.districtId, a.districtName);
    switch (this.lang) {
      case 'hi':
        return a.level === 'CRITICAL'
          ? `लाल चेतावनी: ${localizedDistrict} में अत्यधिक भूस्खलन खतरा`
          : a.level === 'HIGH'
          ? `नारंगी चेतावनी: ${localizedDistrict} में उच्च भूस्खलन संवेदनशीलता`
          : `पीली सलाह: ${localizedDistrict} में मध्यम भूस्खलन निगरानी`;
      case 'as':
        return a.level === 'CRITICAL'
          ? `উচ্চ সতৰ্কবাণী: ${localizedDistrict}ত ভূমিস্খলনৰ গভীৰ বিপদ`
          : a.level === 'HIGH'
          ? `সতৰ্কবাণী: ${localizedDistrict}ত ভূমিস্খলনৰ সম্ভাৱনা`
          : `বতৰা: ${localizedDistrict}ত সতৰ্কতা অৱলম্বন কৰক`;
      case 'bn':
        return a.level === 'CRITICAL'
          ? `জরুরি সতর্কতা: ${localizedDistrict}-এ ভূমিধস ঝুঁকি`
          : a.level === 'HIGH'
          ? `সতর্কবার্তা: ${localizedDistrict}-এ উচ্চ ঝুঁকি`
          : `পরামর্শ: ${localizedDistrict}-এ মাঝারি সতর্কতা`;
      case 'mni':
        return `চেকশিন-ৱার্নিং: ${localizedDistrict}দা চীং নিংবগী রিক্স (${a.level})`;
      case 'lus':
        return `Hlauhthawnna: ${localizedDistrict} leilasinvawng (${a.level})`;
      case 'kha':
        return `Jingmaham: ${localizedDistrict} jingma ba khraw (${a.level})`;
      case 'ne':
        return `चेतावनी: ${localizedDistrict}मा पहिरोको जोखिम (${a.level})`;
      default:
        return a.headlineEn;
    }
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
    const headline = this.getHeadline(a);
    const details = `Composite Risk Score: ${a.score}/100. Antecedent moisture building up.`;

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

    const btnPause = document.getElementById('btn-ticker-pause');
    btnPause?.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      if (btnPause) btnPause.textContent = this.isPaused ? 'Resume' : 'Pause';
    });

    document.getElementById('btn-ticker-next')?.addEventListener('click', () => {
      this.currentIndex = (this.currentIndex + 1) % this.alerts.length;
      this.renderCurrentAlert();
    });
  }
}
