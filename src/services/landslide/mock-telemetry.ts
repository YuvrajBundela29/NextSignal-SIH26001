import type { WeatherTelemetry, SoilTelemetry, SeismicTelemetry, DistrictProfile } from './types';
import type { UsgsEarthquake } from './usgs-seismic';

export type DemoScenario = 'monsoon_deluge' | 'seismic_crisis' | 'normal_baseline';

export const MOCK_EARTHQUAKES: Record<DemoScenario, UsgsEarthquake[]> = {
 monsoon_deluge: [
 {
 id: 'eq_mock_1',
 mag: 3.4,
 place: '28km ENE of Haflong, Assam',
 time: Date.now() - 14 * 60 * 60 * 1000,
 lat: 25.22,
 lon: 93.28,
 depthKm: 18,
 },
 {
 id: 'eq_mock_2',
 mag: 4.1,
 place: '45km N of Gangtok, Sikkim',
 time: Date.now() - 36 * 60 * 60 * 1000,
 lat: 27.72,
 lon: 88.62,
 depthKm: 22,
 },
 ],
 seismic_crisis: [
 {
 id: 'eq_mock_crisis_1',
 mag: 5.8,
 place: '18km W of Bomdila, Arunachal Pradesh',
 time: Date.now() - 4 * 60 * 60 * 1000,
 lat: 27.28,
 lon: 92.22,
 depthKm: 12,
 },
 {
 id: 'eq_mock_crisis_2',
 mag: 4.9,
 place: '32km NW of Tawang, Arunachal Pradesh',
 time: Date.now() - 11 * 60 * 60 * 1000,
 lat: 27.75,
 lon: 91.68,
 depthKm: 10,
 },
 {
 id: 'eq_mock_crisis_3',
 mag: 4.4,
 place: '40km NE of Haflong, Assam',
 time: Date.now() - 22 * 60 * 60 * 1000,
 lat: 25.40,
 lon: 93.30,
 depthKm: 15,
 },
 ],
 normal_baseline: [
 {
 id: 'eq_mock_norm',
 mag: 2.3,
 place: '85km NE of Kohima, Nagaland',
 time: Date.now() - 58 * 60 * 60 * 1000,
 lat: 26.10,
 lon: 94.70,
 depthKm: 35,
 },
 ],
};

export function getMockWeatherForDistrict(district: DistrictProfile, scenario: DemoScenario): WeatherTelemetry {
 const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

 if (scenario === 'monsoon_deluge') {
 // High-risk epicenters: Dima Hasao, East Khasi Hills, Mangan, Noney, Aizawl
 const isCritical = ['as_dima_hasao', 'ml_east_khasi_hills', 'sk_mangan', 'mn_noney', 'mz_aizawl'].includes(district.id);
 const isHigh = ['ml_sw_khasi_hills', 'ar_west_kameng', 'nl_kohima', 'sk_gangtok'].includes(district.id);

 if (isCritical) {
 return {
 currentRainfallMm: 34.5,
 rainfall24hMm: 168.0,
 rainfall72hMm: 312.5,
 rainfallForecast24hMm: 95.0,
 temperatureC: 21,
 humidityPct: 98,
 windSpeedKmh: 38,
 weatherCondition: 'Thunderstorm / Extreme Monsoon Deluge',
 lastUpdated: now,
 };
 } else if (isHigh) {
 return {
 currentRainfallMm: 18.2,
 rainfall24hMm: 92.0,
 rainfall72hMm: 185.0,
 rainfallForecast24hMm: 55.0,
 temperatureC: 22,
 humidityPct: 92,
 windSpeedKmh: 24,
 weatherCondition: 'Heavy Continuous Rain Showers',
 lastUpdated: now,
 };
 } else {
 return {
 currentRainfallMm: 6.4,
 rainfall24hMm: 42.0,
 rainfall72hMm: 85.0,
 rainfallForecast24hMm: 28.0,
 temperatureC: 25,
 humidityPct: 86,
 windSpeedKmh: 15,
 weatherCondition: 'Scattered Rain Showers',
 lastUpdated: now,
 };
 }
 }

 if (scenario === 'seismic_crisis') {
 return {
 currentRainfallMm: 8.0,
 rainfall24hMm: 35.0,
 rainfall72hMm: 60.0,
 rainfallForecast24hMm: 20.0,
 temperatureC: 23,
 humidityPct: 78,
 windSpeedKmh: 16,
 weatherCondition: 'Overcast with Light Showers',
 lastUpdated: now,
 };
 }

 // Normal Baseline
 return {
 currentRainfallMm: 0.0,
 rainfall24hMm: 4.5,
 rainfall72hMm: 12.0,
 rainfallForecast24hMm: 2.0,
 temperatureC: 27,
 humidityPct: 65,
 windSpeedKmh: 10,
 weatherCondition: 'Clear / Partly Cloudy',
 lastUpdated: now,
 };
}

export function getMockSoilForDistrict(district: DistrictProfile, scenario: DemoScenario): SoilTelemetry {
 const now = new Date().toLocaleDateString('en-IN');

 if (scenario === 'monsoon_deluge') {
 const isCritical = ['as_dima_hasao', 'ml_east_khasi_hills', 'sk_mangan', 'mn_noney', 'mz_aizawl'].includes(district.id);
 const isHigh = ['ml_sw_khasi_hills', 'ar_west_kameng', 'nl_kohima', 'sk_gangtok'].includes(district.id);

 if (isCritical) {
 return {
 soilMoisturePct: 94,
 soilSaturationStatus: 'Super-Saturated',
 surfaceWaterRunoffMm: 78.5,
 lastUpdated: now,
 };
 }
 if (isHigh) {
 return {
 soilMoisturePct: 82,
 soilSaturationStatus: 'Saturated',
 surfaceWaterRunoffMm: 45.2,
 lastUpdated: now,
 };
 }
 return {
 soilMoisturePct: 62,
 soilSaturationStatus: 'Moderate',
 surfaceWaterRunoffMm: 22.0,
 lastUpdated: now,
 };
 }

 if (scenario === 'seismic_crisis') {
 return {
 soilMoisturePct: 58,
 soilSaturationStatus: 'Moderate',
 surfaceWaterRunoffMm: 18.0,
 lastUpdated: now,
 };
 }

 return {
 soilMoisturePct: 32,
 soilSaturationStatus: 'Low',
 surfaceWaterRunoffMm: 4.0,
 lastUpdated: now,
 };
}
