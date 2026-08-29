import { NER_DISTRICTS, NER_STATES } from '../services/landslide/ner-districts';
import type {
  DistrictProfile,
  NerState,
  RiskScoreBreakdown,
  WeatherTelemetry,
  SoilTelemetry,
  SeismicTelemetry,
  AppViewMode,
  AppLanguage,
} from '../services/landslide/types';
import { fetchLiveWeather } from '../services/landslide/open-meteo';
import { fetchLiveSoilMoisture } from '../services/landslide/nasa-power';
import { fetchLiveSeismicData, computeDistrictSeismicTelemetry, type UsgsEarthquake } from '../services/landslide/usgs-seismic';
import { calculateLandslideRisk } from '../services/landslide/risk-engine';
import {
  getMockWeatherForDistrict,
  getMockSoilForDistrict,
  MOCK_EARTHQUAKES,
  type DemoScenario,
} from '../services/landslide/mock-telemetry';
import { alertsManager } from '../services/landslide/alerts-manager';
import { generateDistrictAiAdvisory, type AiAdvisoryResponse } from '../services/landslide/ollama-advisory';
import { NASA_COOLR_NER_EVENTS } from '../services/landslide/coolr-dataset';
import { NER_HIGHWAY_CORRIDORS } from '../services/landslide/highway-corridors';
import { NER_SAFE_SHELTERS } from '../services/landslide/safe-shelters';
import { UnifiedSituationMap } from './components/UnifiedSituationMap';
import { SatelliteIntelligenceDrawer } from './components/SatelliteIntelligenceDrawer';
import { DistrictHud } from './components/DistrictHud';
import { CitizenView } from './components/CitizenView';
import { AiTerminal } from './components/AiTerminal';
import { AlertTicker } from './components/AlertTicker';

export class LandslideDashboard {
  private container: HTMLElement;
  private viewMode: AppViewMode = 'authority';
  private rightTab: 'hud' | 'highways' | 'shelters' | 'ai' = 'hud';
  private lang: AppLanguage = 'en';
  private isOfflineDemo = false;
  private currentScenario: DemoScenario = 'monsoon_deluge';
  private selectedDistrictId = 'as_dima_hasao';
  private selectedStateFilter: 'ALL' | NerState = 'ALL';
  private searchQuery = '';
  private showSatDrawer = true;

  // Telemetry caches
  private riskMap = new Map<string, RiskScoreBreakdown>();
  private weatherMap = new Map<string, WeatherTelemetry>();
  private soilMap = new Map<string, SoilTelemetry>();
  private seismicMap = new Map<string, SeismicTelemetry>();
  private aiAdvisoryMap = new Map<string, AiAdvisoryResponse>();
  private liveEarthquakes: UsgsEarthquake[] = [];

  // UI Components
  private situationMapComp: UnifiedSituationMap | null = null;
  private satDrawerComp: SatelliteIntelligenceDrawer | null = null;
  private hudComp: DistrictHud | null = null;
  private citizenComp: CitizenView | null = null;
  private aiTerminalComp: AiTerminal | null = null;
  private alertTickerComp: AlertTicker | null = null;

  constructor(rootContainerId: string) {
    const root = document.getElementById(rootContainerId);
    if (!root) throw new Error(`Root #${rootContainerId} not found`);
    this.container = root;
    this.init();
  }

  public async init() {
    this.renderSkeleton();
    this.initComponents();
    this.bindGlobalEvents();

    this.populateInitialState();
    this.renderAllViews();

    void this.refreshLiveTelemetryBackground();
  }

