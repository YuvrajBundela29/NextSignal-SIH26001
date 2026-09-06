import type {
  DistrictProfile,
  RiskScoreBreakdown,
  WeatherTelemetry,
  SoilTelemetry,
  SeismicTelemetry,
  AppLanguage,
  AppViewMode,
  CitizenProfile,
} from '../services/landslide/types';
import type { DemoScenario } from '../services/landslide/mock-telemetry';
import { NER_DISTRICTS } from '../services/landslide/ner-districts';
import { calculateLandslideRisk } from '../services/landslide/risk-engine';
import { fetchLiveWeather } from '../services/landslide/open-meteo';
import { fetchLiveSeismicData, computeDistrictSeismicTelemetry, type UsgsEarthquake } from '../services/landslide/usgs-seismic';
import {
  MOCK_EARTHQUAKES,
  getMockWeatherForDistrict,
  getMockSoilForDistrict,
} from '../services/landslide/mock-telemetry';
import { NASA_COOLR_NER_EVENTS } from '../services/landslide/coolr-dataset';
import { generateDistrictAiAdvisory, type AiAdvisoryResponse } from '../services/landslide/ollama-advisory';
import { NER_HIGHWAY_CORRIDORS } from '../services/landslide/highway-corridors';
import { NER_SAFE_SHELTERS } from '../services/landslide/safe-shelters';
import { alertsManager } from '../services/landslide/alerts-manager';

// Subcomponents
import { AlertTicker } from './components/AlertTicker';
import { UnifiedSituationMap } from './components/UnifiedSituationMap';
import { DistrictHud } from './components/DistrictHud';
import { BacktestPanel } from './components/BacktestPanel';
import { CitizenView } from './components/CitizenView';
import { GroundReportsPanel } from './components/GroundReportsPanel';
import { openPrintableSitRepPdf } from '../services/landslide/sitrep-pdf';

export class LandslideDashboard {
  private containerId: string;
  private selectedDistrictId: string = 'sk_mangan';
  private lang: AppLanguage = 'en';
  private currentScenario: DemoScenario = 'monsoon_deluge';
  private isOfflineDemo: boolean = false;
  private searchQuery: string = '';
  private selectedStateFilter: string = 'ALL';
  private viewMode: AppViewMode = 'authority';
  private onReplayIntro?: () => void;
  private onExitToRoleSelection?: () => void;
  private citizenProfile?: CitizenProfile;

  // Data Stores
  private weatherMap = new Map<string, WeatherTelemetry>();
  private soilMap = new Map<string, SoilTelemetry>();
  private seismicMap = new Map<string, SeismicTelemetry>();
  private riskMap = new Map<string, RiskScoreBreakdown>();
  private aiAdvisoryMap = new Map<string, AiAdvisoryResponse>();
  private earthquakes: UsgsEarthquake[] = [];

  // Component Instances
  private alertTickerComp: AlertTicker | null = null;
  private situationMapComp: UnifiedSituationMap | null = null;
  private hudComp: DistrictHud | null = null;
  private citizenComp: CitizenView | null = null;
  private reportsPanelComp: GroundReportsPanel | null = null;

  constructor(
    containerId: string,
    initialRole: AppViewMode = 'authority',
    onReplayIntro?: () => void,
    onExitToRoleSelection?: () => void,
    citizenProfile?: CitizenProfile
  ) {
    this.containerId = containerId;
    this.viewMode = initialRole;
    this.onReplayIntro = onReplayIntro;
    this.onExitToRoleSelection = onExitToRoleSelection;
    this.citizenProfile = citizenProfile;

    if (this.citizenProfile?.districtId) {
      this.selectedDistrictId = this.citizenProfile.districtId;
    }

    this.init();
  }

  private async init() {
    this.renderSkeleton();
    this.populateInitialState();
    this.initSubComponents();
    this.bindGlobalEvents();

    void this.refreshLiveTelemetryBackground();
  }

