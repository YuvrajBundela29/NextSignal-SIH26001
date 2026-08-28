# NextSignal

**AI-Powered Scenario Intelligence** — See the signals. Understand the scenarios. Prepare for what's next.

NextSignal analyzes global signals from markets, geopolitics, news, and economic data, and produces **probabilistic scenarios** about what could happen next. It helps answer:

- **"What is changing?"**
- **"Why does it matter?"**
- **"What could happen next?"**
- **"What assets, sectors, or systems are affected?"**

---

## What NextSignal Does

- **Signal Engine** — Converts raw events into structured, actionable signals (geopolitical risk, supply disruption, market divergence, economic stress, and more)
- **Scenario Engine** — Generates AI-powered Bull/Base/Bear scenarios for assets, countries, sectors, and global topics
- **"What Happens Next?"** — Flagship feature: comprehensive probabilistic scenario analysis for any entity
- **Market Radar** — Live monitoring of stocks, ETFs, crypto, commodities, currencies with signal context
- **Impact Map** — Visual chain from event → direct impacts → second-order effects → affected assets
- **Watchlist** — User-defined entity monitoring with signal and scenario change tracking
- **Global Monitor** — Real-time world event monitoring (conflict, disasters, aviation, maritime, cyber)
- **AI Explainability** — Every AI conclusion traced to supporting evidence

> **Important**: NextSignal produces probabilistic scenarios, not guaranteed predictions. All outputs are labeled with confidence levels, evidence sources, and invalidation conditions.

---

## Built On

NextSignal is built on the **[World Monitor](https://github.com/koala73/worldmonitor)** open-source infrastructure — a real-time global intelligence dashboard by **[Elie Habib](https://github.com/koala73)**.

**License**: AGPL-3.0-only  
**Original author**: Elie Habib — Copyright © 2024-2026. All rights reserved.  
**Original source**: https://github.com/koala73/worldmonitor

All AGPL-3.0 obligations apply. Modified source code is available in this repository.

---

## Quick Start

```bash
git clone <this-repo>
cd nextsignal
npm install --ignore-scripts
npm run dev
```

Open [localhost:3000](http://localhost:3000). The application runs without environment variables, with graceful degradation for data sources that require API keys.

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Vanilla TypeScript, Vite, globe.gl + Three.js, deck.gl + MapLibre GL |
| **Desktop** | Tauri 2 (Rust) with Node.js sidecar |
| **AI/ML** | Groq / OpenRouter / Anthropic (Claude) / Ollama, Transformers.js (browser-side ONNX) |
| **API Contracts** | Protocol Buffers + sebuf HTTP annotations |
| **Deployment** | Vercel Edge Functions, Railway relay, Tauri, PWA |
| **Caching** | Redis (Upstash), 4-layer cache hierarchy, CDN, service worker |
| **Auth** | Clerk.js, API key validation, Convex entitlements |

---

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

| Variable | Purpose |
|---------|---------|
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | Redis cache (required for production) |
| `GROQ_API_KEY` | AI summarization + scenario generation |
| `OPENROUTER_API_KEY` | AI fallback |
| `FINNHUB_API_KEY` | Stock market data |
| `COINGECKO_API_KEY` | Crypto data |

See `.env.example` for the complete list of 100+ configuration options.

---

## Development

```bash
npm run dev              # Start dev server (all variants)
npm run dev:finance      # Finance variant
npm run typecheck        # TypeScript check
npm run lint             # Biome lint
```

Note: `npm install` (without `--ignore-scripts`) requires the full environment (inventory facts, blog-site install). Use `--ignore-scripts` for local development.

---

## Documentation

| Document | Description |
|---------|-------------|
| [Architecture Audit](docs/NEXTSIGNAL_ARCHITECTURE_AUDIT.md) | Full audit of the World Monitor infrastructure |
| [Product Specification](docs/NEXTSIGNAL_PRODUCT_SPEC.md) | NextSignal product design and feature spec |
| [Data Architecture](docs/NEXTSIGNAL_DATA_ARCHITECTURE.md) | Data flow, provider interfaces, caching |
| [AI Architecture](docs/NEXTSIGNAL_AI_ARCHITECTURE.md) | AI service layer, validation, explainability |
| [Roadmap](docs/NEXTSIGNAL_ROADMAP.md) | Implementation stages and status |

---

## Data Sources

NextSignal aggregates from the following upstream sources (preserved from World Monitor infrastructure):

- **Conflict/Geopolitical**: ACLED, UCDP, GDELT, CII v8
- **Markets**: Finnhub, Yahoo Finance, CoinGecko
- **Economic**: FRED, IMF, World Bank, FAO
- **Aviation**: OpenSky Network, Wingbits (ADS-B), GPSJAM
- **Maritime**: AIS relay, dark vessel detection
- **Natural Disasters**: NASA EONET, NASA FIRMS, seismology feeds
- **News**: 500+ curated RSS feeds, Telegram intel, X intel
- **AI**: Groq, OpenRouter, Anthropic Claude, local Ollama

---

## Security

- API keys never exposed in frontend code
- Environment variables for all secrets
- Content Security Policy enforced (3 sources in sync)
- Rate limiting on all API endpoints (Upstash)
- Input validation with Zod schemas
- AI output validated before display

See [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

---

## License

**AGPL-3.0-only** — Commercial use permitted when AGPL copyleft and source-availability obligations are met.

| Use Case | Allowed? |
|----------|----------|
| Personal / research / educational | Yes, under AGPL-3.0 |
| Self-hosted instance | Yes, under AGPL-3.0 |
| Fork and modify | Yes, share source under AGPL-3.0 when required |
| Commercial use / SaaS | Yes, under AGPL-3.0 when you comply with AGPL obligations |
| Private-source proprietary use | Separate commercial license needed |

See [LICENSE](LICENSE) for the full text.

---

## Attribution

NextSignal is a product transformation of **World Monitor**.

**Original Work**: World Monitor  
**Original Author**: Elie Habib — https://github.com/koala73  
**Original Repository**: https://github.com/koala73/worldmonitor  
**License**: AGPL-3.0-only  
**Copyright**: © 2024-2026 Elie Habib. All rights reserved.

This product modification is made in compliance with AGPL-3.0 terms.
The original source code and all modifications are available in this repository.
