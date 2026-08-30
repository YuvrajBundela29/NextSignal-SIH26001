import { LandslideMap } from './LandslideMap';
import { TacticalGlobe3D } from './TacticalGlobe3D';
import { HighwayNavigationModal } from './HighwayNavigationModal';
import { TacticalHudOverlay } from './tactical-hud-overlay';
import { MapLegendBar, type LegendType } from './map-legend-bar';
import { sensorOpticsManager, type SensorOpticMode } from './sensor-optics';
import { cinematicDirector, type TourWaypoint } from '../../services/landslide/cinematic-director';
import { SpatialRangefinder } from '../../services/landslide/spatial-rangefinder';
import { voiceCommandEngine, type TacticalCommandResult } from '../../services/landslide/voice-command-engine';
import type {
  DistrictProfile,
  RiskScoreBreakdown,
  AppLanguage,
} from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { fetchLiveSatelliteWindTelemetry, type LiveWindTelemetry } from '../../services/landslide/satellite-streams';

export class UnifiedSituationMap {
  private container: HTMLElement;
  private mode: '2d' | '3d' = '2d';
  private map2d: LandslideMap | null = null;
  private globe3d: TacticalGlobe3D | null = null;
  private navModal: HighwayNavigationModal | null = null;
  private hudOverlay: TacticalHudOverlay | null = null;
  private legendBar: MapLegendBar | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private clockTimer: any = null;
  private liveTelemetry: LiveWindTelemetry | null = null;

  // Cached state
  private districts: DistrictProfile[] = [];
  private riskMap: Map<string, RiskScoreBreakdown> = new Map();
  private selectedDistrictId: string = 'as_dima_hasao';
  private quakes: UsgsEarthquake[] = [];
  private showCoolr = true;
  private showSeismic = true;
  private showShelters = true;

  // Rangefinder state
  private isRangefinderActive = false;

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
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; background: #000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- GIS Command Toolbar (100% Clean Symbols) -->
        <div style="background: #050811; border-bottom: 1px solid #1e293b; padding: 4px 8px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; z-index: 500; min-height: 38px; box-sizing: border-box; width: 100%; gap: 6px;">
          
          <!-- Left: 2D/3D Mode Switcher + UTC Clock + Telemetry -->
          <div style="display: flex; align-items: center; gap: 6px;">
            
            <!-- Mode Switcher -->
            <div style="display: flex; background: #0b1120; border: 1.5px solid #10b981; border-radius: 5px; overflow: hidden; box-shadow: 0 0 8px rgba(16, 185, 129, 0.25);">
              <button id="btn-switch-2d" style="padding: 3px 10px; font-size: 10px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '2d' ? '#10b981' : 'transparent'}; color: white; transition: background 0.15s ease;" title="Switch to 2D High-Performance Tactical Map">
                2D MAP
              </button>
              <button id="btn-switch-3d" style="padding: 3px 10px; font-size: 10px; font-weight: 800; cursor: pointer; border: none; background: ${this.mode === '3d' ? '#10b981' : 'transparent'}; color: white; transition: background 0.15s ease;" title="Switch to 3D Geospatial Earth Globe">
                3D GLOBE
              </button>
            </div>

            <!-- Live Clock -->
            <div style="display: flex; align-items: center; gap: 5px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px; padding: 2px 7px;">
              <div style="width: 5px; height: 5px; border-radius: 50%; background: #10b981; box-shadow: 0 0 5px #10b981;"></div>
              <div id="unified-map-utc-clock" style="font-family: monospace; font-size: 9.5px; font-weight: 700; color: #38bdf8;">
                ${new Date().toUTCString().slice(17, 25)} UTC
              </div>
            </div>

