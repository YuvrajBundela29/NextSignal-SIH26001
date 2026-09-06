import type { AppViewMode } from '../../services/landslide/types';

export class RoleSelectScreen {
  private container: HTMLElement;
  private onSelectRole: (role: AppViewMode) => void;

  constructor(containerId: string, onSelectRole: (role: AppViewMode) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;
    this.onSelectRole = onSelectRole;
  }

  public render() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; width: 100%; background: radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #f8fafc;">
        
        <!-- Header & SIH Attribution -->
        <div style="text-align: center; max-width: 780px; margin-bottom: 32px;">
          
          <div style="display: inline-flex; align-items: center; gap: 8px; background: #0284c715; border: 1px solid #0284c740; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 14px; letter-spacing: 0.5px;">
            <span>🇮🇳</span> SIH26001 &bull; Ministry of Development of North Eastern Region (MDoNER)
          </div>

          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 4px;">
            <span style="font-size: 28px;">⚡</span>
            <h1 style="font-size: 32px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin: 0;">
              NexSignal
            </h1>
          </div>

          <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">
            GEOSPATIAL DISASTER INTELLIGENCE &bull; NER INDIA
          </div>

          <p style="font-size: 14px; color: #94a3b8; max-width: 620px; margin: 0 auto; line-height: 1.6;">
            AI-Powered Early Warning &amp; Landslide Risk Monitoring Platform with Two-Way Ground Truth Verification.
            Select your operational portal to enter:
          </p>
        </div>

        <!-- 2-Role Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 420px)); gap: 24px; width: 100%; max-width: 900px; justify-content: center; margin-bottom: 28px;">
          
          <!-- Role A: Government / Admin -->
          <div class="role-selection-card" style="background: linear-gradient(180deg, #0b1120 0%, #050811 100%); border: 1px solid #1e293b; border-radius: 16px; padding: 26px 22px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  DECISION SUPPORT
                </span>
                <span style="font-size: 24px;">🏛️</span>
              </div>

              <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
                Government / Admin
              </h2>
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 18px; line-height: 1.5;">
                Full regional monitoring, risk analysis, emergency intelligence and response tools for State &amp; District Administration (SDMA, DEOC, NDRF/SDRF).
              </p>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> 28 Northeast India Districts Multi-Hazard Telemetry
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> 5-Factor Risk Engine (Rain, Soil, Slope, Quakes, History)
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> 2D Tactical GIS &amp; 3D High-DPI Satellite Globe
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> Critical Road Corridors &amp; Safe Shelters
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #38bdf8; font-weight: 800;">✓</span> Citizen Ground Reports Verification &amp; SDRF Escalation
                </div>
              </div>
            </div>

            <button id="btn-select-gov" style="width: 100%; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; color: #ffffff; font-size: 13px; font-weight: 800; padding: 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4); transition: transform 0.15s ease;">
              CONTINUE AS GOVERNMENT &rarr;
            </button>
          </div>

          <!-- Role B: Citizen -->
          <div class="role-selection-card" style="background: linear-gradient(180deg, #0b1120 0%, #050811 100%); border: 1px solid #1e293b; border-radius: 16px; padding: 26px 22px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #22c55e, #38bdf8);"></div>
            
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span style="background: #22c55e20; border: 1px solid #22c55e; color: #22c55e; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  COMMUNITY SAFETY
                </span>
                <span style="font-size: 24px;">📱</span>
              </div>

              <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 6px;">
                Citizen Portal
              </h2>
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 18px; line-height: 1.5;">
                Local-area safety information, warnings, highway alerts and ground-condition reporting for residents and commuters.
              </p>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Hyper-Local Safety Assessment (&ldquo;Is my area safe right now?&rdquo;)
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Geolocation Auto-Detection &amp; District Safety Check
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Live 24h Rain Telemetry &amp; Landslide Warning Level
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> 8-Language Multilingual Safety Guidelines
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1;">
                  <span style="color: #22c55e; font-weight: 800;">✓</span> Geo-Tagged Ground Hazard Reporting (Photos &amp; Videos)
                </div>
              </div>
            </div>

            <button id="btn-select-cit" style="width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border: 1px solid #4ade80; color: #ffffff; font-size: 13px; font-weight: 800; padding: 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4); transition: transform 0.15s ease;">
              CONTINUE AS CITIZEN &rarr;
            </button>
          </div>

        </div>

        <!-- Footer Info -->
        <div style="text-align: center; font-size: 11px; color: #64748b; max-width: 600px;">
          Prototype Demonstration &bull; No password or registration required. Roles can be switched anytime during evaluation.
        </div>

      </div>

      <style>
        .role-selection-card:hover {
          transform: translateY(-4px);
          border-color: #38bdf840 !important;
        }
      </style>
    `;

    document.getElementById('btn-select-gov')?.addEventListener('click', () => {
      this.onSelectRole('authority');
    });

    document.getElementById('btn-select-cit')?.addEventListener('click', () => {
      this.onSelectRole('citizen');
    });
  }
}
