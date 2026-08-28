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
import { LandslideMap } from './components/LandslideMap';
import { EarthGlobe3D } from './components/EarthGlobe3D';
import { DistrictHud } from './components/DistrictHud';
import { CitizenView } from './components/CitizenView';
import { AiTerminal } from './components/AiTerminal';
import { AlertTicker } from './components/AlertTicker';

export class LandslideDashboard {
  private container: HTMLElement;
  private viewMode: AppViewMode = 'authority';
  private mapMode: '2d' | '3d' = '2d';
  private lang: AppLanguage = 'en';
  private isOfflineDemo = false;
  private currentScenario: DemoScenario = 'monsoon_deluge';
  private selectedDistrictId = 'as_dima_hasao';
  private selectedStateFilter: 'ALL' | NerState = 'ALL';
  private searchQuery = '';
  private showBorders = true;
  private isFullscreen = false;

  // Telemetry caches
  private riskMap = new Map<string, RiskScoreBreakdown>();
  private weatherMap = new Map<string, WeatherTelemetry>();
  private soilMap = new Map<string, SoilTelemetry>();
  private seismicMap = new Map<string, SeismicTelemetry>();
  private aiAdvisoryMap = new Map<string, AiAdvisoryResponse>();
  private liveEarthquakes: UsgsEarthquake[] = [];

  // UI Components
  private mapComp: LandslideMap | null = null;
  private globe3dComp: EarthGlobe3D | null = null;
  private hudComp: DistrictHud | null = null;
  private citizenComp: CitizenView | null = null;
  private aiTerminalComp: AiTerminal | null = null;
  private alertTickerComp: AlertTicker | null = null;

  // Map layer states
  private showCoolrLayer = true;
  private showSeismicLayer = true;

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
        <header style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; min-height: 56px;">
          <!-- Branding -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 12px rgba(2,132,199,0.5);">
              ⛰️
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                  NextSignal SIH26001
                </span>
                <span style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c744; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                  MDoNER &bull; Disaster Management
                </span>
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                AI-Based Early Warning & Landslide Risk Monitoring System in North Eastern Region (NER), India
              </div>
            </div>
          </div>

          <!-- Live Telemetry KPI Metrics -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Districts</div>
              <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">${NER_DISTRICTS.length}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Active Alerts</div>
              <div id="stat-alerts-count" style="font-size: 14px; font-weight: 800; color: #ef4444;">0</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Max Rainfall</div>
              <div id="stat-max-rain" style="font-size: 14px; font-weight: 800; color: #38bdf8;">-- mm</div>
            </div>
            <div style="text-align: center; padding-right: 4px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">72h Quakes</div>
              <div id="stat-quakes-count" style="font-size: 14px; font-weight: 800; color: #a855f7;">--</div>
            </div>
          </div>

          <!-- Controls: Mode Switch, 3D Globe, Fullscreen, Language, SIH Audit -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- SIH Compliance Modal Button -->
            <button id="btn-sih-compliance" style="background: linear-gradient(135deg, #059669, #047857); border: none; color: white; padding: 6px 10px; font-size: 11px; font-weight: 800; border-radius: 6px; cursor: pointer; box-shadow: 0 0 10px rgba(5,150,105,0.4);">
              🏆 SIH Audit
            </button>

            <!-- Fullscreen Button -->
            <button id="btn-fullscreen-toggle" style="background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 6px 10px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer;" title="Toggle Fullscreen">
              ⛶ Fullscreen
            </button>

            <!-- Telemetry Data Mode Selector -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 2px 6px;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 4px;">Feed:</span>
              <select id="sel-scenario" style="background: transparent; color: #38bdf8; border: none; font-size: 11px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="live" ${!this.isOfflineDemo ? 'selected' : ''}>📡 Live (Open-Meteo & USGS)</option>
                <option value="monsoon_deluge" ${this.isOfflineDemo && this.currentScenario === 'monsoon_deluge' ? 'selected' : ''}>⛈️ Demo (Monsoon Deluge)</option>
                <option value="seismic_crisis" ${this.isOfflineDemo && this.currentScenario === 'seismic_crisis' ? 'selected' : ''}>⚡ Demo (Seismic M5.8)</option>
                <option value="normal_baseline" ${this.isOfflineDemo && this.currentScenario === 'normal_baseline' ? 'selected' : ''}>☀️ Demo (Normal Baseline)</option>
              </select>
            </div>

