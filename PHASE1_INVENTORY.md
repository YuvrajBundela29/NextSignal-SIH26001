# Phase 1: Project Isolation & File Inventory
**Project**: NextSignal-SIH26001  
**Problem Statement**: SIH26001 — AI-Based Early Warning and Landslide Risk Monitoring System in North Eastern Region (NER), India  
**Sponsoring Ministry**: Ministry of Development of North Eastern Region (MDoNER)

---

## 1. Repository Status
- **Source Project**: `Y:\Dev\projects\nextsignal` (Preserved 100% untouched)
- **New Project**: `Y:\Dev\projects\NextSignal-SIH26001`
- **Git Status**: Initialized fresh Git repository
- **Initial Commit**: `3087ab5b3fedd4d99e9ea9caa574ad4694ae398b` ("fork: base copy from NextSignal")

---

## 2. File Inventory & Categorization

### A. Reusable Core (To Retain & Adapt)

| Category | File / Module | Purpose in SIH26001 |
| :--- | :--- | :--- |
| **Map & Geospatial Engine** | src/components/Map.ts, MapContainer.ts, MapPopup.ts, MapContextMenu.ts | 2D geospatial visualization of Northeast India (8 states), district boundary overlays, landslide susceptibility heatmaps |
| **Local LLM / AI Advisory** | src/services/ollama-models.ts, src/components/ChatAnalystPanel.ts, src/services/summarization.ts | Local AI disaster advisory terminal (Ollama integration for explainable risk drivers, plain-language NDRF/SDRF advisories) |
| **Dashboard Framework** | src/components/Panel.ts, PanelTabBar.ts, MobilePanelNav.ts, VirtualList.ts, src/styles/ | Professional dark glassmorphism layout, modular panel grid, responsive mobile/desktop HUD |
| **State / District HUD** | src/components/CountryBriefPanel.ts, RegionalIntelligenceBoard.ts, LatestBriefPanel.ts | Repurpose into **District Landslide Risk HUD** (real-time risk score, sensor breakdown, 72h weather trends) |
| **Alerting & Early Warning** | src/services/push-notifications.ts, reaking-news-alerts.ts, src/components/BreakingNewsBanner.ts | Early warning alert dispatch (Browser Push notifications, live danger banner, threshold triggers) |
| **Live Telemetry & Ingestion** | src/services/weather.ts (Open-Meteo), src/services/earthquakes.ts (USGS), smart-poll-loop.ts, persistent-cache.ts | Ingestion pipelines for precipitation, soil moisture, and Himalayan seismic activity |
| **Bilingual Localization** | src/locales/en.json, src/locales/hi.json, src/services/i18n.ts | Dual-language interface (English & Hindi) for citizen safety and national authority operations |

---

### B. Strip Candidates (To Stash in /legacy during Phase 2)

| Subsystem | Components & Services to Strip | Rationale |
| :--- | :--- | :--- |
| **Financial & Commodities** | MarketPanel, ETFFlowsPanel, YieldCurvePanel, StockAnalysisPanel, StockBacktestPanel, DailyMarketBriefPanel, CotPositioningPanel, WsbTickerScannerPanel, FxPanel, GoldIntelligencePanel, services/market/, eatures/stock-research/ | Irrelevant to landslide disaster monitoring |
| **Military & Strategic** | MilitaryCorrelationPanel, StrategicPosturePanel, usni-fleet.ts, military-bases.ts, military-flights.ts, military-vessels.ts, military-surge.ts, OrefSirensPanel.ts, services/military/ | Out of scope for MDoNER disaster management |
| **Aviation & Marine** | AirlineIntelPanel, AviationCommandBar.ts, live-tankers.ts, wingbits.ts, services/aviation/, services/maritime/ | Out of scope |
| **Geopolitical & Foreign Intel** | PredictionPanel, SanctionsPressurePanel, UcdpEventsPanel, HormuzPanel, GulfEconomiesPanel, cross-strait-activity-summary.ts, ChinaActivityNowcastPanel.ts, TelegramIntelPanel, XIntelPanel | Out of scope |
| **Cyber & Telecom** | InternetDisruptionsPanel, SecurityAdvisoriesPanel, cable-activity.ts, cable-health.ts, services/cyber/ | Out of scope |
| **Energy & Infrastructure** | PipelineStatusPanel, EnergyComplexPanel, EnergyDisruptionsPanel, OilInventoriesPanel, FuelPricesPanel, RenewableEnergyPanel | Out of scope |
| **Foreign Locales (26 languages)** | r, g, cs, de, el, es, a, r, hr, hu, it, ja, ko, 
l, pl, pt, o, u, sv, sw, 	h, 	r, uk, i, zh, zh-TW | SIH26001 target is NER + National demo (en + hi only) |
