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

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;
    this.initGlobe();
  }

  private initGlobe() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Photorealistic Blue Marble Earth - flat on surface with zero 3D building/cone extrusions
    this.globe = new (Globe as any)(this.container, { animateIn: true })
      .globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.20)
      .width(width)
      .height(height)
      .enablePointerInteraction(true);

    const controls = this.globe.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.2;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 101.2;
      controls.maxDistance = 500;
    }

    this.globe.pointOfView({ lat: 26.0, lng: 92.8, altitude: 1.4 }, 1200);
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

  public setLayer(layerId: string) {
    if (!this.globe) return;
    this.currentLayer = layerId;
    if (layerId === 'dark') {
      this.globe.globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-night.jpg');
      this.globe.atmosphereColor('#6366f1');
    } else if (layerId === 'satellite') {
      this.globe.globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-blue-marble.jpg');
      this.globe.atmosphereColor('#38bdf8');
    } else if (layerId === 'thermal') {
      this.globe.globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-day.jpg');
      this.globe.atmosphereColor('#ef4444');
    } else if (layerId === 'clouds' || layerId === 'radar') {
      this.globe.globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-water.png');
      this.globe.atmosphereColor('#38bdf8');
    } else if (layerId === 'topo' || layerId === 'opentopo') {
      this.globe.globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-topology.png');
      this.globe.atmosphereColor('#10b981');
    }
  }

  public setOptic(mode: SensorOpticMode) {
    sensorOpticsManager.setMode(mode);
    const def = sensorOpticsManager.getDefinition();
    this.container.style.filter = def.filterCss;
    this.container.setAttribute('data-sensor-optic', mode);
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
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${d.isSelected ? 14 : 10}px; height: ${d.isSelected ? 14 : 10}px; background: rgba(5,8,17,0.92); border: 2px solid ${d.isSelected ? '#ffffff' : d.color}; border-radius: 50%; box-shadow: 0 0 6px ${d.color};">
              <div style="width: 4px; height: 4px; border-radius: 50%; background: ${d.color};"></div>
            </div>
            <div style="background: rgba(15,23,42,0.92); border: 1px solid rgba(56,189,248,0.3); border-radius: 3px; padding: 1px 4px; font-size: 8px; font-weight: 700; color: #fff; margin-top: 1px; white-space: nowrap; pointer-events: none;">
              ${d.name} <span style="color: ${d.color}; font-weight: 800;">${d.score ? `[${d.score}]` : ''}</span>
            </div>
          `;
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSelectDistrict(d.id);
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

  public orientToCoordinates(lat: number, lng: number, altitude = 0.8) {
    if (this.globe) this.globe.pointOfView({ lat, lng, altitude }, 1400);
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
  }

  public destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
