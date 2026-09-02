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
import { NER_HIGHWAY_ROUTES } from '../services/landslide/highway-navigation';
import { NER_SAFE_SHELTERS } from '../services/landslide/safe-shelters';
import { openPrintableSitRepPdf } from '../services/landslide/sitrep-pdf';
import { BacktestPanel } from './components/BacktestPanel';
import { UnifiedSituationMap } from './components/UnifiedSituationMap';
import { DistrictHud } from './components/DistrictHud';
import { CitizenView } from './components/CitizenView';
import { AlertTicker } from './components/AlertTicker';

export class LandslideDashboard {
  private container: HTMLElement;
  private viewMode: AppViewMode = 'authority';
  private rightTab: 'hud' | 'highways' | 'shelters' = 'hud';
  private lang: AppLanguage = 'en';
  private isOfflineDemo = false;
  private currentScenario: DemoScenario = 'monsoon_deluge';
  private selectedDistrictId = 'as_dima_hasao';
  private selectedStateFilter: 'ALL' | NerState = 'ALL';
  private searchQuery = '';

  // Telemetry caches
  private riskMap = new Map<string, RiskScoreBreakdown>();
  private weatherMap = new Map<string, WeatherTelemetry>();
  private soilMap = new Map<string, SoilTelemetry>();
  private seismicMap = new Map<string, SeismicTelemetry>();
  private aiAdvisoryMap = new Map<string, AiAdvisoryResponse>();
  private liveEarthquakes: UsgsEarthquake[] = [];

  // UI Components
  private situationMapComp: UnifiedSituationMap | null = null;
  private hudComp: DistrictHud | null = null;
  private citizenComp: CitizenView | null = null;
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
      <div id="landslide-app-root" style="display: flex; flex-direction: column; height: 100vh; width: 100vw; background: #090d16; color: #f8fafc; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- Top App Header -->
        <header id="sih-header-bar" style="background: #050811; border-bottom: 1px solid #1e293b; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; height: 50px; min-height: 50px; box-sizing: border-box;">
          
          <!-- Left: Actual NextSignal Logo Image & Clean Title -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="/nextsignal-logo.jpg" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; box-shadow: 0 0 12px rgba(56,189,248,0.4);" alt="NextSignal Logo" />
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 15px; font-weight: 900; color: #ffffff; letter-spacing: 0.8px;">
                  NEXTSIGNAL
                </span>
                <span style="background: rgba(2,132,199,0.2); color: #38bdf8; border: 1px solid rgba(2,132,199,0.4); font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 3px;">
                  EARLY WARNING SYSTEM &bull; NER
                </span>
              </div>
              <div style="font-size: 10px; color: #94a3b8;">
                AI-Powered Landslide & Geohazard Intelligence Dashboard &bull; Northeast Region India
              </div>
            </div>
          </div>

          <!-- Live Telemetry KPI Metrics -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Districts</div>
              <div style="font-size: 13px; font-weight: 800; color: #f8fafc;">${NER_DISTRICTS.length}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Active Alerts</div>
              <div id="stat-alerts-count" style="font-size: 13px; font-weight: 800; color: #ef4444;">0</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #1e293b; padding-right: 14px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Max Rainfall</div>
              <div id="stat-max-rain" style="font-size: 13px; font-weight: 800; color: #38bdf8;">-- mm</div>
            </div>
            <div style="text-align: center; padding-right: 4px;">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">72h Quakes</div>
              <div id="stat-quakes-count" style="font-size: 13px; font-weight: 800; color: #a855f7;">--</div>
            </div>
          </div>

