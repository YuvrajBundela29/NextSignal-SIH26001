import type { SoilTelemetry } from './types';

const soilCache = new Map<string, { data: SoilTelemetry; timestamp: number }>();
const SOIL_TTL_MS = 60 * 60 * 1000; // 60 minutes

export async function fetchLiveSoilMoisture(
  districtId: string,
  lat: number,
  lon: number,
  fallback: SoilTelemetry
): Promise<SoilTelemetry> {
  const cacheKey = districtId + '_' + lat.toFixed(2) + '_' + lon.toFixed(2);
  const cached = soilCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SOIL_TTL_MS) {
    return cached.data;
  }

  try {
    const url = 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=GWETROOT,GWETTOP&community=AG&longitude=' +
      lon + '&latitude=' + lat + '&format=JSON&start=20260801&end=20260825';

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('NASA POWER status ' + res.status);

    const json = await res.json();
    const rootZoneData = (json.properties && json.properties.parameter && json.properties.parameter.GWETROOT) || {};
    const values = Object.values(rootZoneData).filter((v): v is number => typeof v === 'number' && v > 0);

    const rootWetness = values.length > 0 ? values[values.length - 1] : 0.75;
    const soilMoisturePct = Math.min(100, Math.max(10, Math.round(rootWetness * 100)));

    let status: SoilTelemetry['soilSaturationStatus'] = 'Moderate';
    if (soilMoisturePct >= 85) status = 'Super-Saturated';
    else if (soilMoisturePct >= 70) status = 'Saturated';
    else if (soilMoisturePct <= 35) status = 'Low';

    const result: SoilTelemetry = {
      soilMoisturePct,
      soilSaturationStatus: status,
      surfaceWaterRunoffMm: Number((soilMoisturePct * 0.45).toFixed(1)),
      lastUpdated: new Date().toLocaleDateString('en-IN'),
    };

    soilCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    return fallback;
  }
}
