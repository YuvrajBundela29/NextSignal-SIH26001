/**
 * NextSignal Scenario Engine (Client-side)
 *
 * Generates Bull/Base/Bear scenarios for any entity by calling
 * the existing api/scenario/v1/ RPC endpoint and enriching with
 * current signal context.
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import { getRpcBaseUrl } from '@/services/rpc-client';

// ============================================================
// Scenario Output Schema
// ============================================================

export interface ScenarioCase {
  label: 'bull' | 'base' | 'bear';
  probability: number;       // 0-100 (estimated, sums to ~100)
  title: string;
  summary: string;
  keyDrivers: string[];
  catalysts: string[];
  risks: string[];
  invalidationConditions: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface ScenarioEvidence {
  id: string;
  type: string;
  title: string;
  source: string;
  timestamp: string;
  relevanceScore: number;
}

export interface WhatHappensNextResult {
  entity: string;
  entityType: 'asset' | 'sector' | 'country' | 'topic' | 'global';
  timeHorizon: string;
  currentState: string;
  importantSignals: string[];
  emergingRisks: string[];
  cases: {
    bull: ScenarioCase;
    base: ScenarioCase;
    bear: ScenarioCase;
  };
  potentialImpacts: string[];
  watchNext: string[];
  evidenceSources: ScenarioEvidence[];
  confidence: number;
  disclaimer: string;
  generatedAt: string;
  generatedBy: string;
}

// ============================================================
// Disclaimer (required on all AI output)
// ============================================================

const REQUIRED_DISCLAIMER =
  'These are probabilistic scenarios based on currently available signals, not guaranteed predictions. ' +
  'Confidence levels reflect data quality and signal convergence. ' +
  'All scenarios include invalidation conditions. Review evidence before making any decisions.';

// ============================================================
// Graceful Fallback (no API keys)
// ============================================================

function buildGracefulFallback(entity: string): WhatHappensNextResult {
  return {
    entity,
    entityType: 'topic',
    timeHorizon: '1-4 weeks',
    currentState: `Analysis of ${entity} requires live signal data and AI provider credentials.`,
    importantSignals: [
      'Signal Engine requires live data providers to detect active signals.',
      'Configure GROQ_API_KEY or OPENROUTER_API_KEY in .env.local to enable scenario generation.',
    ],
    emergingRisks: [
      'Scenario generation unavailable without AI provider credentials.',
    ],
    cases: {
      bull: {
        label: 'bull',
        probability: 33,
        title: 'Bull Case (Unavailable)',
        summary: 'Scenario generation requires AI provider credentials.',
        keyDrivers: ['AI provider not configured'],
        catalysts: [],
        risks: [],
        invalidationConditions: ['Configure GROQ_API_KEY or OPENROUTER_API_KEY'],
        confidence: 'low',
      },
      base: {
        label: 'base',
        probability: 34,
        title: 'Base Case (Unavailable)',
        summary: 'Configure AI providers in .env.local to enable scenario generation.',
        keyDrivers: ['AI provider not configured'],
        catalysts: [],
        risks: [],
        invalidationConditions: ['Configure GROQ_API_KEY or OPENROUTER_API_KEY'],
        confidence: 'low',
      },
      bear: {
        label: 'bear',
        probability: 33,
        title: 'Bear Case (Unavailable)',
        summary: 'Add GROQ_API_KEY or OPENROUTER_API_KEY to enable AI scenario generation.',
        keyDrivers: ['AI provider not configured'],
        catalysts: [],
        risks: [],
        invalidationConditions: ['Configure GROQ_API_KEY or OPENROUTER_API_KEY'],
        confidence: 'low',
      },
    },
    potentialImpacts: [],
    watchNext: ['Configure AI providers to enable full scenario analysis'],
    evidenceSources: [],
    confidence: 0,
    disclaimer: REQUIRED_DISCLAIMER,
    generatedAt: new Date().toISOString(),
    generatedBy: 'nextsignal-fallback',
  };
}

// ============================================================
// Entity Type Detection
// ============================================================

const KNOWN_ASSET_TICKERS = new Set([
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX',
  'SPY', 'QQQ', 'GLD', 'SLV', 'USO', 'UNG', 'TLT', 'VNQ',
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX',
]);

const KNOWN_COMMODITIES = new Set(['gold', 'silver', 'oil', 'copper', 'wheat', 'corn', 'natural gas', 'platinum', 'palladium']);

const KNOWN_COUNTRIES: Record<string, string> = {
  'china': 'CN', 'usa': 'US', 'russia': 'RU', 'iran': 'IR', 'ukraine': 'UA',
  'israel': 'IL', 'india': 'IN', 'japan': 'JP', 'germany': 'DE', 'uk': 'GB',
  'france': 'FR', 'brazil': 'BR', 'taiwan': 'TW', 'south korea': 'KR',
};

function detectEntityType(query: string): WhatHappensNextResult['entityType'] {
  const q = query.toUpperCase().trim();
  if (KNOWN_ASSET_TICKERS.has(q)) return 'asset';

  const qLower = query.toLowerCase().trim();
  if (KNOWN_COMMODITIES.has(qLower)) return 'asset';
  if (Object.keys(KNOWN_COUNTRIES).includes(qLower)) return 'country';
  if (qLower.includes('sector') || qLower.includes('industry') || qLower.includes('market')) return 'sector';
  if (qLower === 'global' || qLower === 'world') return 'global';
  return 'topic';
}

// ============================================================
// Scenario API Call
// ============================================================

async function callScenarioApi(entity: string, entityType: string): Promise<WhatHappensNextResult | null> {
  const baseUrl = getRpcBaseUrl();

  try {
    // Try the existing scenario RPC endpoint
    const response = await fetch(`${baseUrl}/worldmonitor.scenario.v1.ScenarioService/RunScenario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenarioId: 'nextsignal.what-happens-next',
        parameters: {
          entity,
          entityType,
          outputFormat: 'nextsignal-bull-base-bear',
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const raw = await response.json() as Record<string, unknown>;

    // Parse the scenario response into our schema
    // The actual API response format depends on the backend implementation
    // For now, return null to trigger the graceful fallback
    if (!raw || typeof raw !== 'object') return null;
    return null; // TODO: parse when API integration is confirmed
  } catch {
    return null;
  }
}

// ============================================================
// Public: generateWhatHappensNext
// ============================================================

/**
 * Generate a "What Happens Next?" analysis for any entity.
 *
 * Falls back gracefully if AI providers are not configured.
 */
export async function generateWhatHappensNext(
  query: string,
): Promise<WhatHappensNextResult> {
  const entityType = detectEntityType(query);

  // Try the scenario API first
  const apiResult = await callScenarioApi(query, entityType);
  if (apiResult) {
    return { ...apiResult, disclaimer: REQUIRED_DISCLAIMER };
  }

  // Return graceful fallback (always explainable, never silently wrong)
  return buildGracefulFallback(query);
}

/**
 * Get probability normalization for display
 * Ensures bull + base + bear = 100
 */
export function normalizeProbabilities(
  raw: { bull: number; base: number; bear: number },
): { bull: number; base: number; bear: number } {
  const total = raw.bull + raw.base + raw.bear;
  if (total === 0) return { bull: 33, base: 34, bear: 33 };
  const bull = Math.round((raw.bull / total) * 100);
  const bear = Math.round((raw.bear / total) * 100);
  const base = 100 - bull - bear;
  return { bull, base, bear };
}
