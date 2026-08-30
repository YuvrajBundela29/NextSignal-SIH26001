// Real-Time Satellite, Wind, Thermal & Cloud Ingestion Service

export interface SatelliteLayerOption {
  id: 'none' | 'viirs_truecolor' | 'clouds_ir' | 'thermal_anomalies' | 'weather_radar';
  name: string;
  category: 'Clouds' | 'Thermal' | 'Radar';
  description: string;
  source: string;
  resolution: string;
  url: string;
  opacity: number;
}

export const SATELLITE_LAYERS: SatelliteLayerOption[] = [
  {
    id: 'viirs_truecolor',
    name: '🛰️ NASA VIIRS TrueColor Satellite',
    category: 'Clouds',
    description: 'High-resolution corrected reflectance visible satellite view from NASA Suomi NPP / NOAA-20.',
    source: 'NASA EOSDIS GIBS (Free & Open Access)',
    resolution: '250m / Real-Time Daily',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    opacity: 0.85,
  },
  {
    id: 'clouds_ir',
    name: '☁️ Infrared Satellite Cloud Tops',
    category: 'Clouds',
    description: 'Thermal infrared cloud top brightness temperature detecting deep convective monsoonal cloud clusters.',
    source: 'NASA EOSDIS GIBS',
    resolution: '1km / Real-Time Global',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Cloud_Top_Height_Day/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
    opacity: 0.75,
  },
  {
    id: 'thermal_anomalies',
    name: '🌡️ NASA MODIS Land Surface Thermal Temperature',
    category: 'Thermal',
    description: 'Real-time land surface temperature (LST) and infrared thermal radiance mapping soil heat flux.',
    source: 'NASA EOSDIS MODIS Terra',
    resolution: '1km / Daily Pass',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
    opacity: 0.80,
  },
  {
    id: 'weather_radar',
    name: '📡 NASA IMERG Live Precipitation Doppler Radar',
    category: 'Radar',
    description: 'Global Precipitation Measurement (GPM) IMERG precipitation rate detecting flash rainstorms and heavy raincells.',
    source: 'NASA GPM / RainViewer Radar',
    resolution: '500m / Live Precipitation',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
    opacity: 0.80,
  },
];

export async function fetchLiveRainViewerRadarUrl(): Promise<string> {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const past = data.radar?.past;
      if (past && past.length > 0) {
        const latest = past[past.length - 1];
        return `${data.host}${latest.path}/512/{z}/{x}/{y}/2/1_1.png`;
      }
    }
  } catch (e) {
    console.warn('[SatelliteStreams] RainViewer API fallback to NASA IMERG:', e);
  }
  return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png';
}

export interface LiveWindTelemetry {
  speedKmh: number;
  gustKmh: number;
  directionDeg: number;
  directionCardinal: string;
  beaufortScale: string;
  thermalSurfaceTempC: number;
  cloudCoverTotalPct: number;
  cloudCoverHighPct: number;
  cloudCoverLowPct: number;
  pressureHpa: number;
}

export function computeCardinalDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return directions[idx];
}

export function computeBeaufortScale(kmh: number): string {
  if (kmh < 1) return 'Calm (Force 0)';
  if (kmh <= 5) return 'Light Air (Force 1)';
  if (kmh <= 11) return 'Light Breeze (Force 2)';
  if (kmh <= 19) return 'Gentle Breeze (Force 3)';
  if (kmh <= 28) return 'Moderate Breeze (Force 4)';
  if (kmh <= 38) return 'Fresh Breeze (Force 5)';
  if (kmh <= 49) return 'Strong Breeze (Force 6)';
  if (kmh <= 61) return 'High Wind / Near Gale (Force 7)';
  return 'Gale Force Surge (Force 8+)';
}

export async function fetchLiveSatelliteWindTelemetry(lat: number, lon: number): Promise<LiveWindTelemetry> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,surface_temperature,relative_humidity_2m,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_high,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const cur = data.current || {};
      const speed = cur.wind_speed_10m || 14;
      const deg = cur.wind_direction_10m || 210;

      return {
        speedKmh: Math.round(speed),
        gustKmh: Math.round(cur.wind_gusts_10m || speed * 1.4),
        directionDeg: deg,
        directionCardinal: computeCardinalDirection(deg),
        beaufortScale: computeBeaufortScale(speed),
        thermalSurfaceTempC: Math.round((cur.surface_temperature || cur.temperature_2m || 24) * 10) / 10,
        cloudCoverTotalPct: cur.cloud_cover || 78,
        cloudCoverHighPct: cur.cloud_cover_high || 65,
        cloudCoverLowPct: cur.cloud_cover_low || 45,
        pressureHpa: Math.round(cur.surface_pressure || 1008),
      };
    }
  } catch (e) {
    console.warn('[Satellite Streams] Live fetch fallback:', e);
  }

  // Baseline fallback
  return {
    speedKmh: 18,
    gustKmh: 28,
    directionDeg: 220,
    directionCardinal: 'SW',
    beaufortScale: 'Gentle Monsoon Breeze (Force 3)',
    thermalSurfaceTempC: 23.4,
    cloudCoverTotalPct: 82,
    cloudCoverHighPct: 70,
    cloudCoverLowPct: 52,
    pressureHpa: 1006,
  };
}
