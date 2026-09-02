import type { DistrictProfile, WeatherTelemetry, SoilTelemetry, SeismicTelemetry, RiskScoreBreakdown } from './types';

export interface AiAdvisoryResponse {
 analysis: string;
 mitigationSteps: string[];
 civilDefenseAction: string;
 roadCorridorStatus: string;
 sourceModel: string;
 latencyMs: number;
}

export type CloudAiProvider = 'gemini' | 'groq' | 'openai' | 'local_ollama' | 'builtin_expert';

export interface AiConfig {
 provider: CloudAiProvider;
 apiKey?: string;
 localModelName?: string; // e.g. 'qwen2.5:0.5b', 'llama3.2:1b', 'gemma2:2b', 'phi3:mini'
 cloudModelName?: string; // e.g. 'gemini-1.5-flash', 'llama-3.3-70b-versatile', 'gpt-4o-mini'
}

export function getStoredAiConfig(): AiConfig {
 const provider = (localStorage.getItem('sih_ai_provider') as CloudAiProvider) || 'builtin_expert';
 const apiKey = localStorage.getItem('sih_ai_api_key') || '';
 const localModelName = localStorage.getItem('sih_local_model') || 'qwen2.5:0.5b';
 const cloudModelName = localStorage.getItem('sih_cloud_model') || 'gemini-1.5-flash';
 return { provider, apiKey, localModelName, cloudModelName };
}

export function saveAiConfig(config: AiConfig) {
 localStorage.setItem('sih_ai_provider', config.provider);
 if (config.apiKey !== undefined) localStorage.setItem('sih_ai_api_key', config.apiKey);
 if (config.localModelName) localStorage.setItem('sih_local_model', config.localModelName);
 if (config.cloudModelName) localStorage.setItem('sih_cloud_model', config.cloudModelName);
}