            <!-- Telemetry Values -->
            <div style="display: flex; align-items: center; gap: 6px; background: #0b1120; border: 1px solid #1e293b; border-radius: 4px; padding: 2px 7px; font-size: 9px; color: #cbd5e1;">
              <span>Wind: <strong id="badge-wind-val" style="color: #38bdf8;">18 km/h</strong></span>
              <span style="color: #334155;">|</span>
              <span>Surface: <strong id="badge-thermal-val" style="color: #f97316;">24.0Â°C</strong></span>
              <span style="color: #334155;">|</span>
              <span>Cloud: <strong id="badge-cloud-val" style="color: #c084fc;">82%</strong></span>
            </div>
          </div>

          <!-- Center: Optics & Remote Sensing Layer Dropdowns -->
          <div style="display: flex; align-items: center; gap: 6px;">
            
            <!-- Sensor Optics Switcher -->
            <div style="display: flex; align-items: center; background: #0b1120; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px;">
              <span style="font-size: 9px; color: #38bdf8; margin-right: 4px; font-weight: 700;">Optic:</span>
              <select id="sel-sensor-optics" style="background: #0b1120; color: #f8fafc; border: none; font-size: 9.5px; font-weight: 700; outline: none; cursor: pointer;">
                <option value="natural" selected>Natural RGB [1]</option>
                <option value="flir">FLIR Thermal [2]</option>
                <option value="nvg">Night Vision [3]</option>
                <option value="crt">CRT Scanline [4]</option>
                <option value="noir">Recon Noir [5]</option>
                <option value="arctic">Rock Scar [6]</option>
              </select>
            </div>

            <!-- Remote Sensing Layer Selector (Works in 2D and 3D) -->
            <div style="display: flex; align-items: center; background: #0b1120; border: 1px solid #334155; border-radius: 4px; padding: 2px 6px;">
              <span style="font-size: 9px; color: #94a3b8; margin-right: 4px; font-weight: 600;">Layer:</span>
              <select id="sel-earth-remote-sensing" style="background: #0b1120; color: #f8fafc; border: none; font-size: 9.5px; font-weight: 600; outline: none; cursor: pointer;">
                <option value="satellite" selected>4K Satellite Imagery</option>
                <option value="dark">Dark Tactical Base</option>
                <option value="thermal">Live Land Surface Temp (LST)</option>
                <option value="clouds">Live Satellite Clouds (IR)</option>
                <option value="radar">Doppler Weather Radar</option>
                <option value="topo">Topographic Relief</option>
                <option value="opentopo">Mountain Contours</option>
              </select>
            </div>
          </div>

          <!-- Right: Command Tools -->
          <div style="display: flex; align-items: center; gap: 4px;">
            
            <!-- Corridor Tour -->
            <button id="btn-cinematic-tour" style="background: #0b1120; color: #f59e0b; border: 1px solid #d97706; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Strategic Corridor Inspection Tour">
              <span id="label-tour-status">Tour</span>
            </button>

            <!-- Geodetic Rangefinder -->
            <button id="btn-rangefinder-tool" style="background: #0b1120; color: #c084fc; border: 1px solid #7c3aed; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Geodetic Rangefinder & Rescue ETA">
              Range
            </button>

            <!-- Tactical Voice Directives -->
            <button id="btn-tactical-voice" style="background: #0b1120; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Voice Directives Console">
              Voice
            </button>

            <!-- Military HUD Toggle -->
            <button id="btn-toggle-hud" style="background: #0284c7; color: #ffffff; border: 1px solid #38bdf8; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Toggle HUD Overlay [H]">
              HUD [H]
            </button>

            <!-- Target Detection Mesh Toggle -->
            <button id="btn-toggle-detection" style="background: #0f172a; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Toggle Target Brackets [D]">
              Target [D]
            </button>

            <!-- Highways Button -->
            <button id="btn-open-route-nav" style="background: #0b1120; color: #38bdf8; border: 1px solid #334155; border-radius: 4px; padding: 3px 8px; font-size: 9px; font-weight: 700; cursor: pointer;" title="Highway Route Navigator">
              Routes
            </button>

            <!-- Fullscreen Button -->
            <button id="btn-unified-fullscreen" style="background: #0b1120; color: #94a3b8; border: 1px solid #334155; border-radius: 4px; padding: 3px 7px; font-size: 9px; cursor: pointer;" title="Toggle Fullscreen">
              [ ]
            </button>
          </div>
        </div>

