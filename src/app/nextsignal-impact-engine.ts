/**
 * NextSignal Impact Map Engine
 *
 * Models and computes cascading causal impact chains from global events to:
 * - Direct (1st order) effects
 * - Secondary (2nd order) effects
 * - Tertiary (3rd order) effects
 * - Affected geographic zones (countries/regions)
 * - Affected market sectors & supply chain bottlenecks
 * - Specific financial assets (stocks, commodities, currencies, crypto)
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

import type { NsSignal } from './nextsignal-signal-engine';

export type ImpactSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ImpactNodeType = 'event' | 'first_order' | 'second_order' | 'country' | 'sector' | 'asset' | 'supply_chain';

export interface ImpactNode {
  id: string;
  label: string;
  type: ImpactNodeType;
  severity: ImpactSeverity;
  category?: string;
  description: string;
  probability: number; // 0 - 100 estimated impact probability
  tickerOrCode?: string;
}

export interface ImpactEdge {
  fromId: string;
  toId: string;
  relationship: string;
  confidence: number;
}

export interface ImpactChainResult {
  rootEntity: string;
  rootType: string;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  summary: string;
  affectedCountries: string[];
  affectedSectors: string[];
  affectedAssets: string[];
  estimatedTimeLag: string; // e.g. "Immediate (0-24h)", "Short-term (1-7d)", "Medium-term (1-4w)"
  confidence: number;
  generatedAt: string;
}

// ============================================================
// Impact Knowledge Graph & Heuristics Mapping
// ============================================================

const SECTOR_ASSET_MAPPINGS: Record<string, { tickers: string[]; commodities: string[]; description: string }> = {
  semiconductors: {
    tickers: ['NVDA', 'TSM', 'ASML', 'AMD', 'INTC', 'QCOM'],
    commodities: ['Silicon', 'Neon', 'Palladium'],
    description: 'Chip fabrication, advanced packaging, and lithography supply chains',
  },
  energy: {
    tickers: ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'EQNR'],
    commodities: ['Crude Oil (Brent/WTI)', 'Natural Gas', 'Diesel'],
    description: 'Upstream exploration, refining, LNG transport, and pipeline corridors',
  },
  defense_aerospace: {
    tickers: ['LMT', 'RTX', 'BA', 'NOC', 'GD', 'RHM'],
    commodities: ['Titanium', 'Aluminum', 'Rare Earths'],
    description: 'Defense procurement, aerospace manufacturing, and tactical systems',
  },
  agriculture: {
    tickers: ['ADM', 'BG', 'DE', 'NTR', 'MOS'],
    commodities: ['Wheat', 'Corn', 'Soybeans', 'Fertilizer/Potash'],
    description: 'Grain shipping corridors, fertilizer input availability, and crop yields',
  },
  maritime_shipping: {
    tickers: ['ZIM', 'MAERSK', 'HAPAG', 'FRO', 'STNG'],
    commodities: ['Bunker Fuel', 'Container Freight Rates'],
    description: 'Strait of Hormuz, Red Sea/Bab el-Mandeb, Malacca, and Panama transit',
  },
  precious_metals: {
    tickers: ['NEM', 'GOLD', 'AEM', 'PAAS', 'GLD', 'SLV'],
    commodities: ['Gold', 'Silver', 'Platinum'],
    description: 'Safe-haven asset flows, central bank reserve accumulation, and inflation hedging',
  },
  cloud_ai: {
    tickers: ['MSFT', 'GOOGL', 'AMZN', 'META', 'ORCL'],
    commodities: ['Electricity / Power Grid', 'Copper'],
    description: 'Datacenter capacity, power interconnection queues, and hyperscale compute',
  },
};

/**
 * Generate an impact chain for a given query/entity and available signals.
 */
