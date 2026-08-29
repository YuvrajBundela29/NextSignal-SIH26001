import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_SAFE_SHELTERS } from '../../services/landslide/safe-shelters';
import { NER_RIVER_GAUGES } from '../../services/landslide/river-gauges';

export class LandslideMap {
  private map: L.Map | null = null;
  private baseLayers: Record<string, L.LayerGroup> = {};
  private currentBaseLayer: L.LayerGroup | null = null;
  
  // Overlays
  private districtLayer: L.LayerGroup | null = null;
  private coolrLayer: L.LayerGroup | null = null;
  private seismicLayer: L.LayerGroup | null = null;
  private shelterLayer: L.LayerGroup | null = null;
  private gaugeLayer: L.LayerGroup | null = null;

  // Remote Sensing Satellite & Earth Observation Layers
  private satLayers: Record<string, L.TileLayer> = {};

  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';

  constructor(
    containerId: string,
    onSelectDistrict: (districtId: string) => void
  ) {
    this.onSelectDistrict = onSelectDistrict;
    this.initMap(containerId);
  }

  private initMap(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Centered squarely on Northeast India (NER)
    this.map = L.map(containerId, {
      center: [26.0, 92.9],
      zoom: 7,
      minZoom: 4,
      maxZoom: 19,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // 1. Tactical Pitch-Black Operations Basemap (Deep pure black #000000 with crisp borders & terrain)
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; NextSignal Defense Console',
      maxNativeZoom: 16,
      maxZoom: 20,
      className: 'pitch-black-map-tiles',
    });
    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
      maxZoom: 20,
      className: 'pitch-black-map-labels',
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

    // 4. OpenTopo Contours Basemap
    const openTopoLayer = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap | OSM contributors',
      maxNativeZoom: 17,
      maxZoom: 19,
    });
    const openTopoGroup = L.layerGroup([openTopoLayer]);

    this.baseLayers = {
      dark: darkGroup,
      satellite: satGroup,
      topo: topoGroup,
      opentopo: openTopoGroup,
    };

    // Default to Pitch-Black Tactical Mode
    this.currentBaseLayer = darkGroup;
    this.currentBaseLayer.addTo(this.map);

    // Live Earth Remote Sensing Layers (NASA IMERG Doppler + MODIS Thermal + VIIRS Clouds)
    this.satLayers = {
      thermal_anomalies: L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png', {
        opacity: 0.80,
        maxNativeZoom: 7,
        maxZoom: 19,
        attribution: '&copy; NASA MODIS Real-Time Land Surface Thermal Radiance',
      }),
      viirs_truecolor: L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg', {
        opacity: 0.85,
        maxNativeZoom: 9,
        maxZoom: 19,
        attribution: '&copy; NASA EOSDIS VIIRS Satellite',
      }),
      clouds_ir: L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Cloud_Top_Height_Day/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png', {
        opacity: 0.70,
        maxNativeZoom: 6,
        maxZoom: 19,
        attribution: '&copy; NASA EOSDIS Infrared Cloud Tops',
      }),
      weather_radar: L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png', {
        opacity: 0.80,
        maxNativeZoom: 6,
        maxZoom: 19,
        attribution: '&copy; NASA GPM / IMERG Live Precipitation Doppler Radar',
      }),
    };

    this.shelterLayer = L.layerGroup().addTo(this.map);
    this.gaugeLayer = L.layerGroup().addTo(this.map);
    this.coolrLayer = L.layerGroup().addTo(this.map);
    this.seismicLayer = L.layerGroup().addTo(this.map);
    this.districtLayer = L.layerGroup().addTo(this.map);

    this.renderSafeShelters(true);
    this.renderRiverGauges(true);
  }

  public setSatelliteLayer(layerId: string, enabled: boolean) {
    if (!this.map) return;
    const layer = this.satLayers[layerId];
    if (!layer) return;

    if (enabled) {
      layer.addTo(this.map);
    } else {
      this.map.removeLayer(layer);
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
          <strong style="color: #38bdf8;">🌊 ${g.stationName}</strong><br/>
          <span style="color: #cbd5e1;">River: ${g.riverName}</span><br/>
          <span>Current Level: <strong>${g.currentLevelM}m</strong> (${g.trend === 'RISING' ? '▲ Rising' : '▬ Steady'})</span><br/>
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
          <strong style="color: #34d399;">🛡️ ${s.name}</strong><br/>
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
      const radius = isSelected ? 12 : level === 'CRITICAL' ? 10 : level === 'HIGH' ? 8 : 6;

      if (level === 'CRITICAL' || level === 'HIGH') {
        const pulseCircle = L.circleMarker([d.lat, d.lon], {
          radius: radius + 6,
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
        weight: isSelected ? 2.5 : 1.5,
        fillColor: color,
        fillOpacity: 0.95,
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
}