  private getDistrictDisplayName(d: DistrictProfile): string {
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

  private renderSkeleton() {
    this.container.innerHTML = `
      <div id="landslide-app-root" style="display: flex; flex-direction: column; height: 100vh; width: 100vw; background: #030712; color: #f8fafc; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        
        <!-- Top App Header -->
        <header style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 6px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; min-height: 52px;">
          <!-- Branding -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #0284c7, #0369a1); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 12px rgba(2,132,199,0.5);">
              ⛰️
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                  NextSignal SIH26001
                </span>
                <span style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c744; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                  MDoNER &bull; Disaster Management
                </span>
              </div>
              <div style="font-size: 10px; color: #94a3b8;">
                AI-Based Early Warning & Landslide Risk Monitoring System in North Eastern Region (NER), India
              </div>
            </div>
          </div>

          <!-- Live Telemetry KPI Metrics -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 12px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">Districts</div>
              <div style="font-size: 13px; font-weight: 800; color: #f8fafc;">${NER_DISTRICTS.length}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 12px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">Active Alerts</div>
              <div id="stat-alerts-count" style="font-size: 13px; font-weight: 800; color: #ef4444;">0</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 12px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">Max Rainfall</div>
              <div id="stat-max-rain" style="font-size: 13px; font-weight: 800; color: #38bdf8;">-- mm</div>
            </div>
            <div style="text-align: center; padding-right: 4px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">72h Quakes</div>
              <div id="stat-quakes-count" style="font-size: 13px; font-weight: 800; color: #a855f7;">--</div>
            </div>
          </div>

          <!-- Controls: Mode Switch, Language, SIH Audit -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- SIH Compliance Modal Button -->
            <button id="btn-sih-compliance" style="background: linear-gradient(135deg, #059669, #047857); border: none; color: white; padding: 5px 10px; font-size: 11px; font-weight: 800; border-radius: 4px; cursor: pointer; box-shadow: 0 0 10px rgba(5,150,105,0.4);">
              🏆 SIH Audit
            </button>

            <!-- Telemetry Data Mode Selector -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px;">
              <span style="font-size: 9px; color: #94a3b8; margin-right: 4px;">Feed:</span>
              <select id="sel-scenario" style="background: transparent; color: #38bdf8; border: none; font-size: 10px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="live" ${!this.isOfflineDemo ? 'selected' : ''}>📡 Live (Open-Meteo & USGS)</option>
                <option value="monsoon_deluge" ${this.isOfflineDemo && this.currentScenario === 'monsoon_deluge' ? 'selected' : ''}>⛈️ Demo (Monsoon Deluge)</option>
                <option value="seismic_crisis" ${this.isOfflineDemo && this.currentScenario === 'seismic_crisis' ? 'selected' : ''}>⚡ Demo (Seismic M5.8)</option>
                <option value="normal_baseline" ${this.isOfflineDemo && this.currentScenario === 'normal_baseline' ? 'selected' : ''}>☀️ Demo (Normal Baseline)</option>
              </select>
            </div>

            <!-- View Switcher (Authority vs Citizen) -->
            <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 4px; overflow: hidden;">
              <button id="btn-view-authority" class="tab-btn ${this.viewMode === 'authority' ? 'active' : ''}" style="padding: 4px 8px; font-size: 10px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'authority' ? '#0284c7' : 'transparent'}; color: white;">
                Authority
              </button>
              <button id="btn-view-citizen" class="tab-btn ${this.viewMode === 'citizen' ? 'active' : ''}" style="padding: 4px 8px; font-size: 10px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'citizen' ? '#0284c7' : 'transparent'}; color: white;">
                Citizen
              </button>
            </div>

            <!-- Multi-Language Selector Dropdown -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px;">
              <span style="font-size: 10px; margin-right: 4px;">🌐</span>
              <select id="sel-app-language" style="background: transparent; color: #f8fafc; border: none; font-size: 10px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="en" ${this.lang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${this.lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="as" ${this.lang === 'as' ? 'selected' : ''}>অসমীয়া (Assamese)</option>
                <option value="bn" ${this.lang === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
                <option value="mni" ${this.lang === 'mni' ? 'selected' : ''}>ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)</option>
                <option value="lus" ${this.lang === 'lus' ? 'selected' : ''}>Mizo ṭawng (Mizo)</option>
                <option value="kha" ${this.lang === 'kha' ? 'selected' : ''}>Ka Ktien Khasi (Khasi)</option>
                <option value="ne" ${this.lang === 'ne' ? 'selected' : ''}>नेपाली (Nepali)</option>
              </select>
            </div>
          </div>
        </header>

        <!-- Controlled Alert Ticker -->
        <div id="alert-ticker-container"></div>

        <!-- Main Workspace Area -->
        <div id="main-workspace-container" style="flex: 1; display: flex; position: relative; overflow: hidden;">
          <!-- AUTHORITY VIEW: Left Sidebar + Center Map & Satellite Drawer + Right Multifunction HUD -->
          <div id="authority-workspace" style="display: flex; width: 100%; height: 100%;">
            <!-- Left Sidebar: Regional District Explorer -->
            <aside style="width: 300px; background: #090d16; border-right: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Search & Filter Bar -->
              <div style="padding: 8px 10px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px;">
                <input id="input-search-district" type="text" placeholder="Search District or State..." style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 5px 8px; font-size: 11px; outline: none; box-sizing: border-box;" />
                
                <!-- State Filter Tabs -->
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  <button class="state-filter-btn active" data-state="ALL" style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 3px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">ALL</button>
                  ${NER_STATES.map(s => `
                    <button class="state-filter-btn" data-state="${s}" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 3px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <!-- District List -->
              <div id="district-list-scroll" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;"></div>
            </aside>

            <!-- Center View: Unified Situation Map & Satellite Intelligence Section -->
            <main style="flex: 1; position: relative; display: flex; flex-direction: column; background: #030712; overflow: hidden;">
              <!-- Unified Situation Map (2D Tactical Map + 3D Digital Twin Globe Matching NextSignal Screenshots) -->
              <div id="unified-situation-map-container" style="flex: 1; width: 100%; height: 100%; position: relative;"></div>

              <!-- Satellite & Earth Observation Intelligence Section Drawer (Collapsible) -->
              <div id="satellite-drawer-container" style="padding: 6px 10px; z-index: 400; display: ${this.showSatDrawer ? 'block' : 'none'}; max-height: 220px; overflow-y: auto;"></div>
            </main>

            <!-- Right Sidebar: Multifunction Telemetry & Emergency Hub -->
            <aside style="width: 380px; background: #090d16; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Tab Bar (4 Essential Views) -->
              <div style="display: flex; background: #0f172a; border-bottom: 1px solid #1e293b; font-size: 10px;">
                <button id="tab-btn-hud" style="flex: 1; padding: 8px 4px; font-weight: 700; cursor: pointer; border: none; background: #090d16; color: #38bdf8; border-bottom: 2px solid #38bdf8;">
                  📊 HUD
                </button>
                <button id="tab-btn-highways" style="flex: 1; padding: 8px 4px; font-weight: 700; cursor: pointer; border: none; background: #0f172a; color: #94a3b8; border-bottom: 2px solid transparent;">
                  🛣️ Highways
                </button>
                <button id="tab-btn-shelters" style="flex: 1; padding: 8px 4px; font-weight: 700; cursor: pointer; border: none; background: #0f172a; color: #94a3b8; border-bottom: 2px solid transparent;">
                  🛡️ Shelters
                </button>
                <button id="tab-btn-ai" style="flex: 1; padding: 8px 4px; font-weight: 700; cursor: pointer; border: none; background: #0f172a; color: #94a3b8; border-bottom: 2px solid transparent;">
                  🤖 Command
                </button>
              </div>

              <!-- Tab Contents -->
              <div id="hud-tab-content" style="flex: 1; overflow-y: auto; padding: 10px; display: block;"></div>
              
              <!-- Highways Tab -->
              <div id="highways-tab-content" style="flex: 1; overflow-y: auto; padding: 10px; display: none; flex-direction: column; gap: 8px;">
                <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                  🛣️ Arterial Highway Choke-Point Status
                </div>
                ${NER_HIGHWAY_CORRIDORS.map(h => `
                  <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid ${h.vulnerabilityLevel === 'CRITICAL' ? '#ef4444' : '#f97316'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #ffffff; font-size: 11px;">${h.name}</strong>
                      <span style="background: ${h.currentStatus === 'RESTRICTED' ? '#ef4444' : '#f97316'}; color: white; font-size: 8px; font-weight: bold; padding: 1px 5px; border-radius: 3px;">
                        ${h.currentStatus}
                      </span>
                    </div>
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${h.route}</div>
                    <div style="font-size: 9px; color: #cbd5e1; margin-top: 3px;">
                      Active Choke Points: <strong>${h.vulnerableChokePoints.join(', ')}</strong>
                    </div>
                    <div style="font-size: 9px; color: #38bdf8; margin-top: 3px;">
                      Nearest PWD Depot: ${h.nearestPwdDepot} (${h.pwdEmergencyContact})
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Shelters Tab -->
              <div id="shelters-tab-content" style="flex: 1; overflow-y: auto; padding: 10px; display: none; flex-direction: column; gap: 8px;">
                <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase;">
                  🛡️ Designated Safe Shelters & Evacuation Centers
                </div>
                ${NER_SAFE_SHELTERS.map(s => `
                  <div style="background: #1e293b; border-radius: 6px; padding: 8px; border-left: 3px solid #10b981;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #ffffff; font-size: 11px;">${s.name}</strong>
                      <span style="color: #34d399; font-weight: 800; font-size: 10px;">${s.capacityPersons} pax</span>
                    </div>
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
                      ${s.type} &bull; ${s.elevationM}m MSL
                    </div>
                    <div style="font-size: 9px; color: #38bdf8; margin-top: 3px;">
                      Emergency Helpline: <strong>${s.contactNumber}</strong>
                    </div>
                    <div style="font-size: 8px; color: #a7f3d0; margin-top: 2px;">
                      ${s.hasMedicalPost ? '✓ Medical Post' : ''} ${s.hasGeneratorPower ? '✓ Generator Power' : ''} ${s.hasSatelliteComms ? '✓ Satellite Link' : ''}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- AI Command Tab -->
              <div id="ai-tab-content" style="flex: 1; display: none; flex-direction: column;"></div>
            </aside>
          </div>

          <!-- CITIZEN VIEW OVERLAY -->
          <div id="citizen-workspace" style="display: none; width: 100%; height: 100%; overflow-y: auto; background: #030712;"></div>
        </div>

        <!-- SIH Compliance Modal Overlay -->
        <div id="sih-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: #0f172a; border: 1px solid #0284c7; border-radius: 12px; max-width: 780px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 24px; color: #f8fafc; box-shadow: 0 10px 40px rgba(2,132,199,0.4);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <div>
                <div style="font-size: 11px; color: #38bdf8; font-weight: bold; text-transform: uppercase;">Smart India Hackathon &bull; Problem Statement SIH26001</div>
                <div style="font-size: 20px; font-weight: 800; color: #ffffff;">MDoNER Landslide Risk System & Compliance Audit</div>
                <div style="font-size: 11px; color: #94a3b8;">Ministry of Development of North Eastern Region (MDoNER) &bull; Disaster Management Theme</div>
              </div>
              <button id="btn-close-sih-modal" style="background: #1e293b; color: #ffffff; border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; font-weight: bold; cursor: pointer;">✕ Close</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px; font-size: 12px; line-height: 1.5;">
              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                <strong style="color: #34d399; font-size: 13px;">1. Explainable Mathematical Scoring Engine:</strong><br/>
                $$\\text{Score} = 0.25 \\cdot \\text{Slope} + 0.30 \\cdot \\text{Rainfall} + 0.20 \\cdot \\text{Soil} + 0.15 \\cdot \\text{Seismic} + 0.10 \\cdot \\text{Historical}$$
                Continuous, transparent 0–100 scale calibrated with IMD rainfall intensity benchmarks and Mohr-Coulomb slope stability equations.
              </div>

              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #38bdf8;">
                <strong style="color: #38bdf8; font-size: 13px;">2. 100% Free & Keyless Live Data Ingestion:</strong><br/>
                &bull; <strong>Open-Meteo API</strong>: Live 24h & 72h precipitation and hourly forecasts.<br/>
                &bull; <strong>USGS Earthquake Hazards API</strong>: Live 72h seismic activity in the Eastern Himalayas bounding box.<br/>
                &bull; <strong>NASA POWER API</strong>: Agroclimatology root-zone soil saturation (GWETROOT).<br/>
                &bull; <strong>NASA COOLR Catalog</strong>: Curated historical landslide disasters across Northeast India.
              </div>

              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong style="color: #fbbf24; font-size: 13px;">3. Multi-Sensor Satellite Intelligence Hub:</strong><br/>
                &bull; <strong>Visible RGB TrueColor (NASA VIIRS)</strong>: High-resolution daily satellite view.<br/>
                &bull; <strong>Thermal Infrared Surface Hotspots (NASA MODIS)</strong>: Land surface temperature radiance.<br/>
                &bull; <strong>Wind Vectors & Cloud Fraction (Open-Meteo)</strong>: Real-time wind speed, gusts, and cloud cover.<br/>
                &bull; <strong>Live RainViewer Weather Radar</strong>: Real-time animated Doppler precipitation tracking.
              </div>

              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #a855f7;">
                <strong style="color: #c084fc; font-size: 13px;">4. Multi-Tier AI Decision Support & Arterial Highway Monitoring:</strong><br/>
                Monitors NH-6, NH-29, NH-10, NH-13, and NH-27 choke-points with automated NDRF/SDRF mobilization orders.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private initComponents() {
    this.situationMapComp = new UnifiedSituationMap('unified-situation-map-container', (districtId) => {
      void this.selectDistrict(districtId);
    });

    this.satDrawerComp = new SatelliteIntelligenceDrawer('satellite-drawer-container', (layerId, enabled) => {
      this.situationMapComp?.setSatelliteLayer(layerId, enabled);
    });

    this.hudComp = new DistrictHud('hud-tab-content');
    this.citizenComp = new CitizenView('citizen-workspace');
    this.aiTerminalComp = new AiTerminal('ai-tab-content');
    this.alertTickerComp = new AlertTicker('alert-ticker-container');

    alertsManager.subscribe((alerts) => {
      this.alertTickerComp?.render(alerts);
      const statAlertsEl = document.getElementById('stat-alerts-count');
      if (statAlertsEl) {
        statAlertsEl.textContent = String(alerts.length);
        statAlertsEl.style.color = alerts.some(a => a.level === 'CRITICAL') ? '#ef4444' : '#f97316';
      }
    });
  }

  private populateInitialState() {
    this.liveEarthquakes = MOCK_EARTHQUAKES['monsoon_deluge'];

    let maxRain = 0;
    for (const d of NER_DISTRICTS) {
      const weather = getMockWeatherForDistrict(d, this.isOfflineDemo ? this.currentScenario : 'monsoon_deluge');
      const soil = getMockSoilForDistrict(d, this.isOfflineDemo ? this.currentScenario : 'monsoon_deluge');
      const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.liveEarthquakes);
      const risk = calculateLandslideRisk(d, weather, soil, seismic);

      this.weatherMap.set(d.id, weather);
      this.soilMap.set(d.id, soil);
      this.seismicMap.set(d.id, seismic);
      this.riskMap.set(d.id, risk);

      if (weather.rainfall24hMm > maxRain) maxRain = weather.rainfall24hMm;
      alertsManager.evaluateAndTriggerAlert(d, risk);
    }

    const statMaxRainEl = document.getElementById('stat-max-rain');
    if (statMaxRainEl) statMaxRainEl.textContent = `${maxRain} mm`;

    const statQuakesEl = document.getElementById('stat-quakes-count');
    if (statQuakesEl) statQuakesEl.textContent = String(this.liveEarthquakes.length);
  }

  private renderAllViews() {
    this.renderDistrictList();
    this.situationMapComp?.updateData(NER_DISTRICTS, this.riskMap, this.selectedDistrictId, this.liveEarthquakes);
    this.updateActiveDistrictViews();
  }

  private async refreshLiveTelemetryBackground() {
    if (this.isOfflineDemo) return;

    try {
      const quakes = await fetchLiveSeismicData();
      if (quakes && quakes.length > 0) {
        this.liveEarthquakes = quakes;
        const statQuakesEl = document.getElementById('stat-quakes-count');
        if (statQuakesEl) statQuakesEl.textContent = String(this.liveEarthquakes.length);
      }
    } catch (e) {
      console.warn('[Seismic Ingestion] Live fetch fallback:', e);
    }

    const promises = NER_DISTRICTS.map(async (d) => {
      const fallbackWeather = this.weatherMap.get(d.id) || getMockWeatherForDistrict(d, 'monsoon_deluge');
      const fallbackSoil = this.soilMap.get(d.id) || getMockSoilForDistrict(d, 'monsoon_deluge');

      const [weather, soil] = await Promise.all([
        fetchLiveWeather(d.id, d.lat, d.lon, fallbackWeather),
        fetchLiveSoilMoisture(d.id, d.lat, d.lon, fallbackSoil),
      ]);

      const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.liveEarthquakes);
      const risk = calculateLandslideRisk(d, weather, soil, seismic);

      this.weatherMap.set(d.id, weather);
      this.soilMap.set(d.id, soil);
      this.seismicMap.set(d.id, seismic);
      this.riskMap.set(d.id, risk);

      alertsManager.evaluateAndTriggerAlert(d, risk);
    });

    await Promise.allSettled(promises);

    let maxRain = 0;
    this.weatherMap.forEach(w => {
      if (w.rainfall24hMm > maxRain) maxRain = w.rainfall24hMm;
    });

    const statMaxRainEl = document.getElementById('stat-max-rain');
    if (statMaxRainEl) statMaxRainEl.textContent = `${maxRain} mm`;

    this.renderAllViews();
  }

  private renderDistrictList() {
    const listEl = document.getElementById('district-list-scroll');
    if (!listEl) return;

    let filtered = NER_DISTRICTS;
    if (this.selectedStateFilter !== 'ALL') {
      filtered = filtered.filter(d => d.state === this.selectedStateFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.state.toLowerCase().includes(q) || 
        (d.nameHi && d.nameHi.includes(q)) ||
        (d.nameAs && d.nameAs.includes(q)) ||
        (d.nameBn && d.nameBn.includes(q))
      );
    }

    filtered.sort((a, b) => {
      const scoreA = this.riskMap.get(a.id)?.compositeScore || 0;
      const scoreB = this.riskMap.get(b.id)?.compositeScore || 0;
      return scoreB - scoreA;
    });

    listEl.innerHTML = filtered
      .map((d) => {
        const risk = this.riskMap.get(d.id);
        const score = risk ? risk.compositeScore : 20;
        const level = risk ? risk.level : 'LOW';
        const weather = this.weatherMap.get(d.id);
        const rain24 = weather ? weather.rainfall24hMm : 0;

        const isSelected = d.id === this.selectedDistrictId;
        const badgeColor =
          level === 'CRITICAL'
            ? '#ef4444'
            : level === 'HIGH'
            ? '#f97316'
            : level === 'MODERATE'
            ? '#eab308'
            : '#22c55e';

        return `
        <div class="district-list-item ${isSelected ? 'selected' : ''}" data-id="${d.id}" style="padding: 8px 10px; border-bottom: 1px solid #1e293b; cursor: pointer; background: ${isSelected ? '#1e293b' : 'transparent'}; transition: background 0.15s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; pointer-events: none;">
            <div style="font-weight: 700; font-size: 12px; color: ${isSelected ? '#38bdf8' : '#f1f5f9'};">
              ${this.getDistrictDisplayName(d)}
            </div>
            <div style="font-weight: 800; font-size: 12px; color: ${badgeColor};">
              ${score}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; pointer-events: none;">
            <span>${d.state} &bull; ${d.elevationM}m</span>
            <span>🌧️ ${rain24}mm</span>
          </div>
        </div>
      `;
      })
      .join('');
  }

  public async selectDistrict(districtId: string) {
    this.selectedDistrictId = districtId;
    const district = NER_DISTRICTS.find(d => d.id === districtId);
    if (!district) return;

    this.situationMapComp?.flyToDistrict(district);
    void this.satDrawerComp?.updateDistrict(district);

    this.renderDistrictList();
    await this.updateActiveDistrictViews();
  }

  private async updateActiveDistrictViews() {
    const district = NER_DISTRICTS.find(d => d.id === this.selectedDistrictId) || NER_DISTRICTS[0];
    const risk = this.riskMap.get(district.id);
    const weather = this.weatherMap.get(district.id);
    const soil = this.soilMap.get(district.id);
    const seismic = this.seismicMap.get(district.id);

    if (!risk || !weather || !soil || !seismic) return;

    const nearbyHistorical = NASA_COOLR_NER_EVENTS.filter(e => e.district === district.id || e.state === district.state);

    let aiAdvisory = this.aiAdvisoryMap.get(district.id);
    if (!aiAdvisory) {
      aiAdvisory = await generateDistrictAiAdvisory(district, risk, weather, soil, seismic);
      this.aiAdvisoryMap.set(district.id, aiAdvisory);
    }

    this.hudComp?.setLanguage(this.lang === 'hi');
    this.hudComp?.render(district, risk, weather, soil, seismic, aiAdvisory, nearbyHistorical);

    this.citizenComp?.setLanguage(this.lang === 'hi');
    this.citizenComp?.render(district, risk, weather);

    this.aiTerminalComp?.setLanguage(this.lang);
    this.aiTerminalComp?.updateContext(district, risk, weather, soil, seismic);
  }

  private bindGlobalEvents() {
    const listEl = document.getElementById('district-list-scroll');
    listEl?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.district-list-item');
      if (target) {
        const id = target.getAttribute('data-id');
        if (id) void this.selectDistrict(id);
      }
    });

    // SIH Modal
    const btnSihModal = document.getElementById('btn-sih-compliance');
    const sihModal = document.getElementById('sih-modal');
    const btnCloseModal = document.getElementById('btn-close-sih-modal');

    btnSihModal?.addEventListener('click', () => {
      if (sihModal) sihModal.style.display = 'flex';
    });
    btnCloseModal?.addEventListener('click', () => {
      if (sihModal) sihModal.style.display = 'none';
    });

    // Authority vs Citizen View
    const btnAuth = document.getElementById('btn-view-authority');
    const btnCit = document.getElementById('btn-view-citizen');
    const authSpace = document.getElementById('authority-workspace');
    const citSpace = document.getElementById('citizen-workspace');

    btnAuth?.addEventListener('click', () => {
      this.viewMode = 'authority';
      btnAuth.style.background = '#0284c7';
      if (btnCit) btnCit.style.background = 'transparent';
      if (authSpace) authSpace.style.display = 'flex';
      if (citSpace) citSpace.style.display = 'none';
    });

    btnCit?.addEventListener('click', () => {
      this.viewMode = 'citizen';
      if (btnAuth) btnAuth.style.background = 'transparent';
      if (btnCit) btnCit.style.background = '#0284c7';
      if (authSpace) authSpace.style.display = 'none';
      if (citSpace) citSpace.style.display = 'block';
    });

    // Language Dropdown
    const selLang = document.getElementById('sel-app-language') as HTMLSelectElement;
    selLang?.addEventListener('change', () => {
      this.lang = selLang.value as AppLanguage;
      this.situationMapComp?.setLanguage(this.lang);
      this.alertTickerComp?.setLanguage(this.lang);
      this.updateActiveDistrictViews();
      this.renderDistrictList();
    });

    // Scenario Selector
    const selScenario = document.getElementById('sel-scenario') as HTMLSelectElement;
    selScenario?.addEventListener('change', async () => {
      const val = selScenario.value;
      if (val === 'live') {
        this.isOfflineDemo = false;
        void this.refreshLiveTelemetryBackground();
      } else {
        this.isOfflineDemo = true;
        this.currentScenario = val as DemoScenario;
        this.populateInitialState();
        this.renderAllViews();
      }
      this.aiAdvisoryMap.clear();
    });

    // Search Input
    const searchInput = document.getElementById('input-search-district') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.renderDistrictList();
    });

    // State Filter Buttons
    const stateContainer = document.querySelector('aside div:nth-child(2)');
    stateContainer?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.state-filter-btn') as HTMLElement;
      if (!btn) return;
      const allBtns = document.querySelectorAll('.state-filter-btn');
      allBtns.forEach(b => {
        (b as HTMLElement).style.color = '#94a3b8';
        (b as HTMLElement).style.borderColor = '#334155';
      });
      btn.style.color = '#38bdf8';
      btn.style.borderColor = '#0284c7';
      this.selectedStateFilter = (btn.getAttribute('data-state') as any) || 'ALL';
      this.renderDistrictList();
    });

    // Right Sidebar Tab Switchers
    const tabBtnHud = document.getElementById('tab-btn-hud');
    const tabBtnHwy = document.getElementById('tab-btn-highways');
    const tabBtnShl = document.getElementById('tab-btn-shelters');
    const tabBtnAi = document.getElementById('tab-btn-ai');

    const hudContent = document.getElementById('hud-tab-content');
    const hwyContent = document.getElementById('highways-tab-content');
    const shlContent = document.getElementById('shelters-tab-content');
    const aiContent = document.getElementById('ai-tab-content');

    const resetTabs = () => {
      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnAi].forEach(btn => {
        if (btn) {
          btn.style.background = '#0f172a';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent, aiContent].forEach(c => {
        if (c) c.style.display = 'none';
      });
    };

    tabBtnHud?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnHud && hudContent) {
        tabBtnHud.style.background = '#090d16';
        tabBtnHud.style.color = '#38bdf8';
        tabBtnHud.style.borderBottom = '2px solid #38bdf8';
        hudContent.style.display = 'block';
      }
    });

    tabBtnHwy?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnHwy && hwyContent) {
        tabBtnHwy.style.background = '#090d16';
        tabBtnHwy.style.color = '#38bdf8';
        tabBtnHwy.style.borderBottom = '2px solid #38bdf8';
        hwyContent.style.display = 'flex';
      }
    });

    tabBtnShl?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnShl && shlContent) {
        tabBtnShl.style.background = '#090d16';
        tabBtnShl.style.color = '#38bdf8';
        tabBtnShl.style.borderBottom = '2px solid #38bdf8';
        shlContent.style.display = 'flex';
      }
    });

    tabBtnAi?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnAi && aiContent) {
        tabBtnAi.style.background = '#090d16';
        tabBtnAi.style.color = '#38bdf8';
        tabBtnAi.style.borderBottom = '2px solid #38bdf8';
        aiContent.style.display = 'flex';
      }
    });
  }
}
