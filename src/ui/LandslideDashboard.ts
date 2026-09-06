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
import { GroundReportsPanel } from './components/GroundReportsPanel';
import { groundReportsService } from '../services/landslide/ground-reports';

export class LandslideDashboard {
  private container: HTMLElement;
  private selectedDistrictId: string = 'mangan';
  private selectedStateFilter: 'ALL' | NerState = 'ALL';
  private searchQuery: string = '';
  private viewMode: AppViewMode = 'authority';
  private lang: AppLanguage = 'en';

  private riskMap: Map<string, RiskScoreBreakdown> = new Map();
  private weatherMap: Map<string, WeatherTelemetry> = new Map();
  private soilMap: Map<string, SoilTelemetry> = new Map();
  private seismicMap: Map<string, SeismicTelemetry> = new Map();
  private aiAdvisoryMap: Map<string, AiAdvisoryResponse> = new Map();
  private liveEarthquakes: UsgsEarthquake[] = [];

  private currentScenario: DemoScenario = 'monsoon_deluge';
  private isOfflineDemo: boolean = false;

  private situationMapComp: UnifiedSituationMap | null = null;
  private hudComp: DistrictHud | null = null;
  private citizenComp: CitizenView | null = null;
  private alertTickerComp: AlertTicker | null = null;
  private reportsPanelComp: GroundReportsPanel | null = null;
  private onReplayIntro?: () => void;

  constructor(containerId: string, initialRole: AppViewMode = 'authority', onReplayIntro?: () => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error("Container #" + containerId + " not found");
    this.container = el;
    this.viewMode = initialRole;
    this.onReplayIntro = onReplayIntro;

    this.populateInitialState();
    this.renderLayout();
    this.initComponents();
    this.bindGlobalEvents();

    if (!this.isOfflineDemo) {
      void this.refreshLiveTelemetryBackground();
    }
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

  private populateInitialState() {
    this.liveEarthquakes = MOCK_EARTHQUAKES[this.currentScenario] || [];
    let maxRain = 0;

    for (const d of NER_DISTRICTS) {
      const weather = getMockWeatherForDistrict(d, this.currentScenario);
      const soil = getMockSoilForDistrict(d, this.currentScenario);
      const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.liveEarthquakes);
      const risk = calculateLandslideRisk(d, weather, soil, seismic);

      this.weatherMap.set(d.id, weather);
      this.soilMap.set(d.id, soil);
      this.seismicMap.set(d.id, seismic);
      this.riskMap.set(d.id, risk);

      if (weather.rainfall24hMm > maxRain) maxRain = weather.rainfall24hMm;
      alertsManager.evaluateAndTriggerAlert(d, risk);
    }
  }

