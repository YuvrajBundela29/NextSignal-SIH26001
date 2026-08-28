import type { DistrictProfile, RiskScoreBreakdown, WeatherTelemetry } from '../../services/landslide/types';

export class CitizenView {
  private container: HTMLElement;
  private isHi = false;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
  }

  public render(district: DistrictProfile, risk: RiskScoreBreakdown, weather: WeatherTelemetry) {
    const isDanger = risk.level === 'CRITICAL' || risk.level === 'HIGH';
    const isCaution = risk.level === 'MODERATE';

    const statusTitle = isDanger
      ? (this.isHi ? '⚠️ भारी भूस्खलन खतरा — सतर्क रहें' : '⚠️ HIGH LANDSLIDE DANGER — STAY ALERT')
      : isCaution
      ? (this.isHi ? '🟡 मध्यम जोखिम — सावधानी बरतें' : '🟡 MODERATE RISK — EXERCISE CAUTION')
      : (this.isHi ? '🟢 स्थिति सुरक्षित एवं सामान्य है' : '🟢 AREA SAFE & NORMAL');

    const statusBg = isDanger ? '#ef4444' : isCaution ? '#eab308' : '#22c55e';
    const districtName = this.isHi ? district.nameHi : district.name;

    const citizenAdvisories = isDanger
      ? (this.isHi
          ? [
              'खड़ी ढलानों, नदी किनारों और जलभराव वाले क्षेत्रों से तुरंत दूर रहें।',
              'पहाड़ी मार्गों और घाट सड़कों पर अनावश्यक यात्रा तुरंत रद्द करें।',
              'यदि दीवारों में नई दरारें या मिट्टी का खिसकना दिखे, तो तुरंत घर खाली करें।',
              'आपातकालीन किट (टॉर्च, दवाएं, पानी, जरूरी कागजात) तैयार रखें।',
            ]
          : [
              'Stay away from steep slopes, river banks, and waterlogged embankments.',
              'Avoid all non-essential road travel along hill passes and ghat sections.',
              'If you observe tension cracks in ground or tilting trees, evacuate immediately.',
              'Keep an emergency grab-bag ready (Torch, medicines, drinking water, ID cards).',
            ])
      : (this.isHi
          ? [
              'मौसम विभाग के बारिश पूर्वानुमान और जिला परामर्शों पर नजर रखें।',
              'सड़क किनारे नालियों और जल निकासी के रास्तों को साफ रखें।',
              'पहाड़ी रास्तों पर वाहन चलाते समय गति धीमी रखें।',
            ]
          : [
              'Keep track of local weather forecasts and official administrative advisories.',
              'Ensure household drainage channels are clear of debris and silt.',
              'Drive cautiously on hill roads during rainfall showers.',
            ]);

    this.container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif; color: #f8fafc;">
        <!-- Status Hero Card -->
        <div style="background: ${statusBg}22; border: 2px solid ${statusBg}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 14px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 1px;">
            ${this.isHi ? 'नागरिक सुरक्षा पोर्टल (पूर्वोत्‍तर क्षेत्र)' : 'CITIZEN SAFETY PORTAL (NER INDIA)'}
          </div>
          <div style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 8px 0;">
            ${districtName}, ${district.state}
          </div>
          <div style="display: inline-block; padding: 8px 20px; border-radius: 20px; background: ${statusBg}; color: #ffffff; font-weight: 800; font-size: 16px; margin-bottom: 12px;">
            ${statusTitle}
          </div>
          <div style="font-size: 14px; color: #e2e8f0; max-width: 600px; margin: 0 auto; line-height: 1.5;">
            ${this.isHi ? risk.advisoryHi : risk.advisoryEn}
          </div>
        </div>

        <!-- Quick Weather & Risk Indicators -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">${this.isHi ? '24 घंटे की बारिश' : '24h Rainfall'}</div>
            <div style="font-size: 22px; font-weight: bold; color: #38bdf8; margin-top: 4px;">${weather.rainfall24hMm} mm</div>
            <div style="font-size: 11px; color: #64748b;">${weather.weatherCondition}</div>
          </div>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">${this.isHi ? 'जोखिम स्कोर' : 'Risk Score'}</div>
            <div style="font-size: 22px; font-weight: bold; color: ${statusBg}; margin-top: 4px;">${risk.compositeScore}/100</div>
            <div style="font-size: 11px; color: #64748b;">${risk.level}</div>
          </div>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">${this.isHi ? 'आपातकालीन संपर्क' : 'Local Helpline'}</div>
            <div style="font-size: 18px; font-weight: bold; color: #22c55e; margin-top: 6px;">${district.deocContact}</div>
            <div style="font-size: 11px; color: #64748b;">DEOC 24/7</div>
          </div>
        </div>

        <!-- Essential Safety Guidelines -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span>
            <span>${this.isHi ? 'आवश्यक नागरिक सुरक्षा निर्देश (क्या करें और क्या न करें)' : 'Essential Citizen Safety Directives (Do’s and Don’ts)'}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${citizenAdvisories
              .map(
                (adv) => `
              <div style="display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                <span style="color: #22c55e; font-weight: bold;">✔</span>
                <span>${adv}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Emergency Speed Dial Grid -->
        <div>
          <div style="font-size: 14px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
            📞 ${this.isHi ? 'राष्ट्रीय एवं राज्य आपातकालीन हेल्पलाइन' : 'National & State Emergency Helplines'}
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <a href="tel:1078" style="text-decoration: none; background: #dc262622; border: 1px solid #dc2626; border-radius: 8px; padding: 12px; text-align: center; color: #fca5a5;">
              <div style="font-size: 11px; font-weight: bold;">NDRF</div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff;">1078</div>
            </a>
            <a href="tel:1070" style="text-decoration: none; background: #ea580c22; border: 1px solid #ea580c; border-radius: 8px; padding: 12px; text-align: center; color: #fdba74;">
              <div style="font-size: 11px; font-weight: bold;">State SDMA</div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff;">1070</div>
            </a>
            <a href="tel:112" style="text-decoration: none; background: #2563eb22; border: 1px solid #2563eb; border-radius: 8px; padding: 12px; text-align: center; color: #93c5fd;">
              <div style="font-size: 11px; font-weight: bold;">Emergency (All)</div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff;">112</div>
            </a>
            <a href="tel:108" style="text-decoration: none; background: #16a34a22; border: 1px solid #16a34a; border-radius: 8px; padding: 12px; text-align: center; color: #86efac;">
              <div style="font-size: 11px; font-weight: bold;">Ambulance</div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff;">108</div>
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