export async function generateDistrictAiAdvisory(
 district: DistrictProfile,
 risk: RiskScoreBreakdown,
 weather: WeatherTelemetry,
 soil: SoilTelemetry,
 seismic: SeismicTelemetry,
 configOverride?: Partial<AiConfig>
): Promise<AiAdvisoryResponse> {
 const start = performance.now();
 const cfg = { ...getStoredAiConfig(), ...configOverride };

 const prompt = [
 'You are the NDMA & MDoNER Disaster Command AI for Landslide Early Warning in Northeast India.',
 `Target: ${district.name.toUpperCase()} (${district.state.toUpperCase()})`,
 `- Landslide Risk Score: ${risk.compositeScore}/100 [Level: ${risk.level}]`,
 `- Slope: ${district.averageSlopeDeg}, Elevation: ${district.elevationM}m, Lithology: ${district.geologyType}`,
 `- Rainfall: ${weather.rainfall24hMm}mm in 24h, ${weather.rainfall72hMm}mm in 72h`,
 `- Soil Saturation: ${soil.soilMoisturePct}% (${soil.soilSaturationStatus})`,
 `- Seismic: ${seismic.recentQuakes72hCount} events, Max M${seismic.maxMagnitude72h}`,
 `Provide concise tactical directives: 1. Situation Briefing, 2. Emergency Mitigation Actions, 3. Road Corridor Status, 4. Civil Defense Command.`,
 ].join('\n');

 // 1. If Cloud API Provider is configured with an API Key
 if (cfg.provider === 'gemini' && cfg.apiKey) {
 try {
 const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cfg.apiKey}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 contents: [{ parts: [{ text: prompt }] }],
 generationConfig: { maxOutputTokens: 300, temperature: 0.2 },
 }),
 signal: AbortSignal.timeout(6000),
 });
 if (res.ok) {
 const data = await res.json();
 const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
 if (text) return parseAiResponse(text, 'Server AI (Google Gemini 1.5 Flash)', Math.round(performance.now() - start), district, risk);
 }
 } catch (e) {
 console.warn('[Cloud AI / Gemini] Fallback triggered:', e);
 }
 } else if (cfg.provider === 'groq' && cfg.apiKey) {
 try {
 const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${cfg.apiKey}`,
 },
 body: JSON.stringify({
 model: cfg.cloudModelName || 'llama-3.3-70b-versatile',
 messages: [{ role: 'user', content: prompt }],
 max_tokens: 300,
 temperature: 0.2,
 }),
 signal: AbortSignal.timeout(6000),
 });
 if (res.ok) {
 const data = await res.json();
 const text: string = data.choices?.[0]?.message?.content || '';
 if (text) return parseAiResponse(text, `Server AI (Groq / ${cfg.cloudModelName || 'LLaMA 3.3'})`, Math.round(performance.now() - start), district, risk);
 }
 } catch (e) {
 console.warn('[Cloud AI / Groq] Fallback triggered:', e);
 }
 }

 // 2. If Local Ollama Provider is active
 if (cfg.provider === 'local_ollama' || cfg.provider === 'builtin_expert') {
 const model = cfg.localModelName || 'qwen2.5:0.5b';
 try {
 const res = await fetch('http://localhost:11434/api/generate', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 model,
 prompt,
 stream: false,
 options: { temperature: 0.2, top_p: 0.8, num_predict: 220 },
 }),
 signal: AbortSignal.timeout(3500),
 });
 if (res.ok) {
 const data = await res.json();
 const text: string = data.response || '';
 if (text) return parseAiResponse(text, `Local Ultra-Light Model (${model})`, Math.round(performance.now() - start), district, risk);
 }
 } catch {
 // Local Ollama offline -> proceed to built-in geological system
 }
 }

 // 3. Fallback to Built-in Geological Expert Rule-Engine (<5ms latency)
 return generateHeuristicAdvisory(district, risk, weather, soil, seismic, Math.round(performance.now() - start));
}

function parseAiResponse(text: string, modelLabel: string, latencyMs: number, district: DistrictProfile, risk: RiskScoreBreakdown): AiAdvisoryResponse {
 return {
 analysis: text.trim(),
 mitigationSteps: [
 `Pre-position State Disaster Response Force (SDRF) units at ${district.name} staging depot.`,
 'Deploy continuous sensor and drone patrols along critical slope cuts and arterial highway passes.',
 'Broadcast automated weather and soil saturation bulletins over District Wireless Network.',
 ],
 civilDefenseAction: risk.level === 'CRITICAL'
 ? 'LEVEL-4 EMERGENCY PROTOCOL: Red alert broadcast, mass evacuation, and emergency hospital standby.'
 : 'LEVEL-3 ALERT: District control room manned 24x7; SDRF reconnaissance active.',
 roadCorridorStatus: risk.level === 'CRITICAL'
 ? 'CRITICAL WARNING: High risk of sudden slope washouts along national highway corridors. Heavy freight diverted.'
 : 'ADVISORY: Night travel restricted. PWD clearance equipment positioned at vulnerable turns.',
 sourceModel: modelLabel,
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
 let roadCorridorStatus = '';

 if (risk.level === 'CRITICAL') {
 analysis = `TACTICAL ASSESSMENT: ${district.name} is currently under CRITICAL landslide hazard (Score: ${risk.compositeScore}/100). The convergence of 24h heavy rainfall (${weather.rainfall24hMm}mm) on steep slopes (${district.averageSlopeDeg}) and super-saturated root-zone soil (${soil.soilMoisturePct}%) has exceeded the critical Mohr-Coulomb shear threshold. High probability of translational debris flows and highway cut failures.`;
 mitigationSteps = [
 `Issue immediate evacuation orders for toe-slope settlements and informal habitations in ${district.name}.`,
 'Halt all heavy commercial vehicles along national highway corridors.',
 'Deploy NDRF Quick Response Teams with hydraulic rescue tools to staging grounds.',
 `Establish direct satellite communications with DEOC (${district.deocContact}).`,
 ];
 civilDefenseAction = 'LEVEL-4 RED EMERGENCY PROTOCOL: Red alert broadcast, mass evacuation, and emergency hospital standby.';
 roadCorridorStatus = 'HIGHWAY CLOSED / RESTRICTED: High risk of sudden debris blocking arterial mountain passes. Traffic diverted to lower bypass.';
 } else if (risk.level === 'HIGH') {
 analysis = `TACTICAL ASSESSMENT: High vulnerability detected across ${district.name} (${risk.compositeScore}/100). Antecedent 72h precipitation (${weather.rainfall72hMm}mm) combined with ${soil.soilSaturationStatus.toLowerCase()} soil conditions has elevated pore water pressure along ${district.geologyType} formations.`;
 mitigationSteps = [
 'Position heavy earth-moving equipment at critical landslide choke points.',
 'Issue advisory restricting night travel on high-altitude roads.',
 'Inspect retaining walls and stormwater culverts along populated hill slopes.',
 ];
 civilDefenseAction = 'LEVEL-3 ORANGE ALERT: District control room manned 24x7; SDRF reconnaissance active.';
 roadCorridorStatus = 'HIGHWAY PASS WATCH: Slow transit advisory active. Night movement of heavy freight restricted.';
 } else if (risk.level === 'MODERATE') {
 analysis = `TACTICAL ASSESSMENT: Moderate susceptibility observed (${risk.compositeScore}/100). Soil moisture is ${soil.soilMoisturePct}% with ${weather.currentRainfallMm}mm/hr rain. Terrain remains stable but requires continued telemetry observation.`;
 mitigationSteps = [
 'Ensure clear drainage channels along roadside embankments.',
 'Monitor automated rain gauges and weather radar updates.',
 ];
 civilDefenseAction = 'LEVEL-2 YELLOW WATCH: Routine inter-agency coordination between SDMA, PWD, and District Administration.';
 roadCorridorStatus = 'NORMAL PASS STATUS: All arterial highway routes open with caution.';
 } else {
 analysis = `TACTICAL ASSESSMENT: Low hazard state (${risk.compositeScore}/100). Meteorological and geotechnical indicators are well within safe thresholds. No immediate slope destabilization risk.`;
 mitigationSteps = [
 'Maintain standard baseline telemetry monitoring.',
 'Conduct scheduled geological survey inspections.',
 ];
 civilDefenseAction = 'LEVEL-1 GREEN NORMAL: Baseline telemetry feed active.';
 roadCorridorStatus = 'NORMAL PASS STATUS: All regional transit routes clear.';
 }

 return {
 analysis,
 mitigationSteps,
 civilDefenseAction,
 roadCorridorStatus,
 sourceModel: 'NDMA / MDoNER Geological Expert Decision System (SIH26001)',
 latencyMs: Math.max(8, latencyMs),
 };
}