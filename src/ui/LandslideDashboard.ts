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
import { DistrictHud } from './components/DistrictHud';
import { CitizenView } from './components/CitizenView';
import { AiTerminal } from './components/AiTerminal';
import { AlertTicker } from './components/AlertTicker';

export class LandslideDashboard {
  private container: HTMLElement;
  private viewMode: AppViewMode = 'authority';
  private lang: AppLanguage = 'en';
  private isOfflineDemo = false; // Default to LIVE real-time telemetry on startup!
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
  private mapComp: LandslideMap | null = null;
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
    await this.refreshAllTelemetry();
    this.bindGlobalEvents();
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

          <!-- Controls: Mode Switch, Offline Simulator Toggle, Language -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Telemetry Data Mode Selector -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 2px 6px;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 6px;">Data Feed:</span>
              <select id="sel-scenario" style="background: transparent; color: #38bdf8; border: none; font-size: 11px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="live" ${!this.isOfflineDemo ? 'selected' : ''}>📡 Live Ingestion (Open-Meteo & USGS)</option>
                <option value="monsoon_deluge" ${this.isOfflineDemo && this.currentScenario === 'monsoon_deluge' ? 'selected' : ''}>⛈️ Offline Demo (Monsoon Deluge Crisis)</option>
                <option value="seismic_crisis" ${this.isOfflineDemo && this.currentScenario === 'seismic_crisis' ? 'selected' : ''}>⚡ Offline Demo (Seismic Trigger M5.8)</option>
                <option value="normal_baseline" ${this.isOfflineDemo && this.currentScenario === 'normal_baseline' ? 'selected' : ''}>☀️ Offline Demo (Baseline Normal)</option>
              </select>
            </div>

            <!-- View Switcher (Authority vs Citizen) -->
            <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 6px; overflow: hidden;">
              <button id="btn-view-authority" class="tab-btn ${this.viewMode === 'authority' ? 'active' : ''}" style="padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'authority' ? '#0284c7' : 'transparent'}; color: white;">
                Authority View
              </button>
              <button id="btn-view-citizen" class="tab-btn ${this.viewMode === 'citizen' ? 'active' : ''}" style="padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer; border: none; background: ${this.viewMode === 'citizen' ? '#0284c7' : 'transparent'}; color: white;">
                Citizen View
              </button>
            </div>

            <!-- Language Switcher (EN / HI) -->
            <button id="btn-toggle-lang" style="background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 6px 10px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              🌐 ${this.lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </header>

        <!-- Alert Ticker -->
        <div id="alert-ticker-container"></div>

        <!-- Main Workspace Area -->
        <div id="main-workspace-container" style="flex: 1; display: flex; position: relative; overflow: hidden;">
          <!-- AUTHORITY VIEW: Left Sidebar + Center Map + Right HUD -->
          <div id="authority-workspace" style="display: flex; width: 100%; height: 100%;">
            <!-- Left Sidebar: Regional District Explorer -->
            <aside style="width: 320px; background: #0f172a; border-right: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Search & Filter Bar -->
              <div style="padding: 10px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 8px;">
                <input id="input-search-district" type="text" placeholder="${this.lang === 'hi' ? 'जिला या राज्य खोजें...' : 'Search NER District or State...'}" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-size: 12px; outline: none; box-sizing: border-box;" />
                
