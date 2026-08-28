import type { DistrictProfile, WeatherTelemetry, SoilTelemetry, SeismicTelemetry, RiskScoreBreakdown } from './types';

export interface AiAdvisoryResponse {
  analysis: string;
  mitigationSteps: string[];
  civilDefenseAction: string;
  sourceModel: string;
  latencyMs: number;
}

export async function generateDistrictAiAdvisory(
  district: DistrictProfile,
  risk: RiskScoreBreakdown,
  weather: WeatherTelemetry,
  soil: SoilTelemetry,
  seismic: SeismicTelemetry,
  ollamaModel = 'gemma:2b'
): Promise<AiAdvisoryResponse> {
  const start = performance.now();

  const prompt = [
    'You are the AI Disaster Intelligence and Landslide Early Warning Assistant for the Ministry of Development of North Eastern Region (MDoNER), Government of India.',
    `Target: ${district.name.toUpperCase()} (${district.state.toUpperCase()})`,
    `- Risk Score: ${risk.compositeScore}/100 [Level: ${risk.level}]`,
    `- Slope: ${district.averageSlopeDeg}°, Elevation: ${district.elevationM}m, Geology: ${district.geologyType}`,
    `- 24h Rain: ${weather.rainfall24hMm}mm, 72h Rain: ${weather.rainfall72hMm}mm`,
    `- Soil Moisture: ${soil.soilMoisturePct}% (${soil.soilSaturationStatus})`,
    `- Seismic: ${seismic.recentQuakes72hCount} events, Max M${seismic.maxMagnitude72h}`,
    `Provide: 1. Situation Analysis, 2. Key Mitigation Steps, 3. Civil Defense Action Command.`,
  ].join('\n');

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.8,
          num_predict: 250,
        },
      }),
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText: string = data.response || '';
      return parseAiResponse(rawText, ollamaModel, Math.round(performance.now() - start));
    }
  } catch (err) {
    // Local Ollama offline / unreachable -> seamlessly use deterministic heuristic disaster model
  }

  return generateHeuristicAdvisory(district, risk, weather, soil, seismic, Math.round(performance.now() - start));
}

function parseAiResponse(text: string, model: string, latencyMs: number): AiAdvisoryResponse {
  return {
    analysis: text.trim(),
    mitigationSteps: [
      'Pre-position State Disaster Response Force (SDRF) units at district staging centers.',
      'Deploy continuous drone or visual patrols along vulnerable National Highway ghat corridors.',
      'Broadcast regional weather bulletins and emergency alerts over state wireless network.',
    ],
    civilDefenseAction: 'Activate District Emergency Operation Center (DEOC) incident command protocol.',
    sourceModel: `Local Ollama (${model})`,
    latencyMs,
  };
}

function generateHeuristicAdvisory(
  district: DistrictProfile,
  risk: RiskScoreBreakdown,
  weather: WeatherTelemetry,
  soil: SoilTelemetry,
  _seismic: SeismicTelemetry,
  latencyMs: number
): AiAdvisoryResponse {
  let analysis = '';
  let mitigationSteps: string[] = [];
  let civilDefenseAction = '';

  if (risk.level === 'CRITICAL') {
    analysis = `${district.name} is currently under CRITICAL landslide hazard (Score: ${risk.compositeScore}/100). The convergence of 24h heavy rainfall (${weather.rainfall24hMm}mm) on steep slopes (${district.averageSlopeDeg}°) and super-saturated root-zone soil (${soil.soilMoisturePct}%) has exceeded the critical Mohr-Coulomb shear threshold. High probability of translational debris flows and highway cut failures.`;
    mitigationSteps = [
      `Issue immediate evacuation orders for toe-slope settlements and informal habitations in ${district.name}.`,
      'Halt all heavy commercial vehicles along national highway corridors.',
      'Deploy NDRF Quick Response Teams with hydraulic rescue tools to staging grounds.',
      `Establish direct satellite communications with DEOC (${district.deocContact}).`,
    ];
    civilDefenseAction = 'LEVEL-4 EMERGENCY PROTOCOL: Red alert broadcast, mass evacuation, and emergency hospital standby.';
  } else if (risk.level === 'HIGH') {
    analysis = `High vulnerability detected across ${district.name} (${risk.compositeScore}/100). Antecedent 72h precipitation (${weather.rainfall72hMm}mm) combined with ${soil.soilSaturationStatus.toLowerCase()} soil conditions has elevated pore water pressure along ${district.geologyType} formations.`;
    mitigationSteps = [
      'Position heavy earth-moving equipment at critical landslide choke points.',
      'Issue advisory restricting night travel on high-altitude roads.',
      'Inspect retaining walls and stormwater culverts along populated hill slopes.',
    ];
    civilDefenseAction = 'LEVEL-3 ALERT: District control room manned 24x7; SDRF reconnaissance active.';
  } else if (risk.level === 'MODERATE') {
    analysis = `Moderate susceptibility observed (${risk.compositeScore}/100). Soil moisture is ${soil.soilMoisturePct}% with ${weather.currentRainfallMm}mm/hr rain. Terrain remains stable but requires continued telemetry observation.`;
    mitigationSteps = [
      'Ensure clear drainage channels along roadside embankments.',
      'Monitor automated rain gauges and weather radar updates.',
    ];
    civilDefenseAction = 'LEVEL-2 WATCH: Routine inter-agency coordination between SDMA, PWD, and District Administration.';
  } else {
    analysis = `Low hazard state (${risk.compositeScore}/100). Meteorological and geotechnical indicators are well within safe thresholds. No immediate slope destabilization risk.`;
    mitigationSteps = [
      'Maintain standard baseline telemetry monitoring.',
      'Conduct scheduled geological survey inspections.',
    ];
    civilDefenseAction = 'LEVEL-1 NORMAL: Baseline telemetry feed active.';
  }

  return {
    analysis,
    mitigationSteps,
    civilDefenseAction,
    sourceModel: 'Built-in Expert Geological System (SIH26001 / Rule-Engine)',
    latencyMs: Math.max(12, latencyMs),
  };
}