        <!-- Tour Active Banner -->
        <div id="tour-active-banner" style="display: none; position: absolute; top: 46px; left: 50%; transform: translateX(-50%); z-index: 480; background: rgba(15, 23, 42, 0.95); border: 1px solid #f59e0b; border-radius: 8px; padding: 6px 16px; color: #f8fafc; text-align: center; box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); max-width: 600px;">
          <div style="font-size: 10px; font-weight: 800; color: #f59e0b; letter-spacing: 1px; margin-bottom: 2px;">
            STRÂ°EGIC CORRIDOR INSPECTION TOUR ACTIVE
          </div>
          <div id="tour-waypoint-title" style="font-size: 12px; font-weight: bold; color: #ffffff;">
            North Sikkim (Chungthang & Mangan)
          </div>
          <div id="tour-waypoint-briefing" style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
            Active moraine dam monitoring along Teesta Basin Stage-III following glacial lake outburst surges.
          </div>
          <div style="margin-top: 5px; display: flex; justify-content: center; gap: 8px;">
            <button id="btn-tour-prev" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 9px; cursor: pointer;">Prev</button>
            <button id="btn-tour-next" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 9px; cursor: pointer;">Next</button>
            <button id="btn-tour-stop" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 2px 8px; font-size: 9px; font-weight: bold; cursor: pointer;">Stop Tour</button>
          </div>
        </div>

        <!-- Rangefinder Modal -->
        <div id="rangefinder-overlay-card" style="display: none; position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 480; background: rgba(15, 23, 42, 0.95); border: 1px solid #a855f7; border-radius: 8px; padding: 10px 16px; color: #f8fafc; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); min-width: 420px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; color: #c084fc;">GEODETIC RANGEFINDER & RESCUE ETA</span>
            <button id="btn-close-rangefinder" style="background: transparent; color: #94a3b8; border: none; font-size: 14px; cursor: pointer;">âœ•</button>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <div style="flex: 1;">
              <span style="font-size: 9px; color: #94a3b8;">ORIGIN:</span>
              <select id="sel-rf-origin" style="width: 100%; background: #0b1120; color: #f8fafc; border: 1px solid #475569; border-radius: 4px; font-size: 10px; padding: 3px;"></select>
            </div>
            <div style="flex: 1;">
              <span style="font-size: 9px; color: #94a3b8;">DESTINATION:</span>
              <select id="sel-rf-dest" style="width: 100%; background: #0b1120; color: #f8fafc; border: 1px solid #475569; border-radius: 4px; font-size: 10px; padding: 3px;"></select>
            </div>
          </div>
          <div id="rf-results-box" style="background: #090d16; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-family: monospace; font-size: 10px; display: flex; justify-content: space-between;">
            <div>
              <div style="color: #94a3b8;">GEODETIC DISTÂ°CE:</div>
              <strong id="rf-res-dist" style="color: #38bdf8; font-size: 13px;">-- km</strong>
            </div>
            <div>
              <div style="color: #94a3b8;">ELEVATION DELTA:</div>
              <strong id="rf-res-elev" style="color: #f59e0b; font-size: 13px;">-- m</strong>
            </div>
            <div>
              <div style="color: #94a3b8;">IAF RESCUE CHOPPER:</div>
              <strong id="rf-res-heli" style="color: #22c55e; font-size: 13px;">-- min</strong>
            </div>
            <div>
              <div style="color: #94a3b8;">GROUND 4x4 QRV:</div>
              <strong id="rf-res-road" style="color: #e2e8f0; font-size: 13px;">-- min</strong>
            </div>
          </div>
        </div>

