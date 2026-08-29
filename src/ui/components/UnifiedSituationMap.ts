import { LandslideMap } from './LandslideMap';
import { TacticalGlobe3D } from './TacticalGlobe3D';
import { HighwayNavigationModal } from './HighwayNavigationModal';
import { fetchLiveSatelliteWindTelemetry, type LiveWindTelemetry } from '../../services/landslide/satellite-streams';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';

export class UnifiedSituationMap {
  private container: HTMLElement;
  private map2d: LandslideMap | null = null;
  private globe3d: TacticalGlobe3D | null = null;
  private navModal: HighwayNavigationModal | null = null;
  private mode: '2d' | '3d' = '2d';
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private clockTimer: ReturnType<typeof setInterval> | null = null;
  private liveTelemetry: LiveWindTelemetry | null = null;

  // Cached state
  private districts: DistrictProfile[] = [];
  private riskMap: Map<string, RiskScoreBreakdown> = new Map();
  private selectedDistrictId: string = 'as_dima_hasao';
  private quakes: UsgsEarthquake[] = [];
  private showCoolr = true;
  private showSeismic = true;
  private showHighways = true;
  private showShelters = true;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;

    this.render();
    this.initMaps();
    this.startUtcClock();
  }

  private render() {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; background: #030712;">
        
        <!-- Header Bar Matching NextSignal Screenshot 1 & 2 -->
        <div style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; z-index: 500; min-height: 38px;">
          <!-- Left: Title -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 13px; font-weight: 900; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase;">
              MDoNER NER SITUATION
            </span>
            <span style="background: rgba(2,132,199,0.2); color: #38bdf8; border: 1px solid #0284c7; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px;">
              WEBGL
            </span>
          </div>

          <!-- Center: Live UTC Clock -->
          <div id="unified-map-utc-clock" style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px;">
            ${new Date().toUTCString().toUpperCase()}
          </div>

          <!-- Right: Earth View Dropdown, 2D/3D Mode Switcher & Controls -->
          <div style="display: flex; align-items: center; gap: 8px;">
            
            <!-- Earth View & Remote Sensing API Dropdown -->
            <div style="display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px;">
              <span style="font-size: 9px; color: #94a3b8; margin-right: 4px;">Layer:</span>
              <select id="sel-earth-remote-sensing" style="background: transparent; color: #f8fafc; border: none; font-size: 10px; font-weight: bold; outline: none; cursor: pointer;">
                <option value="dark" selected>🌙 Dark Tactical Ops</option>
                <option value="satellite">🛰️ 4K Satellite Imagery</option>
                <option value="thermal">🔥 Live Thermal Earth Temp (NASA MODIS)</option>
                <option value="clouds">☁️ Live Satellite Clouds (NASA VIIRS)</option>
                <option value="radar">🌧️ Live Weather Doppler Radar</option>
                <option value="topo">🏔️ Topo Relief</option>
                <option value="opentopo">🌲 OpenTopo Contours</option>
              </select>
            </div>

            <!-- Route Navigator Button -->
            <button id="btn-open-route-nav" style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 3px 8px; font-size: 10px; font-weight: 800; cursor: pointer;" title="Open Highway Waypoint Navigator">
              🧭 Highway Routes
            </button>

            <!-- Mode Switcher [ 2D | 3D ] Matching NextSignal Screenshot -->
            <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 4px; overflow: hidden;">
              <button id="btn-switch-2d" style="padding: 3px 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '2d' ? '#10b981' : 'transparent'}; color: white;">
                2D
              </button>
              <button id="btn-switch-3d" style="padding: 3px 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '3d' ? '#10b981' : 'transparent'}; color: white;">
                3D
              </button>
            </div>

            <!-- Fullscreen Button -->
            <button id="btn-unified-fullscreen" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 3px 7px; font-size: 11px; cursor: pointer;" title="Toggle Fullscreen">
              ⛶
            </button>
          </div>
        </div>

        <!-- Floating Live Earth Telemetry Badge (Compact, non-intrusive) -->
        <div id="floating-earth-telemetry-badge" style="position: absolute; top: 46px; left: 12px; z-index: 450; background: rgba(9, 13, 22, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 6px 10px; font-size: 10px; color: #f8fafc; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #38bdf8;">💨 Wind:</span>
            <strong id="badge-wind-val">18 km/h SW</strong>
          </div>
          <div style="width: 1px; height: 12px; background: #334155;"></div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #f97316;">🔥 Thermal:</span>
            <strong id="badge-thermal-val">24.2°C</strong>
          </div>
          <div style="width: 1px; height: 12px; background: #334155;"></div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #c084fc;">☁️ Cloud:</span>
            <strong id="badge-cloud-val">82%</strong>
          </div>
        </div>

        <!-- Map Viewports -->
        <div style="flex: 1; width: 100%; height: calc(100% - 38px); position: relative; overflow: hidden;">
          <!-- 2D Leaflet Tactical Map (Zero Watermark / No API Key) -->
          <div id="viewport-2d-map" style="width: 100%; height: 100%; display: ${this.mode === '2d' ? 'block' : 'none'};"></div>

          <!-- 3D Globe.gl Tactical Globe (Centered on Northeast India) -->
          <div id="viewport-3d-globe" style="width: 100%; height: 100%; display: ${this.mode === '3d' ? 'block' : 'none'}; position: absolute; inset: 0;"></div>
        </div>
      </div>
    `;
  }

  private startUtcClock() {
    this.clockTimer = setInterval(() => {
      const el = document.getElementById('unified-map-utc-clock');
      if (el) {
        const now = new Date();
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const dayName = days[now.getUTCDay()];
        const date = now.getUTCDate();
        const monthName = months[now.getUTCMonth()];
        const year = now.getUTCFullYear();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        el.textContent = `${dayName}, ${date} ${monthName} ${year} ${hours}:${mins}:${secs} UTC`;
      }
    }, 1000);
  }

  private initMaps() {
    this.navModal = new HighwayNavigationModal((lat, lon, zoom) => {
      if (this.mode === '2d') {
        this.map2d?.flyToDistrict(lat, lon, zoom);
      } else {
        this.globe3d?.orientToCoordinates(lat, lon, 0.6);
      }
    });

    this.map2d = new LandslideMap(
      'viewport-2d-map',
      (id) => this.onSelectDistrict(id),
      (routeId) => this.navModal?.open(routeId)
    );

    this.globe3d = new TacticalGlobe3D('viewport-3d-globe', (id) => this.onSelectDistrict(id));

    // Bind Controls
    const btn2d = document.getElementById('btn-switch-2d');
    const btn3d = document.getElementById('btn-switch-3d');
    const view2d = document.getElementById('viewport-2d-map');
    const view3d = document.getElementById('viewport-3d-globe');

    btn2d?.addEventListener('click', () => {
      this.mode = '2d';
      btn2d.style.background = '#10b981';
      if (btn3d) btn3d.style.background = 'transparent';
      if (view2d) view2d.style.display = 'block';
      if (view3d) view3d.style.display = 'none';
      this.syncData();
    });

    btn3d?.addEventListener('click', () => {
      this.mode = '3d';
      if (btn2d) btn2d.style.background = 'transparent';
      btn3d.style.background = '#10b981';
      if (view2d) view2d.style.display = 'none';
      if (view3d) view3d.style.display = 'block';
      this.globe3d?.resize();
      this.syncData();
    });

    // Remote Sensing Dropdown
    const selRemote = document.getElementById('sel-earth-remote-sensing') as HTMLSelectElement;
    selRemote?.addEventListener('change', () => {
      const val = selRemote.value;
      // Reset satellite overlay layers
      ['thermal_anomalies', 'viirs_truecolor', 'clouds_ir', 'weather_radar'].forEach(l => {
        this.map2d?.setSatelliteLayer(l, false);
      });

      if (val === 'dark' || val === 'satellite' || val === 'topo' || val === 'opentopo') {
        this.map2d?.setBaseMap(val as any);
      } else if (val === 'thermal') {
        this.map2d?.setBaseMap('dark');
        this.map2d?.setSatelliteLayer('thermal_anomalies', true);
      } else if (val === 'clouds') {
        this.map2d?.setBaseMap('satellite');
        this.map2d?.setSatelliteLayer('clouds_ir', true);
      } else if (val === 'radar') {
        this.map2d?.setBaseMap('dark');
        this.map2d?.setSatelliteLayer('weather_radar', true);
      }
    });

    // Highway Navigation Modal Trigger
    document.getElementById('btn-open-route-nav')?.addEventListener('click', () => {
      this.navModal?.open();
    });

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-unified-fullscreen');
    btnFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
      } else {
        void document.exitFullscreen();
      }
    });
  }

  public async updateTelemetryForDistrict(d: DistrictProfile) {
    this.liveTelemetry = await fetchLiveSatelliteWindTelemetry(d.lat, d.lon);
    if (this.liveTelemetry) {
      const windEl = document.getElementById('badge-wind-val');
      const thermalEl = document.getElementById('badge-thermal-val');
      const cloudEl = document.getElementById('badge-cloud-val');

      if (windEl) windEl.textContent = `${this.liveTelemetry.speedKmh} km/h ${this.liveTelemetry.directionCardinal}`;
      if (thermalEl) thermalEl.textContent = `${this.liveTelemetry.thermalSurfaceTempC}°C`;
      if (cloudEl) cloudEl.textContent = `${this.liveTelemetry.cloudCoverTotalPct}%`;
    }
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
    this.map2d?.setLanguage(lang);
    this.globe3d?.setLanguage(lang);
  }

  public updateData(
    districts: DistrictProfile[],
    riskMap: Map<string, RiskScoreBreakdown>,
    selectedDistrictId: string,
    quakes: UsgsEarthquake[]
  ) {
    this.districts = districts;
    this.riskMap = riskMap;
    this.selectedDistrictId = selectedDistrictId;
    this.quakes = quakes;

    this.syncData();
  }

  private syncData() {
    this.map2d?.renderDistricts(this.districts, this.riskMap, this.selectedDistrictId);
    this.map2d?.renderSeismicEvents(this.quakes, this.showSeismic);
    this.map2d?.renderCoolrLandslides(this.showCoolr);
    this.map2d?.renderHighwayCorridors(this.showHighways);
    this.map2d?.renderSafeShelters(this.showShelters);

    this.globe3d?.renderSeismicQuakes(this.quakes, this.showSeismic);
    this.globe3d?.renderCoolrEvents(this.showCoolr);
    this.globe3d?.renderDistricts(this.districts, this.riskMap, this.selectedDistrictId);
  }

  public flyToDistrict(district: DistrictProfile) {
    this.selectedDistrictId = district.id;
    if (this.mode === '2d') {
      this.map2d?.flyToDistrict(district.lat, district.lon);
      this.map2d?.renderDistricts(this.districts, this.riskMap, this.selectedDistrictId);
    } else {
      this.globe3d?.orientToCoordinates(district.lat, district.lon, 0.7);
      this.globe3d?.renderDistricts(this.districts, this.riskMap, this.selectedDistrictId);
    }
    void this.updateTelemetryForDistrict(district);
  }

  public openHighwayNavigator(routeId?: string) {
    this.navModal?.open(routeId);
  }

  public destroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.globe3d?.destroy();
  }
}
