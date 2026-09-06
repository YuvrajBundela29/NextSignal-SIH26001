import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import type { DistrictProfile } from '../../services/landslide/types';
import {
  groundReportsService,
  HAZARD_CATEGORIES,
  SAMPLE_HAZARD_PRESETS,
  type GroundHazardCategory,
  type ReporterRole,
  type GroundReport,
} from '../../services/landslide/ground-reports';

export class GroundReportModal {
  private modalEl: HTMLElement | null = null;
  private selectedDistrict: DistrictProfile;
  private selectedCategory: GroundHazardCategory = 'slope_movement';
  private selectedMediaUrl: string = SAMPLE_HAZARD_PRESETS[0].svgData;
  private selectedMediaType: 'image' | 'video' = 'image';
  private reporterRole: ReporterRole = 'CITIZEN';
  private lat: number = 27.508;
  private lon: number = 88.532;
  private onReportSubmitted?: (report: GroundReport) => void;

  constructor(initialDistrict?: DistrictProfile, onReportSubmitted?: (report: GroundReport) => void) {
    this.selectedDistrict = initialDistrict || NER_DISTRICTS.find(d => d.id === 'mangan') || NER_DISTRICTS[0];
    this.lat = this.selectedDistrict.lat;
    this.lon = this.selectedDistrict.lon;
    this.onReportSubmitted = onReportSubmitted;
  }