  private populateInitialState() {
    this.earthquakes = MOCK_EARTHQUAKES[this.currentScenario] || [];

    NER_DISTRICTS.forEach((d) => {
      const weather = getMockWeatherForDistrict(d, this.currentScenario);
      const soil = getMockSoilForDistrict(d, this.currentScenario);
      const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.earthquakes);
      const risk = calculateLandslideRisk(d, weather, soil, seismic);

      this.weatherMap.set(d.id, weather);
      this.soilMap.set(d.id, soil);
      this.seismicMap.set(d.id, seismic);
      this.riskMap.set(d.id, risk);
    });
  }

  private async refreshLiveTelemetryBackground() {
    try {
      this.earthquakes = await fetchLiveSeismicData();
    } catch (e) {
      console.warn('[SIH26001] USGS live feed unreachable, using cached seismic data.');
    }

    const promises = NER_DISTRICTS.map(async (d) => {
      try {
        const fallback = this.weatherMap.get(d.id)!;
        const liveWeather = await fetchLiveWeather(d.id, d.lat, d.lon, fallback);
        this.weatherMap.set(d.id, liveWeather);

        const soil = this.soilMap.get(d.id)!;
        const seismic = computeDistrictSeismicTelemetry(d.lat, d.lon, this.earthquakes);
        this.seismicMap.set(d.id, seismic);

        const risk = calculateLandslideRisk(d, liveWeather, soil, seismic);
        this.riskMap.set(d.id, risk);
      } catch (err) {
        // Fallback already in place
      }
    });

    await Promise.allSettled(promises);
    this.renderAllViews();
  }

  private renderSkeleton() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.viewMode === 'citizen') {
      container.innerHTML = `
        <div id="citizen-standalone-wrapper" style="min-height: 100vh; background: #020617; width: 100%;">
          <!-- Injected by CitizenView -->
        </div>
      `;
      return;
    }

    // Government / Admin Command Center Layout
    container.innerHTML = `
      <div id="authority-workspace" style="display: flex; flex-direction: column; height: 100vh; width: 100vw; background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow: hidden;">
        
        <!-- Top Operational Header -->
        <header style="height: 52px; background: #0b1120; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; box-sizing: border-box; flex-shrink: 0; z-index: 1000; gap: 12px; overflow: hidden;">
          
          <!-- Brand & Government Badge (Left) -->
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 18px;">🏛️</span>
              <div>
                <span style="font-size: 14px; font-weight: 900; letter-spacing: -0.2px; color: #ffffff;">
                  NEXSIGNAL
                </span>
                <span style="font-size: 10px; font-weight: 800; color: #38bdf8; margin-left: 4px; letter-spacing: 0.5px;">
                  COMMAND CENTER
                </span>
              </div>
            </div>

            <div style="background: #0284c720; border: 1px solid #0284c7; color: #38bdf8; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 4px; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #38bdf8; animation: pulse 2s infinite;"></span>
              28 NER ACTIVE
            </div>
          </div>

          <!-- Central Alert Ticker (Middle) -->
          <div id="ticker-header-container" style="flex: 1 1 320px; max-width: 480px; min-width: 180px; overflow: hidden; height: 30px; margin: 0 4px;"></div>

          <!-- Header Right Actions (Right) -->
          <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
            
            <!-- Scenario Selector -->
            <select id="sel-scenario" style="background: #050811; border: 1px solid #334155; color: #cbd5e1; font-size: 11px; font-weight: 600; padding: 5px 6px; border-radius: 6px; outline: none; cursor: pointer; max-width: 170px;">
              <option value="monsoon_deluge">🌧️ Monsoon Deluge</option>
              <option value="seismic_crisis">⚡ Seismic Crisis</option>
              <option value="normal_baseline">🟢 Normal Baseline</option>
            </select>

            <!-- SitRep PDF Button -->
            <button id="btn-download-sitrep" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border: 1px solid #38bdf8; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);">
              <span>📄</span> PDF
            </button>

            <!-- Language Dropdown -->
            <select id="sel-app-language" style="background: #050811; border: 1px solid #334155; color: #cbd5e1; font-size: 11px; font-weight: 600; padding: 5px 6px; border-radius: 6px; outline: none; cursor: pointer;">
              <option value="en">🇬🇧 EN</option>
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="as">🇮🇳 অসমীয়া</option>
              <option value="bn">🇮🇳 বাংলা</option>
              <option value="mni">🇮🇳 মৈতৈ</option>
              <option value="lus">🇮🇳 Mizo</option>
              <option value="kha">🇮🇳 Khasi</option>
              <option value="ne">🇮🇳 नेपाली</option>
            </select>

            <!-- Replay Intro Button -->
            <button id="btn-replay-intro" title="Replay Futuristic Boot Sequence" style="background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 5px 7px; border-radius: 6px; cursor: pointer; white-space: nowrap;">
              🔄 Intro
            </button>

            <!-- Exit to Role Selection Gateway -->
            <button id="btn-exit-to-gateway" style="background: transparent; border: 1px solid #ef444460; color: #f87171; font-size: 11px; font-weight: 700; padding: 5px 9px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span>🚪</span> Exit
            </button>

          </div>
        </header>

        <!-- 3-Pane Tactical Command Grid -->
        <div style="flex: 1; display: grid; grid-template-columns: 290px 1fr 400px; overflow: hidden; position: relative;">
          
          <!-- Left Panel: 28 Districts Risk HUD & Search Filter -->
          <aside style="background: #0b1120; border-right: 1px solid #1e293b; display: flex; flex-direction: column; overflow: hidden;">
            
            <div style="padding: 12px; border-bottom: 1px solid #1e293b;">
              <input id="input-search-district" type="text" placeholder="Search District or Locality..." style="width: 100%; background: #050811; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #ffffff; box-sizing: border-box; outline: none;" />
            </div>

            <!-- State Filter Pills -->
            <div style="padding: 8px 12px; border-bottom: 1px solid #1e293b; display: flex; gap: 4px; overflow-x: auto; white-space: nowrap;">
              <button class="state-filter-btn" data-state="ALL" style="background: #050811; border: 1px solid #0284c7; color: #38bdf8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">ALL</button>
              <button class="state-filter-btn" data-state="Sikkim" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">SK</button>
              <button class="state-filter-btn" data-state="Meghalaya" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">ML</button>
              <button class="state-filter-btn" data-state="Assam" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">AS</button>
              <button class="state-filter-btn" data-state="Manipur" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">MN</button>
              <button class="state-filter-btn" data-state="Mizoram" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">MZ</button>
              <button class="state-filter-btn" data-state="Nagaland" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">NL</button>
              <button class="state-filter-btn" data-state="Arunachal Pradesh" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">AR</button>
              <button class="state-filter-btn" data-state="Tripura" style="background: #050811; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; cursor: pointer;">TR</button>
            </div>

            <!-- District List Scroll -->
            <div id="district-list-scroll" style="flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;"></div>

          </aside>

          <!-- Center Panel: Large Regional GIS Situation Map (Leaflet / 3D Globe) -->
          <main id="situation-map-container" style="position: relative; overflow: hidden; background: #020617;"></main>

          <!-- Right Sidebar: Tabs for Risk HUD, Highways, Shelters, Citizen Reports, Backtest -->
          <aside style="background: #0b1120; border-left: 1px solid #1e293b; display: flex; flex-direction: column; overflow: hidden;">
            
            <!-- Right Tab Switcher Bar -->
            <div style="display: flex; border-bottom: 1px solid #1e293b; background: #0b1120; flex-shrink: 0; overflow-x: auto;">
              <button id="tab-btn-hud" class="sidebar-tab-btn active" style="flex: 1; min-width: 60px; padding: 10px 4px; font-size: 10px; font-weight: 800; background: #050811; color: #38bdf8; border: none; border-bottom: 2px solid #38bdf8; cursor: pointer; text-transform: uppercase;">
                Risk HUD
              </button>
              <button id="tab-btn-highways" class="sidebar-tab-btn" style="flex: 1; min-width: 60px; padding: 10px 4px; font-size: 10px; font-weight: 800; background: #0b1120; color: #94a3b8; border: none; border-bottom: 2px solid transparent; cursor: pointer; text-transform: uppercase;">
                Highways
              </button>
              <button id="tab-btn-shelters" class="sidebar-tab-btn" style="flex: 1; min-width: 60px; padding: 10px 4px; font-size: 10px; font-weight: 800; background: #0b1120; color: #94a3b8; border: none; border-bottom: 2px solid transparent; cursor: pointer; text-transform: uppercase;">
                Shelters
              </button>
              <button id="tab-btn-reports" class="sidebar-tab-btn" style="flex: 1; min-width: 68px; padding: 10px 4px; font-size: 10px; font-weight: 800; background: #0b1120; color: #94a3b8; border: none; border-bottom: 2px solid transparent; cursor: pointer; text-transform: uppercase; position: relative;">
                Reports 🚨
              </button>
              <button id="tab-btn-backtest" class="sidebar-tab-btn" style="flex: 1; min-width: 60px; padding: 10px 4px; font-size: 10px; font-weight: 800; background: #0b1120; color: #94a3b8; border: none; border-bottom: 2px solid transparent; cursor: pointer; text-transform: uppercase;">
                Backtest
              </button>
            </div>

            <!-- Tab 1: District Risk HUD Container -->
            <div id="hud-tab-content" style="flex: 1; overflow-y: auto; padding: 14px; display: block; padding-bottom: 60px;"></div>

            <!-- Tab 2: Highways Corridor Container -->
            <div id="highways-tab-content" style="flex: 1; overflow-y: auto; padding: 14px; display: none; flex-direction: column; gap: 10px; padding-bottom: 60px;">
              ${this.renderHighwaysTabHtml()}
            </div>

            <!-- Tab 3: Safe Shelters Container -->
            <div id="shelters-tab-content" style="flex: 1; overflow-y: auto; padding: 14px; display: none; flex-direction: column; gap: 10px; padding-bottom: 60px;">
              ${this.renderSheltersTabHtml()}
            </div>

            <!-- Tab 4: Citizen & Field Ground Reports Panel Container -->
            <div id="reports-tab-content" style="flex: 1; overflow-y: auto; padding: 14px; display: none; flex-direction: column; padding-bottom: 60px;"></div>

            <!-- Tab 5: Historical Backtest Container -->
            <div id="backtest-tab-content" style="flex: 1; overflow-y: auto; padding: 14px; display: none; flex-direction: column; padding-bottom: 60px;"></div>

          </aside>

        </div>

      </div>
    `;
  }

  private renderHighwaysTabHtml(): string {
    return NER_HIGHWAY_CORRIDORS.map((hwy) => `
      <div class="hwy-corridor-item" data-id="${hwy.id}" style="background: #050811; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; cursor: pointer; transition: border-color 0.15s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 800; color: #38bdf8;">${hwy.code}</span>
          <span style="font-size: 9px; font-weight: 800; background: ${hwy.currentStatus === 'BLOCKED' ? '#ef444420' : hwy.currentStatus === 'RESTRICTED' ? '#f59e0b20' : '#22c55e20'}; color: ${hwy.currentStatus === 'BLOCKED' ? '#ef4444' : hwy.currentStatus === 'RESTRICTED' ? '#f59e0b' : '#22c55e'}; padding: 2px 6px; border-radius: 4px; border: 1px solid currentColor;">
            ${hwy.currentStatus}
          </span>
        </div>
        <div style="font-size: 11px; color: #f1f5f9; font-weight: 700; margin-bottom: 2px;">${hwy.name}</div>
        <div style="font-size: 10px; color: #94a3b8; line-height: 1.4;">${hwy.vulnerableChokePoints.join(' &bull; ')}</div>
      </div>
    `).join('');
  }

  private renderSheltersTabHtml(): string {
    return NER_SAFE_SHELTERS.map((s) => `
      <div style="background: #050811; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 800; color: #22c55e;">${s.name}</span>
          <span style="font-size: 9px; font-weight: 800; background: #22c55e20; color: #22c55e; padding: 2px 6px; border-radius: 4px; border: 1px solid #22c55e;">
            ${s.capacityPersons} BEDS
          </span>
        </div>
        <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">${s.type} &bull; 📞 ${s.contactNumber}</div>
        <div style="font-size: 10px; color: #38bdf8; font-family: monospace;">Coord: ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</div>
      </div>
    `).join('');
  }

  private initSubComponents() {
    if (this.viewMode === 'citizen') {
      const citContainer = document.getElementById('citizen-standalone-wrapper');
      if (citContainer) {
        const d = NER_DISTRICTS.find((dist) => dist.id === this.selectedDistrictId) || NER_DISTRICTS[0];
        const risk = this.riskMap.get(d.id)!;
        const weather = this.weatherMap.get(d.id)!;
        const soil = this.soilMap.get(d.id);
        const seismic = this.seismicMap.get(d.id);

        this.citizenComp = new CitizenView(
          citContainer,
          d,
          this.citizenProfile,
          (districtId) => this.selectDistrict(districtId),
          () => {
            if (this.onExitToRoleSelection) {
              this.onExitToRoleSelection();
            }
          }
        );
        this.citizenComp.setLanguage(this.lang);
        this.citizenComp.render(d, risk, weather, soil, seismic);
      }
      return;
    }

    // Initialize Government / Admin Subcomponents
    this.alertTickerComp = new AlertTicker('ticker-header-container');

    const mapContainer = document.getElementById('situation-map-container');
    if (mapContainer) {
      this.situationMapComp = new UnifiedSituationMap(
        'situation-map-container',
        (districtId) => this.selectDistrict(districtId)
      );
      this.situationMapComp.setLanguage(this.lang);
    }

    const hudContainer = document.getElementById('hud-tab-content');
    if (hudContainer) {
      this.hudComp = new DistrictHud('hud-tab-content');
    }

    const reportsContainer = document.getElementById('reports-tab-content');
    if (reportsContainer) {
      this.reportsPanelComp = new GroundReportsPanel(reportsContainer, (selectedReport) => {
        if (this.situationMapComp) {
          const d = NER_DISTRICTS.find((dist) => dist.id === selectedReport.districtId);
          if (d) this.situationMapComp.flyToDistrict(d);
        }
      });
      this.reportsPanelComp.render();
    }

    this.renderAllViews();
  }

  public renderAllViews() {
    this.renderDistrictList();
    this.updateActiveDistrictViews();

    if (this.situationMapComp) {
      this.situationMapComp.updateData(
        NER_DISTRICTS,
        this.riskMap,
        this.selectedDistrictId,
        this.earthquakes
      );
    }

    if (this.alertTickerComp) {
      const activeAlerts = alertsManager.getActiveAlerts();
      this.alertTickerComp.render(activeAlerts);
    }
  }

  private renderDistrictList() {
    const listEl = document.getElementById('district-list-scroll');
    if (!listEl) return;

    let filtered = NER_DISTRICTS;
    if (this.selectedStateFilter !== 'ALL') {
      filtered = filtered.filter((d) => d.state === this.selectedStateFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
    }

    listEl.innerHTML = filtered.map((d) => {
      const risk = this.riskMap.get(d.id);
      const isSelected = d.id === this.selectedDistrictId;
      const score = risk ? risk.compositeScore : 50;
      const level = risk ? risk.level : 'MODERATE';
      const color = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MODERATE' ? '#eab308' : '#22c55e';

      return `
        <div class="district-list-item" data-id="${d.id}" style="background: ${isSelected ? '#0284c725' : '#050811'}; border: 1px solid ${isSelected ? '#0284c7' : '#1e293b'}; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.15s ease; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: ${isSelected ? '#38bdf8' : '#ffffff'};">${d.name}</div>
            <div style="font-size: 10px; color: #94a3b8;">${d.state} &bull; Elev ${d.elevationM}m</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 900; color: ${color};">${score}</div>
            <div style="font-size: 8px; font-weight: 800; color: ${color}; text-transform: uppercase;">${level}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  public async selectDistrict(districtId: string) {
    this.selectedDistrictId = districtId;
    this.renderDistrictList();
    await this.updateActiveDistrictViews();

    const d = NER_DISTRICTS.find((dist) => dist.id === districtId);
    if (d && this.situationMapComp) {
      this.situationMapComp.flyToDistrict(d);
    }
  }

  private async updateActiveDistrictViews() {
    const district = NER_DISTRICTS.find((d) => d.id === this.selectedDistrictId);
    if (!district) return;

    const risk = this.riskMap.get(district.id);
    const weather = this.weatherMap.get(district.id);
    const soil = this.soilMap.get(district.id);
    const seismic = this.seismicMap.get(district.id);

    if (!risk || !weather || !soil || !seismic) return;

    const nearbyHistorical = NASA_COOLR_NER_EVENTS.filter(
      (e) => e.district === district.id || e.state === district.state
    );

    let aiAdvisory = this.aiAdvisoryMap.get(district.id);
    if (!aiAdvisory) {
      aiAdvisory = await generateDistrictAiAdvisory(district, risk, weather, soil, seismic);
      this.aiAdvisoryMap.set(district.id, aiAdvisory);
    }

    this.hudComp?.setLanguage(this.lang);
    this.hudComp?.render(district, risk, weather, soil, seismic, aiAdvisory, nearbyHistorical);

    this.citizenComp?.setLanguage(this.lang);
    this.citizenComp?.render(district, risk, weather, soil, seismic);
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

    // SitRep PDF Button
    document.getElementById('btn-download-sitrep')?.addEventListener('click', () => {
      openPrintableSitRepPdf(this.riskMap, this.weatherMap, this.soilMap, this.seismicMap, this.selectedDistrictId);
    });

    // Replay Intro Button
    document.getElementById('btn-replay-intro')?.addEventListener('click', () => {
      if (this.onReplayIntro) {
        this.onReplayIntro();
      }
    });

    // Exit to Role Selection Gateway
    document.getElementById('btn-exit-to-gateway')?.addEventListener('click', () => {
      if (this.onExitToRoleSelection) {
        this.onExitToRoleSelection();
      }
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
      this.currentScenario = val as DemoScenario;
      this.populateInitialState();
      this.renderAllViews();
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
      allBtns.forEach((b) => {
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
      [tabBtnHud, tabBtnHwy, tabBtnShl, tabBtnReports, tabBtnBacktest].forEach((btn) => {
        if (btn) {
          btn.style.background = '#0b1120';
          btn.style.color = '#94a3b8';
          btn.style.borderBottom = '2px solid transparent';
        }
      });
      [hudContent, hwyContent, shlContent, reportsContent, backtestContent].forEach((c) => {
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
