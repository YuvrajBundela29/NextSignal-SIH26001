# NextSignal Product Specification

> **Version**: 1.0  
> **Status**: Approved for Implementation  
> **AGPL-3.0 Attribution**: Built on World Monitor (koala73/worldmonitor) © 2024-2026 Elie Habib.

---

## Product Identity

**Name**: NextSignal  
**Tagline**: *See the signals. Understand the scenarios. Prepare for what's next.*  
**Category**: AI-Powered Scenario Intelligence Platform  
**Primary User**: Analysts, investors, researchers, decision-makers, strategic thinkers

---

## Core Product Thesis

NextSignal does not claim to know the future.

It analyzes current signals — from markets, geopolitics, news, economic data, and infrastructure events — and produces **probabilistic scenarios** about what could happen next.

The product helps users answer:
- **"What is changing?"** — Signal feed
- **"Why does it matter?"** — AI Explainability
- **"What could happen next?"** — Scenario Engine
- **"What assets or systems are affected?"** — Impact Map
- **"How confident are we?"** — Probability + Evidence

---

## Conceptual Pipeline

```
WORLD EVENTS
     ↓
NEWS & INTELLIGENCE
     ↓
MARKET DATA
     ↓
ECONOMIC SIGNALS
     ↓
GEOPOLITICAL SIGNALS
     ↓
AI CORRELATION
     ↓
SCENARIO GENERATION
     ↓
IMPACT ANALYSIS
     ↓
WATCHLIST / ALERTS
```

---

## Product Layers

### Layer 1: Global Monitor
*Preserve and improve existing world-monitoring functionality*

Monitors:
- Breaking events and geopolitical developments
- Conflict and military activity
- Economic signals and indicators
- Major news and media intelligence
- Infrastructure disruptions
- Natural disasters
- Aviation and maritime events
- Cyber threats

Display hierarchy:
- **WHAT HAPPENED** — event title
- **WHEN** — timestamp + recency
- **WHERE** — geographic context
- **WHY IT MATTERS** — AI-generated significance assessment

### Layer 2: Market Radar
*Strengthen existing market intelligence*

Monitored assets:
- Stocks (individual equities)
- ETFs
- Indices (S&P 500, Nasdaq, Dow, international)
- Commodities (oil, gold, silver, agricultural)
- Crypto (major + DeFi + AI tokens)
- Currencies/FX

Per-asset display:
- Current price + change
- Momentum indicator
- Volatility
- Recent relevant news
- Market sentiment
- Related global events
- Sector context
- Related signals

**Provider abstraction**: All market data through normalized `MarketDataProvider` interface.

### Layer 3: Signal Engine
*Convert raw events into structured, actionable signals*

Signal schema:
```typescript
interface Signal {
  id: string;
  type: SignalType;
  direction: 'bullish' | 'bearish' | 'neutral' | 'risk';
  strength: 'weak' | 'moderate' | 'strong' | 'critical';
  confidence: number;  // 0–100
  title: string;
  summary: string;
  detectedAt: string;  // ISO timestamp
  geographicScope: string[];  // country codes
  affectedSectors: string[];
  affectedAssets: string[];
  relatedEvents: string[];
  evidenceSources: EvidenceSource[];
  explainability: string;  // "Why this signal matters"
}
```

Signal types:
- `geopolitical_risk`
- `supply_disruption`
- `market_divergence`
- `economic_stress`
- `regulatory_change`
- `military_escalation`
- `infrastructure_threat`
- `technology_disruption`
- `climate_event`
- `sentiment_shift`

### Layer 4: Scenario Engine
*AI scenario generation — the core differentiator*

For any entity (asset, sector, country, topic), generate:

**BULL CASE** — optimistic probability scenario  
**BASE CASE** — most-likely probability scenario  
**BEAR CASE** — downside risk scenario  

Scenario schema:
```typescript
interface Scenario {
  scenarioId: string;
  entity: string;         // e.g. "NVDA", "Oil", "Iran", "AI Chips"
  entityType: 'asset' | 'sector' | 'country' | 'topic';
  createdAt: string;
  updatedAt: string;
  timeHorizon: string;    // e.g. "1-4 weeks"
  cases: {
    bull: ScenarioCase;
    base: ScenarioCase;
    bear: ScenarioCase;
  };
  confidence: number;
  invalidationConditions: string[];
  evidenceSources: EvidenceSource[];
}

interface ScenarioCase {
  label: 'bull' | 'base' | 'bear';
  probability: number;    // 0–100 (estimated)
  title: string;
  summary: string;
  keyDrivers: string[];
  catalysts: string[];
  risks: string[];
  supportingSignals: string[];
  opposingSignals: string[];
  likelyImpact: string;
  invalidationConditions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
}
```

**Language requirements**:
- Use: "scenario", "probability", "signal", "risk", "potential", "estimated", "based on current evidence"
- Avoid: "will happen", "guaranteed", "certain", "will rise", "will crash"

### Layer 5: "What Happens Next?"
*Flagship feature*

User selects: asset / country / sector / topic / or global situation

