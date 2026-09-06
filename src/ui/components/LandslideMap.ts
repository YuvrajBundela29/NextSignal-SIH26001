import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_SAFE_SHELTERS } from '../../services/landslide/safe-shelters';
import { NER_RIVER_GAUGES } from '../../services/landslide/river-gauges';
import { groundReportsService } from '../../services/landslide/ground-reports';

export class LandslideMap {
  private map: L.Map | null = null;
  private districtLayer: L.LayerGroup | null = null;
  private coolrLayer: L.LayerGroup | null = null;
  private seismicLayer: L.LayerGroup | null = null;
  private shelterLayer: L.LayerGroup | null = null;
  private gaugeLayer: L.LayerGroup | null = null;
  private reportsLayer: L.LayerGroup | null = null;
  private baseLayers: Record<string, L.LayerGroup> = {};
  private currentBaseLayer: L.LayerGroup | null = null;

  // Remote Sensing Satellite & Earth Observation Layers
  private satLayers: Record<string, L.TileLayer> = {};

  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    this.onSelectDistrict = onSelectDistrict;
    this.initMap(containerId);
  }

  private initMap(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Map container #${containerId} not found`);

    // Center on Northeast Region (Sikkim, Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura)
    this.map = L.map(containerId, {
      center: [26.0, 92.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 18,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // 1. Authentic Dark Tactical Basemap
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; NextSignal Defense Console',
      maxNativeZoom: 16,
      maxZoom: 20,
    });
    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
      maxZoom: 20,
    });
    const darkGroup = L.layerGroup([darkBase, darkLabels]);

    // 2. 4K Ultra-Clarity Satellite Basemap
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxNativeZoom: 18,
      maxZoom: 20,
    });
    const satGroup = L.layerGroup([satLayer]);

    // 3. Topographic Relief Basemap
    const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; National Geographic, USGS',
      maxNativeZoom: 18,
      maxZoom: 20,
    });
    const topoGroup = L.layerGroup([topoLayer]);

    // 4. OpenTopoMap
    const openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap (CC-BY-SA)',
      maxNativeZoom: 17,
      maxZoom: 20,
    });
    const openTopoGroup = L.layerGroup([openTopo]);

    this.baseLayers = {
      dark: darkGroup,
      satellite: satGroup,
      topo: topoGroup,
      opentopo: openTopoGroup,
    };

    // Default to Dark Tactical
    this.currentBaseLayer = darkGroup;
    this.currentBaseLayer.addTo(this.map);

    // Initialize Earth Observation & Satellite Layers
    this.satLayers = {
      precip: L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=d229f67fa1e11c3412aa0e510ec5e404', {
        opacity: 0.65,
        attribution: 'RainViewer / GPM Telemetry',
      }),
      clouds: L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=d229f67fa1e11c3412aa0e510ec5e404', {
        opacity: 0.5,
        attribution: 'INSAT-3DR / GOES IR',
      }),
      wind: L.tileLayer('https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=d229f67fa1e11c3412aa0e510ec5e404', {
        opacity: 0.55,
        attribution: 'ECMWF / OpenWeather Wind Vector',
      }),
      sentinel2: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        opacity: 0.75,
        attribution: 'ESA Copernicus Sentinel-2 MSI Synthetic',
      }),
      sar: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        opacity: 0.8,
        attribution: 'Sentinel-1 InSAR Interferogram Coherence',
      }),
    };

    this.shelterLayer = L.layerGroup().addTo(this.map);
    this.gaugeLayer = L.layerGroup().addTo(this.map);
    this.coolrLayer = L.layerGroup().addTo(this.map);
    this.seismicLayer = L.layerGroup().addTo(this.map);
    this.districtLayer = L.layerGroup().addTo(this.map);
    this.reportsLayer = L.layerGroup().addTo(this.map);

    this.renderSafeShelters(true);
    this.renderRiverGauges(true);
    this.renderGroundReports(true);
  }

  public setSatelliteLayer(layerId: string, enabled: boolean) {
    if (!this.map) return;
    const layer = this.satLayers[layerId];
    if (!layer) return;

    if (enabled) {
      layer.addTo(this.map);
      layer.bringToFront();
    } else {
      this.map.removeLayer(layer);
    }
  }

  public renderGroundReports(show: boolean = true) {
    if (!this.reportsLayer) return;
    this.reportsLayer.clearLayers();
    if (!show) return;

    const reports = groundReportsService.getReports();
    for (const r of reports) {
      const isPending = r.status === 'PENDING';
      const isVerified = r.status === 'VERIFIED';
      const isEscalated = r.status === 'ESCALATED';
      const statusColor = isEscalated ? '#ef4444' : isPending ? '#eab308' : isVerified ? '#22c55e' : '#38bdf8';

      let iconEmoji = '⚠️';
      if (r.category === 'slope_movement') iconEmoji = '⛰️';
      else if (r.category === 'tension_crack') iconEmoji = '⚡';
      else if (r.category === 'road_damage') iconEmoji = '🛣️';
      else if (r.category === 'rockfall_debris') iconEmoji = '🪨';
      else if (r.category === 'blocked_road') iconEmoji = '🚫';
      else if (r.category === 'culvert_overflow') iconEmoji = '🌊';

      const markerHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${statusColor}25; border: 2px solid ${statusColor}; box-shadow: 0 0 14px ${statusColor}; animation: pulse 1.8s infinite;"></div>
          <span style="font-size: 13px; z-index: 2;">${iconEmoji}</span>
        </div>
      `;

      const icon = L.divIcon({
        className: 'ground-report-marker',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([r.lat, r.lon], { icon }).addTo(this.reportsLayer);

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; width: 220px; padding: 4px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 11px; color: #38bdf8;">REPORT #${r.id}</strong>
            <span style="font-size: 8px; font-weight: 800; color: ${statusColor}; background: ${statusColor}20; border: 1px solid ${statusColor}; padding: 1px 5px; border-radius: 3px;">${r.status}</span>
          </div>
          <div style="width: 100%; height: 95px; border-radius: 6px; overflow: hidden; margin-bottom: 6px; background: #050811; border: 1px solid #334155;">
            <img src="${r.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Evidence" />
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #ffffff; margin-bottom: 2px;">${r.categoryLabel}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">📍 ${r.locationName}</div>
          <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4; margin-bottom: 6px; background: #020617; padding: 5px; border-radius: 4px;">${r.description}</div>
          <div style="font-size: 9px; color: #64748b; display: flex; justify-content: space-between;">
            <span>Reported by: <strong>${r.reporterName}</strong></span>
          </div>
        </div>
      `);
    }
  }

  public renderRiverGauges(show: boolean) {
    if (!this.gaugeLayer) return;
    this.gaugeLayer.clearLayers();
    if (!show) return;

    for (const g of NER_RIVER_GAUGES) {
      const isHighRisk = g.glofRisk === 'HIGH';
      const marker = L.circleMarker([g.lat, g.lon], {
        radius: isHighRisk ? 7 : 5,
        color: isHighRisk ? '#ef4444' : '#38bdf8',
        weight: 2,
        fillColor: isHighRisk ? '#dc2626' : '#0284c7',
        fillOpacity: 0.9,
      });

      marker.bindTooltip(`
        <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #fff; min-width: 150px;">
          <strong style="color: #38bdf8;">${g.stationName}</strong><br/>
          <span style="color: #cbd5e1;">River: ${g.riverName}</span><br/>
          <span>Current Level: <strong>${g.currentLevelM}m</strong> (${g.trend === 'RISING' ? 'Rising' : 'Steady'})</span><br/>
          <span style="color: ${isHighRisk ? '#ef4444' : '#34d399'}; font-weight: bold;">GLOF / Flash Flood Risk: ${g.glofRisk}</span>
        </div>
      `, { direction: 'top', offset: [0, -6] });

      marker.addTo(this.gaugeLayer);
    }
  }

  public renderSafeShelters(show: boolean) {
    if (!this.shelterLayer) return;
    this.shelterLayer.clearLayers();
    if (!show) return;

    for (const s of NER_SAFE_SHELTERS) {
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 6,
        color: '#10b981',
        weight: 1.5,
        fillColor: '#059669',
        fillOpacity: 0.9,
      });

      marker.bindTooltip(`
        <div style="font-family: system-ui, sans-serif; font-size: 11px; color: #fff;">
          <strong style="color: #34d399;">${s.name}</strong><br/>
          <span style="color: #94a3b8;">${s.type} &bull; ${s.elevationM}m MSL</span><br/>
          <span>Capacity: <strong>${s.capacityPersons} persons</strong></span><br/>
          <span style="color: #38bdf8;">DEOC Emergency: ${s.contactNumber}</span>
        </div>
      `, { direction: 'top', offset: [0, -6] });

      marker.addTo(this.shelterLayer);
    }
  }

  public setBaseMap(type: 'dark' | 'satellite' | 'topo' | 'opentopo') {
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
      const radius = isSelected ? 13 : Math.max(7, Math.min(16, (score / 100) * 16));

      const marker = L.circleMarker([d.lat, d.lon], {
        radius,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: 0.85,
      });

      marker.bindTooltip(`
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #fff; line-height: 1.4;">
          <div style="font-weight: 800; color: ${isSelected ? '#38bdf8' : '#ffffff'}; font-size: 13px;">${this.getDistrictDisplayName(d)} (${d.state})</div>
          <div>Risk Score: <strong style="color: ${color};">${score}/100 [${level}]</strong></div>
          <div style="color: #94a3b8; font-size: 11px;">Slope: ${d.averageSlopeDeg}&deg; | Pop: ${(d.population / 1000).toFixed(0)}k | Elev: ${d.elevationM}m</div>
          ${risk?.dominantTrigger ? `<div style="color: #f59e0b; font-size: 10px; margin-top: 2px;">Trigger: ${risk.dominantTrigger}</div>` : ''}
        </div>
      `, {
        direction: 'top',
        className: 'landslide-custom-tooltip',
        offset: [0, -10],
      });

      marker.on('click', () => {
        this.onSelectDistrict(d.id);
      });

      marker.addTo(this.districtLayer);
    }

    this.renderGroundReports(true);
  }

  public renderCoolrLandslides(show: boolean) {
    if (!this.coolrLayer) return;
    this.coolrLayer.clearLayers();
    if (!show) return;

    for (const event of NASA_COOLR_NER_EVENTS) {
      const marker = L.circleMarker([event.lat, event.lon], {
        radius: 5,
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
      const radius = Math.max(5, q.mag * 2.8);
      const marker = L.circleMarker([q.lat, q.lon], {
        radius,
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#0284c7',
        fillOpacity: 0.65,
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

  public invalidateSize() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }
}
