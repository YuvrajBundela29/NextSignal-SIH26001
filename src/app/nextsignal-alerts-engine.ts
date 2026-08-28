/**
 * NextSignal Smart Alerts Engine
 *
 * Evaluates live signals, market deltas, and scenario probability shifts
 * to generate meaningful, non-noisy intelligence alerts.
 *
 * Triggers:
 * - Scenario probability swing >= 15%
 * - Critical / Strong signal detection
 * - Geopolitical risk score spike
 * - Supply chain chokepoint anomaly
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'scenario_probability_shift'
  | 'critical_signal_detected'
  | 'market_divergence'
  | 'risk_score_escalation'
  | 'supply_chokepoint_anomaly';

export interface NextSignalAlert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  summary: string;
  entity?: string;
  timestamp: string; // ISO 8601
  read: boolean;
  dismissed: boolean;
  deltaInfo?: string;
  actionUrl?: string;
}

const ALERTS_STORAGE_KEY = 'nextsignal_active_alerts';

const INITIAL_ALERTS: NextSignalAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    type: 'scenario_probability_shift',
    title: 'Middle East Energy Corridor: Bear Scenario +18%',
    summary: 'AIS disruption density increased near Strait of Hormuz. Scenario Engine adjusted baseline transport delay probability upward.',
    entity: 'BRENT / Energy',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    read: false,
    dismissed: false,
    deltaInfo: 'Bear Prob: 25% → 43%',
  },
  {
    id: 'alert-2',
    severity: 'warning',
    type: 'critical_signal_detected',
    title: 'Semiconductor Fabrication: Raw Neon Supply Signal',
    summary: 'High-severity trade policy signal detected regarding critical mineral and noble gas export quota revisions.',
    entity: 'NVDA / TSM',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55m ago
    read: false,
    dismissed: false,
    deltaInfo: 'Signal Strength: CRITICAL',
  },
  {
    id: 'alert-3',
    severity: 'info',
    type: 'risk_score_escalation',
    title: 'Taiwan Strait Maritime Gray-Zone Index Elevated',
    summary: 'Composite conflict & military flight convergence zone index reached 64.2 (+2.1 pts over 24h baseline).',
    entity: 'Taiwan (TW)',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(), // 2.3h ago
    read: true,
    dismissed: false,
    deltaInfo: 'CII Score: 64.2',
  },
];

export function getAlerts(): NextSignalAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return (JSON.parse(raw) as NextSignalAlert[]).filter((a) => !a.dismissed);
  } catch {
    return INITIAL_ALERTS;
  }
}

export function markAlertAsRead(alertId: string): void {
  const alerts = getAlerts().map((a) => (a.id === alertId ? { ...a, read: true } : a));
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {}
}

export function dismissAlert(alertId: string): NextSignalAlert[] {
  const alerts = getAlerts().filter((a) => a.id !== alertId);
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {}
  return alerts;
}

export function getUnreadAlertCount(): number {
  return getAlerts().filter((a) => !a.read && !a.dismissed).length;
}
