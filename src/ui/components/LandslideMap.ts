import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictProfile, RiskScoreBreakdown } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';

export class LandslideMap {
  private map: L.Map | null = null;
  private baseLayers: Record<string, L.TileLayer> = {};
  private currentBaseLayer: L.TileLayer | null = null;
  private districtLayer: L.LayerGroup | null = null;
  private coolrLayer: L.LayerGroup | null = null;
  private seismicLayer: L.LayerGroup | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private isHi = false;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    this.onSelectDistrict = onSelectDistrict;
    this.initMap(containerId);
  }

  private initMap(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Centered on Northeast India
    this.map = L.map(containerId, {
      center: [26.0, 92.9],
      zoom: 7,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // 100% Free, Keyless Basemaps (No API Keys required, zero watermark):
    // 1. ESRI World Topographic / Relief (Mountain Contours & Hillshades)
    const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; National Geographic, DeLorme, HERE, USGS',
      maxZoom: 18,
    });

    // 2. ESRI High-Resolution Satellite Imagery
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    });

    // 3. OpenStreetMap with Dark Theme CSS filter
    const darkLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'dark-mode-tiles',
      maxZoom: 19,
    });

    this.baseLayers = {
      satellite: satLayer,
      topo: topoLayer,
      dark: darkLayer,
    };

    // Default to Topographic Relief Map (Best for landslide monitoring)
    this.currentBaseLayer = topoLayer;
    this.currentBaseLayer.addTo(this.map);

    this.districtLayer = L.layerGroup().addTo(this.map);
    this.coolrLayer = L.layerGroup().addTo(this.map);
    this.seismicLayer = L.layerGroup().addTo(this.map);
  }

  public setBaseMap(type: 'satellite' | 'topo' | 'dark') {
    if (!this.map || !this.baseLayers[type]) return;
    if (this.currentBaseLayer) {
      this.map.removeLayer(this.currentBaseLayer);
    }
    this.currentBaseLayer = this.baseLayers[type];
    this.currentBaseLayer.addTo(this.map);
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    if (!this.districtLayer || !this.map) return;
    this.districtLayer.clearLayers();

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

      const isSelected = d.id === selectedDistrictId;
      const radius = isSelected ? 18 : level === 'CRITICAL' ? 15 : level === 'HIGH' ? 13 : 10;

      // Pulse ring for Critical & High risk zones
      if (level === 'CRITICAL' || level === 'HIGH') {
        const pulseCircle = L.circleMarker([d.lat, d.lon], {
          radius: radius + 8,
          color: color,
          weight: 1.5,
          opacity: 0.6,
          fillColor: color,
          fillOpacity: 0.2,
          className: 'landslide-pulse-marker',
        });
        pulseCircle.addTo(this.districtLayer);
      }

      const marker = L.circleMarker([d.lat, d.lon], {
        radius,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.9,
      });

      const label = this.isHi ? d.nameHi : d.name;
      const tooltipContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #fff; min-width: 140px;">
          <div style="font-weight: bold; font-size: 13px; color: ${color};">${label}</div>
          <div style="color: #94a3b8; font-size: 11px;">${d.state} &bull; ${d.elevationM}m MSL</div>
          <div style="margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Risk Score:</span>
            <strong style="color: ${color};">${score}/100 [${level}]</strong>
          </div>
          ${risk ? `<div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">Trigger: ${risk.dominantTrigger}</div>` : ''}
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        className: 'landslide-custom-tooltip',
        offset: [0, -10],
      });

      marker.on('click', () => {
        this.onSelectDistrict(d.id);
      });

      marker.addTo(this.districtLayer);
    }
  }

  public renderCoolrLandslides(show: boolean) {
    if (!this.coolrLayer) return;
    this.coolrLayer.clearLayers();
    if (!show) return;

    for (const event of NASA_COOLR_NER_EVENTS) {
      const marker = L.circleMarker([event.lat, event.lon], {
        radius: 6,
        color: '#dc2626',
        weight: 1.5,
        fillColor: '#b91c1c',
        fillOpacity: 0.8,
      });

      marker.bindTooltip(`
        <div style="font-size: 11px; color: #fecaca; line-height: 1.3;">
          <strong>Historical Landslide (${event.date})</strong><br/>
          <span>${event.location}</span><br/>
          <span style="color: #f87171;">Fatalities: ${event.fatalities} | Source: ${event.source}</span>
        </div>
      `, { direction: 'top', offset: [0, -6] });

      marker.addTo(this.coolrLayer);
    }
  }

  public renderSeismicEvents(quakes: UsgsEarthquake[], show: boolean) {
    if (!this.seismicLayer) return;
    this.seismicLayer.clearLayers();
    if (!show || !quakes) return;

    for (const q of quakes) {
      const radius = Math.max(5, q.mag * 3);
      const marker = L.circleMarker([q.lat, q.lon], {
        radius,
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#0284c7',
        fillOpacity: 0.5,
      });

      marker.bindTooltip(`
        <div style="font-size: 11px; color: #bae6fd; line-height: 1.3;">
          <strong>USGS Earthquake M${q.mag.toFixed(1)}</strong><br/>
          <span>${q.place}</span><br/>
          <span>Depth: ${q.depthKm} km</span>
        </div>
      `, { direction: 'top', offset: [0, -6] });

      marker.addTo(this.seismicLayer);
    }
  }

  public flyToDistrict(lat: number, lon: number, zoom = 9) {
    if (this.map) {
      this.map.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  }
}