        <!-- Voice Command Modal -->
        <div id="voice-command-overlay-card" style="display: none; position: absolute; top: 50px; right: 20px; z-index: 480; background: rgba(15, 23, 42, 0.95); border: 1px solid #0284c7; border-radius: 8px; padding: 10px 16px; color: #f8fafc; box-shadow: 0 0 20px rgba(2, 132, 199, 0.4); width: 380px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; color: #38bdf8;">TACTICAL VOICE DIRECTIVES CONSOLE</span>
            <button id="btn-close-voice" style="background: transparent; color: #94a3b8; border: none; font-size: 14px; cursor: pointer;">âœ•</button>
          </div>
          <div style="margin-bottom: 8px; display: flex; gap: 6px;">
            <button id="btn-voice-mic-trigger" style="background: #ef4444; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <span id="voice-mic-label">Speak Directive</span>
            </button>
            <input id="input-voice-text" type="text" placeholder="Or type e.g. 'Switch to FLIR', 'Inspect Sikkim'..." style="flex: 1; background: #0b1120; border: 1px solid #334155; border-radius: 6px; padding: 4px 8px; color: #f8fafc; font-size: 10px; outline: none;" />
            <button id="btn-voice-send" style="background: #0284c7; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: bold; cursor: pointer;">Run</button>
          </div>
          <div id="voice-response-log" style="background: #090d16; border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 9px; color: #38bdf8; min-height: 38px;">
            Awaiting directive... Try: "Switch to FLIR", "Inspect Sikkim", "Toggle HUD", "Start tour", "Download report".
          </div>
        </div>

