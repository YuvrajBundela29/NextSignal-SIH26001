# NextSignal Data Architecture

> **Status**: v1.0 — Initial Design  
> **AGPL-3.0 Attribution**: Built on World Monitor (koala73/worldmonitor) © 2024-2026 Elie Habib.

---

## Architectural Philosophy

> **Provider Abstraction First**
> 
> The UI consumes normalized internal data structures.
> Providers are pluggable adapters behind stable interfaces.
> Swapping a data provider requires changing only the adapter — never the UI.

---

## Provider Abstraction Layer

### Interface Definitions

```typescript
// ---- NewsProvider ----
interface NewsProvider {
  name: string;
  fetchHeadlines(options: NewsOptions): Promise<NewsItem[]>;
  fetchByTopic(topic: string, options: NewsOptions): Promise<NewsItem[]>;
  fetchByCountry(countryCode: string): Promise<NewsItem[]>;
  isAvailable(): boolean;
}

// ---- MarketDataProvider ----
interface MarketDataProvider {
  name: string;
  fetchQuotes(symbols: string[]): Promise<MarketQuote[]>;
  fetchCryptoQuotes(ids: string[]): Promise<CryptoQuote[]>;
  fetchCommodities(): Promise<CommodityQuote[]>;
  fetchSectors(): Promise<SectorSummary[]>;
  fetchHistory(symbol: string, days: number): Promise<HistoryPoint[]>;
  isAvailable(): boolean;
}

// ---- EconomicDataProvider ----
interface EconomicDataProvider {
  name: string;
  fetchIndicators(countries: string[]): Promise<EconomicIndicator[]>;
  fetchCPI(): Promise<CPIData[]>;
  fetchYieldCurve(): Promise<YieldPoint[]>;
  isAvailable(): boolean;
}

// ---- GeopoliticalProvider ----
interface GeopoliticalProvider {
  name: string;
  fetchConflictEvents(options: ConflictOptions): Promise<ConflictEvent[]>;
  fetchRiskScores(countries: string[]): Promise<RiskScore[]>;
  fetchDisplacements(): Promise<DisplacementData[]>;
  isAvailable(): boolean;
}

// ---- EventProvider ----
interface EventProvider {
  name: string;
  fetchBreakingEvents(limit: number): Promise<GlobalEvent[]>;
  fetchByRegion(region: string): Promise<GlobalEvent[]>;
  fetchByType(type: EventType): Promise<GlobalEvent[]>;
  isAvailable(): boolean;
}
```

---

## Normalized Data Models

### Core Models

```typescript
// ---- NewsItem ----
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;       // ISO 8601
  country?: string;          // ISO 3166-1 alpha-2
  region?: string;
  topics: string[];
  sentiment: number;         // -1 to +1
  relevanceScore: number;    // 0 to 1
  imageUrl?: string;
}

// ---- MarketQuote ----
interface MarketQuote {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change: number | null;      // percentage
  changeAbs: number | null;   // absolute change
  volume?: number;
  marketCap?: number;
  sparkline?: number[];       // 30-point price history
  sector?: string;
  updatedAt: string;
}

// ---- Signal ----
interface Signal {
  id: string;
  type: SignalType;
  direction: 'bullish' | 'bearish' | 'neutral' | 'risk';
  strength: 'weak' | 'moderate' | 'strong' | 'critical';
  confidence: number;
  title: string;
  summary: string;
  detectedAt: string;
  geographicScope: string[];
  affectedSectors: string[];
  affectedAssets: string[];
  relatedEventIds: string[];
  evidenceSources: EvidenceSource[];
  explainability: string;
}

// ---- Scenario ----
interface Scenario {
  scenarioId: string;
  entity: string;
  entityType: 'asset' | 'sector' | 'country' | 'topic' | 'global';
  createdAt: string;
  updatedAt: string;
  timeHorizon: string;
  cases: {
    bull: ScenarioCase;
    base: ScenarioCase;
    bear: ScenarioCase;
  };
  confidence: number;
  invalidationConditions: string[];
  evidenceSources: EvidenceSource[];
  previousVersion?: ScenarioCaseSummary;  // "what changed?"
}

// ---- EvidenceSource ----
interface EvidenceSource {
  id: string;
  type: 'news' | 'market' | 'geopolitical' | 'economic' | 'signal' | 'model';
  title: string;
  url?: string;
  source: string;
  timestamp: string;
  relevanceScore: number;
  excerpt?: string;
}

// ---- Alert ----
interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: AlertType;
  title: string;
  summary: string;
  relatedSignalId?: string;
  relatedScenarioId?: string;
  entity?: string;
  timestamp: string;
  dismissed: boolean;
  read: boolean;
}

// ---- GlobalEvent ----
interface GlobalEvent {
  id: string;
  title: string;
  what: string;      // What happened
  when: string;      // ISO timestamp
  where: string;     // Location description
  why: string;       // Why it matters (AI-generated)
  eventType: EventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat?: number;
  lon?: number;
  countryCode?: string;
  region?: string;
  sources: string[];
  relatedSignalIds: string[];
}
```

