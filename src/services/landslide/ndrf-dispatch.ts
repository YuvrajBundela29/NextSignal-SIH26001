import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry } from './types';
import { NER_SAFE_SHELTERS } from './safe-shelters';
import { NER_HIGHWAY_ROUTES } from './highway-navigation';

export interface NdrfMobilizationOrder {
  orderId: string;
  issuedAt: string;
  targetDistrict: string;
  targetState: string;
  riskScore: number;
  alertLevel: string;
  commandingBattalion: string;
  battalionBase: string;
  personnelCount: number;
  deployedAssets: string[];
  stagingLocation: string;
  helipadCoordinates: string;
  avoidRoutes: string[];
  capAlertMessage: string;
}

export function generateNdrfOrder(
  district: DistrictProfile,
  risk: RiskScoreBreakdown,
  weather: WeatherTelemetry
): NdrfMobilizationOrder {
  const isCritical = risk.level === 'CRITICAL';
  const orderNum = Math.floor(100000 + Math.random() * 900000);
  
  // Find closest NDRF battalion based on state
  let battalion = '1st Battalion NDRF (Patgaon, Guwahati)';
  let base = 'Guwahati Airport / Patgaon Base';
  if (district.state === 'Arunachal Pradesh') {
    battalion = '12th Battalion NDRF (Doimukh, Itanagar)';
    base = 'Hollongi Airport / Doimukh Base';
  } else if (district.state === 'Sikkim') {
    battalion = '2nd Battalion NDRF (Siliguri Regional Response Centre)';
    base = 'Bagdogra Air Base / Sevoke Staging';
  } else if (district.state === 'Mizoram' || district.state === 'Tripura') {
    battalion = '1st BN NDRF Detachment (Agartala / Aizawl RRC)';
    base = 'Lengpui / MBB Airport Base';
  }

  // Find nearest shelter / staging
  const shelter = NER_SAFE_SHELTERS.find(s => s.districtId === district.id) || NER_SAFE_SHELTERS[0];
  const affectedHwy = NER_HIGHWAY_ROUTES.filter(h => h.overallVulnerability === 'CRITICAL').map(h => h.code);

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' IST';

  const capMsg = `[NDMA-CAP-ALERT] URGENT LANDSLIDE EVACUATION ADVISORY for ${district.name}, ${district.state}. High slope instability detected with ${weather.rainfall24hMm}mm rainfall. Proceed immediately to designated safe shelter: ${shelter.name}. Avoid mountain cut-slopes and stream gullies. DEOC Emergency Helpline: ${shelter.contactNumber}.`;

  return {
    orderId: `NDRF-NER-${district.state.slice(0, 2).toUpperCase()}-${orderNum}`,
    issuedAt: dateStr,
    targetDistrict: district.name,
    targetState: district.state,
    riskScore: risk.compositeScore,
    alertLevel: risk.level,
    commandingBattalion: battalion,
    battalionBase: base,
    personnelCount: isCritical ? 90 : 45,
    deployedAssets: [
      '2x Hydraulic Rescue Cutters & Earth Augers',
      '4x Heavy Debris Breakers & Shoring Struts',
      '1x All-Terrain Search & Rescue Drone (Thermal FLIR Camera)',
      '1x Satellite Comms Terminal (ISRO GSAT Quick-Deploy)',
      '3x Inflatable Evacuation Rafts for GLOF/River surge',
    ],
    stagingLocation: `${shelter.name} (${shelter.type})`,
    helipadCoordinates: `${district.lat.toFixed(4)}°N, ${district.lon.toFixed(4)}°E (Alt: ${district.elevationM}m MSL)`,
    avoidRoutes: affectedHwy.length > 0 ? affectedHwy : ['Active Mountain Cut-Slopes'],
    capAlertMessage: capMsg,
  };
}
