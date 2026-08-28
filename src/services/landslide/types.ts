export type NerState =
  | 'Assam'
  | 'Meghalaya'
  | 'Arunachal Pradesh'
  | 'Nagaland'
  | 'Manipur'
  | 'Mizoram'
  | 'Tripura'
  | 'Sikkim';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AppLanguage = 'en' | 'hi' | 'as' | 'bn' | 'mni' | 'lus' | 'kha' | 'ne';

export interface DistrictProfile {
  id: string;
  name: string;
  nameHi: string;
  nameAs?: string;   // Assamese
  nameBn?: string;   // Bengali
  nameMni?: string;  // Manipuri (Meitei)
  nameLus?: string;  // Mizo
  nameKha?: string;  // Khasi
  nameNe?: string;   // Nepali
  state: NerState;
  lat: number;
  lon: number;
  elevationM: number;
  averageSlopeDeg: number;
  geologyType: string;
  historicalEventCount: number;
  population: number;
  deocContact: string; // District Emergency Operation Center contact
}

export interface WeatherTelemetry {
  currentRainfallMm: number;
  rainfall24hMm: number;
  rainfall72hMm: number;
  rainfallForecast24hMm: number;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmh: number;
  weatherCondition: string;
  lastUpdated: string;
}

export interface SoilTelemetry {
  soilMoisturePct: number; // 0 - 100% root-zone saturation
  soilSaturationStatus: 'Low' | 'Moderate' | 'Saturated' | 'Super-Saturated';
  surfaceWaterRunoffMm: number;
  lastUpdated: string;
}

export interface SeismicTelemetry {
  recentQuakes72hCount: number;
  maxMagnitude72h: number;
  nearestEpicenterKm: number;
  shakeIntensityFactor: number; // 0.0 to 1.0
  lastEventTimestamp?: string;
}

export interface RiskScoreBreakdown {
  compositeScore: number; // 0 to 100
  level: RiskLevel;
  slopeScore: number; // 0-100 raw
  rainfallScore: number; // 0-100 raw
  soilScore: number; // 0-100 raw
  seismicScore: number; // 0-100 raw
  historicalScore: number; // 0-100 raw
  
  weightedSlope: number; // weight 0.25
  weightedRainfall: number; // weight 0.30
  weightedSoil: number; // weight 0.20
  weightedSeismic: number; // weight 0.15
  weightedHistorical: number; // weight 0.10

  mlConfidencePct: number;
  dominantTrigger: string;
  advisoryEn: string;
  advisoryHi: string;
  calculatedAt: string;
}

export interface LandslideAlert {
  id: string;
  districtId: string;
  districtName: string;
  districtNameHi: string;
  state: NerState;
  level: RiskLevel;
  score: number;
  timestamp: string;
  headlineEn: string;
  headlineHi: string;
  detailsEn: string;
  detailsHi: string;
  recommendedActionsEn: string[];
  recommendedActionsHi: string[];
  active: boolean;
}

export interface HistoricalLandslideEvent {
  id: string;
  date: string;
  location: string;
  district: string;
  state: NerState;
  lat: number;
  lon: number;
  triggerType: 'Monsoon Rain' | 'Tropical Cyclone' | 'Earthquake' | 'Flash Flood' | 'Anthropogenic';
  fatalities: number;
  injuries: number;
  volumeM3?: number;
  source: 'NASA COOLR' | 'GSI' | 'SDMA';
  description: string;
}

export interface CitizenSafetyTip {
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: string;
}

export type AppViewMode = 'authority' | 'citizen';
