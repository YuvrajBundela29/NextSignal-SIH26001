import type { LandslideAlert, DistrictProfile, RiskScoreBreakdown } from './types';

class LandslideAlertsManager {
 private alerts: LandslideAlert[] = [];
 private listeners: Array<(alerts: LandslideAlert[]) => void> = [];

 constructor() {
 this.requestNotificationPermission();
 }

 public async requestNotificationPermission(): Promise<boolean> {
 if (typeof window !== 'undefined' && 'Notification' in window) {
 if (Notification.permission === 'default') {
 const perm = await Notification.requestPermission();
 return perm === 'granted';
 }
 return Notification.permission === 'granted';
 }
 return false;
 }

 public evaluateAndTriggerAlert(district: DistrictProfile, risk: RiskScoreBreakdown): LandslideAlert | null {
 if (risk.level === 'LOW') return null;

 const alertId = 'alert_' + district.id + '_' + risk.level.toLowerCase();
 const existing = this.alerts.find(a => a.id === alertId);

 const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

 let headlineEn = '';
 let headlineHi = '';
 let detailsEn = '';
 let detailsHi = '';
 let recommendedActionsEn: string[] = [];
 let recommendedActionsHi: string[] = [];

 if (risk.level === 'CRITICAL') {
 headlineEn = ` RED ALERT: Critical Landslide Risk in ${district.name} (${district.state})`;
 headlineHi = ` : ${district.nameHi} (${district.state}) `;
 detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Dominant Trigger: ${risk.dominantTrigger}. Rainfall: 24h ${risk.rainfallScore}%, Slope Factor: ${risk.slopeScore}%, Soil Saturation: ${risk.soilScore}%.`;
 detailsHi = ` : ${risk.compositeScore}/100 : ${risk.dominantTrigger} 24 , `;
 recommendedActionsEn = [
 'Evacuate vulnerable populations from slope toe and road cuttings immediately.',
 'Suspend commercial traffic on vulnerable highway passes.',
 'Deploy SDRF / NDRF quick response battalions to staging grounds.',
 `Contact DEOC Emergency Line: ${district.deocContact}`,
 ];
 recommendedActionsHi = [
 ' ',
 ' ',
 '/ ',
 ` : ${district.deocContact}`,
 ];
 } else if (risk.level === 'HIGH') {
 headlineEn = ` ORANGE WARNING: High Landslide Susceptibility in ${district.name}`;
 headlineHi = ` : ${district.nameHi} `;
 detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. High moisture accumulation and rainfall trigger active.`;
 detailsHi = ` : ${risk.compositeScore}/100 `;
 recommendedActionsEn = [
 'Issue travel warnings along ghat sections.',
 'Pre-position earth-moving machinery at critical chokepoints.',
 'Continuous 24/7 monitoring of river gauges and slope tension cracks.',
 ];
 recommendedActionsHi = [
 ' ',
 ' ',
 ' 24x7 ',
 ];
 } else {
 headlineEn = ` YELLOW ADVISORY: Moderate Landslide Watch in ${district.name}`;
 headlineHi = ` : ${district.nameHi} `;
 detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Antecedent moisture building up.`;
 detailsHi = ` : ${risk.compositeScore}/100 `;
 recommendedActionsEn = [
 'Inspect slope drainage culverts for blockages.',
 'Routine vigilance along vulnerable road stretches.',
 ];
 recommendedActionsHi = [
 ' ',
 ' ',
 ];
 }

 const alert: LandslideAlert = {
 id: alertId,
 districtId: district.id,
 districtName: district.name,
 districtNameHi: district.nameHi,
 state: district.state,
 level: risk.level,
 score: risk.compositeScore,
 timestamp: now,
 headlineEn,
 headlineHi,
 detailsEn,
 detailsHi,
 recommendedActionsEn,
 recommendedActionsHi,
 active: true,
 };

 if (!existing) {
 this.alerts.unshift(alert);
 this.notifySubscribers();
 this.dispatchBrowserNotification(alert);
 } else {
 Object.assign(existing, alert);
 }

 return alert;
 }

 private dispatchBrowserNotification(alert: LandslideAlert) {
 if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
 try {
 new Notification(alert.headlineEn, {
 body: alert.detailsEn,
 icon: '/favico/favicon-32x32.png',
 tag: alert.id,
 });
 } catch (e) {
 console.warn('[Notification API] Notification send failed:', e);
 }
 }
 }

 public getActiveAlerts(): LandslideAlert[] {
 return this.alerts;
 }

 public subscribe(cb: (alerts: LandslideAlert[]) => void): () => void {
 this.listeners.push(cb);
 cb(this.alerts);
 return () => {
 this.listeners = this.listeners.filter(l => l !== cb);
 };
 }

 private notifySubscribers() {
 for (const listener of this.listeners) {
 listener(this.alerts);
 }
 }
}

export const alertsManager = new LandslideAlertsManager();
