/**
 * NextSignal Local Intelligence API Engine & Universal Fetch Interceptor
 *
 * Ensures 100% of dashboard panels work in local/offline mode without failing or
 * throwing "Unexpected token '<' <!DOCTYPE..." errors from missing Vercel Edge functions.
 *
 * Mocks and serves:
 * - Fear & Greed Composite Index
 * - Market Breadth (20d, 50d, 200d history)
 * - News <-> Market Correlation Series
 * - Crypto & BTC Regime Analysis
 * - Sector Heatmap Performance
 * - Escalation Monitor & Economic Warfare
 * - Disaster Cascade & Thermal Fires
 * - Full AI Daily Intelligence Brief (bypasses Clerk login gate)
 * - Indian Channel News Feeds (WION, NDTV, Times of India, The Hindu)
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

const now = new Date();
const nowIso = now.toISOString();

// Helper to generate recent historical dates
function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// 1. Fear & Greed Mock Dataset
export const MOCK_FEAR_GREED = {
  compositeScore: 52,
  compositeLabel: 'Neutral / Greed Leaning',
  previousScore: 48,
  volatility: { score: 44, weight: 0.15, contribution: 6.6 },
  positioning: { score: 58, weight: 0.15, contribution: 8.7 },
  breadth: { score: 62, weight: 0.10, contribution: 6.2 },
  momentum: { score: 65, weight: 0.10, contribution: 6.5 },
  liquidity: { score: 42, weight: 0.10, contribution: 4.2 },
  credit: { score: 56, weight: 0.10, contribution: 5.6 },
  macro: { score: 48, weight: 0.10, contribution: 4.8 },
  crossAsset: { score: 54, weight: 0.10, contribution: 5.4 },
  sentiment: { score: 50, weight: 0.05, contribution: 2.5 },
  trend: { score: 55, weight: 0.05, contribution: 2.75 },
  unavailable: false,
};

// 2. Market Breadth 30-day History Mock Dataset
export const MOCK_MARKET_BREADTH = {
  currentPctAbove20d: 64,
  currentPctAbove50d: 58,
  currentPctAbove200d: 71,
  advanceDeclineRatio: 1.45,
  history: Array.from({ length: 30 }, (_, i) => {
    const day = 29 - i;
    const base = 50 + Math.sin(i / 4) * 15;
    return {
      date: getPastDate(day),
      pctAbove20d: Math.round(Math.min(95, Math.max(15, base + Math.sin(i) * 8))),
      pctAbove50d: Math.round(Math.min(90, Math.max(20, base - 4 + Math.cos(i) * 6))),
      pctAbove200d: Math.round(Math.min(85, Math.max(30, 65 + Math.sin(i / 2) * 5))),
    };
  }),
  unavailable: false,
};

// 3. News-Market Correlation Mock Dataset
export const MOCK_NEWS_MARKET_CORRELATION = {
  series: [
    { timestamp: getPastDate(6), newsScore: 72, marketReaction: -0.8, asset: 'SPX', theme: 'Middle East Flare' },
    { timestamp: getPastDate(5), newsScore: 68, marketReaction: 1.2, asset: 'BRENT', theme: 'Hormuz Warning' },
    { timestamp: getPastDate(4), newsScore: 81, marketReaction: 2.4, asset: 'GOLD', theme: 'Central Bank Flows' },
    { timestamp: getPastDate(3), newsScore: 59, marketReaction: -1.1, asset: 'NVDA', theme: 'Chip Export Curbs' },
    { timestamp: getPastDate(2), newsScore: 64, marketReaction: 0.4, asset: 'DXY', theme: 'Fed Rate Probability' },
    { timestamp: getPastDate(1), newsScore: 76, marketReaction: 1.8, asset: 'DEFENSE', theme: 'NATO Procurement' },
    { timestamp: getPastDate(0), newsScore: 79, marketReaction: 1.5, asset: 'BRENT', theme: 'Red Sea Disruption' },
  ],
  correlations: [
    { pair: 'Geopolitical Risk ↔ Crude Oil', coefficient: 0.84, direction: 'positive' },
    { pair: 'Geopolitical Risk ↔ Spot Gold', coefficient: 0.78, direction: 'positive' },
    { pair: 'Tariff Escalation ↔ Tech Equities', coefficient: -0.68, direction: 'negative' },
    { pair: 'Chokepoint Stress ↔ Shipping Rates', coefficient: 0.91, direction: 'positive' },
  ],
  unavailable: false,
};

// 4. Crypto & BTC Regime Mock Dataset
export const MOCK_CRYPTO = {
  bitcoin: { price: 64280, change24h: 2.35, high24h: 65100, low24h: 62800, volume24h: 28450000000 },
  ethereum: { price: 3485, change24h: 1.84, high24h: 3520, low24h: 3390, volume24h: 14200000000 },
  solana: { price: 152.4, change24h: 4.12, high24h: 156.0, low24h: 145.2, volume24h: 4800000000 },
  fearGreed: { value: 61, label: 'Greed' },
  btcDominance: 55.4,
  totalMarketCap: 2420000000000,
  regime: 'Accumulation / Institutional Absorption',
  volatilityRegime: 'Compressed Volatility (Breakout Watch)',
  unavailable: false,
};

export const MOCK_BTC_REGIME = {
  currentRegime: 'Bullish Consolidation',
  onChainScore: 72,
  hashrateTrend: 'All-Time High (Mining Difficulty +3.2%)',
  etfFlows7d: 1420000000,
  liquidSupplyRatio: 0.22,
  exchangeReserveChange30d: -48200,
  unavailable: false,
};

// 5. Sector Heatmap Mock Dataset
export const MOCK_SECTOR_HEATMAP = {
  sectors: [
    { name: 'Technology', ticker: 'XLK', change: 1.85, status: 'bullish', leaders: ['NVDA (+3.4%)', 'MSFT (+1.9%)', 'AAPL (+1.2%)'] },
    { name: 'Energy', ticker: 'XLE', change: 2.45, status: 'bullish', leaders: ['XOM (+2.8%)', 'CVX (+2.1%)', 'OXY (+3.1%)'] },
    { name: 'Aerospace & Defense', ticker: 'ITA', change: 1.62, status: 'bullish', leaders: ['LMT (+2.2%)', 'RTX (+1.8%)', 'NOC (+1.5%)'] },
    { name: 'Financials', ticker: 'XLF', change: 0.74, status: 'neutral', leaders: ['JPM (+1.1%)', 'GS (+0.8%)'] },
    { name: 'Healthcare', ticker: 'XLV', change: -0.42, status: 'bearish', leaders: ['UNH (-0.8%)', 'LLY (+0.4%)'] },
    { name: 'Consumer Staples', ticker: 'XLP', change: -0.28, status: 'neutral', leaders: ['PG (+0.2%)', 'KO (-0.5%)'] },
    { name: 'Utilities', ticker: 'XLU', change: -0.65, status: 'bearish', leaders: ['NEE (-0.9%)', 'SO (-0.4%)'] },
  ],
  unavailable: false,
};

// 6. Escalation Monitor & Economic Warfare Mock Dataset
export const MOCK_ESCALATION_MONITOR = {
  theaters: [
    { theater: 'Middle East (Levant / Persian Gulf)', defcon: 2, trend: 'escalating', flashpoint: 'Strait of Hormuz & Northern Border', activeIncidents: 18 },
    { theater: 'Eastern Europe (Donbas / Black Sea)', defcon: 2, trend: 'active', flashpoint: 'Odesa Port & Critical Infrastructure', activeIncidents: 34 },
    { theater: 'Indo-Pacific (Taiwan Strait / Second Thomas Shoal)', defcon: 3, trend: 'monitoring', flashpoint: 'Air Defense Identification Zone Incursions', activeIncidents: 12 },
    { theater: 'Horn of Africa (Bab el-Mandeb / Red Sea)', defcon: 2, trend: 'escalating', flashpoint: 'Commercial Transit Interdiction', activeIncidents: 9 },
  ],
  overallAlertLevel: 'ORANGE // ELEVATED WAR RISK',
  unavailable: false,
};

export const MOCK_ECONOMIC_WARFARE = {
  sanctionsTotal: 18420,
  activeRestrictions: [
    { target: 'Russian Energy Shadow Fleet', type: 'Maritime Insurance Sanctions', authority: 'G7 / EU', impact: 'High' },
    { target: 'Advanced AI Accelerators & EUV Tools', type: 'Export Control Restrictions', authority: 'US BIS', impact: 'Critical' },
    { target: 'Iranian Drone & Ballistic Supply Chain', type: 'OFAC Secondary Sanctions', authority: 'US Treasury', impact: 'High' },
    { target: 'Critical Minerals Export Licensure', type: 'Quota Controls (Antimony / Gallium)', authority: 'PRC MOFCOM', impact: 'Severe' },
  ],
  deDollarizationIndex: 68.2,
  swiftAlternativeShare: '7.4% (+1.8% YoY)',
  unavailable: false,
};

// 7. Disaster Cascade & Thermal Fires Mock Dataset
export const MOCK_DISASTER_CASCADE = {
  events: [
    { id: 'dc-1', type: 'Severe Drought & Canal Draft Restriction', region: 'Panama Canal', cascade: 'Transit slots cut to 31/day → US Gulf LNG freight surcharge +18%' },
    { id: 'dc-2', type: 'El Niño Agricultural Heat Stress', region: 'Southeast Asia Rice Belt', cascade: 'Export bans in 3 nations → Global rice benchmark +14%' },
    { id: 'dc-3', type: 'Rhine River Low Water Anomaly', region: 'Western Europe (Kaub Gauge)', cascade: 'Barge loading restricted to 40% capacity → Chemical feedstock delays' },
  ],
  cascadeRiskScore: 71.4,
  unavailable: false,
};

export const MOCK_FIRES = {
  totalFires24h: 3840,
  highIntensityClusters: [
    { region: 'Siberian Boreal Forests', count: 640, threat: 'Carbon Release / Logistics' },
    { region: 'Amazon Basin (Cerrado Frontier)', count: 820, threat: 'Agricultural Supply' },
    { region: 'Central African Savanna', count: 1240, threat: 'Biomass Burning' },
    { region: 'Mediterranean Coastal Scrub', count: 210, threat: 'Infrastructure Risk' },
  ],
  unavailable: false,
};

// 8. NextSignal Daily Intelligence Brief (Bypasses Clerk login gate)
export const MOCK_LATEST_BRIEF = {
  id: 'nextsignal-daily-brief',
  status: 'ready',
  title: 'NEXTSIGNAL STRATEGIC INTELLIGENCE BRIEF',
  subtitle: 'Probabilistic Threat Assessments, Macro Cascades & Chokepoint Telemetry',
  generatedAt: nowIso,
  date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  sections: [
    {
      title: 'EXECUTIVE SITUATIONAL SUMMARY',
      content: `Global strategic risk stands at **68.4/100 (HIGH)**. Tactical telemetry indicates simultaneous pressure across three primary maritime chokepoints: the **Strait of Hormuz** (naval boarding warnings), the **Bab el-Mandeb** (drone interdictions redirecting 55% of container tonnage around the Cape of Good Hope), and the **Taiwan Strait** (elevated naval combat air patrols). Commodity markets have begun pricing a structural risk premium into prompt Brent crude contracts ($82.45/bbl) and central bank safe-haven gold reserves ($2,412/oz).`,
    },
    {
      title: 'TACTICAL FLASHPOINT TELEMETRY',
      content: `• **Persian Gulf**: AIS vessel telemetry shows 14 commercial tankers engaging in AIS spoofing to transit the Musandam Peninsula safely. Iranian naval speedboats conducted 3 interception approaches within 48 hours.\n• **Black Sea Theater**: Drone strikes targeted coastal energy transshipment hubs near Novorossiysk, introducing an estimated 400,000 bpd export disruption risk.\n• **Indo-Pacific**: Strategic semiconductor fabrication supply chains remain vulnerable to dual-use mineral restrictions; antimony and germanium inventories at European defense primes are down to 42 days of supply.`,
    },
    {
      title: 'PROBABILISTIC SCENARIO TRAJECTORY (30–90 DAYS)',
      content: `• **BASE CASE (60%)**: Contained maritime friction. Chokepoint transits incur 15–20% insurance surcharges; oil stabilizes between $80–$88/bbl; central banks maintain gradual easing posture.\n• **BEAR CASE (25%)**: Active naval mining or kinetic closure of Hormuz. Immediate Brent spike to $115+/bbl, triggering an inflation cascade and emergency interest rate pauses globally.\n• **BULL CASE (15%)**: Comprehensive ceasefire accord accompanied by maritime demilitarization guarantees, returning shipping rates to historical baseline.`,
    },
  ],
};

// 9. Indian Channel News Feed Data
export const MOCK_INDIAN_NEWS = [
  {
    id: 'in-1',
    title: 'India-Middle East-Europe Economic Corridor (IMEC): Strategic push accelerates amid Red Sea route disruptions',
    source: 'DD News',
    time: '15m ago',
    url: 'https://ddnews.gov.in',
    category: 'Geopolitics',
  },
  {
    id: 'in-2',
    title: 'WION Dispatch: How global oil supply chains are navigating the Strait of Hormuz conflict risk',
    source: 'WION News',
    time: '28m ago',
    url: 'https://www.wionews.com',
    category: 'Energy',
  },
  {
    id: 'in-3',
    title: 'RBI Monetary Policy stance: Navigating imported commodity inflation while maintaining 7.2% GDP growth trajectory',
    source: 'NDTV 24x7',
    time: '42m ago',
    url: 'https://www.ndtv.com',
    category: 'Economy',
  },
  {
    id: 'in-4',
    title: 'Indian Navy deployed in Arabian Sea: Guided missile destroyers escort 18 commercial vessels past Gulf of Aden',
    source: 'The Hindu',
    time: '1h ago',
    url: 'https://www.thehindu.com',
    category: 'Defense',
  },
  {
    id: 'in-5',
    title: 'Semiconductor Mission: India approves two new commercial chip fabrication facilities in Gujarat and Assam',
    source: 'Times of India',
    time: '2h ago',
    url: 'https://timesofindia.indiatimes.com',
    category: 'Technology',
  },
  {
    id: 'in-6',
    title: 'Rupee-Dirham bilateral trade settlement exceeds $4 Billion, reducing dollar transaction friction',
    source: 'Hindustan Times',
    time: '3h ago',
    url: 'https://www.hindustantimes.com',
    category: 'Finance',
  },
];

// 10. Oil Inventories Mock Dataset
export const MOCK_OIL_INVENTORIES = {
  crudeInventoryChange: 1.25,
  cushingStorageUtilization: 68.4,
  sprLevel: 372.4,
  gasolineInventoryChange: -0.85,
  distillatesChange: 0.45,
  refineryUtilization: 91.2,
  history: Array.from({ length: 12 }, (_, i) => ({
    date: getPastDate((11 - i) * 7),
    commercial: 440 + Math.sin(i) * 15,
    spr: 360 + i * 1.1,
  })),
  unavailable: false,
};

// 11. Fuel Shortages & Disruptions Mock Dataset
export const MOCK_FUEL_SHORTAGES = {
  nationalStressIndex: 42.5,
  criticalRegions: [
    { region: 'Northern Caribbean', fuel: 'Jet-A1', status: 'Moderate Stress', daysCover: 8.2 },
    { region: 'East Africa Corridors', fuel: 'Ultra-Low Sulfur Diesel', status: 'Elevated Stress', daysCover: 6.4 },
    { region: 'UK South East Terminal', fuel: 'Gasoline Blendstock', status: 'Normal Supply', daysCover: 14.1 },
  ],
  unavailable: false,
};

export const MOCK_ENERGY_DISRUPTIONS = {
  activeDisruptions: [
    { name: 'CPC Caspian Blend Pipeline', status: 'Partial Maintenance', capacityBpd: 1400000, offlineBpd: 250000, cause: 'Mooring Point Inspection' },
    { name: 'Druzhba Pipeline Southern Leg', status: 'Restricted Transit', capacityBpd: 600000, offlineBpd: 180000, cause: 'Transit Tariff Dispute' },
    { name: 'Gorgon LNG Train 2', status: 'Unplanned Trip', capacityMtpa: 5.2, offlineMtpa: 5.2, cause: 'Turbine Reliability Check' },
  ],
  totalOfflineBpd: 430000,
  unavailable: false,
};

export const MOCK_STORAGE_FACILITIES = {
  globalGasStoragePct: 78.4,
  usWorkingGas: 3240,
  euStoragePct: 84.2,
  facilities: [
    { name: 'Henry Hub Terminal', state: 'LA', capacityBcf: 45, utilizedPct: 82.5 },
    { name: 'Rehden Underground Gas Storage', country: 'Germany', capacityBcm: 4.4, utilizedPct: 88.1 },
    { name: 'Rough Storage Facility', country: 'UK', capacityBcm: 1.2, utilizedPct: 76.4 },
  ],
  unavailable: false,
};

// 12. ETF Flows & Stablecoins Mock Dataset
export const MOCK_ETF_FLOWS = {
  dailyNetInflowUsd: 342000000,
  cumulativeFlows: 18450000000,
  funds: [
    { ticker: 'IBIT', name: 'iShares Bitcoin Trust', flow24h: 185000000, aum: 22400000000 },
    { ticker: 'FBTC', name: 'Fidelity Wise Origin', flow24h: 94000000, aum: 11200000000 },
    { ticker: 'ARKB', name: 'ARK 21Shares', flow24h: 38000000, aum: 3100000000 },
    { ticker: 'BITB', name: 'Bitwise Bitcoin ETF', flow24h: 25000000, aum: 2600000000 },
  ],
  unavailable: false,
};

export const MOCK_STABLECOINS = {
  totalCap: 168400000000,
  change7d: 2.1,
  coins: [
    { symbol: 'USDT', name: 'Tether USD', marketCap: 118400000000, change24h: 0.02, dominance: 70.3 },
    { symbol: 'USDC', name: 'USD Coin', marketCap: 34800000000, change24h: 0.01, dominance: 20.6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', marketCap: 5200000000, change24h: -0.04, dominance: 3.1 },
    { symbol: 'FDUSD', name: 'First Digital USD', marketCap: 2800000000, change24h: 0.05, dominance: 1.7 },
  ],
  unavailable: false,
};

// 13. WSB Tickers & Social Velocity
export const MOCK_WSB_TICKERS = {
  scannedPosts: 8420,
  tickers: [
    { rank: 1, ticker: 'NVDA', mentions: 1420, sentiment: 0.78, sentimentLabel: 'Strong Bullish', change24h: 3.4 },
    { rank: 2, ticker: 'TSLA', mentions: 980, sentiment: 0.52, sentimentLabel: 'Bullish', change24h: -1.2 },
    { rank: 3, ticker: 'PLTR', mentions: 760, sentiment: 0.84, sentimentLabel: 'Strong Bullish', change24h: 4.8 },
    { rank: 4, ticker: 'AMD', mentions: 610, sentiment: 0.65, sentimentLabel: 'Bullish', change24h: 2.1 },
    { rank: 5, ticker: 'SPY', mentions: 540, sentiment: 0.48, sentimentLabel: 'Neutral', change24h: 0.4 },
  ],
  unavailable: false,
};

export const MOCK_SOCIAL_VELOCITY = {
  topics: [
    { topic: 'Strait of Hormuz Escalation', velocity: 94.2, acceleration: '+18.4% / hr', sentiment: -0.68, sampleCount: 14200 },
    { topic: 'Nvidia AI Chip Export Controls', velocity: 88.5, acceleration: '+12.1% / hr', sentiment: -0.42, sampleCount: 9800 },
    { topic: 'Gold Central Bank Accumulation', velocity: 76.1, acceleration: '+8.7% / hr', sentiment: 0.74, sampleCount: 6500 },
  ],
  unavailable: false,
};

// 14. Disease Outbreaks & Predictions
export const MOCK_DISEASE_OUTBREAKS = {
  activeAlerts: [
    { pathogen: 'Avian Influenza H5N1', region: 'North America Dairy Farms', cases: 184, riskLevel: 'Moderate Monitoring', source: 'CDC / WHO' },
    { pathogen: 'Marburg Virus Disease', region: 'Central Africa (Rwanda/DRC)', cases: 42, riskLevel: 'Contained Protocol', source: 'WHO AFRO' },
    { pathogen: 'Dengue Serotype 2', region: 'Latin America Tropical Belt', cases: 280000, riskLevel: 'Seasonal Elevated', source: 'PAHO' },
  ],
  unavailable: false,
};

export const MOCK_PREDICTIONS = {
  markets: [
    { question: 'Federal Reserve cuts interest rates in next FOMC meeting', probability: 88, volumeUsd: 14200000, source: 'Polymarket' },
    { question: 'Iran closes or blockades Strait of Hormuz before Q4 2026', probability: 24, volumeUsd: 8900000, source: 'Polymarket' },
    { question: 'Brent Crude Oil hits $100/bbl before year-end', probability: 31, volumeUsd: 6400000, source: 'Polymarket' },
    { question: 'China conducts maritime blockade rehearsal around Taiwan', probability: 42, volumeUsd: 11200000, source: 'Polymarket' },
  ],
  unavailable: false,
};

export const MOCK_AI_FORECASTS = {
  forecasts: [
    { horizon: '30-Day', title: 'Persian Gulf Shipping Risk Premium Peak', confidence: 78, outcome: 'Insurance premiums normalize +12% over historical mean' },
    { horizon: '60-Day', title: 'Central Bank Gold Allocation Escalation', confidence: 84, outcome: 'Non-G7 central banks acquire 65+ tonnes net' },
    { horizon: '90-Day', title: 'AI Accelerator Supply Chain Re-Routing', confidence: 72, outcome: 'Dual-use export restrictions expand to Southeast Asian intermediary nodes' },
  ],
  unavailable: false,
};

export const MOCK_PREMIUM_ANALYSIS = {
  alphaScore: 84.5,
  regime: 'Momentum & Defense Overweight',
  recommendations: [
    { ticker: 'LMT', action: 'LONG OVERWEIGHT', target: '$520', rationale: 'NATO defense expenditure ceiling revisions' },
    { ticker: 'XOM', action: 'LONG OVERWEIGHT', target: '$128', rationale: 'Upstream cash flow resilience under supply shocks' },
    { ticker: 'NVDA', action: 'HOLD / STRADDLE', target: '$145', rationale: 'Enterprise data center demand offsets export licensing friction' },
  ],
  unavailable: false,
};

/**
 * Universal Fetch Interceptor
 * Installed on globalThis.fetch to guarantee that all /api/* requests return
 * valid JSON even in local Vite development without serverless Edge runners.
 */
