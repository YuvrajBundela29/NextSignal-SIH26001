import type { AppViewMode, CitizenProfile, NerState } from '../../services/landslide/types';
import { NER_DISTRICTS } from '../../services/landslide/ner-districts';
import { getLocalAreasForDistrict } from '../../services/landslide/local-areas';

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
      <div id="role-select-scroll-container" style="min-height: 100vh; min-height: 100dvh; width: 100%; position: relative; background: #030712; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: clamp(24px, 4.5vw, 44px) clamp(14px, 3.5vw, 24px) 80px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch;">
        
        <!-- Blurry Indian Tricolor Flag Background Mesh Layers -->
        <!-- 1. Top Saffron (Kesari) Glow -->
        <div style="position: fixed; top: -140px; left: 0; width: 100vw; height: 420px; background: radial-gradient(ellipse 90% 75% at 30% 20%, rgba(255, 120, 20, 0.58) 0%, rgba(255, 153, 51, 0.3) 45%, transparent 75%); filter: blur(90px); pointer-events: none; z-index: 1;"></div>
        
        <!-- 2. Middle White & Ashoka Chakra Blue Glow -->
        <div style="position: fixed; top: 30%; left: 0; width: 100vw; height: 360px; background: radial-gradient(ellipse 85% 65% at 70% 50%, rgba(255, 255, 255, 0.32) 0%, rgba(37, 99, 235, 0.28) 45%, transparent 75%); filter: blur(100px); pointer-events: none; z-index: 1;"></div>
        
        <!-- 3. Bottom India Green Glow -->
        <div style="position: fixed; bottom: -140px; left: 0; width: 100vw; height: 420px; background: radial-gradient(ellipse 90% 75% at 35% 80%, rgba(19, 136, 8, 0.6) 0%, rgba(4, 120, 60, 0.32) 45%, transparent 75%); filter: blur(90px); pointer-events: none; z-index: 1;"></div>
        
        <!-- 4. Soft Frosted Vignette for Ultra Contrast -->
        <div style="position: fixed; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(3, 7, 18, 0.25) 0%, rgba(3, 7, 18, 0.72) 100%); pointer-events: none; z-index: 2;"></div>

        <!-- Content Container (Elevated Above Tricolor Mesh) -->
        <div style="position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Header & Branding -->
        <div style="text-align: center; margin-bottom: clamp(20px, 4vh, 36px); max-width: 620px; width: 100%;">
          <!-- Official Government of India & MDoNER Installed Logos -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 16px; gap: 8px;">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 28px rgba(255, 153, 51, 0.55), 0 0 0 3px #ff9933, 0 0 0 5px #138808; padding: 7px; box-sizing: border-box;">
              <img src="/emblem-of-india.svg" alt="State Emblem of India" style="height: 100%; width: auto; object-fit: contain;" />
            </div>

            <div style="text-align: center;">
              <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; color: #ff9933; text-transform: uppercase;">
                GOVERNMENT OF INDIA
              </div>
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.8px; color: #ffffff; text-transform: uppercase; margin-top: 2px;">
                MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION (MDoNER)
              </div>
              <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 5px; background: rgba(19, 136, 8, 0.2); border: 1px solid rgba(19, 136, 8, 0.5); padding: 3px 12px; border-radius: 20px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
                <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.6px; color: #4ade80; text-transform: uppercase;">
                  SMART INDIA HACKATHON 2026 &bull; SIH 26001
                </span>
              </div>
            </div>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(2, 132, 199, 0.5); font-size: 22px;">
              🏔️
            </div>
            <h1 style="font-size: clamp(24px, 5.5vw, 34px); font-weight: 900; letter-spacing: -0.5px; margin: 0; background: linear-gradient(180deg, #ffffff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              NEXSIGNAL
            </h1>
          </div>
          
          <div style="font-size: clamp(10px, 2.2vw, 12px); font-weight: 800; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase; margin-bottom: 10px;">
            GEOSPATIAL DISASTER INTELLIGENCE &bull; SIH 26001
          </div>

          <p style="font-size: clamp(13px, 2.8vw, 15px); color: #cbd5e1; margin: 0 auto; line-height: 1.5; padding: 0 8px;">
            AI-powered landslide risk early warning network for Northeast India
          </p>
        </div>

        <!-- 2-Role Cards Container -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 420px)); gap: 20px; width: 100%; max-width: 900px; justify-content: center; margin-bottom: 28px; box-sizing: border-box;">
          
          <!-- Role A: Government / Admin -->
          <div class="role-selection-card" style="background: rgba(11, 17, 32, 0.85); backdrop-filter: blur(16px); border: 1px solid #1e293b; border-radius: 16px; padding: clamp(20px, 4vw, 26px) clamp(16px, 3.5vw, 22px); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; box-shadow: 0 12px 36px rgba(0,0,0,0.6); position: relative; overflow: hidden; box-sizing: border-box; width: 100%;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 46px; height: 46px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(255, 153, 51, 0.5), 0 0 0 2px #ff9933; padding: 4px; box-sizing: border-box; flex-shrink: 0;">
                    <img src="/emblem-of-india.svg" alt="State Emblem of India" style="height: 100%; width: auto; object-fit: contain;" />
                  </div>
                  <div>
                    <span style="background: rgba(2, 132, 199, 0.2); border: 1px solid #0284c7; color: #38bdf8; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      OFFICIAL PORTAL
                    </span>
                    <div style="font-size: 10px; font-weight: 800; color: #ff9933; margin-top: 2px; letter-spacing: 0.4px;">
                      MDoNER &bull; NDRF &bull; SDMA
                    </div>
                  </div>
                </div>
                <span style="background: rgba(255, 153, 51, 0.15); border: 1px solid rgba(255, 153, 51, 0.4); padding: 4px 10px; border-radius: 6px; color: #ff9933; font-weight: 800; font-size: 10px; letter-spacing: 0.5px;">
                  RESTRICTED
                </span>
              </div>

              <h2 style="font-size: clamp(19px, 4vw, 22px); font-weight: 800; color: #ffffff; margin: 0 0 4px;">
                Government / Admin
              </h2>
              <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 10px;">
                Regional Disaster Intelligence
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 18px; line-height: 1.5;">
                Monitor the entire Northeast Region. Analyse risk, infrastructure, roads, citizen reports, and emergency priorities.
              </p>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800; flex-shrink: 0;">✓</span> 28 Northeast Districts Multi-Hazard HUD
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800; flex-shrink: 0;">✓</span> 2D Tactical GIS &amp; 3D Planetary Globe
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800; flex-shrink: 0;">✓</span> Highway Corridors &amp; Safe Shelters
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800; flex-shrink: 0;">✓</span> Citizen Ground Reports Verification &amp; NDRF
                </div>
              </div>
            </div>

            <button id="btn-select-gov" style="width: 100%; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; color: #ffffff; font-size: 13px; font-weight: 800; padding: 13px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4); touch-action: manipulation; box-sizing: border-box;">
              ENTER GOVERNMENT COMMAND &rarr;
            </button>
          </div>

          <!-- Role B: Citizen Portal -->
          <div class="role-selection-card" style="background: rgba(11, 17, 32, 0.85); backdrop-filter: blur(16px); border: 1px solid #1e293b; border-radius: 16px; padding: clamp(20px, 4vw, 26px) clamp(16px, 3.5vw, 22px); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 12px 36px rgba(0,0,0,0.6); position: relative; overflow: hidden; box-sizing: border-box; width: 100%;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #22c55e, #10b981);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span style="background: #22c55e20; border: 1px solid #22c55e; color: #4ade80; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  PUBLIC SAFETY
                </span>
                <span style="font-size: 24px;">🛡️</span>
              </div>

              <h2 style="font-size: clamp(19px, 4vw, 22px); font-weight: 800; color: #ffffff; margin: 0 0 4px;">
                Citizen Portal
              </h2>
              <div style="font-size: 12px; font-weight: 700; color: #4ade80; margin-bottom: 10px;">
                Community Safety &amp; Ground Alerts
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 18px; line-height: 1.5;">
                Local early warnings for residents, tourists and field teams. Check your slope safety and upload ground evidence.
              </p>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800; flex-shrink: 0;">✓</span> Local Landslide Trigger Level &amp; Rain Status
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800; flex-shrink: 0;">✓</span> 8-Language Multilingual Safety Guidelines
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800; flex-shrink: 0;">✓</span> Geo-Tagged Ground Hazard Reporting (Photos)
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800; flex-shrink: 0;">✓</span> Safe Evacuation Shelters &amp; Helpline
                </div>
              </div>
            </div>

            <button id="btn-select-cit" style="width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border: 1px solid #4ade80; color: #ffffff; font-size: 13px; font-weight: 800; padding: 13px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4); touch-action: manipulation; box-sizing: border-box;">
              ENTER CITIZEN PORTAL &rarr;
            </button>
          </div>

        </div>

        <!-- Footer Info -->
        <div style="text-align: center; font-size: 11px; color: #cbd5e1; max-width: 600px; padding: 0 10px; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">
          Smart India Hackathon 2026 &bull; SIH 26001 Prototype &bull; Zero login or registration required.
        </div>

        </div><!-- End elevated content container -->

      </div>

      <style>
        .role-selection-card:hover {
          transform: translateY(-3px);
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
      name: '',
      state: 'Sikkim',
      districtId: 'sk_mangan',
      districtName: 'Mangan (North Sikkim)',
      localArea: 'Chungthang (Teesta / NH-10)',
      lat: 27.5167,
      lon: 88.5333,
    };

    if (cachedProfileStr) {
      try {
        const parsed = JSON.parse(cachedProfileStr);
        if (parsed.name === 'Yuvraj') {
          parsed.name = '';
        }
        defaultProfile = { ...defaultProfile, ...parsed };
      } catch (e) {
        console.warn('Could not parse cached citizen profile', e);
      }
    }

    const allStates: NerState[] = ['Sikkim', 'Meghalaya', 'Assam', 'Manipur', 'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Tripura'];

    container.innerHTML = `
      <div id="citizen-setup-scroll-container" style="min-height: 100vh; min-height: 100dvh; width: 100%; position: relative; background: #030712; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: clamp(20px, 4vw, 36px) clamp(12px, 3.5vw, 20px) 90px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch;">
        
        <!-- Blurry Indian Tricolor Flag Background Mesh Layers -->
        <div style="position: fixed; top: -140px; left: 0; width: 100vw; height: 400px; background: radial-gradient(ellipse 90% 75% at 30% 20%, rgba(255, 120, 20, 0.55) 0%, rgba(255, 153, 51, 0.3) 45%, transparent 75%); filter: blur(90px); pointer-events: none; z-index: 1;"></div>
        <div style="position: fixed; top: 30%; left: 0; width: 100vw; height: 350px; background: radial-gradient(ellipse 85% 65% at 70% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(37, 99, 235, 0.25) 45%, transparent 75%); filter: blur(100px); pointer-events: none; z-index: 1;"></div>
        <div style="position: fixed; bottom: -140px; left: 0; width: 100vw; height: 400px; background: radial-gradient(ellipse 90% 75% at 35% 80%, rgba(19, 136, 8, 0.58) 0%, rgba(4, 120, 60, 0.3) 45%, transparent 75%); filter: blur(90px); pointer-events: none; z-index: 1;"></div>
        <div style="position: fixed; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(3, 7, 18, 0.25) 0%, rgba(3, 7, 18, 0.72) 100%); pointer-events: none; z-index: 2;"></div>

        <!-- Elevate content above mesh -->
        <div style="position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center;">
        
        <div style="width: 100%; max-width: 480px; background: #0b1120; border: 1px solid #1e293b; border-radius: 18px; padding: clamp(20px, 4vw, 28px) clamp(16px, 3.5vw, 24px); box-shadow: 0 16px 40px rgba(0,0,0,0.7); box-sizing: border-box; position: relative;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">📍</span>
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #22c55e; text-transform: uppercase;">
                CITIZEN ONBOARDING
              </span>
            </div>
            <button id="btn-back-to-roles" style="background: transparent; border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 6px; cursor: pointer; touch-action: manipulation;">
              &larr; Back
            </button>
          </div>

          <h2 style="font-size: clamp(18px, 4vw, 21px); font-weight: 800; color: #ffffff; margin: 0 0 6px;">
            Set your local area
          </h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px; line-height: 1.5;">
            Receive local warnings, rainfall triggers, and nearest safe shelters tailored to your settlement.
          </p>

          <!-- Field 1: Name -->
          <div style="margin-bottom: 18px;">
            <label style="display: block; font-size: 11px; font-weight: 800; color: #cbd5e1; margin-bottom: 6px; letter-spacing: 0.5px;">
              YOUR NAME
            </label>
            <input id="input-cit-name" type="text" value="${defaultProfile.name || ''}" placeholder="Enter your name" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 11px 14px; font-size: 14px; color: #ffffff; box-sizing: border-box; outline: none;" />
          </div>

          <!-- Location Choice -->
          <div style="margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <label style="font-size: 11px; font-weight: 800; color: #cbd5e1; letter-spacing: 0.5px;">
                YOUR LOCATION
              </label>
              <button id="btn-use-gps" style="background: #22c55e15; border: 1px solid #22c55e; color: #22c55e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; touch-action: manipulation;">
                <span>📡</span> Auto-Detect GPS
              </button>
            </div>

            <!-- State Selector -->
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">STATE</label>
              <select id="sel-cit-state" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
                ${allStates.map((st) => `<option value="${st}" ${st === defaultProfile.state ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>

            <!-- District Selector -->
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">DISTRICT</label>
              <select id="sel-cit-district" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
              </select>
            </div>

            <!-- Local Area Selector -->
            <div>
              <label style="display: block; font-size: 10px; font-weight: 700; color: #94a3b8; margin-bottom: 4px;">LOCAL AREA / SETTLEMENT</label>
              <select id="sel-cit-local-area" style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #ffffff; box-sizing: border-box; outline: none;">
              </select>
            </div>
          </div>

          <!-- Submit Button -->
          <button id="btn-start-citizen-portal" style="width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border: 1px solid #4ade80; color: #ffffff; font-size: 13px; font-weight: 800; padding: 13px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(22, 163, 74, 0.4); margin-top: 22px; touch-action: manipulation; box-sizing: border-box;">
            CONTINUE TO CITIZEN PORTAL &rarr;
          </button>

        </div>

        </div><!-- End elevated citizen setup wrapper -->
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

    // Auto GPS geolocation
    btnGps?.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        btnGps.textContent = 'Acquiring GPS...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            btnGps.textContent = '✓ GPS Locked';
            const userLat = pos.coords.latitude;
            const userLon = pos.coords.longitude;

            let closestDist = NER_DISTRICTS[0];
            let minDist = Infinity;
            NER_DISTRICTS.forEach((d) => {
              const dist = Math.hypot(d.lat - userLat, d.lon - userLon);
              if (dist < minDist) {
                minDist = dist;
                closestDist = d;
              }
            });

            selState.value = closestDist.state;
            updateDistricts();
            selDistrict.value = closestDist.id;
            updateLocalAreas();
          },
          (err) => {
            console.warn('GPS failed', err);
            btnGps.textContent = 'GPS Unavailable';
            setTimeout(() => {
              btnGps.textContent = '📡 Auto-Detect GPS';
            }, 2000);
          },
          { timeout: 8000 }
        );
      }
    });

    btnSubmit?.addEventListener('click', () => {
      const selectedDistrict = NER_DISTRICTS.find((d) => d.id === selDistrict.value) || NER_DISTRICTS[0];
      const areaName = selLocalArea.value || selectedDistrict.name;
      const allAreas = getLocalAreasForDistrict(selectedDistrict.id);
      const chosenArea = allAreas.find((a) => a.name === areaName);

      const profile: CitizenProfile = {
        name: inputName.value.trim() || 'Citizen',
        state: selState.value as NerState,
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        localArea: areaName,
        lat: chosenArea ? selectedDistrict.lat + chosenArea.latOffset : selectedDistrict.lat,
        lon: chosenArea ? selectedDistrict.lon + chosenArea.lonOffset : selectedDistrict.lon,
      };

      localStorage.setItem('nexsignal_citizen_profile', JSON.stringify(profile));
      this.onSelectRole('citizen', profile);
    });

    // Initialize lists
    updateDistricts();
  }
}