  private renderLayout() {
    const reportsCount = groundReportsService.getReports().length;

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100vw; height: 100vh; overflow: hidden; background: #050811; color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- Header -->
        <header style="height: 48px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; z-index: 1000; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #38bdf8; font-size: 16px;">⚡</span>
              <span style="font-weight: 900; font-size: 15px; letter-spacing: 0.5px; color: #ffffff;">NexSignal</span>
            </div>
            <div style="height: 14px; width: 1px; background: #334155;"></div>
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              SIH26001 &bull; MDoNER Landslide Risk Intelligence
            </div>
          </div>

          <!-- Controls: Feed, Download PDF Report, View Switcher, Replay & Language -->
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

            <!-- View Switcher (Government vs Citizen) -->
            <div style="display: flex; background: #050811; border: 1.5px solid #0284c7; border-radius: 6px; overflow: hidden; box-shadow: 0 0 10px rgba(2, 132, 199, 0.25);">
              <button id="btn-view-authority" class="tab-btn" style="padding: 4px 10px; font-size: 10px; font-weight: 800; cursor: pointer; border: none; background: ${this.viewMode === 'authority' ? '#0284c7' : 'transparent'}; color: white; display: flex; align-items: center; gap: 4px;">
                <span>🏛️</span> Govt / Admin
              </button>
              <button id="btn-view-citizen" class="tab-btn" style="padding: 4px 10px; font-size: 10px; font-weight: 800; cursor: pointer; border: none; background: ${this.viewMode === 'citizen' ? '#16a34a' : 'transparent'}; color: white; display: flex; align-items: center; gap: 4px;">
                <span>📱</span> Citizen Portal
              </button>
            </div>

            <!-- Replay Intro Button -->
            <button id="btn-replay-intro" style="background: #0b1120; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer;" title="Replay Cinematic Boot Sequence">
              🔄 Intro
            </button>

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
          <div id="authority-workspace" style="display: ${this.viewMode === 'authority' ? 'flex' : 'none'}; width: 100%; height: 100%;">
            
            <!-- Left Sidebar: Regional District Explorer -->
            <aside style="width: 280px; background: #050811; border-right: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500;">
              <div style="padding: 8px 10px; border-bottom: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px;">
                <input id="input-search-district" type="text" placeholder="Search District or State..." style="width: 100%; background: #0b1120; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 5px 8px; font-size: 11px; outline: none; box-sizing: border-box;" />
                
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
                  <button class="state-filter-btn active" data-state="ALL" style="background: #0b1120; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">ALL</button>
                  ${NER_STATES.map(s => `
                    <button class="state-filter-btn" data-state="${s}" style="background: #0b1120; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 9px; white-space: nowrap; cursor: pointer;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div id="sih-risk-score-panel" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
                <div id="district-list-scroll" style="width:100%;display:flex;flex-direction:column;"></div>
              </div>
            </aside>

            <!-- Center View: 100% Height Tactical Situation Map -->
            <main style="flex: 1; position: relative; display: flex; flex-direction: column; background: #090d16; overflow: hidden;">
              <div id="sih-unified-map" style="width: 100%; height: 100%; position: relative;">
                <div id="unified-situation-map-container" style="width:100%;height:100%;position:relative;"></div>
              </div>
            </main>

            <!-- Right Sidebar: 5 Purposeful Tabs (HUD, Highways, Shelters, Reports, Backtest) -->
            <aside style="width: 380px; background: #050811; border-left: 1px solid #1e293b; display: flex; flex-direction: column; z-index: 500; padding-bottom: 48px;">
              <div style="display: flex; background: #0b1120; border-bottom: 1px solid #1e293b; font-size: 10.5px;">
                <button id="tab-btn-hud" style="flex: 1; padding: 10px 2px; font-weight: 700; cursor: pointer; border: none; background: #050811; color: #38bdf8; border-bottom: 2px solid #38bdf8;">
                  Risk HUD
                </button>
                <button id="tab-btn-highways" style="flex: 1; padding: 10px 2px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;">
                  Highways
                </button>
                <button id="tab-btn-shelters" style="flex: 1; padding: 10px 2px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;">
                  Shelters
                </button>
                <button id="tab-btn-reports" style="flex: 1; padding: 10px 2px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;" title="Citizen & Field Ground Reports">
                  Reports (<span id="reports-tab-badge" style="color: #eab308;">${reportsCount}</span>)
                </button>
                <button id="tab-btn-backtest" style="flex: 1; padding: 10px 2px; font-weight: 700; cursor: pointer; border: none; background: #0b1120; color: #94a3b8; border-bottom: 2px solid transparent;" title="Methodology Illustration (NASA COOLR / GSI)">
                  Backtest
                </button>
              </div>

              <div style="flex: 1; overflow-y: auto; position: relative;">
                
                <!-- 1. Risk HUD Tab -->
                <div id="hud-tab-content" style="display: block; height: 100%;">
                  <div id="district-hud-container" style="height: 100%;"></div>
                </div>

                <!-- 2. Highways Tab -->
                <div id="highways-tab-content" style="display: none; padding: 12px; flex-direction: column; gap: 8px;">
                  <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
                    Critical NER Highway Corridors
                  </div>
                  ${NER_HIGHWAY_ROUTES.map(h => `
                    <div class="hwy-corridor-item" data-id="${h.id}" style="background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; cursor: pointer; transition: background 0.15s ease;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 800; font-size: 12px; color: #ffffff;">${h.code} &bull; ${h.name}</span>
                        <span style="font-size: 9px; font-weight: 800; color: ${h.overallVulnerability === 'CRITICAL' || h.overallVulnerability === 'HIGH' ? '#ef4444' : '#f59e0b'}; background: ${h.overallVulnerability === 'CRITICAL' || h.overallVulnerability === 'HIGH' ? '#ef444420' : '#f59e0b20'}; padding: 1px 5px; border-radius: 3px;">
                          ${h.overallVulnerability}
                        </span>
                      </div>
                      <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                        ${h.totalDistanceKm} km &bull; ${h.origin} &rarr; ${h.destination} &bull; Status: ${h.currentPassStatus}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- 3. Safe Shelters Tab -->
                <div id="shelters-tab-content" style="display: none; padding: 12px; flex-direction: column; gap: 8px;">
                  <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 4px;">
                    Designated Safe Evacuation Shelters
                  </div>
                  ${NER_SAFE_SHELTERS.map(s => `
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 800; font-size: 12px; color: #ffffff;">${s.name}</span>
                        <span style="font-size: 9px; font-weight: 800; color: #34d399; background: #05966920; padding: 1px 5px; border-radius: 3px;">
                          ${s.capacityPersons} Pers.
                        </span>
                      </div>
                      <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                        ${s.type} &bull; ${s.elevationM}m MSL &bull; DEOC: ${s.contactNumber}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- 4. Citizen & Field Reports Tab -->
                <div id="reports-tab-content" style="display: none; height: 100%; flex-direction: column;"></div>

                <!-- 5. Backtest Validation Tab -->
                <div id="backtest-tab-content" style="display: none; height: 100%; flex-direction: column;"></div>

              </div>
            </aside>
          </div>

          <!-- CITIZEN VIEW -->
          <div id="citizen-workspace" style="display: ${this.viewMode === 'citizen' ? 'block' : 'none'}; width: 100%; height: 100%; overflow-y: auto; background: #020617;">
            <div id="citizen-view-container"></div>
          </div>

        </div>

      </div>
    `;
  }

  private initComponents() {
    this.situationMapComp = new UnifiedSituationMap('unified-situation-map-container', (id) => {
      void this.selectDistrict(id);
    });

    this.hudComp = new DistrictHud('district-hud-container');
    
    this.citizenComp = new CitizenView('citizen-view-container', (id) => {
      void this.selectDistrict(id);
    });

    this.alertTickerComp = new AlertTicker('alert-ticker-container');

    const reportsContainer = document.getElementById('reports-tab-content');
    if (reportsContainer) {
      this.reportsPanelComp = new GroundReportsPanel(reportsContainer, (report) => {
        void this.selectDistrict(report.districtId);
        const targetDist = NER_DISTRICTS.find(d => d.id === report.districtId);
        if (targetDist) {
          this.situationMapComp?.flyToDistrict(targetDist);
        }
      });
    }

    groundReportsService.subscribe((reports) => {
      const badge = document.getElementById('reports-tab-badge');
      if (badge) badge.textContent = String(reports.length);
    });

    this.renderAllViews();
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

    this.hudComp?.setLanguage(this.lang);
    this.hudComp?.render(district, risk, weather, soil, seismic, aiAdvisory, nearbyHistorical);

    this.citizenComp?.setLanguage(this.lang);
    this.citizenComp?.render(district, risk, weather);
  }

  public setViewMode(mode: AppViewMode) {
    this.viewMode = mode;
    const btnAuth = document.getElementById('btn-view-authority');
    const btnCit = document.getElementById('btn-view-citizen');
    const authSpace = document.getElementById('authority-workspace');
    const citSpace = document.getElementById('citizen-workspace');

    if (mode === 'authority') {
      if (btnAuth) btnAuth.style.background = '#0284c7';
      if (btnCit) btnCit.style.background = 'transparent';
      if (authSpace) authSpace.style.display = 'flex';
      if (citSpace) citSpace.style.display = 'none';
    } else {
      if (btnAuth) btnAuth.style.background = 'transparent';
      if (btnCit) btnCit.style.background = '#16a34a';
      if (authSpace) authSpace.style.display = 'none';
      if (citSpace) citSpace.style.display = 'block';
    }
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

    // Replay Intro Button Event
    document.getElementById('btn-replay-intro')?.addEventListener('click', () => {
      if (this.onReplayIntro) {
        this.onReplayIntro();
      }
    });

    // Authority vs Citizen View
    const btnAuth = document.getElementById('btn-view-authority');
    const btnCit = document.getElementById('btn-view-citizen');

    btnAuth?.addEventListener('click', () => {
      this.setViewMode('authority');
    });

    btnCit?.addEventListener('click', () => {
      this.setViewMode('citizen');
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
    const tabBtnReports = document.getElementById('tab-btn-reports') as HTMLButtonElement | null;
    const tabBtnBacktest = document.getElementById('tab-btn-backtest') as HTMLButtonElement | null;

    const hudContent = document.getElementById('hud-tab-content') as HTMLElement | null;
    const hwyContent = document.getElementById('highways-tab-content') as HTMLElement | null;
    const shlContent = document.getElementById('shelters-tab-content') as HTMLElement | null;
    const reportsContent = document.getElementById('reports-tab-content') as HTMLElement | null;
    const backtestContent = document.getElementById('backtest-tab-content') as HTMLElement | null;

    const resetTabs = () => {
      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnReports, tabBtnBacktest].forEach(btn => {
        if (btn) {
          btn.style.background = '#0b1120';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent, reportsContent, backtestContent].forEach(c => {
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

    tabBtnReports?.addEventListener('click', () => {
      resetTabs();
      if (tabBtnReports && reportsContent) {
        tabBtnReports.style.background = '#050811';
        tabBtnReports.style.color = '#38bdf8';
        tabBtnReports.style.borderBottom = '2px solid #38bdf8';
        reportsContent.style.display = 'flex';
        this.reportsPanelComp?.render();
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