NextSignal produces:
1. **Current State** — What is happening right now
2. **Important Signals** — Key signals detected
3. **Emerging Risks** — Potential downside risks
4. **Bull Case** — Optimistic scenario + probability
5. **Base Case** — Most likely scenario + probability
6. **Bear Case** — Downside scenario + probability
7. **Potential Impacts** — What gets affected
8. **What to Watch Next** — Key catalysts and indicators

### Layer 6: Impact Map
*Visual event → impact chain*

```
EVENT
  ↓ (direct impact)
FIRST-ORDER EFFECTS
  ↓ (cascading effects)
SECOND-ORDER EFFECTS
  ↓
AFFECTED COUNTRIES (geographic)
  ↓
AFFECTED SECTORS
  ↓
AFFECTED ASSETS
```

Visual: Node graph / Sankey-style chain, not a wall of text.

### Layer 7: Watchlist
*User-defined monitoring of entities*

Watchable entity types:
- Stocks / ETFs / Crypto
- Commodities
- Countries
- Sectors
- Topics / themes

Per-watchlist-item shows:
- Current status
- Recent signal changes
- Scenario probability changes
- Sentiment direction
- Important news
- Risk level (low/medium/high/critical)

### Layer 8: Alerts
*Meaningful signal notifications*

Alert triggers (not noisy):
- Major signal detected (strength ≥ strong)
- Scenario probability changed ≥15%
- Market/news divergence detected
- Geopolitical risk spike
- Unusual volatility detected
- Important catalyst event
- New invalidation condition triggered

Alert schema:
```typescript
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
}
```

### Layer 9: AI Explainability
*Every AI conclusion is traceable*

For every important AI output:
- Show **evidence chain** (evidence 1, 2, 3...)
- Show **how each signal contributed** to the conclusion
- Show **confidence level** and what would change it
- Show **invalidation conditions**
- Show **previous state** ("what changed?")

Format: "NextSignal increased downside probability because: [evidence 1], [evidence 2], [evidence 3]"

---

## Navigation

### Primary
| Item | Description |
|------|-------------|
| Overview | Dashboard — what's happening, what changed, what matters |
| Markets | Market Radar — asset monitoring |
| Signals | Signal Engine — structured signals feed |
| Scenarios | Scenario Engine + "What Happens Next?" |
| Watchlist | User-defined entity monitoring |
| Alerts | Alert feed |

### Secondary
| Item | Description |
|------|-------------|
| World | Global Monitor map view |
| News | News intelligence feed |
| Settings | User preferences |

---

## Dashboard Design

Answers in seconds:
- **WHAT IS HAPPENING?** — Global situation summary
- **WHAT CHANGED?** — Recent signals delta
- **WHAT MATTERS?** — AI-ranked importance
- **WHAT COULD HAPPEN NEXT?** — Top emerging scenario

Sections:
1. Global situation widget (breaking events, live map summary)
2. Important signals (top 5 signals of the moment)
3. Market movement (key asset moves with signal context)
4. Emerging scenarios (top 2-3 developing scenarios)
5. Biggest risks (risk-ranked alert summary)
6. Watchlist changes (user entities with recent changes)
7. "What to Watch Next" (AI-generated watch list)

---

## Design Language

**Visual identity**: Dark, professional intelligence environment
- Color palette: Deep navy (#0a0f1e), dark graphite (#111827), electric blue (#1d6ed8), alert amber (#f59e0b), signal green (#10b981), risk red (#ef4444)
- Typography: Inter / Outfit (Google Fonts) — no browser defaults
- Density: High information density, strong hierarchy
- Animation: Subtle micro-animations only — no flashy effects
- Mode: Dark primary (light mode optional)

**Tone**: Professional intelligence tool, not AI demo
- "Scenario probability" not "AI prediction"
- "Based on current evidence" not "We predict"
- "Signal detected" not "Alert!"

---

## Language Policy

### REQUIRED phrasing (probabilistic)
- "estimated probability"
- "based on current signals"
- "scenario suggests"
- "potential risk"
- "evidence indicates"
- "confidence: medium"
- "subject to change as new signals emerge"

### PROHIBITED phrasing (deterministic)
- "will happen"
- "guaranteed"
- "certain"
- "will rise"/"will fall"
- "prediction"
- "forecast" (when implying certainty)

---

## Quality Standards

### Technical
- No fabricated market data
- No fake probabilities in production UI
- No silently generated mock data
- Graceful empty states when providers unavailable
- Circuit breakers on all external calls
- Validated AI outputs before display

### Product
- Every AI output must be explainable
- Every probability must have evidence
- Every scenario must have invalidation conditions
- Every alert must be actionable
- Every signal must have a source

---

## Open Source Attribution

NextSignal is built on **World Monitor** (open-source, AGPL-3.0):
- Original author: **Elie Habib** ([@koala73](https://github.com/koala73))
- License: **AGPL-3.0-only**
- Source: https://github.com/koala73/worldmonitor
- Modifications: Product transformation to NextSignal scenario intelligence platform

All AGPL-3.0 obligations apply. Source code must remain available.
