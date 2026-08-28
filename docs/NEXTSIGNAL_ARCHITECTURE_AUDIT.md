# NextSignal Architecture Audit
## Source: World Monitor (koala73/worldmonitor) — v2.10.0

> **Status**: Phase 1 Audit — Complete  
> **Audited by**: NextSignal Engineering  
> **Date**: 2026-08-25  
> **AGPL-3.0 Attribution**: Original work © 2024-2026 Elie Habib. All rights reserved.

---

## 1. Executive Summary

World Monitor is a **production-grade, real-time global intelligence dashboard** — not a toy project. It is a TypeScript SPA with 193+ panel components, 222+ service files, a Protobuf/RPC contract system (sebuf), a Vercel Edge Function API layer, Railway relay services, Convex backend, Upstash Redis cache, and a Tauri 2 desktop app. The codebase is approximately **6,111 files** spanning the SPA, API gateway, desktop shell, blog, CLI, SDKs, and deployment infrastructure.

**Good news for NextSignal**: The existing infrastructure is already more powerful than most commercial intelligence platforms. We preserve and extend — we do not rewrite.

---

## 2. Deployment Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                  BROWSER / DESKTOP (SPA)                         │
│  DeckGLMap (deck.gl)   GlobeMap (globe.gl)   Panels (193+)       │
│  Workers (ML/Analysis)   Variant System                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │ fetch /api/*
           ┌────────────┴──────────────────┐
           │            │                  │
    ┌──────▼──────┐ ┌───▼─────┐  ┌────────▼─────┐
    │   Vercel    │ │ Railway │  │   Tauri 2     │
    │ Edge Funcs  │ │AIS Relay│  │  (Rust+Node) │
    │ +Middleware │ │+Seeders │  │  Sidecar     │
    └──────┬──────┘ └───┬─────┘  └──────────────┘
           │            │
    ┌──────▼──────────────────┐
    │     Upstash Redis       │
    │  (cache + rate limit)   │
    └──────┬──────────────────┘
           │
    ┌──────▼─────────────────────────────┐
    │       Upstream Data Sources        │
    │ Finnhub / Yahoo / CoinGecko        │
    │ ACLED / UCDP / FIRMS               │
    │ OpenSky / Wingbits (ADS-B)         │
    │ GDELT / RSS feeds (500+ domains)   │
    │ FRED / IMF / World Bank            │
    │ PolyMarket / prediction markets    │
    │ Telegram / X feeds                 │
    │ NASA EONET / Earthquake feeds      │
    │ 578+ observed upstream hosts total │
    └────────────────────────────────────┘

Additional:
  Convex Cloud     → Billing, user state, API keys, vector search
  Cloudflare       → CORS preflight worker for api.worldmonitor.app
  Mintlify         → Docs (proxied /docs)
  Sentry           → Error tracking (deferred, off critical path)
  Vercel Analytics → Performance telemetry
  Umami            → Self-hosted analytics (Railway)
```

---

## 3. Frontend Architecture

### Framework & Build
- **Framework**: Vanilla TypeScript (NO React/Vue/Svelte)
- **Bundler**: Vite 6 with extensive custom plugins
- **Runtime**: Browser SPA + PWA (service worker) + Tauri 2 desktop
- **CSS**: Vanilla CSS (multiple layered stylesheets, ~800KB combined)
- **No external UI library** — all components hand-built

### Entry Points
| File | Purpose |
|------|---------|
| `src/main.ts` | Main SPA entry (dashboard) |
| `src/embed-main.ts` | Embeddable widget |
| `src/settings-main.ts` | Settings window |
| `src/live-channels-main.ts` | Live channels window |
| `src/mcp-grant-main.ts` | MCP OAuth grant window |
| `index.html` | SPA shell (525 lines, full SEO/OG/JSON-LD) |

### Initialization (8 Phases in `App.ts`)
1. Storage + i18n (IndexedDB, language detection, locale loading)
2. ML Worker (ONNX model prep — embeddings, sentiment, summarization)
3. Sidecar (desktop only — wait for Node.js sidecar)
4. Bootstrap (2-tier concurrent Redis hydration — fast 3s + slow 5s)
5. Layout (PanelLayoutManager renders map + panels)
6. UI (SignalModal, IntelligenceGapBadge, BreakingNewsBanner, correlation engine)
7. Data (`loadAllData()` + `primeVisiblePanelData()`)
8. Refresh (`startSmartPollLoop()` — variant-specific intervals)

### Component Architecture
- **Panel base class** (`src/components/Panel.ts`) — 109 concrete subclasses
- All panels: `setContent(html)` (debounced 150ms), event delegation, resize/span persistence to localStorage
- **Dual Map System**:
  - `DeckGLMap.ts` (353KB) — deck.gl + MapLibre-GL, WebGL, PMTiles, Supercluster
  - `GlobeMap.ts` (190KB) — globe.gl Three.js, 3D globe, auto-rotate
- Layer definitions: `src/config/map-layer-definitions.ts`

### State Management
- **No external state library** — `AppContext` is a central mutable object
- Holds: map refs, panel instances, all cached data, in-flight requests, UI refs
- URL state sync via `src/utils/urlState.ts` (debounced 250ms, bidirectional)
- LocalStorage for settings, panel spans, variant preference

### Web Workers
| Worker | Purpose |
|--------|---------|
| `analysis.worker.ts` | News clustering (Jaccard similarity), cross-domain correlation |
| `ml.worker.ts` | ONNX inference (MiniLM-L6 embeddings, sentiment, summarization, NER) |
| `vector-db.ts` | IndexedDB-backed vector store for semantic search |

### Variant System
- 6 variants: `full`, `tech`, `finance`, `happy`, `commodity`, `energy`
- Detected from hostname, localStorage, or `VITE_VARIANT` build env
- Controls: default panels, layers, refresh intervals, theme, UI text
- Dev commands: `npm run dev:tech`, `npm run dev:finance`, etc.

---

## 4. API Layer

### Edge Functions (`api/`)
- **Domain gateways** (proto-generated thin wrappers): `api/<domain>/v1/[rpc].ts`
  - aviation, climate, conflict, consumer-prices, cyber, displacement, economic
  - forecast, giving, health, imagery, infrastructure, intelligence
  - leads, maritime, market, military, natural, news, positive-events
  - prediction, radiation, research, resilience, safety, sanctions
  - **scenario** (key for NextSignal!), seismology, supply-chain, thermal
  - trade, unrest, webcam, wildfire
- **Operational endpoints**: auth/session, checkout, MCP server, bootstrap/health, notifications, cache invalidation

### Gateway Pipeline
1. Origin check (403 if disallowed)
2. CORS headers
3. OPTIONS preflight
4. API key validation
5. Rate limiting (Upstash sliding window)
6. Route matching
7. Handler execution
8. ETag generation (FNV-1a hash) + 304 Not Modified
9. Cache headers

### Cache Tiers
| Tier | TTL | Use case |
|------|-----|---------|
| fast | 300s | Live events, flight status |
| medium | 600s | Market quotes, stock analysis |
| slow | 1800s | ACLED events, cyber threats |
| static | 7200s | Humanitarian summaries, ETF flows |
| daily | 86400s | Critical minerals, static reference data |
| no-store | 0 | Vessel snapshots, aircraft tracking |

---

## 5. Proto/RPC Contract System (sebuf)

```
proto/ definitions
    ↓ buf generate
src/generated/client/   (TypeScript RPC client stubs)
src/generated/server/   (TypeScript server message types)
docs/api/               (OpenAPI v3 specs)
```

Protocol Buffers with `(sebuf.http.config)` annotations.  
**Key services already defined** (100% compatible with NextSignal):
- `scenario/v1` — Scenario engine RPC (run, status, templates)
- `market/v1` — Market quotes, crypto, commodities, sectors
- `news/v1` — News intelligence
- `intelligence/v1` — Intelligence layer
- `forecast/v1` — Forecasting
- `research/v1` — Research queries

---

## 6. Data Pipeline

### Bootstrap Hydration
- `/api/bootstrap` → Redis batch read → SPA hydration (2-tier concurrent)
- Large datasets: CDN-shielded single-key requests via `ensureHydrated(key)`

### Seed Scripts (Railway Cron + AIS Relay Loops)
- Market data (stocks, commodities, crypto, stablecoins, sectors, ETF flows)
- Aviation (OpenSky + Wingbits ADS-B + GPSJAM)
- Geopolitical (ACLED, UCDP, FIRMS fires, CII risk scores)
- Positive events, humanitarian data

### Smart Poll Loop (`src/app/refresh-scheduler.ts`)
- Exponential backoff (max 4x)
- Viewport-conditional refresh
- Tab-pause when hidden
- Staggered flush on tab visibility
- 150ms delays between batch refreshes

---

## 7. Market Data Sources

| Provider | Data Type | Access |
|---------|-----------|--------|
| Finnhub | Stock quotes, fundamentals, news | API key |
| Yahoo Finance | Stock quotes, historical data | No key (scraped) |
| CoinGecko | Crypto quotes, sectors, DeFi, AI tokens | API key |
| Custom Redis seed | All above, cached 5-10 min | Internal |
| ETF flows | ETF flow data | Aggregated |
| Gulf Quotes | Gulf/Middle East markets | Custom |

All market data flows through `api/market/v1/[rpc].ts` → `server/worldmonitor/market/v1/handler.ts` → cached in Redis.

---

## 8. News & Intelligence Sources

| Source | Type | Feed |
|--------|------|------|
| GDELT | Geopolitical events, tone analysis | Real-time |
| RSS (500+ domains) | News from 500+ curated domains | Via RSS proxy |
| Telegram channels | Intelligence feeds | Telegram API |
| X (Twitter) | Social intelligence | X API |
| ACLED | Conflict events | REST API |
| UCDP | Uppsala Conflict Data | REST API |
| Groq/OpenRouter LLM | AI news summarization + briefs | API keys |
| Anthropic SDK | AI analysis (Claude) | API key |
| Xenova Transformers | Browser-side ML (MiniLM, sentiment, NER) | No key |

---

## 9. Geopolitical & Geographic Intelligence

| Source | Data |
|--------|------|
| ACLED | Armed conflict events |
| UCDP | Uppsala conflict database |
| NASA EONET | Natural disasters, wildfires |
| NASA FIRMS | Satellite fire detection |
| OREF | Israeli rocket alert system |
| CII v8 | Country Instability Index (38-factor stress model) |
| GPSJAM | GPS interference monitoring |
| Seismology feeds | Earthquake data |
| Canada Emergency Alerts | CAP alerts |
| H3 hexagons | Geographic clustering (h3-js) |
| PMTiles | Self-hosted vector basemap tiles |

---

## 10. AI Integrations

| System | Location | Purpose |
|--------|----------|---------|
| Groq API | Server-side | News summarization, briefs |
| OpenRouter | Server-side | Fallback LLM, forecast enrichment |
| Anthropic SDK (Claude) | Server-side | Analysis, forecasting |
| Ollama | Optional local | All AI features, no API key |
| ONNX (MiniLM-L6) | Browser worker | Semantic embeddings, vector search |
| Xenova Transformers | Browser worker | Sentiment analysis, NER, summarization |
| Convex vector search | Cloud | Historical intelligence memory |

### AI Pipeline (Server-side)
```
News/Events → Redis cache → LLM (Groq/OpenRouter/Claude)
           → Brief generation
           → Forecast enrichment
           → Scenario engine (api/scenario/v1/)
           → Market implications (ForecastPanel)
```

---

## 11. Authentication & Authorization

| Mechanism | Used for |
|-----------|---------|
| Clerk.js | User accounts, JWT sessions |
| API key (`X-WorldMonitor-Key`) | Programmatic access, MCP |
| Browser origin trust | No key required for production domains |
| Convex entitlements (Dodo) | Premium/Pro feature gating |
| Premium fetch wrapper | Automatically injects Bearer token |
| Rate limiting (Upstash) | Per-IP sliding window, per-endpoint overrides |

---

## 12. Caching Architecture

```
Railway Seed Loops → writes to Redis on schedule
      ↓ miss
In-memory per-Vercel-instance cache (short TTL)
      ↓ miss
Upstash Redis (cross-instance, stampede-protected via cachedFetchJson)
      ↓ miss
Upstream API fetch → writes back to Redis + seed-meta
```

### Client-side
- Circuit breaker pattern per data source (`src/utils/circuit-breaker.ts`)
- Persistent circuit breaker cache (survives page reload)
- IndexedDB vector store for semantic search
- LocalStorage for settings, cached data, UI state

---

## 13. Component Inventory — Key Panels for NextSignal

### KEEP & Enhance (High Value)
| Panel | Size | NextSignal Use |
|-------|------|---------------|
| `MarketPanel.ts` | 35KB | Market Radar core |
| `LiveNewsPanel.ts` | 87KB | Global Monitor |
| `InsightsPanel.ts` | 47KB | Signal Engine → AI insights |
| `ForecastPanel.ts` | 50KB | Scenario Engine foundation |
| `StockAnalysisPanel.ts` | 33KB | Market Radar deep dive |
| `CrossSourceSignalsPanel.ts` | 10KB | Signal Engine |
| `CorrelationPanel.ts` | 10KB | Signal correlation |
| `MacroSignalsPanel.ts` | 13KB | Economic Signal layer |
| `NewsMarketCorrelationPanel.ts` | 15KB | Signal→Market correlation |
| `StrategicRiskPanel.ts` | 23KB | Risk/Impact layer |
| `SupplyChainPanel.ts` | 53KB | Impact Map |
| `CountryBriefPage.ts` | 41KB | Country deep dives |
| `WatchlistTableView.ts` | 33KB | Watchlist feature |
| `ChatAnalystPanel.ts` | 28KB | AI Explainability |
| `DeckGLMap.ts` | 354KB | Interactive map |
| `GlobeMap.ts` | 190KB | 3D globe |
| `SignalModal.ts` | 24KB | Signal detail view |
| `TradePolicyPanel.ts` | 25KB | Trade/economic signals |
| `EconomicPanel.ts` | 25KB | Economic indicators |
| `MilitaryCorrelationPanel.ts` | 7KB | Geopolitical signals |
| `DeductionPanel.ts` | 13KB | AI deduction/reasoning |
| `GoldIntelligencePanel.ts` | 22KB | Commodity intelligence |

### KEEP As-Is (Working Infrastructure)
- All map layers and geographic systems
- Bootstrap/hydration system
- Redis cache layer
- Smart poll loop
- Circuit breaker pattern
- ML worker (ONNX embeddings)
- All Proto/RPC contracts
- Authentication layer
- Rate limiting
- Signal aggregator

### TRANSFORM (Rename/Rebrand)
- All UI labels mentioning "World Monitor"
- `src/config/variant.ts` — localStorage key `worldmonitor-variant`
- Navigation branding
- Favicon, OG images, meta tags

### EXTEND (New NextSignal Features)
- Scenario Engine UI (scenario service already exists server-side)
- "What Happens Next?" feature page
- Impact Map visualization
- Signal feed with structured signal types
- Probabilistic scenario display (Bull/Base/Bear)
- AI explainability layer

---

## 14. Branding Inventory — All Occurrences

### Files Requiring Update
| Location | Occurrences |
|----------|-----------|
| `index.html` | Title, meta, OG, Twitter, JSON-LD, canonical URLs |
| `package.json` | `"name": "world-monitor"` |
| `src/config/variant.ts` | `localStorage.getItem('worldmonitor-variant')` |
| `src/services/wm-session.ts` | Session branding |
| `src/services/meta-tags.ts` | Dynamic meta tag management |
| `public/favico/` | All favicon files |
| `public/robots.www.txt` | Sitemap URL |
| `public/llms.txt` | Product description |
| `README.md` | Full product description (preserve attribution) |
| `api/_cors.js` | CORS origin allowlist |
| `middleware.ts` | Bot filtering, social preview |
| `.env.example` | Header comment |
| `ARCHITECTURE.md` | Product name references |
| `server/*.ts` | Server-side product references |
| `vercel.json` | Canonical URLs, OG |

### Files to Preserve As-Is (Attribution)
- `LICENSE` — AGPL-3.0-only, Elie Habib copyright
- `CONTRIBUTING.md` — contribution guidelines
- `SECURITY.md` — security policy
- `CODE_OF_CONDUCT.md` — conduct policy
- Author attribution in README

---

## 15. Security Model

### Trust Boundaries
```
Browser ↔ Vercel Edge Functions ↔ Upstream APIs
Desktop ↔ Tauri Sidecar ↔ Cloud API / Upstream APIs
```

### CSP (3 Sources Must Stay in Sync)
1. `index.html` `<meta>` tag (dev + Tauri fallback)
2. `vercel.json` HTTP header (production — overrides meta)
3. `src-tauri/tauri.conf.json` (desktop)

### API Key Management
- Browser origins (production + localhost): No key required
- External clients: `X-WorldMonitor-Key` header required
- Desktop: Platform keyring (macOS Keychain / Windows Credential Manager)
- Never stored in plaintext; never in frontend bundle

---

## 16. Desktop Architecture (Tauri 2)

- **Rust shell**: lifecycle, system tray, IPC commands, keyring
- **Node.js sidecar** (`src-tauri/sidecar/local-api-server.mjs`): dynamically loads Edge Function handlers, injects secrets via Tauri IPC, patches fetch for IPv4
- **Fetch patching**: All `/api/*` requests → sidecar → cloud fallback

---

## 17. Testing Infrastructure

| Type | Tool | Coverage |
|------|------|---------|
| Unit/Integration | `node:test` | Handlers, cache keying, circuit breakers, data validation |
| E2E | Playwright | Theme, navigation, circuit breaker, keyword spike, mobile |
| Visual regression | Playwright golden screenshots | Per-variant per-layer-zoom |
| Edge function guards | Custom guardrails | Self-contained bundle constraint |
| Type checking | TypeScript | `tsc --noEmit` (src + api tsconfigs) |
| Lint | Biome | All source dirs |
| Pre-push hook | Husky | TypeScript + CJS syntax + bundle + import + markdown |

---

## 18. Known Issues / Limitations

1. **postinstall fails without full env**: `npm install` requires `inventory:facts` script + blog-site install. Use `npm install --ignore-scripts` for local dev.
2. **API keys required for most data sources**: Running without keys = graceful degradation (panels show empty states).
3. **Redis required for production**: Upstash Redis is the backbone of all caching and bootstrap hydration.
4. **Convex required for auth/billing**: Free Convex project usable for self-hosting.
5. **Railway relay required for real-time data**: AIS relay, market seed loops, GPSJAM.
6. **Vercel Edge required for production**: Edge Functions use Vercel-specific `@vercel/functions` SDK.

---

## 19. What NextSignal ADDS to This Foundation

The existing infrastructure already provides:
- ✅ Global event monitoring (conflict, disasters, aviation, maritime)
- ✅ Market data (stocks, crypto, commodities, FX, sectors)
- ✅ News intelligence (500+ sources, AI summarization)
- ✅ Signal correlation (cross-domain, geographic)
- ✅ Scenario engine API (`api/scenario/v1/`) — **already exists!**
- ✅ AI forecasting (`ForecastPanel.ts` — 50KB) — already functional
- ✅ Watchlist (WatchlistTableView + WatchlistEditor)
- ✅ Country deep dives (CountryBriefPage + CountryDeepDivePanel)
- ✅ Geopolitical risk scoring (CII v8)

What NextSignal ADDS:
- 🆕 Branded "Signal Engine" UI (structured signal feed)
- 🆕 "What Happens Next?" flagship feature
- 🆕 Bull/Base/Bear scenario display UI
- 🆕 AI Explainability layer (show evidence chain)
- 🆕 Impact Map visualization (event → direct → second-order)
- 🆕 Probabilistic scenario cards with confidence
- 🆕 Alert architecture (meaningful changes only)
- 🆕 Clean provider abstraction interfaces
- 🆕 NextSignal brand identity and design system

---

## 20. Recommended Implementation Priority

**STAGE 1** (current): Audit ✅  
**STAGE 2**: Brand transformation (index.html, package.json, meta, favicon)  
**STAGE 3**: Navigation restructure + dashboard reframe  
**STAGE 4**: Signal Engine UI (wrap existing CrossSourceSignalsPanel + SignalModal)  
**STAGE 5**: Scenario Engine UI (wrap existing ForecastPanel + api/scenario/v1/)  
**STAGE 6**: "What Happens Next?" feature page  
**STAGE 7**: Impact Map visualization  
**STAGE 8**: Watchlist enhancement  
**STAGE 9**: Alerts architecture  
**STAGE 10**: Performance + security hardening  
**STAGE 11**: Production polish  