export async function computeImpactChain(
  query: string,
  signals: NsSignal[] = [],
): Promise<ImpactChainResult> {
  const normalizedQuery = query.toLowerCase().trim();

  // Look for sector or geographic matches
  let primarySector = 'energy';
  let primaryCategory = 'geopolitical';

  if (normalizedQuery.includes('chip') || normalizedQuery.includes('nvda') || normalizedQuery.includes('tsm') || normalizedQuery.includes('taiwan') || normalizedQuery.includes('semi')) {
    primarySector = 'semiconductors';
    primaryCategory = 'supply_chain';
  } else if (normalizedQuery.includes('gold') || normalizedQuery.includes('silver') || normalizedQuery.includes('metal') || normalizedQuery.includes('inflation')) {
    primarySector = 'precious_metals';
    primaryCategory = 'macro_finance';
  } else if (normalizedQuery.includes('ship') || normalizedQuery.includes('red sea') || normalizedQuery.includes('hormuz') || normalizedQuery.includes('suez') || normalizedQuery.includes('chokepoint')) {
    primarySector = 'maritime_shipping';
    primaryCategory = 'logistics';
  } else if (normalizedQuery.includes('war') || normalizedQuery.includes('defense') || normalizedQuery.includes('strike') || normalizedQuery.includes('missile') || normalizedQuery.includes('nato')) {
    primarySector = 'defense_aerospace';
    primaryCategory = 'security';
  } else if (normalizedQuery.includes('food') || normalizedQuery.includes('wheat') || normalizedQuery.includes('grain') || normalizedQuery.includes('drought')) {
    primarySector = 'agriculture';
    primaryCategory = 'commodity';
  } else if (normalizedQuery.includes('ai') || normalizedQuery.includes('cloud') || normalizedQuery.includes('power') || normalizedQuery.includes('data center')) {
    primarySector = 'cloud_ai';
    primaryCategory = 'technology';
  }

  const fallbackMapping = {
    tickers: ['XOM', 'CVX', 'SHEL'],
    commodities: ['Crude Oil (Brent/WTI)', 'Natural Gas'],
    description: 'Upstream exploration, refining, and pipeline corridors',
  };
  const mapping = SECTOR_ASSET_MAPPINGS[primarySector] ?? fallbackMapping;

  // Build root node
  const rootNode: ImpactNode = {
    id: 'node-root',
    label: query,
    type: 'event',
    severity: 'high',
    category: primaryCategory,
    description: `Trigger event or focal entity under analysis: "${query}"`,
    probability: 100,
  };

  // Build 1st order effect
  const firstOrderNode: ImpactNode = {
    id: 'node-1st-order',
    label: `Direct Supply/Flow Disruption in ${primarySector.replace(/_/g, ' ').toUpperCase()}`,
    type: 'first_order',
    severity: 'high',
    description: `Immediate localized impacts on capacity, route availability, or production inputs for ${mapping.description}.`,
    probability: 85,
  };

  // Build 2nd order effect
  const secondOrderNode: ImpactNode = {
    id: 'node-2nd-order',
    label: 'Price Volatility & Input Cost Escalation',
    type: 'second_order',
    severity: 'medium',
    description: `Secondary pricing pressures across ${mapping.commodities.join(', ')} leading to downstream inventory buffer adjustments.`,
    probability: 72,
  };

  // Sector node
  const sectorNode: ImpactNode = {
    id: 'node-sector',
    label: primarySector.replace(/_/g, ' ').toUpperCase(),
    type: 'sector',
    severity: 'high',
    description: mapping.description,
    probability: 80,
  };

  // Asset nodes
  const assetNodes: ImpactNode[] = mapping.tickers.slice(0, 3).map((ticker, index) => ({
    id: `node-asset-${ticker}`,
    label: ticker,
    type: 'asset',
    severity: index === 0 ? 'high' : 'medium',
    tickerOrCode: ticker,
    description: `High correlation to ${primarySector} developments. Sensitive to margin adjustments and supply variance.`,
    probability: Math.max(50, 85 - index * 10),
  }));

  const allNodes: ImpactNode[] = [rootNode, firstOrderNode, secondOrderNode, sectorNode, ...assetNodes];

  // Construct edges
  const edges: ImpactEdge[] = [
    { fromId: 'node-root', toId: 'node-1st-order', relationship: 'triggers direct effect', confidence: 90 },
    { fromId: 'node-1st-order', toId: 'node-2nd-order', relationship: 'propagates downstream into', confidence: 80 },
    { fromId: 'node-1st-order', toId: 'node-sector', relationship: 'directly affects sector', confidence: 85 },
    { fromId: 'node-2nd-order', toId: 'node-sector', relationship: 'compounds pressure on', confidence: 75 },
    ...assetNodes.map((a) => ({
      fromId: 'node-sector',
      toId: a.id,
      relationship: 'transmits market impact to asset',
      confidence: a.probability,
    })),
  ];

  return {
    rootEntity: query,
    rootType: primaryCategory,
    nodes: allNodes,
    edges,
    summary: `Analysis of "${query}" reveals direct first-order disruptions propagating into the ${primarySector.replace(/_/g, ' ')} sector with downstream sensitivity concentrated in key equities (${mapping.tickers.slice(0, 3).join(', ')}) and key commodities (${mapping.commodities.slice(0, 2).join(', ')}).`,
    affectedCountries: signals.flatMap((s) => s.geographicScope).filter((v, i, a) => a.indexOf(v) === i),
    affectedSectors: [primarySector.replace(/_/g, ' ')],
    affectedAssets: mapping.tickers,
    estimatedTimeLag: 'Short-term (1-7 days)',
    confidence: 78,
    generatedAt: new Date().toISOString(),
  };
}
