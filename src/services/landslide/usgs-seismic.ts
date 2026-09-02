import type { SeismicTelemetry } from './types';

export interface UsgsEarthquake {
 id: string;
 mag: number;
 place: string;
 time: number;
 lat: number;
 lon: number;
 depthKm: number;
}

let cachedQuakes: UsgsEarthquake[] = [];
let lastFetchTime = 0;
const SEISMIC_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Bounding box for Eastern Himalayas & Northeast India
const NER_BBOX = {
 minLat: 21.5,
 maxLat: 29.5,
 minLon: 88.0,
 maxLon: 97.5,
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
 const R = 6371; // Earth radius in km
 const dLat = ((lat2 - lat1) * Math.PI) / 180;
 const dLon = ((lon2 - lon1) * Math.PI) / 180;
 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos((lat1 * Math.PI) / 180) *
 Math.cos((lat2 * Math.PI) / 180) *
 Math.sin(dLon / 2) *
 Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 return R * c;
}

export async function fetchLiveSeismicData(): Promise<UsgsEarthquake[]> {
 if (cachedQuakes.length > 0 && Date.now() - lastFetchTime < SEISMIC_TTL_MS) {
 return cachedQuakes;
 }

 try {
 const startIso = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
 const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' +
 encodeURIComponent(startIso) +
 '&minmagnitude=2.0&minlatitude=' + NER_BBOX.minLat +
 '&maxlatitude=' + NER_BBOX.maxLat +
 '&minlongitude=' + NER_BBOX.minLon +
 '&maxlongitude=' + NER_BBOX.maxLon;

 const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
 if (!res.ok) throw new Error('USGS returned status ' + res.status);

 const json = await res.json();
 const features = json.features || [];

 cachedQuakes = features.map((f: any) => ({
 id: f.id,
 mag: f.properties ? f.properties.mag || 0 : 0,
 place: f.properties ? f.properties.place || 'NER Region' : 'NER Region',
 time: f.properties ? f.properties.time || Date.now() : Date.now(),
 lat: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[1] || 0 : 0,
 lon: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[0] || 0 : 0,
 depthKm: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[2] || 10 : 10,
 }));

 lastFetchTime = Date.now();
 return cachedQuakes;
 } catch (err) {
 console.warn('[USGS Seismic] Live fetch failed or rate-limited, returning cached:', err);
 return cachedQuakes;
 }
}

export function computeDistrictSeismicTelemetry(
 districtLat: number,
 districtLon: number,
 quakes: UsgsEarthquake[]
): SeismicTelemetry {
 if (!quakes || quakes.length === 0) {
 return {
 recentQuakes72hCount: 0,
 maxMagnitude72h: 0,
 nearestEpicenterKm: 999,
 shakeIntensityFactor: 0.0,
 };
 }

 let minDistance = 9999;
 let maxMag = 0;
 let recentCount = 0;
 let maxIntensity = 0;
 let latestTime: number | undefined;

 for (const q of quakes) {
 const dist = calculateDistanceKm(districtLat, districtLon, q.lat, q.lon);
 if (dist <= 300) {
 recentCount++;
 if (q.mag > maxMag) maxMag = q.mag;
 if (dist < minDistance) {
 minDistance = dist;
 latestTime = q.time;
 }

 const intensity = (Math.pow(10, 0.45 * q.mag) / Math.pow(dist + 20, 1.3)) * 4.5;
 if (intensity > maxIntensity) maxIntensity = intensity;
 }
 }

 const shakeIntensityFactor = Math.min(1.0, Number((maxIntensity).toFixed(2)));

 return {
 recentQuakes72hCount: recentCount,
 maxMagnitude72h: Number(maxMag.toFixed(1)),
 nearestEpicenterKm: minDistance < 9999 ? Math.round(minDistance) : 999,
 shakeIntensityFactor,
 lastEventTimestamp: latestTime ? new Date(latestTime).toLocaleString('en-IN') : undefined,
 };
}