---

## Current Provider Implementations

### News Providers
| Provider | ID | Data | Status |
|---------|---|------|--------|
| RSS Aggregator (500+ domains) | `rss` | General news | ✅ Active |
| GDELT | `gdelt` | Geopolitical events | ✅ Active |
| Telegram Intel | `telegram` | Intelligence feeds | ✅ Active |
| X/Twitter Intel | `x-intel` | Social intelligence | ✅ Active |

### Market Data Providers
| Provider | ID | Data | Status |
|---------|---|------|--------|
| Finnhub | `finnhub` | Stock quotes, fundamentals | ✅ Active (key required) |
| Yahoo Finance | `yahoo` | Stock quotes, historical | ✅ Active |
| CoinGecko | `coingecko` | Crypto quotes | ✅ Active (key required) |
| Gulf Quotes | `gulf` | Gulf market quotes | ✅ Active |

### Economic Data Providers
| Provider | ID | Data | Status |
|---------|---|------|--------|
| FRED | `fred` | US economic indicators | ✅ Active |
| IMF | `imf` | Country economic data | ✅ Active |
| World Bank | `worldbank` | Development indicators | ✅ Active |
| FAO | `fao` | Food price index | ✅ Active |

### Geopolitical Providers
| Provider | ID | Data | Status |
|---------|---|------|--------|
| ACLED | `acled` | Armed conflict events | ✅ Active |
| UCDP | `ucdp` | Uppsala conflict data | ✅ Active |
| NASA EONET | `eonet` | Natural disasters | ✅ Active |
| NASA FIRMS | `firms` | Satellite fires | ✅ Active |
| GPSJAM | `gpsjam` | GPS interference | ✅ Active |
| OREF | `oref` | Israeli rocket alerts | ✅ Active |
| Seismology | `seismology` | Earthquakes | ✅ Active |

---

## Data Flow Architecture

```
EXTERNAL SOURCES
       ↓
[Railway Seed Loops + Cron]
       ↓
[Upstash Redis Cache]
       ↓ (bootstrap hydration)
[Vercel Edge Functions]
       ↓ (ETag + cache headers)
[Browser SPA]
       ↓
[Circuit Breakers]
       ↓
[Normalized Data Models]
       ↓
[Signal Engine]  [Scenario Engine]  [Market Radar]
       ↓                 ↓                ↓
[Impact Map]    [Watchlist]    [Alerts]
       ↓
[UI Components]
```

---

## Cache Architecture (4 Layers)

```
Layer 1: Railway Seed Loops
  → Continuously write to Redis on schedule
  → Market: every 5-10 min
  → News: as available
  → Geopolitical: every 15-30 min

Layer 2: Upstash Redis
  → Cross-instance cache
  → Stampede protection via cachedFetchJson
  → Seed metadata (fetchedAt, recordCount)

Layer 3: Vercel Edge (in-memory)
  → Per-instance short TTL
  → ETag generation (FNV-1a hash)
  → 304 Not Modified on no change

Layer 4: Browser
  → Circuit breakers (per data source)
  → Persistent cache (survives reload)
  → IndexedDB vector store (semantic search)
  → LocalStorage (settings, UI state)
```