        <!-- Viewports Stage -->
        <div id="viewport-stage-container" style="flex: 1; width: 100%; height: 100%; position: relative; overflow: hidden; background: #000000;">
          <div id="viewport-2d-map" style="width: 100%; height: 100%; display: ${this.mode === '2d' ? 'block' : 'none'}; position: relative; overflow: hidden;"></div>
          <div id="viewport-3d-globe" style="width: 100%; height: 100%; display: ${this.mode === '3d' ? 'block' : 'none'}; position: absolute; inset: 0; overflow: hidden;"></div>
        </div>
      </div>
    `;
  }

  private startUtcClock() {
    this.clockTimer = setInterval(() => {
      const el = document.getElementById('unified-map-utc-clock');
      if (el) {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        el.textContent = `${hours}:${mins}:${secs} UTC`;
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

    // Ensure map tiles stretch to 100% of the viewport container on initial render
    setTimeout(() => { this.map2d?.invalidateSize(); }, 150);
    setTimeout(() => { this.map2d?.invalidateSize(); }, 500);
    setTimeout(() => { this.map2d?.invalidateSize(); }, 1200);

    // Register Viewport Elements with Sensor Optics Manager
    const view2d = document.getElementById('viewport-2d-map');
    const view3d = document.getElementById('viewport-3d-globe');
    if (view2d) sensorOpticsManager.registerTarget(view2d);
    if (view3d) sensorOpticsManager.registerTarget(view3d);

    // Initialize Tactical HUD Overlay
    this.hudOverlay = new TacticalHudOverlay('viewport-stage-container');

    // Initialize Dynamic Map Legend Bar
    this.legendBar = new MapLegendBar('viewport-stage-container');
    this.legendBar.setLegend('satellite');

    // Bind Sensor Optics Dropdown (Updates both 2D and 3D)
    const selOptics = document.getElementById('sel-sensor-optics') as HTMLSelectElement;
    selOptics?.addEventListener('change', () => {
      const mode = selOptics.value as SensorOpticMode;
      sensorOpticsManager.setMode(mode);
      this.globe3d?.setOptic(mode);
      if (mode !== 'natural') {
        this.legendBar?.setLegend(mode as LegendType);
      } else {
        const selRemote = document.getElementById('sel-earth-remote-sensing') as HTMLSelectElement;
        this.legendBar?.setLegend((selRemote?.value as LegendType) || 'satellite');
      }
    });

    // Update Dropdown on Keyboard Shortcut Switch (1-6)
    sensorOpticsManager.onModeChange((mode) => {
      if (selOptics) selOptics.value = mode;
      this.globe3d?.setOptic(mode);
      if (mode !== 'natural') {
        this.legendBar?.setLegend(mode as LegendType);
      } else {
        const selRemote = document.getElementById('sel-earth-remote-sensing') as HTMLSelectElement;
        this.legendBar?.setLegend((selRemote?.value as LegendType) || 'satellite');
      }
    });

    // Bind HUD and Target Detection Buttons
    document.getElementById('btn-toggle-hud')?.addEventListener('click', () => {
      this.hudOverlay?.toggleHud();
    });

    document.getElementById('btn-toggle-detection')?.addEventListener('click', () => {
      this.hudOverlay?.toggleDetectionMesh();
    });

    // Bind 2D / 3D Switchers
    const btn2d = document.getElementById('btn-switch-2d');
    const btn3d = document.getElementById('btn-switch-3d');

    btn2d?.addEventListener('click', () => {
      this.mode = '2d';
      btn2d.style.background = '#10b981';
      if (btn3d) btn3d.style.background = 'transparent';
      if (view2d) {
        view2d.style.display = 'block';
        this.map2d?.invalidateSize();
      }
      if (view3d) view3d.style.display = 'none';
      this.syncData();
    });

    btn3d?.addEventListener('click', () => {
      this.mode = '3d';
      if (btn2d) btn2d.style.background = 'transparent';
      btn3d.style.background = '#10b981';
      if (view2d) view2d.style.display = 'none';
      if (view3d) {
        view3d.style.display = 'block';
        this.globe3d?.resize();
      }
      this.syncData();
    });

    // Remote Sensing Dropdown (Updates both 2D and 3D)
    const selRemote = document.getElementById('sel-earth-remote-sensing') as HTMLSelectElement;
    selRemote?.addEventListener('change', () => {
      const val = selRemote.value;
      
      // Update 3D Globe Layer texture
      this.globe3d?.setLayer(val);

      // Update 2D Map Layer
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

      this.legendBar?.setLegend(val as LegendType);
    });

    // Highway Navigation Modal Trigger
    document.getElementById('btn-open-route-nav')?.addEventListener('click', () => {
      this.navModal?.open();
    });

    // Binds
    this.bindCinematicTourEvents();
    this.bindRangefinderEvents();
    this.bindVoiceConsoleEvents();

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

  private bindCinematicTourEvents() {
    const btnTour = document.getElementById('btn-cinematic-tour');
    const banner = document.getElementById('tour-active-banner');
    const titleEl = document.getElementById('tour-waypoint-title');
    const briefingEl = document.getElementById('tour-waypoint-briefing');

    const updateWaypointDisplay = (wp: TourWaypoint) => {
      if (titleEl) titleEl.textContent = `${wp.name} [${wp.state.toUpperCase()}]`;
      if (briefingEl) briefingEl.textContent = `${wp.briefing} // ${wp.threatMatrix}`;

