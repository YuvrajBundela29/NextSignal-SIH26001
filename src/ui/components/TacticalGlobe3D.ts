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

    // Create Globe with photorealistic Earth texture & Fresnel atmosphere matching NextSignal Sentinel
    this.globe = new (Globe as any)(this.container, { animateIn: true })
      .globeImageUrl('/textures/earth-blue-marble.jpg')
      .bumpImageUrl('/textures/earth-topo-bathy.jpg')
      .backgroundImageUrl('')
      .showAtmosphere(true)
      .atmosphereColor('#4466cc')
      .atmosphereAltitude(0.24)
      .width(width)
      .height(height)
      .enablePointerInteraction(true);

    const controls = this.globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.25;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 101.2;
      controls.maxDistance = 550;
    }

    // Centered squarely on Northeast India (Lat 26.0N, Lon 92.8E)
    this.globe.pointOfView({ lat: 26.0, lng: 92.8, altitude: 1.5 }, 1200);

    // Setup Paths for Highway passes
    this.initPaths();

    // Setup HTML Tactical Markers (Triangles, circles, anchors, quakes, shelters)
    this.initMarkersLayer();

    // Handle auto-resize so the globe is always perfectly centered
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

  public resize() {
    if (this.globe && this.container) {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w > 0 && h > 0) {
        this.globe.width(w).height(h);
        this.globe.pointOfView({ lat: 26.0, lng: 92.8, altitude: 1.5 }, 0);
      }
    }
  }

  private initPaths() {
    if (!this.globe) return;

    if (!this.showHighways) {
      this.globe.pathsData([]);
      return;
    }

    const paths = NER_HIGHWAY_ROUTES.map(h => ({
      name: h.name,
      status: h.currentPassStatus,
      coords: h.coordinates.map(c => [c[1], c[0]]), // [lng, lat]
      color: h.overallVulnerability === 'CRITICAL' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(249, 115, 22, 0.85)',
    }));

    this.globe
      .pathsData(paths)
      .pathPoints('coords')
      .pathPointLat((p: number[]) => p[1])
      .pathPointLng((p: number[]) => p[0])
      .pathColor('color')
      .pathStroke(1.4)
      .pathDashLength(0.8)
      .pathDashGap(0.2)
      .pathDashAnimateTime(3000)
      .pathLabel((d: any) => `<b>${d.name}</b> (${d.status})`);
  }

  private initMarkersLayer() {
    if (!this.globe) return;

    this.globe
      .htmlElementsData([])
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.012)
      .htmlElement((d: GlobeTacticalMarker) => {
        const el = document.createElement('div');
        el.className = 'tactical-globe-marker';
        el.style.position = 'relative';
        el.style.cursor = 'pointer';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.pointerEvents = 'auto';
        el.title = d.name;

        // Render sleek miniature tactical symbols matching Screenshot 2
        el.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; filter: drop-shadow(0 0 6px ${d.color});">
            ${d.iconSvg}
            ${d.isSelected ? `<div style="position: absolute; inset: -4px; border: 1.5px solid #ffffff; border-radius: 50%; animation: pulse-ring 1.5s infinite;"></div>` : ''}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (d.type === 'district') {
            this.onSelectDistrict(d.id);
          }
        });

        return el;
      });
  }

  public renderDistricts(
    districts: DistrictProfile[],
    riskMap: Map<string, RiskScoreBreakdown>,
    selectedDistrictId?: string
  ) {
    if (!this.globe) return;

    const markers: GlobeTacticalMarker[] = [];

    // 1. District Hazard Markers (Warning Triangles & Hazard Dots)
    for (const d of districts) {
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

      // SVG Tactical Warning Triangle matching NextSignal
      const iconSvg = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="${color}">
          <path d="M12 2L1 21h22L12 2zm0 3.5L20.3 19H3.7L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
        </svg>
      `;

      markers.push({
        id: d.id,
        lat: d.lat,
        lng: d.lon,
        type: 'district',
        name: this.lang === 'hi' ? d.nameHi : d.name,
        state: d.state,
        score,
        level,
        elevationM: d.elevationM,
        color,
        iconSvg,
        isSelected: d.id === selectedDistrictId,
      });
    }

    // 2. Safe Shelters (Shield / Home Icons)
    if (this.showShelters) {
      for (const s of NER_SAFE_SHELTERS) {
        markers.push({
          id: s.id,
          lat: s.lat,
          lng: s.lon,
          type: 'shelter',
          name: s.name,
          details: `Capacity: ${s.capacityPersons} persons`,
          color: '#10b981',
          iconSvg: `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#34d399">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          `,
        });
      }
    }

    // 3. USGS Earthquakes (Lightning / Seismic Pulse)
    if (this.showSeismic && this.quakesData.length > 0) {
      for (const q of this.quakesData) {
        markers.push({
          id: q.id,
          lat: q.lat,
          lng: q.lon,
          type: 'quake',
          name: `M${q.mag.toFixed(1)} Earthquake`,
          details: q.place,
          color: '#38bdf8',
          iconSvg: `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#38bdf8">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
          `,
        });
      }
    }

    // 4. NASA COOLR Historical Landslides (Danger Diamond)
    if (this.showCoolr) {
      for (const c of NASA_COOLR_NER_EVENTS) {
        markers.push({
          id: `coolr_${c.id}`,
          lat: c.lat,
          lng: c.lon,
          type: 'coolr',
          name: `Landslide (${c.date})`,
          details: `Fatalities: ${c.fatalities}`,
          color: '#dc2626',
          iconSvg: `
            <svg viewBox="0 0 24 24" width="12" height="12" fill="#ef4444">
              <polygon points="12,2 22,12 12,22 2,12"/>
            </svg>
          `,
        });
      }
    }

    this.markersData = markers;
    this.globe.htmlElementsData(this.markersData);
  }

  public renderCoolrEvents(show: boolean) {
    this.showCoolr = show;
  }

  public renderSeismicQuakes(quakes: UsgsEarthquake[], show: boolean) {
    this.quakesData = quakes;
    this.showSeismic = show;
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  public orientToCoordinates(lat: number, lon: number, altitude = 0.75) {
    if (!this.globe) return;
    this.globe.pointOfView({ lat, lng: lon, altitude }, 1200);
  }

  public destroy() {
    this.resizeObserver?.disconnect();
    if (this.globe) {
      this.globe._destructor?.();
      this.container.innerHTML = '';
      this.globe = null;
    }
  }
}