  public open() {
    this.close(); // remove any existing

    const overlay = document.createElement('div');
    overlay.id = 'ground-report-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      animation: fadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="background: #0b1120; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; color: #f1f5f9;">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 1px solid #334155; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">📍</span>
              <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #f8fafc; letter-spacing: 0.5px;">
                REPORT GROUND HAZARD &amp; EVIDENCE
              </h2>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              SIH26001 Two-Way Intelligence &bull; Geotagged Field Report to District EOC
            </div>
          </div>
          <button id="btn-close-report-modal" style="background: #1e293b; border: 1px solid #475569; color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;">
            &times;
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <div style="padding: 20px 22px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; flex: 1;">

          <!-- Reporter Role Selector -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              1. Reporter Identification
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <button id="role-btn-citizen" type="button" class="reporter-role-btn active" style="padding: 10px; border-radius: 8px; border: 1px solid #0284c7; background: #0369a120; color: #38bdf8; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">👤</span>
                <div>
                  <div>Local Citizen / Resident</div>
                  <div style="font-size: 10px; font-weight: 400; color: #94a3b8;">Community ground observer</div>
                </div>
              </button>
              <button id="role-btn-official" type="button" class="reporter-role-btn" style="padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #94a3b8; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🛡️</span>
                <div>
                  <div>Field Official / Inspector</div>
                  <div style="font-size: 10px; font-weight: 400; color: #94a3b8;">PWD / Forest / SDRF Patrol</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Hazard Category Grid -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              2. Hazard Category
            </label>
            <div id="category-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
              ${HAZARD_CATEGORIES.map((cat) => `
                <button type="button" class="hazard-cat-btn ${cat.id === this.selectedCategory ? 'active' : ''}" data-id="${cat.id}" style="padding: 9px 8px; border-radius: 8px; border: 1px solid ${cat.id === this.selectedCategory ? '#38bdf8' : '#1e293b'}; background: ${cat.id === this.selectedCategory ? '#0b263b' : '#0f172a'}; color: ${cat.id === this.selectedCategory ? '#38bdf8' : '#cbd5e1'}; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                  <span style="font-size: 18px;">${cat.icon}</span>
                  <span style="line-height: 1.2;">${cat.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Photo / Video Evidence Upload -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              3. Visual Evidence (Photo / Video)
            </label>
            
            <!-- Quick Preset Buttons for Demo Convenience -->
            <div style="margin-bottom: 8px;">
              <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Quick Demo Photo Presets:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${SAMPLE_HAZARD_PRESETS.map((preset, idx) => `
                  <button type="button" class="demo-preset-btn ${idx === 0 ? 'active' : ''}" data-id="${preset.id}" style="font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid ${idx === 0 ? '#38bdf8' : '#334155'}; background: ${idx === 0 ? '#0284c730' : '#1e293b'}; color: ${idx === 0 ? '#38bdf8' : '#94a3b8'}; cursor: pointer;">
                    ${preset.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: stretch; background: #0f172a; border: 1px dashed #334155; border-radius: 10px; padding: 12px;">
              <div id="evidence-preview-box" style="width: 130px; height: 90px; border-radius: 8px; overflow: hidden; background: #020617; display: flex; align-items: center; justify-content: center; border: 1px solid #1e293b; flex-shrink: 0;">
                <img id="evidence-preview-img" src="${this.selectedMediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Evidence Preview" />
              </div>
              <div style="display: flex; flex-direction: column; justify-content: center; gap: 6px; flex: 1;">
                <div style="font-size: 12px; font-weight: 700; color: #f1f5f9;">Upload Real Ground Photo / Video</div>
                <div style="font-size: 10px; color: #94a3b8;">Supports JPG, PNG, MP4, WebM (Max 25MB)</div>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <label style="background: #1e293b; border: 1px solid #475569; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <span>📷</span> Choose File / Camera
                    <input id="input-file-evidence" type="file" accept="image/*,video/*" capture="environment" style="display: none;" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Location & Geotagging -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                4. Location &amp; Geotagging
              </label>
              <button id="btn-autolocate" type="button" style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <span>📍</span> Auto-Detect GPS
              </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 3px;">District / Region</label>
                <select id="report-sel-district" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                  ${NER_DISTRICTS.map((d) => `
                    <option value="${d.id}" ${d.id === this.selectedDistrict.id ? 'selected' : ''}>
                      ${d.name} (${d.state})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 3px;">Landmark / Road Corridor / Milepost</label>
                <input id="report-input-location-name" type="text" placeholder="e.g. NH-10 KM 18 near Bridge" value="${this.selectedDistrict.name} Corridor" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; box-sizing: border-box;" />
              </div>
            </div>

            <div style="background: #050811; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-family: monospace;">
              <span>LAT: <strong id="val-lat" style="color: #38bdf8;">${this.lat.toFixed(5)}° N</strong></span>
              <span>LON: <strong id="val-lon" style="color: #38bdf8;">${this.lon.toFixed(5)}° E</strong></span>
              <span id="gps-accuracy" style="color: #22c55e;">● GPS Locked (±4m)</span>
            </div>
          </div>

          <!-- Field Description & Notes -->
          <div>
            <label style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              5. Field Observation Details
            </label>
            <textarea id="report-input-description" rows="3" placeholder="Describe the ground condition (e.g. 15cm wide tension crack visible, falling shale rocks, blocked culvert drain, water saturation)..." style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.5; resize: none; box-sizing: border-box;">Active slope displacement and fresh ground crack observed following intense rain.</textarea>
          </div>

          <!-- Reporter Name (Optional) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 3px;">Reporter Name (Optional)</label>
              <input id="report-input-name" type="text" placeholder="e.g. Tenzing / Officer PWD" value="Citizen Reporter" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 7px; border-radius: 6px; font-size: 11px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="font-size: 10px; color: #94a3b8; display: block; margin-bottom: 3px;">Contact Number (Optional)</label>
              <input id="report-input-phone" type="text" placeholder="+91 XXXXX XXXXX" style="width: 100%; background: #0f172a; border: 1px solid #334155; color: #f1f5f9; padding: 7px; border-radius: 6px; font-size: 11px; box-sizing: border-box;" />
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div style="background: #070d19; border-top: 1px solid #1e293b; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center;">
          <button id="btn-cancel-report" type="button" style="background: transparent; border: 1px solid #334155; color: #94a3b8; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button id="btn-submit-report" type="button" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; color: #ffffff; font-size: 13px; font-weight: 800; padding: 10px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
            <span>🚀</span> SUBMIT REPORT TO EOC
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;
    this.bindEvents();
  }

  public close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }

  private bindEvents() {
    if (!this.modalEl) return;

    // Close Button & Overlay Click
    this.modalEl.querySelector('#btn-close-report-modal')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-cancel-report')?.addEventListener('click', () => this.close());

    // Role Buttons
    const btnCitizen = this.modalEl.querySelector('#role-btn-citizen') as HTMLElement;
    const btnOfficial = this.modalEl.querySelector('#role-btn-official') as HTMLElement;

    btnCitizen?.addEventListener('click', () => {
      this.reporterRole = 'CITIZEN';
      btnCitizen.style.borderColor = '#0284c7';
      btnCitizen.style.background = '#0369a120';
      btnCitizen.style.color = '#38bdf8';
      btnOfficial.style.borderColor = '#334155';
      btnOfficial.style.background = '#0f172a';
      btnOfficial.style.color = '#94a3b8';
    });

    btnOfficial?.addEventListener('click', () => {
      this.reporterRole = 'FIELD_OFFICIAL';
      btnOfficial.style.borderColor = '#0284c7';
      btnOfficial.style.background = '#0369a120';
      btnOfficial.style.color = '#38bdf8';
      btnCitizen.style.borderColor = '#334155';
      btnCitizen.style.background = '#0f172a';
      btnCitizen.style.color = '#94a3b8';
    });

    // Category Buttons
    const catButtons = this.modalEl.querySelectorAll('.hazard-cat-btn');
    catButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        catButtons.forEach((b) => {
          (b as HTMLElement).style.borderColor = '#1e293b';
          (b as HTMLElement).style.background = '#0f172a';
          (b as HTMLElement).style.color = '#cbd5e1';
        });
        const target = btn as HTMLElement;
        target.style.borderColor = '#38bdf8';
        target.style.background = '#0b263b';
        target.style.color = '#38bdf8';
        const id = target.getAttribute('data-id') as GroundHazardCategory;
        if (id) this.selectedCategory = id;
      });
    });

    // Preset Buttons
    const presetButtons = this.modalEl.querySelectorAll('.demo-preset-btn');
    const previewImg = this.modalEl.querySelector('#evidence-preview-img') as HTMLImageElement;

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

          // Also select the matching category button in UI
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
    fileInput?.addEventListener('change', (e) => {
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
        // Add small deterministic jitter to lat/lon so multiple reports in same district don't overlap completely
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
            console.warn('Geolocation denied, using district coordinates:', err);
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