### Cache TTLs
| Data Type | TTL | Reason |
|-----------|-----|--------|
| Market quotes | 300s | Near-real-time pricing |
| Stock analysis | 600s | Moderate freshness |
| Conflict events | 1800s | Slow-moving data |
| Humanitarian | 7200s | Daily updates sufficient |
| Static reference | 86400s | Rarely changes |
| Vessel snapshots | 0 | Always fresh |

---

## Bootstrap Hydration Protocol

```
SPA Init
    ↓
GET /api/bootstrap (2 concurrent tiers)
  ├─ Tier 1 (fast, 3s timeout): critical real-time data
  │    market quotes, breaking news, CII scores, risk events
  └─ Tier 2 (slow, 5s timeout): enrichment data
       economic indicators, ACLED, UCDP, sector data

On timeout: graceful degradation (panel shows stale/empty state)
On success: data injected into AppContext, panels render
```

---

## Signal Pipeline (Data → Structured Signal)

```
Raw Events (news, market, geo, economic)
     ↓
[Signal Detection Layer]
  - Pattern matching against known signal types
  - Geographic attribution (H3 clustering)
  - Severity scoring
  - Deduplication
     ↓
[Signal Enrichment]
  - Entity extraction (NER via ML worker)
  - Sector/asset attribution
  - Related event linking
  - Evidence source linkage
     ↓
[Signal Aggregator]
  - Country/region clustering
  - Convergence zone detection
  - Cross-domain correlation
     ↓
[Structured Signal Output]
  → Signal feed
  → Scenario engine input
  → Impact analysis input
  → Alert evaluation
```

---

## Scenario Evidence System

Every scenario maintains a full evidence record:

```typescript
interface ScenarioEvidenceRecord {
  scenarioId: string;
  entityId: string;
  snapshotAt: string;
  version: number;
  probabilities: {
    bull: number;
    base: number;
    bear: number;
  };
  supportingSignals: string[];       // Signal IDs
  contradictingSignals: string[];    // Signal IDs
  evidenceSources: EvidenceSource[];
  confidence: number;
  invalidationConditions: string[];
  previousSnapshot?: {              // "what changed?"
    probabilities: {bull: number; base: number; bear: number};
    snapshotAt: string;
    changeSummary: string;
  };
}
```

---

## Data Freshness Monitoring

Health endpoint: `GET /api/health`

Per key:
- `seed-meta:<key>` → `{ fetchedAt, recordCount }`
- Compare `fetchedAt` vs `maxStaleMin`
- Status: `OK` | `STALE` | `WARN` | `EMPTY`

Cascade groups handle fallback chains.

---

## Security Considerations

1. **API keys**: Never in frontend bundle. Server-side only (Vercel env vars, Railway secrets, Tauri keyring)
2. **CORS**: Origin allowlist — production domains, Vercel previews, `tauri://localhost`, `localhost`
3. **Rate limiting**: Per-IP sliding window (Upstash), per-endpoint overrides
4. **API key validation**: Required for non-browser origins; desktop requires key
5. **Cache key discipline**: All request-varying parameters must be in cache key
6. **Input validation**: Zod schemas on AI output before display
7. **HTML sanitization**: DOMPurify before any `innerHTML` injection

---

## Environment Variables Required

See `.env.example` for full list. Key groups:

### Essential (production)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — Redis cache
- `GROQ_API_KEY` — AI summarization (primary)
- `OPENROUTER_API_KEY` — AI fallback

### Market Data
- `FINNHUB_API_KEY` — Stock quotes
- `COINGECKO_API_KEY` — Crypto quotes

### Auth/Billing
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — Auth
- `CONVEX_DEPLOY_KEY` — Convex backend

### Infrastructure
- `SENTRY_DSN` — Error tracking
- `AIS_RELAY_URL` — Railway relay service
- `RAILWAY_TOKEN` — Railway deployment
