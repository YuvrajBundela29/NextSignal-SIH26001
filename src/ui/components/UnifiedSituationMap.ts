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
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; background: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- Header Bar Matching NextSignal Sentinel Operations Console -->
        <div style="background: #070b14; border-bottom: 1px solid #1e293b; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; z-index: 500; height: 44px; min-height: 44px; box-sizing: border-box;">
          
          <!-- Left: Official NextSignal Radar Globe Logo & Situation Title -->
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 64 64" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" style="width: 100%; height: 100%;">
                <circle cx="32" cy="32" r="28" stroke="#0284c7" opacity="0.6"/>
                <ellipse cx="32" cy="32" rx="5" ry="28" stroke="#0284c7" opacity="0.4"/>
                <ellipse cx="32" cy="32" rx="14" ry="28" stroke="#0284c7" opacity="0.4"/>
                <ellipse cx="32" cy="32" rx="22" ry="28" stroke="#0284c7" opacity="0.4"/>
                <ellipse cx="32" cy="32" rx="28" ry="5" stroke="#0284c7" opacity="0.4"/>
                <ellipse cx="32" cy="32" rx="28" ry="14" stroke="#0284c7" opacity="0.4"/>
                <path d="M 6 32 L 20 32 L 24 24 L 30 40 L 36 22 L 42 38 L 46 32 L 56 32" stroke="#38bdf8" stroke-width="2.6"/>
                <circle cx="57" cy="32" r="2.2" fill="#38bdf8" stroke="none"/>
              </svg>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 13px; font-weight: 900; color: #38bdf8; letter-spacing: 0.8px; text-transform: uppercase;">
                NEXTSIGNAL SITUATION
              </span>
              <span style="background: rgba(2,132,199,0.2); color: #38bdf8; border: 1px solid rgba(2,132,199,0.4); font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px;">
                WEBGL
              </span>
            </div>
          </div>

          <!-- Center: Live UTC Clock -->
          <div id="unified-map-utc-clock" style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px; text-align: center; flex-shrink: 0;">
            ${new Date().toUTCString().toUpperCase()}
          </div>

          <!-- Right: Earth View Dropdown, Highway Navigator & 2D/3D Mode Switcher -->
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            
            <!-- Dark Styled Earth View Dropdown (Fixed White Background) -->
            <div style="display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px 8px;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 4px;">Layer:</span>
              <select id="sel-earth-remote-sensing" style="background: #0f172a; color: #f8fafc; border: none; font-size: 11px; font-weight: 600; outline: none; cursor: pointer; padding: 2px 0;">
                <option value="dark" style="background: #0f172a; color: #f8fafc;" selected>🌙 Dark Tactical Ops</option>
                <option value="satellite" style="background: #0f172a; color: #f8fafc;">🛰️ 4K Satellite Imagery</option>
                <option value="thermal" style="background: #0f172a; color: #f8fafc;">🔥 Live Thermal Earth Temp</option>
                <option value="clouds" style="background: #0f172a; color: #f8fafc;">☁️ Live Satellite Clouds</option>
                <option value="radar" style="background: #0f172a; color: #f8fafc;">🌧️ Live Weather Doppler Radar</option>
                <option value="topo" style="background: #0f172a; color: #f8fafc;">🏔️ Topo Relief</option>
                <option value="opentopo" style="background: #0f172a; color: #f8fafc;">🌲 OpenTopo Contours</option>
              </select>
            </div>

            <!-- Route Navigator Button -->
            <button id="btn-open-route-nav" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Open Highway Waypoint Navigator">
              <span>🧭</span>
              <span>Highway Routes</span>
            </button>

            <!-- Mode Switcher [ 2D | 3D ] With Generous Width -->
            <div style="display: flex; background: #0f172a; border: 1px solid #334155; border-radius: 6px; overflow: hidden;">
              <button id="btn-switch-2d" style="padding: 4px 12px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '2d' ? '#10b981' : 'transparent'}; color: white; transition: background 0.15s ease;">
                2D
              </button>
              <button id="btn-switch-3d" style="padding: 4px 12px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '3d' ? '#10b981' : 'transparent'}; color: white; transition: background 0.15s ease;">
                3D
              </button>
            </div>

            <!-- Fullscreen Button -->
            <button id="btn-unified-fullscreen" style="background: #0f172a; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer;" title="Toggle Fullscreen">
              ⛶
            </button>
          </div>
        </div>

        <!-- Floating Live Earth Telemetry Badge -->
        <div id="floating-earth-telemetry-badge" style="position: absolute; top: 52px; left: 14px; z-index: 450; background: rgba(9, 13, 22, 0.90); backdrop-filter: blur(10px); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 5px 12px; font-size: 10px; color: #f8fafc; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.6);">
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

        <!-- Map Viewports (100% Height) -->
        <div style="flex: 1; width: 100%; height: calc(100% - 44px); position: relative; overflow: hidden;">
          <!-- 2D Leaflet Tactical Map -->
          <div id="viewport-2d-map" style="width: 100%; height: 100%; display: ${this.mode === '2d' ? 'block' : 'none'};"></div>

          <!-- 3D Globe.gl Tactical Globe -->
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

    this.map2d = new LandslideMap('viewport-2d-map', (id) => this.onSelectDistrict(id));
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
