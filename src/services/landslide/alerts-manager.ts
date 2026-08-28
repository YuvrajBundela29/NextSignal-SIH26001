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
      headlineEn = `🚨 RED ALERT: Critical Landslide Risk in ${district.name} (${district.state})`;
      headlineHi = `🚨 रेड अलर्ट: ${district.nameHi} (${district.state}) में गंभीर भूस्खलन का खतरा`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Dominant Trigger: ${risk.dominantTrigger}. Rainfall: 24h ${risk.rainfallScore}%, Slope Factor: ${risk.slopeScore}%, Soil Saturation: ${risk.soilScore}%.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100। मुख्य ट्रिगर: ${risk.dominantTrigger}। 24 घंटे की बारिश, ढलान और मिट्टी की अत्यधिक संतृप्ति दर्ज।`;
      recommendedActionsEn = [
        'Evacuate vulnerable populations from slope toe and road cuttings immediately.',
        'Suspend commercial traffic on vulnerable highway passes.',
        'Deploy SDRF / NDRF quick response battalions to staging grounds.',
        `Contact DEOC Emergency Line: ${district.deocContact}`,
      ];
      recommendedActionsHi = [
        'खड़ी ढलानों और सड़क किनारे की बस्तियों से तुरंत लोगों को सुरक्षित स्थान पर पहुंचाएं।',
        'संवेदनशील पहाड़ी मार्गों पर भारी वाणिज्यिक वाहनों की आवाजाही तुरंत रोकें।',
        'एनडीआरएफ/एसडीआरएफ की त्वरित प्रतिक्रिया टीमों को अलर्ट पर रखें।',
        `जिला आपातकालीन संपर्क: ${district.deocContact}`,
      ];
    } else if (risk.level === 'HIGH') {
      headlineEn = `⚠️ ORANGE WARNING: High Landslide Susceptibility in ${district.name}`;
      headlineHi = `⚠️ ऑरेंज चेतावनी: ${district.nameHi} में उच्च भूस्खलन संवेदनशीलता`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. High moisture accumulation and rainfall trigger active.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100। अत्यधिक नमी और भारी बारिश के कारण ढलान अस्थिरता।`;
      recommendedActionsEn = [
        'Issue travel warnings along ghat sections.',
        'Pre-position earth-moving machinery at critical chokepoints.',
        'Continuous 24/7 monitoring of river gauges and slope tension cracks.',
      ];
      recommendedActionsHi = [
        'पहाड़ी घाट मार्गों पर यात्रियों के लिए सतर्कता परामर्श जारी करें।',
        'महत्वपूर्ण स्थानों पर जेसीबी और मलबा हटाने की मशीनें तैयार रखें।',
        'नदी के स्तर और ढलान पर बनने वाली दरारों की 24x7 निगरानी करें।',
      ];
    } else {
      headlineEn = `ℹ️ YELLOW ADVISORY: Moderate Landslide Watch in ${district.name}`;
      headlineHi = `ℹ️ येलो एडवाइजरी: ${district.nameHi} में मध्यम भूस्खलन निगरानी`;
      detailsEn = `Composite Risk Score: ${risk.compositeScore}/100. Antecedent moisture building up.`;
      detailsHi = `समग्र जोखिम स्कोर: ${risk.compositeScore}/100। मिट्टी में नमी का स्तर बढ़ रहा है।`;
      recommendedActionsEn = [
        'Inspect slope drainage culverts for blockages.',
        'Routine vigilance along vulnerable road stretches.',
      ];
      recommendedActionsHi = [
        'सड़क किनारे जल निकासी नालियों के अवरोधों की जांच करें।',
        'संवेदनशील पहाड़ी रास्तों पर सामान्य सतर्कता बनाए रखें।',
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
