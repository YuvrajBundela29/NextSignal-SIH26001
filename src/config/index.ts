export { SITE_VARIANT } from './variant';

export {
  IDLE_PAUSE_MS,
  REFRESH_INTERVALS,
  MONITOR_COLORS,
  STORAGE_KEYS,
  DEFAULT_MAP_MODE,
  type MapModePreference,
  SECTORS,
  COMMODITIES,
  MARKET_SYMBOLS,
} from './variants/base';

export const CRYPTO_MAP = {} as const;
export const STOCK_CATALOG = [] as const;
export const STOCK_EXCHANGES = [] as const;
export const FINANCIAL_CENTERS = [] as const;
export const CENTRAL_BANKS = [] as const;
export const COMMODITY_HUBS = [] as const;
export const PIPELINES = [] as const;
export const PIPELINE_COLORS = {} as const;
export const STRATEGIC_WATERWAYS = [] as const;
export const PORTS = [] as const;
export const GAMMA_IRRADIATORS = [] as const;
export const INTEL_HOTSPOTS = [] as const;
export const CONFLICT_ZONES = [] as const;

export {
  SOURCE_TIERS,
  getSourceTier,
  SOURCE_TYPES,
  getSourceType,
  getSourcePropagandaRisk,
  getSourceTierBadgeTitle,
  describePropagandaBadge,
  hasDeclaredPropagandaRisk,
  hasDeclaredSourceType,
  hasReviewedPropagandaRisk,
  hasReviewedSourceType,
  listConfiguredFeedNames,
  getFeedProvenanceState,
  UNREVIEWED_SOURCE_RISK,
  ALERT_KEYWORDS,
  ALERT_EXCLUSIONS,
  type SourceRiskProfile,
  type SourceType,
  FEEDS,
  INTEL_SOURCES,
  CANONICAL_FEEDS,
} from './feeds';

export {
  DEFAULT_PANELS,
  DEFAULT_MAP_LAYERS,
  MOBILE_DEFAULT_MAP_LAYERS,
  LAYER_TO_SOURCE,
  ALL_PANELS,
  VARIANT_DEFAULTS,
  VARIANT_PANEL_OVERRIDES,
  getEffectivePanelConfig,
  getInitialPanelSettingsForVariant,
  isPanelInVariantDefaults,
  isPanelEntitled,
  enforceFreePanelLimit,
  countFreePanelCapUsage,
  isFreePanelCapCounted,
  restoreFreeMapPanelAccess,
  restoreProGatedPanels,
  userSetPanelEnabled,
  shouldDeferFreeTierEnforcement,
  FREE_MAX_PANELS,
  FREE_MAX_SOURCES,
} from './panels';
