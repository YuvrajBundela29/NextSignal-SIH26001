import Globe, { type GlobeInstance } from 'globe.gl';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_BOUNDARIES_GEOJSON, type NerGeoJsonFeature } from '../../services/landslide/ner-boundaries-geojson';

export class EarthGlobe3D {
  private container: HTMLElement;
  private globe: GlobeInstance | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';
  private selectedDistrictId = 'as_dima_hasao';
  private hoveredPolygonId: string | null = null;
  private currentDistricts: DistrictProfile[] = [];
  private currentRiskMap = new Map<string, RiskScoreBreakdown>();

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

    // Initialize Globe.gl instance (NextSignal 3D Digital Twin Engine)
    this.globe = new Globe(this.container, { waitForGlobeReady: true, animateIn: true })
      .width(width)
      .height(height)
      .globeImageUrl('/textures/earth-blue-marble.jpg')
      .bumpImageUrl('/textures/earth-topo-bathy.jpg')
      .backgroundImageUrl('/textures/night-sky.png')
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.24)
      .showAtmosphere(true)
      .showGraticules(false);

    // Configure Official GeoJSON Administrative Boundaries with Google Earth Hover Reveal
    this.globe
      .polygonsData(NER_BOUNDARIES_GEOJSON.features)
      .polygonGeoJsonGeometry((d: any) => d.geometry)
      .polygonAltitude((d: any) => {
        const feat = d as NerGeoJsonFeature;
        if (feat.id === this.selectedDistrictId || feat.id === this.hoveredPolygonId) return 0.018;
        return feat.properties.type === 'district' ? 0.008 : 0.003;
      })
      .polygonCapColor((d: any) => {
        const feat = d as NerGeoJsonFeature;
        const isSelected = feat.id === this.selectedDistrictId;
        const isHovered = feat.id === this.hoveredPolygonId;

        if (isSelected) return 'rgba(56, 189, 248, 0.45)';
        if (isHovered) return 'rgba(56, 189, 248, 0.28)';
        if (feat.properties.type === 'district') {
          return feat.properties.color === '#ef4444' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.12)';
        }
        return 'rgba(15, 23, 42, 0.08)';
      })
      .polygonSideColor(() => 'rgba(2, 132, 199, 0.25)')
      .polygonStrokeColor((d: any) => {
        const feat = d as NerGeoJsonFeature;
        if (feat.id === this.selectedDistrictId) return '#ffffff';
        if (feat.id === this.hoveredPolygonId) return '#38bdf8';
        return feat.properties.color || '#0284c7';
      })
      .polygonLabel((d: any) => {
        const feat = d as NerGeoJsonFeature;
        const p = feat.properties;
        const displayName = this.lang === 'hi' ? p.nameHi : p.name;
        const risk = this.currentRiskMap.get(feat.id);

        return `
          <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); border: 1px solid #38bdf8; border-radius: 8px; padding: 10px 14px; color: #f8fafc; font-family: -apple-system, sans-serif; box-shadow: 0 8px 32px rgba(0,0,0,0.85); min-width: 190px; pointer-events: none;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #ffffff;">${displayName}</strong>
              <span style="background: #1e293b; color: #38bdf8; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 3px; text-transform: uppercase;">
                ${p.type === 'state' ? 'State' : 'District'}
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
              <span>${p.state} &bull; Official Administrative Boundary</span>
              ${p.elevationM ? `<br/><span style="color: #cbd5e1;">Elevation: <strong>${p.elevationM}m MSL</strong> (Slope ${p.slopeDeg}°)</span>` : ''}
            </div>
            ${risk ? `
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #94a3b8;">Landslide Risk:</span>
                <strong style="color: ${risk.level === 'CRITICAL' ? '#ef4444' : risk.level === 'HIGH' ? '#f97316' : '#eab308'}; font-size: 12px;">
                  ${risk.compositeScore}/100 [${risk.level}]
                </strong>
              </div>
            ` : ''}
          </div>
        `;
      })
      .onPolygonHover((hoverD: any) => {
        const feat = hoverD as NerGeoJsonFeature | null;
        this.hoveredPolygonId = feat ? feat.id : null;
        this.container.style.cursor = feat ? 'pointer' : 'default';
      })
      .onPolygonClick((clickD: any) => {
        const feat = clickD as NerGeoJsonFeature;
        if (feat && feat.id) {
          if (feat.properties.type === 'district') {
            this.onSelectDistrict(feat.id);
          } else {
            this.orientToCoordinates(feat.properties.center[0], feat.properties.center[1]);
          }
        }
      });

    // 2D Pulsing Radar Hazard Rings Configuration
    this.globe
      .ringLat((d: any) => d.lat)
      .ringLng((d: any) => d.lon)
      .ringColor((d: any) => d.color)
      .ringMaxRadius((d: any) => d.maxRadius)
      .ringPropagationSpeed((d: any) => d.speed)
      .ringRepeatPeriod((d: any) => d.repeat);

    // Initial Camera View Centered on Northeast India (Lat 26.0°N, Lon 93.0°E)
    this.globe.pointOfView({ lat: 26.0, lng: 93.0, altitude: 1.6 }, 1000);

    // Auto-rotation handling & Deep Zoom
    const controls = this.globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.minDistance = 105; // Highly zoomable down to mountain terrain
      controls.maxDistance = 500;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    this.handleResize();
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
    this.renderDistricts(this.currentDistricts, this.currentRiskMap, this.selectedDistrictId);
  }

  public orientToCoordinates(lat: number, lon: number, altitude = 0.8) {
    if (!this.globe) return;
    this.globe.pointOfView({ lat, lng: lon, altitude }, 1400);
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    if (!this.globe) return;
    this.currentDistricts = districts;
    this.currentRiskMap = riskMap;
    if (selectedDistrictId) this.selectedDistrictId = selectedDistrictId;

    // 1. Generate 2D Pulsing Radar Rings for Critical and High Hazard districts
    const rings: any[] = [];
    const htmlMarkers: any[] = [];

    for (const d of districts) {
      const risk = riskMap.get(d.id);
      const score = risk ? risk.compositeScore : 20;
      const level = risk ? risk.level : 'LOW';

      const colorStr =
        level === 'CRITICAL'
          ? '#ef4444'
          : level === 'HIGH'
          ? '#f97316'
          : level === 'MODERATE'
          ? '#eab308'
          : '#22c55e';

      const isSelected = d.id === this.selectedDistrictId;

      // 2D Radar Pulse Rings
      if (level === 'CRITICAL' || level === 'HIGH' || isSelected) {
        rings.push({
          lat: d.lat,
          lon: d.lon,
          color: (t: number) => {
            const alpha = Math.sqrt(1 - t);
            return level === 'CRITICAL'
              ? `rgba(239, 68, 68, ${alpha * 0.8})`
              : `rgba(249, 115, 22, ${alpha * 0.7})`;
          },
          maxRadius: isSelected ? 4.5 : level === 'CRITICAL' ? 3.8 : 2.8,
          speed: level === 'CRITICAL' ? 2.2 : 1.4,
          repeat: level === 'CRITICAL' ? 1200 : 1800,
        });
      }

      // 2D HTML Location Badge Marker
      htmlMarkers.push({
        lat: d.lat,
        lon: d.lon,
        id: d.id,
        name: d.name.split(' ')[0],
        score,
        level,
        color: colorStr,
        isSelected,
      });
    }

    this.globe.ringsData(rings);

    // Render Clean 2D HTML Place Badges
    this.globe
      .htmlElementsData(htmlMarkers)
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lon)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.className = 'globe-place-badge';
        el.style.cssText = `
          display: flex;
          align-items: center;
          gap: 4px;
          background: ${d.isSelected ? 'rgba(2, 132, 199, 0.95)' : 'rgba(15, 23, 42, 0.88)'};
          border: 1.5px solid ${d.isSelected ? '#ffffff' : d.color};
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.8);
          cursor: pointer;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease, background 0.15s ease;
        `;
        el.innerHTML = `
          <span>${d.name}</span>
          <span style="color: ${d.color}; font-size: 10px;">${d.score}</span>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onSelectDistrict(d.id);
        });
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'translate(-50%, -50%) scale(1.15)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        return el;
      });
  }

  public renderCoolrEvents(show: boolean) {
    if (!this.globe) return;
    const points = show
      ? NASA_COOLR_NER_EVENTS.map(e => ({
          lat: e.lat,
          lng: e.lon,
          size: 0.25,
          color: '#dc2626',
          label: `Historical Landslide (${e.date}): ${e.location}`,
        }))
      : [];
    
    this.globe
      .pointsData(points)
      .pointLat((d: any) => d.lat)
      .pointLng((d: any) => d.lng)
      .pointColor((d: any) => d.color)
      .pointRadius((d: any) => d.size)
      .pointLabel((d: any) => d.label);
  }

  public renderSeismicQuakes(quakes: UsgsEarthquake[], show: boolean) {
    // Seismic quakes overlay
  }

  private handleResize() {
    window.addEventListener('resize', () => {
      if (!this.globe || !this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width > 0 && height > 0) {
        this.globe.width(width).height(height);
      }
    });
  }

  public destroy() {
    if (this.globe) {
      this.container.innerHTML = '';
      this.globe = null;
    }
  }
}
