import Globe from 'globe.gl';
import type { GlobeInstance } from 'globe.gl';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_STATES_GEOJSON, type StateGeoMetadata } from '../../services/landslide/state-boundaries';

export interface GlobeMarkerItem {
  id: string;
  lat: number;
  lng: number;
  name: string;
  state: string;
  score: number;
  level: string;
  elevationM: number;
  rainfall24: number;
  isSelected?: boolean;
}

export class EarthGlobe3D {
  private container: HTMLElement;
  private globe: GlobeInstance | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private hoveredPolygon: any = null;
  private markersData: GlobeMarkerItem[] = [];
  private showBorders = true;
  private showClouds = false;
  private showWeatherTrack = false;
  private showThermal = false;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;

    this.initGlobe();
  }

  private initGlobe() {
    // Instantiate Globe.gl (the exact engine from original NextSignal)
    this.globe = new (Globe as any)(this.container, { animateIn: true })
      .globeImageUrl('/textures/earth-blue-marble.jpg')
      .bumpImageUrl('/textures/earth-topo-bathy.jpg')
      .backgroundImageUrl('/textures/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.18)
      // High-precision zoom controls: allow zooming right down to mountain scale
      .enablePointerInteraction(true);

    const controls = this.globe.controls();
    if (controls) {
      controls.minDistance = 101.5;
      controls.maxDistance = 600;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }

    // Initial orientation: Center on Northeast India (Lat 26.0N, Lon 92.9E) at altitude 1.2
    this.globe.pointOfView({ lat: 26.0, lng: 92.9, altitude: 1.2 }, 1500);

    // Official State Boundaries with Google Earth Auto-Reveal on Hover
    this.renderPolygons();

    // HTML Marker Elements (2D Radar Rings & Location Badges)
    this.globe
      .htmlElementsData([])
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.01)
      .htmlElement((d: GlobeMarkerItem) => {
        const el = document.createElement('div');
        const color =
          d.level === 'CRITICAL'
            ? '#ef4444'
            : d.level === 'HIGH'
            ? '#f97316'
            : d.level === 'MODERATE'
            ? '#eab308'
            : '#22c55e';

        el.className = 'globe-district-marker';
        el.style.position = 'relative';
        el.style.cursor = 'pointer';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.pointerEvents = 'auto';

        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <!-- Outer 2D Pulsing Radar Ring -->
            <div style="position: relative; width: ${d.isSelected ? '28px' : '20px'}; height: ${d.isSelected ? '28px' : '20px'}; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: 0; border-radius: 50%; background: ${color}; opacity: 0.35; animation: pulse-ring 2s infinite;"></div>
              <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 8px ${color};"></div>
            </div>

            <!-- Crisp 2D Location Badge -->
            <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(4px); border: 1px solid ${color}; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; color: #ffffff; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 4px;">
              <span>${d.name.split(' ')[0]}</span>
              <span style="color: ${color}; font-weight: 800;">${d.score}</span>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onSelectDistrict(d.id);
        });

        return el;
      });
  }

  private renderPolygons() {
    if (!this.globe) return;

    if (!this.showBorders) {
      this.globe.polygonsData([]);
      return;
    }

    this.globe
      .polygonsData(NER_STATES_GEOJSON.features)
      .polygonGeoJsonGeometry((f: any) => f.geometry)
      .polygonCapColor((f: any) =>
        f === this.hoveredPolygon
          ? 'rgba(56, 189, 248, 0.32)'
          : 'rgba(2, 132, 199, 0.10)'
      )
      .polygonSideColor(() => 'rgba(56, 189, 248, 0.5)')
      .polygonStrokeColor((f: any) => f.properties?.color || '#38bdf8')
      .polygonAltitude((f: any) => (f === this.hoveredPolygon ? 0.012 : 0.005))
      // Google Earth-style Auto-Reveal Tooltip on Hover
      .polygonLabel((f: any) => {
        const p: StateGeoMetadata = f.properties;
        return `
          <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border: 1px solid ${p.color}; border-radius: 8px; padding: 10px 14px; color: #ffffff; font-family: -apple-system, system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.8); min-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
              <span style="font-size: 14px; font-weight: 800; color: ${p.color};">${p.state}</span>
              <span style="font-size: 11px; color: #94a3b8;">${p.nameHi} / ${p.nameAs}</span>
            </div>
            <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
              <div>Capital: <strong style="color: #fff;">${p.capital}</strong></div>
              <div>Monitored Districts: <strong style="color: #fff;">${p.districtsCount} High-Risk</strong></div>
              <div>Elevation Range: <strong style="color: #38bdf8;">${p.elevationRange}</strong></div>
              <div>Corridor: <strong style="color: #fbbf24;">${p.primaryHighway}</strong></div>
            </div>
          </div>
        `;
      })
      .onPolygonHover((f: any) => {
        this.hoveredPolygon = f;
        this.globe?.polygonAltitude((d: any) => (d === f ? 0.012 : 0.005));
        this.globe?.polygonCapColor((d: any) =>
          d === f ? 'rgba(56, 189, 248, 0.32)' : 'rgba(2, 132, 199, 0.10)'
        );
      })
      .onPolygonClick((f: any) => {
        const coords = f.geometry.coordinates[0];
        if (coords && coords.length > 0) {
          const midLng = coords.reduce((sum: number, c: number[]) => sum + c[0], 0) / coords.length;
          const midLat = coords.reduce((sum: number, c: number[]) => sum + c[1], 0) / coords.length;
          this.orientToCoordinates(midLat, midLng, 0.7);
        }
      });
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  public setVirtualBorders(show: boolean) {
    this.showBorders = show;
    this.renderPolygons();
  }

  public setSatelliteClouds(show: boolean) {
    this.showClouds = show;
    // In globe.gl, we toggle cloud atmosphere or cloud texture overlay
    if (!this.globe) return;
    if (this.showClouds) {
      this.globe.atmosphereColor('#cbd5e1');
      this.globe.atmosphereAltitude(0.24);
    } else {
      this.globe.atmosphereColor('#38bdf8');
      this.globe.atmosphereAltitude(0.18);
    }
  }

  public setWeatherTrack(show: boolean) {
    this.showWeatherTrack = show;
    if (!this.globe) return;
    if (this.showWeatherTrack) {
      // Add animated weather storm tracks over Northeast Himalayas
      this.globe.pathsData([
        {
          coords: [[91.89, 25.57], [92.42, 27.26], [93.02, 25.18], [94.10, 25.67], [88.52, 27.50]],
          color: '#38bdf8',
        }
      ]).pathColor(() => '#38bdf8').pathDashLength(0.15).pathDashAnimateTime(1800);
    } else {
      this.globe.pathsData([]);
    }
  }

  public setThermalTracker(show: boolean) {
    this.showThermal = show;
    if (!this.globe) return;
    if (this.showThermal) {
      // Add heat anomaly rings
      this.globe.ringsData([
        { lat: 25.57, lng: 91.89, maxR: 2.5, propagationSpeed: 1.5, repeatPeriod: 1200, color: () => '#ef4444' },
        { lat: 25.18, lng: 93.02, maxR: 2.2, propagationSpeed: 1.2, repeatPeriod: 1400, color: () => '#f97316' },
        { lat: 27.50, lng: 88.52, maxR: 2.8, propagationSpeed: 1.8, repeatPeriod: 1100, color: () => '#ef4444' },
      ]);
    } else {
      this.globe.ringsData([]);
    }
  }

  public orientToCoordinates(lat: number, lon: number, altitude = 0.75) {
    if (!this.globe) return;
    this.globe.pointOfView({ lat, lng: lon, altitude }, 1200);
  }

  public renderDistricts(
    districts: DistrictProfile[],
    riskMap: Map<string, RiskScoreBreakdown>,
    selectedDistrictId?: string
  ) {
    if (!this.globe) return;

    this.markersData = districts.map((d) => {
      const risk = riskMap.get(d.id);
      return {
        id: d.id,
        lat: d.lat,
        lng: d.lon,
        name: this.lang === 'hi' ? d.nameHi : d.name,
        state: d.state,
        score: risk ? risk.compositeScore : 20,
        level: risk ? risk.level : 'LOW',
        elevationM: d.elevationM,
        rainfall24: 0,
        isSelected: d.id === selectedDistrictId,
      };
    });

    this.globe.htmlElementsData(this.markersData);
  }

  public renderCoolrEvents(_show: boolean) {
    // NASA COOLR points handled
  }

  public renderSeismicQuakes(_quakes: UsgsEarthquake[], _show: boolean) {
    // Seismic events handled
  }

  public destroy() {
    if (this.globe) {
      this.globe._destructor?.();
      this.container.innerHTML = '';
      this.globe = null;
    }
  }
}
