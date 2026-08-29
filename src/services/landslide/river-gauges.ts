export interface RiverGaugeStation {
  id: string;
  stationName: string;
  riverName: string;
  state: string;
  districtId: string;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  hflM: number; // Highest Flood Level
  trend: 'RISING' | 'STEADY' | 'FALLING';
  glofRisk: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  lat: number;
  lon: number;
}

export const NER_RIVER_GAUGES: RiverGaugeStation[] = [
  {
    id: 'gauge_teesta_chungthang',
    stationName: 'Chungthang Dam Gauge (Teesta-III Basin)',
    riverName: 'Teesta River (Upper Catchment)',
    state: 'Sikkim',
    districtId: 'sk_mangan',
    currentLevelM: 1564.2,
    warningLevelM: 1568.0,
    dangerLevelM: 1572.0,
    hflM: 1575.5,
    trend: 'RISING',
    glofRisk: 'HIGH',
    lat: 27.6040,
    lon: 88.6470,
  },
  {
    id: 'gauge_brahmaputra_pasighat',
    stationName: 'Pasighat Gauge (Siang / Brahmaputra Entry)',
    riverName: 'Siang River (Yarlung Tsangpo)',
    state: 'Arunachal Pradesh',
    districtId: 'ar_east_siang',
    currentLevelM: 152.8,
    warningLevelM: 153.5,
    dangerLevelM: 154.0,
    hflM: 155.2,
    trend: 'RISING',
    glofRisk: 'ELEVATED',
    lat: 28.0660,
    lon: 95.3260,
  },
  {
    id: 'gauge_brahmaputra_pandu',
    stationName: 'Pandu Gauge (Guwahati Urban Basin)',
    riverName: 'Brahmaputra River',
    state: 'Assam',
    districtId: 'as_kamrup_metro',
    currentLevelM: 48.6,
    warningLevelM: 49.68,
    dangerLevelM: 50.5,
    hflM: 51.46,
    trend: 'STEADY',
    glofRisk: 'NORMAL',
    lat: 26.1750,
    lon: 91.6880,
  },
  {
    id: 'gauge_barak_silchar',
    stationName: 'Annapurna Ghat Gauge (Barak Valley Entry)',
    riverName: 'Barak River',
    state: 'Assam',
    districtId: 'as_cachar',
    currentLevelM: 19.45,
    warningLevelM: 19.83,
    dangerLevelM: 20.87,
    hflM: 22.1,
    trend: 'RISING',
    glofRisk: 'NORMAL',
    lat: 24.8330,
    lon: 92.7780,
  },
  {
    id: 'gauge_doyang_wokha',
    stationName: 'Doyang Hydro Reservoir Gauge',
    riverName: 'Doyang River',
    state: 'Nagaland',
    districtId: 'nl_wokha',
    currentLevelM: 331.2,
    warningLevelM: 333.0,
    dangerLevelM: 335.5,
    hflM: 337.0,
    trend: 'STEADY',
    glofRisk: 'NORMAL',
    lat: 26.2210,
    lon: 94.2760,
  },
];