                <!-- State Filter Tabs -->
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  <button class="state-filter-btn active" data-state="ALL" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 4px; padding: 2px 8px; font-size: 10px; white-space: nowrap; cursor: pointer;">ALL</button>
                  ${NER_STATES.map(s => `
                    <button class="state-filter-btn" data-state="${s}" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 8px; font-size: 10px; white-space: nowrap; cursor: pointer;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <!-- District List -->
              <div id="district-list-scroll" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;"></div>
            </aside>

            <!-- Center View: 2D Interactive Map -->
            <main style="flex: 1; position: relative; display: flex; flex-direction: column;">
              <!-- Map Layer & Basemap Controls Overlay -->
              <div style="position: absolute; top: 12px; right: 12px; z-index: 500; background: #0f172aee; backdrop-filter: blur(8px); border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; display: flex; align-items: center; gap: 14px; font-size: 11px; color: #f8fafc; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">
                <!-- Basemap Selector -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: #94a3b8; font-size: 10px;">Basemap:</span>
                  <select id="sel-basemap" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 3px 6px; font-size: 11px; outline: none; cursor: pointer;">
                    <option value="topo" selected>🏔️ Topographic Relief</option>
                    <option value="satellite">🛰️ Satellite Imagery</option>
                    <option value="dark">🌙 Dark Street Map</option>
                  </select>
                </div>

                <div style="height: 16px; width: 1px; background: #334155;"></div>

                <!-- Overlays -->
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-coolr" ${this.showCoolrLayer ? 'checked' : ''} />
                  <span>NASA COOLR Landslides</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <input type="checkbox" id="chk-seismic" ${this.showSeismicLayer ? 'checked' : ''} />
                  <span>USGS Quakes (72h)</span>
                </label>
              </div>

              <!-- Map Div -->
              <div id="landslide-leaflet-map" style="flex: 1; width: 100%; height: 100%;"></div>
            </main>

            <!-- Right Sidebar: District HUD & AI Terminal (Tabs) -->
            <aside style="width: 380px; background: #0b0f19; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <!-- Tab Bar -->
              <div style="display: flex; background: #0f172a; border-bottom: 1px solid #1e293b;">
                <button id="tab-btn-hud" style="flex: 1; padding: 10px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; background: #0b0f19; color: #38bdf8; border-bottom: 2px solid #38bdf8;">
                  📊 District Telemetry HUD
                </button>
                <button id="tab-btn-ai" style="flex: 1; padding: 10px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; background: #0f172a; color: #94a3b8; border-bottom: 2px solid transparent;">
                  🤖 AI Advisory Terminal
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
      </div>
    `;
  }

  private initComponents() {
    this.mapComp = new LandslideMap('landslide-leaflet-map', (districtId) => {
      this.selectDistrict(districtId);
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

  private async refreshAllTelemetry() {
    // 1. Fetch or simulate seismic data
    if (this.isOfflineDemo) {
      this.liveEarthquakes = MOCK_EARTHQUAKES[this.currentScenario];
    } else {
      this.liveEarthquakes = await fetchLiveSeismicData();
    }

    const statQuakesEl = document.getElementById('stat-quakes-count');
    if (statQuakesEl) statQuakesEl.textContent = String(this.liveEarthquakes.length);

    let maxRain = 0;

    // 2. Fetch or simulate weather & soil telemetry for all districts
    for (const d of NER_DISTRICTS) {
      let weather: WeatherTelemetry;
      let soil: SoilTelemetry;

      if (this.isOfflineDemo) {
        weather = getMockWeatherForDistrict(d, this.currentScenario);
        soil = getMockSoilForDistrict(d, this.currentScenario);
      } else {
        const mockFallbackWeather = getMockWeatherForDistrict(d, 'monsoon_deluge');
        const mockFallbackSoil = getMockSoilForDistrict(d, 'monsoon_deluge');
        weather = await fetchLiveWeather(d.id, d.lat, d.lon, mockFallbackWeather);
        soil = await fetchLiveSoilMoisture(d.id, d.lat, d.lon, mockFallbackSoil);
      }

      if (weather.rainfall24hMm > maxRain) maxRain = weather.rainfall24hMm;

      const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.liveEarthquakes);
      const risk = calculateLandslideRisk(d, weather, soil, seismic);

      this.weatherMap.set(d.id, weather);
      this.soilMap.set(d.id, soil);
      this.seismicMap.set(d.id, seismic);
      this.riskMap.set(d.id, risk);

      // Evaluate and dispatch alerts
      alertsManager.evaluateAndTriggerAlert(d, risk);
    }

    const statMaxRainEl = document.getElementById('stat-max-rain');
    if (statMaxRainEl) statMaxRainEl.textContent = `${maxRain} mm`;

    // Render district list and map layers
    this.renderDistrictList();
    this.mapComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
    this.mapComp?.renderCoolrLandslides(this.showCoolrLayer);
    this.mapComp?.renderSeismicEvents(this.liveEarthquakes, this.showSeismicLayer);

    // Render active district HUD
    this.updateActiveDistrictViews();
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
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.nameHi.includes(q));
    }

    // Sort by risk composite score descending
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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-weight: 700; font-size: 13px; color: ${isSelected ? '#38bdf8' : '#f1f5f9'};">
              ${this.lang === 'hi' ? d.nameHi : d.name}
            </div>
            <div style="font-weight: 800; font-size: 13px; color: ${badgeColor};">
              ${score}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
            <span>${d.state} &bull; ${d.elevationM}m</span>
            <span>🌧️ ${rain24}mm</span>
          </div>
        </div>
      `;
      })
      .join('');

    const items = listEl.querySelectorAll('.district-list-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) this.selectDistrict(id);
      });
    });
  }

  private async selectDistrict(districtId: string) {
    this.selectedDistrictId = districtId;
    const district = NER_DISTRICTS.find(d => d.id === districtId);
    if (!district) return;

    this.mapComp?.flyToDistrict(district.lat, district.lon);
    this.mapComp?.renderDistricts(NER_DISTRICTS, this.riskMap, this.selectedDistrictId);
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

    // Filter nearby historical events
    const nearbyHistorical = NASA_COOLR_NER_EVENTS.filter(e => e.district === district.id || e.state === district.state);

    // AI situation directive
    let aiAdvisory = this.aiAdvisoryMap.get(district.id);
    if (!aiAdvisory) {
      aiAdvisory = await generateDistrictAiAdvisory(district, risk, weather, soil, seismic);
      this.aiAdvisoryMap.set(district.id, aiAdvisory);
    }

    this.hudComp?.setLanguage(this.lang === 'hi');
    this.hudComp?.render(district, risk, weather, soil, seismic, aiAdvisory, nearbyHistorical);

    this.citizenComp?.setLanguage(this.lang === 'hi');
    this.citizenComp?.render(district, risk, weather);

    this.aiTerminalComp?.setLanguage(this.lang === 'hi');
    this.aiTerminalComp?.updateContext(district, risk, weather, soil, seismic);
  }

  private bindGlobalEvents() {
    // Mode switch (Authority vs Citizen)
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

    // Language Toggle
    const btnLang = document.getElementById('btn-toggle-lang');
    btnLang?.addEventListener('click', () => {
      this.lang = this.lang === 'en' ? 'hi' : 'en';
      if (btnLang) btnLang.innerHTML = `🌐 ${this.lang === 'en' ? 'हिन्दी' : 'English'}`;
      this.mapComp?.setLanguage(this.lang === 'hi');
      this.updateActiveDistrictViews();
      this.renderDistrictList();
    });

    // Scenario / Live Ingestion Selector
    const selScenario = document.getElementById('sel-scenario') as HTMLSelectElement;
    selScenario?.addEventListener('change', async () => {
      const val = selScenario.value;
      if (val === 'live') {
        this.isOfflineDemo = false;
      } else {
        this.isOfflineDemo = true;
        this.currentScenario = val as DemoScenario;
      }
      this.aiAdvisoryMap.clear();
      await this.refreshAllTelemetry();
    });

    // Basemap Switcher
    const selBasemap = document.getElementById('sel-basemap') as HTMLSelectElement;
    selBasemap?.addEventListener('change', () => {
      const basemap = selBasemap.value as 'satellite' | 'topo' | 'dark';
      this.mapComp?.setBaseMap(basemap);
    });

    // Search Input
    const searchInput = document.getElementById('input-search-district') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      this.renderDistrictList();
    });

    // State Filter Buttons
    const stateBtns = document.querySelectorAll('.state-filter-btn');
    stateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stateBtns.forEach(b => {
          (b as HTMLElement).style.color = '#94a3b8';
          (b as HTMLElement).style.borderColor = '#334155';
        });
        (btn as HTMLElement).style.color = '#38bdf8';
        (btn as HTMLElement).style.borderColor = '#0284c7';
        this.selectedStateFilter = btn.getAttribute('data-state') as any;
        this.renderDistrictList();
      });
    });

    // Right Sidebar Tab Switcher (HUD vs AI Terminal)
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

    // Map Layer Toggles
    const chkCoolr = document.getElementById('chk-coolr') as HTMLInputElement;
    chkCoolr?.addEventListener('change', () => {
      this.showCoolrLayer = chkCoolr.checked;
      this.mapComp?.renderCoolrLandslides(this.showCoolrLayer);
    });

    const chkSeismic = document.getElementById('chk-seismic') as HTMLInputElement;
    chkSeismic?.addEventListener('change', () => {
      this.showSeismicLayer = chkSeismic.checked;
      this.mapComp?.renderSeismicEvents(this.liveEarthquakes, this.showSeismicLayer);
    });
  }
}