            <!-- View Switcher (Authority vs Citizen) -->
            <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 6px; overflow: hidden;">
              <button id="btn-view-authority" class="tab-btn ${this.viewMode === 'authority' ? 'active' : ''}" style="padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'authority' ? '#0284c7' : 'transparent'}; color: white;">
                Authority
              </button>
              <button id="btn-view-citizen" class="tab-btn ${this.viewMode === 'citizen' ? 'active' : ''}" style="padding: 6px 10px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'citizen' ? '#0284c7' : 'transparent'}; color: white;">
                Citizen
              </button>
            </div>

            <!-- Multi-Language Selector Dropdown -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 2px 6px;">
              <span style="font-size: 11px; margin-right: 4px;">🌐</span>
              <select id="sel-app-language" style="background: transparent; color: #f8fafc; border: none; font-size: 11px; font-weight: bold; outline: none; cursor: pointer;">
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
          <!-- AUTHORITY VIEW: Left Sidebar + Center Map/Globe + Right HUD -->
          <div id="authority-workspace" style="display: flex; width: 100%; height: 100%;">
            <!-- Left Sidebar: Regional District Explorer -->
            <aside style="width: 320px; background: #0f172a; border-right: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Search & Filter Bar -->
              <div style="padding: 10px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 8px;">
                <input id="input-search-district" type="text" placeholder="Search District or State..." style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-size: 12px; outline: none; box-sizing: border-box;" />
                
