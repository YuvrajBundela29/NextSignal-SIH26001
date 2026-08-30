import Globe from 'globe.gl';
import type { GlobeInstance } from 'globe.gl';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_HIGHWAY_ROUTES } from '../../services/landslide/highway-navigation';
import { NER_SAFE_SHELTERS } from '../../services/landslide/safe-shelters';

export interface GlobeTacticalMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'district' | 'quake' | 'coolr' | 'shelter' | 'river_gauge';
  name: string;
  state?: string;
  score?: number;
  level?: string;
  rainfall24?: number;
  elevationM?: number;
  details?: string;
  color: string;
  iconSvg: string;
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
  private showShelters = true;
  private showHighways = true;
  private resizeObserver: ResizeObserver | null = null;

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

    // Create Globe with photorealistic Earth texture & Fresnel atmosphere matching God's Eye View
    this.globe = new (Globe as any)(this.container, { animateIn: true })
      .globeImageUrl('/textures/earth-blue-marble.jpg')
      .bumpImageUrl('/textures/earth-topo-bathy.jpg')
      .backgroundImageUrl('')
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.22)
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

    // Centered squarely on Northeast India (Lat 26.0N, Lon 92.8E)
    this.globe.pointOfView({ lat: 26.0, lng: 92.8, altitude: 1.5 }, 1200);

    // Setup 3D Geospatial Arcs & Rings
    this.init3DTelemetryLayers();

    // Setup HTML Tactical Markers
    this.initMarkersLayer();

    // Auto-resize handler
    this.resizeObserver = new ResizeObserver(() => {
      if (this.globe && this.container) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w > 0 && h > 0) {
          this.globe.width(w).height(h);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private init3DTelemetryLayers() {
    if (!this.globe) return;

    // Strategic corridor 3D arc vectors
    const arcData = [
      { startLat: 27.3389, startLng: 88.6065, endLat: 27.6042, endLng: 88.6472, color: ['#38bdf8', '#ef4444'], name: 'Teesta Hydro Corridor (Sikkim)' },
      { startLat: 26.1445, startLng: 91.7362, endLat: 25.1812, endLng: 93.0210, color: ['#38bdf8', '#f97316'], name: 'Guwahati - Haflong Arterial Cut' },
      { startLat: 24.8170, startLng: 93.9368, endLat: 24.8167, endLng: 93.6333, color: ['#38bdf8', '#ef4444'], name: 'Imphal - Tupul Mountain Rail Link' },
      { startLat: 25.5788, startLng: 91.8933, endLat: 25.2986, endLng: 91.7306, color: ['#38bdf8', '#f59e0b'], name: 'Shillong - Cherrapunji Escarpment' },
    ];

    this.globe
      .arcsData(arcData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(2000)
      .arcAltitude(0.12)
      .arcStroke(1.5);
  }

  private initMarkersLayer() {
    if (!this.globe) return;

    this.globe
      .htmlElementsData([])
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlAltitude(0.02)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.className = 'tactical-globe-marker';
        el.style.cssText = `
          cursor: pointer;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: auto;
          transition: transform 0.15s ease;
        `;

        if (d.type === 'district') {
          const isCrit = d.level === 'CRITICAL';
          const isHigh = d.level === 'HIGH';
          const pulseRing = isCrit || isHigh ? `<div style="position: absolute; inset: -6px; border: 2px solid ${d.color}; border-radius: 50%; animation: pulse-red 1.2s infinite; pointer-events: none;"></div>` : '';

          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${d.isSelected ? 26 : 20}px; height: ${d.isSelected ? 26 : 20}px; background: rgba(5,8,17,0.92); border: 2px solid ${d.isSelected ? '#ffffff' : d.color}; border-radius: 50%; box-shadow: 0 0 14px ${d.color};">
              ${pulseRing}
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${d.color};"></div>
            </div>
            <div style="background: rgba(3,7,18,0.85); backdrop-filter: blur(6px); border: 1px solid rgba(56,189,248,0.3); border-radius: 4px; padding: 1px 5px; font-size: 9px; font-weight: bold; color: #fff; margin-top: 3px; white-space: nowrap; pointer-events: none;">
              ${d.name} <span style="color: ${d.color};">${d.score ? `[${d.score}]` : ''}</span>
            </div>
          `;

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSelectDistrict(d.id);
          });
        } else if (d.type === 'quake') {
          el.innerHTML = `
            <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(56,189,248,0.3); border: 1.5px solid #38bdf8; display: flex; align-items: center; justify-content: center;" title="${d.name}">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></div>
            </div>
          `;
        }

        return el;
      });
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    const list: GlobeTacticalMarker[] = districts.map((d) => {
      const risk = riskMap.get(d.id);
      const score = risk ? risk.compositeScore : 20;
      const level = risk ? risk.level : 'LOW';
      const color =
        level === 'CRITICAL'
          ? '#ef4444'
          : level === 'HIGH'
          ? '#f97316'
          : level === 'MODERATE'
          ? '#eab308'
          : '#22c55e';

      return {
        id: d.id,
        lat: d.lat,
        lng: d.lon,
        type: 'district',
        name: d.name,
        state: d.state,
        score,
        level,
        elevationM: d.elevationM,
        color,
        iconSvg: '',
        isSelected: d.id === selectedDistrictId,
      };
    });

    this.markersData = list;
    if (this.globe) {
      this.globe.htmlElementsData(this.markersData);

      // Pulse rings on Critical and High Risk areas
      const ringsData = list
        .filter(m => m.level === 'CRITICAL' || m.level === 'HIGH')
        .map(m => ({
          lat: m.lat,
          lng: m.lng,
          maxR: m.level === 'CRITICAL' ? 3.5 : 2.5,
          propagationSpeed: 2,
          repeatPeriod: 1200,
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
    if (this.globe) {
      this.globe.pointOfView({ lat, lng, altitude }, 1400);
    }
  }

  public resize() {
    if (this.globe && this.container) {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) {
        this.globe.width(w).height(h);
      }
    }
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  public destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
