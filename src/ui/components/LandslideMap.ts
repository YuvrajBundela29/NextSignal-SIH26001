import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_STATES_GEOJSON, type StateGeoMetadata } from '../../services/landslide/state-boundaries';

export class LandslideMap {
  private map: L.Map | null = null;
  private baseLayers: Record<string, L.TileLayer> = {};
  private currentBaseLayer: L.TileLayer | null = null;
  
  // Overlay Layer Groups
  private districtLayer: L.LayerGroup | null = null;
  private boundaryLayer: L.GeoJSON | null = null;
  private coolrLayer: L.LayerGroup | null = null;
  private seismicLayer: L.LayerGroup | null = null;
  private cloudLayer: L.TileLayer | null = null;
  private weatherTrackLayer: L.TileLayer | null = null;
  private thermalLayer: L.TileLayer | null = null;

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

    // Specialized Sensor Trackers:
    // 1. Cloud Satellite View (NASA GIBS / Real-time Satellite Infrared & Visible Clouds)
    this.cloudLayer = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg', {
      opacity: 0.65,
      maxNativeZoom: 9,
      maxZoom: 19,
      attribution: '&copy; NASA EOSDIS GIBS',
    });

    // 2. Weather Track (Live Precipitation Radar Track)
    this.weatherTrackLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/nowcast_0/512/{z}/{x}/{y}/2/1_1.png', {
      opacity: 0.70,
      maxNativeZoom: 12,
      maxZoom: 19,
      attribution: '&copy; RainViewer Live Weather Radar',
    });

    // 3. Thermal Tracker (NASA MODIS / VIIRS Thermal Hotspots & Surface Temperature)
    this.thermalLayer = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_All/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png', {
      opacity: 0.80,
      maxNativeZoom: 8,
      maxZoom: 19,
      attribution: '&copy; NASA FIRMS / MODIS Thermal Hotspots',
    });

    // Initialize Official State Boundaries with Google Earth Auto-Reveal
    this.initOfficialBoundaries();

    this.districtLayer = L.layerGroup().addTo(this.map);
    this.coolrLayer = L.layerGroup().addTo(this.map);
    this.seismicLayer = L.layerGroup().addTo(this.map);
  }

  private initOfficialBoundaries() {
    if (!this.map) return;

    this.boundaryLayer = L.geoJSON(NER_STATES_GEOJSON as any, {
      style: (feature) => {
        const color = feature?.properties?.color || '#06b6d4';
        return {
          color: color,
          weight: 2.5,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.08,
          dashArray: '6, 6',
        };
      },
      onEachFeature: (feature, layer) => {
        const p: StateGeoMetadata = feature.properties;

        // Google Maps / Google Earth Auto-Reveal on Hover
        const tooltipContent = `
          <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); border: 1px solid ${p.color}; border-radius: 8px; padding: 10px 14px; color: #ffffff; font-family: -apple-system, system-ui, sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,0.7); min-width: 170px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
              <span style="font-size: 13px; font-weight: 800; color: ${p.color};">${p.state}</span>
              <span style="font-size: 10px; color: #94a3b8;">${p.nameHi}</span>
            </div>
            <div style="font-size: 11px; line-height: 1.45; color: #cbd5e1;">
              <div>Capital: <strong style="color: #fff;">${p.capital}</strong></div>
              <div>Monitored Districts: <strong style="color: #fff;">${p.districtsCount} High-Risk</strong></div>
              <div>Elevation Range: <strong style="color: #38bdf8;">${p.elevationRange}</strong></div>
              <div>Arterial Corridor: <strong style="color: #fbbf24;">${p.primaryHighway}</strong></div>
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'landslide-custom-tooltip',
          offset: [10, 10],
        });

        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({
            weight: 4,
            opacity: 1,
            fillOpacity: 0.22,
          });
        });

        layer.on('mouseout', () => {
          (layer as L.Path).setStyle({
            weight: 2.5,
            opacity: 0.9,
            fillOpacity: 0.08,
          });
        });

        layer.on('click', () => {
          if (this.map && (layer as any).getBounds) {
            this.map.fitBounds((layer as any).getBounds(), { padding: [40, 40] });
          }
        });
      },
    }).addTo(this.map);
  }

  public setSatelliteClouds(show: boolean) {
    if (!this.map || !this.cloudLayer) return;
    if (show) {
      this.cloudLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.cloudLayer);
    }
  }

  public setWeatherTrack(show: boolean) {
    if (!this.map || !this.weatherTrackLayer) return;
    if (show) {
      this.weatherTrackLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.weatherTrackLayer);
    }
  }

  public setThermalTracker(show: boolean) {
    if (!this.map || !this.thermalLayer) return;
    if (show) {
      this.thermalLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.thermalLayer);
    }
  }

  public setVirtualBorders(show: boolean) {
    if (!this.map || !this.boundaryLayer) return;
    if (show) {
      this.boundaryLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.boundaryLayer);
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
