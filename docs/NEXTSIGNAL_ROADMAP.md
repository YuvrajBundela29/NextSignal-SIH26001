# NextSignal Roadmap

> **Status**: Living document — updated as stages complete  
> **AGPL-3.0 Attribution**: Built on World Monitor (koala73/worldmonitor) © 2024-2026 Elie Habib.

---

## Roadmap Overview

```
STAGE 1   Clone + Install + Run + Audit      ✅ COMPLETE
STAGE 2   Brand Transformation               🔄 IN PROGRESS
STAGE 3   UI Restructuring                   ⏳ NEXT
STAGE 4   Market Radar                       ⏳ PLANNED
STAGE 5   Signal Engine                      ⏳ PLANNED
STAGE 6   Scenario Engine                    ⏳ PLANNED
STAGE 7   "What Happens Next?"               ⏳ PLANNED
STAGE 8   Impact Map                         ⏳ PLANNED
STAGE 9   Watchlists                         ⏳ PLANNED
STAGE 10  Alerts                             ⏳ PLANNED
STAGE 11  Performance / Security Hardening   ⏳ PLANNED
STAGE 12  Production Polish                  ⏳ PLANNED
```

---

## STAGE 1: Clone + Install + Run + Audit ✅

**Completed**:
- [x] Repository cloned from https://github.com/koala73/worldmonitor.git
- [x] Dependencies installed (`npm install --ignore-scripts` — 1598 packages)
- [x] Dev server running (`npm run dev` → http://localhost:3000)
- [x] Application verified to load and function
- [x] README and all documentation read
- [x] Full source tree mapped (6,111 files)
- [x] Architecture audit completed (`docs/NEXTSIGNAL_ARCHITECTURE_AUDIT.md`)
- [x] Product spec created (`docs/NEXTSIGNAL_PRODUCT_SPEC.md`)
- [x] Data architecture created (`docs/NEXTSIGNAL_DATA_ARCHITECTURE.md`)
- [x] AI architecture created (`docs/NEXTSIGNAL_AI_ARCHITECTURE.md`)
- [x] All identified components categorized (keep/transform/extend)
- [x] All branding locations identified

**Key findings**:
- 193 panel components, 222+ service files
- Vanilla TypeScript (no framework)
- Existing `api/scenario/v1/` RPC — scenario engine already exists server-side
- Existing `ForecastPanel.ts` (50KB) — forecasting already functional
- AI integrations: Groq, OpenRouter, Anthropic, Ollama, ONNX Transformers
- Data: 578+ upstream hosts, Redis caching, 4-layer cache hierarchy
- Infrastructure: Vercel + Railway + Convex + Cloudflare

---

## STAGE 2: Brand Transformation 🔄

**Scope**: Replace all World Monitor branding with NextSignal identity.

**Files to modify**:
- `index.html` — Title, meta tags, OG, Twitter cards, JSON-LD, canonicals
- `package.json` — `"name"` field
- `src/config/variant.ts` — localStorage key
- `src/services/meta-tags.ts` — Dynamic meta management
- `public/favico/` — Favicon files (generate new ones)
- `public/robots.www.txt` — Sitemap URLs
- `public/llms.txt` — Product description
- `README.md` — Product description (preserve attribution)
- `.env.example` — Header comment
- `src/styles/main.css` — CSS variable names if any WM-specific
- Loading screen and app init messages

**New assets to create**:
- NextSignal favicon (SVG → PNG variants)
- NextSignal OG image (1200×630)
- Apple touch icon
- Android Chrome icons

**Preserve as-is**:
- `LICENSE` (AGPL-3.0, Elie Habib copyright)
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- Author attribution in README

---

## STAGE 3: UI Restructuring

**Scope**: New navigation, dashboard reframe, design system.

**New Navigation**:
```
PRIMARY: Overview | Markets | Signals | Scenarios | Watchlist | Alerts
SECONDARY: World | News | Settings
```

**Dashboard Reframe**:
- "Global situation" widget (new header design)
- "Important signals" section (Signal Engine feed)
- "Market movement" section (Market Radar snapshot)
- "Emerging scenarios" section (top Scenario cards)
- "Biggest risks" section (alert/risk summary)
- "Watchlist changes" section
- "What to watch next" (AI-generated watch items)

**Design System Updates**:
- Color palette: deep navy, dark graphite, electric blue, amber, signal green, risk red
- Typography: Inter/Outfit from Google Fonts
- NextSignal header with new branding
- Dark professional intelligence aesthetic

---

## STAGE 4: Market Radar

**Scope**: Strengthen existing market intelligence layer.

**Extend** existing `MarketPanel.ts`, `StockAnalysisPanel.ts`, `FxPanel.ts`, `EnergyComplexPanel.ts`

**New per-asset signals sidebar**:
- Related signals (from Signal Engine)
- Sentiment direction indicator
- Recent scenario changes

**Provider abstraction**:
- `MarketDataProvider` interface
- `FinnhubAdapter`, `YahooAdapter`, `CoinGeckoAdapter` implementations
- Graceful degradation when providers unavailable

---

## STAGE 5: Signal Engine

**Scope**: New "Signals" tab with structured signal feed.

**Extend** existing:
- `CrossSourceSignalsPanel.ts` — foundation
- `src/services/signal-aggregator.ts` — data layer
- `SignalModal.ts` — detail view

**New**:
- Signal feed UI (list view with filters)
- Signal type icons and direction indicators
- Signal detail panel with evidence chain
- Signal strength/confidence visualization

**Signal types to surface**:
- Geopolitical risk
- Supply disruption
- Market divergence
- Economic stress
- Military escalation
- Infrastructure threat
- Sentiment shift

---

## STAGE 6: Scenario Engine

**Scope**: New "Scenarios" tab with Bull/Base/Bear scenario display.

**Use existing** `api/scenario/v1/` RPC (already server-side!)

**Extend** existing `ForecastPanel.ts` — reframe as scenario cards

**New UI**:
- Entity search/selector (asset, country, sector, topic)
- Scenario card (Bull/Base/Bear with probabilities)
- Evidence chain display
- Invalidation conditions
- Confidence indicator
- "What changed?" comparison

---

## STAGE 7: "What Happens Next?"

**Scope**: Flagship feature — comprehensive scenario analysis for any entity.

**Pipeline**:
1. Entity selection UI
2. Context gathering (signals + market + news)
3. LLM scenario generation
4. Output validation (Zod)
5. Display pipeline:
   - Current State
   - Important Signals
   - Emerging Risks
   - Bull Case
   - Base Case
   - Bear Case
   - Potential Impacts
   - What to Watch

**Integration**: Uses Signal Engine + Scenario Engine + Impact Analyzer

---

## STAGE 8: Impact Map

**Scope**: Visual event → impact chain.

**Use existing** `SupplyChainPanel.ts` as visual foundation

**New**:
- Impact chain node graph
- Event → Direct → Second-order → Countries → Sectors → Assets
- Click-through from impact node to related signals

---

## STAGE 9: Watchlists

**Scope**: Enhance existing watchlist with signal/scenario integration.

**Extend** existing:
- `WatchlistTableView.ts` — add signal column, scenario column
- `WatchlistEditor.ts` — add entity type selection

**New**:
- Signal change indicators per watchlist item
- Scenario probability change badges
- Risk level indicator (low/medium/high/critical)

---

## STAGE 10: Alerts

**Scope**: Meaningful alert architecture.

**Extend** existing:
- `src/services/breaking-news-alerts.ts` — expand alert types

**New**:
- Alert evaluator (`alert-evaluator.ts`)
- Alert feed UI
- Alert settings (threshold configuration)
- Alert deduplication (1h window)

---

## STAGE 11: Performance / Security Hardening

**Scope**: Ensure production-grade security and performance.

**Security**:
- Audit all API key exposures
- Verify CSP is updated for new domains
- Verify `.env.example` has all new keys
- Run `npm audit fix` for vulnerabilities

**Performance**:
- Verify lazy loading for new components
- Verify caching for AI scenario calls
- Verify rate limiting on new endpoints

---

## STAGE 12: Production Polish

**Scope**: Final QA, documentation, build verification.

**Tasks**:
- Run `npm run typecheck` — fix all type errors
- Run `npm run lint` — fix all lint errors
- Run `npm run build:full` (or `npm run build`) — verify production build
- Update README for NextSignal
- Final design review
- Walkthrough documentation

---

## Known Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| Inventory-facts script needs source-attribution manifest update | Run `node scripts/source-attribution.mjs --write` before builds |
| 41 npm vulnerabilities (1 low, 16 moderate, 24 high) | Run `npm audit fix` in Stage 11; review breaking changes |
| Redis required for full data | Use graceful empty states in dev without Redis |
| Some API keys required for live data | All features have graceful degradation without keys |
| LLM scenario calls require Groq/OpenRouter key | Show "Analysis unavailable" state without keys |
| postinstall requires full env to succeed | Use `--ignore-scripts` in local dev |
