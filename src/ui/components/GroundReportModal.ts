import type { DistrictProfile, CitizenProfile } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import {
  groundReportsService,
  SAMPLE_HAZARD_PRESETS,
  type GroundHazardCategory,
  type ReporterRole,
  type GroundReport,
} from '../../services/landslide/ground-reports';

export class GroundReportModal {
  private selectedDistrict: DistrictProfile;
  private onReportSubmitted?: (report: GroundReport) => void;
  private modalEl: HTMLElement | null = null;
  private selectedCategory: GroundHazardCategory = 'slope_movement';
  private selectedMediaUrl: string = SAMPLE_HAZARD_PRESETS[0].svgData;
  private selectedMediaType: 'image' | 'video' = 'image';
  private reporterRole: ReporterRole = 'CITIZEN';
  private reporterName: string = 'Citizen';
  private locationName: string = '';
  private lat: number;
  private lon: number;

  constructor(
    initialDistrict: DistrictProfile,
    onReportSubmitted?: (report: GroundReport) => void
  ) {
    this.selectedDistrict = initialDistrict;
    this.onReportSubmitted = onReportSubmitted;

    // Read citizen profile if available
    const cachedProfile = localStorage.getItem('nexsignal_citizen_profile');
    if (cachedProfile) {
      try {
        const prof: CitizenProfile = JSON.parse(cachedProfile);
        this.reporterName = prof.name || 'Citizen';
        this.locationName = prof.localArea ? `${prof.localArea}, ${prof.districtName}` : `${prof.districtName} Corridor`;
        this.lat = prof.lat || initialDistrict.lat;
        this.lon = prof.lon || initialDistrict.lon;
      } catch (e) {
        this.lat = initialDistrict.lat + 0.02;
        this.lon = initialDistrict.lon + 0.02;
        this.locationName = `${initialDistrict.name} Hill Road Corridor`;
      }
    } else {
      this.lat = initialDistrict.lat + 0.02;
      this.lon = initialDistrict.lon + 0.02;
      this.locationName = `${initialDistrict.name} Hill Road Corridor`;
    }
  }

  public open() {
    this.close();

    const overlay = document.createElement('div');
    overlay.id = 'ground-report-modal-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999; padding: 16px; box-sizing: border-box;
      animation: fadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
      <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); display: flex; flex-direction: column;">
        
        <!-- Modal Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #ef444420; border: 1px solid #ef4444; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              🚨
            </div>
            <div>
              <h3 style="font-size: 17px; font-weight: 800; margin: 0; color: #ffffff;">
                REPORT A GROUND HAZARD
              </h3>
              <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0;">
                Two-Way Disaster Ground Truth &bull; Geo-tagged evidence for Government &amp; SDRF response
              </p>
            </div>
          </div>
          <button id="btn-close-report-modal" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 4px;">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">

          <!-- Reporter Role & Name -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
                REPORTER ROLE
              </label>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-rep-role active" data-role="CITIZEN" style="flex: 1; padding: 8px; font-size: 12px; font-weight: 700; border-radius: 8px; border: 1px solid #22c55e; background: #22c55e20; color: #22c55e; cursor: pointer;">
                  📱 Citizen
                </button>
                <button type="button" class="btn-rep-role" data-role="FIELD_OFFICIAL" style="flex: 1; padding: 8px; font-size: 12px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; cursor: pointer;">
                  🏛️ Field Official
                </button>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
                REPORTER NAME
              </label>
              <input id="report-input-name" type="text" value="${this.reporterName}" placeholder="Your Name" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box;" />
            </div>
          </div>

          <!-- Hazard Classification -->
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">
              HAZARD CLASSIFICATION
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
              <button type="button" class="btn-hazard-cat active" data-id="slope_movement" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #38bdf8; background: #0284c730; color: #38bdf8; text-align: left; cursor: pointer;">
                ⛰️ Slope Movement / Slump
              </button>
              <button type="button" class="btn-hazard-cat" data-id="tension_crack" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; text-align: left; cursor: pointer;">
                ⚡ Ground / Tension Crack
              </button>
              <button type="button" class="btn-hazard-cat" data-id="road_damage" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; text-align: left; cursor: pointer;">
                🛣️ Road Damage / Subsidence
              </button>
              <button type="button" class="btn-hazard-cat" data-id="rockfall_debris" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; text-align: left; cursor: pointer;">
                🪨 Rockfall Debris
              </button>
              <button type="button" class="btn-hazard-cat" data-id="blocked_road" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; text-align: left; cursor: pointer;">
                🚫 Blocked Highway
              </button>
              <button type="button" class="btn-hazard-cat" data-id="culvert_overflow" style="padding: 10px; font-size: 11px; font-weight: 700; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #94a3b8; text-align: left; cursor: pointer;">
                🌊 Drainage / Mudflow
              </button>
            </div>
          </div>

