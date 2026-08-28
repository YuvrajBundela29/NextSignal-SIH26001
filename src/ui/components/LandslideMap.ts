import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_STATE_BOUNDARIES } from '../../services/landslide/state-boundaries';

export class LandslideMap {
  private map: L.Map | null = null;
  private baseLayers: Record<string, L.TileLayer> = {};
  private currentBaseLayer: L.TileLayer | null = null;
  private districtLayer: L.LayerGroup | null = null;
  private boundaryLayer: L.LayerGroup | null = null;
  private coolrLayer: L.LayerGroup | null = null;
  private seismicLayer: L.LayerGroup | null = null;
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    this.onSelectDistrict = onSelectDistrict;
    this.initMap(containerId);
  }

  private initMap(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.map = L.map(containerId, {
      center: [26.0, 92.9],
      zoom: 7,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // 4K Ultra-Clarity Basemaps
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
      maxNativeZoom: 18,
      maxZoom: 20,
    });

    const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; National Geographic, DeLorme, HERE, USGS',
      maxNativeZoom: 18,
      maxZoom: 20,
    });

    const openTopoLayer = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> | &copy; OSM contributors',
      maxNativeZoom: 17,
      maxZoom: 19,
    });

    const darkLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-mode-tiles',
      maxNativeZoom: 19,
      maxZoom: 19,
    });

    this.baseLayers = {
      satellite: satLayer,
      topo: topoLayer,
      opentopo: openTopoLayer,
      dark: darkLayer,
    };

    this.currentBaseLayer = satLayer;
    this.currentBaseLayer.addTo(this.map);

    this.boundaryLayer = L.layerGroup().addTo(this.map);
    this.districtLayer = L.layerGroup().addTo(this.map);
    this.coolrLayer = L.layerGroup().addTo(this.map);
    this.seismicLayer = L.layerGroup().addTo(this.map);

    this.renderStateBorders(true);
  }

  public renderStateBorders(show: boolean) {
    if (!this.boundaryLayer) return;
    this.boundaryLayer.clearLayers();
    if (!show) return;

    for (const b of NER_STATE_BOUNDARIES) {
      const polyline = L.polyline(b.coordinates, {
        color: b.color,
        weight: 2.5,
        opacity: 0.85,
        dashArray: '6, 6',
      });
      polyline.bindTooltip(`<strong>${b.state} State Boundary</strong>`, { sticky: true });
      polyline.addTo(this.boundaryLayer);
    }
  }

  public setBaseMap(type: 'satellite' | 'topo' | 'opentopo' | 'dark') {
    if (!this.map || !this.baseLayers[type]) return;
    if (this.currentBaseLayer) {
      this.map.removeLayer(this.currentBaseLayer);
    }
    this.currentBaseLayer = this.baseLayers[type];
    this.currentBaseLayer.addTo(this.map);
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  private getDistrictDisplayName(d: DistrictProfile): string {
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
      const radius = isSelected ? 16 : level === 'CRITICAL' ? 14 : level === 'HIGH' ? 12 : 9;

      if (level === 'CRITICAL' || level === 'HIGH') {
        const pulseCircle = L.circleMarker([d.lat, d.lon], {
          radius: radius + 8,
          color: color,
          weight: 2,
          opacity: 0.7,
          fillColor: color,
          fillOpacity: 0.25,
          className: 'landslide-pulse-marker',
        });
        pulseCircle.addTo(this.districtLayer);
      }

      const marker = L.circleMarker([d.lat, d.lon], {
        radius,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.92,
      });

      const label = this.getDistrictDisplayName(d);
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
        fillOpacity: 0.85,
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
        fillOpacity: 0.55,
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

  public flyToDistrict(lat: number, lon: number, zoom = 10) {
    if (this.map) {
      this.map.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  }
}