      if (this.mode === '2d') {
        this.map2d?.flyToDistrict(wp.lat, wp.lon, wp.zoom);
      } else {
        this.globe3d?.orientToCoordinates(wp.lat, wp.lon, 0.7);
      }
    };

    btnTour?.addEventListener('click', () => {
      if (cinematicDirector.isTourActive()) {
        cinematicDirector.stopTour();
        if (banner) banner.style.display = 'none';
        if (btnTour) btnTour.style.background = '#0b1120';
      } else {
        if (banner) banner.style.display = 'block';
        if (btnTour) btnTour.style.background = '#d97706';
        cinematicDirector.startTour(updateWaypointDisplay);
      }
    });

    document.getElementById('btn-tour-next')?.addEventListener('click', () => cinematicDirector.next());
    document.getElementById('btn-tour-prev')?.addEventListener('click', () => cinematicDirector.prev());
    document.getElementById('btn-tour-stop')?.addEventListener('click', () => {
      cinematicDirector.stopTour();
      if (banner) banner.style.display = 'none';
      if (btnTour) btnTour.style.background = '#0b1120';
    });
  }

  private bindRangefinderEvents() {
    const btnRf = document.getElementById('btn-rangefinder-tool');
    const overlay = document.getElementById('rangefinder-overlay-card');
    const btnClose = document.getElementById('btn-close-rangefinder');
    const selOrigin = document.getElementById('sel-rf-origin') as HTMLSelectElement;
    const selDest = document.getElementById('sel-rf-dest') as HTMLSelectElement;

    btnRf?.addEventListener('click', () => {
      this.isRangefinderActive = !this.isRangefinderActive;
      if (overlay) overlay.style.display = this.isRangefinderActive ? 'block' : 'none';
      if (this.isRangefinderActive) this.populateRangefinderSelects();
    });

    btnClose?.addEventListener('click', () => {
      this.isRangefinderActive = false;
      if (overlay) overlay.style.display = 'none';
    });

    selOrigin?.addEventListener('change', () => this.computeRangefinderMeasurement());
    selDest?.addEventListener('change', () => this.computeRangefinderMeasurement());
  }

  private populateRangefinderSelects() {
    const selOrigin = document.getElementById('sel-rf-origin') as HTMLSelectElement;
    const selDest = document.getElementById('sel-rf-dest') as HTMLSelectElement;
    if (!selOrigin || !selDest || this.districts.length === 0) return;

    selOrigin.innerHTML = this.districts
      .map(d => `<option value="${d.id}" ${d.id === this.selectedDistrictId ? 'selected' : ''}>${d.name} (${d.state})</option>`)
      .join('');

    const destDefault = this.districts.find(d => d.id !== this.selectedDistrictId) || this.districts[0];
    selDest.innerHTML = this.districts
      .map(d => `<option value="${d.id}" ${d.id === destDefault.id ? 'selected' : ''}>${d.name} (${d.state})</option>`)
      .join('');

    this.computeRangefinderMeasurement();
  }

  private computeRangefinderMeasurement() {
    const selOrigin = document.getElementById('sel-rf-origin') as HTMLSelectElement;
    const selDest = document.getElementById('sel-rf-dest') as HTMLSelectElement;
    if (!selOrigin || !selDest) return;

    const d1 = this.districts.find(d => d.id === selOrigin.value);
    const d2 = this.districts.find(d => d.id === selDest.value);
    if (!d1 || !d2) return;

    const m = SpatialRangefinder.measureCorridor(d1, d2);
    const distEl = document.getElementById('rf-res-dist');
    const elevEl = document.getElementById('rf-res-elev');
    const heliEl = document.getElementById('rf-res-heli');
    const roadEl = document.getElementById('rf-res-road');

    if (distEl) distEl.textContent = `${m.distanceKm} km`;
    if (elevEl) elevEl.textContent = `Î” ${m.elevationDeltaM}m (${m.terrainGradientPct}%)`;
    if (heliEl) heliEl.textContent = `${m.rescueHelicopterEtaMin} min`;
    if (roadEl) roadEl.textContent = `${m.groundRescueEtaMin} min`;
  }

  private bindVoiceConsoleEvents() {
    const btnVoice = document.getElementById('btn-tactical-voice');
    const overlay = document.getElementById('voice-command-overlay-card');
    const btnClose = document.getElementById('btn-close-voice');
    const btnMic = document.getElementById('btn-voice-mic-trigger');
    const micLabel = document.getElementById('voice-mic-label');
    const input = document.getElementById('input-voice-text') as HTMLInputElement;
    const btnSend = document.getElementById('btn-voice-send');
    const log = document.getElementById('voice-response-log');

    btnVoice?.addEventListener('click', () => {
      const isVisible = overlay?.style.display === 'block';
      if (overlay) overlay.style.display = isVisible ? 'none' : 'block';
    });

    btnClose?.addEventListener('click', () => {
      if (overlay) overlay.style.display = 'none';
    });

    const executeCommand = (cmd: TacticalCommandResult) => {
      if (log) log.textContent = `[COMMAND RECEIVED]: ${cmd.actionSummary}`;

      switch (cmd.intent) {
        case 'OPTICS_FLIR':
          sensorOpticsManager.setMode('flir');
          this.globe3d?.setOptic('flir');
          break;
        case 'OPTICS_NVG':
          sensorOpticsManager.setMode('nvg');
          this.globe3d?.setOptic('nvg');
          break;
        case 'OPTICS_CRT':
          sensorOpticsManager.setMode('crt');
          this.globe3d?.setOptic('crt');
          break;
        case 'OPTICS_NOIR':
          sensorOpticsManager.setMode('noir');
          this.globe3d?.setOptic('noir');
          break;
        case 'OPTICS_NATURAL':
          sensorOpticsManager.setMode('natural');
          this.globe3d?.setOptic('natural');
          break;
        case 'TOGGLE_HUD': this.hudOverlay?.toggleHud(); break;
        case 'TOGGLE_DETECTION': this.hudOverlay?.toggleDetectionMesh(); break;
        case 'CINEMATIC_TOUR': document.getElementById('btn-cinematic-tour')?.click(); break;
        case 'DOWNLOAD_SITREP': document.getElementById('btn-download-sitrep')?.click(); break;
        case 'NAV_SIKKIM':
          const dSikkim = this.districts.find(d => d.id === 'sk_mangan');
          if (dSikkim) this.flyToDistrict(dSikkim);
          break;
        case 'NAV_ASSAM':
          const dAssam = this.districts.find(d => d.id === 'as_dima_hasao');
          if (dAssam) this.flyToDistrict(dAssam);
          break;
        case 'NAV_MANIPUR':
          const dManipur = this.districts.find(d => d.id === 'mn_noney');
          if (dManipur) this.flyToDistrict(dManipur);
          break;
        case 'NAV_MEGHALAYA':
          const dMegh = this.districts.find(d => d.id === 'ml_east_khasi');
          if (dMegh) this.flyToDistrict(dMegh);
          break;
        case 'NAV_ARUNACHAL':
          const dArun = this.districts.find(d => d.id === 'ar_papum_pare');
          if (dArun) this.flyToDistrict(dArun);
          break;
      }
    };

    btnMic?.addEventListener('click', () => {
      voiceCommandEngine.startListening(
        (res) => executeCommand(res),
        (isListening) => {
          if (micLabel) micLabel.textContent = isListening ? 'Listening...' : 'Speak Directive';
          if (btnMic) btnMic.style.background = isListening ? '#10b981' : '#ef4444';
        }
      );
    });

    btnSend?.addEventListener('click', () => {
      if (input && input.value.trim()) {
        const res = voiceCommandEngine.executeTextCommand(input.value.trim());
        executeCommand(res);
        input.value = '';
      }
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const res = voiceCommandEngine.executeTextCommand(input.value.trim());
        executeCommand(res);
        input.value = '';
      }
    });
  }

  public async updateTelemetryForDistrict(d: DistrictProfile) {
    this.liveTelemetry = await fetchLiveSatelliteWindTelemetry(d.lat, d.lon);
    if (this.liveTelemetry) {
      const windEl = document.getElementById('badge-wind-val');
      const thermalEl = document.getElementById('badge-thermal-val');
      const cloudEl = document.getElementById('badge-cloud-val');

      if (windEl) windEl.textContent = `${this.liveTelemetry.speedKmh} km/h`;
      if (thermalEl) thermalEl.textContent = `${this.liveTelemetry.thermalSurfaceTempC}Â°C`;
      if (cloudEl) cloudEl.textContent = `${this.liveTelemetry.cloudCoverTotalPct}%`;
    }

    // Update HUD Telemetry
    const risk = this.riskMap.get(d.id);
    if (risk) {
      this.hudOverlay?.updateTelemetry(d, risk);
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

    const currentD = this.districts.find(d => d.id === selectedDistrictId);
    const currentR = riskMap.get(selectedDistrictId);
    if (currentD && currentR) {
      this.hudOverlay?.updateTelemetry(currentD, currentR);
    }

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
    cinematicDirector.stopTour();
    voiceCommandEngine.stopListening();
    this.globe3d?.destroy();
  }
}