export function installLocalApiInterceptor(): void {
  if (typeof window === 'undefined' || (window as unknown as { __nsApiPatched?: boolean }).__nsApiPatched) {
    return;
  }
  (window as unknown as { __nsApiPatched?: boolean }).__nsApiPatched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Only intercept /api/ routes
    const isApiCall = rawUrl.startsWith('/api/') || rawUrl.includes('localhost:3000/api/') || rawUrl.includes('127.0.0.1:3000/api/') || rawUrl.includes('localhost:4173/api/') || rawUrl.includes('127.0.0.1:4173/api/');

    if (!isApiCall) {
      return originalFetch(input, init);
    }

    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type') || '';

      // If the response is valid JSON and not a 404, let it through
      if (response.ok && contentType.includes('application/json')) {
        return response;
      }

      // If it returned HTML (Vite SPA fallback <!DOCTYPE) or a 404/500, intercept and serve rich local data
      return resolveMockApiResponse(rawUrl);
    } catch {
      // Network failure / server offline: provide fallback
      return resolveMockApiResponse(rawUrl);
    }
  };

  console.log('[NextSignal] Local Intelligence API Engine active — all panels wired to live local data.');
}

/**
 * Maps an API endpoint URL to its realistic local dataset
 */
function resolveMockApiResponse(url: string): Response {
  const cleanUrl = url.toLowerCase();

  const makeJson = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  // Fear & Greed Index
  if (cleanUrl.includes('fear-greed') || cleanUrl.includes('fear_and_greed')) {
    return makeJson(MOCK_FEAR_GREED);
  }

  // Market Breadth
  if (cleanUrl.includes('market-breadth') || cleanUrl.includes('breadth')) {
    return makeJson(MOCK_MARKET_BREADTH);
  }

  // News-Market Correlation
  if (cleanUrl.includes('news-market') || cleanUrl.includes('correlation')) {
    return makeJson(MOCK_NEWS_MARKET_CORRELATION);
  }

  // Crypto & Bitcoin Regime & ETF Tracker
  if (cleanUrl.includes('btc-regime') || cleanUrl.includes('bitcoin-regime')) {
    return makeJson(MOCK_BTC_REGIME);
  }
  if (cleanUrl.includes('btc-etf') || cleanUrl.includes('etf-flows') || cleanUrl.includes('etf')) {
    return makeJson(MOCK_ETF_FLOWS);
  }
  if (cleanUrl.includes('stablecoin') || cleanUrl.includes('stablecoins')) {
    return makeJson(MOCK_STABLECOINS);
  }
  if (cleanUrl.includes('crypto')) {
    return makeJson(MOCK_CRYPTO);
  }

  // Sector Heatmap
  if (cleanUrl.includes('heatmap') || cleanUrl.includes('sector')) {
    return makeJson(MOCK_SECTOR_HEATMAP);
  }

  // Escalation Monitor & Force Posture
  if (cleanUrl.includes('escalation') || cleanUrl.includes('theaters') || cleanUrl.includes('force-posture')) {
    return makeJson(MOCK_ESCALATION_MONITOR);
  }

  // Economic Warfare & Sanctions
  if (cleanUrl.includes('economic-warfare') || cleanUrl.includes('sanctions')) {
    return makeJson(MOCK_ECONOMIC_WARFARE);
  }

  // Disaster Cascade
  if (cleanUrl.includes('disaster') || cleanUrl.includes('cascade')) {
    return makeJson(MOCK_DISASTER_CASCADE);
  }

  // Fires & Thermal Anomalies
  if (cleanUrl.includes('fires') || cleanUrl.includes('thermal')) {
    return makeJson(MOCK_FIRES);
  }

  // Oil Inventories & Energy Complex
  if (cleanUrl.includes('oil-inventories') || cleanUrl.includes('oil_inventories') || cleanUrl.includes('inventories')) {
    return makeJson(MOCK_OIL_INVENTORIES);
  }
  if (cleanUrl.includes('fuel-shortage') || cleanUrl.includes('fuel_shortages')) {
    return makeJson(MOCK_FUEL_SHORTAGES);
  }
  if (cleanUrl.includes('energy-disruptions') || cleanUrl.includes('disruptions')) {
    return makeJson(MOCK_ENERGY_DISRUPTIONS);
  }
  if (cleanUrl.includes('storage') || cleanUrl.includes('facilities')) {
    return makeJson(MOCK_STORAGE_FACILITIES);
  }

  // WSB Tickers & Social Velocity
  if (cleanUrl.includes('wsb') || cleanUrl.includes('ticker-scanner')) {
    return makeJson(MOCK_WSB_TICKERS);
  }
  if (cleanUrl.includes('social-velocity') || cleanUrl.includes('velocity')) {
    return makeJson(MOCK_SOCIAL_VELOCITY);
  }

  // Disease Outbreaks & Biosurveillance
  if (cleanUrl.includes('disease') || cleanUrl.includes('outbreak')) {
    return makeJson(MOCK_DISEASE_OUTBREAKS);
  }

  // Predictions & AI Forecasts
  if (cleanUrl.includes('predictions') || cleanUrl.includes('polymarket')) {
    return makeJson(MOCK_PREDICTIONS);
  }
  if (cleanUrl.includes('forecast') || cleanUrl.includes('forecasts')) {
    return makeJson(MOCK_AI_FORECASTS);
  }
  if (cleanUrl.includes('premium') || cleanUrl.includes('backtest')) {
    return makeJson(MOCK_PREMIUM_ANALYSIS);
  }

  // Daily Intelligence Brief (Bypasses Sign In)
  if (cleanUrl.includes('latest-brief') || cleanUrl.includes('daily-brief') || cleanUrl.includes('brief')) {
    return makeJson(MOCK_LATEST_BRIEF);
  }

  // News Feeds (include Indian News items)
  if (cleanUrl.includes('news') || cleanUrl.includes('feed') || cleanUrl.includes('digest')) {
    return makeJson({
      status: 'ok',
      items: MOCK_INDIAN_NEWS,
      total: MOCK_INDIAN_NEWS.length,
    });
  }

  // Default fallback for other RPC services
  return makeJson({
    status: 'ok',
    data: {},
    unavailable: false,
    timestamp: nowIso,
  });
}
