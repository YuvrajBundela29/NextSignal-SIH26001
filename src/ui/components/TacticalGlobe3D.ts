import Globe from 'globe.gl';
import type { GlobeInstance } from 'globe.gl';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { sensorOpticsManager, type SensorOpticMode } from './sensor-optics';

export interface GlobeTacticalMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'district' | 'quake' | 'coolr' | 'shelter';
  name: string;
  nameHi?: string;
  nameAs?: string;
  nameBn?: string;
  nameMni?: string;
  nameLus?: string;
  nameKha?: string;
  nameNe?: string;
  state?: string;
  score?: number;
  level?: string;
  color: string;
  isSelected?: boolean;
}

export class TacticalGlobe3D {
  private container: HTMLElement;
  private globe: GlobeInstance | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private markersData: GlobeTacticalMarker[] = [];
  private quakesData: UsgsEarthquake[] = [];
  private showCoolr = true;
  private showSeismic = true;
  private resizeObserver: ResizeObserver | null = null;
  private currentLayer: string = 'satellite';
  private zoomControlsOverlay: HTMLElement | null = null;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;
    this.initGlobe();
    this.injectZoomControls();
  }

  private initGlobe() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // High-Resolution 4K Blue Marble Texture & Bump Mapping
    this.globe = new (Globe as any)(this.container, { animateIn: true })
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-topology.png')
      .backgroundImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.18)
      .width(width)
      .height(height)
      .enablePointerInteraction(true);

    // High-DPI 4K WebGL Canvas Rendering
    const renderer = (this.globe as any).renderer();
    if (renderer) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      renderer.setPixelRatio(dpr);
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
        renderer.toneMapping = 3; // ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.15;
      }
    }

    // High Zoomability Orbit Controls (Allows deep zoom right down to surface)
    const controls = this.globe.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.2;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 100.02; // Close zoom right to mountain terrain
      controls.maxDistance = 600;    // Deep space overview
      controls.zoomSpeed = 1.35;     // Highly responsive zoom feel
      controls.rotateSpeed = 0.85;
    }

    // Focus on North East India (NER center: 26.2 N, 92.9 E)
    this.globe.pointOfView({ lat: 26.15, lng: 92.9, altitude: 1.25 }, 1200);
    this.initMarkersLayer();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.globe && this.container) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w > 0 && h > 0) this.globe.width(w).height(h);
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private injectZoomControls() {
    this.zoomControlsOverlay = document.createElement('div');
    this.zoomControlsOverlay.className = 'tactical-globe-zoom-controls';
    this.zoomControlsOverlay.style.cssText = `
      position: absolute;
      bottom: 24px;
      right: 18px;
      z-index: 600;
      display: flex;
      flex-direction: column;
      gap: 6px;
      user-select: none;
    `;

    const btnStyle = `
      width: 32px;
      height: 32px;
      background: rgba(11, 17, 32, 0.88);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 6px;
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: all 0.15s ease;
    `;

    const btnZoomIn = document.createElement('button');
    btnZoomIn.innerHTML = '+';
    btnZoomIn.title = 'Zoom In (4K Extreme Close-up)';
    btnZoomIn.style.cssText = btnStyle;
    btnZoomIn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomBy(-0.35);
    });

    const btnZoomOut = document.createElement('button');
    btnZoomOut.innerHTML = '&minus;';
    btnZoomOut.title = 'Zoom Out (Regional Overview)';
    btnZoomOut.style.cssText = btnStyle;
    btnZoomOut.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomBy(0.35);
    });

    const btnReset = document.createElement('button');
    btnReset.innerHTML = '&#8962;';
    btnReset.title = 'Reset NER Orbit View';
    btnReset.style.cssText = btnStyle;
    btnReset.style.fontSize = '14px';
    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      this.orientToCoordinates(26.15, 92.9, 1.25);
    });

    this.zoomControlsOverlay.appendChild(btnZoomIn);
    this.zoomControlsOverlay.appendChild(btnZoomOut);
    this.zoomControlsOverlay.appendChild(btnReset);
    this.container.appendChild(this.zoomControlsOverlay);
  }

  public zoomBy(deltaAltitude: number) {
    if (!this.globe) return;
    const current = this.globe.pointOfView();
    const targetAlt = Math.max(0.04, Math.min(3.5, (current.altitude || 1.0) + deltaAltitude));
    this.globe.pointOfView({ lat: current.lat, lng: current.lng, altitude: targetAlt }, 400);
  }

  public setLayer(layerId: string) {
    if (!this.globe) return;
    this.currentLayer = layerId;
    if (layerId === 'dark') {
      this.globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-night.jpg');
      this.globe.atmosphereColor('#6366f1');
    } else if (layerId === 'satellite') {
      this.globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
      this.globe.atmosphereColor('#38bdf8');
    } else if (layerId === 'thermal') {
      this.globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-day.jpg');
      this.globe.atmosphereColor('#ef4444');
    } else if (layerId === 'clouds' || layerId === 'radar') {
      this.globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-water.png');
      this.globe.atmosphereColor('#38bdf8');
    } else if (layerId === 'topo' || layerId === 'opentopo') {
      this.globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-topology.png');
      this.globe.atmosphereColor('#10b981');
    }
  }

  public setOptic(mode: SensorOpticMode) {
    sensorOpticsManager.setMode(mode);
    const def = sensorOpticsManager.getDefinition();
    this.container.style.filter = def.filterCss;
    this.container.setAttribute('data-sensor-optic', mode);
  }

  private getMarkerDisplayName(d: GlobeTacticalMarker): string {
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

  private initMarkersLayer() {
    if (!this.globe) return;
    this.globe
      .htmlElementsData([])
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlAltitude(0.002)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.className = 'tactical-globe-marker';
        el.style.cssText = 'cursor: pointer; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: auto;';
        if (d.type === 'district') {
          const displayName = this.getMarkerDisplayName(d);
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${d.isSelected ? 16 : 11}px; height: ${d.isSelected ? 16 : 11}px; background: rgba(5,8,17,0.95); border: 2px solid ${d.isSelected ? '#ffffff' : d.color}; border-radius: 50%; box-shadow: 0 0 10px ${d.color};">
              <div style="width: 4px; height: 4px; border-radius: 50%; background: ${d.color};"></div>
            </div>
            <div style="background: rgba(15,23,42,0.92); border: 1px solid rgba(56,189,248,0.35); border-radius: 4px; padding: 2px 5px; font-size: 8.5px; font-weight: 700; color: #fff; margin-top: 2px; white-space: nowrap; pointer-events: none; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
              ${displayName} <span style="color: ${d.color}; font-weight: 800;">${d.score ? `[${d.score}]` : ''}</span>
            </div>
          `;
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSelectDistrict(d.id);
            this.orientToCoordinates(d.lat, d.lng, 0.25);
          });
        } else if (d.type === 'quake') {
          el.innerHTML = '<div style="width: 8px; height: 8px; border-radius: 50%; background: rgba(56,189,248,0.4); border: 1px solid #38bdf8;"></div>';
        }
        return el;
      });
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    const list: GlobeTacticalMarker[] = districts.map((d) => {
      const risk = riskMap.get(d.id);
      const score = risk ? risk.compositeScore : 20;
      const level = risk ? risk.level : 'LOW';
      const color = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MODERATE' ? '#eab308' : '#22c55e';
      return {
        id: d.id,
        lat: d.lat,
        lng: d.lon,
        type: 'district',
        name: d.name,
        nameHi: d.nameHi,
        nameAs: d.nameAs,
        nameBn: d.nameBn,
        nameMni: d.nameMni,
        nameLus: d.nameLus,
        nameKha: d.nameKha,
        nameNe: d.nameNe,
        state: d.state,
        score,
        level,
        color,
        isSelected: d.id === selectedDistrictId,
      };
    });
    this.markersData = list;
    if (this.globe) {
      this.globe.htmlElementsData(this.markersData);
      const ringsData = list
        .filter(m => m.level === 'CRITICAL' || m.level === 'HIGH')
        .map(m => ({
          lat: m.lat,
          lng: m.lng,
          maxR: m.level === 'CRITICAL' ? 0.45 : 0.25,
          propagationSpeed: 1.0,
          repeatPeriod: 2200,
          color: m.level === 'CRITICAL' ? '#ef4444' : '#f97316',
        }));
      this.globe
        .ringsData(ringsData)
        .ringColor((d: any) => d.color)
        .ringMaxRadius((d: any) => d.maxR)
        .ringPropagationSpeed((d: any) => d.propagationSpeed)
        .ringRepeatPeriod((d: any) => d.repeatPeriod);
    }
  }

  public renderSeismicQuakes(quakes: UsgsEarthquake[], show: boolean) {
    this.quakesData = quakes || [];
    this.showSeismic = show;
  }

  public renderCoolrEvents(show: boolean) {
    this.showCoolr = show;
  }

  public orientToCoordinates(lat: number, lng: number, altitude = 0.45) {
    if (this.globe) this.globe.pointOfView({ lat, lng, altitude }, 1200);
  }

  public resize() {
    if (this.globe && this.container) {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) this.globe.width(w).height(h);
    }
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
    if (this.globe) {
      // Re-trigger htmlElementsData to re-render marker labels in new language
      this.globe.htmlElementsData([...this.markersData]);
    }
  }

  public destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.zoomControlsOverlay) this.zoomControlsOverlay.remove();
  }
}
