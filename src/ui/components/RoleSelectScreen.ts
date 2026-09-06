import type { AppViewMode, CitizenProfile, NerState } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import { NER_LOCAL_AREAS, getLocalAreasForDistrict } from '../../services/landslide/local-areas';

export class RoleSelectScreen {
  private containerId: string;
  private onSelectRole: (role: AppViewMode, profile?: CitizenProfile) => void;
  private isLocationSetup: boolean = false;

  constructor(containerId: string, onSelectRole: (role: AppViewMode, profile?: CitizenProfile) => void) {
    this.containerId = containerId;
    this.onSelectRole = onSelectRole;
  }

  public render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.isLocationSetup) {
      this.renderCitizenLocationSetup(container);
    } else {
      this.renderRoleCards(container);
    }
  }

  private renderRoleCards(container: HTMLElement) {
    container.innerHTML = `
      <div style="min-height: 100vh; width: 100%; background: radial-gradient(circle at 50% 20%, #0c192e 0%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; animation: fadeIn 0.4s ease;">
        
        <!-- Header & Branding -->
        <div style="text-align: center; margin-bottom: 36px;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(2, 132, 199, 0.5); font-size: 24px;">
              ⚡
            </div>
            <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -0.5px; margin: 0; background: linear-gradient(180deg, #ffffff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              NEXSIGNAL
            </h1>
          </div>
          
          <div style="font-size: 13px; font-weight: 800; letter-spacing: 2.5px; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">
            GEOSPATIAL DISASTER INTELLIGENCE
          </div>

          <p style="font-size: 15px; color: #cbd5e1; max-width: 580px; margin: 0 auto; line-height: 1.6;">
            &ldquo;AI-powered landslide risk intelligence for safer communities and faster response.&rdquo;
          </p>
        </div>

        <!-- 2-Role Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 420px)); gap: 28px; width: 100%; max-width: 920px; justify-content: center; margin-bottom: 32px;">
          
          <!-- Role A: Government / Admin -->
          <div class="role-selection-card" style="background: linear-gradient(180deg, #0b1120 0%, #050811 100%); border: 1px solid #1e293b; border-radius: 18px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 12px 36px rgba(0,0,0,0.6); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  DECISION SUPPORT
                </span>
                <span style="font-size: 26px;">🏛️</span>
              </div>

              <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
                Government / Admin
              </h2>
              <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">
                Regional Disaster Intelligence
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px; line-height: 1.55;">
                Monitor the entire Northeast Region. Analyse risk, infrastructure, roads, reports, alerts and emergency response priorities.
              </p>

              <div style="display: flex; flex-direction: column; gap: 9px; margin-bottom: 26px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> 28 Northeast Districts Multi-Hazard HUD
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> 2D Tactical GIS &amp; 3D Planetary Globe
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> Highway Corridors &amp; Safe Shelters
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> Citizen Ground Reports Verification &amp; SDRF Escalation
                </div>
              </div>
            </div>

            <button id="btn-select-gov" style="width: 100%; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; color: #ffffff; font-size: 13px; font-weight: 800; padding: 13px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4); transition: transform 0.15s ease;">
              ENTER GOVERNMENT PORTAL &rarr;
            </button>
          </div>

          <!-- Role B: Citizen -->
          <div class="role-selection-card" style="background: linear-gradient(180deg, #0b1120 0%, #050811 100%); border: 1px solid #1e293b; border-radius: 18px; padding: 28px 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 12px 36px rgba(0,0,0,0.6); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #22c55e, #38bdf8);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="background: #22c55e20; border: 1px solid #22c55e; color: #22c55e; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  COMMUNITY SAFETY
                </span>
                <span style="font-size: 26px;">📱</span>
              </div>

              <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
                Citizen
              </h2>
              <div style="font-size: 13px; font-weight: 700; color: #22c55e; margin-bottom: 12px;">
                Local Safety &amp; Hazard Reporting
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px; line-height: 1.55;">
                Check the risk around your area, receive local warnings and report ground conditions to authorities.
              </p>

              <div style="display: flex; flex-direction: column; gap: 9px; margin-bottom: 26px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Hyper-Local Safety Assessment (&ldquo;Is my area safe right now?&rdquo;)
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Live 24h Rain Telemetry &amp; Local Landslide Trigger Level
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> 8-Language Multilingual Safety Guidelines
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Geo-Tagged Ground Hazard Reporting (Photos &amp; Videos)
                </div>
              </div>
            </div>

            <button id="btn-select-cit" style="width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border: 1px solid #4ade80; color: #ffffff; font-size: 13px; font-weight: 800; padding: 13px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4); transition: transform 0.15s ease;">
              ENTER CITIZEN PORTAL &rarr;
            </button>
          </div>

        </div>

        <!-- Footer Info -->
        <div style="text-align: center; font-size: 11px; color: #64748b; max-width: 600px;">
          Smart India Hackathon 2026 &bull; SIH 26001 Prototype &bull; No password or registration required.
        </div>

      </div>

      <style>
        .role-selection-card:hover {
          transform: translateY(-4px);
          border-color: #38bdf850 !important;
        }
      </style>
    `;

    document.getElementById('btn-select-gov')?.addEventListener('click', () => {
      this.onSelectRole('authority');
    });

    document.getElementById('btn-select-cit')?.addEventListener('click', () => {
      this.isLocationSetup = true;
      this.render();
    });
  }

  private renderCitizenLocationSetup(container: HTMLElement) {
    const cachedProfileStr = localStorage.getItem('nexsignal_citizen_profile');
    let defaultProfile: CitizenProfile = {
      name: 'Yuvraj',
      state: 'Sikkim',
      districtId: 'sk_mangan',
      districtName: 'Mangan (North Sikkim)',
      localArea: 'Chungthang (Teesta / NH-10)',
      lat: 27.5167,
      lon: 88.5333,
    };

    if (cachedProfileStr) {
      try {
        defaultProfile = { ...defaultProfile, ...JSON.parse(cachedProfileStr) };
      } catch (e) {
        console.warn('Could not parse cached citizen profile', e);
      }
    }

    const allStates: NerState[] = ['Sikkim', 'Meghalaya', 'Assam', 'Manipur', 'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Tripura'];

    container.innerHTML = `
      <div style="min-height: 100vh; width: 100%; background: radial-gradient(circle at 50% 20%, #0c192e 0%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; animation: fadeIn 0.3s ease;">
        
        <div style="width: 100%; max-width: 520px; background: #0b1120; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); position: relative;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">📱</span>
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #22c55e; text-transform: uppercase;">
                CITIZEN ONBOARDING
              </span>
            </div>
            <button id="btn-back-to-roles" style="background: transparent; border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; cursor: pointer;">
              &larr; Back
            </button>
          </div>

          <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
            Let&rsquo;s personalise NexSignal for your area
          </h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0 0 24px; line-height: 1.5;">
            Receive local warnings, rainfall trigger status, and nearest evacuation information tailored to your settlement.
          </p>

          <!-- Field 1: Name -->
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">
              YOUR NAME
            </label>
            <input id="input-cit-name" type="text" value="${defaultProfile.name}" placeholder="Enter your name" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 11px 14px; font-size: 14px; color: #ffffff; box-sizing: border-box; outline: none;" />
          </div>

          <!-- Location Choice -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <label style="font-size: 12px; font-weight: 700; color: #cbd5e1;">
                YOUR LOCATION
              </label>
              <button id="btn-use-gps" style="background: #22c55e15; border: 1px solid #22c55e; color: #22c55e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <span>📍</span> Auto-Detect GPS
              </button>
            </div>

            <!-- State Selector -->
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">STATE</label>
              <select id="sel-cit-state" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
                ${allStates.map((st) => `<option value="${st}" ${st === defaultProfile.state ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>

            <!-- District Selector -->
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">DISTRICT</label>
              <select id="sel-cit-district" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
              </select>
            </div>

            <!-- Local Area Selector -->
            <div>
              <label style="display: block; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">LOCAL AREA / TOWN / VILLAGE</label>
              <select id="sel-cit-local-area" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
              </select>
            </div>
          </div>

          <!-- Submit Button -->
          <button id="btn-start-citizen-portal" style="width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border: 1px solid #4ade80; color: #ffffff; font-size: 14px; font-weight: 800; padding: 14px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(22, 163, 74, 0.4); margin-top: 24px;">
            CONTINUE TO MY SAFETY DASHBOARD &rarr;
          </button>

        </div>

      </div>
    `;

    this.bindLocationSetupEvents(defaultProfile);
  }

  private bindLocationSetupEvents(defaultProfile: CitizenProfile) {
    const selState = document.getElementById('sel-cit-state') as HTMLSelectElement;
    const selDistrict = document.getElementById('sel-cit-district') as HTMLSelectElement;
    const selLocalArea = document.getElementById('sel-cit-local-area') as HTMLSelectElement;
    const btnBack = document.getElementById('btn-back-to-roles');
    const btnGps = document.getElementById('btn-use-gps');
    const btnSubmit = document.getElementById('btn-start-citizen-portal');
    const inputName = document.getElementById('input-cit-name') as HTMLInputElement;

    btnBack?.addEventListener('click', () => {
      this.isLocationSetup = false;
      this.render();
    });

    const updateDistricts = () => {
      const selectedState = selState.value as NerState;
      const stateDistricts = NER_DISTRICTS.filter((d) => d.state === selectedState);
      
      selDistrict.innerHTML = stateDistricts
        .map((d) => `<option value="${d.id}" ${d.id === defaultProfile.districtId ? 'selected' : ''}>${d.name}</option>`)
        .join('');

      updateLocalAreas();
    };

    const updateLocalAreas = () => {
      const districtId = selDistrict.value || defaultProfile.districtId;
      const areas = getLocalAreasForDistrict(districtId);

      selLocalArea.innerHTML = areas
        .map((a) => `<option value="${a.name}" ${a.name === defaultProfile.localArea ? 'selected' : ''}>${a.name}</option>`)
        .join('');
    };

    selState?.addEventListener('change', () => {
      updateDistricts();
    });

    selDistrict?.addEventListener('change', () => {
      updateLocalAreas();
    });

    // Initialize dropdowns
    updateDistricts();

    // Auto-detect GPS
    btnGps?.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        btnGps.textContent = '🛰️ Finding...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            let closestDist = NER_DISTRICTS[0];
            let minDist = Infinity;
            NER_DISTRICTS.forEach((d) => {
              const dist = Math.hypot(d.lat - pos.coords.latitude, d.lon - pos.coords.longitude);
              if (dist < minDist) {
                minDist = dist;
                closestDist = d;
              }
            });

            selState.value = closestDist.state;
            updateDistricts();
            selDistrict.value = closestDist.id;
            updateLocalAreas();
            btnGps.textContent = `✓ ${closestDist.name}`;
          },
          (err) => {
            console.warn('Geolocation error:', err);
            btnGps.textContent = '📍 East Khasi Hills';
            selState.value = 'Meghalaya';
            updateDistricts();
            selDistrict.value = 'ml_east_khasi';
            updateLocalAreas();
          },
          { timeout: 5000 }
        );
      }
    });

    // Submit profile
    btnSubmit?.addEventListener('click', () => {
      const dist = NER_DISTRICTS.find((d) => d.id === selDistrict.value) || NER_DISTRICTS[0];
      const localAreaName = selLocalArea.value || dist.name;
      const localAreasList = getLocalAreasForDistrict(dist.id);
      const matchedArea = localAreasList.find((a) => a.name === localAreaName);

      const profile: CitizenProfile = {
        name: inputName?.value.trim() || 'Citizen',
        state: dist.state,
        districtId: dist.id,
        districtName: dist.name,
        localArea: localAreaName,
        lat: dist.lat + (matchedArea?.latOffset || 0),
        lon: dist.lon + (matchedArea?.lonOffset || 0),
      };

      localStorage.setItem('nexsignal_citizen_profile', JSON.stringify(profile));
      this.onSelectRole('citizen', profile);
    });
  }
}
