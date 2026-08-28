# NextSignal AI Architecture

> **Status**: v1.0 — Initial Design  
> **AGPL-3.0 Attribution**: Built on World Monitor (koala73/worldmonitor) © 2024-2026 Elie Habib.

---

## Architectural Philosophy

> **Clean AI Service Layer**
> 
> AI is not called randomly from components.
> All AI inputs are structured.
> All AI outputs use validated JSON schemas.
> Every AI conclusion is explainable and traceable.

---

## AI Service Modules

### Module 1: Signal Analyzer
**Location**: `src/services/signal-engine/signal-analyzer.ts` (new)  
**Purpose**: Convert raw events → structured signals

```typescript
interface SignalAnalyzerInput {
  events: GlobalEvent[];
  marketData: MarketQuote[];
  newsItems: NewsItem[];
  geoSignals: GeoSignal[];
  timeWindow: number;  // hours to analyze
}

interface SignalAnalyzerOutput {
  signals: Signal[];
  convergenceZones: ConvergenceZone[];
  topSignals: Signal[];  // ranked by importance
  analysisTimestamp: string;
}
```

Implementation uses:
- **Existing**: `src/services/signal-aggregator.ts` (geographic correlation)
- **Existing**: `src/workers/analysis.worker.ts` (Jaccard similarity clustering)
- **New**: Structured output schema + explainability layer

---

### Module 2: Scenario Generator
**Location**: `src/services/scenario-engine/scenario-generator.ts` (new)  
**Purpose**: Generate Bull/Base/Bear scenarios from signal context

Input schema:
```typescript
interface ScenarioGeneratorInput {
  entity: string;
  entityType: 'asset' | 'sector' | 'country' | 'topic' | 'global';
  relevantSignals: Signal[];
  marketContext: MarketQuote[];
  newsContext: NewsItem[];
  historicalContext?: string;
  timeHorizon: string;
}
```

Output schema (validated):
```typescript
interface ScenarioGeneratorOutput {
  entity: string;
  timeHorizon: string;
  cases: {
    bull: {
      probability: number;     // 0-100
      title: string;           // max 80 chars
      summary: string;         // max 300 chars
      keyDrivers: string[];    // 2-5 items
      catalysts: string[];     // 1-4 items
      risks: string[];         // 1-4 items
      invalidationConditions: string[];
      confidence: 'low' | 'medium' | 'high';
    };
    base: { ... };   // same structure
    bear: { ... };   // same structure
  };
  supportingSignals: string[];
  contradictingSignals: string[];
  evidenceChain: EvidenceSource[];
  disclaimer: string;  // Required: "These are probabilistic scenarios, not predictions."
  generatedBy: string;  // Model identifier
  generatedAt: string;
}
```

**Validation**: Zod schema validation before display  
**Language enforcement**: Post-processing to replace forbidden phrases

---

### Module 3: Impact Analyzer
**Location**: `src/services/impact-engine/impact-analyzer.ts` (new)  
**Purpose**: Map events to affected entities (countries, sectors, assets)

Input:
```typescript
interface ImpactAnalyzerInput {
  event: GlobalEvent;
  signals: Signal[];
  depth: 1 | 2 | 3;  // impact chain depth
}
```

Output:
```typescript
interface ImpactAnalyzerOutput {
  directImpacts: ImpactNode[];
  secondaryImpacts: ImpactNode[];
  tertiaryImpacts: ImpactNode[];
  affectedCountries: string[];
  affectedSectors: string[];
  affectedAssets: string[];
  impactChain: ImpactEdge[];
}

interface ImpactNode {
  id: string;
  label: string;
  type: 'event' | 'country' | 'sector' | 'asset' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  rationale: string;
}
```

---

### Module 4: Event Summarizer
**Location**: Existing `src/services/summarization.ts` — extend, don't rewrite  
**Purpose**: AI-powered news and event summarization

Existing capabilities:
- Brief generation (daily intelligence brief)
- News summarization (via Groq/OpenRouter)
- Story summarization (via LLM)
- Local summarization (via ONNX in browser)

NextSignal additions:
- "Why it matters" paragraph generation
- "What happened" → "What could happen" bridge
- Global situation summary for dashboard

---

### Module 5: Evidence Ranker
**Location**: `src/services/evidence/evidence-ranker.ts` (new)  
**Purpose**: Rank and prioritize evidence for scenario display

Input: Array of `EvidenceSource[]`  
Output: Ranked, deduplicated `EvidenceSource[]` with relevance scores

Ranking factors:
- Recency (more recent = higher score)
- Source credibility (known reliable sources > unknown)
- Semantic relevance to scenario (cosine similarity via ONNX embeddings)
- Geographic relevance to entity
- Signal type alignment

---

### Module 6: Alert Evaluator
**Location**: `src/services/alerts/alert-evaluator.ts` (new)  
**Purpose**: Evaluate whether a change warrants an alert

Input: Old state + new state for any tracked entity  
Output: `Alert | null`

Alert thresholds:
```typescript
const ALERT_THRESHOLDS = {
  scenarioProbabilityChange: 15,    // % change triggers alert
  signalStrengthEscalation: true,   // weak→strong triggers alert
  marketDivergenceFromNews: 10,     // % divergence triggers alert
  riskScoreChange: 20,              // CII score delta triggers alert
  volatilitySpike: 2.0,             // 2x normal volatility
};
```

Deduplication: Alert is suppressed if similar alert fired within 1 hour.

---

## LLM Provider Configuration

