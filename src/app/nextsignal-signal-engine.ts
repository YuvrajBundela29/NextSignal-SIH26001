/**
 * NextSignal Signal Engine
 *
 * Converts raw World Monitor events into structured, actionable signals.
 * Wraps the existing signal-aggregator.ts with NextSignal signal schema.
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import type { SignalSummary, GeoSignal } from '@/services/signal-aggregator';

// ============================================================
// NextSignal Signal Schema
// ============================================================

export type SignalType =
  | 'geopolitical_risk'
  | 'supply_disruption'
  | 'market_divergence'
  | 'economic_stress'
  | 'regulatory_change'
  | 'military_escalation'
  | 'infrastructure_threat'
  | 'technology_disruption'
  | 'climate_event'
  | 'sentiment_shift'
  | 'internet_outage'
  | 'ais_disruption'
  | 'radiation_anomaly'
  | 'sanctions_pressure';

export type SignalDirection = 'bullish' | 'bearish' | 'neutral' | 'risk';
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'critical';

export interface NsSignal {
  id: string;
  type: SignalType;
  direction: SignalDirection;
  strength: SignalStrength;
  confidence: number;  // 0-100
  title: string;
  summary: string;
  detectedAt: string;  // ISO 8601
  geographicScope: string[];
  affectedSectors: string[];
  affectedAssets: string[];
  relatedEventIds: string[];
  explainability: string;
}

export interface EvidenceSource {
  id: string;
  type: 'news' | 'market' | 'geopolitical' | 'economic' | 'signal';
  title: string;
  url?: string;
  source: string;
  timestamp: string;
  relevanceScore: number;
}

// ============================================================
// Signal Type Mapping (WM geo signal → NS signal type)
// ============================================================

function mapGeoSignalType(type: string): SignalType {
  switch (type) {
    case 'military_flight':
    case 'military_vessel':
    case 'active_strike':
      return 'military_escalation';
    case 'protest':
      return 'geopolitical_risk';
    case 'ais_disruption':
      return 'ais_disruption';
    case 'internet_outage':
      return 'internet_outage';
    case 'satellite_fire':
      return 'climate_event';
    case 'radiation_anomaly':
      return 'radiation_anomaly';
    case 'sanctions_pressure':
      return 'sanctions_pressure';
    case 'temporal_anomaly':
      return 'infrastructure_threat';
    default:
      return 'geopolitical_risk';
  }
}

function mapSeverityToStrength(severity: 'low' | 'medium' | 'high'): SignalStrength {
  switch (severity) {
    case 'low': return 'weak';
    case 'medium': return 'moderate';
    case 'high': return 'strong';
    default: return 'moderate';
  }
}

function mapSeverityToDirection(type: SignalType, severity: 'low' | 'medium' | 'high'): SignalDirection {
  const riskTypes: SignalType[] = ['geopolitical_risk', 'military_escalation', 'infrastructure_threat', 'radiation_anomaly'];
  const bearishTypes: SignalType[] = ['supply_disruption', 'ais_disruption', 'internet_outage', 'sanctions_pressure'];
  const climateTypes: SignalType[] = ['climate_event'];

  if (riskTypes.includes(type)) return 'risk';
  if (bearishTypes.includes(type)) return 'bearish';
  if (climateTypes.includes(type)) return severity === 'high' ? 'risk' : 'neutral';
  return 'neutral';
}

function geoSignalToNsSignal(geo: GeoSignal): NsSignal {
  const signalType = mapGeoSignalType(geo.type);
  const strength = mapSeverityToStrength(geo.severity);
  const direction = mapSeverityToDirection(signalType, geo.severity);

  return {
    id: `geo:${geo.type}:${geo.country}:${geo.timestamp.getTime()}`,
    type: signalType,
    direction,
    strength,
    confidence: strength === 'critical' ? 80 : strength === 'strong' ? 65 : strength === 'moderate' ? 50 : 35,
    title: geo.title,
    summary: `${geo.title} detected in ${geo.countryName}. Signal strength: ${strength}.`,
    detectedAt: geo.timestamp.toISOString(),
    geographicScope: [geo.country],
    affectedSectors: [],   // Enriched by future sector-attribution layer
    affectedAssets: [],    // Enriched by future asset-attribution layer
    relatedEventIds: [],
    explainability: `This ${signalType.replace(/_/g, ' ')} signal was detected in ${geo.countryName} with ${geo.severity} severity. Geographic signal aggregation identified this as a structured signal.`,
  };
}

// ============================================================
// Public API
// ============================================================

let _cachedSignals: NsSignal[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get the latest structured signals from the Signal Engine.
 * Sources from the existing World Monitor signal aggregator.
 */
export async function getLatestSignals(limit = 50): Promise<NsSignal[]> {
  // Use cached signals if fresh
  if (_cachedSignals && Date.now() - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedSignals.slice(0, limit);
  }

  try {
    // Try to get signals from the existing WM signal aggregator
    // This is a best-effort pull — the aggregator may not have data in dev without API keys
    const { buildSignalSummary } = (await import('@/services/signal-aggregator')) as unknown as {
      buildSignalSummary: (opts: {
        internetOutages: unknown[];
        militaryFlights: unknown[];
        militaryVessels: unknown[];
        socialUnrestEvents: unknown[];
        aisDisruptions: unknown[];
        sanctionsPressure: unknown[];
        radiationObservations: unknown[];
        currentTime: Date;
      }) => SignalSummary;
    };

    // Build a signal summary from empty data (graceful degradation)
    const summary = buildSignalSummary({
      internetOutages: [],
      militaryFlights: [],
      militaryVessels: [],
      socialUnrestEvents: [],
      aisDisruptions: [],
      sanctionsPressure: [],
      radiationObservations: [],
      currentTime: new Date(),
    });

    // Convert top signals from the summary's convergence zones
    const nsSignals: NsSignal[] = summary.topCountries
      .flatMap((cluster) => cluster.signals)
      .slice(0, limit)
      .map(geoSignalToNsSignal);

    _cachedSignals = nsSignals;
    _cacheTimestamp = Date.now();
    return nsSignals;
  } catch {
    // Signal aggregator not available in this context
    return [];
  }
}

/**
 * Clear the signal cache (force refresh on next call)
 */
export function invalidateSignalCache(): void {
  _cachedSignals = null;
  _cacheTimestamp = 0;
}

/**
 * Get signals filtered by type
 */
export async function getSignalsByType(type: SignalType, limit = 20): Promise<NsSignal[]> {
  const all = await getLatestSignals(200);
  return all.filter((s) => s.type === type).slice(0, limit);
}

/**
 * Get signals filtered by geographic scope
 */
export async function getSignalsByCountry(countryCode: string, limit = 20): Promise<NsSignal[]> {
  const all = await getLatestSignals(200);
  return all.filter((s) => s.geographicScope.includes(countryCode)).slice(0, limit);
}

/**
 * Get the top N highest-strength signals
 */
export async function getTopSignals(limit = 5): Promise<NsSignal[]> {
  const all = await getLatestSignals(200);
  const strengthOrder: Record<SignalStrength, number> = { critical: 4, strong: 3, moderate: 2, weak: 1 };
  return all
    .sort((a, b) => (strengthOrder[b.strength] - strengthOrder[a.strength]) || (b.confidence - a.confidence))
    .slice(0, limit);
}
