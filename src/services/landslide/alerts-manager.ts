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

    const dNameHi = district.nameHi || district.name;

    if (risk.level === 'CRITICAL') {
      headlineEn = `RED ALERT: Critical Landslide Risk in ${district.name} (${district.state})`;
      headlineHi = `लाल चेतावनी: ${dNameHi} (${district.state}) में अत्यधिक भूस्खलन खतरा`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Dominant Trigger: ${risk.dominantTrigger}. Rainfall: ${risk.rainfallScore}%, Soil Saturation: ${risk.soilScore}%.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100. मुख्य कारण: ${risk.dominantTrigger}. वर्षा: ${risk.rainfallScore}%, मृदा संतृप्ति: ${risk.soilScore}%.`;
      recommendedActionsEn = [
        'Evacuate vulnerable populations from slope toe and road cuttings immediately.',
        'Suspend commercial traffic on vulnerable highway passes.',
        'Deploy SDRF / NDRF quick response battalions to staging grounds.',
        `Contact DEOC Emergency Line: ${district.deocContact}`,
      ];
      recommendedActionsHi = [
        'संवेदनशील ढलानों और सड़क किनारों से नागरिकों को तुरंत सुरक्षित स्थान पर पहुंचाएं।',
        'संवेदनशील पहाड़ी दर्रों पर वाणिज्यिक यातायात तुरंत रोकें।',
        'एसडीआरएफ / एनडीआरएफ की त्वरित प्रतिक्रिया टीमों को तैनात करें।',
        `जिला आपदा नियंत्रण कक्ष से संपर्क करें: ${district.deocContact}`,
      ];
    } else if (risk.level === 'HIGH') {
      headlineEn = `ORANGE WARNING: High Landslide Susceptibility in ${district.name}`;
      headlineHi = `नारंगी चेतावनी: ${dNameHi} में उच्च भूस्खलन संवेदनशीलता`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. High moisture accumulation and rainfall trigger active.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100. उच्च नमी संचय और वर्षा ट्रिगर सक्रिय।`;
      recommendedActionsEn = [
        'Issue travel warnings along ghat sections.',
        'Pre-position earth-moving machinery at critical chokepoints.',
        'Continuous 24/7 monitoring of river gauges and slope tension cracks.',
      ];
      recommendedActionsHi = [
        'घाट और पहाड़ी मार्गों पर यात्रा चेतावनी जारी करें।',
        'संवेदनशील चोकपॉइंट्स पर अर्थ-मूविंग मशीनरी तैयार रखें।',
        'नदी के स्तर और जमीन की दरारों की 24/7 निगरानी करें।',
      ];
    } else {
      headlineEn = `YELLOW ADVISORY: Moderate Landslide Watch in ${district.name}`;
      headlineHi = `पीली सलाह: ${dNameHi} में मध्यम भूस्खलन निगरानी`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Antecedent moisture building up.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100. नमी का स्तर बढ़ रहा है।`;
      recommendedActionsEn = [
        'Inspect slope drainage culverts for blockages.',
        'Routine vigilance along vulnerable road stretches.',
      ];
      recommendedActionsHi = [
        'पहाड़ी जल निकासी नालों की सफाई की जांच करें।',
        'संवेदनशील सड़क मार्गों पर नियमित सतर्कता बनाए रखें।',
      ];
    }

    const alert: LandslideAlert = {
      id: alertId,
      districtId: district.id,
      districtName: district.name,
      districtNameHi: dNameHi,
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

  public subscribe(fn: (alerts: LandslideAlert[]) => void): () => void {
    this.listeners.push(fn);
    fn(this.alerts);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public getActiveAlerts(): LandslideAlert[] {
    return this.alerts;
  }

  private notifySubscribers() {
    this.listeners.forEach(fn => fn(this.alerts));
  }

  private dispatchBrowserNotification(alert: LandslideAlert) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(alert.headlineEn, {
          body: `Level: ${alert.level} (${alert.score}/100). ${alert.detailsEn}`,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Browser notification failed:', err);
      }
    }
  }
}

export const alertsManager = new LandslideAlertsManager();
