/**
 * NextSignal Watchlist & Entity Tracking Engine
 *
 * Manages user watchlists across assets, countries, sectors, and themes.
 * Enriches every tracked entity with:
 * - Current Scenario Probability distribution (Bull / Base / Bear)
 * - 24h Probability Delta (e.g. Bear probability +12%)
 * - Active Signal Count & Highest Signal Strength
 * - Risk Classification (Low, Medium, High, Critical)
 * - Sentiment Direction
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

export type WatchlistEntityType = 'asset' | 'country' | 'sector' | 'topic';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface WatchlistEntity {
  id: string;
  symbolOrCode: string;
  name: string;
  type: WatchlistEntityType;
  currentPriceOrScore?: string;
  change24h?: string;
  scenarioProbabilities: {
    bull: number;
    base: number;
    bear: number;
  };
  probabilityDelta24h: {
    label: 'bull' | 'base' | 'bear';
    delta: number; // e.g. +15 or -10
  };
  activeSignalCount: number;
  highestSignalStrength: 'weak' | 'moderate' | 'strong' | 'critical';
  riskLevel: RiskLevel;
  lastUpdated: string;
  keyCatalyst?: string;
}

const STORAGE_KEY = 'nextsignal_watchlist_items';

const DEFAULT_WATCHLIST: WatchlistEntity[] = [
  {
    id: 'nvda',
    symbolOrCode: 'NVDA',
    name: 'NVIDIA Corp',
    type: 'asset',
    currentPriceOrScore: '$128.50',
    change24h: '+3.2%',
    scenarioProbabilities: { bull: 55, base: 30, bear: 15 },
    probabilityDelta24h: { label: 'bull', delta: 5 },
    activeSignalCount: 8,
    highestSignalStrength: 'strong',
    riskLevel: 'medium',
    lastUpdated: new Date().toISOString(),
    keyCatalyst: 'Next-gen Blackwell datacenter shipping schedules & export regulatory revisions',
  },
  {
    id: 'oil_brent',
    symbolOrCode: 'BRENT',
    name: 'Brent Crude Oil',
    type: 'asset',
    currentPriceOrScore: '$82.40',
    change24h: '+1.8%',
    scenarioProbabilities: { bull: 40, base: 35, bear: 25 },
    probabilityDelta24h: { label: 'bear', delta: -4 },
    activeSignalCount: 14,
    highestSignalStrength: 'critical',
    riskLevel: 'high',
    lastUpdated: new Date().toISOString(),
    keyCatalyst: 'Middle East tanker corridor security & OPEC+ voluntary production quotas',
  },
  {
    id: 'gold',
    symbolOrCode: 'GOLD',
    name: 'Spot Gold / XAU',
    type: 'asset',
    currentPriceOrScore: '$2,410.00',
    change24h: '+0.7%',
    scenarioProbabilities: { bull: 60, base: 28, bear: 12 },
    probabilityDelta24h: { label: 'bull', delta: 8 },
    activeSignalCount: 6,
    highestSignalStrength: 'moderate',
    riskLevel: 'low',
    lastUpdated: new Date().toISOString(),
    keyCatalyst: 'Central bank sovereign reserve allocation & real yield expectations',
  },
  {
    id: 'taiwan',
    symbolOrCode: 'TW',
    name: 'Taiwan Strait',
    type: 'country',
    currentPriceOrScore: 'CII: 64.2',
    change24h: '+2.1 pts',
    scenarioProbabilities: { bull: 20, base: 55, bear: 25 },
    probabilityDelta24h: { label: 'bear', delta: 4 },
    activeSignalCount: 19,
    highestSignalStrength: 'strong',
    riskLevel: 'high',
    lastUpdated: new Date().toISOString(),
    keyCatalyst: 'Maritime gray-zone patrols and commercial vessel route diversions',
  },
  {
    id: 'sp500',
    symbolOrCode: 'SPX',
    name: 'S&P 500 Index',
    type: 'sector',
    currentPriceOrScore: '5,540.20',
    change24h: '+0.4%',
    scenarioProbabilities: { bull: 45, base: 40, bear: 15 },
    probabilityDelta24h: { label: 'base', delta: 2 },
    activeSignalCount: 11,
    highestSignalStrength: 'moderate',
    riskLevel: 'low',
    lastUpdated: new Date().toISOString(),
    keyCatalyst: 'FOMC interest rate trajectory & aggregate earnings yield breadth',
  },
];

export function getWatchlist(): WatchlistEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST));
      return DEFAULT_WATCHLIST;
    }
    return JSON.parse(raw) as WatchlistEntity[];
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function addToWatchlist(item: Omit<WatchlistEntity, 'id' | 'lastUpdated'>): WatchlistEntity[] {
  const list = getWatchlist();
  const newItem: WatchlistEntity = {
    ...item,
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lastUpdated: new Date().toISOString(),
  };
  list.unshift(newItem);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
  return list;
}

export function removeFromWatchlist(id: string): WatchlistEntity[] {
  const list = getWatchlist().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
  return list;
}
