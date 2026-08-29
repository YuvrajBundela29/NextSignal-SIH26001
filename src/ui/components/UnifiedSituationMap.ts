import { LandslideMap } from './LandslideMap';
import { TacticalGlobe3D } from './TacticalGlobe3D';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';

export class UnifiedSituationMap {
  private container: HTMLElement;
  private map2d: LandslideMap | null = null;
  private globe3d: TacticalGlobe3D | null = null;
  private mode: '2d' | '3d' = '2d';
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private clockTimer: ReturnType<typeof setInterval> | null = null;

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
        <div style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; z-index: 500; min-height: 36px;">
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

          <!-- Right: 2D/3D Mode Switcher & Controls -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Basemap Selector (for 2D) -->
            <div id="unified-basemap-wrap" style="display: ${this.mode === '2d' ? 'flex' : 'none'}; align-items: center; gap: 4px;">
              <select id="sel-unified-basemap" style="background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 10px; outline: none; cursor: pointer;">
                <option value="dark" selected>🌙 Dark Operations</option>
                <option value="satellite">🛰️ 4K Satellite</option>
                <option value="topo">🏔️ Topo Relief</option>
                <option value="opentopo">🌲 OpenTopo</option>
              </select>
            </div>

            <!-- Mode Switcher [ 2D | 3D ] Matching NextSignal Screenshot -->
            <div style="display: flex; background: #1e293b; border: 1px solid #334155; border-radius: 4px; overflow: hidden;">
              <button id="btn-switch-2d" style="padding: 2px 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '2d' ? '#10b981' : 'transparent'}; color: white;">
                2D
              </button>
              <button id="btn-switch-3d" style="padding: 2px 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '3d' ? '#10b981' : 'transparent'}; color: white;">
                3D
              </button>
            </div>

            <!-- Expand / Fullscreen Button -->
            <button id="btn-unified-fullscreen" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;" title="Toggle Fullscreen">
              ⛶
            </button>
          </div>
        </div>

        <!-- Map Viewports -->
        <div style="flex: 1; width: 100%; height: calc(100% - 36px); position: relative; overflow: hidden;">
          <!-- 2D Leaflet Tactical Map -->
          <div id="viewport-2d-map" style="width: 100%; height: 100%; display: ${this.mode === '2d' ? 'block' : 'none'};"></div>

          <!-- 3D Globe.gl Tactical Globe -->
          <div id="viewport-3d-globe" style="width: 100%; height: 100%; display: ${this.mode === '3d' ? 'block' : 'none'}; position: relative;"></div>
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
    this.map2d = new LandslideMap('viewport-2d-map', (id) => this.onSelectDistrict(id));
    this.globe3d = new TacticalGlobe3D('viewport-3d-globe', (id) => this.onSelectDistrict(id));

    // Bind Controls
    const btn2d = document.getElementById('btn-switch-2d');
    const btn3d = document.getElementById('btn-switch-3d');
    const view2d = document.getElementById('viewport-2d-map');
    const view3d = document.getElementById('viewport-3d-globe');
    const basemapWrap = document.getElementById('unified-basemap-wrap');

    btn2d?.addEventListener('click', () => {
      this.mode = '2d';
      btn2d.style.background = '#10b981';
      if (btn3d) btn3d.style.background = 'transparent';
      if (view2d) view2d.style.display = 'block';
      if (view3d) view3d.style.display = 'none';
      if (basemapWrap) basemapWrap.style.display = 'flex';
      this.syncData();
    });

    btn3d?.addEventListener('click', () => {
      this.mode = '3d';
      if (btn2d) btn2d.style.background = 'transparent';
      btn3d.style.background = '#10b981';
      if (view2d) view2d.style.display = 'none';
      if (view3d) view3d.style.display = 'block';
      if (basemapWrap) basemapWrap.style.display = 'none';
      this.syncData();
    });

    const selBasemap = document.getElementById('sel-unified-basemap') as HTMLSelectElement;
    selBasemap?.addEventListener('change', () => {
      this.map2d?.setBaseMap(selBasemap.value as any);
    });

    const btnFullscreen = document.getElementById('btn-unified-fullscreen');
    btnFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
      } else {
        void document.exitFullscreen();
      }
    });
  }

  public setSatelliteLayer(layerId: string, enabled: boolean) {
    this.map2d?.setSatelliteLayer(layerId, enabled);
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
  }

  public destroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.globe3d?.destroy();
  }
}