                <!-- State Filter Tabs -->
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  <button class="state-filter-btn active" data-state="ALL" style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 8px; font-size: 10px; white-space: nowrap; cursor: pointer;">ALL</button>
                  ${NER_STATES.map(s => `
                    <button class="state-filter-btn" data-state="${s}" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 8px; font-size: 10px; white-space: nowrap; cursor: pointer;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <!-- District List -->
              <div id="district-list-scroll" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;"></div>
            </aside>

            <!-- Center View: 2D GIS Map & 3D Satellite Earth Globe -->
            <main style="flex: 1; position: relative; display: flex; flex-direction: column; background: #030712;">
              <!-- Map Controls & 2D/3D Mode Switcher Overlay -->
              <div style="position: absolute; top: 12px; right: 12px; z-index: 500; background: #0f172aee; backdrop-filter: blur(8px); border: 1px solid #334155; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 12px; font-size: 11px; color: #f8fafc; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
                <!-- 2D / 3D Mode Switcher -->
                <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 6px; overflow: hidden;">
                  <button id="btn-map-2d" class="${this.mapMode === '2d' ? 'active' : ''}" style="padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.mapMode === '2d' ? '#0284c7' : 'transparent'}; color: white;">
                    🗺️ 2D Map
                  </button>
                  <button id="btn-map-3d" class="${this.mapMode === '3d' ? 'active' : ''}" style="padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.mapMode === '3d' ? '#0284c7' : 'transparent'}; color: white;">
                    🌐 3D Globe
                  </button>
                </div>

                <!-- 2D Basemap Selector -->
                <div id="basemap-selector-wrap" style="display: ${this.mapMode === '2d' ? 'flex' : 'none'}; align-items: center; gap: 6px;">
                  <span style="color: #94a3b8; font-size: 10px;">4K Basemap:</span>
                  <select id="sel-basemap" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 3px 6px; font-size: 11px; outline: none; cursor: pointer;">
                    <option value="satellite" selected>🛰️ 4K Satellite Imagery</option>
                    <option value="topo">🏔️ Topographic Relief</option>
                    <option value="opentopo">🌲 OpenTopo Contours</option>
                    <option value="dark">🌙 Dark Street Map</option>
                  </select>
                </div>

                <div style="height: 16px; width: 1px; background: #334155;"></div>

                <!-- Virtual Borders Toggle -->
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-borders" ${this.showBorders ? 'checked' : ''} />
                  <span>State Borders</span>
                </label>

                <!-- Overlays -->
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-coolr" ${this.showCoolrLayer ? 'checked' : ''} />
                  <span>NASA COOLR Slides</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-seismic" ${this.showSeismicLayer ? 'checked' : ''} />
                  <span>USGS Quakes (72h)</span>
                </label>
              </div>

              <!-- 2D Leaflet Map Container -->
              <div id="landslide-leaflet-map" style="flex: 1; width: 100%; height: 100%; display: ${this.mapMode === '2d' ? 'block' : 'none'};"></div>

              <!-- 3D Three.js Globe Container -->
              <div id="landslide-3d-globe" style="flex: 1; width: 100%; height: 100%; display: ${this.mapMode === '3d' ? 'block' : 'none'}; position: relative;"></div>
            </main>

            <!-- Right Sidebar: District HUD & AI Terminal (Tabs) -->
            <aside style="width: 380px; background: #0b0f19; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Tab Bar -->
              <div style="display: flex; background: #0f172a; border-bottom: 1px solid #1e293b;">
                <button id="tab-btn-hud" style="flex: 1; padding: 10px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; background: #0b0f19; color: #38bdf8; border-bottom: 2px solid #38bdf8;">
                  📊 District Telemetry HUD
                </button>
                <button id="tab-btn-ai" style="flex: 1; padding: 10px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; background: #0f172a; color: #94a3b8; border-bottom: 2px solid transparent;">
                  🛡️ Disaster Command Console
                </button>
              </div>

              <!-- Tab Contents -->
              <div id="hud-tab-content" style="flex: 1; overflow-y: auto; padding: 12px;"></div>
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
                <strong style="color: #fbbf24; font-size: 13px;">3. Dual Persona Architecture (Authority vs Citizen):</strong><br/>
                &bull; <strong>Authority HUD</strong>: Detailed telemetry breakdown, 5-factor weight bars, and official printable PDF Situation Reports.<br/>
                &bull; <strong>Citizen Safety Portal</strong>: High-contrast emergency safety status, 8 regional language translations, and 1-Tap Speed Dial for NDRF (1078), SDMA (1070), 112, and 108.
              </div>

              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #a855f7;">
                <strong style="color: #c084fc; font-size: 13px;">4. Multi-Tier AI Decision Intelligence (Local & Server API):</strong><br/>
                Ultralight local models (Qwen2.5 / Gemma2) + Server AI API (Google Gemini 1.5 / Groq) + Deterministic geological expert engine.
              </div>

              <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid #ec4899;">
                <strong style="color: #f472b6; font-size: 13px;">5. 3D Digital Twin Globe & 4K GIS Topography:</strong><br/>
                Highly zoomable 3D Globe with 2D surface radar hazard rings, virtual state borders, and 4K satellite relief basemaps.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private initComponents() {
    this.mapComp = new LandslideMap('landslide-leaflet-map', (districtId) => {
      void this.selectDistrict(districtId);
    });

    this.globe3dComp = new EarthGlobe3D('landslide-3d-globe', (districtId) => {
      void this.selectDistrict(districtId);
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
    this.mapComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    this.mapComp?.renderCoolrLandslides(this.showCoolrLayer);
    this.mapComp?.renderSeismicEvents(this.liveEarthquakes, this.showSeismicLayer);

    this.globe3dComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    this.globe3dComp?.renderCoolrEvents(this.showCoolrLayer);
    this.globe3dComp?.renderSeismicQuakes(this.liveEarthquakes, this.showSeismicLayer);

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
        <div class="district-list-item ${isSelected ? 'selected' : ''}" data-id="${d.id}" style="padding: 10px 12px; border-bottom: 1px solid #1e293b; cursor: pointer; background: ${isSelected ? '#1e293b' : 'transparent'}; transition: background 0.15s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; pointer-events: none;">
            <div style="font-weight: 700; font-size: 13px; color: ${isSelected ? '#38bdf8' : '#f1f5f9'};">
              ${this.getDistrictDisplayName(d)}
            </div>
            <div style="font-weight: 800; font-size: 13px; color: ${badgeColor};">
              ${score}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; pointer-events: none;">
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

    if (this.mapMode === '2d') {
      this.mapComp?.flyToDistrict(district.lat, district.lon);
      this.mapComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    } else {
      this.globe3dComp?.orientToCoordinates(district.lat, district.lon);
      this.globe3dComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    }

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

    // 2D / 3D Mode
    const btn2d = document.getElementById('btn-map-2d');
    const btn3d = document.getElementById('btn-map-3d');
    const map2dEl = document.getElementById('landslide-leaflet-map');
    const map3dEl = document.getElementById('landslide-3d-globe');
    const basemapWrap = document.getElementById('basemap-selector-wrap');

    btn2d?.addEventListener('click', () => {
      this.mapMode = '2d';
      btn2d.style.background = '#0284c7';
      if (btn3d) btn3d.style.background = 'transparent';
      if (map2dEl) map2dEl.style.display = 'block';
      if (map3dEl) map3dEl.style.display = 'none';
      if (basemapWrap) basemapWrap.style.display = 'flex';
      this.mapComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    });

    btn3d?.addEventListener('click', () => {
      this.mapMode = '3d';
      if (btn2d) btn2d.style.background = 'transparent';
      btn3d.style.background = '#0284c7';
      if (map2dEl) map2dEl.style.display = 'none';
      if (map3dEl) map3dEl.style.display = 'block';
      if (basemapWrap) basemapWrap.style.display = 'none';
      this.globe3dComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    });

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen-toggle');
    btnFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
        if (btnFullscreen) btnFullscreen.innerHTML = '⛷️ Exit Fullscreen';
      } else {
        void document.exitFullscreen();
        if (btnFullscreen) btnFullscreen.innerHTML = '⛶ Fullscreen';
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
      this.mapComp?.setLanguage(this.lang);
      this.globe3dComp?.setLanguage(this.lang);
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

    // Basemap Switcher
    const selBasemap = document.getElementById('sel-basemap') as HTMLSelectElement;
    selBasemap?.addEventListener('change', () => {
      const basemap = selBasemap.value as 'satellite' | 'topo' | 'opentopo' | 'dark';
      this.mapComp?.setBaseMap(basemap);
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

    // Right Sidebar Tab Switcher
    const tabBtnHud = document.getElementById('tab-btn-hud');
    const tabBtnAi = document.getElementById('tab-btn-ai');
    const hudContent = document.getElementById('hud-tab-content');
    const aiContent = document.getElementById('ai-tab-content');

    tabBtnHud?.addEventListener('click', () => {
      if (tabBtnHud && tabBtnAi && hudContent && aiContent) {
        tabBtnHud.style.background = '#0b0f19';
        tabBtnHud.style.color = '#38bdf8';
        tabBtnHud.style.borderBottom = '2px solid #38bdf8';
        tabBtnAi.style.background = '#0f172a';
        tabBtnAi.style.color = '#94a3b8';
        tabBtnAi.style.borderBottom = '2px solid transparent';
        hudContent.style.display = 'block';
        aiContent.style.display = 'none';
      }
    });

    tabBtnAi?.addEventListener('click', () => {
      if (tabBtnHud && tabBtnAi && hudContent && aiContent) {
        tabBtnAi.style.background = '#0b0f19';
        tabBtnAi.style.color = '#38bdf8';
        tabBtnAi.style.borderBottom = '2px solid #38bdf8';
        tabBtnHud.style.background = '#0f172a';
        tabBtnHud.style.color = '#94a3b8';
        tabBtnHud.style.borderBottom = '2px solid transparent';
        aiContent.style.display = 'flex';
        hudContent.style.display = 'none';
      }
    });

    // Virtual Borders Toggle
    const chkBorders = document.getElementById('chk-borders') as HTMLInputElement;
    chkBorders?.addEventListener('change', () => {
      this.showBorders = chkBorders.checked;
      this.mapComp?.renderStateBorders(this.showBorders);
    });

    // Map Layer Toggles
    const chkCoolr = document.getElementById('chk-coolr') as HTMLInputElement;
    chkCoolr?.addEventListener('change', () => {
      this.showCoolrLayer = chkCoolr.checked;
      this.mapComp?.renderCoolrLandslides(this.showCoolrLayer);
      this.globe3dComp?.renderCoolrEvents(this.showCoolrLayer);
    });

    const chkSeismic = document.getElementById('chk-seismic') as HTMLInputElement;
    chkSeismic?.addEventListener('change', () => {
      this.showSeismicLayer = chkSeismic.checked;
      this.mapComp?.renderSeismicEvents(this.liveEarthquakes, this.showSeismicLayer);
      this.globe3dComp?.renderSeismicQuakes(this.liveEarthquakes, this.showSeismicLayer);
    });
  }
}