### Current Providers
| Provider | Model | Use Case | Key |
|---------|-------|---------|-----|
| Groq | llama-3.x / gemma-3 | Primary summarization | `GROQ_API_KEY` |
| OpenRouter | Configurable | Forecast enrichment | `OPENROUTER_API_KEY` |
| Anthropic | Claude 3.x | Analysis, reasoning | `ANTHROPIC_API_KEY` (via `@anthropic-ai/sdk`) |
| Ollama | Any local model | Self-hosted, no key | Local endpoint |

### Model Selection Logic
```
Scenario Generation:
  → Check FORECAST_LLM_PROVIDER_ORDER env
  → Try Groq first (speed)
  → Fallback to OpenRouter
  → Fallback to local Ollama
  → If all fail: show "Analysis unavailable" state

Browser-side:
  → ONNX MiniLM-L6 for embeddings
  → ONNX sentiment for signal direction
  → ONNX NER for entity extraction
```

---

## AI Output Validation (Critical)

All AI outputs MUST pass Zod validation before display:

```typescript
// Scenario output schema
const ScenarioOutputSchema = z.object({
  entity: z.string().min(1).max(100),
  timeHorizon: z.string(),
  cases: z.object({
    bull: ScenarioCaseSchema,
    base: ScenarioCaseSchema,
    bear: ScenarioCaseSchema,
  }),
  confidence: z.number().min(0).max(100),
  disclaimer: z.string(),
  generatedAt: z.string().datetime(),
});

// Case schema
const ScenarioCaseSchema = z.object({
  probability: z.number().min(0).max(100),
  title: z.string().max(80),
  summary: z.string().max(300),
  keyDrivers: z.array(z.string()).min(1).max(5),
  catalysts: z.array(z.string()).max(4),
  risks: z.array(z.string()).max(4),
  invalidationConditions: z.array(z.string()).min(1),
  confidence: z.enum(['low', 'medium', 'high']),
});
```

If validation fails:
1. Log error to Sentry
2. Retry once with explicit format instruction
3. If second attempt fails: show graceful "Analysis temporarily unavailable" state
4. Never show raw unvalidated AI output to users

---

## Probability Normalization

Bull + Base + Bear probabilities MUST sum to 100%:

```typescript
function normalizeProbabilities(raw: {bull: number; base: number; bear: number}): {
  bull: number; base: number; bear: number
} {
  const total = raw.bull + raw.base + raw.bear;
  if (total === 0) return { bull: 33, base: 34, bear: 33 };
  return {
    bull: Math.round((raw.bull / total) * 100),
    base: Math.round((raw.base / total) * 100),
    bear: 100 - Math.round((raw.bull / total) * 100) - Math.round((raw.base / total) * 100),
  };
}
```

---

## Forbidden Language Enforcement

Post-processing filter applied to ALL AI-generated text before display:

```typescript
const FORBIDDEN_PHRASES = [
  'will happen', 'will rise', 'will fall', 'will crash', 'will surge',
  'guaranteed', 'certain', 'definitely', 'absolutely',
  'I predict', 'prediction is', 'our forecast shows',
];

const REQUIRED_DISCLAIMERS = {
  scenario: 'These are probabilistic scenarios based on current signals, not guaranteed predictions.',
  probability: 'Probability estimates are derived from signal analysis and subject to change.',
};
```

---

## Browser-Side ML (ONNX / Transformers.js)

**Location**: `src/workers/ml.worker.ts` (existing — extend)

Current capabilities:
- MiniLM-L6 sentence embeddings (384-dim)
- Sentiment analysis (-1 to +1)
- Text summarization
- Named entity recognition (NER)
- In-worker vector store (IndexedDB)

NextSignal uses:
- Embeddings for evidence relevance ranking
- Sentiment for signal direction validation
- NER for entity extraction from news
- Vector store for "similar past signals" lookup

---

## AI Call Rate Management

```
Browser → Server:
  Max: 1 AI scenario call per entity per 5 minutes (client-enforced)
  Max: 10 scenario calls per minute per IP (server-enforced, Upstash)
  
AI Provider:
  Groq: 14,400 req/day free tier → ~10 req/min
  OpenRouter: 50 req/day free tier → use sparingly

Caching:
  Scenario results cached in Redis for 10 minutes
  Same entity + same signal context → return cached result
  Cache key: hash(entity + top_signal_ids)
```

---

## Explainability Chain

Every AI output must produce an `ExplainabilityRecord`:

```typescript
interface ExplainabilityRecord {
  outputType: 'scenario' | 'signal' | 'alert' | 'summary';
  conclusion: string;
  evidenceChain: {
    evidence: EvidenceSource;
    weight: number;         // 0-1, how much this contributed
    contribution: string;   // "This news item increased bear probability because..."
  }[];
  confidence: number;
  limitations: string[];    // "Analysis based on last 48h of signals"
  generatedAt: string;
  modelUsed: string;
}
```

This record is stored alongside every AI output and surfaced in the UI
when the user asks "Why?" or "Show evidence."

---

## Local AI Mode (Ollama)

When `OLLAMA_HOST` is configured:
- All LLM calls route to local Ollama instance
- No data leaves the user's machine
- Compatible with any Ollama-supported model
- Graceful fallback to cloud if Ollama unavailable

---

## AI Safety Principles

1. **Never present AI output as fact** — always as "scenario", "estimate", "based on signals"
2. **Always show confidence level** — low/medium/high
3. **Always show evidence** — traceable to specific news/data
4. **Always show invalidation conditions** — "This scenario is invalidated if..."
5. **Always show disclaimer** — "Not a financial or geopolitical forecast"
6. **Never auto-act on AI output** — always user-triggered
7. **Never fabricate data sources** — real URLs only, no hallucinated citations