          <!-- Photo / Video Evidence Picker -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 11px; font-weight: 700; color: #cbd5e1;">
                VISUAL EVIDENCE (PHOTO / VIDEO)
              </label>
              <span style="font-size: 10px; color: #38bdf8;">Select a Demonstration Preset or Upload Custom Media</span>
            </div>

            <!-- Preset Samples Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
              ${SAMPLE_HAZARD_PRESETS.map((p, idx) => `
                <button type="button" class="btn-hazard-preset ${idx === 0 ? 'active' : ''}" data-id="${p.id}" style="padding: 6px; border-radius: 8px; border: 1px solid ${idx === 0 ? '#38bdf8' : '#334155'}; background: ${idx === 0 ? '#0284c730' : '#1e293b'}; color: ${idx === 0 ? '#38bdf8' : '#94a3b8'}; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <img src="${p.svgData}" style="width: 100%; height: 60px; object-fit: cover; border-radius: 4px;" alt="${p.name}" />
                  <span style="font-size: 9px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${p.name}</span>
                </button>
              `).join('')}
            </div>

            <!-- Custom File Input & Preview -->
            <div style="display: flex; align-items: center; gap: 12px; background: #050811; border: 1px dashed #334155; border-radius: 8px; padding: 10px;">
              <input id="input-file-evidence" type="file" accept="image/*,video/*" style="font-size: 11px; color: #94a3b8;" />
              <div id="preview-evidence-container" style="width: 48px; height: 48px; border-radius: 6px; overflow: hidden; background: #0b1120; border: 1px solid #1e293b; flex-shrink: 0;">
                <img id="img-evidence-preview" src="${this.selectedMediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Preview" />
              </div>
            </div>
          </div>