          <!-- Controls: Feed, Download PDF Report, View Switcher & Language -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Telemetry Data Mode Selector -->
            <div style="display: flex; align-items: center; background: #0b1120; border: 1px solid #334155; border-radius: 6px; padding: 2px 8px;">
              <span style="font-size: 9px; color: #94a3b8; margin-right: 4px;">Feed:</span>
              <select id="sel-scenario" style="background: #0b1120; color: #38bdf8; border: none; font-size: 10px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="live" style="background: #0b1120; color: #38bdf8;" ${!this.isOfflineDemo ? 'selected' : ''}>&#9658; Live (Open-Meteo &amp; USGS)</option>
                <option value="monsoon_deluge" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === 'monsoon_deluge' ? 'selected' : ''}>&#9670; Demo (Monsoon Deluge)</option>
                <option value="seismic_crisis" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === 'seismic_crisis' ? 'selected' : ''}>&#9670; Demo (Seismic M5.8)</option>
                <option value="normal_baseline" style="background: #0b1120; color: #38bdf8;" ${this.isOfflineDemo && this.currentScenario === 'normal_baseline' ? 'selected' : ''}>&#9670; Demo (Normal Baseline)</option>
              </select>
            </div>

            <!-- Download PDF Situation Report Button -->
            <button id="btn-download-sitrep" style="background: #0b1120; color: #38bdf8; border: 1px solid #0284c7; border-radius: 6px; padding: 4px 10px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background 0.15s ease;" title="Download Beautiful PDF Situation Report">
              <span>&#9679; Live Feed Active</span>
              <span>Download PDF Report</span>
            </button>

            <!-- View Switcher (Authority vs Citizen) -->
            <div style="display: flex; background: #0b1120; border: 1px solid #334155; border-radius: 6px; overflow: hidden;">
              <button id="btn-view-authority" class="tab-btn ${this.viewMode === 'authority' ? 'active' : ''}" style="padding: 4px 10px; font-size: 10px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'authority' ? '#0284c7' : 'transparent'}; color: white;">
                Authority
              </button>
              <button id="btn-view-citizen" class="tab-btn ${this.viewMode === 'citizen' ? 'active' : ''}" style="padding: 4px 10px; font-size: 10px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'citizen' ? '#0284c7' : 'transparent'}; color: white;">
                Citizen
              </button>
            </div>

            <!-- Multi-Language Selector Dropdown -->
            <div style="display: flex; align-items: center; background: #0b1120; border: 1px solid #334155; border-radius: 6px; padding: 2px 8px;">
              <span style="font-size: 10px; margin-right: 4px;">Lang:</span>
              <select id="sel-app-language" style="background: #0b1120; color: #f8fafc; border: none; font-size: 10px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="en" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'hi' ? 'selected' : ''}>Hindi</option>
                <option value="as" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'as' ? 'selected' : ''}>Assamese</option>
                <option value="bn" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'bn' ? 'selected' : ''}>Bengali</option>
                <option value="mni" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'mni' ? 'selected' : ''}>Manipuri</option>
                <option value="lus" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'lus' ? 'selected' : ''}>Mizo</option>
                <option value="kha" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'kha' ? 'selected' : ''}>Ka Ktien Khasi (Khasi)</option>
                <option value="ne" style="background: #0b1120; color: #f8fafc;" ${this.lang === 'ne' ? 'selected' : ''}>Nepali</option>
              </select>
            </div>
          </div>
        </header>

        <!-- Controlled Alert Ticker -->
        <div id="alert-ticker-container"></div>

        <!-- Main Workspace Area -->
        <div id="main-workspace-container" style="flex: 1; display: flex; position: relative; overflow: hidden; background: #090d16;">
          <!-- AUTHORITY VIEW: Left Sidebar + Center 100% Height Map + Right Multifunction HUD -->
          <div id="authority-workspace" style="display: flex; width: 100%; height: 100%;">
            
            <!-- Left Sidebar: Regional District Explorer -->
            <aside style="width: 280px; background: #050811; border-right: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Search & Filter Bar -->
              <div style="padding: 8px 10px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px;">
                <input id="input-search-district" type="text" placeholder="Search District or State..." style="width: 100%; background: #0b1120; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 5px 8px; font-size: 11px; outline: none; box-sizing: border-box;" />
                
                <!-- State Filter Tabs -->
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  <button class="state-filter-btn active" data-state="ALL" style="background: #0b1120; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">ALL</button>
                  ${NER_STATES.map(s => `
                    <button class="state-filter-btn" data-state="${s}" style="background: #0b1120; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <!-- District List -->
              <div id="sih-risk-score-panel" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;"><div id="district-list-scroll" style="width:100%;display:flex;flex-direction:column;"></div></div>
            </aside>

            <!-- Center View: 100% Height Tactical Situation Map (Matches Reference Screenshot) -->
            <main style="flex: 1; position: relative; display: flex; flex-direction: column; background: #090d16; overflow: hidden;">
              <div id="sih-unified-map" style="width: 100%; height: 100%; position: relative;"><div id="unified-situation-map-container" style="width:100%;height:100%;position:relative;"></div></div>
            </main>

            <!-- Right Sidebar: 3 Clear Purposeful Tabs (HUD, Highways, Shelters) -->
            <aside style="width: 370px; background: #050811; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500; padding-bottom: 48px;">
              <!-- Tab Bar (3 Essential Views) -->
              <div style="display: flex; background: #0b1120; border-bottom: 1px solid #1e293b; font-size: 11px;">
                <button id="tab-btn-hud" style="flex: 1; padding: 10px 4px; font-weight: 700; cursor: pointer; border: none; background: #050811; color: #38bdf8; border-bottom: 2px solid #38bdf8;">
                  Risk HUD
                </button>
                <button id="tab-btn-highways" style="flex: 1; padding: 10px 4px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;">
                  Highways
                </button>
                <button id="tab-btn-shelters" style="flex: 1; padding: 10px 4px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;">
                  Shelters
                </button>
                <button id="tab-btn-backtest" style="flex: 1; padding: 10px 4px; font-size: 10px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent; border-left: 1px solid #1e293b;">
                  Backtest
                </button>
              </div>

              <!-- Tab Contents -->
              <div id="hud-tab-content" style="flex: 1; overflow-y: auto; padding: 12px; display: block;"></div>
              
              <!-- Highways Tab -->
              <div id="highways-tab-content" style="flex: 1; overflow-y: auto; padding: 12px; display: none; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                    Arterial Highway Corridors
                  </div>
                  <span style="font-size: 9px; color: #94a3b8;">Google Maps Nav</span>
                </div>
                ${NER_HIGHWAY_ROUTES.map(h => `
                  <div class="hwy-corridor-item" data-id="${h.id}" style="background: #0b1120; border-radius: 8px; padding: 10px; border-left: 3px solid ${h.overallVulnerability === 'CRITICAL' ? '#ef4444' : '#f97316'}; cursor: pointer; transition: background 0.15s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #ffffff; font-size: 11px;">${h.name}</strong>
                      <span style="background: ${h.currentPassStatus === 'RESTRICTED' ? '#ef4444' : '#f97316'}; color: white; font-size: 8px; font-weight: bold; padding: 1px 6px; border-radius: 3px;">
                        ${h.currentPassStatus}
                      </span>
                    </div>
                    <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px;">${h.origin} &rarr; ${h.destination}</div>
                    <div style="font-size: 9px; color: #38bdf8; margin-top: 4px; font-weight: bold;">
                      &rarr; Click for Step-by-Step Waypoints
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Shelters Tab -->
              <div id="shelters-tab-content" style="flex: 1; overflow-y: auto; padding: 12px; display: none; flex-direction: column; gap: 8px;">
                <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase;">
                  Designated Safe Shelters &amp; Evacuation Centers
                </div>
                ${NER_SAFE_SHELTERS.map(s => `
                  <div style="background: #0b1120; border-radius: 8px; padding: 10px; border-left: 3px solid #10b981;">
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
                      ${s.hasMedicalPost ? '[+] Medical Post' : ''} ${s.hasGeneratorPower ? '[+] Generator' : ''} ${s.hasSatelliteComms ? '[+] Satellite' : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
              <!-- Backtest Validation Tab -->
              <div id="backtest-tab-content" style="flex: 1; overflow-y: auto; padding: 12px; display: none; flex-direction: column;"></div>
            </aside>
          </div>

          <!-- CITIZEN VIEW OVERLAY -->
          <div id="citizen-workspace" style="display: none; width: 100%; height: 100%; overflow-y: auto; background: #090d16;"></div>
        </div>
      </div>
    `;
  }

  private initComponents() {
    this.situationMapComp = new UnifiedSituationMap('unified-situation-map-container', (districtId) => {
      void this.selectDistrict(districtId);
    });

    this.hudComp = new DistrictHud('hud-tab-content');
    this.citizenComp = new CitizenView('citizen-workspace');
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
        <div class="district-list-item ${isSelected ? 'selected' : ''}" data-id="${d.id}" style="padding: 7px 10px; border-bottom: 1px solid #1e293b; cursor: pointer; background: ${isSelected ? '#0b1120' : 'transparent'}; transition: background 0.15s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; pointer-events: none;">
            <div style="font-weight: 700; font-size: 12px; color: ${isSelected ? '#38bdf8' : '#f1f5f9'};">
              ${this.getDistrictDisplayName(d)}
            </div>
            <div style="font-weight: 800; font-size: 12px; color: ${badgeColor};">
              ${score}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; pointer-events: none;">
            <span>${d.state} &bull; ${d.elevationM}m</span>
            <span>Rain: ${rain24}mm</span>
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

    // Download PDF Situation Report Button Event
    document.getElementById('btn-download-sitrep')?.addEventListener('click', () => {
      openPrintableSitRepPdf(this.riskMap, this.weatherMap, this.soilMap, this.seismicMap, this.selectedDistrictId);
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
    const tabBtnHud = document.getElementById('tab-btn-hud') as HTMLButtonElement | null;
    const tabBtnHwy = document.getElementById('tab-btn-highways') as HTMLButtonElement | null;
    const tabBtnShl = document.getElementById('tab-btn-shelters') as HTMLButtonElement | null;
    const tabBtnBacktest = document.getElementById('tab-btn-backtest') as HTMLButtonElement | null;

    const hudContent = document.getElementById('hud-tab-content') as HTMLElement | null;
    const hwyContent = document.getElementById('highways-tab-content') as HTMLElement | null;
    const shlContent = document.getElementById('shelters-tab-content') as HTMLElement | null;
    const backtestContent = document.getElementById('backtest-tab-content') as HTMLElement | null;

    const resetTabs = () => {
      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnBacktest].forEach(btn => {
        if (btn) {
          btn.style.background = '#0b1120';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent, backtestContent].forEach(c => {
        if (c) c.style.display = 'none';
      });
    };

    tabBtnHud?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnHud && hudContent) {
        tabBtnHud.style.background = '#050811';
        tabBtnHud.style.color = '#38bdf8';
        tabBtnHud.style.borderBottom = '2px solid #38bdf8';
        hudContent.style.display = 'block';
      }
    });

    tabBtnHwy?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnHwy && hwyContent) {
        tabBtnHwy.style.background = '#050811';
        tabBtnHwy.style.color = '#38bdf8';
        tabBtnHwy.style.borderBottom = '2px solid #38bdf8';
        hwyContent.style.display = 'flex';
      }
    });

    tabBtnShl?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnShl && shlContent) {
        tabBtnShl.style.background = '#050811';
        tabBtnShl.style.color = '#38bdf8';
        tabBtnShl.style.borderBottom = '2px solid #38bdf8';
        shlContent.style.display = 'flex';
      }
    });

    if (tabBtnBacktest && backtestContent) {
      tabBtnBacktest.addEventListener('click', () => {
        resetTabs();
        tabBtnBacktest.style.background = '#050811';
        tabBtnBacktest.style.color = '#38bdf8';
        tabBtnBacktest.style.borderBottom = '2px solid #38bdf8';
        backtestContent.style.display = 'flex';
        if (!backtestContent.hasChildNodes()) {
          new BacktestPanel(backtestContent);
        }
      });
    }

    // Highway Corridor Item clicks -> Open Highway Navigator
    hwyContent?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.hwy-corridor-item');
      if (target) {
        const id = target.getAttribute('data-id');
        if (id) {
          this.situationMapComp?.openHighwayNavigator(id);
        }
      }
    });
  }
}
