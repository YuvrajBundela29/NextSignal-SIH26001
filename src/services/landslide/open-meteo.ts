import type { WeatherTelemetry } from './types';

const weatherCache = new Map<string, { data: WeatherTelemetry; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export async function fetchLiveWeather(
 districtId: string,
 lat: number,
 lon: number,
 fallbackFallback: WeatherTelemetry
): Promise<WeatherTelemetry> {
 const cacheKey = districtId + '_' + lat.toFixed(2) + '_' + lon.toFixed(2);
 const cached = weatherCache.get(cacheKey);
 if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
 return cached.data;
 }

 try {
 const url = 'https://api.open-meteo.com/v1/forecast?latitude=' +
 lat + '&longitude=' + lon +
 '&current=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation&daily=precipitation_sum&past_days=3&forecast_days=2&timezone=Asia%2FKolkata';

 const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
 if (!res.ok) {
 throw new Error('Open-Meteo returned status ' + res.status);
 }

 const data = await res.json();
 const current = data.current || {};
 const hourly = data.hourly || {};

 const hourlyRain: number[] = hourly.precipitation || [];
 const past72hArray = hourlyRain.slice(0, 72);
 const past24hArray = hourlyRain.slice(48, 72);
 const next24hArray = hourlyRain.slice(72, 96);

 const sumRain = (arr: number[]) => arr.reduce((acc, v) => acc + (typeof v === 'number' && !isNaN(v) ? v : 0), 0);

 const rainfall24hMm = Number(sumRain(past24hArray).toFixed(1));
 const rainfall72hMm = Number(sumRain(past72hArray).toFixed(1));
 const rainfallForecast24hMm = Number(sumRain(next24hArray).toFixed(1));
 const currentRainfallMm = Number((current.precipitation || 0).toFixed(1));

 const wCode = current.weather_code || 0;
 let weatherCondition = 'Clear / Fair';
 if (wCode >= 95) weatherCondition = 'Thunderstorm / Cloudburst Risk';
 else if (wCode >= 80) weatherCondition = 'Heavy Rain Showers';
 else if (wCode >= 61) weatherCondition = 'Continuous Monsoon Rain';
 else if (wCode >= 51) weatherCondition = 'Light Rain / Drizzle';
 else if (wCode >= 1) weatherCondition = 'Overcast / Cloudy';

 const telemetry: WeatherTelemetry = {
 currentRainfallMm,
 rainfall24hMm,
 rainfall72hMm,
 rainfallForecast24hMm,
 temperatureC: Math.round(current.temperature_2m != null ? current.temperature_2m : 24),
 humidityPct: Math.round(current.relative_humidity_2m != null ? current.relative_humidity_2m : 82),
 windSpeedKmh: Math.round(current.wind_speed_10m != null ? current.wind_speed_10m : 12),
 weatherCondition,
 lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
 };

 weatherCache.set(cacheKey, { data: telemetry, timestamp: Date.now() });
 return telemetry;
 } catch (err) {
 if (cached) return cached.data;
 return fallbackFallback;
 }
}