          <!-- Geotagging & District Selector -->
          <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                📍 GEOTAGGED LOCATION
              </span>
              <button id="btn-autolocate" type="button" style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; cursor: pointer;">
                🛰️ Use GPS Geolocation
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 8px;">
              <div>
                <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 2px;">DISTRICT</label>
                <select id="report-sel-district" style="width: 100%; background: #0b1120; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; font-size: 12px; color: #ffffff;">
                  ${NER_DISTRICTS.map((d) => `<option value="${d.id}" ${d.id === this.selectedDistrict.id ? 'selected' : ''}>${d.name} (${d.state})</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 2px;">LOCATION / LANDMARK</label>
                <input id="report-input-location-name" type="text" value="${this.locationName}" style="width: 100%; background: #0b1120; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; font-size: 12px; color: #ffffff; box-sizing: border-box;" />
              </div>
            </div>

            <div style="display: flex; gap: 16px; font-size: 11px; color: #64748b; font-family: monospace;">
              <span>Lat: <strong id="val-lat" style="color: #cbd5e1;">${this.lat.toFixed(5)}&deg; N</strong></span>
              <span>Lon: <strong id="val-lon" style="color: #cbd5e1;">${this.lon.toFixed(5)}&deg; E</strong></span>
              <span>Time: <strong style="color: #cbd5e1;">${new Date().toLocaleTimeString()} IST</strong></span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              FIELD OBSERVATION / DESCRIPTION
            </label>
            <textarea id="report-input-description" rows="3" placeholder="Describe the hazard (e.g. Active tension cracks across highway cut-slope, drainage overflowing, boulder falling onto road...)" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px; font-size: 12px; color: #ffffff; box-sizing: border-box; resize: vertical;">Fresh cracks and slope slump visible near the highway embankment following heavy rainfall.</textarea>
          </div>

        </div>

        <!-- Modal Footer -->
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding: 16px 24px; border-top: 1px solid #1e293b; background: #050811; border-radius: 0 0 16px 16px;">
          <button id="btn-cancel-report" style="background: transparent; border: 1px solid #334155; color: #94a3b8; font-size: 12px; font-weight: 700; padding: 9px 18px; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button id="btn-submit-report" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: 1px solid #f87171; color: #ffffff; font-size: 12px; font-weight: 800; padding: 9px 22px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
            <span>🚀</span> SUBMIT GEOTAGGED REPORT
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;
    this.bindEvents();
  }

  public close() {
    const existing = document.getElementById('ground-report-modal-overlay');
    if (existing) {
      existing.remove();
    }
    this.modalEl = null;
  }

  private bindEvents() {
    if (!this.modalEl) return;

    // Close button
    this.modalEl.querySelector('#btn-close-report-modal')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-cancel-report')?.addEventListener('click', () => this.close());

    // Role switcher
    const roleButtons = this.modalEl.querySelectorAll('.btn-rep-role');
    roleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        roleButtons.forEach((b) => {
          (b as HTMLElement).style.borderColor = '#334155';
          (b as HTMLElement).style.background = '#1e293b';
          (b as HTMLElement).style.color = '#94a3b8';
        });
        const target = btn as HTMLElement;
        this.reporterRole = target.getAttribute('data-role') as ReporterRole;
        if (this.reporterRole === 'CITIZEN') {
          target.style.borderColor = '#22c55e';
          target.style.background = '#22c55e20';
          target.style.color = '#22c55e';
        } else {
          target.style.borderColor = '#38bdf8';
          target.style.background = '#0284c730';
          target.style.color = '#38bdf8';
        }
      });
    });

    // Hazard Category switcher
    const catButtons = this.modalEl.querySelectorAll('.btn-hazard-cat');
    catButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        catButtons.forEach((b) => {
          (b as HTMLElement).style.borderColor = '#334155';
          (b as HTMLElement).style.background = '#1e293b';
          (b as HTMLElement).style.color = '#94a3b8';
        });
        const target = btn as HTMLElement;
        target.style.borderColor = '#38bdf8';
        target.style.background = '#0284c730';
        target.style.color = '#38bdf8';
        this.selectedCategory = target.getAttribute('data-id') as GroundHazardCategory;
      });
    });

    // Preset selection
    const presetButtons = this.modalEl.querySelectorAll('.btn-hazard-preset');
    const previewImg = this.modalEl.querySelector('#img-evidence-preview') as HTMLImageElement;

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetButtons.forEach((b) => {
          (b as HTMLElement).style.borderColor = '#334155';
          (b as HTMLElement).style.background = '#1e293b';
          (b as HTMLElement).style.color = '#94a3b8';
        });
        const target = btn as HTMLElement;
        target.style.borderColor = '#38bdf8';
        target.style.background = '#0284c730';
        target.style.color = '#38bdf8';

        const id = target.getAttribute('data-id');
        const preset = SAMPLE_HAZARD_PRESETS.find((p) => p.id === id);
        if (preset) {
          this.selectedMediaUrl = preset.svgData;
          this.selectedMediaType = 'image';
          this.selectedCategory = preset.category;
          if (previewImg) previewImg.src = preset.svgData;

          catButtons.forEach((cb) => {
            if (cb.getAttribute('data-id') === preset.category) {
              (cb as HTMLElement).click();
            }
          });

          const descInput = this.modalEl?.querySelector('#report-input-description') as HTMLTextAreaElement;
          if (descInput) descInput.value = preset.description;
        }
      });
    });

    // Custom File Upload
    const fileInput = this.modalEl.querySelector('#input-file-evidence') as HTMLInputElement;
    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (re.target?.result) {
            this.selectedMediaUrl = re.target.result as string;
            this.selectedMediaType = file.type.startsWith('video') ? 'video' : 'image';
            if (previewImg) previewImg.src = this.selectedMediaUrl;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // District Selector Change
    const selDistrict = this.modalEl.querySelector('#report-sel-district') as HTMLSelectElement;
    selDistrict?.addEventListener('change', () => {
      const dist = NER_DISTRICTS.find((d) => d.id === selDistrict.value);
      if (dist) {
        this.selectedDistrict = dist;
        this.lat = dist.lat + (Math.random() - 0.5) * 0.04;
        this.lon = dist.lon + (Math.random() - 0.5) * 0.04;
        const latEl = this.modalEl?.querySelector('#val-lat');
        const lonEl = this.modalEl?.querySelector('#val-lon');
        if (latEl) latEl.textContent = `${this.lat.toFixed(5)}° N`;
        if (lonEl) lonEl.textContent = `${this.lon.toFixed(5)}° E`;

        const locNameInput = this.modalEl?.querySelector('#report-input-location-name') as HTMLInputElement;
        if (locNameInput) locNameInput.value = `${dist.name} Hill Road Corridor`;
      }
    });

    // Auto-Locate Button
    const btnAutoLocate = this.modalEl.querySelector('#btn-autolocate') as HTMLButtonElement;
    btnAutoLocate?.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        btnAutoLocate.textContent = '🛰️ Querying GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.lat = pos.coords.latitude;
            this.lon = pos.coords.longitude;
            const latEl = this.modalEl?.querySelector('#val-lat');
            const lonEl = this.modalEl?.querySelector('#val-lon');
            if (latEl) latEl.textContent = `${this.lat.toFixed(5)}° N`;
            if (lonEl) lonEl.textContent = `${this.lon.toFixed(5)}° E`;
            btnAutoLocate.textContent = '✓ GPS Locked';
          },
          (err) => {
            console.warn('Geolocation denied:', err);
            btnAutoLocate.textContent = '📍 District GPS Used';
          },
          { timeout: 5000 }
        );
      }
    });

    // Submit Report Button
    const btnSubmit = this.modalEl.querySelector('#btn-submit-report') as HTMLButtonElement;
    btnSubmit?.addEventListener('click', () => {
      const descInput = this.modalEl?.querySelector('#report-input-description') as HTMLTextAreaElement;
      const locNameInput = this.modalEl?.querySelector('#report-input-location-name') as HTMLInputElement;
      const reporterNameInput = this.modalEl?.querySelector('#report-input-name') as HTMLInputElement;

      const report = groundReportsService.addReport({
        district: this.selectedDistrict,
        lat: this.lat,
        lon: this.lon,
        locationName: locNameInput?.value || `${this.selectedDistrict.name} Vicinity`,
        category: this.selectedCategory,
        description: descInput?.value || 'Ground hazard detected in local area.',
        mediaUrl: this.selectedMediaUrl,
        mediaType: this.selectedMediaType,
        reporterRole: this.reporterRole,
        reporterName: reporterNameInput?.value || (this.reporterRole === 'CITIZEN' ? 'Citizen Reporter' : 'Field Official'),
      });

      this.showSuccessConfirmation(report);
    });
  }

  private showSuccessConfirmation(report: GroundReport) {
    if (!this.modalEl) return;

    const modalBody = this.modalEl.querySelector('div > div:nth-child(2)');
    const modalFooter = this.modalEl.querySelector('div > div:nth-child(3)');
    if (modalFooter) (modalFooter as HTMLElement).style.display = 'none';

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; animation: fadeIn 0.3s ease;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #22c55e20; border: 2px solid #22c55e; color: #22c55e; font-size: 32px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            ✓
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
            REPORT SUBMITTED SUCCESSFULLY
          </h3>
          <div style="display: inline-block; background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 13px; font-weight: 800; padding: 4px 14px; border-radius: 20px; font-family: monospace; margin-bottom: 16px;">
            REPORT ID: ${report.id}
          </div>
          <p style="font-size: 13px; color: #cbd5e1; max-width: 480px; margin: 0 auto 20px; line-height: 1.6;">
            Your geo-tagged evidence has been securely transmitted to the <strong>District Disaster Operations Centre (DEOC)</strong> and plotted on the <strong>Regional GIS Intelligence Map</strong> for verification.
          </p>
          <div style="background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; max-width: 440px; margin: 0 auto 24px; text-align: left; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94a3b8;">Location:</span>
              <span style="color: #f1f5f9; font-weight: 700;">${report.locationName}, ${report.districtName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #94a3b8;">Category:</span>
              <span style="color: #f59e0b; font-weight: 700;">${report.categoryLabel}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Initial Status:</span>
              <span style="color: #eab308; font-weight: 800; background: #eab30820; padding: 2px 8px; border-radius: 4px;">PENDING VERIFICATION</span>
            </div>
          </div>
          <button id="btn-done-report" style="background: #0284c7; border: none; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 28px; border-radius: 8px; cursor: pointer;">
            Back to Dashboard
          </button>
        </div>
      `;

      modalBody.querySelector('#btn-done-report')?.addEventListener('click', () => {
        this.close();
        if (this.onReportSubmitted) {
          this.onReportSubmitted(report);
        }
      });
    }
  }
}
